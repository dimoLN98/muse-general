import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { detectPageElements } from '../browser/safe-actions.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { ensureProjectInContext } from '../navigation/project-navigator.js';
import { openFlowTool } from '../navigation/tool-navigator.js';
import { getToolFrame } from '../navigation/flow-ui.js';

// Never click anything that looks like it starts a (credit-spending) run.
const RUN_WORDS = /generate|create|render|run|start|submit|export|apply|upscale/i;
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function applyParam(frame, key, value) {
  const k = escapeRegExp(key);
  const re = new RegExp(k, 'i');
  const field = frame.locator('textarea, input:not([type=file]):not([type=hidden]), select')
    .filter({ has: frame.locator('xpath=self::*') });
  const count = await field.count();
  for (let i = 0; i < count; i += 1) {
    const el = field.nth(i);
    const meta = await el.evaluate((node) => `${node.getAttribute('placeholder') || ''} ${node.getAttribute('aria-label') || ''} ${node.getAttribute('name') || ''} ${node.id || ''} ${node.closest('label')?.innerText || ''} ${node.previousElementSibling?.innerText || ''}`);
    if (!re.test(meta) || !(await el.isVisible().catch(() => false))) continue;
    const tag = await el.evaluate((node) => node.tagName.toLowerCase());
    if (tag === 'select') await el.selectOption({ label: String(value) }).catch(() => el.selectOption(String(value)));
    else await el.fill(String(value));
    return true;
  }
  // Button-style option: click a button whose label equals the value (only if it is not a run button).
  if (!RUN_WORDS.test(String(value))) {
    const option = frame.locator('button').filter({ hasText: new RegExp(`^${escapeRegExp(String(value))}$`, 'i') }).first();
    if (await option.isVisible().catch(() => false)) { await option.click(); return true; }
  }
  return false;
}

export async function handleUseFlowTool(args = {}) {
  const page = getPage();
  const toolName = args.tool_name || args.name;
  if (!toolName) throw new FlowError(ErrorCodes.INVALID_PARAMS, 'Tool name is required');

  const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
  const opened = await openFlowTool(page, project.flowProjectId, toolName);
  const frame = await getToolFrame(page);
  if (!frame) logger.warn('Tool app frame did not render', { tool: opened.name });

  const applied = [];
  const unapplied = [];
  if (frame && args.params && typeof args.params === 'object') {
    for (const [key, value] of Object.entries(args.params)) {
      if (typeof value !== 'string' && typeof value !== 'number') { unapplied.push(key); continue; }
      (await applyParam(frame, key, value).catch(() => false) ? applied : unapplied).push(key);
    }
  }

  const elements = frame ? await detectPageElements(frame).catch(() => null) : null;
  return {
    status: 'tool_opened',
    tool: opened.name,
    tool_id: opened.toolId,
    url: opened.url,
    copy_created: opened.created,
    params_applied: applied,
    params_not_applied: unapplied,
    elements: elements && {
      buttons: elements.buttons.map((b) => b.text).filter(Boolean).slice(0, 60),
      inputs: elements.inputs.slice(0, 30),
    },
    note: 'Nothing was run; start the tool yourself or ask for its controls to be filled further.',
    screenshot: await takeScreenshot(page, `tool-${opened.name.replace(/\W+/g, '-')}`),
  };
}
