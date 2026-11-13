import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { jobQueue } from '../queue/job-queue.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { get } from '../utils/config.js';
import { saveMetadata } from '../utils/file-manager.js';
import { ensureProjectInContext, registerTaskInProject } from '../navigation/project-navigator.js';
import {
  SEL, routes, parseFlowUrl, resolveModel, gotoFlow, waitForVisible, fillPrompt, replaceFieldText, chooseMenuItem, listTiles, openProject,
} from '../navigation/flow-ui.js';
import fs from 'fs';
import path from 'path';

const MAX_TEXT = 2000;
const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function validateReferenceImage(file) {
  const abs = path.resolve(String(file));
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Reference image not found: ${abs}`);
  if (!IMAGE_EXT.has(path.extname(abs).toLowerCase())) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unsupported reference image type: ${path.extname(abs)}`);
  if (fs.statSync(abs).size > 20 * 1024 * 1024) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Reference image is larger than 20 MB: ${abs}`);
  return abs;
}

/**
 * Open the "New character" form and (optionally) type the description. Nothing is sent.
 * Reference photos are NOT handled here: on this form "Upload" instantly turns a photo into a character.
 */
export async function stageCharacter(page, projectId, { description, model }) {
  await gotoFlow(page, routes.character(projectId));
  await waitForVisible(page, SEL.characterPrompt, 30000, 'character description box');
  if (model) {
    await page.locator(SEL.characterModel).first().click();
    await page.waitForTimeout(400);
    await chooseMenuItem(page, model);
  }
  if (description) {
    const typed = await fillPrompt(page, description, SEL.characterPrompt);
    if (!typed) throw new FlowError(ErrorCodes.UNKNOWN_UI_CHANGE, 'Could not type into the character description box.');
  }
}

/** After Flow opens /character/<id>: wait for the image, set name/personality, press Done. */
async function finishCharacter(page, { name, personality }) {
  const characterId = parseFlowUrl(page.url()).itemId;
  await waitForVisible(page, 'input[aria-label="Character name"]', 60000, 'character name field');
  const deadline = Date.now() + get('generationTimeoutMs', 180000);
  while (Date.now() < deadline) {
    const state = await page.evaluate(() => ({
      pct: /\b\d{1,3}\s*%/.test(document.body.innerText),
      img: [...document.querySelectorAll('img')].some((i) => i.getBoundingClientRect().width > 150 && i.complete && i.naturalWidth > 0),
    }));
    if (state.img && !state.pct) break;
    await page.waitForTimeout(2000);
  }
  let finalName = null;
  if (name) finalName = await replaceFieldText(page, 'input[aria-label="Character name"]', name);
  if (personality) await replaceFieldText(page, 'textarea[aria-label="Character personality"]', personality);
  await page.locator('button:has-text("Done")').first().click({ timeout: 10000 });
  await page.waitForTimeout(2500);
  return { characterId, name: finalName };
}

async function waitForCharacterPage(page) {
  try {
    await page.waitForURL((url) => parseFlowUrl(url.href).section === 'character' && parseFlowUrl(url.href).itemId, { timeout: get('generationTimeoutMs', 180000) });
  } catch {
    throw new FlowError(ErrorCodes.GENERATION_TIMEOUT, 'Flow did not open the new character within the timeout.');
  }
}

/** Send the staged description (generates the character image), then name it. */
export async function submitCharacter(page, projectId, { name, personality }) {
  const send = page.locator(SEL.startGeneration).first();
  if (!(await send.isVisible().catch(() => false)) || (await send.isDisabled().catch(() => true))) {
    throw new FlowError(ErrorCodes.GENERATION_BUTTON_DISABLED, 'The character "Start generation" button is missing or disabled.');
  }
  await send.click();
  await waitForCharacterPage(page);
  return finishCharacter(page, { name, personality });
}

/** Create a character straight from a photo ("Upload" on the New character form), then name it. */
export async function createCharacterFromPhoto(page, projectId, file, { name, personality }) {
  const abs = validateReferenceImage(file);
  await gotoFlow(page, routes.character(projectId));
  await waitForVisible(page, SEL.characterPrompt, 30000, 'character description box');
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }),
    page.locator('button:has-text("Upload")').first().click(),
  ]);
  await chooser.setFiles(abs);
  await waitForCharacterPage(page);
  return finishCharacter(page, { name, personality });
}

/** Shared by create/import: stage or perform, returning the tool result body. */
export async function runCharacterJob(page, projectId, { name, description, model, personality, references, autoConfirm }) {
  const refs = (references || []).filter(Boolean).map(validateReferenceImage);
  if (!autoConfirm) {
    await stageCharacter(page, projectId, { description: refs.length ? '' : description, model });
    return {
      staged: true,
      detail: refs.length
        ? { mode: 'from_photo', photo: path.basename(refs[0]), note: 'With auto_confirm=true the first photo becomes the character directly (no generation); the description is saved as character info.' }
        : { mode: 'from_description', model_used: model || 'Flow default' },
    };
  }
  if (refs.length) {
    const created = await createCharacterFromPhoto(page, projectId, refs[0], { name, personality: personality || description });
    return { staged: false, created, detail: { mode: 'from_photo', photo: path.basename(refs[0]), ignored_extra_photos: Math.max(0, refs.length - 1) } };
  }
  await stageCharacter(page, projectId, { description, model });
  const created = await submitCharacter(page, projectId, { name, personality });
  return { staged: false, created, detail: { mode: 'from_description', model_used: model || 'Flow default' } };
}

export async function handleCreateCharacter(args = {}) {
  const description = typeof args.description === 'string' ? args.description.trim() : '';
  if (!description) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'description is required.');
  if (description.length > MAX_TEXT) throw new FlowError(ErrorCodes.INVALID_PARAMS, `description is too long (max ${MAX_TEXT}).`);
  const name = typeof args.name === 'string' && args.name.trim() ? args.name.trim().slice(0, 80) : null;
  const model = args.model ? resolveModel('image', args.model) : null;
  if (args.model && !model) throw new FlowError(ErrorCodes.MODEL_NOT_AVAILABLE, `Image model "${args.model}" not available.`);
  const autoConfirm = args.auto_confirm === true;
  const references = args.reference_images || (args.reference_image ? [args.reference_image] : []);

  const job = jobQueue.createJob('create_character', { name, description, auto_confirm: autoConfirm, project_name: args.project_name, campaign: args.campaign });
  let page;
  try {
    jobQueue.startJob(job.id);
    page = getPage();
    const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
    const projectId = project.flowProjectId;
    const outcome = await runCharacterJob(page, projectId, { name, description, model, personality: args.personality, references, autoConfirm });

    if (outcome.staged) {
      const result = {
        status: 'ready_for_confirmation',
        type: 'character',
        message: 'Character form filled. Nothing was sent. Call again with auto_confirm=true to create the character.',
        name, description, ...outcome.detail,
        project_url: routes.project(projectId),
        screenshot: await takeScreenshot(page, 'character-ready'),
        jobId: job.id,
      };
      saveMetadata(job.id, { ...result, status: 'ready_for_confirmation' });
      jobQueue.completeJob(job.id, result);
      return result;
    }
    const result = {
      status: 'success',
      type: 'character',
      character_id: outcome.created.characterId,
      name: outcome.created.name,
      description,
      ...outcome.detail,
      character_url: routes.characterItem(projectId, outcome.created.characterId),
      project_url: routes.project(projectId),
      account: get('expectedAccount'),
      jobId: job.id,
    };
    saveMetadata(job.id, result);
    registerTaskInProject(projectId, { type: 'character', name: outcome.created.name, characterId: outcome.created.characterId, jobId: job.id });
    jobQueue.completeJob(job.id, result);
    return result;
  } catch (err) {
    if (page) await takeScreenshot(page, 'create-character-error');
    jobQueue.failJob(job.id, err);
    throw err;
  }
}

/** Characters of the current (or given) project, via the sidebar's Characters filter. */
export async function handleListCharacters(args = {}) {
  const page = getPage();
  const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
  await openProject(page, project.flowProjectId);
  const button = page.locator('button', { hasText: 'Characters' }).first();
  await button.click();
  await page.waitForTimeout(2000);
  const info = parseFlowUrl(page.url());
  // With no characters yet, Flow jumps straight to the "New character" form.
  const tiles = info.section === 'project' ? (await listTiles(page)).filter((t) => t.type === 'character' || t.type === 'other') : [];
  return {
    status: 'success',
    project_url: routes.project(project.flowProjectId),
    characters: tiles.map((t) => ({ name: t.name, index: t.index })),
    count: tiles.length,
    note: info.section === 'project' ? undefined : 'No characters yet in this project.',
  };
}
