// Open a Flow grid tile by aria-label prefix and screenshot the viewer.
import { chromium } from 'playwright';
const prefix = process.argv[2] || 'Students discussing';
const shot = process.argv[3] || '/tmp/flow_viewer.png';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();
const tile = page.locator('flow-grid-tile-container').filter({ has: page.locator(`[aria-label^="${prefix}"]`) }).first();
const n = await tile.count();
console.log('tiles matched:', n);
if (!n) {
  const labels = await page.locator('flow-grid-tile-container').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
  console.log('all tile labels:', JSON.stringify(labels));
  process.exit(3);
}
await tile.scrollIntoViewIfNeeded();
await tile.click();
await page.waitForTimeout(3000);
await page.screenshot({ path: shot });
console.log('shot', shot, 'url', page.url());
// dump the details panel text
const txt = await page.evaluate(() => document.body.innerText.slice(0, 1200).replace(/\n{2,}/g, '\n'));
console.log('---BODY---\n' + txt);
process.exit(0);
