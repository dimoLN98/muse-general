import { logger } from '../utils/logger.js';
import { get } from '../utils/config.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import {
  SEL, routes, parseFlowUrl, projectIdFromUrl, gotoFlow, goHome, openProject, waitForVisible, readAgentSettings, resolveModel,
} from './flow-ui.js';
import fs from 'fs';
import path from 'path';

const PROJECTS_FILE = path.resolve(get('flowHome', '.'), 'config', 'flow.projects.json');
// Flow projects belong to one Google account. Entries made before account rotation (27 Oct 2026) have no
// `account` field and live on account #1. Campaign reuse only matches projects of the account now active.
const LEGACY_PROJECT_ACCOUNT = 'you@example.com';
export function projectBelongsToAccount(entry, account = get('expectedAccount')) {
  return String(entry?.account || LEGACY_PROJECT_ACCOUNT).toLowerCase() === String(account || LEGACY_PROJECT_ACCOUNT).toLowerCase();
}

function loadProjects() {
  try {
    if (fs.existsSync(PROJECTS_FILE)) return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
  } catch (e) {
    logger.warn('Could not load projects file', { error: e.message });
  }
  return { projects: [] };
}

function saveProjects(data) {
  const dir = path.dirname(PROJECTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2));
}

/**
 * List projects shown on the Flow home page. Returns [{ id, name, url }] (Flow shows newest first).
 */
export async function listExistingProjects(page) {
  await goHome(page);
  await page.waitForTimeout(1000);
  const projects = await page.evaluate(() => {
    const seen = new Set();
    const out = [];
    for (const anchor of document.querySelectorAll('a[href^="/project/"]')) {
      const match = /^\/project\/([0-9a-f-]{36})/i.exec(anchor.getAttribute('href') || '');
      if (!match || seen.has(match[1])) continue;
      seen.add(match[1]);
      const card = anchor.closest('div, li, article') || anchor;
      const lines = (card.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean)
        .filter((line) => !['edit', 'delete', 'Open project'].includes(line));
      out.push({ id: match[1].toLowerCase(), name: lines.join(' | ') || '(untitled)' });
    }
    return out;
  });
  const result = projects.map((p) => ({ ...p, url: routes.project(p.id) }));
  logger.info('Existing projects found', { count: result.length });
  return result;
}

/** Rename the project that is currently open (header title is an inline editable field). */
export async function renameCurrentProject(page, name) {
  const title = String(name ?? '').trim().slice(0, 120);
  if (!title) return null;
  const input = page.locator(SEL.projectTitleInput).first();
  await waitForVisible(page, SEL.projectTitleInput, 10000, 'project title field');
  await input.click();
  await input.press('Control+A');
  await input.fill(title);
  await input.press('Enter');
  await page.waitForTimeout(800);
  const value = await input.inputValue().catch(() => '');
  if (value.trim() !== title) {
    throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, `Project rename did not stick (field shows "${value}").`);
  }
  return value.trim();
}

/**
 * Create a new project: click "New project" on the home page (Flow opens it immediately at
 * /project/<uuid>), optionally rename it, and record it in the local registry.
 */
export async function createNewProject(page, name, campaign) {
  logger.info('Creating new project...');
  await goHome(page);
  await page.locator('button:has-text("New project")').first().click();
  try {
    await page.waitForURL((url) => parseFlowUrl(url.href).kind === 'project', { timeout: 30000 });
  } catch {
    await takeScreenshot(page, 'new-project-failed');
    throw new FlowError(ErrorCodes.UNKNOWN_UI_CHANGE, 'Clicked "New project" but Flow did not open a project page.');
  }
  await waitForVisible(page, SEL.promptBox, 30000, 'new project prompt box');

  const projectId = projectIdFromUrl(page.url());
  let finalName = await page.locator(SEL.projectTitleInput).first().inputValue().catch(() => '');
  if (name) finalName = await renameCurrentProject(page, name);

  const store = loadProjects();
  const entry = {
    id: `proj_${Date.now()}`,
    flowProjectId: projectId,
    url: routes.project(projectId),
    name: finalName || name || `Project ${new Date().toISOString().slice(0, 10)}`,
    campaign: campaign || null,
    account: get('expectedAccount') || null,
    created_at: new Date().toISOString(),
    last_used: new Date().toISOString(),
    tasks: [],
  };
  store.projects.push(entry);
  saveProjects(store);
  await takeScreenshot(page, 'new-project');
  logger.info('New project created', { url: entry.url });
  return { url: entry.url, id: entry.id, flowProjectId: projectId, name: entry.name };
}

/**
 * Ensure we are inside a project context.
 * 1. Already in a project -> reuse it.
 * 2. context.campaign matches a stored project -> reopen it (if it still exists).
 * 3. Otherwise create a new project (named context.name when given).
 */
export async function ensureProjectInContext(page, context = {}) {
  const currentUrl = page.url();
  const info = parseFlowUrl(currentUrl);
  if (info.kind === 'project') {
    if (info.section !== 'project') await openProject(page, info.projectId);
    logger.info('Already in a project — reusing', { projectId: info.projectId });
    return { url: routes.project(info.projectId), reused: true, flowProjectId: info.projectId };
  }

  if (!context.forceNew && context.campaign) {
    const store = loadProjects();
    const match = store.projects.find((p) => p.campaign && p.campaign.toLowerCase() === String(context.campaign).toLowerCase() && projectBelongsToAccount(p));
    if (match) {
      try {
        await gotoFlow(page, match.url);
        await waitForVisible(page, SEL.promptBox, 20000, 'stored project prompt box');
        match.last_used = new Date().toISOString();
        saveProjects(store);
        logger.info('Reopened project from campaign history', { campaign: context.campaign, url: match.url });
        return { url: match.url, reused: true, id: match.id, name: match.name, flowProjectId: projectIdFromUrl(match.url) };
      } catch (e) {
        logger.warn('Stored project could not be reopened; creating a new one', { error: e.message });
      }
    }
  }
  return createNewProject(page, context.name, context.campaign);
}

const SECTION_ALIASES = {
  'all media': 'media', media: 'media', images: 'images', image: 'images', videos: 'videos', video: 'videos',
  characters: 'characters', personnages: 'characters', scenes: 'scenes', 'scènes': 'scenes',
  tools: 'tools', outils: 'tools', trash: 'trash', corbeille: 'trash', 'create tool': 'create-tool',
  'new character': 'character-new',
};
const SIDEBAR_LABEL = { media: 'All media', images: 'Images', videos: 'Videos', characters: 'Characters', scenes: 'Scenes' };

/**
 * Navigate to a section of the current project. Accepts English or legacy French names.
 * tools / trash / create-tool / new character are real routes; the media filters are sidebar buttons
 * on the project page. Returns true when the section is shown.
 */
export async function navigateToSidebar(page, section) {
  const key = SECTION_ALIASES[String(section ?? '').trim().toLowerCase()];
  if (!key) {
    logger.warn('Unknown sidebar section', { section });
    return false;
  }
  const projectId = projectIdFromUrl(page.url());
  if (!projectId) throw new FlowError(ErrorCodes.FLOW_PAGE_NOT_FOUND, 'Not inside a project; open or create one first.');

  const routeMap = {
    tools: routes.tools, trash: routes.trash, 'create-tool': routes.createTool, 'character-new': routes.character,
  };
  if (routeMap[key]) {
    await gotoFlow(page, routeMap[key](projectId), { waitMs: 1500 });
    return true;
  }

  if (parseFlowUrl(page.url()).section !== 'project') await openProject(page, projectId);
  const label = SIDEBAR_LABEL[key];
  const button = page.locator('button', { hasText: label }).first();
  if (!(await button.isVisible().catch(() => false))) {
    logger.warn('Sidebar button not visible', { section, label });
    return false;
  }
  await button.click();
  await page.waitForTimeout(1500);
  logger.info('Sidebar navigation done', { section, label, url: page.url() });
  return true;
}

/** Best-effort name of the current section, derived from the URL. */
export async function getActiveSidebarSection(page) {
  const info = parseFlowUrl(page.url());
  if (info.kind !== 'project') return null;
  const names = { project: 'media', tools: 'tools', 'create-tool': 'create-tool', trash: 'trash', character: 'characters', scene: 'scenes', edit: 'media', tool: 'tools' };
  return names[info.section] || null;
}

export function registerTaskInProject(projectId, taskInfo) {
  if (!projectId) return;
  const store = loadProjects();
  const proj = store.projects.find((p) => p.id === projectId || p.flowProjectId === projectId);
  if (proj) {
    proj.tasks.push({ ...taskInfo, timestamp: new Date().toISOString() });
    proj.last_used = new Date().toISOString();
    saveProjects(store);
  }
}

export async function getProjectContextInfo(page) {
  const info = parseFlowUrl(page.url());
  return {
    inProject: info.kind === 'project',
    url: page.url(),
    activeSection: await getActiveSidebarSection(page),
    projectId: info.projectId,
    itemId: info.itemId,
  };
}

/**
 * Flow no longer has Image/Video mode tabs: the agent decides, using the "Agent settings" defaults.
 * This verifies the image default really is an image model (never a video one) before any
 * image generation, and returns the current settings.
 */
export async function switchToImageMode(page) {
  const settings = await readAgentSettings(page);
  const imageModels = Object.keys(get('imageModels', {}));
  const current = settings.image.model;
  if (!imageModels.some((m) => m.toLowerCase() === current.toLowerCase()) && !resolveModel('image', current)) {
    throw new FlowError(ErrorCodes.UNKNOWN_UI_CHANGE,
      `Image default model "${current}" is not a known image model (${imageModels.join(', ')}). Refusing to generate.`);
  }
  return settings;
}
