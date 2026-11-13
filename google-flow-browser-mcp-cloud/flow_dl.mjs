// Download the currently-open Flow media via its Download button (right details panel).
// usage: node flow_dl.mjs <outPath> [x,y]
import fs from 'node:fs';
import { chromium } from 'playwright';

const outPath = process.argv[2];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();

// find the download button in the details panel (x > 1000)
const btns = await page.locator('button[aria-label="Download"]').all();
console.log('download buttons:', btns.length);
let target = null;
for (const b of btns) { const box = await b.boundingBox(); if (box && box.x > 1000) { target = b; console.log('using panel download at', box); break; } }
if (!target && btns.length) target = btns[0];
if (!target) { console.log('NO DOWNLOAD BUTTON'); process.exit(2); }

await target.click();
await page.waitForTimeout(1200);
const items = await page.locator('[role="menuitem"], .mat-mdc-menu-item, button').evaluateAll((els) =>
  els.filter((e) => { const r = e.getBoundingClientRect(); return r.width > 10 && r.height > 10; })
     .map((e) => (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '))
     .filter((t) => t && t.length < 60)
);
console.log('visible items after click:', JSON.stringify(items.slice(0, 40)));

const dl = page.waitForEvent('download', { timeout: 90000 });
const cand = page.locator('[role="menuitem"], .mat-mdc-menu-item').filter({ hasText: /mp4|original|720|1080/i }).first();
if (await cand.count()) {
  console.log('clicking:', (await cand.innerText()).trim());
  await cand.evaluate((el) => el.click());
} else {
  console.log('no mp4 menu item found; trying first menuitem');
  const first = page.locator('[role="menuitem"], .mat-mdc-menu-item').first();
  if (await first.count()) await first.evaluate((el) => el.click());
}
const d = await dl;
await d.saveAs(outPath);
console.log('SAVED', outPath, fs.statSync(outPath).size);
process.exit(0);
