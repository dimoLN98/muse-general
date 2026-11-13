import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { saveMetadata } from '../utils/file-manager.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { ensureProjectInContext, registerTaskInProject } from '../navigation/project-navigator.js';
import { SEL, routes, parseFlowUrl, openProject, waitForVisible, replaceFieldText, listTiles } from '../navigation/flow-ui.js';

const TITLE_INPUT = `${SEL.projectTitleInput}, input[aria-label="Editable text"]`;

/** Show the project's scenes (sidebar "Scenes" filter) and return them. */
export async function handleListScenes(args = {}) {
  const page = getPage();
  const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
  await openProject(page, project.flowProjectId);
  await page.locator('button', { hasText: 'Scenes' }).first().click();
  await page.waitForTimeout(2000);
  const scenes = (await listTiles(page)).filter((tile) => tile.type === 'scene');
  return {
    project_url: routes.project(project.flowProjectId),
    scenes: scenes.map((s) => ({ name: s.name, index: s.index })),
    count: scenes.length,
    screenshot: await takeScreenshot(page, 'scenes-list'),
  };
}

export async function handleOpenScenes(args = {}) {
  const page = getPage();
  const listing = await handleListScenes(args);
  return { ...listing, status: 'opened', url: page.url(), title: await page.title() };
}

/**
 * Create a scene shell in the project (header "+" > "New scene"). Flow scenes are timelines of *video clips*:
 * the editor only accepts a prompt once a clip is selected, and the clip picker lists generated videos.
 * So this creates and names the scene; it cannot place a prompt or characters inside it.
 */
export async function handleCreateScene(args = {}) {
  const prompt = typeof args.prompt === 'string' ? args.prompt.trim() : '';
  const characters = Array.isArray(args.characters) ? args.characters.filter((c) => typeof c === 'string') : [];
  const name = typeof args.name === 'string' && args.name.trim() ? args.name.trim().slice(0, 100) : null;
  const page = getPage();
  try {
    const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
    const projectId = project.flowProjectId;
    await openProject(page, projectId);
    await page.locator(SEL.addMediaMenu).first().click();
    await page.waitForTimeout(500);
    await page.locator('button[role="menuitem"]:has-text("New scene")').first().click();
    try {
      await page.waitForURL((url) => parseFlowUrl(url.href).section === 'scene' && parseFlowUrl(url.href).itemId, { timeout: 30000 });
    } catch {
      throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, 'Clicked "New scene" but Flow did not open a scene editor.');
    }
    const sceneId = parseFlowUrl(page.url()).itemId;
    await waitForVisible(page, 'button[aria-label="Add clip"]', 20000, 'scene editor');

    let finalName = await page.locator(TITLE_INPUT).first().inputValue().catch(() => null);
    if (name) finalName = await replaceFieldText(page, TITLE_INPUT, name, { commit: 'Enter' });

    const meta = { type: 'scene', sceneId, name: finalName, promptNotes: prompt || null, characters, projectId };
    saveMetadata(`scene-${sceneId.slice(0, 8)}`, meta);
    registerTaskInProject(projectId, { type: 'scene', sceneId, name: finalName });
    logger.info('Scene created', { sceneId });
    return {
      status: 'scene_created',
      scene_id: sceneId,
      name: finalName,
      scene_url: routes.scene(projectId, sceneId),
      project_url: routes.project(projectId),
      prompt_saved_locally: prompt || null,
      characters_requested: characters,
      note: 'The empty scene exists in Flow. Flow scenes are built from video clips, so the prompt and characters could not be placed inside it; they are only saved in local metadata. Generate videos (flow_generate_video) and add them as clips. To undo: move the scene to Trash in Flow.',
      screenshot: await takeScreenshot(page, 'scene-ready'),
    };
  } catch (err) {
    await takeScreenshot(page, 'create-scene-error');
    throw err;
  }
}

/**
 * Put a finished clip (or image) into a scene — Flow's own clip assembly. Verified menu path:
 * hover the project-grid tile > "More options" > "Add to scene". Flow then asks which scene, or offers
 * to make one. Adding a clip is free; only generating inside the scene spends credits.
 */
export async function handleAddToScene(args = {}) {
  const page = getPage();
  const sceneName = typeof args.scene_name === 'string' && args.scene_name.trim() ? args.scene_name.trim() : null;
  const wanted = typeof args.media_name === 'string' && args.media_name.trim() ? args.media_name.trim() : null;
  const index = Number.isInteger(args.media_index) ? args.media_index : 0;
  try {
    const project = await ensureProjectInContext(page, { name: args.project_name, campaign: args.campaign });
    await openProject(page, project.flowProjectId);
    await page.locator('button', { hasText: /^All media$/ }).first().click().catch(() => {});
    await page.waitForTimeout(2500);

    const tiles = await listTiles(page);
    const tile = wanted ? tiles.find((t) => (t.name || '').toLowerCase().includes(wanted.toLowerCase()))
      : tiles.filter((t) => t.type !== 'scene')[index];
    if (!tile) {
      throw new FlowError(ErrorCodes.NOT_FOUND, `No media tile matched ${wanted ? `"${wanted}"` : `index ${index}`}. Tiles: ${tiles.map((t) => t.name).join(', ')}`);
    }

    const tileEl = page.locator('flow-grid-tile-container').nth(tile.index);
    await tileEl.hover().catch(() => {});
    await page.waitForTimeout(800);
    await tileEl.locator('button[aria-label="More options"]').first().click({ timeout: 10000 });
    await page.waitForTimeout(1200);
    const addToScene = page.locator('[role="menuitem"]:has-text("Add to scene"), button:has-text("Add to scene")').first();
    if (!(await addToScene.count())) {
      throw new FlowError(ErrorCodes.FLOW_UI_CHANGED, 'The tile menu has no "Add to scene" entry any more.');
    }
    await addToScene.click({ timeout: 10000 });
    await page.waitForTimeout(2500);

    // Flow asks which scene to use; pick by name, else create one.
    let picked = null;
    const options = await page.locator('.cdk-overlay-pane [role="menuitem"], [role="menu"] [role="menuitem"], [role="dialog"] button').allInnerTexts().catch(() => []);
    const clean = options.map((t) => t.replace(/\s+/g, ' ').trim()).filter(Boolean);
    if (sceneName) {
      const match = page.locator('.cdk-overlay-pane [role="menuitem"], [role="menu"] [role="menuitem"], [role="dialog"] button')
        .filter({ hasText: new RegExp(sceneName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).first();
      if (await match.count()) { await match.click({ timeout: 8000 }); picked = sceneName; }
    }
    if (!picked) {
      const fresh = page.locator('.cdk-overlay-pane [role="menuitem"], [role="menu"] [role="menuitem"], [role="dialog"] button')
        .filter({ hasText: /new scene|create scene|create a scene/i }).first();
      if (await fresh.count()) { await fresh.click({ timeout: 8000 }); picked = 'new scene'; }
    }
    await page.waitForTimeout(3000);
    const after = await listTiles(page).catch(() => []);
    return {
      status: picked ? 'clip_added_to_scene' : 'clip_add_to_scene_needs_a_choice',
      media: { name: tile.name, type: tile.type },
      scene_choice: picked,
      options_offered: picked ? undefined : clean.slice(0, 12),
      project_url: routes.project(project.flowProjectId),
      tiles_now: after.map((t) => ({ name: t.name, type: t.type })),
      note: picked
        ? 'Flow assembles scenes from clips: open the scene (or the clip) to reorder, trim and export it as one file.'
        : 'Flow is waiting to be told which scene; re-run with scene_name, or create one with flow_create_scene.',
      credits_used: 0,
      screenshot: await takeScreenshot(page, 'add-to-scene'),
    };
  } catch (err) {
    await takeScreenshot(page, 'add-to-scene-error');
    throw err;
  }
}
