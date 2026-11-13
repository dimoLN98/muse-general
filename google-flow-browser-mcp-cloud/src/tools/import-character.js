import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { jobQueue } from '../queue/job-queue.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { get } from '../utils/config.js';
import { saveMetadata } from '../utils/file-manager.js';
import { ensureProjectInContext, registerTaskInProject } from '../navigation/project-navigator.js';
import { routes, resolveModel } from '../navigation/flow-ui.js';
import { runCharacterJob } from './create-character.js';

const MAX_JSON_BYTES = 256 * 1024;

/**
 * Import a character from a saved JSON file: { name, description, personality?, model?, reference_images?: [paths] }.
 * Relative image paths are resolved against the JSON file's folder. Staged unless auto_confirm=true.
 */
export async function handleImportCharacter(args = {}) {
  const filePath = args.file_path ? path.resolve(String(args.file_path)) : null;
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS, `Character file not found: ${filePath ?? '(file_path missing)'}`);
  }
  if (fs.statSync(filePath).size > MAX_JSON_BYTES) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Character file is too large (max 256 KB).');
  let spec;
  try { spec = JSON.parse(fs.readFileSync(filePath, 'utf-8')); } catch (e) {
    throw new FlowError(ErrorCodes.INVALID_PARAMS, `Character file is not valid JSON: ${e.message}`);
  }
  const description = String(spec.description ?? spec.prompt ?? '').trim();
  if (!description) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Character JSON needs a "description" (or "prompt").');
  const name = spec.name ? String(spec.name).trim().slice(0, 80) : null;
  const dir = path.dirname(filePath);
  const rawRefs = spec.reference_images ?? (spec.image_path ? [spec.image_path] : []);
  const references = (Array.isArray(rawRefs) ? rawRefs : [rawRefs]).filter(Boolean).map((p) => path.resolve(dir, String(p)));
  const model = spec.model ? resolveModel('image', spec.model) : null;
  if (spec.model && !model) throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Image model "${spec.model}" not available.`);
  const autoConfirm = args.auto_confirm === true;

  logger.info('Importing character', { name, autoConfirm });
  const job = jobQueue.createJob('import_character', { name, file: filePath, auto_confirm: autoConfirm });
  let page;
  try {
    jobQueue.startJob(job.id);
    page = getPage();
    const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
    const projectId = project.flowProjectId;
    const outcome = await runCharacterJob(page, projectId, { name, description, model, personality: spec.personality, references, autoConfirm });

    if (outcome.staged) {
      const result = {
        status: 'ready_for_confirmation',
        type: 'character_import',
        message: 'Character form filled from the file. Nothing was sent. Call again with auto_confirm=true to create it.',
        name, description, ...outcome.detail, project_url: routes.project(projectId),
        screenshot: await takeScreenshot(page, 'character-import-ready'), jobId: job.id,
      };
      jobQueue.completeJob(job.id, result);
      return result;
    }
    const result = {
      status: 'success', type: 'character_import', character_id: outcome.created.characterId, name: outcome.created.name,
      ...outcome.detail, character_url: routes.characterItem(projectId, outcome.created.characterId), project_url: routes.project(projectId),
      account: get('expectedAccount'), jobId: job.id,
    };
    saveMetadata(job.id, result);
    registerTaskInProject(projectId, { type: 'character_import', name: outcome.created.name, characterId: outcome.created.characterId, jobId: job.id });
    jobQueue.completeJob(job.id, result);
    return result;
  } catch (err) {
    if (page) await takeScreenshot(page, 'import-character-error');
    jobQueue.failJob(job.id, err);
    throw err;
  }
}
