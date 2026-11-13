import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { logger } from '../utils/logger.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { getOutputDir } from '../utils/file-manager.js';

// Pull a frame out of a clip so it can seed the next one: attach it as an ingredient and ask Flow to
// "continue this shot", or use it as the start of a different scene. Flow's own editor has a
// "Save frame" button (saves into the project); this does the same thing locally and instantly, and
// can upload the frame back into the project so the agent can use it.
const FFMPEG = process.env.FLOW_FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FLOW_FFPROBE || 'ffprobe';

function duration(file) {
  const out = execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf-8' });
  return Number(out.trim()) || 0;
}

/** Turn `at` (first|middle|last|seconds) into a timestamp for a clip of `total` seconds. */
export function resolveFrameTime(at, total) {
  const value = String(at ?? 'first').toLowerCase();
  if (value === 'first') return 0;
  if (value === 'middle') return total / 2;
  if (value === 'last') return Math.max(0, total - 0.06);
  if (!Number.isNaN(Number(value)) && value !== '') return Math.max(0, Math.min(Number(value), total));
  throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unsupported at: "${at}". Use first, middle, last, or a number of seconds.`);
}

export async function handleSaveFrame(args = {}) {
  const file = args.video_file || args.file;
  if (!file) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'video_file is required (a local mp4/mov).');
  if (!fs.existsSync(file)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `File not found: ${file}`);

  const total = duration(file);
  const at = String(args.at ?? 'first').toLowerCase();
  const seconds = resolveFrameTime(args.at, total);

  const outDir = getOutputDir('image');
  fs.mkdirSync(outDir, { recursive: true });
  const base = String(args.output_name || `${path.basename(file, path.extname(file))}-frame-${at}`).replace(/[^\w.-]+/g, '-');
  const dest = path.join(outDir, `${base}.jpg`);

  // -ss before -i = fast seek; one frame, best quality jpeg.
  execFileSync(FFMPEG, ['-y', '-ss', seconds.toFixed(3), '-i', file, '-frames:v', '1', '-q:v', '2', dest], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 });
  const meta = JSON.parse(execFileSync(FFPROBE, ['-v', 'error', '-print_format', 'json', '-show_streams', '-select_streams', 'v:0', dest], { encoding: 'utf-8' }));
  const stream = (meta.streams || [])[0] || {};
  logger.info('Saved frame', { file, at: seconds, dest });

  const result = {
    status: 'success',
    output: dest,
    source: file,
    at_seconds: Math.round(seconds * 100) / 100,
    at: at === 'first' || at === 'last' || at === 'middle' ? at : 'timestamp',
    resolution: stream.width && stream.height ? `${stream.width}x${stream.height}` : null,
    size_bytes: fs.statSync(dest).size,
    credits_used: 0,
    note: 'Use this frame as an ingredient (upload it to Flow) to continue the shot or start a new scene from it.',
  };

  if (args.upload_to_flow) {
    const { getPage } = await import('../browser/connect.js');
    const { ensureProjectInContext } = await import('../navigation/project-navigator.js');
    const { uploadAsset, attachReferenceImages } = await import('../navigation/flow-ui.js');
    const page = getPage();
    const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
    const asset = await uploadAsset(page, dest);
    result.uploaded_to_flow = { project_url: project.url, asset: asset.name, kind: asset.kind };
    if (args.attach_to_prompt) {
      result.attached = await attachReferenceImages(page, [dest]).catch((e) => ({ error: e.message }));
    }
  }
  return result;
}
