// Read-only probe of the live Flow model menu. Spends nothing, changes nothing.
//
// Use when the MCP cannot attach (flow_connect -> CDP_PORT_BUSY because the bot's own Chrome holds the port)
// or before any model/pricing edit. Connect to the already-running Chrome over CDP, open the agent-settings
// panel, and print the video/image model rows plus the items' selected state.
//
//   node scripts/probe-flow-models.mjs [cdpPort]
//
// Requires the integration repo's node_modules (playwright) and a Chrome already listening on the CDP port.
import { createRequire } from 'node:module';

const PORT = process.argv[2] || '9334';
const require = createRequire('/home/you/.config/profiles/acme/integrations/google-flow-browser-mcp/package.json');
const { chromium } = require('playwright');

const browser = await chromium.connectOverCDP(`http://127.0.0.1:${PORT}`);
const ctx = browser.contexts()[0];
const page = ctx.pages().find((p) => p.url().includes('flow.google.com')) || (await ctx.newPage());
await page.bringToFront().catch(() => {});
if (!page.url().includes('/project/')) {
  await page.goto('https://flow.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
}

// The agent-settings button is the TUNE `Settings` button (the header one is view settings).
const settings = page.locator('button[aria-label="Settings"]');
let opened = false;
for (let i = 0; i < (await settings.count()); i++) {
  const label = (await settings.nth(i).innerText().catch(() => '')) || '';
  if (/tune/.test(label)) {
    await settings.nth(i).click({ timeout: 5000 }).catch(() => {});
    opened = true;
    break;
  }
}
await page.waitForTimeout(1200);

// The panel is a SIDE PANEL, not a .cdk-overlay-pane: anchor on the section label and walk up.
const panel = await page.evaluate(() => {
  const anchor = Array.from(document.querySelectorAll('body *')).find(
    (e) => e.childElementCount === 0 && /Video generation default/i.test(e.innerText || ''),
  );
  if (!anchor) return null;
  let root = anchor;
  for (let i = 0; i < 8 && root.parentElement; i++) root = root.parentElement;
  return (root.innerText || '').replace(/\n+/g, ' | ');
});

// Menu items appear only once a model dropdown is open; report what is on screen either way.
const items = await page.evaluate(() =>
  Array.from(document.querySelectorAll('flow-menu-item, [role="menuitem"], [role="option"]')).map((e) => ({
    text: (e.innerText || '').trim().replace(/\n+/g, ' / '),
    selected: e.className.includes('selected') || e.getAttribute('aria-checked') === 'true',
  })),
);

// Clip tiles print `model • resolution • duration` under the prompt: the cheapest audit of real output.
const tiles = await page.evaluate(() =>
  Array.from(document.querySelectorAll('flow-grid-tile-container'))
    .slice(0, 12)
    .map((e) => (e.innerText || '').split('\n').filter((l) => /•/.test(l)).slice(0, 2))
    .flat(),
);

console.log(JSON.stringify({ url: page.url(), settings_opened: opened, panel, items, tile_meta: tiles }, null, 2));
await browser.close();
