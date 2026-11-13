import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
import { chromium } from 'playwright-core';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { getOutputDir } from '../utils/file-manager.js';
import { logger } from '../utils/logger.js';

// Local motion graphics: kinetic type, brand badges, line callouts, karaoke captions, beat pulses and end cards are
// drawn by assets/motion/overlay.html (a deterministic function of time t), screenshotted frame by frame in a
// SEPARATE headless Chrome (never the signed-in Flow profile), and composited over a video with ffmpeg. Free, local.
// All positions are fractions of a 1080x1920 design space; times are seconds, or beats when `beats` is given.
const FFMPEG = process.env.FLOW_FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FLOW_FFPROBE || 'ffprobe';
const CHROME = process.env.FLOW_RENDER_CHROME || '/opt/google/chrome/chrome';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const OVERLAY_HTML = path.resolve(HERE, '../../assets/motion/overlay.html');
// 9:16 platform safe area in the 1080x1920 design space: top 14%, bottom 35% (UI chrome), sides 6%
export const SAFE_ZONE = { left: 65, right: 1015, top: 270, bottom: 1248 };

function run(cmd, args) {
  try { return execFileSync(cmd, args, { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] }).toString(); }
  catch (e) { throw new FlowError(ErrorCodes.OPERATION_FAILED, `${path.basename(cmd)} failed: ${(e.stderr || e.message || '').toString().split('\n').filter(Boolean).slice(-3).join(' | ')}`); }
}

export function probeVideo(file) {
  const j = JSON.parse(run(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration', '-of', 'json', file]));
  const s = j.streams[0];
  const [n, d] = String(s.r_frame_rate).split('/').map(Number);
  return { width: s.width, height: s.height, fps: d ? n / d : n, duration: Number(j.format.duration) };
}

/** Convert beat-based times to seconds. beats = { bpm, start } where start is the second at which beat 0 falls. */
export function resolveTimes(items, beats) {
  const bl = beats && beats.bpm > 0 ? 60 / beats.bpm : 0;
  const start = Number(beats?.start) || 0;
  const toS = (b) => start + b * bl;
  return items.map((it) => {
    const o = { ...it };
    if (bl && o.beat0 !== undefined) o.t0 = toS(Number(o.beat0));
    if (bl && o.beat1 !== undefined) o.t1 = toS(Number(o.beat1));
    if (bl && o.beatList) o.beats = o.beatList.map((b) => toS(Number(b)));
    if (o.type === 'pulse' && !o.beats && bl) { /* filled by the caller via spec.beatTimes */ }
    if (o.t0 === undefined || o.t1 === undefined) {
      if (!(o.type === 'captions' || o.type === 'pulse')) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Overlay item "${o.id || o.type}" needs t0/t1 (seconds) or beat0/beat1 (with beats.bpm).`);
    }
    return o;
  });
}

/** Group a flat word list ([{w,t0,t1}]) from a transcript into the shape the captions item wants. */
export function wordsFromSrtLike(words) {
  return words.map((w) => ({ w: String(w.w ?? w.word ?? '').trim(), t0: Number(w.t0 ?? w.start), t1: Number(w.t1 ?? w.end) })).filter((w) => w.w);
}

/** Render overlay frames to a PNG sequence (RGBA). Returns { dir, frames, audit }. */
export async function renderOverlayFrames({ items, theme, width, height, fps, duration, dir, auditAt = [] }) {
  if (!fs.existsSync(OVERLAY_HTML)) throw new FlowError(ErrorCodes.OPERATION_FAILED, `Missing ${OVERLAY_HTML}`);
  if (!fs.existsSync(CHROME)) throw new FlowError(ErrorCodes.OPERATION_FAILED, `Chrome not found at ${CHROME} (set FLOW_RENDER_CHROME).`);
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('file://' + OVERLAY_HTML, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready === true, { timeout: 15000 });
    const initInfo = await page.evaluate((spec) => window.init(spec), { items, theme, viewportWidth: width });
    if (errors.length) throw new FlowError(ErrorCodes.OPERATION_FAILED, `Overlay page error: ${errors[0]}`);
    const audit = [];
    for (const t of auditAt) audit.push({ t, elements: await page.evaluate(([tt, z]) => window.audit(tt, z), [t, SAFE_ZONE]) });
    const n = Math.max(1, Math.round(duration * fps));
    for (let i = 0; i < n; i += 1) {
      await page.evaluate((t) => window.seek(t), i / fps);
      await page.screenshot({ path: path.join(dir, `f${String(i).padStart(5, '0')}.png`), omitBackground: true, type: 'png' });
    }
    return { dir, frames: n, imagesOk: initInfo.imagesOk, audit };
  } finally {
    await browser.close().catch(() => {});
  }
}

function auditWarnings(audit) {
  const out = [];
  for (const a of audit) for (const e of a.elements) if (e.outside.length) out.push(`t=${a.t.toFixed(2)}s "${e.text || e.id}" leaves the safe zone (${e.outside.join('+')}) at ${e.rect.join(',')}`);
  return out;
}

export async function handleMotionOverlay(args = {}) {
  const video = String(args.video || '');
  if (!video || !fs.existsSync(video)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Video not found: ${video || '(missing "video")'}`);
  const rawItems = Array.isArray(args.items) ? args.items : [];
  if (!rawItems.length) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Provide items: [{ type: word|badge|wordmark|callout|line|underline|rect|pulse|captions, ... }].');

  const info = probeVideo(video);
  const fps = Math.round(Number(args.fps) || Math.min(30, info.fps) || 24);
  const duration = Math.min(info.duration, Number(args.duration) || info.duration);
  const items = resolveTimes(rawItems, args.beats).map((it) => (it.type === 'pulse' && !it.beats && args.beat_times ? { ...it, beats: args.beat_times } : it));

  const stamp = `${Date.now()}`;
  const framesDir = path.join(os.tmpdir(), `flow-motion-${stamp}`);
  const outDir = getOutputDir('video');
  const name = String(args.output_name || `${path.basename(video, path.extname(video))}-motion`).replace(/[^\w.-]+/g, '-').replace(/\.mp4$/i, '');
  const dest = path.join(outDir, `${name}.mp4`);
  const auditAt = (args.audit_at || [0.5, 1.5, 3, 5, 7.5, 10, 12.5, 14.5]).filter((t) => t < duration);

  try {
    const r = await renderOverlayFrames({ items, theme: args.theme, width: info.width, height: info.height, fps, duration, dir: framesDir, auditAt });
    run(FFMPEG, ['-v', 'error', '-y', '-i', video, '-framerate', String(fps), '-i', path.join(framesDir, 'f%05d.png'),
      '-filter_complex', '[0:v]fps=' + fps + '[b];[b][1:v]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]',
      '-map', '[v]', '-map', '0:a?', '-t', String(duration), '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-c:a', 'copy', '-movflags', '+faststart', dest]);
    const warnings = auditWarnings(r.audit);
    if (!r.imagesOk) warnings.push('At least one image in the overlay failed to load (check wordmark src paths).');
    const sidecar = `${dest}.motion.json`;
    fs.writeFileSync(sidecar, JSON.stringify({ source: video, fps, duration, items: rawItems, beats: args.beats || null, warnings }, null, 2));
    logger.info(`motion overlay -> ${dest}`);
    return { status: 'success', file: dest, sidecar, frames: r.frames, fps, duration: Number(duration.toFixed(3)), safe_zone_warnings: warnings };
  } finally {
    fs.rmSync(framesDir, { recursive: true, force: true });
  }
}
