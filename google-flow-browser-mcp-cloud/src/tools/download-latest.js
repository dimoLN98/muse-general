import fs from 'fs';
import path from 'path';
import { getPage } from '../browser/connect.js';
import { logger } from '../utils/logger.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { getOutputDir } from '../utils/file-manager.js';
import { SEL, parseFlowUrl, openProject, listTiles, openTile, downloadCurrentMedia } from '../navigation/flow-ui.js';

/**
 * Download the media currently open in Flow's viewer; if a project grid is showing instead, open its
 * newest image/video first. quality: original (default) | 1k | 2k | 4k (upscales may cost credits).
 */
export async function handleDownloadLatest(args = {}) {
  const page = getPage();
  const quality = String(args?.quality ?? 'original').toLowerCase();
  if (!['original', '1k', '2k', '4k'].includes(quality)) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'quality must be original, 1k, 2k or 4k.');
  logger.info('Downloading latest result', { quality });

  try {
    let info = parseFlowUrl(page.url());
    if (info.kind !== 'project') throw new FlowError(ErrorCodes.FLOW_PAGE_NOT_FOUND, 'Open a Flow project first (flow_generate_image opens one).');
    let mediaId = info.section === 'edit' || info.section === 'scene' ? info.itemId : null;
    let kind = null;
    if (!mediaId) {
      await openProject(page, info.projectId);
      await page.locator(SEL.tile).first().waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
      const tiles = await listTiles(page);
      const newest = tiles.find((t) => (t.type === 'image' || t.type === 'video') && !t.pending);
      if (!newest) return { status: 'not_found', message: 'No finished image or video found in this project.' };
      kind = newest.type;
      mediaId = await openTile(page, newest.index);
      info = parseFlowUrl(page.url());
    }
    // An /edit/<id> URL does not say whether it holds a clip or a still: the viewer does.
    if (!kind) kind = (await page.locator('video').count()) > 0 ? 'video' : 'image';
    const outputDir = args.output_folder ? path.resolve(args.output_folder) : getOutputDir(kind === 'video' ? 'video' : 'image');
    let saved = await downloadCurrentMedia(page, outputDir, `flow_latest_${mediaId.slice(0, 8)}_${Date.now()}`, { quality });
    // The /edit/<id> viewer gives no kind up front: trust the extension, and file clips with clips.
    if (kind !== 'video' && /\.(mp4|mov|webm|m4v)$/i.test(saved.path)) {
      try {
        const moved = path.join(getOutputDir('video'), path.basename(saved.path));
        fs.renameSync(saved.path, moved);
        saved = { ...saved, path: moved };
        kind = 'video';
      } catch (e) { logger.warn('Could not move the clip into outputs/videos', { error: e.message }); }
    }
    logger.info('Downloaded latest media', { kind, file: saved.path });
    return { status: 'downloaded', kind, file: saved.path, option: saved.option, media_id: mediaId, project_id: info.projectId };
  } catch (err) {
    await takeScreenshot(page, 'download-latest-error');
    if (err instanceof FlowError) throw err;
    throw new FlowError(ErrorCodes.DOWNLOAD_FAILED, `Download failed: ${err.message}`);
  }
}
