// Single source of truth for how the *current* Google Flow web UI (flow.google.com) is driven.
// Mapped against the live UI on 2026-10-16. Flow is now agent-first: every project has a chat-style
// prompt box ("What do you want to create?") whose "Start generation" button sends the prompt to an
// agent, which generates media using the "Agent settings" defaults (aspect ratio, count, model).
// Everything here is selector/route knowledge only; tools decide *whether* to spend credits.
import { get } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

export const FLOW_ORIGIN = 'https://flow.google.com';
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const UUID_RE = new RegExp(`^${UUID}$`, 'i');
const FLOW_PATH_RE = new RegExp(`^/project/(${UUID})(?:/(tools|create-tool|trash|character|scene|edit|tool)(?:/(${UUID}))?)?/?$`, 'i');

export const SEL = {
  promptBox: '[role="textbox"][aria-label="What do you want to create?"]',
  startGeneration: 'button[aria-label="Start generation"]',
  newSession: 'button[aria-label="Start new session"]',
  agentSettingsButton: 'button[aria-label="Settings"]:has-text("tune")',
  agentSettingsTitle: 'h2:has-text("Agent settings")',
  imageModelButton: 'button[aria-label="Image generation default model"]',
  videoModelButton: 'button[aria-label="Video generation default model"]',
  addMediaMenu: 'button[aria-label="Add media menu"]',
  addIngredients: 'button[aria-label="Add ingredients to the prompt box"]',
  tile: 'flow-grid-tile-container',
  downloadMedia: 'button[aria-label="Download media"], button[aria-label="Download scene"]',
  moveToTrash: 'button[aria-label="Move to trash"]',
  projectTitleInput: '.editable-text-container input',
  videoEditBox: '[role="textbox"][aria-label^="Describe how to edit this video"]',
  editorHistoryStep: 'flow-editor-history-step-video',
  editorHistoryPanel: 'flow-editor-history-panel',
  agentMessage: '.messages-list .agent-row .agent-message-content',
  characterPrompt: '[role="textbox"][aria-label="Describe your character…"]',
  characterModel: 'button[aria-label="Select model family"]',
  messageRow: '.messages-list .message-row',
};

export function assertUuid(value, label = 'id') {
  const text = String(value ?? '').trim();
  if (!UUID_RE.test(text)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Invalid ${label}: expected a UUID.`);
  return text.toLowerCase();
}

export const routes = {
  home: () => {
    const configured = get('flowUrl', `${FLOW_ORIGIN}/?pli=1`);
    try { if (new URL(configured).origin === FLOW_ORIGIN) return configured; } catch { /* fall through */ }
    return `${FLOW_ORIGIN}/?pli=1`;
  },
  project: (id) => `${FLOW_ORIGIN}/project/${assertUuid(id, 'project id')}`,
  tools: (id) => `${routes.project(id)}/tools`,
  createTool: (id) => `${routes.project(id)}/create-tool`,
  trash: (id) => `${routes.project(id)}/trash`,
  character: (id) => `${routes.project(id)}/character`,
  characterItem: (id, characterId) => `${routes.project(id)}/character/${assertUuid(characterId, 'character id')}`,
  scene: (id, sceneId) => `${routes.project(id)}/scene/${assertUuid(sceneId, 'scene id')}`,
  media: (id, mediaId) => `${routes.project(id)}/edit/${assertUuid(mediaId, 'media id')}`,
  tool: (id, toolId) => `${routes.project(id)}/tool/${assertUuid(toolId, 'tool id')}`,
};

/** Classify a URL. Never throws. kind: home | about | project | other | external | invalid */
export function parseFlowUrl(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return { kind: 'invalid', projectId: null, section: null, itemId: null }; }
  if (parsed.origin !== FLOW_ORIGIN) return { kind: 'external', projectId: null, section: null, itemId: null };
  if (parsed.pathname === '/' || parsed.pathname === '') return { kind: 'home', projectId: null, section: null, itemId: null };
  if (/^\/about\/?$/i.test(parsed.pathname)) return { kind: 'about', projectId: null, section: null, itemId: null };
  const match = FLOW_PATH_RE.exec(parsed.pathname);
  if (!match) return { kind: 'other', projectId: null, section: null, itemId: null };
  return { kind: 'project', projectId: match[1].toLowerCase(), section: (match[2] || 'project').toLowerCase(), itemId: match[3] ? match[3].toLowerCase() : null };
}

export function projectIdFromUrl(url) {
  const info = parseFlowUrl(url);
  return info.kind === 'project' ? info.projectId : null;
}

// ---- models / ratios / counts ------------------------------------------------------------------

export function stripEmoji(text) {
  return String(text ?? '').replace(/[^\p{L}\p{N}\s.:+\-/]/gu, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Model label as shown in a Flow menu, reduced to the bare model name. Retiring tiers render as two
 * lines ("Veo 3.1 - Fast\nLeaving Dec 5", re-mapped 2026-11-09); keep the first line and drop any
 * trailing "Leaving <date>" so they still match "Veo 3.1 - Fast".
 */
export function modelLabel(text) {
  const first = String(text ?? '').split('\n').map((s) => s.trim()).find(Boolean) ?? '';
  return stripEmoji(first).replace(/\s+Leaving\s+[A-Za-z]{3,9}\.?\s+\d{1,2}$/i, '').trim();
}

/** Resolve a user-supplied model name to the canonical UI label, or null. kind: 'image' | 'video'. */
export function resolveModel(kind, requested) {
  const base = kind === 'video' ? 'video' : 'image';
  const models = Object.keys(get(`${base}Models`, {}));
  const aliases = get(`${base}ModelAliases`, {});
  if (requested === undefined || requested === null || String(requested).trim() === '' || String(requested).toLowerCase() === 'auto') {
    return get(`${base}DefaultModel`, models[0] ?? null);
  }
  const norm = (value) => stripEmoji(value).toLowerCase();
  const wanted = norm(requested);
  const direct = models.find((model) => norm(model) === wanted);
  if (direct) return direct;
  const aliasKey = Object.keys(aliases).find((alias) => norm(alias) === wanted);
  return aliasKey ? aliases[aliasKey] : null;
}

export function resolveRatio(kind, requested, fallback) {
  const allowed = kind === 'video' ? get('videoRatios', ['16:9', '9:16']) : get('ratios', ['16:9', '4:3', '1:1', '3:4', '9:16']);
  const value = requested === undefined || requested === null || requested === '' ? fallback : String(requested).trim();
  return allowed.includes(value) ? value : null;
}

export function resolveCount(requested, fallback = 1) {
  const value = requested === undefined || requested === null || requested === '' ? fallback : Number(requested);
  return Number.isInteger(value) && value >= 1 && value <= 4 ? value : null;
}

// ---- navigation ---------------------------------------------------------------------------------

export async function gotoFlow(page, url, { waitMs = 1200 } = {}) {
  const origin = new URL(url).origin;
  if (origin !== FLOW_ORIGIN) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Refusing to navigate outside ${FLOW_ORIGIN}.`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(waitMs);
  if (new URL(page.url()).origin === 'https://accounts.google.com') {
    throw new FlowError(ErrorCodes.NOT_LOGGED_IN, 'Redirected to Google sign-in. Run scripts/login-flow.mjs to sign in manually.');
  }
}

export async function waitForVisible(page, selector, timeout = 20000, what = selector) {
  try {
    await page.locator(selector).first().waitFor({ state: 'visible', timeout });
  } catch {
    throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, `Expected Flow UI element not found: ${what}`);
  }
}

export async function openProject(page, projectId) {
  const info = parseFlowUrl(page.url());
  if (!(info.kind === 'project' && info.projectId === projectId && info.section === 'project')) {
    await gotoFlow(page, routes.project(projectId));
  }
  await waitForVisible(page, SEL.promptBox, 30000, 'project prompt box');
}

export async function goHome(page) {
  await gotoFlow(page, routes.home(), { waitMs: 800 });
  const info = parseFlowUrl(page.url());
  if (info.kind === 'about') {
    // The marketing landing sometimes answers the first load; retry once.
    await gotoFlow(page, `${FLOW_ORIGIN}/`, { waitMs: 1500 });
  }
  await waitForVisible(page, 'button:has-text("New project")', 30000, 'home "New project" button');
}

// ---- agent settings (persistent defaults used by the Flow agent) --------------------------------

export async function openAgentSettings(page) {
  if (await page.locator(SEL.agentSettingsTitle).first().isVisible().catch(() => false)) return;
  await waitForVisible(page, SEL.agentSettingsButton, 15000, 'agent settings (tune) button');
  await page.locator(SEL.agentSettingsButton).first().click();
  await waitForVisible(page, SEL.agentSettingsTitle, 10000, 'Agent settings panel');
  await page.waitForTimeout(400);
}

/** Read the open Agent settings panel. */
async function scrapeAgentSettings(page) {
  const data = await page.evaluate(({ imageSel, videoSel }) => {
    const imgBtn = document.querySelector(imageSel);
    const vidBtn = document.querySelector(videoSel);
    if (!imgBtn || !vidBtn) return null;
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const out = { image: { ratio: null, count: null, model: null }, video: { ratio: null, count: null, model: null }, confirmBeforeGenerating: null };
    for (const r of document.querySelectorAll('button[role="radio"]')) {
      const text = clean(r.innerText);
      const section = (imgBtn.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_PRECEDING) ? 'image'
        : (vidBtn.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_PRECEDING) ? 'video' : null;
      if (!section || r.getAttribute('aria-checked') !== 'true') continue;
      const ratio = text.match(/(\d+:\d+)/);
      const count = text.match(/^x(\d)$/);
      if (ratio) out[section].ratio = ratio[1];
      if (count) out[section].count = Number(count[1]);
    }
    out.image.model = clean(imgBtn.innerText.replace('arrow_drop_down', ''));
    out.video.model = clean(vidBtn.innerText.replace('arrow_drop_down', ''));
    const checked = document.querySelector('input[type="radio"][name^="mat-radio-group"]:checked');
    if (checked) out.confirmBeforeGenerating = checked.value === '1' ? 'always' : checked.value === '2' ? 'never' : checked.value;
    return out;
  }, { imageSel: SEL.imageModelButton, videoSel: SEL.videoModelButton });
  if (!data) throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, 'Could not read the Agent settings panel.');
  data.image.model = modelLabel(data.image.model);
  data.video.model = modelLabel(data.video.model);
  return data;
}

/** Cold page loads can briefly show default values before the saved ones arrive; wait until two reads agree. */
async function scrapeStable(page) {
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  let previous = JSON.stringify(await scrapeAgentSettings(page));
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await page.waitForTimeout(600);
    const current = JSON.stringify(await scrapeAgentSettings(page));
    if (current === previous) return JSON.parse(current);
    previous = current;
  }
  return JSON.parse(previous);
}

async function closeAgentSettings(page) {
  const open = await page.locator(SEL.agentSettingsTitle).first().isVisible().catch(() => false);
  if (!open) return;
  // "Back" returns to the chat; "Close" would collapse the whole agent panel.
  await waitForNoBackdrop(page);
  await page.locator('button[aria-label="Back"]').first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(400);
  if (await page.locator(SEL.agentSettingsTitle).first().isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}

export async function readAgentSettings(page) {
  await openAgentSettings(page);
  try {
    return await scrapeStable(page);
  } finally {
    await closeAgentSettings(page);
  }
}

async function clickRadio(page, section, kind, value) {
  const index = await page.evaluate(({ imageSel, videoSel, section: sec, kind: k, value: v }) => {
    const imgBtn = document.querySelector(imageSel);
    const vidBtn = document.querySelector(videoSel);
    const radios = [...document.querySelectorAll('button[role="radio"]')];
    return radios.findIndex((r) => {
      const inSection = sec === 'image'
        ? (imgBtn.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_PRECEDING)
        : !(imgBtn.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_PRECEDING) && (vidBtn.compareDocumentPosition(r) & Node.DOCUMENT_POSITION_PRECEDING);
      if (!inSection) return false;
      const text = (r.innerText || '').replace(/\s+/g, ' ').trim();
      return k === 'ratio' ? new RegExp(`(^|\\s)${v}$`).test(text) : text === `x${v}`;
    });
  }, { imageSel: SEL.imageModelButton, videoSel: SEL.videoModelButton, section, kind, value: String(value) });
  if (index < 0) throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, `Agent settings option not found: ${section} ${kind} ${value}`);
  await page.locator('button[role="radio"]').nth(index).click();
  await page.waitForTimeout(250);
}

/**
 * The project's AI session panel docks over the header tools container and covers the "+" (Add media)
 * button, so `uploadAsset`'s click waits 30 s and dies with "element is not visible" (9 Nov 2026:
 * S11-S24 all failed this way mid-run after a session panel opened). Close whatever panel is in the
 * way, then require the button to be visible before the caller clicks it.
 */
export async function ensureAddMediaVisible(page) {
  const target = page.locator(SEL.addMediaMenu).first();
  if (await target.isVisible().catch(() => false)) return;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
    if (await target.isVisible().catch(() => false)) return;
    const close = page.locator('[role="dialog"] button[aria-label="Close"], aside button[aria-label="Close"], .session-panel button[aria-label="Close"]').first();
    if (await close.isVisible().catch(() => false)) {
      await close.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    if (await target.isVisible().catch(() => false)) return;
  }
  throw new FlowError(ErrorCodes.FLOW_UI_CHANGED,
    'The "Add media" (+) button is not visible — a Flow side panel is probably open over the header. Close it (Close button) and retry.');
}

/**
 * Escaping a Flow menu leaves a `.cdk-overlay-backdrop-showing` layer in front of the page which
 * swallows the next click ("intercepts pointer events"). Wait for it to detach before continuing.
 */
export async function waitForNoBackdrop(page, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const showing = await page.locator('.cdk-overlay-backdrop-showing').count().catch(() => 0);
    if (!showing) return true;
    await page.waitForTimeout(200);
  }
  return false;
}

async function chooseModel(page, section, label) {
  const button = section === 'image' ? SEL.imageModelButton : SEL.videoModelButton;
  await waitForNoBackdrop(page);
  await page.locator(button).first().click();
  await page.waitForTimeout(400);
  const items = page.locator('button[role="menuitem"]');
  const texts = await items.allInnerTexts();
  const wanted = modelLabel(label).toLowerCase();
  const idx = texts.findIndex((text) => modelLabel(text).toLowerCase() === wanted);
  if (idx < 0) {
    await page.keyboard.press('Escape');
    await waitForNoBackdrop(page);
    throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Model "${label}" is not offered by Flow right now. Offered: ${texts.map(modelLabel).join(', ')}`);
  }
  await items.nth(idx).click();
  await page.waitForTimeout(300);
  await waitForNoBackdrop(page);
}

/**
 * Apply agent defaults. wanted = { image?: {ratio,count,model}, video?: {ratio,count,model} }.
 * Only differing values are touched; returns { before, after, changed }.
 */
export async function applyAgentSettings(page, wanted) {
  await openAgentSettings(page);
  try {
    const before = await scrapeStable(page);
    let changed = false;
    for (const section of ['image', 'video']) {
      const want = wanted?.[section];
      if (!want) continue;
      if (want.ratio && want.ratio !== before[section].ratio) { await clickRadio(page, section, 'ratio', want.ratio); changed = true; }
      if (want.count && want.count !== before[section].count) { await clickRadio(page, section, 'count', want.count); changed = true; }
      if (want.model && modelLabel(want.model).toLowerCase() !== modelLabel(before[section].model).toLowerCase()) { await chooseModel(page, section, want.model); changed = true; }
    }
    if (changed) {
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      await page.waitForTimeout(800);
      if (await page.locator(SEL.agentSettingsTitle).first().isVisible().catch(() => false)) await closeAgentSettings(page);
      const after = await readAgentSettings(page);
      for (const section of ['image', 'video']) {
        const want = wanted?.[section];
        if (!want) continue;
        const got = after[section];
        if ((want.ratio && got.ratio !== want.ratio) || (want.count && got.count !== want.count)
          || (want.model && got.model.toLowerCase() !== stripEmoji(want.model).toLowerCase())) {
          throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, `Agent settings did not persist for ${section}: wanted ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
        }
      }
      return { before, after, changed };
    }
    return { before, after: before, changed };
  } finally {
    await closeAgentSettings(page);
  }
}

// ---- prompt box / agent chat ----------------------------------------------------------------------

export async function startNewSession(page) {
  const rows = await page.locator(SEL.messageRow).count().catch(() => 0);
  if (rows === 0) return false;
  const button = page.locator(SEL.newSession).first();
  if (!(await button.isVisible().catch(() => false))) return false;
  await button.click();
  await page.waitForTimeout(800);
  return true;
}

export async function fillPrompt(page, text, selector = SEL.promptBox) {
  const box = page.locator(selector).first();
  await box.waitFor({ state: 'visible', timeout: 15000 });
  await box.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.insertText(text);
  await page.waitForTimeout(300);
  const normalise = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
  const typed = normalise(await box.innerText().catch(() => ''));
  if (!normalise(text).startsWith(typed.slice(0, 40)) || typed.length < Math.min(normalise(text).length, 10)) {
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(text, { delay: 8 });
    await page.waitForTimeout(300);
  }
  return normalise(await box.innerText().catch(() => ''));
}

export async function agentBusy(page) {
  return page.evaluate(() => [...document.querySelectorAll('button')]
    .some((b) => b.getBoundingClientRect().width > 0 && (b.innerText || '').trim() === 'stop')).catch(() => false);
}

export async function lastAgentReply(page) {
  return page.evaluate((sel) => {
    const nodes = [...document.querySelectorAll(sel)];
    const last = nodes[nodes.length - 1];
    return last ? last.innerText.replace(/\s+/g, ' ').trim().slice(0, 1500) : null;
  }, SEL.agentMessage).then((text) => (text === null ? null
    : text.replace(/\b(Show thinking|arrow_forward_ios|thumb_up|thumb_down|content_copy|flag)\b/g, ' ').replace(/\s+/g, ' ').trim()))
    .catch(() => null);
}

/** Visible buttons inside the latest agent message (e.g. a confirmation prompt). */
export async function agentMessageButtons(page) {
  return page.evaluate((sel) => {
    const nodes = [...document.querySelectorAll(sel)];
    const last = nodes[nodes.length - 1];
    if (!last) return [];
    return [...last.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width > 0)
      .map((b) => (b.innerText || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  }, SEL.agentMessage).catch(() => []);
}

/**
 * Options of the newest "permission" card ("Would you like me to kick off this 1 video generation,
 * costing 7 credits?"). Flow renders these as a `<flow-permission-message>` block whose choices are
 * `div[role="radio"]` with an `aria-label` of `Approve` / `Always approve` / `Reject` — **not**
 * `<button>` elements, so a button sweep finds nothing at all. An already-answered card is marked
 * `frozen` (`read-only` + `aria-disabled`), and Flow's choice is `checked`.
 * Returns [] when no card is on screen.
 */
export async function agentPermissionOptions(page) {
  return page.evaluate(() => {
    const frozen = (c) => {
      const opts = [...c.querySelectorAll('[role="radio"]')];
      return opts.length > 0 && opts.every((el) => el.classList.contains('read-only') || el.getAttribute('aria-disabled') === 'true');
    };
    const all = [...document.querySelectorAll('flow-permission-message')];
    // Chat history keeps already-answered (read-only) cards around; a live card must win, otherwise
    // a stale "Always approve" from an earlier run looks like the current answer.
    const card = [...all].reverse().find((c) => !frozen(c)) || all[all.length - 1];
    if (!card) return [];
    const title = (card.querySelector('.title')?.innerText || '').replace(/\s+/g, ' ').trim();
    return [...card.querySelectorAll('[role="radio"]')].map((el) => ({
      label: (el.getAttribute('aria-label') || el.innerText || '').replace(/\s+/g, ' ').trim(),
      checked: el.getAttribute('aria-checked') === 'true',
      frozen: el.classList.contains('read-only') || el.getAttribute('aria-disabled') === 'true',
      visible: el.getBoundingClientRect().width > 0,
      title,
    }));
  }).catch(() => []);
}

/**
 * Answer the newest *unanswered* permission card by clicking exactly one option.
 * Beware: Flow pre-selects `Always approve` in this card, and that selection rewrites the account's
 * "Confirm before generating" setting to `Never` (auto-spend). Never commit the card with a stray
 * Enter — click the precise option you mean.
 */
export async function clickPermissionOption(page, label) {
  const cards = page.locator('flow-permission-message');
  if ((await cards.count()) === 0) throw new Error('No permission card on screen');
  const card = cards.last();
  await card.getByRole('radio', { name: label, exact: true }).click({ timeout: 10000 });
  return label;
}

// ---- media grid ------------------------------------------------------------------------------------

/** Tiles of the project grid, newest first (Flow's default sort). */
export async function listTiles(page) {
  return page.evaluate(() => [...document.querySelectorAll('flow-grid-tile-container')].map((el, index) => {
    const typed = [...el.querySelectorAll('*')].find((n) => /^FLOW-.+-TILE$/.test(n.tagName));
    return {
      index,
      name: el.getAttribute('aria-label') || '',
      type: typed ? typed.tagName.replace(/^FLOW-/, '').replace(/-TILE$/, '').toLowerCase() : 'other',
      // "Queued" and a percentage are the only reliable in-progress signals; a video tile lazy-loads
      // its <video> element, so its absence must not be read as "still rendering".
      pending: /\b\d{1,3}\s*%/.test(el.innerText || '') || /\bqueued\b/i.test(el.innerText || '')
        || (!!el.querySelector('flow-image-tile') && !el.querySelector('img')),
      hasVideo: !!el.querySelector('video'),
    };
  })).catch(() => []);
}

/** Number of result images in the agent's replies ("Option N" thumbnails). */
export async function agentOptionCount(page) {
  return page.locator(`${SEL.messageRow} img[alt^="Option"]`).count().catch(() => 0);
}

/** Open the index-th agent result in the media editor (/edit/<id>); returns the media id. */
export async function openAgentOption(page, index) {
  const option = page.locator(`${SEL.messageRow} img[alt^="Option"]`).nth(index);
  await option.scrollIntoViewIfNeeded().catch(() => {});
  await option.click({ timeout: 10000 });
  await page.waitForURL((url) => /\/edit\/[0-9a-f-]{36}/i.test(url.pathname), { timeout: 20000 });
  await page.waitForTimeout(1200);
  return parseFlowUrl(page.url()).itemId;
}

export async function openTile(page, index) {
  await page.locator(SEL.tile).nth(index).scrollIntoViewIfNeeded().catch(() => {});
  await page.locator(SEL.tile).nth(index).click({ timeout: 10000 });
  await page.waitForURL((url) => /\/(edit|scene)\/[0-9a-f-]{36}/i.test(url.pathname), { timeout: 20000 });
  const info = parseFlowUrl(page.url());
  await page.waitForTimeout(1200);
  return info.itemId;
}

/** Download the media shown in the current detail view via Flow's own Download menu. */
export async function downloadCurrentMedia(page, destDir, baseName, { quality = 'original' } = {}) {
  const saveTo = async (download, option) => {
    const ext = path.extname(download.suggestedFilename()) || '.bin';
    fs.mkdirSync(destDir, { recursive: true });
    const dest = path.join(destDir, `${baseName}${ext}`);
    await download.saveAs(dest);
    logger.info('Downloaded media', { dest, option });
    return { path: dest, option, suggested: download.suggestedFilename() };
  };

  await waitForVisible(page, SEL.downloadMedia, 15000, 'Download button');
  // The image viewer keeps its download control in a hotbar that only appears on hover, so wake the
  // toolbar first and then click whichever download control is actually visible.
  await page.locator('img, video').first().hover().catch(() => {});
  await page.waitForTimeout(700);
  let clickedPrimary = null;
  for (const candidate of [SEL.downloadMedia, 'button[aria-label="Download"]']) {
    const control = page.locator(candidate).first();
    if ((await control.count()) && (await control.isVisible().catch(() => false))) {
      await control.click({ timeout: 10000 }).catch(() => {});
      clickedPrimary = candidate;
      break;
    }
  }
  if (!clickedPrimary) await page.locator(SEL.downloadMedia).first().click();
  logger.info('Clicked the download control', { clickedPrimary });
  // The menu renders a beat later (an image editor is slower than a clip's).
  let texts = [];
  for (let attempt = 0; attempt < 10; attempt += 1) {
    await page.waitForTimeout(600);
    texts = await page.locator('button[role="menuitem"]').allInnerTexts();
    if (texts.length) break;
  }

  if (!texts.length) {
    // An image opened in /edit/<id> has a plain `Download` control that saves straight away, with no
    // quality menu — the "Download media" one only shows a tooltip there.
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
    const direct = page.locator('button[aria-label="Download"]').first();
    if (!(await direct.count())) throw new FlowError(ErrorCodes.DOWNLOAD_FAILED, 'Download menu is empty and no direct Download control was found.');
    await page.locator('img, video').first().hover().catch(() => {});
    await page.waitForTimeout(700);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 90000 }),
      direct.click({ timeout: 12000, force: await direct.isVisible().catch(() => false) === false }),
    ]);
    return saveTo(download, 'direct download');
  }

  const items = page.locator('button[role="menuitem"]');
  const wanted = String(quality).toLowerCase();
  let idx = texts.findIndex((t) => (wanted === 'original' ? /original/i.test(t) : t.toLowerCase().includes(wanted)));
  if (idx < 0) idx = 0;
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 90000 }),
    items.nth(idx).click(),
  ]);
  return saveTo(download, texts[idx].replace(/\s+/g, ' ').trim());
}

// ---- tool (applet) iframes ---------------------------------------------------------------------------

/** Flow tools run in sandboxed blob iframes on *.scf.usercontent.goog. Returns the app frame or null. */
export async function getToolFrame(page, { timeoutMs = 25000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (frame === page.mainFrame() || !/\.scf\.usercontent\.goog/.test(frame.url())) continue;
      const interactive = await frame.locator('button, textarea, input, select').count().catch(() => 0);
      if (interactive > 0) return frame;
    }
    await page.waitForTimeout(500);
  }
  return null;
}

// ---- reference images (ingredients) ---------------------------------------------------------------------

// The accept filters Flow itself puts on its file choosers (header "+ > Upload":
// ".png,.jpg,.jpeg,.webp,.gif,.heif,.heic,.mp4,.m4v,.mov,.3gp,.avi"; scene "Upload media": video only).
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heif', '.heic']);
const VIDEO_EXT = new Set(['.mp4', '.m4v', '.mov', '.3gp', '.avi']);
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const VIDEO_MIME = {
  '.mov': 'video/quicktime', '.m4v': 'video/x-m4v', '.3gp': 'video/3gpp', '.avi': 'video/x-msvideo',
};
const IMAGE_MIME = { '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.heif': 'image/heif', '.heic': 'image/heic' };
export const ADD_TO_PROMPT = /^\s*Add to prompt\s*$/i;
// 2026-11-10: the prompt box is now an Angular ProseMirror editor inside
// `flow-creative-agent-prompt-box` (the old `.agent-panel-prompt-box` container is gone from this build).
// Attached ingredients render as `flow-ingredient-chip.reference-ingredient-chip` -> `flow-image-ingredient-chip`
// -> `button.chip-container[aria-label="Ingredient"]` -> `img.chip-image[alt="Ingredient image"]`.
// The old container-scoped selectors therefore matched nothing and every reference image reported
// "Could not attach" even though the chip was visibly attached. Match the chip element itself, and keep the
// legacy scopes so older builds still work.
const INGREDIENT_CHIP = 'flow-ingredient-chip img[alt="Ingredient image"], flow-image-ingredient-chip img[alt="Ingredient image"], .agent-panel-prompt-box img[alt="Ingredient image"]';
/** Ingredient chips in the agent prompt box: an image asset renders img[alt="Ingredient image"],
 *  a video asset renders its own preview (img[alt="Ingredient video"] or a <video>). Counting any of
 *  them is how attachment is verified. */
const INGREDIENT_CHIP_ANY = `${INGREDIENT_CHIP}, flow-ingredient-chip video, flow-ingredient-chip img[alt="Ingredient video"], .agent-panel-prompt-box img[alt="Ingredient video"], .agent-panel-prompt-box video`;

/** 'image' | 'video' | null for a local asset path — decides upload limits and mime types. */
export function assetKind(file) {
  const ext = path.extname(String(file ?? '')).toLowerCase();
  if (IMAGE_EXT.has(ext)) return 'image';
  if (VIDEO_EXT.has(ext)) return 'video';
  return null;
}

/**
 * Video uploads raise a one-time rights attestation ("Rights to use this video ... Cancel / I agree,
 * do not show again / I agree") and the upload stalls until it is answered. The account holder has
 * approved answering it permanently, so click the "do not show again" variant and never Cancel.
 */
export async function acceptUploadConsent(page) {
  const specific = page.locator('button:has-text("I agree, do not show again")').first();
  const generic = page.locator('button:has-text("I agree")').first();
  const target = (await specific.isVisible().catch(() => false)) ? specific
    : ((await generic.isVisible().catch(() => false)) ? generic : null);
  if (!target) return false;
  await target.click({ timeout: 8000 }).catch(() => {});
  logger.info('Answered Flow\'s upload rights dialog with "I agree, do not show again"');
  await page.waitForTimeout(1500);
  return true;
}

/** Does this project-grid tile label refer to the asset we uploaded? Flow keeps the hashed name for
 *  images but may relabel an uploaded video, so exact name, content-hash prefix and original file name
 *  all count. */
export function matchesUploadedAsset(tileName, { name, hashPrefix, baseName } = {}) {
  const tile = String(tileName || '');
  if (!tile) return false;
  return tile === name || (!!hashPrefix && tile.includes(hashPrefix)) || (!!baseName && tile.includes(baseName));
}

/**
 * Upload a local asset into the project through the header "+ > Upload" chooser. The chooser already
 * accepts images and video, so no conversion is needed:
 *   images  .png .jpg .jpeg .webp .gif .heif .heic   (max 20 MB)
 *   videos  .mp4 .m4v .mov .3gp .avi                 (max 200 MB, transcoded on Flow's side)
 * The stored name is content-hash prefixed, so the same file is never uploaded twice.
 * Returns { name, kind, abs, baseName, hashPrefix }.
 */
export async function uploadAsset(page, file) {
  const abs = path.resolve(String(file));
  const stat = fs.existsSync(abs) ? fs.statSync(abs) : null;
  if (!stat || !stat.isFile()) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Asset not found: ${abs}`);
  const kind = assetKind(abs);
  if (!kind) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS,
      `Unsupported asset type ${path.extname(abs)} — use an image (jpg/jpeg/png/webp/gif/heif/heic) or a video (mp4/m4v/mov/3gp/avi).`);
  }
  const limit = kind === 'video' ? MAX_VIDEO_BYTES : MAX_UPLOAD_BYTES;
  if (stat.size > limit) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS, `Asset is larger than ${Math.round(limit / 1024 / 1024)} MB: ${abs}`);
  }
  const buffer = fs.readFileSync(abs);
  const baseName = path.basename(abs);
  const name = `${crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 8)}_${baseName}`.slice(0, 100);
  const hashPrefix = name.slice(0, 8);
  const ext = path.extname(abs).toLowerCase();
  const mimeType = kind === 'video' ? (VIDEO_MIME[ext] || 'video/mp4') : (IMAGE_MIME[ext] || 'image/jpeg');
  const asset = { name, kind, abs, baseName, hashPrefix };
  const tileState = async () => (await listTiles(page)).filter((tile) => matchesUploadedAsset(tile.name, asset));

  if ((await tileState()).filter((tile) => !tile.pending).length > 0) return asset;   // already in the project

  await ensureAddMediaVisible(page);
  await page.locator(SEL.addMediaMenu).first().click();
  await page.waitForTimeout(500);
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }),
    page.locator('button[role="menuitem"]:has-text("Upload")').first().click(),
  ]);
  await chooser.setFiles({ name, mimeType, buffer });
  await page.waitForTimeout(2000);
  await acceptUploadConsent(page).catch(() => {});
  // Flow transcodes videos on upload, which takes minutes; images settle in seconds.
  const deadline = Date.now() + (kind === 'video' ? 240000 : 90000);
  let ready = false;
  while (Date.now() < deadline) {
    await page.waitForTimeout(1500);
    const state = await tileState();
    ready = state.length > 0 && state.every((tile) => !tile.pending);
    if (ready) break;
    await acceptUploadConsent(page).catch(() => {});   // the dialog can also appear mid-upload
  }
  if (!ready) {
    const seen = (await listTiles(page)).map((t) => t.name).join(', ') || 'none';
    throw new FlowError(ErrorCodes.DOWNLOAD_FAILED, `Upload of ${baseName} did not finish in time (assets in project: ${seen}).`);
  }
  logger.info('Uploaded asset to Flow', { name, kind, bytes: buffer.length });
  return asset;
}

/** Open a project asset in Flow's viewer by the name used at upload time; returns its media id. */
export async function openMediaByName(page, asset) {
  const tiles = await listTiles(page);
  const tile = tiles.find((t) => matchesUploadedAsset(t.name, asset));
  if (!tile) throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, `Uploaded asset ${asset.name} is not in the project grid.`);
  return openTile(page, tile.index);
}

/**
 * Upload local assets to the project and attach them to the agent prompt as ingredients (open the
 * ingredients picker, click the asset; Flow attaches it immediately). Images and videos both work.
 * Returns [{ name, kind }] for the assets that ended up attached.
 */
export async function attachReferenceImages(page, files) {
  const list = (Array.isArray(files) ? files : [files]).filter(Boolean).slice(0, 4);
  const attached = [];
  for (const file of list) {
    const asset = await uploadAsset(page, file);
    const chipsBefore = await page.locator(INGREDIENT_CHIP_ANY).count();
    await page.locator(SEL.addIngredients).first().click();
    await page.locator('[role="option"]').first().waitFor({ state: 'visible', timeout: 10000 });
    // The picker fills in progressively (first option appears before the rest), so poll for our asset
    // instead of reading the list once.
    let names = [];
    let idx = -1;
    for (let attempt = 0; attempt < 16 && idx < 0; attempt += 1) {
      names = (await page.locator('[role="option"]').allInnerTexts()).map((t) => t.split("\n")[0].trim());
      idx = names.indexOf(asset.name);
      if (idx < 0) idx = names.findIndex((t) => matchesUploadedAsset(t, asset));
      if (idx < 0) await page.waitForTimeout(500);
    }
    if (idx < 0) {
      // The picker lists a limited window of recent assets; once a project has many, ours may be outside it.
      // Its search box (placeholder "Search assets") finds it by name.
      const search = page.locator('input[placeholder*="Search assets" i], input[aria-label*="Search assets" i]').first();
      if (await search.isVisible().catch(() => false)) {
        await search.fill(asset.baseName.replace(/\.[^.]+$/, ''));
        for (let attempt = 0; attempt < 12 && idx < 0; attempt += 1) {
          await page.waitForTimeout(600);
          names = (await page.locator('[role="option"]').allInnerTexts()).map((t) => t.split("\n")[0].trim());
          idx = names.indexOf(asset.name);
          if (idx < 0) idx = names.findIndex((t) => matchesUploadedAsset(t, asset));
        }
      }
    }
    if (idx < 0) {
      throw new FlowError(ErrorCodes.FLOW_UI_CHANGED,
        `Uploaded asset ${asset.name} not found in the ingredients picker (saw: ${names.slice(0, 8).join(' | ') || 'nothing'}).`);
    }
    await page.locator('[role="option"]').nth(idx).click();
    await page.waitForTimeout(1000);
    // Newer Flow builds show a preview of the picked asset with an "Add to prompt" button instead of attaching on
    // the first click (seen 2026-10-17, 2nd run in a project). Older behaviour attached immediately: handle both.
    if ((await page.locator(INGREDIENT_CHIP_ANY).count()) <= chipsBefore) {
      const addBtn = page.locator('button').filter({ hasText: ADD_TO_PROMPT }).first();
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1200);
      }
    }
    if ((await page.locator(INGREDIENT_CHIP_ANY).count()) <= chipsBefore) {
      throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, `Could not attach ${asset.name} to the prompt.`);
    }
    attached.push({ name: asset.name, kind: asset.kind });
  }
  return attached;
}

/** Replace the value of a text input/textarea (select-all first, then type, then blur). */
export async function replaceFieldText(page, selector, text, { commit = 'Tab' } = {}) {
  const field = page.locator(selector).first();
  await field.waitFor({ state: 'visible', timeout: 10000 });
  await field.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.insertText(text);
  await page.keyboard.press(commit);
  await page.waitForTimeout(800);
  return field.inputValue().catch(() => null);
}

/** Pick an item from an open Flow menu by its emoji-stripped label. */
export async function chooseMenuItem(page, label) {
  const items = page.locator('button[role="menuitem"]');
  const texts = await items.allInnerTexts();
  const wanted = modelLabel(label).toLowerCase();
  const idx = texts.findIndex((t) => modelLabel(t).toLowerCase() === wanted);
  if (idx < 0) {
    await page.keyboard.press('Escape');
    throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `"${label}" is not offered. Offered: ${texts.map(stripEmoji).join(', ')}`);
  }
  await items.nth(idx).click();
  await page.waitForTimeout(300);
}
