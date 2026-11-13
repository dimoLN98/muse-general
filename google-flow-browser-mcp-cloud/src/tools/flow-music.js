import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { analyseTrack } from './beat-sync.js';

// Playwright driver for Google Flow Music (https://www.flowmusic.app, model Lyria 3.5). It is a SEPARATE app from
// Google Flow: its own tab, its own credits (Settings menu shows "N credits"), its own library. Everything below was
// verified live on 2026-10-17 on plan PLUS (see docs/research/flow-music-ui-map.md for the full map and evidence).
//
// What matters for callers:
//  - Lyria has NO real length/tempo/structure parameters. The "Advanced" toggle only appends ", <bpm> bpm" to the
//    sound text and "[End - m:ss]" to the lyrics. Length is clamped to 1:00-3:00 and overshoots by ~4-10 %. Without it
//    tracks are 1:55-3:00 long. Tempo 120 is honoured (measured 120.0); 90 and 100 were NOT (120.0 and 105).
//  - The reliable way to a short, beat-aligned loop/sting is: generate -> download WAV (free) -> cut locally at the
//    beat grid with shortenTrack()/trimTrack() (sample-exact) or use the in-app Remix > Trim (0.1 s steps, 0 credits).
//  - Costs measured: 5 credits per generated song from the compose panel, 10 per Producer chat prompt (2 takes);
//    Trim, Download (all formats), Split stems and the Simple/Modern video templates cost 0 credits on this plan.
//
// The tab MUST be a window of our own (the Google Flow tab is driven by another agent): openMusicWindow() does that.
// Functions take a Playwright `page` that is on flowmusic.app. No dependency beyond what the repo already has.
const FFMPEG = process.env.FLOW_FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FLOW_FFPROBE || 'ffprobe';
export const MUSIC_ORIGIN = 'https://www.flowmusic.app';
export const LENGTH_MIN_SEC = 60;       // [live] Advanced > Length clamps to 1:00..3:00 on blur
export const LENGTH_MAX_SEC = 180;
export const DOWNLOAD_FORMATS = ['WAV', 'MP3', 'M4A'];   // [live] menu items under song "..." > Download

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rx = (s) => new RegExp(`^${String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

// ---------------------------------------------------------------------------------------------------------------
// Pure helpers (unit-testable without a browser)
// ---------------------------------------------------------------------------------------------------------------

/** Pure: "1:02.5" | "2:30" | "45" | 62.5 -> seconds (number) or NaN. */
export function parseTime(value) {
  if (typeof value === 'number') return value;
  const m = String(value ?? '').trim().match(/^(?:(\d+):)?(\d+(?:\.\d+)?)$/);
  if (!m) return NaN;
  return (m[1] ? Number(m[1]) * 60 : 0) + Number(m[2]);
}

/** Pure: seconds -> "m:ss" (or "m:ss.t" with tenths, the format the Trim dialog uses). */
export function formatTime(sec, { tenths = false } = {}) {
  const total = Math.max(0, Number(sec) || 0);
  const t = Math.round(total * 10) / 10;
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  // strip a zero tenth only: "0:16.0" -> "0:16", but keep "0:15.9"
  if (tenths) return `${m}:${s.toFixed(1).padStart(4, '0')}`.replace(/\.0$/, '');
  return `${m}:${String(Math.floor(s + 1e-9)).padStart(2, '0')}`;
}

/** Pure: clamp a requested length to what the Advanced > Length field accepts. Returns { text, seconds, clamped }. */
export function normalizeLength(sec) {
  const n = parseTime(sec);
  if (!Number.isFinite(n)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unreadable length: ${sec}`);
  const seconds = Math.min(LENGTH_MAX_SEC, Math.max(LENGTH_MIN_SEC, Math.round(n)));
  return { text: formatTime(seconds), seconds, clamped: seconds !== Math.round(n) };
}

/**
 * Pure: compose a Lyria sound prompt from structured fields. Lyria reads plain English; these phrasings are the ones
 * that produced a kick on the first beat and a steady grid in live tests. NOTE: length/structure words are hints only
 * ([live] "[End - 0:16]" and "total length 16 seconds" were ignored: 2:19 came back), so the brief is for style; cut to
 * length afterwards with shortenTrack().
 */
export function buildMusicPrompt(brief = {}) {
  const {
    genre, mood, instruments, bpm, key, noVocals = true, startOnBeat1 = true, noFadeIn = true,
    endOnDownbeat = true, steadyTempo = true, brand, extra,
  } = brief;
  const parts = [];
  if (genre) parts.push(genre);
  if (noVocals) parts.push('instrumental, no vocals, no lyrics');
  const inst = Array.isArray(instruments) ? instruments.filter(Boolean).join(', ') : instruments;
  if (inst) parts.push(inst);
  if (mood) parts.push(`${mood} mood`);
  if (key) parts.push(`in ${key}`);
  if (steadyTempo) parts.push('steady tempo, no tempo changes, no swing, 4/4');
  if (startOnBeat1) parts.push('starts with the kick on the very first beat, no silent intro');
  if (noFadeIn) parts.push('no fade-in, no riser before the beat');
  if (endOnDownbeat) parts.push('ends cleanly on a downbeat');
  if (brand) parts.push(brand);
  if (extra) parts.push(extra);
  if (bpm) parts.push(`${Math.round(bpm)} bpm`);
  const text = parts.join(', ');
  if (text.length > 3000) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Sound prompt exceeds the 3000 character limit of the Sound field.');
  return text;
}

/**
 * Pure: pick the cut for a beat-aligned excerpt. `firstBeat` is the time (s) of the first kick, `bpm` the measured
 * tempo. Returns { start, duration, end, beats, bars }. start = firstBeat + startBar bars - preRoll so the kick lands
 * ~preRoll seconds after the cut (clean start, no pre-silence). duration = whole bars (or `beats`) at the measured bpm, so the excerpt is a seamless loop length.
 */
export function planBeatAlignedTrim({ firstBeat = 0, bpm, durationSec, targetSec, bars, beats, beatsPerBar = 4, startBar = 0, preRollSec = 0.015 } = {}) {
  if (!(bpm > 0)) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'bpm is required.');
  const beatLen = 60 / bpm;
  let nBeats = beats;
  if (!nBeats && bars) nBeats = bars * beatsPerBar;
  if (!nBeats && targetSec) nBeats = Math.max(beatsPerBar, Math.round(targetSec / beatLen / beatsPerBar) * beatsPerBar);
  if (!nBeats) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Give bars, beats or targetSec.');
  const start = Math.max(0, firstBeat + startBar * beatsPerBar * beatLen - preRollSec);
  const duration = nBeats * beatLen;   // whole beats from the cut: the excerpt loops with no phase slip
  if (durationSec && start + duration > durationSec + 1e-6) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Cut ${start.toFixed(3)}+${duration.toFixed(3)} s runs past the ${durationSec.toFixed(3)} s source.`);
  return { start: round3(start), duration: round3(duration), end: round3(start + duration), beats: nBeats, bars: nBeats / beatsPerBar };
}
const round3 = (n) => Math.round(n * 1000) / 1000;

/** Pure: ffmpeg argument list for a sample-accurate excerpt with tiny edge fades (kills clicks, keeps the transient). */
export function buildTrimArgs({ input, output, start = 0, duration, fadeInSec = 0.004, fadeOutSec = 0.04, keepVideo = false }) {
  if (!input || !output || !(duration > 0)) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'input, output and a positive duration are required.');
  const filters = [];
  if (fadeInSec > 0) filters.push(`afade=t=in:st=0:d=${fadeInSec}`);
  if (fadeOutSec > 0) filters.push(`afade=t=out:st=${round3(Math.max(0, duration - fadeOutSec))}:d=${fadeOutSec}`);
  const args = ['-v', 'error', '-y', '-ss', String(start), '-i', input, '-t', String(duration), '-map', '0:a'];
  if (keepVideo) args.push('-map', '0:v?');
  if (filters.length) args.push('-af', filters.join(','));
  if (/\.wav$/i.test(output)) args.push('-c:a', 'pcm_s16le');
  args.push(output);
  return args;
}

/** Pure: safe file stem from a song title ("Untitled (trim 0:00-0:16)" -> "Untitled_trim_0_00-0_16"). */
export function safeName(title) {
  return String(title || 'track').replace(/[^\w.\-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'track';
}

// ---------------------------------------------------------------------------------------------------------------
// Local audio helpers (ffmpeg / ffprobe)
// ---------------------------------------------------------------------------------------------------------------
function run(cmd, args) {
  try { return execFileSync(cmd, args, { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] }).toString(); }
  catch (e) { throw new FlowError(ErrorCodes.OPERATION_FAILED, `${path.basename(cmd)} failed: ${(e.stderr || e.message || '').toString().split('\n').filter(Boolean).slice(-3).join(' | ')}`); }
}

/** Measure an audio file with ffprobe (first audio stream; WAV downloads also carry an mjpeg cover stream). */
export function probeAudio(file) {
  const out = JSON.parse(run(FFPROBE, ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name,sample_rate,channels,bit_rate,duration:format=duration,size', '-of', 'json', file]));
  const s = out.streams?.[0] || {};
  return {
    codec: s.codec_name, sampleRate: Number(s.sample_rate) || null, channels: s.channels ?? null,
    durationSec: Number(s.duration || out.format?.duration) || null, bitRate: Number(s.bit_rate) || null, bytes: Number(out.format?.size) || null,
  };
}

/** Cut `input` to `output` with sample accuracy. Returns { output, ...probeAudio }. */
export function trimTrack(opts) {
  fs.mkdirSync(path.dirname(path.resolve(opts.output)), { recursive: true });
  run(FFMPEG, buildTrimArgs(opts));
  return { output: opts.output, ...probeAudio(opts.output) };
}

/**
 * Beat-aligned excerpt of a downloaded track, fully local and free: measures tempo + first kick with beat-sync's
 * analyseTrack, then cuts `bars`/`beats`/`targetSec` worth of whole bars starting on the first kick.
 * [live] gen4 (120.0 BPM) -> 16.000 s / 48 kHz stereo, kick at +0.07 s.
 */
export function shortenTrack({ input, output, targetSec, bars, beats, startBar = 0, bpm, firstBeat, preRollSec, fadeOutSec, useDownbeat = false } = {}) {
  const info = analyseTrack(input);
  const grid = useDownbeat && info.beats[info.downbeat_offset] != null ? info.beats[info.downbeat_offset] : info.first_beat;
  const useBpm = bpm || info.raw_bpm;
  const plan = planBeatAlignedTrim({
    firstBeat: firstBeat ?? grid, bpm: useBpm, durationSec: info.duration, targetSec, bars, beats, startBar, preRollSec,
  });
  const result = trimTrack({ input, output, start: plan.start, duration: plan.duration, fadeOutSec });
  return { plan, analysis: { bpm: info.bpm, rawBpm: info.raw_bpm, firstBeat: info.first_beat, sourceDurationSec: info.duration }, ...result };
}

// ---------------------------------------------------------------------------------------------------------------
// Browser: window + page helpers
// ---------------------------------------------------------------------------------------------------------------

/**
 * Open (or reuse) OUR OWN Chrome window on flowmusic.app, so we never fight the Google Flow tab for focus.
 * [live] Target.createTarget { newWindow: true } works on the shared CDP Chrome. Never touches flow.google.com pages.
 */
export async function openMusicWindow(browser, { url = `${MUSIC_ORIGIN}/`, width = 1500, height = 950 } = {}) {
  const ctx = browser.contexts()[0];
  if (!ctx) throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, 'No browser context on the CDP connection.');
  const existing = ctx.pages().filter((p) => p.url().includes('flowmusic.app')).pop();
  if (existing) return existing;
  const before = new Set(ctx.pages());
  const bs = await browser.newBrowserCDPSession();
  await bs.send('Target.createTarget', { url, newWindow: true, width, height });
  for (let i = 0; i < 60; i += 1) {
    const page = ctx.pages().find((p) => !before.has(p) && p.url().includes('flowmusic.app'));
    if (page) { await page.waitForLoadState('domcontentloaded').catch(() => {}); return page; }
    await sleep(250);
  }
  throw new FlowError(ErrorCodes.FLOW_PAGE_NOT_FOUND, 'The Flow Music window did not appear.');
}
export const getMusicPage = openMusicWindow;

/** Close our Flow Music window (only ever a flowmusic.app page). */
export async function closeMusicWindow(browser, page) {
  if (!page.url().includes('flowmusic.app')) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Refusing to close a page that is not flowmusic.app.');
  const cs = await page.context().newCDPSession(page);
  const { targetInfo } = await cs.send('Target.getTargetInfo');
  const bs = await browser.newBrowserCDPSession();
  await bs.send('Target.closeTarget', { targetId: targetInfo.targetId });
}

/** Navigate (SPA) to a Flow Music path and wait for the shell. Detects the Google sign-in wall. */
export async function gotoMusic(page, route = '/session') {
  await page.goto(`${MUSIC_ORIGIN}${route}`, { waitUntil: 'domcontentloaded' });
  // 2026-11-02 re-map: the sidebar no longer renders `a[href="/library/my-songs"]`; the live shell marker is the
  // "New session" button (sidebar: New session / Songs / Playlists / Spaces / ...). Old anchor kept as a fallback.
  await page.locator('button[aria-label="New session"], a[href="/library/my-songs"], button[aria-label="Toggle compose panel"]')
    .first().waitFor({ timeout: 20000 }).then(() => dismissCookieBanner(page)).catch(() => {
      if (/accounts\.google\.com/.test(page.url())) throw new FlowError(ErrorCodes.NOT_LOGGED_IN, 'Flow Music wants a Google sign-in; stop and ask the user.');
      throw new FlowError(ErrorCodes.UNKNOWN_UI_CHANGE, 'Flow Music shell (sidebar) did not render.');
    });
  await sleep(1200);
}

/** Dismiss Google's cookie-consent banner if it is covering the app (it intercepts clicks). [live 2026-11-02] */
export async function dismissCookieBanner(page) {
  const btn = page.locator('button:has-text("No thanks"), button:has-text("Agree")').first();
  if (await btn.count().catch(() => 0)) {
    await btn.click({ timeout: 2000 }).catch(() => {});
    await sleep(600);
  }
}

/** Current credit balance. [live] Settings menu (button[aria-label="Settings menu"]) item "10505 credits". That value is
 *  cached by the SPA and lagged 1-3 generations behind in tests, so `fresh: true` reads /settings ("10505 available",
 *  authoritative) and navigates back. Default is the cheap menu read. */
export async function getCredits(page, { fresh = false } = {}) {
  if (fresh) {
    const back = page.url();
    await gotoMusic(page, '/settings');
    const text = await page.evaluate(() => document.body.innerText);
    await gotoMusic(page, back.replace(MUSIC_ORIGIN, '') || '/session');
    const m = text.match(/([\d,]+)\s+available/i);
    return m ? Number(m[1].replace(/,/g, '')) : null;
  }
  await page.locator('button[aria-label="Settings menu"]').click();
  await sleep(600);
  const text = await page.evaluate(() => [...document.querySelectorAll('[role=menuitem]')].map((e) => e.innerText).find((t) => /credits/i.test(t)) || '');
  await page.keyboard.press('Escape');
  const m = text.match(/([\d,]+)\s+credits/i);
  return m ? Number(m[1].replace(/,/g, '')) : null;
}

/** Songs visible on the current page (session / library): [{ id, title, href }] in DOM order, de-duplicated by id. */
export async function listSongs(page) {
  const rows = await page.evaluate(() => {
    const seen = new Set();
    const out = [];
    document.querySelectorAll('a[href^="/song/"]').forEach((a) => {
      const id = a.getAttribute('href').split('/song/')[1];
      const title = (a.getAttribute('aria-label') || a.innerText || '').trim();
      if (!id || !title || seen.has(id)) return;
      seen.add(id);
      out.push({ id, title, href: a.getAttribute('href') });
    });
    return out;
  });
  return rows.map((r, index) => ({ index, ...r }));
}

/** Locator for one song's row (the container that owns its "More options" button). */
function songRow(page, id) {
  return page.locator(`xpath=(//a[@href="/song/${id}"])[1]/ancestor::div[.//button[starts-with(@aria-label,"More options")]][1]`);
}

async function resolveSong(page, { songId, title, takeIndex }) {
  const songs = await listSongs(page);
  if (songId) return songId;
  if (title) { const hit = songs.filter((s) => s.title === title).pop(); if (hit) return hit.id; }
  if (Number.isInteger(takeIndex)) { const hit = songs.at(takeIndex); if (hit) return hit.id; }
  throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Pass songId, title, or takeIndex (index into listSongs(); -1 = newest).');
}

/** Open a song's "..." menu. Falls back to the Songs library if the song is not on this page. */
async function openSongMenu(page, id) {
  let row = songRow(page, id);
  if (!(await row.count())) { await gotoMusic(page, '/library/my-songs'); row = songRow(page, id); }
  if (!(await row.count())) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Song ${id} not found on this page or in the library.`);
  await row.scrollIntoViewIfNeeded();
  await row.hover();
  await sleep(250);
  await row.locator('button[aria-label^="More options"]').first().click();
  await page.locator('[role=menu]').first().waitFor({ timeout: 5000 });
  await sleep(250);
}
const menuItem = (page, text) => page.locator('[role=menu] [role=menuitem]', { hasText: rx(text) }).first();

/** Whether a generation is in flight: a "NN%" leaf node ("Generating Untitled...") is rendered while it runs. */
async function generating(page) {
  return page.evaluate(() => [...document.querySelectorAll('*')].some((e) => e.children.length === 0 && /^\d+%$/.test((e.textContent || '').trim())));
}

async function setSwitch(page, label, want) {
  const sw = page.locator(`button[role="switch"][aria-label="${label}"]`);
  const on = (await sw.getAttribute('aria-checked')) === 'true';
  if (on !== want) { await sw.click(); await sleep(400); }
}

async function toastText(page) {
  return page.evaluate(() => [...document.querySelectorAll('[data-sonner-toast],[role=alert],[role=status]')].map((e) => e.innerText.trim()).filter(Boolean).join(' | '));
}

// ---------------------------------------------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------------------------------------------

/**
 * Generate a track from the Compose panel (1 song, 5 credits, ~20 s) or the Producer chat (2 takes, 10 credits).
 *   { prompt, instrumental = true, lyrics, advanced: { bpm, length, seed }, via = 'compose' | 'chat',
 *     newSession = true, timeoutSec = 180 }
 * Verified selectors (live):
 *   compose toggle  button[aria-label="Toggle compose panel"] (panel is open when textarea[aria-label="Sound description"] is visible)
 *   instrumental    button[role=switch][aria-label="Toggle instrumental mode"]   (Lyrics textarea[aria-label="Lyrics"] when off)
 *   advanced        button[role=switch][aria-label="Toggle advanced sound mode"] -> inputs after labels BPM / Length / Seed (placeholder "Auto")
 *   generate        button containing text "Generate" (Ctrl+Enter also works)
 *   chat            textarea[aria-label="Chat message"] + button[aria-label="Send message"]
 *   progress        a leaf text node "NN%" next to "Generating Untitled..." while running; URL becomes /session/<uuid>
 * Returns { sessionUrl, takes: [{ index, id, title }], creditsBefore, creditsAfter, elapsedSec, completion, appliedAdvanced }.
 */
export async function generateTrack(page, {
  prompt, instrumental = true, lyrics, advanced, via = 'compose', newSession = true, timeoutSec = 180,
} = {}) {
  const text = String(prompt || '').trim();
  if (!text) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'prompt is required.');
  if (newSession || !page.url().includes('flowmusic.app/session')) await gotoMusic(page, '/session');
  const creditsBefore = await getCredits(page, { fresh: true }).catch(() => null);
  const before = new Set((await listSongs(page)).map((s) => s.id));
  const applied = {};
  const t0 = Date.now();

  if (via === 'chat') {
    await page.fill('textarea[aria-label="Chat message"]', text);
    await page.locator('button[aria-label="Send message"]').click();
  } else {
    const sound = page.locator('textarea[aria-label="Sound description"]');
    if (!(await sound.isVisible())) {
      await page.locator('button[aria-label="Toggle compose panel"], button[aria-label="Open compose panel"]').first().click();
      await sound.waitFor({ state: 'visible', timeout: 8000 });
    }
    await setSwitch(page, 'Toggle instrumental mode', Boolean(instrumental));
    if (!instrumental && lyrics) await page.fill('textarea[aria-label="Lyrics"]', lyrics);
    const wantAdv = Boolean(advanced && (advanced.bpm || advanced.length || advanced.seed));
    await setSwitch(page, 'Toggle advanced sound mode', wantAdv);
    await sound.fill(text);
    if (wantAdv) {
      if (advanced.bpm) { const f = page.locator('label:text-is("BPM") ~ input').first(); await f.fill(String(Math.round(advanced.bpm))); applied.bpm = await f.inputValue(); }
      if (advanced.length) {
        const f = page.locator('label:text-is("Length") ~ input').first();
        const n = normalizeLength(advanced.length);
        await f.fill(n.text); await page.keyboard.press('Tab'); applied.length = await f.inputValue();
      }
      if (advanced.seed) { const f = page.locator('label:text-is("Seed") ~ div input, label:text-is("Seed") ~ input').first(); await f.fill(String(advanced.seed)); applied.seed = await f.inputValue(); }
    }
    await page.locator('button:has-text("Generate")').last().click();
  }

  // Completion: a new song id exists AND no "NN%" progress node remains for 3 consecutive polls.
  let calm = 0;
  let newOnes = [];
  while ((Date.now() - t0) / 1000 < timeoutSec) {
    await sleep(1500);
    const songs = await listSongs(page);
    newOnes = songs.filter((s) => !before.has(s.id));
    const busy = await generating(page);
    calm = newOnes.length && !busy ? calm + 1 : 0;
    if (calm >= 2) break;
  }
  if (!newOnes.length || calm < 2) {
    throw new FlowError(ErrorCodes.GENERATION_TIMEOUT, `No finished song after ${timeoutSec}s. Banner/toast: ${(await toastText(page)) || 'none'}`, { newOnes });
  }
  const creditsAfter = await getCredits(page, { fresh: true }).catch(() => null);
  return {
    sessionUrl: page.url(), via,
    takes: newOnes.map((s, i) => ({ index: i, id: s.id, title: s.title })),
    creditsBefore, creditsAfter, appliedAdvanced: applied,
    elapsedSec: Math.round((Date.now() - t0) / 100) / 10,
    completion: 'new /song/ link present and no NN% progress node for 3 s',
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Download / edit / stems
// ---------------------------------------------------------------------------------------------------------------

/**
 * Download one song through "..." > Download > WAV|MP3|M4A and measure it with ffprobe.
 *   { songId | title | takeIndex, format = 'WAV', outDir, name, stripCover = true }
 * [live] WAV = 48 kHz stereo 16-bit PCM (+ an mjpeg cover stream that stripCover removes); MP3 = 48 kHz 128 kbps (NOT 320);
 * M4A = AAC ~120 kbps 48 kHz. 2-6 s, 0 credits. The Playwright 'download' event must be armed BEFORE the click.
 * Returns { path, format, songId, durationSec, sampleRate, channels, bytes, suggestedFilename }.
 */
export async function downloadTrack(page, { songId, title, takeIndex, format = 'WAV', outDir, name, stripCover = true } = {}) {
  const fmt = String(format).toUpperCase();
  if (!DOWNLOAD_FORMATS.includes(fmt)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `format must be one of ${DOWNLOAD_FORMATS.join(', ')}`);
  if (!outDir) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'outDir is required.');
  const id = await resolveSong(page, { songId, title, takeIndex });
  fs.mkdirSync(outDir, { recursive: true });
  await openSongMenu(page, id);
  await menuItem(page, 'Download').hover();
  await sleep(500);
  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: 120000 }),
    menuItem(page, fmt).click(),
  ]);
  const ext = fmt.toLowerCase();
  const file = path.join(outDir, `${name || safeName(dl.suggestedFilename().replace(/\.\w+$/, ''))}.${ext}`);
  await dl.saveAs(file);
  if (fmt === 'WAV' && stripCover) {
    const tmp = `${file}.tmp.wav`;
    run(FFMPEG, ['-v', 'error', '-y', '-i', file, '-map', '0:a', '-c', 'copy', tmp]);
    fs.renameSync(tmp, file);
  }
  return { path: file, format: fmt, songId: id, suggestedFilename: dl.suggestedFilename(), ...probeAudio(file) };
}

/**
 * In-app trim (Remix > Trim): free, instant, creates a NEW library song titled "<title> (trim a-b)".
 * Start/End accept m:ss or m:ss.t (tenths). [live] 0:00.4-0:16.4 on a 2:18 track gave exactly 16.000 s.
 * Dialog: [role=dialog] "Trim Song", inputs[0]=Start, inputs[1]=End, buttons Cancel / Trim. Returns { newSong }.
 */
export async function trimInApp(page, { songId, title, takeIndex, start, end } = {}) {
  const a = parseTime(start); const b = parseTime(end);
  if (!(b > a)) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'end must be greater than start.');
  const id = await resolveSong(page, { songId, title, takeIndex });
  const before = new Set((await listSongs(page)).map((s) => s.id));
  await openSongMenu(page, id);
  await menuItem(page, 'Remix').hover();
  await sleep(500);
  await menuItem(page, 'Trim').click();
  const dlg = page.locator('[role=dialog]').first();
  await dlg.waitFor({ timeout: 8000 });
  const [S, E] = [dlg.locator('input').nth(0), dlg.locator('input').nth(1)];
  // [live] the dialog resets Start/End to the full range once the waveform has loaded; fill only after End shows a real duration
  for (let i = 0; i < 40; i += 1) {
    const v = await E.inputValue();
    if (parseTime(v) > 0 && v !== '0:00') break;
    await sleep(250);
  }
  await sleep(1000);
  let shown = {};
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await E.fill(formatTime(b, { tenths: true })); await page.keyboard.press('Tab'); await sleep(250);   // end first: start is clamped below end
    await S.fill(formatTime(a, { tenths: true })); await page.keyboard.press('Tab'); await sleep(400);
    shown = { start: await S.inputValue(), end: await E.inputValue() };
    if (Math.abs(parseTime(shown.start) - a) < 0.051 && Math.abs(parseTime(shown.end) - b) < 0.051) break;
    if (attempt === 2) throw new FlowError(ErrorCodes.OPERATION_FAILED, `Trim fields would not hold ${start}-${end}; dialog shows ${shown.start}-${shown.end}.`);
  }
  await dlg.locator('button:text-is("Trim")').click();
  let created = [];
  for (let i = 0; i < 20 && !created.length; i += 1) {
    await sleep(1000);
    created = (await listSongs(page)).filter((s) => !before.has(s.id));
  }
  if (!created.length) throw new FlowError(ErrorCodes.OPERATION_FAILED, 'Trim finished without a new song appearing.');
  return { shown, newSong: created[created.length - 1] };
}

/**
 * Split a song into stems (Producer-side action, 0 credits observed) and download the zip.
 * [live] "..." > Split stems posts a Producer chat message, shows "Splitting stems..." and after ~13 s a stems card with
 * Drums / Bass / Other / Vocals rows (M/S buttons, "Options for <stem> track" menu) and a download button whose
 * TITLE (not aria-label) is "Download tracks (zip)". Zip = 4 x AAC .m4a, 48 kHz stereo, same duration as the song.
 * Returns { zip, files: [paths] (unzipped with the system `unzip` when present), stems: [names] }.
 */
export async function splitStems(page, { songId, title, takeIndex, outDir, timeoutSec = 120, unzip = true } = {}) {
  if (!outDir) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'outDir is required.');
  const id = await resolveSong(page, { songId, title, takeIndex });
  const zipButtons = page.locator('[title="Download tracks (zip)"]');
  const already = await zipButtons.count();
  await openSongMenu(page, id);
  await menuItem(page, 'Split stems').click();
  const t0 = Date.now();
  await sleep(2500);
  while ((Date.now() - t0) / 1000 < timeoutSec) {
    const busy = await page.evaluate(() => /Splitting stems/.test(document.body.innerText));
    if (!busy && (await zipButtons.count()) > already) break;
    await sleep(2000);
  }
  if ((await zipButtons.count()) <= already) throw new FlowError(ErrorCodes.GENERATION_TIMEOUT, `Stems did not appear within ${timeoutSec}s.`);
  fs.mkdirSync(outDir, { recursive: true });
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), zipButtons.last().click()]);
  const zip = path.join(outDir, safeName(dl.suggestedFilename().replace(/\.zip$/, '')) + '.zip');
  await dl.saveAs(zip);
  const files = [];
  if (unzip) {
    const dir = zip.replace(/\.zip$/, '');
    try { run('unzip', ['-o', '-q', zip, '-d', dir]); fs.readdirSync(dir).forEach((f) => files.push(path.join(dir, f))); } catch { /* unzip missing: zip is still returned */ }
  }
  return { songId: id, zip, files, stems: files.map((f) => path.basename(f)), elapsedSec: Math.round((Date.now() - t0) / 100) / 10 };
}

/**
 * Download the vertical (720x1280, 24 fps, H.264 + AAC) "Simple"/"Modern"/"Player" template video for a song.
 * [live] "..." > Download > Download video opens a [role=dialog] "Pick a template to create your video"
 * (Music video / Modern / Player / Simple); Simple rendered and downloaded in ~37 s, 0 credits on PLUS, video is the
 * audio length + ~2.5 s. "Music video" (AI video) is credit-priced per the dialog text and is deliberately not offered here.
 */
export async function downloadVideo(page, { songId, title, takeIndex, template = 'Simple', outDir, name, timeoutSec = 150 } = {}) {
  if (!['Simple', 'Modern', 'Player'].includes(template)) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'template must be Simple, Modern or Player (AI "Music video" can spend credits).');
  if (!outDir) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'outDir is required.');
  const id = await resolveSong(page, { songId, title, takeIndex });
  fs.mkdirSync(outDir, { recursive: true });
  await openSongMenu(page, id);
  await menuItem(page, 'Download').hover();
  await sleep(500);
  await menuItem(page, 'Download video').click();
  const dlg = page.locator('[role=dialog]').first();
  await dlg.waitFor({ timeout: 8000 });
  const t0 = Date.now();
  const [dl] = await Promise.all([
    page.waitForEvent('download', { timeout: timeoutSec * 1000 }),
    dlg.getByText(template, { exact: true }).first().click(),
  ]);
  const file = path.join(outDir, `${name || safeName(dl.suggestedFilename().replace(/\.\w+$/, ''))}.mp4`);
  await dl.saveAs(file);
  const v = JSON.parse(run(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,duration', '-of', 'json', file])).streams?.[0] || {};
  return { path: file, songId: id, template, width: v.width, height: v.height, fps: v.r_frame_rate, durationSec: Number(v.duration) || null, elapsedSec: Math.round((Date.now() - t0) / 100) / 10 };
}

// ---------------------------------------------------------------------------------------------------------------
// MCP tool handlers
//
// These were dispatched by src/index.js from the beginning but never defined, so every flow_music_* tool threw
// `ReferenceError: handleMusicGenerate is not defined` at call time (found 12 Nov 2026 while triaging
// a V076 blocker; the driver below them was live and tested, only the wrapper layer was missing).
// Each handler connects to the browser the same way the other tools do and closes only the music window it opened.
// ---------------------------------------------------------------------------------------------------------------

async function withMusicWindow(fn) {
  const { getBrowser } = await import('../browser/connect.js');
  const browser = getBrowser();
  if (!browser) throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, 'Browser not connected. Call flow_connect first.');
  const page = await openMusicWindow(browser);
  try {
    return await fn(page);
  } finally {
    await closeMusicWindow(browser, page).catch(() => {});
  }
}

export async function handleMusicGenerate(args = {}) {
  const prompt = args.prompt && String(args.prompt).trim()
    ? String(args.prompt)
    : buildMusicPrompt({
        genre: args.genre, mood: args.mood, instruments: args.instruments, bpm: args.bpm, key: args.key,
        targetSec: args.target_sec, avoid: args.avoid,
      });
  if (!prompt) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'genre or prompt is required.');
  const advanced = {};
  if (args.bpm) advanced.bpm = args.bpm;
  if (args.length_sec) advanced.length = args.length_sec;
  if (args.seed) advanced.seed = args.seed;
  return withMusicWindow((page) => generateTrack(page, {
    prompt,
    instrumental: args.instrumental !== false,
    lyrics: args.lyrics,
    advanced,
    via: args.via || 'compose',
    timeoutSec: args.timeout_sec || 180,
  }));
}

export async function handleMusicDownload(args = {}) {
  const { getOutputDir } = await import('../utils/file-manager.js');
  return withMusicWindow((page) => downloadTrack(page, {
    songId: args.song_id,
    title: args.title,
    takeIndex: args.take,
    format: args.format || 'WAV',
    outDir: args.out_dir || getOutputDir('music'),
    name: args.name,
  }));
}

export async function handleMusicShorten(args = {}) {
  if (!args.input) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'input is required.');
  const output = args.output || args.input.replace(/(\.[^.]+)?$/, '.short.wav');
  if (output === args.input) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'output must differ from input.');
  return shortenTrack({
    input: args.input, output,
    targetSec: args.target_sec, bars: args.bars, beats: args.beats,
    bpm: args.bpm, startBar: args.start_bar || 0,
  });
}

export async function handleMusicSongs() {
  return withMusicWindow(async (page) => {
    const songs = await listSongs(page);
    return { count: songs.length, songs };
  });
}

export async function handleMusicTrim(args = {}) {
  return withMusicWindow((page) => trimInApp(page, {
    songId: args.song_id, title: args.title, takeIndex: args.take,
    start: args.start, end: args.end,
  }));
}

export async function handleMusicStems(args = {}) {
  const { getOutputDir } = await import('../utils/file-manager.js');
  const base = args.out_dir || getOutputDir('music');
  return withMusicWindow((page) => splitStems(page, {
    songId: args.song_id, title: args.title, takeIndex: args.take,
    outDir: path.join(base, 'stems'),
  }));
}
