import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { getOutputDir } from '../utils/file-manager.js';
import { logger } from '../utils/logger.js';

// Beat detection and beat-synced cutting, local and free. No Python/librosa: the track is decoded by ffmpeg
// to mono PCM, an onset-strength envelope is built from a log-magnitude STFT (spectral flux, emphasising low
// frequencies where the kick lives), tempo comes from the envelope's autocorrelation, and the beat grid is the
// phase that best lines up with the onsets. Accurate for steady electronic/pop tracks; not for rubato music.
const FFMPEG = process.env.FLOW_FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FLOW_FFPROBE || 'ffprobe';
const SR = 22050;
const N_FFT = 1024;
const HOP = 256;               // ~11.6 ms frames
const FPS = SR / HOP;

function runFile(cmd, args) {
  try { return execFileSync(cmd, args, { maxBuffer: 1 << 29, stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { throw new FlowError(ErrorCodes.OPERATION_FAILED, `${path.basename(cmd)} failed: ${(e.stderr || e.message || '').toString().split('\n').filter(Boolean).slice(-3).join(' | ')}`); }
}

export function decodeMono(file, maxSeconds = 0) {
  const args = ['-v', 'error', '-i', file, '-vn', '-ac', '1', '-ar', String(SR), '-f', 'f32le'];
  if (maxSeconds) args.push('-t', String(maxSeconds));
  args.push('-');
  const buf = runFile(FFMPEG, args);
  return new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
}

/** In-place radix-2 FFT. */
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k += 1) {
        const a = i + k, b = i + k + len / 2;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

/** Onset strength per frame (spectral flux of log-magnitude). Returns { full, low }: full = bins up to ~5 kHz,
 *  low = below ~300 Hz (the kick), which is what pins the beat phase when hats and noise are loud. */
export function onsetEnvelope(samples) {
  const win = new Float32Array(N_FFT);
  for (let i = 0; i < N_FFT; i += 1) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N_FFT - 1));
  const bins = Math.floor((5000 / SR) * N_FFT);
  const lowBins = Math.max(3, Math.floor((300 / SR) * N_FFT));
  const frames = Math.max(0, Math.floor((samples.length - N_FFT) / HOP));
  const full = new Float32Array(frames), low = new Float32Array(frames);
  let prev = new Float32Array(bins);
  const re = new Float32Array(N_FFT), im = new Float32Array(N_FFT);
  for (let f = 0; f < frames; f += 1) {
    const off = f * HOP;
    for (let i = 0; i < N_FFT; i += 1) { re[i] = samples[off + i] * win[i]; im[i] = 0; }
    fft(re, im);
    let fl = 0, lo = 0;
    const cur = new Float32Array(bins);
    for (let k = 1; k < bins; k += 1) {
      const mag = Math.log1p(10 * Math.hypot(re[k], im[k]));
      cur[k] = mag;
      const d = mag - prev[k];
      if (d > 0) { fl += d * (k < 24 ? 2 : 1); if (k < lowBins) lo += d; }
    }
    full[f] = fl; low[f] = lo;
    prev = cur;
  }
  return { full: detrend(full), low: detrend(low) };
}

/** Subtract a ~1 s centred moving average (steady energy is not an onset) and clip at zero. */
function detrend(env) {
  const n = env.length, w = Math.round(FPS * 0.5);
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i += 1) pre[i + 1] = pre[i] + env[i];
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const lo = Math.max(0, i - w), hi = Math.min(n, i + w + 1);
    out[i] = Math.max(0, env[i] - (pre[hi] - pre[lo]) / (hi - lo));
  }
  return out;
}

/** Tempo (BPM) from the envelope's autocorrelation, folded into [minBpm, maxBpm]. */
export function estimateTempo(env, { minBpm = 70, maxBpm = 180 } = {}) {
  const minLag = Math.floor((60 / maxBpm) * FPS), maxLag = Math.ceil((60 / minBpm) * FPS);
  const n = env.length;
  let mean = 0; for (let i = 0; i < n; i += 1) mean += env[i]; mean /= n || 1;
  const scores = [];
  for (let lag = minLag; lag <= maxLag + 1; lag += 1) {
    let s = 0;
    for (let i = lag; i < n; i += 1) s += (env[i] - mean) * (env[i - lag] - mean);
    scores.push({ lag, s: s / (n - lag) });
  }
  // favour a lag if its double also scores well (a beat period rather than a sub-division)
  const byLag = new Map(scores.map((x) => [x.lag, x.s]));
  const scored = scores.map(({ lag, s }) => {
    const dbl = byLag.get(lag * 2) ?? 0;
    const half = byLag.get(Math.round(lag / 2)) ?? 0;
    return { lag, s: s + 0.5 * Math.max(0, dbl) + 0.25 * Math.max(0, half) };
  });
  let best = scored[0];
  for (const c of scored) if (c.s > best.s) best = c;
  // parabolic refinement for sub-frame precision
  const l = byLag.get(best.lag - 1), c = byLag.get(best.lag), r = byLag.get(best.lag + 1);
  let lag = best.lag;
  if (l !== undefined && r !== undefined && c !== undefined) {
    const den = l - 2 * c + r;
    if (den < 0) lag += 0.5 * ((l - r) / den);
  }
  return Math.round((60 * FPS) / lag * 100) / 100;
}

/** Beat times (s) for a constant tempo: choose the phase that maximises summed onset strength on the grid. */
export function beatGrid(envs, bpm, duration) {
  const { full, low } = envs;
  const norm = (e) => { let m = 0; for (let i = 0; i < e.length; i += 1) m += e[i]; return m > 0 ? e.length / m : 0; };
  const nl = norm(low), nf = norm(full);
  const blend = new Float32Array(full.length);
  for (let i = 0; i < blend.length; i += 1) blend[i] = 0.75 * low[i] * nl + 0.25 * full[i] * nf;
  const period = (60 / bpm) * FPS;                 // frames per beat
  let bestPhase = 0, bestScore = -1;
  const steps = Math.max(1, Math.round(period));
  for (let p = 0; p < steps; p += 0.5) {
    let s = 0;
    for (let t = p; t < blend.length; t += period) {
      const i = Math.round(t);
      if (i < blend.length) s += Math.max(blend[i], blend[i - 1] ?? 0, blend[i + 1] ?? 0);
    }
    if (s > bestScore) { bestScore = s; bestPhase = p; }
  }
  // a flux frame starts about half an analysis window before the attack it reacts to: move the grid later
  const shift = (N_FFT / 2) / HOP;
  const beats = [];
  for (let t = bestPhase + shift; t / FPS <= duration + 1e-6; t += period) beats.push(Math.round((t / FPS) * 1000) / 1000);
  return beats;
}

/** Group beats into bars and mark where the strongest hit of each bar falls (downbeat guess). */
export function downbeatOffset(envs, beats, beatsPerBar = 4) {
  const env = envs.low;
  const score = new Array(beatsPerBar).fill(0);
  beats.forEach((b, i) => { const f = Math.round(b * FPS); score[i % beatsPerBar] += Math.max(env[f] ?? 0, env[f - 1] ?? 0, env[f + 1] ?? 0); });
  let best = 0; for (let k = 1; k < beatsPerBar; k += 1) if (score[k] > score[best]) best = k;
  return best;
}

export function analyseTrack(file, { maxSeconds = 0, minBpm, maxBpm } = {}) {
  const samples = decodeMono(file, maxSeconds);
  const duration = samples.length / SR;
  if (duration < 2) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Audio is shorter than 2 seconds.');
  const env = onsetEnvelope(samples);
  const rawBpm = estimateTempo(env.full, { minBpm, maxBpm });
  // produced tracks are nearly always a whole number of BPM; snapping removes the drift a 0.1 BPM error adds over a long grid
  const bpm = Math.abs(rawBpm - Math.round(rawBpm)) <= 0.4 ? Math.round(rawBpm) : rawBpm;
  const beats = beatGrid(env, bpm, duration);
  const down = downbeatOffset(env, beats);
  return { duration: Math.round(duration * 1000) / 1000, bpm, raw_bpm: rawBpm, beats, downbeat_offset: down, first_beat: beats[0] ?? 0 };
}

/**
 * Pure: turn a beat list into cut points. Cuts land on beats, every `everyBeats` beats, starting at the first
 * beat at or after `start`; the video is `total` seconds long. Returns segment lengths that sum to `total`.
 */
export function planCuts(beats, { start = 0, total, everyBeats = 4, minSegment = 0.8 } = {}) {
  if (!total || total <= 0) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'total (seconds) is required.');
  const usable = beats.filter((b) => b >= start - 1e-6 && b <= start + total + 1e-6);
  if (usable.length < 2) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Not enough beats inside the requested window.');
  const cuts = [0];
  for (let i = everyBeats; i < usable.length; i += everyBeats) {
    const t = usable[i] - start;
    if (t - cuts[cuts.length - 1] >= minSegment && total - t >= minSegment) cuts.push(Math.round(t * 1000) / 1000);
  }
  cuts.push(total);
  return cuts.slice(1).map((c, i) => Math.round((c - cuts[i]) * 1000) / 1000);
}

/**
 * Cut clips to beat-aligned lengths and join them with the music underneath.
 * clips: [{ file, seconds? }] (seconds = how long that clip should show; default = planned segment).
 * Each clip is trimmed from its start (or `from`) to its segment length, so the cut falls on a beat.
 */
export async function handleBeatSync(args = {}) {
  const music = String(args.music || '');
  if (!music || !fs.existsSync(music)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Music file not found: ${music || '(missing "music")'}`);
  const clips = Array.isArray(args.clips) ? args.clips : [];
  if (clips.length < 1) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Provide clips: [{ file, from?, beats? }] in playback order.');
  for (const c of clips) if (!c.file || !fs.existsSync(c.file)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Clip not found: ${c.file}`);

  const info = analyseTrack(music, { minBpm: args.min_bpm, maxBpm: args.max_bpm });
  const bpm = Number(args.bpm) > 0 ? Number(args.bpm) : info.bpm;
  const beatLen = 60 / bpm;
  const musicStart = args.music_start !== undefined ? Number(args.music_start) : info.first_beat;
  // every clip lasts a whole number of beats (c.beats, default 4 = one bar): its end is a beat, and so is every cut
  const plan = clips.map((c) => ({ file: c.file, from: Number(c.from) || 0, beats: Math.max(1, Math.round(Number(c.beats) || 4)) }));
  const total = plan.reduce((s, p) => s + p.beats * beatLen, 0);
  if (musicStart + total > info.duration + 0.05) throw new FlowError(ErrorCodes.INVALID_PARAMS, `The plan needs ${(musicStart + total).toFixed(1)}s of music but the track is ${info.duration.toFixed(1)}s.`);

  const outDir = getOutputDir('video');
  const name = String(args.output_name || `beatsync-${Date.now()}`).replace(/[^\w.-]+/g, '-').replace(/\.mp4$/i, '');
  const dest = path.join(outDir, `${name}.mp4`);
  const W = Number(args.width) || 720, H = Number(args.height) || 1280, FPSO = Number(args.fps) || 24;
  const inputs = [];
  const filters = [];
  plan.forEach((p, i) => {
    const seg = Math.round(p.beats * beatLen * 1000) / 1000;
    inputs.push('-ss', String(p.from), '-t', String(seg + 0.1), '-i', p.file);
    filters.push(`[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${FPSO},trim=duration=${seg},setpts=PTS-STARTPTS,format=yuv420p[v${i}]`);
    filters.push(`[${i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration=${seg},asetpts=PTS-STARTPTS[a${i}]`);
  });
  const vcat = plan.map((_, i) => `[v${i}]`).join('');
  const acat = plan.map((_, i) => `[a${i}]`).join('');
  const logo = args.logo && fs.existsSync(args.logo) ? args.logo : null;
  const logoBeats = Math.max(1, Math.round(Number(args.logo_beats) || 4));
  filters.push(`${vcat}concat=n=${plan.length}:v=1:a=0[vc0]`);
  if (logo) {
    // end card on the beat grid: the picture starts fading out on the beat that opens the last `logoBeats` beats,
    // and the logo fades in exactly one beat later
    const cardStart = Math.max(0, total - logoBeats * beatLen);
    const logoIdx = plan.length + 1;
    inputs.push('-loop', '1', '-t', String(total), '-i', logo);
    filters.push(`[vc0]fade=t=out:st=${cardStart.toFixed(3)}:d=${(beatLen * 1.5).toFixed(3)}[vf]`);
    filters.push(`[${logoIdx}:v]scale=${Math.round(W * 0.58)}:-1,format=rgba,fade=t=in:st=${(cardStart + beatLen).toFixed(3)}:d=${beatLen.toFixed(3)}:alpha=1[lg]`);
    filters.push(`[vf][lg]overlay=x=(W-w)/2:y=(H-h)/2-${Math.round(H * 0.05)}:format=auto,format=yuv420p[vc]`);
  } else {
    filters.push('[vc0]null[vc]');
  }
  filters.push(`${acat}concat=n=${plan.length}:v=0:a=1[ac]`);
  const musicIdx = plan.length;
  inputs.splice(plan.length * 6, 0, '-ss', String(musicStart), '-t', String(total + 0.2), '-i', music);
  const clipVol = Number.isFinite(Number(args.clip_audio_volume)) ? Number(args.clip_audio_volume) : 0.25;
  const musicVol = Number.isFinite(Number(args.music_volume)) ? Number(args.music_volume) : 1.0;
  const fadeOut = Math.min(0.6, total / 4);
  filters.push(`[${musicIdx}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration=${total},asetpts=PTS-STARTPTS,volume=${musicVol},afade=t=out:st=${Math.max(0, total - fadeOut)}:d=${fadeOut}[m]`);
  filters.push(`[ac]volume=${clipVol}[cq]`);
  if (args.duck_music) {
    // speech (the clips' audio) pushes the music down while it is present
    filters.push('[cq]asplit=2[cq1][cq2]');
    filters.push('[m][cq1]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=250:makeup=1[md]');
    filters.push('[md][cq2]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mix]');
  } else {
    filters.push('[m][cq]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mix]');
  }
  filters.push('[mix]loudnorm=I=-14:TP=-1.5:LRA=11[aout]');
  runFile(FFMPEG, ['-v', 'error', '-y', ...inputs, '-filter_complex', filters.join(';'), '-map', '[vc]', '-map', '[aout]',
    '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-r', String(FPSO), '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-t', String(total), dest]);

  // cut times (s into the final video) and the beat each lands on
  let t = 0;
  const cuts = plan.slice(0, -1).map((p) => { t += p.beats * beatLen; return Math.round(t * 1000) / 1000; });
  const sidecar = {
    output: dest, music, logo, duck_music: !!args.duck_music, music_volume: musicVol, clip_audio_volume: clipVol, music_start: musicStart, bpm, beat_seconds: Math.round(beatLen * 1000) / 1000,
    detected: { bpm: info.bpm, first_beat: info.first_beat, downbeat_offset: info.downbeat_offset },
    total_seconds: Math.round(total * 1000) / 1000, cuts, clips: plan,
  };
  fs.writeFileSync(dest.replace(/\.mp4$/, '.beatsync.json'), JSON.stringify(sidecar, null, 2));
  logger.info('Beat-synced cut', { dest, bpm, cuts: cuts.length });
  return { status: 'success', ...sidecar, credits_used: 0, note: 'Every cut is a whole number of beats from the first beat; the music starts on its first detected beat.' };
}

export async function handleAnalyzeBeats(args = {}) {
  const file = String(args.file || '');
  if (!file || !fs.existsSync(file)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `File not found: ${file || '(missing "file")'}`);
  const info = analyseTrack(file, { minBpm: args.min_bpm, maxBpm: args.max_bpm });
  const maxList = Number(args.max_beats) || 64;
  return { status: 'success', file, duration: info.duration, bpm: info.bpm, first_beat_seconds: info.first_beat, beat_seconds: Math.round((60 / info.bpm) * 1000) / 1000,
    downbeat_offset_in_first_bar: info.downbeat_offset, beats: info.beats.slice(0, maxList), beats_total: info.beats.length,
    suggested_cut_every_4_beats: info.beats.filter((_, i) => i % 4 === 0).slice(0, 16), credits_used: 0 };
}
