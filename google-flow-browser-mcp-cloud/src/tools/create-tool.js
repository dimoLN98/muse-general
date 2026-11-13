import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { ensureProjectInContext } from '../navigation/project-navigator.js';
import { listToolCards } from '../navigation/tool-navigator.js';
import { routes, parseFlowUrl, gotoFlow, assertUuid } from '../navigation/flow-ui.js';

// Flow Tools are LLM-written mini web apps. Building one costs no credits ("Creating tools does not
// currently cost credits", read live 2026-10-17) but there is an unpublished daily creation quota.
// RUNNING a tool can spend credits, so nothing in this file ever clicks a tool's own controls.
//
// Live-verified DOM (2026-10-17):
//   create page  /project/<id>/create-tool   .ProseMirror (aria-label = the placeholder)  +  button[aria-label="Start generation"]
//   after submit URL becomes /project/<id>/tool/<uuid>?mode=EDIT (builder + preview), no separate Save click (autosaved)
//   building     button[aria-label="Stop"] visible; done when it is gone and "Send message" is back (~100 s for a 9-file React app)
//   refine box   textarea[aria-label="Ask applet agent to make changes"]  +  button[aria-label="Send message"]
//   tool name    header input.editable-text-input        code tab: flow-applet-code-explorer lists the files
const MIN_PROMPT = 20;
const MAX_PROMPT = 8000;
const CODE_FILE_LIMIT = 40;

/** Pure: trim and bound-check a builder prompt, and say whether the *built tool* may spend credits when run. */
export function validateToolPrompt(prompt, { what = 'prompt' } = {}) {
  const text = String(prompt ?? '').replace(/\r\n/g, '\n').trim();
  if (text.length < MIN_PROMPT) throw new FlowError(ErrorCodes.INVALID_PARAMS, `${what} is too short (min ${MIN_PROMPT} characters): describe what the tool does, its inputs and its outputs.`);
  if (text.length > MAX_PROMPT) throw new FlowError(ErrorCodes.INVALID_PARAMS, `${what} is too long (max ${MAX_PROMPT} characters).`);
  const declaresFree = /\b(no credits|no generation|no ai generation|do not call any ai model|don'?t call any ai model)\b/i.test(text);
  const callsModels = /\b(veo|omni|nano banana|gemini|image generation|video generation|generate (an? |the )?(image|video|images|videos))\b/i.test(text);
  return {
    prompt: text,
    credits_when_run: callsModels && !declaresFree ? 'may spend credits (the prompt mentions calling models); read the footer/banner before ever running it'
      : declaresFree ? 'declared free (no generation); still read the footer before running'
        : 'unknown; read the footer/banner before running',
  };
}

/** Pure: flag things in generated tool code that deserve a human look (network, dynamic code, remote scripts). */
export function scanToolCode(source) {
  const text = String(source ?? '');
  const checks = [
    ['fetch', /\bfetch\s*\(/g], ['XMLHttpRequest', /XMLHttpRequest/g], ['WebSocket', /\bWebSocket\b/g],
    ['sendBeacon', /sendBeacon/g], ['eval', /\beval\s*\(/g], ['new Function', /new\s+Function\s*\(/g],
    ['remote <script>', /<script[^>]+src\s*=/gi], ['postMessage', /postMessage\s*\(/g], ['Image().src beacon', /new\s+Image\s*\(\s*\)\s*\.src/g],
    ['localStorage/cookie', /\b(localStorage|sessionStorage|document\.cookie)\b/g],
  ];
  const flags = [];
  for (const [label, re] of checks) { const n = (text.match(re) || []).length; if (n) flags.push({ flag: label, count: n }); }
  const urls = [...new Set((text.match(/https?:\/\/[^\s'"`)<>]+/g) || []))].filter((u) => !/^https?:\/\/(www\.w3\.org|fonts\.(googleapis|gstatic)\.com)/.test(u));
  const sdk = [...new Set((text.match(/Flow\.(?:media\.)?[a-zA-Z]+/g) || []))];
  return { flags, external_urls: urls.slice(0, 20), flow_sdk_calls: sdk, clean: flags.length === 0 && urls.length === 0 };
}

const toolEditUrl = (projectId, toolId) => `${routes.tool(projectId, toolId)}?mode=EDIT`;

async function stopButtonVisible(page) {
  const stop = page.locator('button[aria-label="Stop"]').first();
  return (await stop.count().catch(() => 0)) ? stop.isVisible().catch(() => false) : false;
}

/** Wait for the applet agent to finish: Stop appears (it may already be gone for a trivial edit), then disappears. */
export async function waitForBuilderIdle(page, { timeoutMs = 300000, appearMs = 25000 } = {}) {
  const started = Date.now();
  let seenBusy = false;
  const appearBy = started + appearMs;
  let quiet = 0;
  while (Date.now() - started < timeoutMs) {
    const busy = await stopButtonVisible(page);
    if (busy) { seenBusy = true; quiet = 0; } else if (seenBusy || Date.now() > appearBy) { quiet += 1; if (quiet >= 2) return { seconds: Math.round((Date.now() - started) / 1000), sawBuilding: seenBusy }; }
    await page.waitForTimeout(3000);
  }
  throw new FlowError(ErrorCodes.GENERATION_TIMEOUT, `The tool builder was still working after ${Math.round(timeoutMs / 1000)}s. The tool may finish on its own: check My Tools.`);
}

async function builderState(page) {
  return page.evaluate(() => {
    const c = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const name = document.querySelector('flow-applet-view-header input.editable-text-input')?.value || null;
    const sidebar = c(document.querySelector('flow-applet-chat-sidebar')?.innerText || '');
    const tail = sidebar.replace(/\s*thumb_up thumb_down content_copy flag undo Restore\s*arrow_forward\s*$/, '').slice(-700);
    return { name, builder_message: tail, errorish: /something went wrong|couldn.t|try again|error occurred|quota|limit/i.test(sidebar.slice(-400)) };
  });
}

function assertNotLimited(page, text) {
  if (/daily (limit|quota)|reached (the|your) limit|too many (requests|tools)|quota/i.test(text || '')) {
    throw new FlowError(ErrorCodes.GOOGLE_LIMIT_REACHED, 'Flow reports a tool-creation or Agent quota limit. Stop and try again later.');
  }
}

/** Read every source file in the Code tab (clicks only file names, never the tool itself). */
export async function readToolCode(page) {
  await page.locator('button:has-text("Code")').first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const names = await page.evaluate(() => [...(document.querySelector('flow-applet-code-explorer')?.querySelectorAll('button,[role="treeitem"],li') || [])]
    .map((e) => (e.innerText || '').replace(/^\s*code\s*/i, '').trim()).filter((t) => /\.[a-z]{1,4}$/i.test(t)));
  const files = [...new Set(names)].slice(0, CODE_FILE_LIMIT);
  let all = '';
  for (const f of files) {
    const item = page.locator('flow-applet-code-explorer').locator('button, [role="treeitem"], li').filter({ hasText: f }).first();
    await item.click({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(500);
    const t = await page.evaluate(() => document.querySelector('flow-applet-code-explorer')?.innerText || '');
    all += `\n/* ===== ${f} ===== */\n${t.replace(/^[\s\S]*?\n(?=1\n)/, '').replace(/\n\d+\n/g, '\n')}`;
  }
  await page.locator('button:has-text("Preview")').first().click({ timeout: 4000 }).catch(() => {});
  return { files, source: all };
}

function finishReport(state, projectId, toolId, extra = {}) {
  return {
    tool_id: toolId, tool_name: state.name, project_id: projectId, url: toolEditUrl(projectId, toolId),
    builder_message: state.builder_message, builder_reported_problem: state.errorish,
    saved: 'automatic (Flow shows no Save button once the build ends)',
    ...extra,
  };
}

export async function handleCreateTool(args = {}) {
  const { prompt, credits_when_run } = validateToolPrompt(args.prompt);
  const page = getPage();
  const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
  const projectId = project.flowProjectId;
  await gotoFlow(page, routes.createTool(projectId), { waitMs: 2500 });

  const box = page.locator('.ProseMirror').first();
  await box.waitFor({ state: 'visible', timeout: 20000 }).catch(() => { throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, 'The create-tool prompt box did not appear.'); });
  await box.click();
  await page.keyboard.insertText(prompt);
  const send = page.locator('button[aria-label="Start generation"]').first();
  await page.waitForTimeout(500);
  if (await send.isDisabled().catch(() => true)) throw new FlowError(ErrorCodes.GENERATION_BUTTON_DISABLED, 'Start generation stayed disabled after typing the prompt.');
  logger.info('Creating Flow tool', { projectId, chars: prompt.length });
  await send.click();

  try {
    await page.waitForURL((u) => { const p = parseFlowUrl(u.href); return p.section === 'tool' && !!p.itemId; }, { timeout: 60000 });
  } catch {
    assertNotLimited(page, await page.evaluate(() => document.body.innerText.slice(-600)));
    throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, 'Flow did not open a new tool after Start generation.');
  }
  const toolId = parseFlowUrl(page.url()).itemId;
  const idle = await waitForBuilderIdle(page, { timeoutMs: (Number(args.timeout_seconds) || 300) * 1000 });

  let renamed = null;
  const wanted = args.tool_name ? String(args.tool_name).trim() : '';
  if (wanted) {
    const input = page.locator('flow-applet-view-header input.editable-text-input').first();
    if ((await input.inputValue().catch(() => '')) !== wanted) {
      await input.fill(wanted).catch(() => {});
      await input.press('Enter').catch(() => {});
      await page.waitForTimeout(1200);
    }
    renamed = (await input.inputValue().catch(() => '')) === wanted;
  }

  const state = await builderState(page);   // must be read while the builder page is still open
  let code = null;
  if (args.inspect_code !== false) {
    const read = await readToolCode(page).catch((e) => ({ files: [], source: '', error: e.message }));
    code = { files: read.files, ...scanToolCode(read.source) };
  }
  const myTools = await listToolCards(page, projectId, 'My Tools').catch(() => []);
  const report = finishReport(state, projectId, toolId, {
    status: 'tool_built', build_seconds: idle.seconds, renamed_to: wanted ? (renamed ? wanted : `FAILED to rename to "${wanted}"`) : null,
    appears_in_my_tools: myTools.some((t) => t.name && (wanted ? t.name === wanted : true)),
    credits_used: 0, credits_when_run, code_review: code,
    next: 'Test with fixture media only. Run it in ?mode=APP; read the footer before clicking anything that generates. Use flow_refine_tool for one change at a time.',
  });
  report.screenshot = await takeScreenshot(page, 'tool-built');
  return report;
}

async function openToolForEdit(page, args) {
  const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
  const projectId = project.flowProjectId;
  let toolId = args.tool_id ? assertUuid(args.tool_id, 'tool id') : null;
  if (!toolId && args.tool_name) {
    const mine = await listToolCards(page, projectId, 'My Tools');
    const wanted = String(args.tool_name).trim().toLowerCase();
    const match = mine.find((t) => t.name.toLowerCase() === wanted) || mine.find((t) => t.name.toLowerCase().includes(wanted));
    if (!match) throw new FlowError(ErrorCodes.INVALID_PARAMS, `No tool named "${args.tool_name}" in this project's My Tools.`, { available: mine.map((t) => t.name) });
    await page.locator('.applet-card').filter({ has: page.locator('.applet-name', { hasText: new RegExp(`^${match.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }) }).first().click();
    await page.waitForURL((u) => { const p = parseFlowUrl(u.href); return p.section === 'tool' && !!p.itemId; }, { timeout: 30000 });
    toolId = parseFlowUrl(page.url()).itemId;
  }
  if (!toolId) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Provide tool_id or tool_name (a tool already in this project\'s My Tools).');
  await gotoFlow(page, toolEditUrl(projectId, toolId), { waitMs: 4000 });
  return { projectId, toolId };
}

export async function handleRefineTool(args = {}) {
  const { prompt: message } = validateToolPrompt(args.message, { what: 'message' });
  const page = getPage();
  const { projectId, toolId } = await openToolForEdit(page, args);
  const box = page.locator('textarea[aria-label="Ask applet agent to make changes"]').first();
  await box.waitFor({ state: 'visible', timeout: 20000 }).catch(() => { throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, 'The Tool Builder message box did not appear (is the tool in Edit mode?).'); });
  await box.fill(message);
  await page.locator('button[aria-label="Send message"]').first().click();
  const idle = await waitForBuilderIdle(page, { timeoutMs: (Number(args.timeout_seconds) || 300) * 1000 });
  const state = await builderState(page);
  const anchor = message.replace(/\s+/g, ' ').slice(-40);
  const at = state.builder_message.lastIndexOf(anchor);
  if (at >= 0) state.builder_message = state.builder_message.slice(at + anchor.length).trim();   // only the agent's reply to this message
  const report = finishReport(state, projectId, toolId, {
    status: 'tool_refined', build_seconds: idle.seconds, credits_used: 0,
    next: 'The applet agent may change things you did not ask about: re-test, and Remix (More options) to snapshot a version before the next change.',
  });
  report.screenshot = await takeScreenshot(page, 'tool-refined');
  return report;
}

export async function handleInspectTool(args = {}) {
  const page = getPage();
  const { projectId, toolId } = await openToolForEdit(page, args);
  const read = await readToolCode(page);
  const state = await builderState(page);
  return {
    status: 'inspected', tool_id: toolId, tool_name: state.name, project_id: projectId, files: read.files,
    ...scanToolCode(read.source), characters_read: read.source.length,
    note: 'Static scan only. Flow documents no network restrictions for tools, so any flag or external URL deserves a human read before the tool sees real uploads.',
  };
}
