// Open the tile context menu for a given tile label prefix, list its items, optionally click one.
import { chromium } from 'playwright';
const prefix = process.argv[2] || 'Students discussing';
const clickItem = process.argv[3] || '';
const shot = process.argv[4] || '/tmp/ctxmenu.png';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();
if (!page.url().includes('/project/') || page.url().includes('/edit/')) {
  await page.goto('https://flow.google.com/project/ba0ab769-89b6-4f48-8102-d183bbd9d73c', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
}
await page.waitForSelector('flow-grid-tile-container', { timeout: 30000 });
const tile = page.locator('flow-grid-tile-container').filter({ has: page.locator(`[aria-label^="${prefix}"]`) }).first();
await tile.scrollIntoViewIfNeeded();
await tile.hover();
await page.waitForTimeout(600);
const more = tile.locator('button[aria-label="More options"]').first();
console.log('more count', await more.count());
await more.click({ force: true });
await page.waitForTimeout(1200);
await page.screenshot({ path: shot });
const items = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('[role="menuitem"], .mat-mdc-menu-item, .mdc-list-item').forEach((e) => {
    const r = e.getBoundingClientRect();
    const t = (e.innerText || '').trim().replace(/\s+/g, ' ');
    if (r.width > 20 && t) out.push(t);
  });
  return out;
});
console.log('MENU ITEMS:', JSON.stringify(items));
if (clickItem) {
  const it = page.locator('[role="menuitem"], .mat-mdc-menu-item').filter({ hasText: new RegExp(clickItem, 'i') }).first();
  if (await it.count()) { console.log('clicking', (await it.innerText()).trim()); await it.evaluate((el) => el.click()); await page.waitForTimeout(1500); await page.screenshot({ path: shot.replace('.png', '_after.png') }); }
  else console.log('item not found');
}
console.log('shot', shot);
process.exit(0);
