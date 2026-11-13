import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { jobQueue } from '../queue/job-queue.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { getOutputDir, saveMetadata } from '../utils/file-manager.js';
import { ensureProjectInContext, registerTaskInProject } from '../navigation/project-navigator.js';
import {
  SEL, routes, resolveModel, resolveRatio, resolveCount, openProject, startNewSession, fillPrompt, readAgentSettings,
  applyAgentSettings, agentBusy, lastAgentReply, agentMessageButtons, agentPermissionOptions,
  clickPermissionOption, listTiles, openTile, downloadCurrentMedia,
  gotoFlow, attachReferenceImages, agentOptionCount, openAgentOption, waitForVisible,
} from '../navigation/flow-ui.js';
import { get } from '../utils/config.js';
import path from 'path';

const MAX_PROMPT = 4000;
// Image generation must never turn into a (paid) video generation by accident.
const VIDEO_WORDS = /\b(videos?|animate[ds]?|animation|footage)\b/i;
// Buttons an agent confirmation prompt might offer. Only ever clicked when auto_confirm=true.
// Flow renders these with the material icon text included ("check Approve"), so match on words
// rather than the start of the label.
const CONFIRM_RE = /\b(approve|accept|confirm|generate|continue|proceed|go ahead|yes|ok|okay)\b/i;
// "Always approve" is never a legitimate automated click: it rewrites the account's
// "Confirm before generating" setting to "Never", i.e. it removes the user's spend guard globally.
const NEVER_CLICK_RE = /always|reject|cancel|^\s*no\b/i;

/**
 * Choose the confirmation button an automated run may click, or null.
 * Exported so the refusal to touch "Always approve" is locked down by tests.
 */
export function pickConfirmLabel(labels = []) {
  return labels.find((label) => CONFIRM_RE.test(label) && !NEVER_CLICK_RE.test(label)) || null;
}

export async function handleGenerateImage(args = {}) {
  const prompt = typeof args.prompt === 'string' ? args.prompt.trim() : '';
  if (!prompt) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is required.');
  if (prompt.length > MAX_PROMPT) throw new FlowError(ErrorCodes.INVALID_PARAMS, `prompt is too long (max ${MAX_PROMPT} characters).`);
  if (VIDEO_WORDS.test(prompt)) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS,
      'BLOCKED: the prompt asks for video/animation. Use flow_generate_video; image generation is refused to avoid an accidental video generation.');
  }

  const model = resolveModel('image', args.model);
  if (!model) {
    const available = Object.keys(get('imageModels', {}));
    throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Image model "${args.model}" not available. Available: ${available.join(', ')}`,
      { requested: args.model, available });
  }
  const ratio = resolveRatio('image', args.ratio, '1:1');
  if (!ratio) throw new FlowError(ErrorCodes.RATIO_NOT_AVAILABLE, `Ratio "${args.ratio}" not available. Available: ${get('ratios', []).join(', ')}`);
  const count = resolveCount(args.quantity ?? args.count, 1);
  if (!count) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'quantity must be an integer from 1 to 4.');

  const autoConfirm = args.auto_confirm === true;
  const job = jobQueue.createJob('image_generation', {
    prompt, model, ratio, count, auto_confirm: autoConfirm,
    project_name: args.project_name, campaign: args.campaign,
  });

  let page;
  let projectId = null;
  let previousSettings = null;
  let settingsChanged = false;
  try {
    jobQueue.startJob(job.id);
    page = getPage();

    const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
    projectId = project.flowProjectId;
    await openProject(page, projectId);
    await startNewSession(page);

    // Flow's agent generates with the "Agent settings" defaults. Those are persistent account settings,
    // so they are only changed for a real generation (and restored afterwards). A staged call just reports them.
    const wanted = { image: { ratio, count, model } };
    let settingsNow;
    if (autoConfirm) {
      const applied = await applyAgentSettings(page, wanted);
      previousSettings = applied.before;
      settingsChanged = applied.changed;
      settingsNow = applied.after;
    } else {
      settingsNow = await readAgentSettings(page);
      previousSettings = settingsNow;
    }
    if (settingsNow.confirmBeforeGenerating === 'never') {
      logger.warn('Flow agent is set to generate WITHOUT asking for confirmation');
    }

    if (Array.isArray(args.reference_images) && args.reference_images.length) {
      await attachReferenceImages(page, args.reference_images);
    }
    const typed = await fillPrompt(page, prompt);
    if (!typed) throw new FlowError(ErrorCodes.UNKNOWN_UI_CHANGE, 'Could not type into the Flow prompt box.');

    if (!autoConfirm) {
      const shot = await takeScreenshot(page, 'image-ready-for-confirmation');
      const result = {
        status: 'ready_for_confirmation',
        type: 'image',
        message: 'Prompt typed. Nothing was sent and your Agent settings were not changed, so no credits were used. Call again with auto_confirm=true to apply model/ratio/quantity and generate.',
        model_used: model,
        ratio,
        quantity: count,
        prompt,
        project_url: routes.project(projectId),
        agent_confirmation_setting: settingsNow.confirmBeforeGenerating,
        agent_settings_current: settingsNow.image,
        agent_settings_will_apply: wanted.image,
        screenshot: shot,
        account: get('expectedAccount'),
        jobId: job.id,
      };
      jobQueue.completeJob(job.id, result);
      return result;
    }

    // ---- send to the agent (this may consume credits) ----
    const before = await listTiles(page);
    await takeScreenshot(page, 'pre-generate-verification');
    const sendButton = page.locator(SEL.startGeneration).first();
    if (!(await sendButton.isVisible().catch(() => false)) || (await sendButton.isDisabled().catch(() => true))) {
      throw new FlowError(ErrorCodes.GENERATION_BUTTON_DISABLED, 'The "Start generation" button is missing or disabled.');
    }
    logger.info('auto_confirm=true: sending prompt to the Flow agent');
    await sendButton.click();

    const timeoutMs = get('generationTimeoutMs', 180000);
    const started = Date.now();
    let idle = 0;
    let confirmClicked = null;
    let finished = false;
    while (Date.now() - started < timeoutMs) {
      await page.waitForTimeout(2000);
      const busy = await agentBusy(page);
      const tiles = await listTiles(page);
      const pending = tiles.some((tile) => tile.pending);
      if (busy || pending) { idle = 0; continue; }
      // Flow's permission card is `flow-permission-message` with div[role=radio] options, which a
      // button sweep misses entirely; plain-button confirmations still exist elsewhere in the agent UI.
      const perms = (await agentPermissionOptions(page)).filter((opt) => !opt.frozen && opt.visible);
      const offered = perms.length ? perms.map((opt) => opt.label) : await agentMessageButtons(page);
      const confirmLabel = pickConfirmLabel(offered);
      if (!confirmLabel && offered.some((label) => NEVER_CLICK_RE.test(label))) {
        logger.warn('Refusing to click "Always approve" — it would set "Confirm before generating" to Never and spend credits unattended');
      }
      if (confirmLabel && !confirmClicked) {
        if (perms.some((opt) => opt.label === confirmLabel)) await clickPermissionOption(page, confirmLabel);
        else await page.locator(`${SEL.agentMessage} button`).filter({ hasText: confirmLabel }).last().click();
        confirmClicked = confirmLabel;
        logger.info('Clicked agent confirmation', { confirmLabel, card: perms.length ? 'permission' : 'button' });
        idle = 0;
        continue;
      }
      idle += 1;
      const fresh = tiles.length - before.length;
      const options = await agentOptionCount(page);
      if (((fresh > 0 || options > 0) && idle >= 2) || idle >= 5) { finished = true; break; }
    }
    if (!finished) {
      await takeScreenshot(page, 'generation-timeout');
      throw new FlowError(ErrorCodes.GENERATION_TIMEOUT, `Generation did not finish within ${Math.round(timeoutMs / 1000)}s. Check the project in Flow.`);
    }

    const after = await listTiles(page);
    const reply = await lastAgentReply(page);
    // The agent's own result thumbnails ("Option N") are authoritative: they also cover edits, which
    // create a new version of an existing asset instead of a new grid tile. Fall back to new tiles.
    const optionTotal = await agentOptionCount(page);
    const freshImages = after.slice(0, Math.max(0, after.length - before.length)).filter((tile) => tile.type === 'image');
    const targets = optionTotal > 0
      ? Array.from({ length: optionTotal }, (_, i) => ({ via: 'option', index: i }))
      : freshImages.map((tile) => ({ via: 'tile', index: tile.index }));
    if (targets.length === 0) {
      const shot = await takeScreenshot(page, 'no-images-generated');
      const result = {
        status: 'no_media_generated',
        type: 'image',
        message: 'The Flow agent answered but produced no image. See agent_reply.',
        agent_reply: reply,
        agent_asked_for: await agentMessageButtons(page),
        project_url: routes.project(projectId),
        screenshot: shot,
        jobId: job.id,
      };
      jobQueue.completeJob(job.id, result);
      return result;
    }

    // ---- download each result through Flow's own download menu ----
    const outputDir = args.output_folder ? path.resolve(args.output_folder) : getOutputDir('image');
    const files = [];
    const mediaIds = [];
    for (let i = 0; i < targets.length; i += 1) {
      await gotoFlow(page, routes.project(projectId));
      await waitForVisible(page, SEL.tile, 20000, 'project media grid');
      const mediaId = targets[i].via === 'option'
        ? await openAgentOption(page, targets[i].index)
        : await openTile(page, targets[i].index);
      if (mediaIds.includes(mediaId)) continue;
      const saved = await downloadCurrentMedia(page, outputDir, `flow_${job.id}_${i + 1}`, { quality: 'original' });
      files.push(saved.path);
      mediaIds.push(mediaId);
    }
    await gotoFlow(page, routes.project(projectId));

    saveMetadata(job.id, { type: 'image', model, ratio, quantity: count, auto_confirm: true, prompt, files, mediaIds, projectId, jobId: job.id });
    registerTaskInProject(projectId, { type: 'image', prompt, files, jobId: job.id });

    const result = {
      status: 'success',
      type: 'image',
      account: get('expectedAccount'),
      model_used: model,
      ratio,
      quantity_requested: count,
      prompt,
      files,
      image_count: files.length,
      media_ids: mediaIds,
      agent_reply: reply,
      agent_confirmation_clicked: confirmClicked,
      project_url: routes.project(projectId),
      credits_may_have_been_consumed: true,
      jobId: job.id,
    };
    jobQueue.completeJob(job.id, result);
    return result;
  } catch (err) {
    if (page) await takeScreenshot(page, 'generate-image-error');
    jobQueue.failJob(job.id, err);
    throw err;
  } finally {
    // Put the user's own agent defaults back after a real generation (best effort).
    if (autoConfirm && settingsChanged && previousSettings && page && projectId) {
      try {
        await gotoFlow(page, routes.project(projectId));
        await waitForVisible(page, SEL.promptBox, 20000, 'project prompt box');
        await applyAgentSettings(page, { image: previousSettings.image });
      } catch (e) {
        logger.warn('Could not restore previous Agent settings', { error: e.message });
      }
    }
  }
}
