// Beat-2 generation driver for card t_db33f5c7 (V076 Git Push, worn scenario).
// Drives the CURRENT Flow project UI (settings panel redesigned ~12 Nov 2026) over CDP 9334.
// Reuses the google-flow MCP's Playwright helpers for the parts that still work (prompt box, ingredients,
// tile listing, download menu) and implements the new settings panel itself.
//
//   node gen_beat2.mjs --settings            # set model/ratio/length/resolution/count, print the credit estimate
//   node gen_beat2.mjs --generate            # settings + refs + prompt + send + wait + download
//   node gen_beat2.mjs --settings --model "Omni 1.2 Flash"
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {
  SEL, routes, waitForVisible, listTiles, openTile, downloadCurrentMedia, fillPrompt,
  attachReferenceImages, agentBusy, agentPermissionOptions, clickPermissionOption,
  agentMessageButtons, lastAgentReply, gotoFlow, startNewSession,
} from './src/navigation/flow-ui.js';
import { ensureProjectInContext } from './src/navigation/project-navigator.js';

const CARD = '/home/you/Documents/Acme/05_Ops/cards/rework-V076-worn-scenario-20261111';
const WORK = path.join(CARD, 'work');
const OUT = path.join(WORK, 'beats');
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };

const MODEL = arg('--model', 'Veo 3.1 - Lite');
const RATIO = arg('--ratio', '9:16');
const LENGTH = Number(arg('--length', '8'));
const COUNT = Number(arg('--count', '1'));
const RESOLUTION = arg('--resolution', '720p');
const PROMPT_FILE = arg('--prompt', path.join(WORK, 'prompt_v1.txt'));
const REFS = (arg('--refs', '') || '').split(',').filter(Boolean);
const TAG = arg('--tag', 'A');

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

const PANE = '.cdk-overlay-pane:has(.toggle-text)';

async function paneVisible(page) {
  return page.locator(PANE).first().isVisible().catch(() => false);
}

async function openSettings(page) {
  if (await paneVisible(page)) return;
  await page.locator('button[aria-label="Settings trigger"]').first().click({ timeout: 15000 });
  await page.locator(`${PANE} .toggle-text`).first().waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(400);
}

async function readPanel(page) {
  return page.evaluate((paneSel) => {
    const pane = [...document.querySelectorAll('.cdk-overlay-pane')].find((p) => p.querySelector('.toggle-text'));
    if (!pane) return null;
    const radios = [...pane.querySelectorAll('button[role="radio"]')];
    const state = { checked: {}, all: [] };
    for (const r of radios) {
      const t = (r.innerText || '').replace(/\s+/g, ' ').trim();
      state.all.push(t);
      if (r.getAttribute('aria-checked') === 'true') state.checked[t] = true;
    }
    const modelBtn = pane.querySelector('button[aria-label="Select model family"]');
    state.model = modelBtn ? (modelBtn.innerText || '').replace(/\s+/g, ' ').replace('arrow_drop_down', '').trim() : null;
    const dur = pane.querySelector('.duration-slider-value');
    state.length = dur ? dur.innerText.trim() : null;
    const slider = pane.querySelector('[role="slider"]');
    state.slider = slider ? { now: slider.getAttribute('aria-valuenow'), min: slider.getAttribute('aria-valuemin'), max: slider.getAttribute('aria-valuemax'), text: slider.getAttribute('aria-valuetext') } : null;
    const credit = pane.querySelector('.credit-cost-link');
    state.credits = credit ? credit.innerText.trim() : null;
    state.text = (pane.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 500);
    return state;
  });
}

async function clickToggle(page, label) {
  const clicked = await page.evaluate((text) => {
    const pane = [...document.querySelectorAll('.cdk-overlay-pane')].find((p) => p.querySelector('.toggle-text'));
    if (!pane) return 'no-pane';
    const r = [...pane.querySelectorAll('button[role="radio"]')]
      .find((b) => (b.innerText || '').replace(/\s+/g, ' ').trim() === text);
    if (!r) return 'not-found';
    if (r.getAttribute('aria-checked') === 'true') return 'already';
    r.click();
    return 'clicked';
  }, label);
  await page.waitForTimeout(350);
  if (clicked === 'not-found' || clicked === 'no-pane') throw new Error(`toggle not found: ${label} (${clicked})`);
  log('toggle', label, '->', clicked);
}

async function chooseModel(page, label) {
  const now = await readPanel(page);
  if (clean(now.model).toLowerCase() === clean(label).toLowerCase()) { log('model already', label); return; }
  await page.locator(`${PANE} button[aria-label="Select model family"]`).first().click();
  await page.waitForTimeout(900);
  const items = await page.evaluate(() => [...document.querySelectorAll('[role="menuitem"]')]
    .filter((e) => e.offsetParent !== null)
    .map((e) => (e.innerText || '').replace(/\s+/g, ' ').trim()));
  log('model menu:', JSON.stringify(items));
  const idx = items.findIndex((t) => clean(t).toLowerCase() === clean(label).toLowerCase());
  if (idx < 0) throw new Error(`model "${label}" not offered. Offered: ${items.join(' | ')}`);
  await page.locator('[role="menuitem"]').nth(idx).click();
  await page.waitForTimeout(800);
  const after = await readPanel(page);
  log('model now:', after.model);
}

async function setLength(page, seconds) {
  for (let attempt = 0; attempt < 14; attempt += 1) {
    const st = await readPanel(page);
    const nowSec = st.slider && st.slider.now ? Number(st.slider.now) : null;
    if (nowSec === seconds) { log('length ok', st.length); return; }
    const slider = page.locator(`${PANE} [role="slider"]`).first();
    const box = await slider.boundingBox();
    if (!box) throw new Error('length slider not found');
    const min = Number(st.slider?.min ?? 4), max = Number(st.slider?.max ?? 8);
    const frac = max > min ? (seconds - min) / (max - min) : 1;
    await page.mouse.click(box.x + Math.min(box.width - 2, Math.max(2, box.width * frac)), box.y + box.height / 2);
    await page.waitForTimeout(300);
    // keyboard nudge if the click did not land
    const st2 = await readPanel(page);
    if (Number(st2.slider?.now) !== seconds) {
      await slider.focus().catch(() => {});
      const delta = seconds - Number(st2.slider?.now ?? min);
      const key = delta > 0 ? 'ArrowRight' : 'ArrowLeft';
      for (let i = 0; i < Math.abs(delta); i += 1) { await page.keyboard.press(key); await page.waitForTimeout(120); }
    }
  }
  throw new Error('could not set length');
}

async function configure(page) {
  await openSettings(page);
  await clickToggle(page, 'videocam Video');
  await clickToggle(page, 'chrome_extension Ingredients');   // reference-image mode
  await clickToggle(page, `crop_${RATIO.replace(':', '_')} ${RATIO}`);
  await chooseModel(page, MODEL);
  if (!(await page.evaluate((t)=>[...document.querySelectorAll('.cdk-overlay-pane button[role="radio"]')].some(b=>(b.innerText||'').replace(/\s+/g,' ').trim()===t), RESOLUTION))) log('no', RESOLUTION, 'toggle for this model (Veo Lite is fixed)'); else await clickToggle(page, RESOLUTION);
  const hasSlider = await page.locator(`${PANE} [role="slider"]`).count();
  if (hasSlider) await setLength(page, LENGTH); else log('no length slider for this model: fixed length, prompt carries the length');
  await clickToggle(page, `x${COUNT}`);
  const st = await readPanel(page);
  log('PANEL STATE', JSON.stringify({ checked: st.checked, model: st.model, length: st.length, credits: st.credits }, null, 1));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  const chip = await page.locator('button[aria-label="Settings trigger"]').first().innerText().catch(() => '');
  log('composer chip:', clean(chip));
  return st;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
  let page = null;
  for (const c of browser.contexts()) for (const p of c.pages()) if (p.url().includes('flow.google.com')) page = p;
  if (!page) throw new Error('no Flow page on CDP 9334');
  await page.bringToFront().catch(() => {});
  log('page', page.url());

  const project = await ensureProjectInContext(page, { campaign: 'v076-gitpush-worn-scenario' });
  log('project', JSON.stringify(project));
  await page.waitForTimeout(1500);

  const st = await configure(page);
  if (!has('--generate')) {
    const out = { project, panel: st, model: MODEL, ratio: RATIO, length: LENGTH, count: COUNT, resolution: RESOLUTION };
    fs.writeFileSync(path.join(WORK, `settings_${TAG}.json`), JSON.stringify(out, null, 1));
    log('settings-only: nothing sent, 0 credits');
    process.exit(0);
  }

  // ---- references ----
  const attached = REFS.length ? await attachReferenceImages(page, REFS) : [];
  log('attached', JSON.stringify(attached));

  // ---- prompt ----
  const basePrompt = fs.readFileSync(PROMPT_FILE, 'utf8').trim();
  const prompt = `${basePrompt}\n\nVideo length: ${LENGTH} seconds.`;
  const typed = await fillPrompt(page, prompt);
  log('typed chars', typed.length);

  const before = await listTiles(page);
  log('tiles before', before.length);
  const send = page.locator(SEL.startGeneration).first();
  if (!(await send.isVisible().catch(() => false)) || (await send.isDisabled().catch(() => true))) {
    throw new Error('Start generation button missing/disabled');
  }
  const jobStarted = new Date().toISOString();
  await send.click();
  log('SENT at', jobStarted);

  const timeoutMs = Number(arg('--timeout_ms', '900000'));
  const started = Date.now();
  let idle = 0, confirmClicked = null, finished = false, stillRendering = false;
  while (Date.now() - started < timeoutMs) {
    await page.waitForTimeout(3000);
    const busy = await agentBusy(page);
    const tiles = await listTiles(page);
    const fresh = tiles.slice(0, Math.max(0, tiles.length - before.length)).filter((t) => t.type === 'video');
    const pending = fresh.some((t) => t.pending);
    if (busy || pending) { idle = 0; continue; }
    const perms = (await agentPermissionOptions(page)).filter((o) => !o.frozen && o.visible);
    const offered = perms.length ? perms.map((o) => o.label) : await agentMessageButtons(page);
    const approve = offered.find((l) => /^approve$/i.test(clean(l)));
    if (approve && !confirmClicked) {
      if (perms.some((o) => o.label === approve)) await clickPermissionOption(page, approve);
      else await page.locator(`${SEL.agentMessage} button`).filter({ hasText: approve }).last().click();
      confirmClicked = approve;
      log('answered permission card', approve);
      idle = 0;
      continue;
    }
    idle += 1;
    const ready = fresh.filter((t) => !t.pending);
    if (ready.length > 0 && idle >= 2) { finished = true; break; }
    if (idle >= 6 && fresh.length > 0) { stillRendering = true; break; }
    if (idle >= 6 && fresh.length === 0) break;
  }
  const reply = await lastAgentReply(page);
  log('agent reply:', (reply || '').slice(0, 400));
  log('finished', finished, 'stillRendering', stillRendering);

  const after = await listTiles(page);
  const fresh = after.slice(0, Math.max(0, after.length - before.length)).filter((t) => t.type === 'video');
  const ready = fresh.filter((t) => !t.pending);
  log('fresh video tiles', JSON.stringify(fresh));

  const files = [];
  for (let i = 0; i < Math.min(ready.length, COUNT); i += 1) {
    await gotoFlow(page, routes.project(project.flowProjectId));
    await waitForVisible(page, SEL.tile, 20000, 'project media grid');
    const mediaId = await openTile(page, ready[i].index);
    const saved = await downloadCurrentMedia(page, OUT, `beat2_${TAG}_${i + 1}`, { quality: 'original' });
    log('downloaded', JSON.stringify(saved), 'mediaId', mediaId);
    files.push({ path: saved.path, mediaId, tile: ready[i] });
  }
  await gotoFlow(page, routes.project(project.flowProjectId));
  fs.writeFileSync(path.join(WORK, `gen_${TAG}.json`), JSON.stringify({
    model: MODEL, ratio: RATIO, length: LENGTH, count: COUNT, resolution: RESOLUTION,
    refs: REFS, attached, prompt, project, jobStarted, confirmClicked, files,
    agent_reply: reply, panel_credits: st.credits,
  }, null, 1));
  log('DONE', files.map((f) => f.path).join(', '));
  process.exit(files.length ? 0 : 3);
})().catch((e) => { console.error('ERR', e.message); process.exit(2); });
