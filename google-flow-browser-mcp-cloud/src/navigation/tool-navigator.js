import { logger } from '../utils/logger.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { SEL, routes, parseFlowUrl, gotoFlow, waitForVisible, getToolFrame } from './flow-ui.js';

const TABS = ['My Tools', 'Community', 'Templates'];
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function selectTab(page, tab) {
  const radio = page.locator('button[role="radio"]', { hasText: tab }).first();
  await waitForVisible(page, 'button[role="radio"]', 20000, 'tools tabs');
  if ((await radio.getAttribute('aria-checked')) !== 'true') {
    await radio.click();
    await page.waitForTimeout(1800);
  }
}

/** Cards of one tab of the project's Tools page: [{ name, author, description }]. */
export async function listToolCards(page, projectId, tab) {
  if (!TABS.includes(tab)) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unknown tools tab "${tab}". Use: ${TABS.join(', ')}`);
  const info = parseFlowUrl(page.url());
  if (!(info.projectId === projectId && info.section === 'tools')) await gotoFlow(page, routes.tools(projectId), { waitMs: 1500 });
  await selectTab(page, tab);
  return page.evaluate(() => [...document.querySelectorAll('.applet-card')].map((card) => {
    const lines = (card.innerText || '').split('\n').map((l) => l.trim()).filter((l) => l && l !== 'more_vert' && l !== 'add');
    const name = (card.querySelector('.applet-name')?.innerText || lines[0] || '').trim();
    const rest = lines.filter((l) => l !== name);
    return { name, author: rest.length > 1 ? rest[0] : null, description: rest.length ? rest[rest.length - 1] : null };
  }).filter((c) => c.name && c.name !== 'Create New'));
}

/**
 * Open a tool by name. Reuses an existing copy in "My Tools" (named "Remix of <tool>" or the tool name);
 * otherwise clicking a Template/Community card makes a copy in the project. Returns { toolId, url, created, source }.
 */
export async function openFlowTool(page, projectId, toolName) {
  const wanted = String(toolName ?? '').trim();
  if (!wanted) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Tool name is required.');
  const exact = new RegExp(`^(Remix of )?${escapeRegExp(wanted)}$`, 'i');
  const available = {};

  for (const tab of TABS) {
    const cards = await listToolCards(page, projectId, tab);
    available[tab] = cards.map((c) => c.name);
    const match = cards.find((c) => exact.test(c.name)) || cards.find((c) => c.name.toLowerCase().includes(wanted.toLowerCase()));
    if (!match) continue;
    const created = tab !== 'My Tools';
    logger.info('Opening Flow tool', { tool: match.name, tab, createsCopy: created });
    await page.locator('.applet-card').filter({ has: page.locator('.applet-name', { hasText: new RegExp(`^${escapeRegExp(match.name)}$`) }) }).first().click();
    try {
      await page.waitForURL((url) => parseFlowUrl(url.href).section === 'tool' && parseFlowUrl(url.href).itemId, { timeout: 30000 });
    } catch {
      throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, `Clicked tool "${match.name}" but Flow did not open it.`);
    }
    const toolId = parseFlowUrl(page.url()).itemId;
    return { toolId, url: routes.tool(projectId, toolId), created, source: tab, name: match.name };
  }
  throw new FlowError(ErrorCodes.INVALID_PARAMS, `Tool "${wanted}" not found.`, { available });
}

export { getToolFrame, SEL };
