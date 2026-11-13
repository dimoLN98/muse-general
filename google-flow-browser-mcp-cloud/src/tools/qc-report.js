import fs from 'fs';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { logger } from '../utils/logger.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { getOutputDir } from '../utils/file-manager.js';

// Pre-review QC for a finished ad/clip. Pure ffprobe/ffmpeg: free, local, deterministic. It cannot see
// garment/print/logo/hand artifacts (that needs eyes, see the contact sheet it writes), so it never says an
// ad is "approved": it says whether any HARD check failed and lists what a human must still look at.
const FFMPEG = process.env.FLOW_FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FLOW_FFPROBE || 'ffprobe';
const RATIOS = { '9:16': 9 / 16, '16:9': 16 / 9, '1:1': 1, '4:5': 4 / 5, '3:4': 3 / 4, '4:3': 4 / 3 };

function probe(file) {
  const out = execFileSync(FFPROBE, ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], { encoding: 'utf-8', maxBuffer: 1 << 26 });
  const j = JSON.parse(out);
  const v = (j.streams || []).find((s) => s.codec_type === 'video');
  const a = (j.streams || []).find((s) => s.codec_type === 'audio');
  if (!v) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Not a video: ${file}`);
  const rate = (r) => { const [n, d] = String(r || '0/1').split('/').map(Number); return d ? n / d : 0; };
  return {
    codec: v.codec_name, profile: v.profile, pix_fmt: v.pix_fmt, width: Number(v.width), height: Number(v.height),
    r_fps: rate(v.r_frame_rate), avg_fps: rate(v.avg_frame_rate), duration: Number(j.format?.duration || v.duration || 0),
    size_mb: Number(j.format?.size || 0) / 1048576,
    audio: a ? { codec: a.codec_name, sample_rate: Number(a.sample_rate), channels: Number(a.channels) } : null,
  };
}

/** Pure: parse the stderr of the combined detector pass. Exported for tests. */
export function parseDetectors(stderr) {
  const text = String(stderr || '');
  const black = [...text.matchAll(/black_start:([\d.]+)\s+black_end:([\d.]+)\s+black_duration:([\d.]+)/g)].map((m) => ({ start: +m[1], end: +m[2], seconds: +m[3] }));
  const freezeStart = [...text.matchAll(/freeze_start:\s*([\d.]+)/g)].map((m) => +m[1]);
  const freezeDur = [...text.matchAll(/freeze_duration:\s*([\d.]+)/g)].map((m) => +m[1]);
  const freeze = freezeStart.map((start, i) => ({ start, seconds: freezeDur[i] ?? null }));
  const sStart = [...text.matchAll(/silence_start:\s*(-?[\d.]+)/g)].map((m) => +m[1]);
  const sDur = [...text.matchAll(/silence_duration:\s*([\d.]+)/g)].map((m) => +m[1]);
  const silence = sStart.map((start, i) => ({ start, seconds: sDur[i] ?? null }));
  const summary = text.slice(text.lastIndexOf('Summary:'));
  const num = (re) => { const m = re.exec(summary); return m ? Number(m[1]) : null; };
  return {
    black, freeze, silence,
    loudness: summary.includes('Summary:') ? {
      integrated_lufs: num(/I:\s+(-?[\d.]+)\s+LUFS/), lra: num(/LRA:\s+(-?[\d.]+)\s+LU/),
      true_peak_dbtp: num(/(?:True peak|Peak):\s+(-?[\d.]+)\s+dBFS/),
    } : null,
  };
}

/** Pure: turn probe + detector results into checks. severity 'hard' fails the report; 'soft' warns. */
export function evaluate(meta, det, opts = {}) {
  const o = { ratio: '9:16', maxMb: 500, targetSeconds: null, tolerance: 0.5, lufs: -14, lufsTol: 2, endCardMaxSeconds: 3, ...opts };
  const checks = [];
  const add = (id, severity, pass, detail) => checks.push({ id, severity, pass, detail });
  add('codec', 'hard', meta.codec === 'h264', `video codec ${meta.codec}${meta.profile ? ` (${meta.profile})` : ''}`);
  add('pixel_format', 'hard', meta.pix_fmt === 'yuv420p', `pix_fmt ${meta.pix_fmt}`);
  const want = RATIOS[o.ratio];
  const got = meta.width / meta.height;
  add('aspect', 'hard', !!want && Math.abs(got - want) < 0.01, `${meta.width}x${meta.height} (${got.toFixed(3)}) vs ${o.ratio}`);
  if (o.ratio === '9:16') add('resolution', 'soft', meta.width === 1080 && meta.height === 1920, `${meta.width}x${meta.height}; platforms want 1080x1920 (720p Omni output is upscaled/low)`);
  add('constant_fps', 'soft', Math.abs(meta.r_fps - meta.avg_fps) < 0.05, `r_frame_rate ${meta.r_fps.toFixed(2)} vs avg ${meta.avg_fps.toFixed(2)}`);
  add('file_size', 'hard', meta.size_mb < o.maxMb, `${meta.size_mb.toFixed(1)} MB (limit ${o.maxMb})`);
  if (o.targetSeconds) add('duration', 'hard', Math.abs(meta.duration - o.targetSeconds) <= o.tolerance, `${meta.duration.toFixed(2)}s vs target ${o.targetSeconds}s ±${o.tolerance}`);
  add('has_audio', 'soft', !!meta.audio, meta.audio ? `${meta.audio.codec} ${meta.audio.sample_rate} Hz ${meta.audio.channels}ch` : 'no audio stream');
  if (meta.audio) add('audio_format', 'soft', meta.audio.codec === 'aac' && meta.audio.sample_rate === 48000, `${meta.audio.codec} ${meta.audio.sample_rate} Hz (want aac 48000)`);
  // A black span that runs to the very end and is short is almost always a deliberate end card (a small logo on
  // black reads as "black" to blackdetect). It stays visible as a soft warning; black anywhere else is a hard fail.
  const isTail = (b) => meta.duration - b.end <= 0.2 && b.start >= meta.duration - o.endCardMaxSeconds && b.start >= 0.5 && b.seconds < meta.duration * 0.5;
  const tailBlack = det.black.filter(isTail);
  const midBlack = det.black.filter((b) => !isTail(b));
  const fmt = (list) => list.map((b) => `${b.start.toFixed(1)}-${b.end.toFixed(1)}s`).join(', ');
  add('black_frames', 'hard', midBlack.length === 0, midBlack.length ? `${midBlack.length} black span(s): ${fmt(midBlack)}` : 'none');
  if (tailBlack.length) add('end_card_black', 'soft', false, `dark tail ${fmt(tailBlack)}: fine for a deliberate end card; confirm the logo is visible on the contact sheet, and that it is not a failed render`);
  add('frozen_video', 'soft', det.freeze.length === 0, det.freeze.length ? `frozen at ${det.freeze.map((f) => `${f.start.toFixed(1)}s`).join(', ')} (ignore a deliberate end card)` : 'none');
  if (meta.audio) {
    add('silence_gaps', 'soft', det.silence.length === 0, det.silence.length ? `${det.silence.length} silent span(s) from ${det.silence.map((s) => `${s.start.toFixed(1)}s`).join(', ')}` : 'none');
    const l = det.loudness;
    if (l && l.integrated_lufs !== null) {
      add('loudness', 'soft', Math.abs(l.integrated_lufs - o.lufs) <= o.lufsTol, `${l.integrated_lufs} LUFS (target ${o.lufs} ±${o.lufsTol})`);
      if (l.true_peak_dbtp !== null) add('true_peak', 'soft', l.true_peak_dbtp <= -1, `${l.true_peak_dbtp} dBTP (want ≤ -1)`);
      if (l.lra !== null) add('loudness_range', 'soft', l.lra <= 11, `LRA ${l.lra} LU (want ≤ 11)`);
    }
  }
  const hardFails = checks.filter((c) => c.severity === 'hard' && !c.pass).map((c) => c.id);
  const warnings = checks.filter((c) => c.severity === 'soft' && !c.pass).map((c) => c.id);
  return { passed_hard_checks: hardFails.length === 0, hard_fails: hardFails, warnings, checks };
}

export async function handleQcReport(args = {}) {
  const file = String(args.file || '').trim();
  if (!file || !fs.existsSync(file)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `File not found: ${file || '(missing "file")'}`);
  if (args.aspect && !RATIOS[args.aspect]) throw new FlowError(ErrorCodes.INVALID_PARAMS, `aspect must be one of ${Object.keys(RATIOS).join(', ')}`);
  const meta = probe(file);
  const hasAudio = !!meta.audio;
  const vf = 'blackdetect=d=0.2:pic_th=0.98,freezedetect=n=-60dB:d=0.5';
  const run = ['-hide_banner', '-nostats', '-i', file, '-vf', vf];
  if (hasAudio) run.push('-af', 'silencedetect=n=-50dB:d=0.5,ebur128=peak=true');
  run.push('-f', 'null', '-');
  const r = spawnSync(FFMPEG, run, { encoding: 'utf-8', maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new FlowError(ErrorCodes.OPERATION_FAILED, `QC detector pass failed: ${(r.stderr || '').split('\n').filter(Boolean).slice(-3).join(' | ')}`);
  const det = parseDetectors(r.stderr);
  const result = evaluate(meta, det, { ratio: args.aspect || '9:16', maxMb: args.max_mb || 500, targetSeconds: args.target_seconds || null, lufs: args.target_lufs ?? -14 });

  const qcDir = path.join(path.dirname(getOutputDir('video')), 'qc');
  fs.mkdirSync(qcDir, { recursive: true });
  const base = path.basename(file).replace(/\.[^.]+$/, '');
  const sheet = path.join(qcDir, `${base}_sheet.png`);
  const s = spawnSync(FFMPEG, ['-y', '-v', 'error', '-i', file, '-vf', 'fps=1,scale=270:-1,tile=6x4', '-frames:v', '1', sheet], { encoding: 'utf-8' });
  const report = {
    status: result.passed_hard_checks ? 'hard_checks_passed' : 'hard_checks_FAILED',
    file, probe: { ...meta, duration: Math.round(meta.duration * 100) / 100, size_mb: Math.round(meta.size_mb * 10) / 10 },
    ...result, loudness: det.loudness,
    contact_sheet: s.status === 0 && fs.existsSync(sheet) ? sheet : null,
    human_review_still_required: [
      'hands/fingers/teeth/eyes, limb count, face morph between frames',
      'garment silhouette, seams, drawstring symmetry; print/logo SHAPE and SPELLING (reject warped small type)',
      'fabric weight/physics and colour vs the real SKU; brand orange',
      'baked-in text, watermarks, warped signage; unwanted music/speech',
      'identity drift between shots; unintended cuts; claims, price and disclosure per platform',
    ],
    note: 'Automatic checks only. Never present a draft to the user as approved because this passed; show the contact sheet and the warnings.',
    credits_used: 0,
  };
  const sidecar = path.join(qcDir, `${base}_qc.json`);
  fs.writeFileSync(sidecar, JSON.stringify(report, null, 2));
  report.report_file = sidecar;
  logger.info('QC report', { file, status: report.status, hard_fails: result.hard_fails, warnings: result.warnings });
  return report;
}
