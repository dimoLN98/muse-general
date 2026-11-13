import path from 'path';
import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { jobQueue } from '../queue/job-queue.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { getOutputDir, saveMetadata } from '../utils/file-manager.js';
import { ensureProjectInContext, registerTaskInProject } from '../navigation/project-navigator.js';
import {
  SEL, routes, openProject, fillPrompt, downloadCurrentMedia, listTiles, openTile, gotoFlow, waitForVisible,
  uploadAsset, openMediaByName, agentPermissionOptions, clickPermissionOption, agentMessageButtons, agentBusy,
  lastAgentReply,
} from '../navigation/flow-ui.js';
import { pickConfirmLabel } from './generate-image.js';
import { get } from '../utils/config.js';

const MAX_PROMPT = 4000;
const COST_NOTE = 'Omni video-to-video is a paid edit and Omni 1.2 bills per second (720p: 3 credits per second, so about 12 for a 4s clip); Omni is the only model that offers it.';

/**
 * Turn an existing (or freshly uploaded) video into a NEW video: Flow's video-to-video edit, where the
 * clip is loaded into the editor and you describe the change in prose.
 *
 * auto_confirm=false (default) only types the edit prompt — nothing is sent and no credits are used.
 * auto_confirm=true sends it, answers Flow's permission card with `Approve` (never "Always approve"),
 * waits for the new version and downloads it.
 *
 * The source clip is one of: source_file (a local clip, uploaded first), source_media_id (an asset
 * already in the project), or — if neither is given — the newest finished clip in the project.
 */
export async function handleEditVideo(args = {}) {
  const raw = args.edit_prompt ?? args.prompt;
  const editPrompt = typeof raw === 'string' ? raw.trim() : '';
  if (!editPrompt) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS,
      'edit_prompt is required — describe the change, e.g. "add gentle rain and make the lantern glow warm orange".');
  }
  if (editPrompt.length > MAX_PROMPT) throw new FlowError(ErrorCodes.INVALID_PARAMS, `edit_prompt is too long (max ${MAX_PROMPT} characters).`);

  const autoConfirm = args.auto_confirm === true;
  const job = jobQueue.createJob('video_edit', {
    edit_prompt: editPrompt, auto_confirm: autoConfirm,
    source_file: args.source_file, source_media_id: args.source_media_id,
    project_name: args.project_name, campaign: args.campaign,
  });

  let page;
  let projectId = null;
  try {
    jobQueue.startJob(job.id);
    page = getPage();
    const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
    projectId = project.flowProjectId;
    await openProject(page, projectId);

    // ---- resolve the source clip ----
    let mediaId = args.source_media_id ? String(args.source_media_id).trim() : null;
    let uploaded = null;
    if (args.source_file) {
      uploaded = await uploadAsset(page, args.source_file);
      if (uploaded.kind !== 'video') {
        throw new FlowError(ErrorCodes.INVALID_PARAMS, `source_file must be a video (mp4/m4v/mov/3gp/avi); got ${path.extname(uploaded.abs)}.`);
      }
      await openProject(page, projectId);
      mediaId = await openMediaByName(page, uploaded);
    } else if (mediaId) {
      await gotoFlow(page, routes.media(projectId, mediaId));
      await page.waitForTimeout(1500);
    } else {
      const tiles = await listTiles(page);
      const clip = tiles.find((t) => t.type === 'video' && !t.pending && t.hasVideo) || tiles.find((t) => t.type === 'video' && !t.pending);
      if (!clip) {
        throw new FlowError(ErrorCodes.INVALID_PARAMS,
          'No finished video in this project to edit — pass source_file (a local clip to upload) or source_media_id.');
      }
      mediaId = await openTile(page, clip.index);
    }

    await waitForVisible(page, SEL.videoEditBox, 30000, 'video edit prompt box');
    const readEditor = () => page.evaluate((sels) => {
      const panel = document.querySelector(sels.panel);
      const text = (panel?.innerText || '').replace(/\s+/g, ' ');
      const pct = /\b(\d{1,3})\s*%/.exec(text);
      return {
        steps: document.querySelectorAll(sels.step).length,
        percent: pct ? Number(pct[1]) : null,
        panel: text.slice(0, 200),
      };
    }, { panel: SEL.editorHistoryPanel, step: SEL.editorHistoryStep }).catch(() => ({ steps: 0, percent: null, panel: '' }));

    const before = await readEditor();
    const typed = await fillPrompt(page, editPrompt, SEL.videoEditBox);
    if (!typed) throw new FlowError(ErrorCodes.UNKNOWN_UI_CHANGE, 'Could not type the edit prompt into the video editor.');

    if (!autoConfirm) {
      const result = {
        status: 'ready_for_confirmation',
        type: 'video_edit',
        message: `Edit prompt typed in Flow's video editor. NOT sent, so no credits were used. Call again with auto_confirm=true to run it. ${COST_NOTE}`,
        edit_prompt: editPrompt,
        source: { media_id: mediaId, uploaded: uploaded ? uploaded.name : null },
        history_steps_before: before.steps,
        cost_estimate: 'about 12 credits (Omni 1.2 video-to-video, 4s at 720p; 3 per second)',
        project_url: routes.project(projectId),
        media_url: routes.media(projectId, mediaId),
        screenshot: await takeScreenshot(page, 'video-edit-ready-for-confirmation'),
        account: get('expectedAccount'),
        jobId: job.id,
      };
      saveMetadata(job.id, { ...result, status: 'ready_for_confirmation' });
      jobQueue.completeJob(job.id, result);
      return result;
    }

    // ---- run it (this spends credits) ----
    const send = page.locator(SEL.startGeneration).first();
    if (!(await send.isVisible().catch(() => false)) || (await send.isDisabled().catch(() => true))) {
      throw new FlowError(ErrorCodes.GENERATION_BUTTON_DISABLED, 'The video editor\'s "Start generation" button is missing or disabled.');
    }
    logger.info('auto_confirm=true: running the video-to-video edit', { mediaId });
    await send.click();

    const timeoutMs = get('videoGenerationTimeoutMs', 900000);
    const started = Date.now();
    let confirmClicked = null;
    let finished = false;
    let state = before;
    while (Date.now() - started < timeoutMs) {
      await page.waitForTimeout(4000);
      state = await readEditor();
      const busy = await agentBusy(page).catch(() => false);
      const perms = (await agentPermissionOptions(page)).filter((o) => !o.frozen && o.visible);
      const offered = perms.length ? perms.map((o) => o.label) : await agentMessageButtons(page);
      const confirmLabel = pickConfirmLabel(offered);
      if (!confirmLabel && offered.some((label) => /always/i.test(label))) {
        logger.warn('Refusing to click "Always approve" on the video permission card');
      }
      if (confirmLabel && !confirmClicked) {
        if (perms.some((o) => o.label === confirmLabel)) await clickPermissionOption(page, confirmLabel);
        else await page.locator(`${SEL.agentMessage} button`).filter({ hasText: confirmLabel }).last().click();
        confirmClicked = confirmLabel;
        logger.info('Answered the Flow permission card', { confirmLabel });
        continue;
      }
      const advanced = state.steps > before.steps;
      if (advanced && state.percent === null && !busy) { finished = true; break; }
    }

    const outputDir = args.output_folder ? path.resolve(args.output_folder) : getOutputDir('video');
    let saved = null;
    if (finished || state.steps > before.steps) {
      try {
        saved = await downloadCurrentMedia(page, outputDir, `flow_${job.id}_edit`, { quality: 'original' });
      } catch (e) {
        logger.warn('Could not download the edited clip', { error: e.message });
      }
    }

    const result = {
      status: finished && saved ? 'success' : 'still_rendering',
      type: 'video_edit',
      account: get('expectedAccount'),
      edit_prompt: editPrompt,
      source: { media_id: mediaId, uploaded: uploaded ? uploaded.name : null },
      files: saved ? [saved.path] : [],
      media_id: mediaId,
      history_steps_before: before.steps,
      history_steps_after: state.steps,
      agent_confirmation_clicked: confirmClicked,
      agent_reply: await lastAgentReply(page),
      project_url: routes.project(projectId),
      media_url: routes.media(projectId, mediaId),
      credits_may_have_been_consumed: true,
      cost_estimate: 'about 12 credits (Omni 1.2 video-to-video, 4s at 720p; 3 per second)',
      message: finished && saved
        ? 'Edit finished and the new version was downloaded. Flow keeps versions stacked on the same clip.'
        : 'The edit was submitted but had not finished (or the download failed); open the project to check the version stack.',
      jobId: job.id,
    };
    saveMetadata(job.id, { ...result });
    registerTaskInProject(projectId, { type: 'video_edit', prompt: editPrompt, files: result.files, jobId: job.id });
    jobQueue.completeJob(job.id, result);
    return result;
  } catch (err) {
    if (page) await takeScreenshot(page, 'edit-video-error');
    jobQueue.failJob(job.id, err);
    throw err;
  }
}
