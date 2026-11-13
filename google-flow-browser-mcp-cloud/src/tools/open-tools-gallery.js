import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { ensureProjectInContext } from '../navigation/project-navigator.js';
import { routes } from '../navigation/flow-ui.js';
import { listToolCards, openFlowTool } from '../navigation/tool-navigator.js';

/** Open the project's Tools page and list templates, community tools and the project's own tools. */
export async function handleOpenToolsGallery(args = {}) {
  const page = getPage();
  const project = await ensureProjectInContext(page, { name: args?.project_name, campaign: args?.campaign });
  const projectId = project.flowProjectId;
  const myTools = await listToolCards(page, projectId, 'My Tools');
  const templates = await listToolCards(page, projectId, 'Templates');
  const community = await listToolCards(page, projectId, 'Community');
  return {
    status: 'opened',
    url: routes.tools(projectId),
    title: await page.title(),
    my_tools: myTools,
    templates,
    community_count: community.length,
    community: community.slice(0, 20),
    screenshot: await takeScreenshot(page, 'tools-section'),
  };
}

export async function handleListTools(args = {}) {
  const result = await handleOpenToolsGallery(args);
  return { tools_found: { my_tools: result.my_tools, templates: result.templates }, screenshot: result.screenshot };
}

export async function handleOpenTool(args = {}) {
  const page = getPage();
  const toolName = args.name || args.tool_name;
  if (!toolName) throw new Error('Tool name is required');
  logger.info('Opening tool', { toolName, projectName: args.project_name });
  const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
  const opened = await openFlowTool(page, project.flowProjectId, toolName);
  return { status: 'opened', tool: opened.name, tool_id: opened.toolId, url: opened.url, copy_created: opened.created, screenshot: await takeScreenshot(page, 'tool-opened') };
}
