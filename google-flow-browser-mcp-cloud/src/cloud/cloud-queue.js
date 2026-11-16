// Cloud edition: the disk task queue between the MCP server and the agent.
//
// The cloud browser exposes no CDP endpoint, so this server cannot drive it.
// Instead, browser tools ENQUEUE a task (a JSON file under state/cloud-queue/)
// with a self-contained `assignment`: exact steps for the agent to run in the
// already-signed-in cloud browser with browser.browse. The agent then calls
// flow_cloud_complete with the result, and flow_cloud_result reads it back.
//
// Nothing here spends credits or touches a browser. auto_confirm=false tasks
// are PREPARE-only by construction: their assignments say "type, do not send".
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import config, { get, getFlowHome } from '../utils/config.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { resolveModel, resolveRatio, resolveCount } from '../navigation/flow-ui.js';
import {
  resolveVideoDuration, estimateVideoCredits, estimateEditCredits,
  DEFAULT_VIDEO_MODEL, DEFAULT_RESOLUTION,
} from '../utils/video-models.js';
import { buildMusicPrompt } from '../tools/flow-music.js';
import { activeAccount, configuredAccounts } from '../accounts/cloud-accounts.js';

const queueDir = () => path.join(getFlowHome(), 'state', 'cloud-queue');
const taskPath = (id) => path.join(queueDir(), `${id}.json`);
const VIDEO_WORDS = /\b(videos?|animate[ds]?|animation|footage)\b/i;
const VIDEO_SHORTCUTS = {
  quality: 'Veo 3.1 - Quality', premium: 'Veo 3.1 - Quality', fast: 'Veo 3.1 - Fast', speed: 'Veo 3.1 - Fast',
  lite: 'Veo 3.1 - Lite', test: 'Veo 3.1 - Lite',
  flash: 'Omni 1.2 Flash', omni: 'Omni 1.2 Flash', simple: 'Omni 1.2 Flash',
  cheap: 'Omni 1.2 Flash', default: 'Omni 1.2 Flash',
  legacy: 'Omni 1.1 Flash', 'omni-1.1': 'Omni 1.1 Flash',
};

export function newTaskId() {
  return `cloud-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`;
}

export function enqueueCloudTask(tool, args = {}, opts = {}) {
  fs.mkdirSync(queueDir(), { recursive: true });
  const id = newTaskId();
  const task = {
    id, tool, args,
    status: 'queued',
    created_at: new Date().toISOString(),
    completed_at: null,
    needs_approval: !!opts.needs_approval,
    spend_estimate_credits: opts.spend_estimate_credits ?? null,
    spend_note: opts.spend_note || null,
    assignment: opts.assignment || '',
    result: null,
    error: null,
  };
  fs.writeFileSync(taskPath(id), JSON.stringify(task, null, 2));
  return task;
}

export function getCloudTask(taskId) {
  try { return JSON.parse(fs.readFileSync(taskPath(String(taskId)), 'utf-8')); } catch { return null; }
}

export function completeCloudTask(taskId, result, status = 'done', error = null) {
  const task = getCloudTask(taskId);
  if (!task) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unknown cloud task: ${taskId}`);
  task.status = status === 'failed' ? 'failed' : 'done';
  task.result = result ?? null;
  task.error = error || null;
  task.completed_at = new Date().toISOString();
  fs.writeFileSync(taskPath(taskId), JSON.stringify(task, null, 2));
  return task;
}

export function failCloudTask(taskId, error) {
  return completeCloudTask(taskId, null, 'failed', error instanceof Error ? error.message : String(error));
}

export function listCloudTasks({ status, limit = 50 } = {}) {
  fs.mkdirSync(queueDir(), { recursive: true });
  const files = fs.readdirSync(queueDir()).filter((f) => f.endsWith('.json')).sort().reverse();
  const tasks = files
    .map((f) => { try { return JSON.parse(fs.readFileSync(path.join(queueDir(), f), 'utf-8')); } catch { return null; } })
    .filter(Boolean);
  const filtered = status ? tasks.filter((t) => t.status === status) : tasks;
  return {
    total: tasks.length,
    queued: tasks.filter((t) => t.status === 'queued').length,
    done: tasks.filter((t) => t.status === 'done').length,
    failed: tasks.filter((t) => t.status === 'failed').length,
    tasks: filtered.slice(0, limit),
  };
}

// ---- spend rules -------------------------------------------------------------------------------

/** Estimated Flow credits a task would spend, or null when it spends nothing. */
export function spendEstimateFor(tool, args = {}) {
  switch (tool) {
    case 'flow_generate_video': {
      if (args.auto_confirm !== true) return null;
      const model = selectVideoModel(args.model);
      const dur = args.duration !== undefined ? resolveVideoDuration(model, args.duration) : { duration: 4 };
      return { credits: estimateVideoCredits({ model, duration: dur.duration ?? 4, quantity: args.quantity ?? args.count ?? 1, resolution: DEFAULT_RESOLUTION }), note: `${model}, ${dur.duration ?? 4}s, x${args.quantity ?? args.count ?? 1}` };
    }
    case 'flow_generate_batch': {
      if (args.auto_confirm !== true || !Array.isArray(args.clips) || !args.clips.length) return null;
      let total = 0;
      for (const clip of args.clips) {
        const model = selectVideoModel(clip.model);
        const dur = clip.duration !== undefined ? resolveVideoDuration(model, clip.duration) : { duration: 4 };
        total += estimateVideoCredits({ model, duration: dur.duration ?? 4, quantity: 1, resolution: DEFAULT_RESOLUTION });
      }
      return { credits: total, note: `batch of ${args.clips.length} clips, ~${total} credits total` };
    }
    case 'flow_generate_image':
      return args.auto_confirm === true ? { credits: null, note: 'image generation (Nano Banana) — cost shown on Flow\'s permission card before it runs' } : null;
    case 'flow_edit_video':
      return args.auto_confirm === true ? { credits: estimateEditCredits({ duration: 4 }), note: 'Omni 1.2 video-to-video, 3 credits/sec at 720p (~12 for a 4s clip)' } : null;
    case 'flow_music_generate':
      return { credits: args.via === 'chat' ? 10 : 5, note: args.via === 'chat' ? 'Producer chat: 10 credits for 2 takes' : 'Compose panel: ~5 credits per take' };
    case 'flow_create_character':
    case 'flow_import_character':
      return args.auto_confirm === true ? { credits: null, note: 'character generation (image model) — cost shown on Flow\'s permission card' } : null;
    case 'flow_download_latest':
      return args.quality && String(args.quality).toLowerCase() !== 'original'
        ? { credits: null, note: `upscale to ${args.quality} may cost credits` } : null;
    default:
      return null;
  }
}

/** True when the task must not be executed until Muse has approved the spend. */
export function needsApprovalFor(tool, args = {}) {
  return spendEstimateFor(tool, args) !== null;
}

function selectVideoModel(requested) {
  const key = String(requested ?? '').trim().toLowerCase();
  if (!key || key === 'auto') return resolveModel('video', get('videoDefaultModel', DEFAULT_VIDEO_MODEL));
  return VIDEO_SHORTCUTS[key] || resolveModel('video', requested);
}

// ---- argument validation (fails fast, before anything is queued) --------------------------------

function validateVideoArgs(args) {
  const basePrompt = typeof args.prompt === 'string' ? args.prompt.trim() : '';
  if (!basePrompt) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is required.');
  if (basePrompt.length > 4000) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is too long (max 4000 characters).');
  const model = selectVideoModel(args.model);
  if (!model) {
    throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Video model "${args.model}" not available. Available: ${Object.keys(get('videoModels', {})).join(', ')}`);
  }
  const expensive = get('expensiveVideoModels', ['Veo 3.1 - Quality']);
  if (expensive.includes(model) && args.allow_expensive !== true) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS,
      `${model} is the premium tier (about 100 credits per clip) and is refused by default. Use Omni 1.2 Flash (720p, 3 credits per second), Veo 3.1 - Lite (10 per clip) or Veo 3.1 - Fast (20), or pass allow_expensive=true if you really mean it.`);
  }
  const ratio = resolveRatio('video', args.ratio, '16:9');
  if (!ratio) throw new FlowError(ErrorCodes.RATIO_NOT_AVAILABLE, `Ratio "${args.ratio}" not available for video. Available: ${get('videoRatios', []).join(', ')}`);
  const count = resolveCount(args.quantity ?? args.count, 1);
  if (!count) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'quantity must be an integer from 1 to 4.');
  let duration = null;
  if (args.duration !== undefined) {
    const resolved = resolveVideoDuration(model, args.duration);
    if (resolved.error) throw new FlowError(ErrorCodes.INVALID_PARAMS, resolved.error, { model });
    duration = resolved.duration;
  }
  const prompt = duration ? `${basePrompt}\n\nVideo length: ${duration} seconds.` : basePrompt;
  return { basePrompt, prompt, model, ratio, count, duration };
}

function validateImageArgs(args) {
  const prompt = typeof args.prompt === 'string' ? args.prompt.trim() : '';
  if (!prompt) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is required.');
  if (prompt.length > 4000) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is too long (max 4000 characters).');
  if (VIDEO_WORDS.test(prompt)) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS,
      'BLOCKED: the prompt asks for video/animation. Use flow_generate_video; image generation is refused to avoid an accidental video generation.');
  }
  const model = resolveModel('image', args.model);
  if (!model) throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Image model "${args.model}" not available. Available: ${Object.keys(get('imageModels', {})).join(', ')}`);
  const ratio = resolveRatio('image', args.ratio, '1:1');
  if (!ratio) throw new FlowError(ErrorCodes.RATIO_NOT_AVAILABLE, `Ratio "${args.ratio}" not available. Available: ${get('ratios', []).join(', ')}`);
  const count = resolveCount(args.quantity ?? args.count, 1);
  if (!count) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'quantity must be an integer from 1 to 4.');
  return { prompt, model, ratio, count };
}

function validateCharacterArgs(args) {
  const description = typeof args.description === 'string' ? args.description.trim() : '';
  if (!description) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'description is required.');
  if (description.length > 2000) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'description is too long (max 2000).');
  const name = typeof args.name === 'string' && args.name.trim() ? args.name.trim().slice(0, 80) : null;
  const model = args.model ? resolveModel('image', args.model) : null;
  if (args.model && !model) throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Image model "${args.model}" not available.`);
  return { description, name, model };
}

/** Read a character JSON file (flow_import_character) at queue time so the assignment can carry the spec. */
export function readCharacterSpec(filePathArg) {
  const file = filePathArg ? path.resolve(String(filePathArg)) : null;
  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS, `Character file not found: ${file ?? '(file_path missing)'}`);
  }
  if (fs.statSync(file).size > 256 * 1024) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Character file is too large (max 256 KB).');
  let spec;
  try { spec = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch (e) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS, `Character file is not valid JSON: ${e.message}`);
  }
  const description = String(spec.description ?? spec.prompt ?? '').trim();
  if (!description) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Character JSON needs a "description" (or "prompt").');
  const dir = path.dirname(file);
  const rawRefs = spec.reference_images ?? (spec.image_path ? [spec.image_path] : []);
  const references = (Array.isArray(rawRefs) ? rawRefs : [rawRefs]).filter(Boolean).map((p) => path.resolve(dir, String(p)));
  const model = spec.model ? resolveModel('image', spec.model) : null;
  if (spec.model && !model) throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Image model "${spec.model}" not available.`);
  return {
    name: spec.name ? String(spec.name).trim().slice(0, 80) : null,
    description, personality: spec.personality ? String(spec.personality) : null, model, references,
  };
}

export { buildMusicPrompt };

// ---- assignment text builders --------------------------------------------------------------------

const CLOUD_WINDOW = () => get('cloudBrowserWindow', 'browser-task:00000000-0000-0000-0000-000000000000');
const DEFAULT_PROJECT = () => get('cloudProjectUrl', 'https://flow.google.com/project/00000000-0000-0000-0000-000000000000');
const EXPECTED_ACCOUNT = () => get('expectedAccount', 'you@example.com');
// The account the cloud browser is currently on (from state/accounts.json).
// musedraft is the default; flow_switch_account moves it. Falls back to the
// configured default if the state file is missing or unreadable.
const ACTIVE_ACCOUNT = () => {
  try { return activeAccount()?.email || EXPECTED_ACCOUNT(); } catch { return EXPECTED_ACCOUNT(); }
};
const ACTIVE_PROJECT = () => {
  try { return activeAccount()?.project_url || null; } catch { return null; }
};

function header(ctx, label) {
  const lines = [
    `CLOUD FLOW TASK — ${label}`,
    `Cloud browser window: ${CLOUD_WINDOW()} (already signed in; do NOT sign in again, do NOT open a local Chrome).`,
  ];
  if (!ctx.verified) {
    lines.push(`STEP 0 — VERIFY FIRST: The MCP has no verified sign-in record for this session. Before doing anything else, check the account chip in the cloud browser shows ${ACTIVE_ACCOUNT()}. If it shows a different account, a sign-in page, or no account chip at all, STOP and report that (do not proceed).`);
  } else {
    lines.push(`Signed in as ${ctx.account || ACTIVE_ACCOUNT()} (verified ${ctx.verified_at || 'previously'}).`);
  }
  return lines.join('\n');
}

function projectLine(args = {}) {
  const activeProject = ACTIVE_PROJECT();
  const projectRef = activeProject || DEFAULT_PROJECT();
  const projectNote = activeProject
    ? `Project: ${projectRef} ("Acme Test"). If a different project is already open in the cloud browser, reuse that one instead.`
    : `Project: the active account (${ACTIVE_ACCOUNT()}) has NO recorded Flow project yet — each Google account has its own projects, and "Acme Test" (${DEFAULT_PROJECT()}) exists only on you@example.com. Open Flow home (https://flow.google.com/) for this account and report which projects are visible; do NOT create a new project unless this task says so.`;
  if (args.project_name) return `Project: open the project named "${args.project_name}" (if it does not exist, click "New project" on the Flow home page and rename it to that name). Default project if unsure: ${projectRef}`;
  if (args.campaign) return `Project: reuse the project stored for campaign "${args.campaign}"; if none is open, use the default project ${projectRef}.`;
  return projectNote;
}

/**
 * INSUFFICIENT-CREDITS FALLBACK (rotation policy, the user 27 Oct 2026): if Flow
 * reports the active account is out of credits, STOP on this account — do not
 * retry here. Report the failure, and say which account to switch to next.
 * `movable` is false when the generation is tied to this account's project
 * (ingredients or a source media id that only exist here) — then it cannot be
 * retried on another account without re-uploading them there first.
 */
function insufficientCreditsBlock(movable, tiedTo) {
  const lines = [
    'INSUFFICIENT CREDITS — FALLBACK: if Flow refuses this generation for lack of credits ("not enough credits", "run out of credits", "insufficient credits"), STOP on this account and do NOT retry here. Report the task as failed with the exact message Flow showed and the balance shown on the account chip.',
  ];
  if (movable) {
    lines.push('A plain generation like this CAN be retried on the next account with credits: after reporting the failure, call flow_accounts with the estimated cost to see which account can cover it, then flow_switch_account to that account, then re-run this generation there.');
  } else {
    lines.push(`This generation is tied to THIS account's project — ${tiedTo} — so it cannot be retried on another account without re-uploading them there first. Say that in the report; do not switch accounts for this generation.`);
  }
  return lines.join('\n');
}

function reportBlock(fields) {
  return `REPORT BACK — call flow_cloud_complete with this task's id and a result object containing:\n${fields.map((f) => `- ${f}`).join('\n')}`;
}

function spendBlock(estimate) {
  if (!estimate) return 'SPEND: this task spends no credits.';
  const credits = estimate.credits === null ? 'unknown (see note)' : `~${estimate.credits} credits`;
  return `SPEND APPROVAL REQUIRED: this task would spend ${credits}. ${estimate.note}. Do NOT execute it until Muse has approved this spend. If Muse has not approved, report the task as not run (status failed, error "spend not approved") instead of executing it.`;
}

function approveRule() {
  return 'PERMISSION CARD RULE: if Flow shows a permission card ("...costing N credits?"), click ONLY the option whose label is exactly "Approve" (or "Accept" / "Confirm" / "Generate"). NEVER click "Always approve" — it would set "Confirm before generating" to Never and remove the spend guard for the whole account.';
}

function localFilesBlock(files) {
  if (!files || !files.length) return null;
  return `LOCAL FILES — LIMITATION: these paths live on the MCP server VM, NOT in the cloud browser, so the cloud browser's file chooser cannot pick them: ${files.join(', ')}. If a step needs one of these files, report the task as blocked on file transfer (do not guess or substitute another file) and say which files were skipped.`;
}

function finishLine() {
  return 'When finished, report back with flow_cloud_complete (task_id, result object, status done/failed).';
}

const PROMPT_BOX = '[role="textbox"][aria-label="What do you want to create?"]';
const SEND_BUTTON = 'button[aria-label="Start generation"]';
const NEW_SESSION = 'button[aria-label="Start new session"]';
const SETTINGS_BUTTON = 'button[aria-label="Settings"] (the tune icon)';
const ADD_MEDIA = 'button[aria-label="Add media menu"] (the header "+")';

function agentSettingsBlock({ kind, model, ratio, count, autoConfirm }) {
  const section = kind === 'video' ? 'Video generation default model' : 'Image generation default model';
  const lines = [
    `Agent settings: click ${SETTINGS_BUTTON} to open the "Agent settings" panel. Read the ${kind} defaults: model (button[aria-label="${section}"]), ratio radio, count radio (xN), and "Confirm before generating" (always/never). Note the current values before changing anything.`,
  ];
  if (autoConfirm) {
    lines.push(`Set the ${kind} defaults to model "${model}", ratio ${ratio}, count x${count}: click the model button and then the menu item with the exact model name; click the ratio and count radios; then click Save in the Agent settings panel.`);
  } else {
    lines.push(`PREPARE ONLY: do NOT change any setting. Note what WOULD be applied (model "${model}", ratio ${ratio}, count x${count}) and report the current values. Do NOT click Start generation and do NOT send anything — no credits are spent.`);
  }
  return lines.join('\n');
}

function attachRefsBlock(files) {
  if (!files || !files.length) return null;
  return [
    'Reference images (ingredients):',
    `1. Upload each file first: click ${ADD_MEDIA} > "Upload" and choose the file. (See LOCAL FILES limitation above if the file is not reachable from the cloud browser.)`,
    '2. Then click button[aria-label="Add ingredients to the prompt box"], find the asset by name in the [role="option"] list (use the "Search assets" box if it is not visible), and click it.',
    '3. If a preview appears with an "Add to prompt" button instead of attaching at once, click "Add to prompt". Verify an ingredient chip appears in the prompt box before continuing.',
  ].join('\n');
}

function permissionWaitBlock() {
  return [
    approveRule(),
    'Wait for the agent to finish: new media tiles appear in the project grid and no "NN%" progress text remains. A video tile may show a % while it renders; wait until it clears.',
  ].join('\n');
}

/**
 * UI quirks (live-verified 2026-11-13, research/flow-ui-map.md §8). Flow menus are sticky:
 * Escape does not reliably close tile/session context menus and clicks on covered elements are
 * refused — close a stuck menu by clicking a harmless menu item (e.g. "Product help",
 * "Reuse prompt") or by reloading the project page. A blank black page after navigation can
 * recur once and renders after a ~25 s wait (known soft block; no bot-challenge call needed).
 */
function uiQuirksBlock() {
  return 'UI QUIRKS: Flow menus are sticky — Escape does not reliably close them; if a menu stays open and blocks clicks, click a harmless menu item (e.g. "Product help") or reload the project page. A blank black page after navigation renders after a ~25 s wait; wait it out, do not treat it as a failure.';
}

/** Human cost label per model (Omni 1.1 bills per clip, Omni 1.2 per second, Veo flat). */
function costLabel(model, duration, quantity) {
  const q = quantity ?? 1;
  if (model === 'Omni 1.1 Flash') {
    const table = { 4: 7, 6: 10, 8: 12, 10: 15 };
    const per = table[duration] ?? 7;
    return `${per} credits per clip (Omni 1.1 per-clip table: 4s=7, 6s=10, 8s=12, 10s=15), x${q} = ~${per * q} credits total`;
  }
  if (model === 'Omni 1.2 Flash') return `3 credits per second at 720p, ${duration ?? 4}s x${q} = ~${3 * (duration ?? 4) * q} credits total`;
  if (model === 'Veo 3.1 - Lite') return `10 flat per clip, x${q} = ~${10 * q} credits total`;
  if (model === 'Veo 3.1 - Fast') return `20 flat per clip, x${q} = ~${20 * q} credits total`;
  return `~100 flat per clip, x${q} = ~${100 * q} credits total`;
}

/**
 * DIRECT GENERATION (Agent mode off) — the reliable path, live-mapped 2026-11-13
 * (research/flow-ui-map.md §3.1). Use it when the agent fails with "Something went wrong"
 * (it often does, free) or when the assignment says to. The quick-settings popover's
 * "Generating will use N credits" footer is the cost contract — read it before sending.
 */
function directModeBlock({ model, ratio, duration, hasIngredients }) {
  const sliderValue = duration !== null && duration !== undefined ? duration - 3 : 1;
  const videoType = hasIngredients ? 'Ingredients' : 'Frames';
  return [
    'DIRECT GENERATION (Agent mode off) — do this instead of the agent path:',
    '1. Make sure Agent mode is OFF: the "Agent" toggle button must NOT be pressed. If it is on, click it once to turn it off; the direct "Settings trigger" pill ("Video · 720p · 4s x1") appears in the prompt bar.',
    '2. Click the "Settings trigger" pill to open the direct quick-settings popover.',
    `3. In the popover set: Mode radio "Video"; Video type radio "${videoType}"; Aspect ratio radio "${ratio}"; click button "Select model family" and then the menu item with the exact name "${model}"; Video resolution radio "720p"; Length slider slider[aria-label="Length"] to value ${sliderValue} (${duration ?? 4} Sec — use End/Home keys or arrow keys on the focused slider); Output count radio "x1".`,
    '4. Read the footer link "Generating will use N credits" at the bottom of the popover. It must match the estimate in this task; if it shows a different number, STOP and report the mismatch (do not send).',
    '5. Close the popover (click the pill again or click the prompt box), paste the whole prompt at once, attach any ingredients (Ingredients panel: button[aria-label="Add ingredients to the prompt box"], pick the asset, click "Add to prompt"), then click button[aria-label="Start generation"].',
    '6. Wait until the new video tile is finished (no % text, no "Queued"). Download it via the tile "Download" submenu or the editor "Download media" button, quality "720p Original size".',
  ].join('\n');
}

/**
 * DIRECT IMAGE GENERATION (Agent mode off) — the reliable path, live-mapped 2026-11-13
 * (research/flow-ui-map.md §3.1). the user's standing rule, 2026-11-13: NEVER use the
 * Flow Agent — every generation is direct. The quick-settings popover's
 * "Generating will use 0 credits" footer is the cost contract for images — read
 * it before sending (Nano Banana 2.1 / 2 Lite / Pro all cost 0 credits in Flow).
 */
function directImageModeBlock({ model, ratio, count }) {
  return [
    'DIRECT IMAGE GENERATION (Agent mode off) — never use the Agent:',
    '1. Make sure Agent mode is OFF: the "Agent" toggle button must NOT be pressed. If it is on, click it once to turn it off; the direct "Settings trigger" pill appears in the prompt bar.',
    '2. Click the "Settings trigger" pill to open the direct quick-settings popover.',
    `3. In the popover set: Mode radio "Image"; click button "Select model family" and then the menu item with the exact name "${model}"; Aspect ratio radio "${ratio}"; Output count radio "x${count}". If a Thinking level is shown, set it to "High".`,
    '4. Read the footer link "Generating will use 0 credits" at the bottom of the popover. It must say 0 credits; if it shows any other number, STOP and report the mismatch (do not send).',
    '5. Close the popover (click the pill again or click the prompt box). Attach any ingredients first (Ingredients panel: button[aria-label="Add ingredients to the prompt box"], pick the asset, click "Add to prompt"), then paste the whole prompt at once (do NOT type it character by character — typing is very slow and Flow does not care), wait 4 s, pause a few seconds, and click button[aria-label="Start generation"].',
    '6. Wait until the new image tile is finished (no % text, no "Queued"). Download it via the tile "Download" submenu or the editor "Download media" button, quality "2K Upscaled" (the 2K version downscaled to 1080x1920 is sharper than the 1K version upscaled, and the print stays exact — verified 2026-11-13 on all 8 Flow covers).',
  ].join('\n');
}

/**
 * CLICK PACE — move briskly between ordinary UI clicks. the user, 2026-11-13,
 * watching the browser live: the gaps between one button click and the next
 * are too long — make them 30-50% faster; even humans do not click this
 * slowly. The ONLY deliberate pauses are the two that protect against the
 * image rate flag: the 4 s wait after pasting the prompt (before Start) and
 * the 10 s pause between separate generations. Everything else gets
 * clicked as soon as it is visible. Waiting for a page or a tile to finish
 * rendering is not a pause to cut; waiting idly between two ready buttons is.
 */
function clickPaceBlock() {
  return 'CLICK PACE — move briskly between ordinary UI clicks: as soon as a popover, menu or button appears, click it right away. Do NOT wait extra seconds between clicks (the user, 2026-11-13: the gaps between clicks are too long — make them 30-50% faster; even humans do not click this slowly). The ONLY deliberate pauses in this task are: (1) the 4 s wait after pasting the prompt, before Start generation; (2) the 10 s pause between separate generations. Everything else — settings popover, model picker, ratio, ingredient attach, download menu — gets clicked as soon as it is visible. Waiting for a page or a tile to finish rendering is not a pause to cut; waiting idly between two ready buttons is.';
}

function downloadBlock(kindLabel) {
  return [
    `Download: FIRST try the tile's own "Download" submenu — hover the new ${kindLabel} tile, open its Download submenu, pick the quality (video: "720p Original size"; image: "2K Upscaled" — the 2K version downscaled to 1080x1920 is sharper than the 1K version upscaled, and the print stays exact; verified 2026-11-13 on all 8 Flow covers, 1K vs 2K, no print change in any of them). The tile menu does not depend on the toolbar being visible. ONLY if the tile menu is not available, open the tile (which opens /edit/<id>) and download through Flow's Download button/menu (button[aria-label="Download media"]; hover the image/video first to reveal the toolbar; quality: 2K Upscaled for images, original for video). The editor route needs a wide window — in a narrow window the toolbar button hides and the editor's More options → Download media is the fallback.`,
    'After the download, STOP. Do NOT change the mode back to Video, do NOT restore any settings, do NOT touch the quick-settings popover again — leave the UI exactly as it is after the generation and report. Switching the mode back is wasted work: it only makes sense if the SAME task\'s next step is a video generation, and then the next step sets its own mode anyway. (the user, 2026-11-13: he watched the browser and saw the pointless switch-back to Video after an image.)',
    'Downloaded files land in the cloud browser\'s download folder — the MCP cannot receive a local file path from the cloud browser. Report the media id and the Flow media URL for each download instead.',
  ].join('\n');
}

// ---- per-tool assignments ------------------------------------------------------------------------

function assignmentConnect(ctx) {
  const account = ACTIVE_ACCOUNT();
  return [
    header(ctx, 'flow_connect — verify the cloud browser is on Flow and signed in'),
    `TASK: verify the cloud browser is on Google Flow and signed in as ${account}. This is verification only — nothing is generated and no credits are spent.`,
    'Steps:',
    '1. In the cloud browser window, open https://flow.google.com/?pli=1 (it may already be open on Flow).',
    '2. If the page shows the Flow marketing/about page instead of the app, open the default project instead: ' + DEFAULT_PROJECT() + ' — the app home shows a "New project" button.',
    `3. Check the account chip (top-right avatar): it must show ${account}. If a Google sign-in page appears, STOP and report login_required (do not attempt to sign in from here).`,
    '4. Read the credit balance chip if visible ("N Google Flow credits").',
    reportBlock(['browserConnected (true)', 'flowAccessible (true if the Flow app, not the marketing page, is showing)', 'accountVerified (true/false)', 'account (email shown on the chip, or null)', 'credits (number or null)', 'currentUrl', 'pageTitle', 'reason (if not verified)']),
    finishLine(),
  ].join('\n\n');
}

function assignmentStatus(ctx) {
  return [
    header(ctx, 'flow_status — report the cloud browser Flow tab state'),
    'TASK: report the current state of the cloud browser\'s Flow tab. Read-only; nothing is changed and no credits are spent.',
    'Steps: read the current URL and page title; say whether the Flow app is showing (home/project page with a "New project" button) versus the marketing/about page versus a Google sign-in page; read the account chip email if visible; note any visible error message.',
    reportBlock(['currentUrl', 'pageTitle', 'flowAccessible (true/false)', 'loginRequired (true/false)', 'accountVerified (true/false)', 'account (email or null)', 'accountReason']),
    finishLine(),
  ].join('\n\n');
}

function assignmentAccountCheck(ctx, args) {
  const account = args.account || ACTIVE_ACCOUNT();
  const lines = [
    header(ctx, 'flow_account_check — verify the signed-in Google account'),
    `TASK: verify the signed-in Google account in the cloud browser is ${account}.`,
    'Steps:',
    `1. Open the project root ${ACTIVE_PROJECT() || DEFAULT_PROJECT()} — the project root always shows the account chip; tool/scene/media-viewer pages hide it.`,
    '2. Read the visible account email from the account chip (top-right avatar; the chip carries [data-account-email]).',
    `3. Compare it with ${account}. If it is a different account, report verified=false and do not proceed with anything else.`,
  ];
  if (args.balance_read) lines.push('4. Also read the credit balance chip ("N Google Flow credits") on the page and report the number.');
  lines.push(reportBlock(['verified (true/false)', 'account (email shown, or null)', 'method ("visible-account-ui")', 'reason (if not verified)', ...(args.balance_read ? ['balance (number or null)'] : [])]));
  lines.push(finishLine());
  return lines.join('\n\n');
}

/**
 * ACCOUNT SWITCH (3-account rotation, 2026-11-13). Switches the cloud
 * browser to another Google account that is ALREADY signed in to the same
 * Google session (multi-account). It never signs anyone in and never signs
 * anyone out. After a switch the browser shows THAT account's Flow projects
 * — the musedraft project "Acme Test" is not visible on #2/#3.
 */
function assignmentSwitchAccount(ctx, target) {
  const current = ACTIVE_ACCOUNT();
  const alreadyActive = target.index === activeAccount()?.index;
  const lines = [
    header(ctx, `flow_switch_account — switch the active Flow account to #${target.index} ${target.email}`),
    `TASK: switch the cloud browser's Google Flow account from ${current} (account #${activeAccount()?.index}) to ${target.email} (account #${target.index}, ${target.name || 'no name recorded'}). This is a switch only — nothing is generated and no credits are spent.`,
    'Why this exists: the three Flow accounts are all signed in to the same Google session in this cloud browser. Each account has its OWN Flow projects and credits; switching changes which projects are visible and which balance pays for the next generation.',
    'Steps:',
    `1. Open https://flow.google.com/u/${target.flowUrlIndex}/?pli=1 in the cloud browser window. Wait for Flow to load (up to ~25 s; a blank black page renders after a wait — wait it out).`,
    `2. Check the account chip (top-right avatar): it must show ${target.email}. If it shows a different account, use the Google account switcher instead: click the account chip/avatar, pick "${target.email}" from the account list, wait for Flow to reload.`,
    `3. If a Google sign-in page appears, or the account is not in the switcher list, STOP and report account_not_signed_in for ${target.email} (do NOT sign in from here, do NOT sign anyone out).`,
    `4. Read the credit balance chip ("N Google Flow credits") from the Account panel: click the account chip, read span.credits-count, close the panel by clicking the backdrop corner.`,
    '5. Note which projects are visible on Flow home for this account (do NOT create a new project in this task).',
    reportBlock(['verified (true/false)', 'account (email shown on the chip, or null)', 'balance (number or null)', 'currentUrl', 'projects_visible (list of project names, or null)', 'reason (if not verified)']),
    finishLine(),
  ];
  if (alreadyActive) {
    lines.splice(3, 0, `NOTE: ${target.email} is ALREADY the active account — no switch is needed. Just verify the account chip shows it and read the balance (steps 2 and 4).`);
  }
  return lines.join('\n\n');
}

function assignmentDiscoverUi(ctx, args) {
  const page = String(args.page || 'main').toLowerCase();
  const map = {
    main: { url: 'https://flow.google.com/', wait: 'the "New project" button' },
    project: { url: DEFAULT_PROJECT(), wait: `the prompt box ${PROMPT_BOX}` },
    characters: { url: `${DEFAULT_PROJECT()}/character`, wait: 'the character description box' },
    scenes: { url: DEFAULT_PROJECT(), wait: 'the project page, then click the sidebar "Scenes" button' },
    'tools-gallery': { url: `${DEFAULT_PROJECT()}/tools`, wait: 'the Tools page' },
    'grid-architect': { url: `${DEFAULT_PROJECT()}/tools`, wait: 'the Tools page, then open "Grid Architect" (reuse the My Tools copy, or let Flow copy the template) and wait for the tool app frame (an iframe on *.scf.usercontent.goog with buttons/inputs)' },
  };
  const target = map[page] || map.main;
  return [
    header(ctx, `flow_discover_ui — record the interactive elements of the Flow "${page}" page`),
    `TASK: open ${target.url} in the cloud browser and wait for ${target.wait}. Do NOT create a new project for this (reuse the open or most recent one).`,
    'Record: page URL, page title, visible buttons (their text), inputs (placeholder / aria-label / name), headings, any model names mentioned (Nano / Veo / Omni), and any ratio texts (e.g. 16:9).',
    reportBlock(['url', 'title', 'buttons (list of texts)', 'inputs (list of placeholder/aria-label)', 'headings (list)', 'visible_models', 'visible_ratios']),
    finishLine(),
  ].join('\n\n');
}

function assignmentGenerateImage(ctx, args, v) {
  const autoConfirm = args.auto_confirm === true;
  const blocks = [
    header(ctx, `flow_generate_image — ${autoConfirm ? 'GENERATE (direct mode, 0 credits)' : 'PREPARE ONLY (spends nothing)'}`),
    projectLine(args),
    'DIRECT MODE ONLY (Agent OFF — never use the Flow Agent). the user\'s standing rule, 2026-11-13: the Agent fails often and is never used; every generation is direct.',
    clickPaceBlock(),
  ];
  const refs = attachRefsBlock(args.reference_images);
  if (refs) blocks.push(refs);
  const local = localFilesBlock(args.reference_images);
  if (local) blocks.push(local);
  if (!autoConfirm) {
    blocks.push(`STOP HERE. Do NOT click Start generation and do NOT send anything. Report ready_for_confirmation with the direct settings that would be applied (model "${v.model}", ratio ${v.ratio}, count x${v.count}) and the prompt.`);
  } else {
    blocks.push(directImageModeBlock({ model: v.model, ratio: v.ratio, count: v.count }));
    blocks.push(`Paste the prompt into the prompt box ${PROMPT_BOX} (click it, select all, paste the full prompt text):\nPROMPT: ${v.prompt}`);
    blocks.push('HUMAN-LIKE PACING (do this every time — it is what keeps Flow from flagging the generation): paste the whole prompt at once (do NOT type it character by character — typing is very slow and Flow does not care), then wait 4 s before doing anything. After the prompt is in, pause a few seconds, then click Start generation. Do NOT paste and click instantly — instant fill + immediate submit is the machine signature Flow flags. One generation at a time; if a batch needs several, leave a 10 s pause between them. NEVER re-submit the same prompt inside ~40 s — spread 3 attempts over ~3 min. If a tile fails with "We noticed some unusual activity": STOP the batch, do a real page reload, then run a FRESH generation (paste the whole prompt, wait 4 s, attach the reference) — do NOT retry the failed tile via "Reuse prompt", it fails instantly again (proven 2026-11-16). If the fresh generation also fails, stop image generation and report it — do not keep retrying, every refusal makes the flag last longer.');
    blocks.push(downloadBlock('image'));
  }
  blocks.push(reportBlock(['status ("ready_for_confirmation" or "success" or "no_media_generated")', 'model_used', 'ratio', 'quantity', 'prompt', 'media_ids (list)', 'media_urls (list)', 'project_url', 'credits_may_have_been_consumed (true/false)']));
  blocks.push(finishLine());
  return blocks.join('\n\n');
}

function assignmentGenerateVideo(ctx, args, v) {
  const autoConfirm = args.auto_confirm === true;
  const est = estimateVideoCredits({ model: v.model, duration: v.duration ?? 4, quantity: v.count, resolution: DEFAULT_RESOLUTION });
  const hasIngredients = Array.isArray(args.reference_images) && args.reference_images.length > 0;
  const blocks = [
    header(ctx, `flow_generate_video — ${autoConfirm ? 'GENERATE (direct mode)' : 'PREPARE ONLY (spends nothing)'}`),
    uiQuirksBlock(),
    projectLine(args),
    `Model: ${v.model} (720p). Duration: ${v.duration ?? 'not specified (Flow default)'} seconds — the prompt below already carries "Video length: ${v.duration} seconds." when a duration was given. Ratio: ${v.ratio}. Quantity: ${v.count}. Estimated cost if sent: ~${est} credits (${costLabel(v.model, v.duration ?? 4, v.count)}).`,
    'DIRECT MODE ONLY (Agent OFF — never use the Flow Agent). the user\'s standing rule, 2026-11-13: the Agent fails often and is never used; every generation is direct.',
    clickPaceBlock(),
  ];
  const refs = attachRefsBlock(args.reference_images);
  if (refs) blocks.push(refs);
  const local = localFilesBlock(args.reference_images);
  if (local) blocks.push(local);
  if (!autoConfirm) {
    blocks.push('STOP HERE. Do NOT click Start generation and do NOT send anything. Report ready_for_confirmation with the direct settings that would be applied, the credit estimate, and the prompt.');
  } else {
    blocks.push(spendBlock(spendEstimateFor('flow_generate_video', args)));
    blocks.push(directModeBlock({ model: v.model, ratio: v.ratio, duration: v.duration ?? 4, hasIngredients }));
    blocks.push(insufficientCreditsBlock(!hasIngredients, 'the reference images exist only on THIS account\'s project'));
    blocks.push(`Paste the prompt into the prompt box ${PROMPT_BOX} (click it, select all, paste the full prompt text):\nPROMPT: ${v.prompt}`);
    blocks.push('Wait until the new video tiles are finished (no % text, no "Queued"). If Flow is still rendering after a few minutes, report still_rendering with the project URL instead of waiting forever.');
    blocks.push(downloadBlock('video'));
  }
  blocks.push(reportBlock(['status ("ready_for_confirmation", "success", "still_rendering" or "no_media_generated")', 'model_used', 'ratio', 'quantity_requested', 'duration_seconds', 'prompt', 'media_ids (list)', 'media_urls (list)', 'project_url', 'credits_may_have_been_consumed (true/false)']));
  blocks.push(finishLine());
  return blocks.join('\n\n');
}

/** Validate a batch: 1-4 clips, each a valid video generation (reuses validateVideoArgs). */
function validateBatchArgs(args) {
  if (!Array.isArray(args.clips) || args.clips.length === 0) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS, 'clips is required: an array of 1-4 clip specs, each with at least a prompt.');
  }
  if (args.clips.length > 4) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'A batch holds at most 4 clips (one Reel). Split a longer set into two batches.');
  if (args.auto_confirm !== true) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS, 'flow_generate_batch always spends credits: pass auto_confirm=true (the summed estimate is shown and needs approval before the task runs).');
  }
  return args.clips.map((clip, i) => {
    const v = validateVideoArgs({
      prompt: clip.prompt,
      model: clip.model,
      ratio: clip.ratio ?? '9:16',
      quantity: 1,
      duration: clip.duration,
      allow_expensive: args.allow_expensive,
    });
    return {
      label: typeof clip.label === 'string' && clip.label.trim() ? clip.label.trim() : `Clip ${i + 1}`,
      ...v,
      reference_images: Array.isArray(clip.reference_images) ? clip.reference_images : [],
    };
  });
}

/**
 * Batch assignment: generate a whole Reel's clips in ONE cloud-browser task, in order,
 * all in DIRECT mode (Agent off) — the reliable path. One browser round-trip instead of one
 * per clip. Each clip: set direct settings, type prompt, attach ingredients, send, wait,
 * download "720p Original size", then move on to the next clip. NEVER use the Agent
 * (the user's standing rule, 2026-11-13). If direct mode ever fails for a clip, retry it
 * once in direct mode after a page reload, then continue with the rest.
 */
function assignmentGenerateBatch(ctx, args, clips) {
  const total = clips.reduce((sum, c) => sum + estimateVideoCredits({ model: c.model, duration: c.duration ?? 4, quantity: 1, resolution: DEFAULT_RESOLUTION }), 0);
  const blocks = [
    header(ctx, 'flow_generate_batch — GENERATE A WHOLE REEL (spends credits)'),
    uiQuirksBlock(),
    projectLine(args),
    `Batch: ${clips.length} clip(s), all DIRECT mode (Agent off), 720p. Total estimated cost: ~${total} credits. ${clips.map((c, i) => `${i + 1}. ${c.label}: ${c.model}, ${c.ratio}, ${c.duration ?? 4}s, ${costLabel(c.model, c.duration ?? 4, 1)}${c.reference_images.length ? `, ${c.reference_images.length} ingredient(s)` : ''}`).join(' | ')}`,
    clickPaceBlock(),
    spendBlock({ credits: total, note: `${clips.length} clips, ${clips.map((c) => `${c.label} ${c.model} ${c.duration ?? 4}s`).join(', ')}` }),
    insufficientCreditsBlock(!clips.some((c) => c.reference_images.length > 0), 'some clips use reference images that exist only on THIS account\'s project'),
  ];
  clips.forEach((c, i) => {
    const hasIngredients = c.reference_images.length > 0;
    blocks.push(`--- CLIP ${i + 1}/${clips.length}: ${c.label} (${c.model}, ${c.ratio}, ${c.duration ?? 4}s) ---`);
    if (hasIngredients) {
      const refs = attachRefsBlock(c.reference_images);
      if (refs) blocks.push(refs);
      const local = localFilesBlock(c.reference_images);
      if (local) blocks.push(local);
    }
    blocks.push(directModeBlock({ model: c.model, ratio: c.ratio, duration: c.duration ?? 4, hasIngredients }));
    blocks.push(`Paste the prompt into the prompt box ${PROMPT_BOX} (click it, select all, paste the full prompt text):\nPROMPT: ${c.prompt}`);
    blocks.push('If this clip\'s direct generation fails ("Something went wrong" or no tile appears), reload the page, re-apply the direct settings from the block above, and retry it ONCE in direct mode. NEVER turn the Agent on — the Agent is never used (the user\'s standing rule, 2026-11-13). If it still fails, note it as failed in the report and CONTINUE with the next clip — do not stop the whole batch for one clip.');
    blocks.push('Wait until this clip\'s tile is finished (no % text, no "Queued"), download it via the tile "Download" submenu or the editor "Download media" button, quality "720p Original size". Confirm the file actually arrived in the download folder (the "Your video has been downloaded!" toast alone is not proof). Note the media id and URL for the report.');
  });
  blocks.push(reportBlock(['status ("success", "partial" or "failed")', 'clips (list, one entry per clip: {label, status, media_id, media_url, credits_spent_estimate, error (if failed)})', 'total_credits_estimate', 'project_url']));
  blocks.push(finishLine());
  return blocks.join('\n\n');
}

function assignmentEditVideo(ctx, args) {
  const autoConfirm = args.auto_confirm === true;
  const blocks = [
    header(ctx, `flow_edit_video — ${autoConfirm ? 'RUN THE EDIT (spends credits)' : 'PREPARE ONLY (spends nothing)'}`),
    projectLine(args),
    'Resolve the source clip (exactly one of these):',
  ];
  if (args.source_file) {
    blocks.push(`- SOURCE FILE: upload the local clip first: click ${ADD_MEDIA} > "Upload" and choose the file. If a rights dialog appears ("Rights to use this video..."), click "I agree, do not show again" (never Cancel). Wait for the upload/transcode to finish (videos can take minutes), then open the clip by its tile name.`);
    blocks.push(localFilesBlock([args.source_file]));
  } else if (args.source_media_id) {
    blocks.push(`- SOURCE MEDIA ID: open ${DEFAULT_PROJECT()}/edit/${args.source_media_id} directly.`);
  } else {
    blocks.push('- NEWEST CLIP: open the newest finished video tile in the project grid (first tile that is a video and not pending).');
  }
  blocks.push(`Type the edit prompt into the video editor prompt box [role="textbox"][aria-label^="Describe how to edit this video"] (click it, select all, type):\nEDIT PROMPT: ${args.edit_prompt ?? args.prompt}`);
  if (!autoConfirm) {
    blocks.push('STOP HERE. Do NOT click Start generation and do NOT send anything. Report ready_for_confirmation with the source media id/url and the edit prompt. Cost if run: about 12 credits (Omni 1.2 video-to-video, 4s at 720p, 3 per second).');
  } else {
    blocks.push(spendBlock(spendEstimateFor('flow_edit_video', args)));
    blocks.push(insufficientCreditsBlock(false, 'the source clip exists only on THIS account\'s project'));
    blocks.push(`Click ${SEND_BUTTON}.`);
    blocks.push(permissionWaitBlock());
    blocks.push('Wait until the editor history gains a new step (flow-editor-history-step-video count increases) and no % progress remains.');
    blocks.push(downloadBlock('edited video'));
  }
  blocks.push(reportBlock(['status ("ready_for_confirmation", "success" or "still_rendering")', 'edit_prompt', 'source (media_id, media_url)', 'media_ids (list)', 'media_urls (list)', 'project_url', 'credits_may_have_been_consumed (true/false)', 'agent_confirmation_clicked (label or null)', 'agent_reply']));
  blocks.push(finishLine());
  return blocks.filter(Boolean).join('\n\n');
}

function assignmentSaveFrameUpload(ctx, args) {
  const blocks = [
    header(ctx, 'flow_save_frame — upload a locally extracted frame into Flow'),
    `The frame was already extracted locally (free, ffmpeg) to: ${args.frame_path}`,
    projectLine(args),
    `Upload it: click ${ADD_MEDIA} > "Upload" and choose the frame file.`,
  ];
  const local = localFilesBlock([args.frame_path]);
  if (local) blocks.push(local);
  if (args.attach_to_prompt) blocks.push('Then attach it to the agent prompt: click button[aria-label="Add ingredients to the prompt box"], find the frame by name in the [role="option"] list, click it, and verify an ingredient chip appears in the prompt box (click "Add to prompt" first if a preview appears).');
  blocks.push(reportBlock(['status', 'frame_path', 'uploaded_to_flow (project_url, asset name)', 'attached (true/false)']));
  blocks.push(finishLine());
  return blocks.filter(Boolean).join('\n\n');
}

function assignmentDownloadLatest(ctx, args) {
  const quality = String(args.quality ?? 'original').toLowerCase();
  const blocks = [
    header(ctx, 'flow_download_latest — download the newest finished media'),
    projectLine(args),
    'Steps:',
    '1. If a media viewer (/edit/<id>) is already open, stay there. Otherwise open the newest finished image/video tile in the project grid (first tile that is an image or video and not pending).',
    '2. Hover the image/video to reveal the toolbar, then click Download (button[aria-label="Download media"] or "Download scene").',
    `3. If a menu appears, choose quality "${quality}"${quality === 'original' ? ' (free)' : ' — upscales may cost credits, see the spend note below'}. If no menu appears, the plain Download button saves directly.`,
  ];
  if (quality !== 'original') blocks.push(spendBlock(spendEstimateFor('flow_download_latest', args)));
  blocks.push('Downloaded files land in the cloud browser\'s download folder — the MCP cannot receive a local file path from the cloud browser. Report the media id and Flow media URL instead.');
  blocks.push(reportBlock(['status ("downloaded" or "not_found")', 'kind ("image"/"video")', 'media_id', 'project_id', 'option (menu choice used)', 'media_url']));
  blocks.push(finishLine());
  return blocks.join('\n\n');
}

function characterSteps(ctx, args, spec, via) {
  const autoConfirm = args.auto_confirm === true;
  const blocks = [
    header(ctx, `flow_${via === 'import' ? 'import' : 'create'}_character — ${autoConfirm ? 'CREATE (may spend credits)' : 'PREPARE ONLY (spends nothing)'}`),
    projectLine(args),
    `Open ${DEFAULT_PROJECT()}/character (the "New character" form) and wait for the description box [role="textbox"][aria-label="Describe your character…"].`,
  ];
  if (spec.model) blocks.push(`Model: click button[aria-label="Select model family"] and pick "${spec.model}".`);
  if (spec.references && spec.references.length) {
    blocks.push(`Reference photo: click "Upload" and choose the first photo (${spec.references[0]}). With auto_confirm=true the photo becomes the character directly (no generation); the description is saved as character info.`);
    blocks.push(localFilesBlock(spec.references));
  }
  blocks.push(`Type the description into the character description box:\nDESCRIPTION: ${spec.description}`);
  if (!autoConfirm) {
    blocks.push('STOP HERE. Do NOT click Start generation and do NOT send anything. Report ready_for_confirmation with the name, description and mode (from_description or from_photo).');
  } else {
    if (spec.references && spec.references.length) blocks.push(spendBlock({ credits: null, note: 'character from photo (no generation)' }));
    else blocks.push(spendBlock(spendEstimateFor('flow_create_character', args)));
    blocks.push(`Click ${SEND_BUTTON}. Wait for the page to become /character/<uuid>. Wait until the character image has loaded (a large image is visible and no % text remains).`);
    if (spec.name) blocks.push(`Fill "Character name" (input[aria-label="Character name"]) with: ${spec.name}`);
    if (spec.personality) blocks.push(`Fill "Character personality" (textarea[aria-label="Character personality"]) with: ${spec.personality}`);
    blocks.push('Click "Done".');
  }
  blocks.push(reportBlock(['status ("ready_for_confirmation" or "success")', 'character_id', 'name', 'description', 'character_url', 'project_url']));
  blocks.push(finishLine());
  return blocks.filter(Boolean).join('\n\n');
}

function assignmentOpenCharacters(ctx, args) {
  return [
    header(ctx, 'flow_open_characters — list the project\'s characters'),
    projectLine(args),
    'Steps: open the project, click the sidebar "Characters" button, and list the character tiles (name, index). If Flow jumps straight to the "New character" form, there are no characters yet — report that.',
    reportBlock(['characters (list of {name, index})', 'count', 'project_url']),
    finishLine(),
  ].join('\n\n');
}

function assignmentCreateScene(ctx, args) {
  const blocks = [
    header(ctx, 'flow_create_scene — create an empty scene'),
    projectLine(args),
    'Steps:',
    `1. Open the project and click ${ADD_MEDIA} (the header "+"), then the menu item "New scene".`,
    '2. Wait for the URL to become /scene/<uuid> and for the "Add clip" button to appear.',
  ];
  if (args.name) blocks.push(`3. Rename the scene: click the title input (.editable-text-container input, aria-label "Editable text"), select all, type "${args.name}", press Enter.`);
  blocks.push('NOTE: the prompt and character names are saved locally only — Flow scenes are built from video clips, so they cannot be placed inside the empty scene. Generate videos (flow_generate_video) and add them as clips afterwards.');
  blocks.push(reportBlock(['scene_id', 'name', 'scene_url', 'project_url']));
  blocks.push(finishLine());
  return blocks.join('\n\n');
}

function assignmentAddToScene(ctx, args) {
  const blocks = [
    header(ctx, 'flow_add_to_scene — add a finished clip/image to a scene (free)'),
    projectLine(args),
    'Steps:',
    '1. Open the project and click the sidebar "All media" button.',
    args.media_name
      ? `2. Find the tile whose name contains "${args.media_name}".`
      : `2. Take the newest non-scene tile (index ${args.media_index ?? 0}, newest first).`,
    '3. Hover the tile (flow-grid-tile-container) and click its "More options" button (button[aria-label="More options"]), then click "Add to scene".',
    args.scene_name
      ? `4. In the chooser, pick the scene named "${args.scene_name}".`
      : '4. In the chooser, pick a scene (or "New scene" to create one).',
    'Adding a clip costs nothing; only generating inside the scene spends credits.',
    reportBlock(['status ("clip_added_to_scene" or "clip_add_to_scene_needs_a_choice")', 'media (name, type)', 'scene_choice', 'options_offered (if no choice could be made)', 'project_url']),
    finishLine(),
  ];
  return blocks.join('\n\n');
}

function assignmentOpenToolsGallery(ctx, args) {
  return [
    header(ctx, 'flow_open_tools_gallery — list the project\'s tools'),
    projectLine(args),
    `Steps: open ${DEFAULT_PROJECT()}/tools and list the cards under "My Tools", "Templates" and "Community" (first 20 of Community).`,
    reportBlock(['my_tools (list)', 'templates (list)', 'community_count', 'community (first 20)']),
    finishLine(),
  ].join('\n\n');
}

function assignmentGridArchitect(ctx, args) {
  const blocks = [
    header(ctx, 'flow_use_grid_architect — configure Grid Architect (never press GENERATE)'),
    projectLine(args),
    'Steps:',
    '1. Open the Tools page and open "Grid Architect" (reuse the project\'s My Tools copy; otherwise Flow copies the template into the project). Wait for the tool app frame (an iframe on *.scf.usercontent.goog with buttons/inputs).',
    '2. If a landing overlay blocks clicks, press "START ARCHITECTING".',
  ];
  if (args.engine) blocks.push(`3. ENGINE: click the "ENGINE" dropdown button, then the option "${args.engine}".`);
  if (args.ratio) blocks.push(`4. FORMAT RATIO: click the "FORMAT RATIO" dropdown button, then the option "${args.ratio}".`);
  if (args.visual_logic) blocks.push(`5. VISUAL LOGIC: click the "VISUAL LOGIC" dropdown button, then the option "${args.visual_logic}".`);
  blocks.push(`6. Click "UNIFIED THEME" and fill its textarea with the theme prompt:\nTHEME PROMPT: ${args.theme_prompt}`);
  if (Array.isArray(args.shot_prompts) && args.shot_prompts.length) {
    blocks.push(`7. Click "SEQUENCE" and fill the textarea[placeholder="Shot details..."] boxes with these shot prompts (up to 4):\n${args.shot_prompts.map((s, i) => `SHOT ${i + 1}: ${s}`).join('\n')}`);
  }
  if (Array.isArray(args.references) && args.references.length) {
    blocks.push('8. References: use the tool\'s file input if one is exposed.');
    blocks.push(localFilesBlock(args.references));
  }
  blocks.push('NEVER press GENERATE — it spends credits. Configuration only.');
  blocks.push(reportBlock(['mode ("UNIFIED THEME" or "SEQUENCE")', 'config (ENGINE / FORMAT RATIO / VISUAL LOGIC as read back from the tool)', 'theme_prompt', 'shots_filled', 'tool_url', 'project_url']));
  blocks.push(finishLine());
  return blocks.filter(Boolean).join('\n\n');
}

function assignmentUseTool(ctx, args) {
  const params = args.params && typeof args.params === 'object' ? Object.entries(args.params) : [];
  const blocks = [
    header(ctx, `flow_use_tool — open "${args.tool_name}" and fill its inputs (never run it)`),
    projectLine(args),
    `Steps: open the Tools page and open "${args.tool_name}" (reuse the My Tools copy; otherwise Flow copies the template). Wait for the tool app frame (an iframe on *.scf.usercontent.goog with buttons/inputs).`,
  ];
  if (params.length) {
    blocks.push(`Fill these inputs (match each label against the field's placeholder / aria-label / name / nearby label text; selects: choose the option; button-style options: click the button with the exact value text):\n${params.map(([k, v]) => `- ${k}: ${v}`).join('\n')}`);
  } else {
    blocks.push('No params were given: just open the tool and list its controls.');
  }
  blocks.push('NEVER click a button whose label matches /generate|create|render|run|start|submit|export|apply|upscale/i — running a tool can spend credits. Nothing is run here.');
  blocks.push(reportBlock(['tool', 'tool_id', 'url', 'params_applied (list)', 'params_not_applied (list)', 'visible buttons (list)', 'visible inputs (list)']));
  blocks.push(finishLine());
  return blocks.join('\n\n');
}

function assignmentCreateTool(ctx, args) {
  const blocks = [
    header(ctx, 'flow_create_tool — build a new Flow Tool (building costs no credits)'),
    projectLine(args),
    'Steps:',
    `1. Open ${DEFAULT_PROJECT()}/create-tool and wait for the prompt box (.ProseMirror).`,
    `2. Click it and type the tool spec:\nTOOL SPEC: ${args.prompt}`,
    '3. Click button[aria-label="Start generation"]. Wait for the URL to become /tool/<uuid>?mode=EDIT.',
    '4. Wait for the builder to finish: the "Stop" button (button[aria-label="Stop"]) appears while it builds and disappears when done (about 1–2 minutes).',
  ];
  if (args.tool_name) blocks.push(`5. Rename the tool: click the header input.editable-text-input, type "${args.tool_name}", press Enter.`);
  if (args.inspect_code !== false) {
    blocks.push('6. Read the generated code: click the "Code" tab, open each file listed in flow-applet-code-explorer, and note any fetch / XMLHttpRequest / WebSocket / sendBeacon / eval / new Function / remote <script> / postMessage / localStorage / external URLs / Flow SDK calls.');
  }
  blocks.push('Building costs no credits. NEVER run the tool — running a generative tool can spend credits. Test it later with fixture media only, and read its footer first.');
  blocks.push(reportBlock(['tool_id', 'tool_name', 'url', 'builder_message', 'build_seconds', 'renamed_to', 'appears_in_my_tools', 'credits_when_run', 'code_review (files, flags, external_urls, flow_sdk_calls, clean)']));
  blocks.push(finishLine());
  return blocks.join('\n\n');
}

function assignmentRefineTool(ctx, args) {
  return [
    header(ctx, 'flow_refine_tool — ask the tool builder for ONE change'),
    projectLine(args),
    `Steps: open the tool in EDIT mode (${DEFAULT_PROJECT()}/tool/<uuid>?mode=EDIT — find it by tool_id "${args.tool_id || ''}" or by name "${args.tool_name || ''}" in My Tools; click the card). Fill textarea[aria-label="Ask applet agent to make changes"] with this message, then click button[aria-label="Send message"]:\nMESSAGE: ${args.message}`,
    'Wait for the builder to finish (the "Stop" button appears while it works and disappears when done). NOTE: the applet agent often edits things you did not ask for — re-test afterwards and snapshot versions with Remix.',
    reportBlock(['tool_id', 'tool_name', 'url', 'builder_message', 'build_seconds']),
    finishLine(),
  ].join('\n\n');
}

function assignmentInspectTool(ctx, args) {
  return [
    header(ctx, 'flow_inspect_tool — read a tool\'s source and scan it (read-only)'),
    projectLine(args),
    `Steps: open the tool in EDIT mode (${DEFAULT_PROJECT()}/tool/<uuid>?mode=EDIT — find it by tool_id "${args.tool_id || ''}" or by name "${args.tool_name || ''}" in My Tools). Click the "Code" tab and read every file listed in flow-applet-code-explorer.`,
    'Scan for: fetch, XMLHttpRequest, WebSocket, sendBeacon, eval, new Function, remote <script>, postMessage, localStorage/cookies, external URLs, Flow SDK calls. Static scan only — any flag or external URL deserves a human read before the tool sees real uploads.',
    reportBlock(['tool_id', 'tool_name', 'files', 'flags', 'external_urls', 'flow_sdk_calls', 'clean (true/false)']),
    finishLine(),
  ].join('\n\n');
}

function assignmentScreenshot(ctx, args) {
  return [
    header(ctx, 'flow_screenshot — capture the current Flow page in the cloud browser'),
    `TASK: take a screenshot of the current Google Flow page in the cloud browser (use the browser's own screenshot function) and report what it shows. Suggested name: ${args.name || 'manual'}.`,
    reportBlock(['url', 'title', 'description (what is visible on the page)', 'screenshot_ref (if the browser tool returns one)']),
    finishLine(),
  ].join('\n\n');
}

function assignmentMusicGenerate(ctx, args) {
  const via = args.via || 'compose';
  const prompt = args.prompt && String(args.prompt).trim()
    ? String(args.prompt)
    : buildMusicPrompt({ genre: args.genre, mood: args.mood, instruments: args.instruments, bpm: args.bpm, key: args.key, targetSec: args.target_sec, avoid: args.avoid });
  const blocks = [
    header(ctx, 'flow_music_generate — generate a track in Flow Music (Lyria 3.5)'),
    'Flow Music (https://www.flowmusic.app) is a SEPARATE app from Google Flow, with its own credits. Open it in a new tab — never the Flow tab. If it shows a Google sign-in wall, STOP and report login_required.',
    'Dismiss the cookie banner ("No thanks" / "Agree") if it covers the app.',
  ];
  if (via === 'chat') {
    blocks.push(`Producer chat: fill textarea[aria-label="Chat message"] with this prompt and click button[aria-label="Send message"]:\nPROMPT: ${prompt}`);
  } else {
    blocks.push(`Compose panel: click button[aria-label="Toggle compose panel"] if the Sound description box is hidden. Fill textarea[aria-label="Sound description"] with this prompt:\nPROMPT: ${prompt}`);
    blocks.push(`Instrumental: set the switch button[role=switch][aria-label="Toggle instrumental mode"] to ${args.instrumental === false ? 'OFF' : 'ON'}${args.instrumental === false && args.lyrics ? `, then fill textarea[aria-label="Lyrics"] with: ${args.lyrics}` : ''}.`);
    const adv = [];
    if (args.bpm) adv.push(`BPM: ${args.bpm}`);
    if (args.length_sec) adv.push(`Length: ${args.length_sec}s (the app clamps Length to 1:00–3:00)`);
    if (args.seed) adv.push(`Seed: ${args.seed}`);
    if (adv.length) blocks.push(`Advanced: turn ON the switch button[role=switch][aria-label="Toggle advanced sound mode"], then set: ${adv.join('; ')}.`);
    blocks.push('Click the "Generate" button (or press Ctrl+Enter).');
  }
  blocks.push('Wait for a new /song/ link to appear and no "NN%" progress node to remain (about 20 s).');
  blocks.push(spendBlock(spendEstimateFor('flow_music_generate', args)));
  blocks.push('NOTE: length and BPM are only hints — the track will come back longer than asked. Download the WAV afterwards and cut it with flow_music_shorten; never trust the requested length.');
  blocks.push(reportBlock(['sessionUrl', 'takes (list of {id, title})', 'creditsBefore', 'creditsAfter', 'elapsedSec']));
  blocks.push(finishLine());
  return blocks.join('\n\n');
}

function assignmentMusicDownload(ctx, args) {
  return [
    header(ctx, 'flow_music_download — download a Flow Music song (free)'),
    'Steps: open https://www.flowmusic.app, find the song'
      + (args.song_id ? ` with id "${args.song_id}"` : args.title ? ` titled "${args.title}"` : args.take !== undefined ? ` (take index ${args.take})` : ' (newest)')
      + '. Hover its row, click its "More options" button, then menu > Download > ' + String(args.format || 'WAV').toUpperCase() + '.',
    'WAV is 48 kHz stereo and is the one to cut from. The file lands in the cloud browser\'s download folder. Free, no credits.',
    reportBlock(['songId', 'format', 'filename', 'durationSec', 'note ("file in the cloud browser download folder")']),
    finishLine(),
  ].join('\n\n');
}

function assignmentMusicSongs(ctx) {
  return [
    header(ctx, 'flow_music_songs — list the Flow Music library'),
    'Steps: open https://www.flowmusic.app/library/my-songs and list the songs (each link /song/<id> with its title).',
    reportBlock(['count', 'songs (list of {id, title})']),
    finishLine(),
  ].join('\n\n');
}

function assignmentMusicTrim(ctx, args) {
  return [
    header(ctx, 'flow_music_trim — trim a song inside Flow Music (free, 0 credits)'),
    'Steps: open https://www.flowmusic.app, find the song'
      + (args.song_id ? ` with id "${args.song_id}"` : args.title ? ` titled "${args.title}"` : args.take !== undefined ? ` (take index ${args.take})` : ' (newest)')
      + '. Open its "..." menu > Remix > Trim.',
    `In the "Trim Song" dialog, fill End first and then Start (format m:ss or m:ss.t, 0.1 s steps): Start ${args.start}, End ${args.end}. Click "Trim". Wait for the new library song "<title> (trim a-b)" to appear.`,
    reportBlock(['shown (start/end as shown in the dialog)', 'newSong ({id, title})']),
    finishLine(),
  ].join('\n\n');
}

function assignmentMusicStems(ctx, args) {
  return [
    header(ctx, 'flow_music_stems — split a song into stems (free)'),
    'Steps: open https://www.flowmusic.app, find the song'
      + (args.song_id ? ` with id "${args.song_id}"` : args.title ? ` titled "${args.title}"` : args.take !== undefined ? ` (take index ${args.take})` : ' (newest)')
      + '. Open its "..." menu > "Split stems".',
    'Wait for "Splitting stems..." to finish (about 13 s) and the stems card (Drums / Bass / Other / Vocals) to appear with the download button titled "Download tracks (zip)". Click it to download the zip (4 x AAC .m4a).',
    reportBlock(['songId', 'zip filename', 'stems (list)', 'note ("file in the cloud browser download folder")']),
    finishLine(),
  ].join('\n\n');
}

function assignmentAccountsBalance(ctx) {
  const account = ACTIVE_ACCOUNT();
  return [
    header(ctx, 'flow_accounts balance read — read the Flow credit balance'),
    `TASK: read the current Google Flow credit balance for ${account} (the active account). Read-only; nothing is spent.`,
    `Steps: open ${ACTIVE_PROJECT() || DEFAULT_PROJECT()} (or the Flow home page) and read the credit balance chip ("N Google Flow credits", in the account menu / header). If the chip is not visible, open the account menu and read it there.`,
    reportBlock(['balance (number)', 'account', 'currentUrl']),
    finishLine(),
  ].join('\n\n');
}

// ---- main dispatcher ---------------------------------------------------------------------------------

/**
 * Validate args for a browser tool and build its assignment.
 * Returns { args (possibly normalised), needs_approval, spend_estimate, assignment }.
 * Throws FlowError on invalid args — before anything is queued.
 */
export function prepareCloudTask(tool, args = {}, ctx = {}) {
  const identity = { verified: !!ctx.verified, account: ctx.account || null, verified_at: ctx.verified_at || null };
  let assignment;
  let normalised = { ...args };
  switch (tool) {
    case 'flow_connect':
      assignment = assignmentConnect(identity);
      break;
    case 'flow_status':
      assignment = assignmentStatus(identity);
      break;
    case 'flow_account_check':
      assignment = assignmentAccountCheck(identity, args);
      break;
    case 'flow_accounts_balance':
      assignment = assignmentAccountsBalance(identity);
      break;
    case 'flow_switch_account': {
      const accounts = configuredAccounts();
      const idx = args.account_index !== undefined && args.account_index !== null ? Number(args.account_index) : null;
      const email = typeof args.email === 'string' ? args.email.trim().toLowerCase() : null;
      const target = idx !== null
        ? accounts.find((a) => a.index === idx)
        : accounts.find((a) => a.email.toLowerCase() === email);
      if (!target) {
        const known = accounts.map((a) => `#${a.index} ${a.email}`).join(', ');
        throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unknown Flow account (pass account_index 1-3 or email). Configured accounts: ${known}.`);
      }
      normalised = { ...args, account_index: target.index, email: target.email };
      assignment = assignmentSwitchAccount(identity, target);
      break;
    }
    case 'flow_discover_ui': {
      const page = String(args.page || 'main').toLowerCase();
      const known = ['main', 'home', 'project', 'image', 'image-generation', 'video', 'video-generation', 'characters', 'character', 'scenes', 'tools-gallery', 'tools', 'grid-architect', 'grid'];
      if (!known.includes(page)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unknown page "${args.page}". Options: main, project, image-generation, video-generation, characters, scenes, tools-gallery, grid-architect.`);
      assignment = assignmentDiscoverUi(identity, args);
      break;
    }
    case 'flow_generate_image': {
      const v = validateImageArgs(args);
      normalised = { ...args, model: v.model, ratio: v.ratio, quantity: v.count };
      assignment = assignmentGenerateImage(identity, normalised, v);
      break;
    }
    case 'flow_generate_video': {
      const v = validateVideoArgs(args);
      normalised = { ...args, model: v.model, ratio: v.ratio, quantity: v.count, duration: v.duration, prompt: v.prompt };
      assignment = assignmentGenerateVideo(identity, normalised, v);
      break;
    }
    case 'flow_generate_batch': {
      const clips = validateBatchArgs(args);
      normalised = { ...args, clips: args.clips };
      assignment = assignmentGenerateBatch(identity, normalised, clips);
      break;
    }
    case 'flow_edit_video': {
      const raw = args.edit_prompt ?? args.prompt;
      const editPrompt = typeof raw === 'string' ? raw.trim() : '';
      if (!editPrompt) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'edit_prompt is required — describe the change, e.g. "add gentle rain and make the lantern glow warm orange".');
      if (editPrompt.length > 4000) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'edit_prompt is too long (max 4000 characters).');
      normalised = { ...args, edit_prompt: editPrompt };
      assignment = assignmentEditVideo(identity, normalised);
      break;
    }
    case 'flow_save_frame_upload':
      if (!args.frame_path) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'frame_path is required.');
      assignment = assignmentSaveFrameUpload(identity, args);
      break;
    case 'flow_download_latest': {
      const quality = String(args?.quality ?? 'original').toLowerCase();
      if (!['original', '1k', '2k', '4k'].includes(quality)) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'quality must be original, 1k, 2k or 4k.');
      normalised = { ...args, quality };
      assignment = assignmentDownloadLatest(identity, normalised);
      break;
    }
    case 'flow_create_character': {
      const spec = validateCharacterArgs(args);
      normalised = { ...args, description: spec.description, name: spec.name, model: spec.model };
      assignment = characterSteps(identity, normalised, { ...spec, references: args.reference_images || (args.reference_image ? [args.reference_image] : []) }, 'create');
      break;
    }
    case 'flow_import_character': {
      const spec = readCharacterSpec(args.file_path);
      normalised = { ...args, ...spec };
      assignment = characterSteps(identity, normalised, spec, 'import');
      break;
    }
    case 'flow_open_characters':
      assignment = assignmentOpenCharacters(identity, args);
      break;
    case 'flow_create_scene':
      assignment = assignmentCreateScene(identity, args);
      break;
    case 'flow_add_to_scene':
      assignment = assignmentAddToScene(identity, args);
      break;
    case 'flow_open_tools_gallery':
      assignment = assignmentOpenToolsGallery(identity, args);
      break;
    case 'flow_use_grid_architect': {
      const theme = typeof args.theme_prompt === 'string' ? args.theme_prompt.trim() : '';
      if (!theme) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'theme_prompt is required.');
      const shots = args.shot_prompts === undefined ? [] : args.shot_prompts;
      if (!Array.isArray(shots) || shots.some((s) => typeof s !== 'string')) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'shot_prompts must be an array of strings.');
      if (shots.length > 4) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Grid Architect supports at most 4 shots per grid.');
      assignment = assignmentGridArchitect(identity, args);
      break;
    }
    case 'flow_use_tool': {
      const toolName = args.tool_name || args.name;
      if (!toolName) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Tool name is required');
      assignment = assignmentUseTool(identity, { ...args, tool_name: toolName });
      break;
    }
    case 'flow_create_tool': {
      const text = String(args.prompt ?? '').replace(/\r\n/g, '\n').trim();
      if (text.length < 20) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is too short (min 20 characters): describe what the tool does, its inputs and its outputs.');
      if (text.length > 8000) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is too long (max 8000 characters).');
      assignment = assignmentCreateTool(identity, { ...args, prompt: text });
      break;
    }
    case 'flow_refine_tool': {
      const text = String(args.message ?? '').replace(/\r\n/g, '\n').trim();
      if (text.length < 20) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'message is too short (min 20 characters).');
      if (text.length > 8000) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'message is too long (max 8000 characters).');
      if (!args.tool_id && !args.tool_name) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Provide tool_id or tool_name (a tool already in this project\'s My Tools).');
      assignment = assignmentRefineTool(identity, { ...args, message: text });
      break;
    }
    case 'flow_inspect_tool': {
      if (!args.tool_id && !args.tool_name) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Provide tool_id or tool_name (a tool in this project\'s My Tools).');
      assignment = assignmentInspectTool(identity, args);
      break;
    }
    case 'flow_screenshot':
      assignment = assignmentScreenshot(identity, args);
      break;
    case 'flow_music_generate': {
      const prompt = args.prompt && String(args.prompt).trim()
        ? String(args.prompt)
        : buildMusicPrompt({ genre: args.genre, mood: args.mood, instruments: args.instruments, bpm: args.bpm, key: args.key, targetSec: args.target_sec, avoid: args.avoid });
      if (!prompt) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'genre or prompt is required.');
      assignment = assignmentMusicGenerate(identity, args);
      break;
    }
    case 'flow_music_download':
      assignment = assignmentMusicDownload(identity, args);
      break;
    case 'flow_music_songs':
      assignment = assignmentMusicSongs(identity);
      break;
    case 'flow_music_trim': {
      const a = Number(args.start); const b = Number(args.end);
      if (!(b > a)) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'end must be greater than start.');
      assignment = assignmentMusicTrim(identity, args);
      break;
    }
    case 'flow_music_stems':
      assignment = assignmentMusicStems(identity, args);
      break;
    default:
      throw new FlowError(ErrorCodes.INVALID_PARAMS, `No cloud assignment builder for tool: ${tool}`);
  }
  const spend = spendEstimateFor(tool === 'flow_save_frame_upload' ? 'flow_save_frame' : tool, normalised);
  return { args: normalised, needs_approval: spend !== null, spend_estimate: spend, assignment };
}

/** Backwards-compatible name: build the assignment text for a tool. */
export function buildAssignment(tool, args = {}, ctx = {}) {
  return prepareCloudTask(tool, args, ctx).assignment;
}
