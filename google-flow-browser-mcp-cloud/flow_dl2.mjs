// Download the open Flow clip straight to disk via CDP download behavior (no Playwright artifact dir).
// usage: node flow_dl2.mjs <outDir>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const outDir = process.argv[2] || '/tmp/flowdl';
fs.mkdirSync(outDir, { recursive: true });
const before = new Set(fs.readdirSync(outDir));

const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();

const cdp = await ctx.newCDPSession(page);
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allowAndName', downloadPath: outDir, eventsEnabled: true });

// find the toolbar download control (header icons use material icon ligature 'download')
const cands = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('button, [role="button"]').forEach((b, i) => {
    const t = (b.innerText || '').trim();
    const a = (b.getAttribute('aria-label') || '').trim();
    const r = b.getBoundingClientRect();
    if (/download/i.test(t) || /download/i.test(a)) out.push({ i, t, a, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) });
  });
  return out;
});
console.log('download controls:', JSON.stringify(cands));
if (!cands.length) { console.log('NONE'); process.exit(2); }
// prefer the one in the header (small y)
cands.sort((p, q) => p.y - q.y);
const pick = cands[0];
console.log('picking', JSON.stringify(pick));
const btn = page.locator('button, [role="button"]').nth(pick.i);
await btn.click({ force: true });

for (let t = 0; t < 90; t++) {
  await page.waitForTimeout(1000);
  const now = fs.readdirSync(outDir).filter((f) => !before.has(f) && !f.endsWith('.crdownload'));
  if (now.length) {
    const f = now[0];
    const p = path.join(outDir, f);
    const sz = fs.statSync(p).size;
    if (sz > 200000) { console.log('DOWNLOADED', p, sz); process.exit(0); }
  }
}
console.log('TIMEOUT, files now:', fs.readdirSync(outDir));
process.exit(5);
