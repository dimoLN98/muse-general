import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { jobQueue } from '../queue/job-queue.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { saveMetadata } from '../utils/file-manager.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { ensureProjectInContext } from '../navigation/project-navigator.js';
import { openFlowTool } from '../navigation/tool-navigator.js';
import { getToolFrame, routes } from '../navigation/flow-ui.js';
import fs from 'fs';

// Options offered by the Grid Architect app (mapped from the live UI). Its own engine list is shorter than Flow's.
const ENGINES = ['Nano Banana 2', 'Nano Banana Pro'];
const RATIOS = ['1:1', '16:9', '9:16', '4:3', '3:4'];
const VISUAL_LOGIC = ['Style from References', 'Ultra Realistic', 'Cinematic Movie', 'Film Noir', 'Anime / Manga'];
const MAX_SHOTS = 4;
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function pick(list, requested, label) {
  if (requested === undefined || requested === null || requested === '') return null;
  const wanted = String(requested).trim().toLowerCase().replace(/^nano banana 2\.1$/, 'nano banana 2');
  const hit = list.find((item) => item.toLowerCase() === wanted);
  if (!hit) throw new FlowError(ErrorCodes.INVALID_PARAMS, `${label} "${requested}" not available in Grid Architect. Available: ${list.join(', ')}`);
  return hit;
}

async function chooseDropdown(frame, trigger, option) {
  await frame.locator('button', { hasText: trigger }).first().click({ timeout: 8000 });
  await frame.waitForTimeout(500);
  await frame.locator('button').filter({ hasText: new RegExp(`^${escapeRegExp(option)}$`) }).first().click({ timeout: 8000 });
  await frame.waitForTimeout(400);
}

async function readConfig(frame) {
  const texts = await frame.locator('button').allInnerTexts();
  const clean = (t) => t.replace(/\s+/g, ' ').trim();
  const find = (prefix) => texts.map(clean).find((t) => t.startsWith(prefix))?.slice(prefix.length).trim() ?? null;
  return { engine: find('ENGINE'), ratio: find('FORMAT RATIO'), visual_logic: find('VISUAL LOGIC') };
}

/** Open Grid Architect in the project and fill it. It never presses GENERATE (that spends credits). */
export async function handleUseGridArchitect(args = {}) {
  const theme = typeof args.theme_prompt === 'string' ? args.theme_prompt.trim() : '';
  if (!theme) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'theme_prompt is required.');
  const shots = args.shot_prompts === undefined ? [] : args.shot_prompts;
  if (!Array.isArray(shots) || shots.some((s) => typeof s !== 'string')) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'shot_prompts must be an array of strings.');
  if (shots.length > MAX_SHOTS) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Grid Architect supports at most ${MAX_SHOTS} shots per grid.`);
  const engine = pick(ENGINES, args.engine, 'Engine');
  const ratio = pick(RATIOS, args.ratio, 'Ratio');
  const visualLogic = pick(VISUAL_LOGIC, args.visual_logic, 'Visual logic');

  const job = jobQueue.createJob('grid_architect', { ...args, project_name: args.project_name, campaign: args.campaign });
  let page;
  try {
    jobQueue.startJob(job.id);
    page = getPage();
    const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
    const projectId = project.flowProjectId;
    const opened = await openFlowTool(page, projectId, 'Grid Architect');
    const frame = await getToolFrame(page);
    if (!frame) throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, 'Grid Architect did not render its app frame.');
    await page.waitForTimeout(1500);

    // The landing overlay swallows clicks until "START ARCHITECTING" is pressed.
    const start = frame.locator('button', { hasText: 'START ARCHITECTING' }).first();
    if (await start.isVisible().catch(() => false)) {
      await start.click();
      await frame.waitForTimeout(1200);
    }

    if (engine) await chooseDropdown(frame, 'ENGINE', engine);
    if (ratio) await chooseDropdown(frame, 'FORMAT RATIO', ratio);
    if (visualLogic) await chooseDropdown(frame, 'VISUAL LOGIC', visualLogic);

    await frame.locator('button', { hasText: 'UNIFIED THEME' }).first().click();
    await frame.waitForTimeout(500);
    await frame.locator('textarea').first().fill(theme);

    let mode = 'UNIFIED THEME';
    if (shots.length) {
      await frame.locator('button', { hasText: 'SEQUENCE' }).first().click();
      await frame.waitForTimeout(600);
      const boxes = frame.locator('textarea[placeholder="Shot details..."]');
      const available = await boxes.count();
      for (let i = 0; i < shots.length && i < available; i += 1) await boxes.nth(i).fill(shots[i]);
      mode = 'SEQUENCE';
    }

    let referencesNote = null;
    if (Array.isArray(args.references) && args.references.length) {
      const existing = args.references.filter((ref) => typeof ref === 'string' && fs.existsSync(ref));
      const input = frame.locator('input[type="file"]').first();
      if (existing.length && (await input.count()) > 0) await input.setInputFiles(existing);
      else referencesNote = 'Global references were not uploaded: no file input is exposed by Grid Architect or no valid paths were given.';
    }

    const config = await readConfig(frame);
    const screenshot = await takeScreenshot(page, 'grid-architect-ready');
    saveMetadata(job.id, { type: 'grid_architect', config, mode, themePrompt: theme, shotCount: shots.length, projectId, toolId: opened.toolId, status: 'ready_for_confirmation' });
    const result = {
      status: 'ready_for_confirmation',
      type: 'grid_architect',
      message: 'Grid Architect is configured. GENERATE was not pressed (it spends credits); press it in the open Flow tab.',
      tool_url: opened.url,
      tool_copy_created: opened.created,
      mode,
      config,
      theme_prompt: theme,
      shots_filled: shots.length,
      references_note: referencesNote,
      project_url: routes.project(projectId),
      screenshot,
      jobId: job.id,
    };
    jobQueue.completeJob(job.id, result);
    return result;
  } catch (err) {
    if (page) await takeScreenshot(page, 'grid-architect-error');
    logger.error('Grid Architect failed', { error: err.message });
    jobQueue.failJob(job.id, err);
    throw err;
  }
}
