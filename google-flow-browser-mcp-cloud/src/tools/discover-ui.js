import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { detectPageElements } from '../browser/safe-actions.js';
import { getFlowHome } from '../utils/config.js';
import { listExistingProjects, createNewProject } from '../navigation/project-navigator.js';
import { openFlowTool } from '../navigation/tool-navigator.js';
import { routes, parseFlowUrl, projectIdFromUrl, gotoFlow, goHome, getToolFrame, waitForVisible, SEL } from '../navigation/flow-ui.js';
import fs from 'fs';
import path from 'path';

const SELECTORS_PATH = path.join(getFlowHome(), 'config', 'selectors.map.json');

// Keys written for the retired labs.google UI; dropped on load so stale selectors never linger.
const LEGACY_KEYS = ['main', 'imageGeneration', 'videoGeneration', 'image-generation'];

function loadSelectors() {
  let map;
  try {
    map = JSON.parse(fs.readFileSync(SELECTORS_PATH, 'utf-8'));
  } catch {
    map = {};
  }
  for (const key of LEGACY_KEYS) delete map[key];
  for (const [key, value] of Object.entries(map)) {
    if (value && typeof value === 'object' && JSON.stringify(value).includes('labs.google')) delete map[key];
  }
  map._description = 'UI selectors map for Google Flow (flow.google.com). Per-page sections are rewritten by flow_discover_ui; the "stable" section is curated.';
  return map;
}

function saveSelectors(map) {
  map._lastUpdated = new Date().toISOString();
  fs.mkdirSync(path.dirname(SELECTORS_PATH), { recursive: true });
  fs.writeFileSync(SELECTORS_PATH, JSON.stringify(map, null, 2));
  logger.info('Selectors map saved');
}

// page argument -> key in selectors.map.json
const PAGE_KEYS = {
  main: 'home', home: 'home', project: 'project',
  image: 'project', 'image-generation': 'project', imagegeneration: 'project',
  video: 'project', 'video-generation': 'project', videogeneration: 'project',
  characters: 'characters', character: 'characters', scenes: 'scenes',
  'tools-gallery': 'toolsGallery', 'tools gallery': 'toolsGallery', tools: 'toolsGallery', toolsgallery: 'toolsGallery',
  grid: 'gridArchitect', 'grid-architect': 'gridArchitect',
};

/** Discovery must not litter the account with new projects: reuse the open/most recent one. */
async function projectForDiscovery(page) {
  const current = projectIdFromUrl(page.url());
  if (current) return current;
  const existing = await listExistingProjects(page);
  if (existing.length) return existing[0].id;
  return (await createNewProject(page, 'Flow UI discovery')).flowProjectId;
}

async function navigateFor(page, key) {
  if (key === 'home') { await goHome(page); return {}; }
  const projectId = await projectForDiscovery(page);
  switch (key) {
    case 'project': await gotoFlow(page, routes.project(projectId), { waitMs: 2500 }); await waitForVisible(page, SEL.promptBox, 30000, 'prompt box'); return { projectId };
    case 'characters': await gotoFlow(page, routes.character(projectId), { waitMs: 2500 }); return { projectId };
    case 'scenes': await gotoFlow(page, routes.project(projectId), { waitMs: 2500 }); await page.locator('button', { hasText: 'Scenes' }).first().click().catch(() => {}); await page.waitForTimeout(1500); return { projectId };
    case 'toolsGallery': await gotoFlow(page, routes.tools(projectId), { waitMs: 2500 }); return { projectId };
    case 'gridArchitect': { const opened = await openFlowTool(page, projectId, 'Grid Architect'); return { projectId, toolId: opened.toolId }; }
    default: throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unknown page "${key}".`);
  }
}

export async function handleDiscoverUi(args = {}) {
  const page = getPage();
  const pageName = args.page || 'main';
  const key = PAGE_KEYS[String(pageName).toLowerCase().trim()];
  if (!key) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unknown page "${pageName}". Options: main, project, image-generation, video-generation, characters, scenes, tools-gallery, grid-architect.`);
  logger.info('Discovering UI', { page: pageName, key });

  try {
    await navigateFor(page, key);
    await page.waitForTimeout(1500);
    const currentUrl = page.url();
    const title = await page.title();
    const screenshotPath = await takeScreenshot(page, `discover-${pageName}`);

    const elements = await detectPageElements(page);
    const frame = key === 'gridArchitect' ? await getToolFrame(page, { timeoutMs: 15000 }) : null;
    const frameElements = frame ? await detectPageElements(frame) : null;

    const visibleText = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const texts = [];
      while (walker.nextNode()) {
        const text = walker.currentNode.textContent?.trim();
        if (text && text.length > 2 && text.length < 200) texts.push(text);
      }
      return [...new Set(texts)].slice(0, 200);
    });
    const modelNames = visibleText.filter((t) => /Nano|Imagen|Veo|Omni|Model/i.test(t));
    const ratioTexts = visibleText.filter((t) => /^\d{1,2}:\d{1,2}$/.test(t));

    const info = parseFlowUrl(currentUrl);
    const selectorsMap = loadSelectors();
    selectorsMap[key] = {
      urlPattern: info.kind === 'project' ? `/project/<id>${info.section === 'project' ? '' : `/${info.section}`}` : new URL(currentUrl).pathname,
      title,
      discoveredAt: new Date().toISOString(),
      selectors: {
        buttons: elements.buttons,
        inputs: elements.inputs,
        links: elements.links.map((l) => ({ ...l, href: l.href.replace(/[0-9a-f-]{36}/gi, '<id>') })),
        headings: elements.headings,
        modelTexts: modelNames,
        ratioTexts,
        ...(frameElements ? { toolFrame: { buttons: frameElements.buttons, inputs: frameElements.inputs, headings: frameElements.headings } } : {}),
      },
    };
    saveSelectors(selectorsMap);

    return {
      status: 'discovered',
      page: pageName,
      pageKey: key,
      url: currentUrl,
      title,
      screenshot: screenshotPath,
      elements: {
        buttons: elements.buttons.map((b) => b.text).filter(Boolean),
        inputs: elements.inputs.map((i) => i.placeholder || i.ariaLabel || i.name).filter(Boolean),
        headings: elements.headings.map((h) => `${h.level}: ${h.text}`),
        visible_models: modelNames,
        visible_ratios: ratioTexts,
        ...(frameElements ? { tool_frame_buttons: frameElements.buttons.map((b) => b.text).filter(Boolean) } : {}),
      },
      totalButtonsFound: elements.buttons.length,
      totalInputsFound: elements.inputs.length,
    };
  } catch (err) {
    await takeScreenshot(page, `discover-error-${pageName}`);
    if (err instanceof FlowError) throw err;
    throw new FlowError(ErrorCodes.UNKNOWN_UI_CHANGE, `UI discovery failed for ${pageName}: ${err.message}`);
  }
}
