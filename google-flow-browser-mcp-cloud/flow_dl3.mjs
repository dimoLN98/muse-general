// Click the tile context-menu Download and capture the file via CDP download behavior.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const prefix = process.argv[2] || 'Students discussing';
const outDir = process.argv[3] || '/tmp/flowdl';
fs.mkdirSync(outDir, { recursive: true });
const before = new Set(fs.readdirSync(outDir));

const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: outDir, eventsEnabled: true });
await cdp.send('Network.enable');
const hits = [];
cdp.on('Network.responseReceived', (e) => {
  const u = e.response.url, m = e.response.mimeType || '';
  if (/video\/mp4|octet-stream/i.test(m) || /\.mp4/.test(u)) hits.push({ u: u.slice(0, 180), m, s: e.response.status });
});

if (!page.url().includes('/project/') || page.url().includes('/edit/')) {
  await page.goto('https://flow.google.com/project/ba0ab769-89b6-4f48-8102-d183bbd9d73c', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
}
await page.keyboard.press('Escape'); await page.waitForTimeout(400); await page.keyboard.press('Escape'); await page.waitForTimeout(400);
const tile = page.locator('flow-grid-tile-container').filter({ has: page.locator(`[aria-label^="${prefix}"]`) }).first();
await tile.scrollIntoViewIfNeeded();
await tile.hover();
await page.waitForTimeout(500);
await tile.locator('button[aria-label="More options"]').first().click({ force: true });
await page.waitForTimeout(1000);
const dl = page.locator('[role="menuitem"]').filter({ hasText: /^download Download$|download/i }).first();
console.log('download menu item count', await dl.count());
await dl.evaluate((el) => el.click());
await page.waitForTimeout(1800);
await page.screenshot({ path: '/home/you/Documents/Acme/05_Ops/cards/file-review-V075-e62ef5c9d3e66181/work/qc_v2/afterdl.png' });
const sub = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('[role="menuitem"], .mat-mdc-menu-item').forEach((e) => {
    const r = e.getBoundingClientRect(); const t = (e.innerText || '').trim().replace(/\s+/g, ' ');
    if (r.width > 20 && t) out.push(t);
  });
  return out;
});
console.log('after-click items:', JSON.stringify(sub.slice(-12)));
const orig = page.locator('[role="menuitem"]').filter({ hasText: /720p Original size/i }).first();
console.log('720p item count', await orig.count());
if (await orig.count()) { await orig.evaluate((el) => el.click()); console.log('clicked 720p original'); }

for (let t = 0; t < 120; t++) {
  await page.waitForTimeout(1000);
  const now = fs.readdirSync(outDir).filter((f) => !before.has(f) && !f.endsWith('.crdownload'));
  if (now.length) {
    const p = path.join(outDir, now[0]);
    if (fs.statSync(p).size > 300000) { console.log('DOWNLOADED', p, fs.statSync(p).size); console.log('HITS', JSON.stringify(hits.slice(0, 6))); process.exit(0); }
  }
}
console.log('TIMEOUT files', fs.readdirSync(outDir), 'HITS', JSON.stringify(hits.slice(0, 6)));
process.exit(5);
