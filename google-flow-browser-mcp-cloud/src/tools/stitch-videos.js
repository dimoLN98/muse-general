import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { logger } from '../utils/logger.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { getOutputDir } from '../utils/file-manager.js';

// Flow has no "Extend" control in the UI (checked 2026-10-17: no element matching /extend|stretch/ on
// the media grid, the clip editor, Scenes or Tools), so turning short clips into a longer piece is
// done here: normalise every clip to one canvas, then join them with cuts or crossfades. Free, local,
// deterministic — no credits, no queue.
const FFMPEG = process.env.FLOW_FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FLOW_FFPROBE || 'ffprobe';
const ASPECTS = { '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1, '4:3': 4 / 3, '3:4': 3 / 4 };

function run(args, label) {
  try {
    return execFileSync(args[0], args.slice(1), { encoding: 'utf-8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const err = (e.stderr || e.message || '').toString().split('\n').filter(Boolean).slice(-6).join(' | ');
    throw new FlowError(ErrorCodes.OPERATION_FAILED, `${label} failed: ${err}`);
  }
}

function probe(file) {
  const out = run([FFPROBE, '-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], 'ffprobe');
  const j = JSON.parse(out);
  const v = (j.streams || []).find((s) => s.codec_type === 'video');
  const a = (j.streams || []).find((s) => s.codec_type === 'audio');
  if (!v) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Not a video: ${file}`);
  const [num, den] = (v.avg_frame_rate || '30/1').split('/').map(Number);
  return {
    width: Number(v.width), height: Number(v.height),
    fps: den ? Math.round((num / den) * 100) / 100 : 30,
    hasAudio: !!a,
    duration: Number(j.format?.duration || 0),
  };
}

/** Canvas for the joined video: the requested aspect at the tallest input height (never upscaled past it). */
export function canvasFor(probes, aspect, maxHeight) {
  const tallest = Math.max(...probes.map((p) => p.height));
  const height = Math.min(maxHeight || 1080, tallest % 2 === 0 ? tallest : tallest - 1);
  const ratio = ASPECTS[aspect] || (probes[0].width / probes[0].height);
  let width = Math.round((height * ratio) / 2) * 2;
  if (width > 1920) width = 1920;
  return { width, height };
}

/**
 * ffmpeg `subtitles` filter for burning an .srt that respects the Reels/TikTok UI overlay.
 * libass lays an SRT out in a 384x288 *script space* and scales that to the frame, so style numbers
 * (MarginV, FontSize ...) are script units, not pixels. A bare `subtitles=file.srt` puts the text ~94% down a
 * 1080x1920 frame, inside the bottom ~35% that the platforms cover with caption/UI chrome (measured 2026-10-17).
 * position: 'safe' (default) lifts portrait captions so they end above ~64% of the frame height and keeps 12%
 * side margins; landscape gets a lower-third. 'bottom' is the old plain placement.
 */
const SCRIPT_W = 384;
const SCRIPT_H = 288;
export function subtitleFilter(srtPath, width, height, position = 'safe') {
  const esc = String(srtPath).replace(/\\/g, '\\\\').replace(/'/g, "'\\\\\\''").replace(/:/g, '\\:').replace(/[,;[\]]/g, (c) => `\\${c}`);
  if (String(position).toLowerCase() === 'bottom') return `subtitles=filename='${esc}'`;
  const portrait = height > width;
  // A number 0.05-0.8 = distance of the caption's bottom edge from the frame bottom, as a fraction of the height
  // (e.g. 0.42 keeps it between a speaker's chin and a chest logo). Strings keep their preset meaning.
  const custom = typeof position === 'number' || /^0?\.\d+$/.test(String(position)) ? Math.min(0.8, Math.max(0.05, Number(position))) : null;
  const marginV = Math.round(SCRIPT_H * (custom ?? (portrait ? 0.37 : 0.07)));
  const marginLR = Math.round(SCRIPT_W * (portrait ? 0.12 : 0.06));
  const fontSize = Math.round(SCRIPT_H * (portrait ? 0.034 : 0.045)) + (portrait ? 1 : 0);
  const style = `Alignment=2,FontSize=${fontSize},MarginV=${marginV},MarginL=${marginLR},MarginR=${marginLR},Outline=1,Shadow=0,BorderStyle=1`;
  return `subtitles=filename='${esc}':force_style='${style}'`;
}

function normalise(file, meta, canvas, fps, tmpDir, index) {
  const dest = path.join(tmpDir, `norm-${index}.mp4`);
  const vf = `scale=${canvas.width}:${canvas.height}:force_original_aspect_ratio=decrease,pad=${canvas.width}:${canvas.height}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${fps},format=yuv420p`;
  const args = [FFMPEG, '-y', '-i', file];
  if (!meta.hasAudio) args.push('-f', 'lavfi', '-t', String(Math.max(meta.duration, 0.2)), '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000');
  args.push('-vf', vf, '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-c:a', 'aac', '-ar', '48000', '-ac', '2');
  args.push('-map', '0:v:0', '-map', meta.hasAudio ? '0:a:0' : '1:a:0', '-shortest', dest);
  run(args, `normalising ${path.basename(file)}`);
  return dest;
}

export async function handleStitchVideos(args = {}) {
  const raw = args.files || args.inputs;
  const files = (Array.isArray(raw) ? raw : String(raw || '').split(',')).map((f) => String(f).trim()).filter(Boolean);
  if (files.length < 2) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Provide at least two video files to join (files: ["a.mp4", "b.mp4"]).');
  for (const f of files) if (!fs.existsSync(f)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `File not found: ${f}`);

  const transition = String(args.transition || 'crossfade').toLowerCase();
  const crossfade = transition === 'cut' || transition === 'none' ? 0 : Math.max(0.2, Math.min(Number(args.transition_seconds) || 0.6, 3));
  const probes = files.map(probe);
  const fps = Math.max(...probes.map((p) => p.fps)) || 30;
  const canvas = canvasFor(probes, args.aspect, Number(args.max_height) || 1080);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-stitch-'));
  const outDir = getOutputDir('video');
  fs.mkdirSync(outDir, { recursive: true });
  const name = String(args.output_name || `stitch-${Date.now()}`).replace(/[^\w.-]+/g, '-').replace(/\.mp4$/i, '');
  const dest = path.join(outDir, `${name}.mp4`);

  try {
    const norms = files.map((f, i) => normalise(f, probes[i], canvas, fps, tmpDir, i));
    let finalInput = dest;

    if (crossfade > 0) {
      // xfade chain: each step overlaps two streams by `crossfade` seconds.
      const durations = norms.map((n) => probe(n).duration);
      const filter = [];
      let vLabel = '0:v', aLabel = '0:a', offset = durations[0] - crossfade;
      for (let i = 1; i < norms.length; i += 1) {
        const vOut = `v${i}`, aOut = `a${i}`;
        filter.push(`[${vLabel}][${i}:v]xfade=transition=fade:duration=${crossfade}:offset=${Math.max(offset, 0).toFixed(3)}[${vOut}]`);
        filter.push(`[${aLabel}][${i}:a]acrossfade=d=${crossfade}[${aOut}]`);
        vLabel = vOut; aLabel = aOut;
        offset += durations[i] - crossfade;
      }
      const args2 = [FFMPEG, '-y'];
      norms.forEach((n) => args2.push('-i', n));
      args2.push('-filter_complex', filter.join(';'), '-map', `[${vLabel}]`, '-map', `[${aLabel}]`,
        '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', dest);
      run(args2, 'crossfade join');
    } else {
      const listFile = path.join(tmpDir, 'concat.txt');
      fs.writeFileSync(listFile, norms.map((n) => `file '${n.replace(/'/g, "'\\''")}'`).join('\n'));
      run([FFMPEG, '-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', dest], 'concat join');
    }

    if (args.music && fs.existsSync(args.music)) {
      const withMusic = path.join(tmpDir, 'music.mp4');
      const volume = Number(args.music_volume) || 0.35;
      const replace = args.music_mode === 'replace';
      run([FFMPEG, '-y', '-i', dest, '-i', args.music,
        '-filter_complex', replace
          ? '[1:a]volume=1.0[m];[0:v]copy[v]'
          : `[1:a]volume=${volume}[m];[0:a][m]amix=inputs=2:duration=first:dropout_transition=0[a]`,
        '-map', replace ? '[v]' : '0:v', '-map', replace ? '[m]' : '[a]', '-shortest',
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', withMusic], 'adding music');
      fs.renameSync(withMusic, dest);
      finalInput = dest;
    }

    if (args.subtitles && fs.existsSync(args.subtitles)) {
      const subbed = path.join(tmpDir, 'subs.mp4');
      const outInfo = probe(dest);
      run([FFMPEG, '-y', '-i', finalInput, '-vf', subtitleFilter(args.subtitles, outInfo.width, outInfo.height, args.subtitle_position),
        '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'copy', subbed], 'burning subtitles');
      fs.renameSync(subbed, dest);
    }

    const info = probe(dest);
    const path0 = getOutputDir('video');
    logger.info('Joined clips', { dest, files: files.length, transition: crossfade > 0 ? `crossfade ${crossfade}s` : 'cut' });
    return {
      status: 'success',
      output: dest,
      clips_joined: files.length,
      transition: crossfade > 0 ? `crossfade ${crossfade}s` : 'cut',
      aspect: args.aspect || 'source',
      resolution: `${info.width}x${info.height}`,
      fps: info.fps,
      total_seconds: Math.round(info.duration * 100) / 100,
      inputs: files.map((f, i) => ({ file: f, seconds: Math.round(probes[i].duration * 100) / 100, audio: probes[i].hasAudio })),
      music: args.music || null,
      subtitles: args.subtitles || null,
      subtitle_position: args.subtitles ? (args.subtitle_position || 'safe') : null,
      credits_used: 0,
      output_dir: path0,
      note: 'Joined locally with ffmpeg — free and instant. Flow has no Extend control, so this is how short clips become a longer sequence.',
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
