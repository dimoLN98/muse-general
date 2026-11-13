import path from 'path';
import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { jobQueue } from '../queue/job-queue.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { getOutputDir, saveMetadata } from '../utils/file-manager.js';
import { ensureProjectInContext, registerTaskInProject } from '../navigation/project-navigator.js';
import {
  SEL, routes, resolveModel, resolveRatio, resolveCount, openProject, startNewSession, fillPrompt,
  applyAgentSettings, readAgentSettings, attachReferenceImages, listTiles, openTile, downloadCurrentMedia,
  lastAgentReply, agentBusy, agentMessageButtons, agentPermissionOptions, clickPermissionOption,
  gotoFlow, waitForVisible,
} from '../navigation/flow-ui.js';
import { pickConfirmLabel } from './generate-image.js';
import { get } from '../utils/config.js';
import {
  resolveVideoDuration, estimateVideoCredits, DEFAULT_VIDEO_MODEL, DEFAULT_RESOLUTION, VIDEO_MODELS,
} from '../utils/video-models.js';

const MAX_PROMPT = 4000;
const SHORTCUTS = {
  quality: 'Veo 3.1 - Quality', premium: 'Veo 3.1 - Quality', fast: 'Veo 3.1 - Fast', speed: 'Veo 3.1 - Fast',
  lite: 'Veo 3.1 - Lite', test: 'Veo 3.1 - Lite',
  flash: 'Omni 1.2 Flash', omni: 'Omni 1.2 Flash', simple: 'Omni 1.2 Flash',
  cheap: 'Omni 1.2 Flash', default: 'Omni 1.2 Flash',
  legacy: 'Omni 1.1 Flash', 'omni-1.1': 'Omni 1.1 Flash',
};

function selectVideoModel(requested) {
  const key = String(requested ?? '').trim().toLowerCase();
  if (!key || key === 'auto') return resolveModel('video', get('videoDefaultModel', DEFAULT_VIDEO_MODEL));
  return SHORTCUTS[key] || resolveModel('video', requested);
}

/**
 * Flow exposes no duration control in the agent panel, so length travels in the prompt text.
 * Omni 1.2 honours any whole second from 3-15; Veo and the retiring Omni 1.1 only fixed values.
 */
function durationFor(model, seconds) {
  return resolveVideoDuration(model, seconds);
}

/**
 * Generate video with the Flow agent.
 *
 * auto_confirm=false (default) stages only: it types the prompt in a fresh agent session and reports
 * the settings it WOULD apply — nothing is sent, no credits are used, Agent settings are untouched.
 * auto_confirm=true applies model/ratio/quantity, attaches reference assets, sends the prompt, answers
 * Flow's permission card with `Approve` (never "Always approve"), waits for the clip, downloads it and
 * restores the previous Agent settings.
 *
 * Cost guard: the default model is Omni 1.2 Flash (720p, 3 credits per second — 12 for a 4s clip,
 * 60 for the full 15s). The premium tiers in config.expensiveVideoModels (Veo 3.1 - Quality, 100
 * credits) are refused unless allow_expensive=true.
 */
export async function handleGenerateVideo(args = {}) {
  const basePrompt = typeof args.prompt === 'string' ? args.prompt.trim() : '';
  if (!basePrompt) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is required.');
  if (basePrompt.length > MAX_PROMPT) throw new FlowError(ErrorCodes.INVALID_PARAMS, `prompt is too long (max ${MAX_PROMPT} characters).`);

  const model = selectVideoModel(args.model);
  if (!model) {
    const available = Object.keys(get('videoModels', {}));
    throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Video model "${args.model}" not available. Available: ${available.join(', ')}`, { requested: args.model, available });
  }
  const expensive = get('expensiveVideoModels', ['Veo 3.1 - Quality']);
  if (expensive.includes(model) && args.allow_expensive !== true) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS,
      `${model} is the premium tier (about 100 credits per clip) and is refused by default. Use Omni 1.2 Flash (720p, 3 credits per second), Veo 3.1 - Lite (10 per clip) or Veo 3.1 - Fast (20), or pass allow_expensive=true if you really mean it.`,
      { requested: model, cheaper: ['Omni 1.2 Flash', 'Veo 3.1 - Lite', 'Veo 3.1 - Fast'] });
  }
  const ratio = resolveRatio('video', args.ratio, '16:9');
  if (!ratio) throw new FlowError(ErrorCodes.RATIO_NOT_AVAILABLE, `Ratio "${args.ratio}" not available for video. Available: ${get('videoRatios', []).join(', ')}`);
  const count = resolveCount(args.quantity ?? args.count, 1);
  if (!count) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'quantity must be an integer from 1 to 4.');
  let duration = null;
  if (args.duration !== undefined) {
    const resolved = durationFor(model, args.duration);
    if (resolved.error) throw new FlowError(ErrorCodes.INVALID_PARAMS, resolved.error, { model, ...VIDEO_MODELS[model]?.durations });
    duration = resolved.duration;
  }
  // Flow has no reachable duration control in the agent panel, so the length goes into the prompt text.
  const prompt = duration ? `${basePrompt}\n\nVideo length: ${duration} seconds.` : basePrompt;
  const estimatedCredits = estimateVideoCredits({ model, duration, quantity: count, resolution: DEFAULT_RESOLUTION });

  const autoConfirm = args.auto_confirm === true;
  const job = jobQueue.createJob('video_generation', {
    prompt, model, ratio, count, duration, auto_confirm: autoConfirm,
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

    const wanted = { video: { ratio, count, model } };
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

    let attached = [];
    if (Array.isArray(args.reference_images) && args.reference_images.length) {
      attached = await attachReferenceImages(page, args.reference_images);
    }
    const typed = await fillPrompt(page, prompt);
    if (!typed) throw new FlowError(ErrorCodes.UNKNOWN_UI_CHANGE, 'Could not type into the Flow prompt box.');

    if (!autoConfirm) {
      const mismatch = settingsNow.video.model.toLowerCase() !== model.toLowerCase()
        || settingsNow.video.ratio !== ratio || settingsNow.video.count !== count;
      const result = {
        status: 'ready_for_confirmation',
        type: 'video',
        message: 'Prompt typed in a fresh Flow agent session. NOT sent (video generation is paid) and your Agent settings were not changed.',
        prompt,
        requested: { model, ratio, quantity: count, duration_seconds: duration, resolution: DEFAULT_RESOLUTION },
        credits_estimate: estimatedCredits,
        agent_confirmation_setting: settingsNow.confirmBeforeGenerating,
        agent_video_defaults_now: settingsNow.video,
        agent_settings_will_apply: wanted.video,
        agent_settings_match_request: !mismatch,
        reference_assets_attached: attached,
        next_step: mismatch
          ? 'Call again with auto_confirm=true to apply the settings and generate, or set them by hand in Agent settings.'
          : 'Agent settings already match; call again with auto_confirm=true to generate.',
        project_url: routes.project(projectId),
        screenshot: await takeScreenshot(page, 'video-ready-for-confirmation'),
        account: get('expectedAccount'),
        jobId: job.id,
      };
      saveMetadata(job.id, { ...result, status: 'ready_for_confirmation' });
      jobQueue.completeJob(job.id, result);
      return result;
    }

    // ---- send it (this spends credits) ----
    const before = await listTiles(page);
    await takeScreenshot(page, 'pre-generate-video-verification');
    const sendButton = page.locator(SEL.startGeneration).first();
    if (!(await sendButton.isVisible().catch(() => false)) || (await sendButton.isDisabled().catch(() => true))) {
      throw new FlowError(ErrorCodes.GENERATION_BUTTON_DISABLED, 'The "Start generation" button is missing or disabled.');
    }
    logger.info('auto_confirm=true: sending video prompt to the Flow agent', { model, duration });
    await sendButton.click();

    const timeoutMs = get('videoGenerationTimeoutMs', 900000);
    const started = Date.now();
    let idle = 0;
    let confirmClicked = null;
    let finished = false;
    let stillRendering = false;
    while (Date.now() - started < timeoutMs) {
      await page.waitForTimeout(3000);
      const busy = await agentBusy(page);
      const tiles = await listTiles(page);
      const freshVideos = tiles.slice(0, Math.max(0, tiles.length - before.length)).filter((t) => t.type === 'video');
      const pending = freshVideos.some((t) => t.pending);
      // Flow keeps its "stop" button visible while it waits for the permission card. Checking `busy`
      // first deadlocked every call (12 Nov 2026: card shown at +22 s, never answered, Flow cancelled it
      // with "no credits were spent"). A live, unanswered card is answered before the busy check.
      if (!confirmClicked) {
        const waiting = (await agentPermissionOptions(page)).filter((o) => !o.frozen && o.visible);
        const waitingLabel = pickConfirmLabel(waiting.map((o) => o.label));
        if (waitingLabel && waiting.some((o) => o.label === waitingLabel)) {
          await clickPermissionOption(page, waitingLabel);
          confirmClicked = waitingLabel;
          logger.info('Answered the Flow permission card while the agent still showed stop', { confirmLabel: waitingLabel });
          idle = 0;
          continue;
        }
      }
      if (busy || pending) { idle = 0; continue; }
      // Flow's permission card ("…costing 7 credits?") is div[role=radio], not a button: read it properly.
      const perms = (await agentPermissionOptions(page)).filter((o) => !o.frozen && o.visible);
      const offered = perms.length ? perms.map((o) => o.label) : await agentMessageButtons(page);
      const confirmLabel = pickConfirmLabel(offered);
      if (!confirmLabel && offered.some((label) => /always/i.test(label))) {
        logger.warn('Refusing to click "Always approve" on the video permission card — it would set "Confirm before generating" to Never');
      }
      if (confirmLabel && !confirmClicked) {
        if (perms.some((o) => o.label === confirmLabel)) await clickPermissionOption(page, confirmLabel);
        else await page.locator(`${SEL.agentMessage} button`).filter({ hasText: confirmLabel }).last().click();
        confirmClicked = confirmLabel;
        logger.info('Answered the Flow permission card', { confirmLabel });
        idle = 0;
        continue;
      }
      idle += 1;
      const readyVideos = freshVideos.filter((t) => !t.pending);
      if (readyVideos.length > 0 && idle >= 2) { finished = true; break; }
      if (idle >= 6 && freshVideos.length > 0) { stillRendering = true; break; }
      if (idle >= 6 && freshVideos.length === 0) break;
    }

    const after = await listTiles(page);
    const reply = await lastAgentReply(page);
    const freshVideos = after.slice(0, Math.max(0, after.length - before.length)).filter((t) => t.type === 'video');
    const ready = freshVideos.filter((t) => !t.pending);
    if (!finished && !stillRendering && ready.length === 0) {
      const result = {
        status: 'no_media_generated',
        type: 'video',
        message: 'The Flow agent answered but produced no finished video. See agent_reply.',
        agent_reply: reply,
        agent_asked_for: await agentMessageButtons(page),
        project_url: routes.project(projectId),
        screenshot: await takeScreenshot(page, 'no-video-generated'),
        jobId: job.id,
      };
      jobQueue.completeJob(job.id, result);
      return result;
    }

    // ---- download each finished clip through Flow's own Download menu ----
    const outputDir = args.output_folder ? path.resolve(args.output_folder) : getOutputDir('video');
    const files = [];
    const mediaIds = [];
    const targets = ready.slice(0, count);
    for (let i = 0; i < targets.length; i += 1) {
      await gotoFlow(page, routes.project(projectId));
      await waitForVisible(page, SEL.tile, 20000, 'project media grid');
      const mediaId = await openTile(page, targets[i].index);
      if (mediaIds.includes(mediaId)) continue;
      const saved = await downloadCurrentMedia(page, outputDir, `flow_${job.id}_${i + 1}`, { quality: 'original' });
      files.push(saved.path);
      mediaIds.push(mediaId);
    }
    await gotoFlow(page, routes.project(projectId));

    saveMetadata(job.id, { type: 'video', model, ratio, quantity: count, duration, auto_confirm: true, prompt, files, mediaIds, projectId, jobId: job.id });
    registerTaskInProject(projectId, { type: 'video', prompt, files, jobId: job.id });

    const result = {
      status: finished && files.length ? 'success' : 'still_rendering',
      type: 'video',
      account: get('expectedAccount'),
      model_used: model,
      ratio,
      quantity_requested: count,
      duration_seconds: duration,
      resolution: DEFAULT_RESOLUTION,
      credits_estimate: estimatedCredits,
      prompt,
      files,
      video_count: files.length,
      media_ids: mediaIds,
      agent_reply: reply,
      agent_confirmation_clicked: confirmClicked,
      agent_video_defaults_now: (await readAgentSettings(page).catch(() => settingsNow)).video ?? settingsNow.video,
      reference_assets_attached: attached,
      project_url: routes.project(projectId),
      credits_may_have_been_consumed: true,
      message: finished && files.length
        ? 'Video generated and downloaded.'
        : 'Flow is still rendering the clip (video has its own queue). Check the project, or call flow_download_latest once it finishes.',
      jobId: job.id,
    };
    jobQueue.completeJob(job.id, result);
    return result;
  } catch (err) {
    if (page) await takeScreenshot(page, 'generate-video-error');
    jobQueue.failJob(job.id, err);
    throw err;
  } finally {
    if (autoConfirm && settingsChanged && previousSettings?.video && page && projectId) {
      try {
        await gotoFlow(page, routes.project(projectId));
        await waitForVisible(page, SEL.promptBox, 20000, 'project prompt box');
        await applyAgentSettings(page, { video: previousSettings.video });
      } catch (e) {
        logger.warn('Could not restore previous Agent video settings', { error: e.message });
      }
    }
  }
}
