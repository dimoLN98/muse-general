// After clicking "Download media", dump the menu and any media network responses.
import fs from 'node:fs';
import { chromium } from 'playwright';

const shot = '/home/you/Documents/Acme/05_Ops/cards/file-review-V075-e62ef5c9d3e66181/work/qc_v2/dlmenu.png';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();

const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
const hits = [];
cdp.on('Network.responseReceived', (e) => {
  const u = e.response.url, m = e.response.mimeType;
  if (/video|mp4|octet-stream/i.test(m || '') || /\.mp4|\/download/i.test(u)) hits.push({ u: u.slice(0, 200), m, status: e.response.status });
});
await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: '/home/you/Documents/Acme/05_Ops/cards/file-review-V075-e62ef5c9d3e66181/work/clips/dl3', eventsEnabled: true });

const btn = page.locator('button[aria-label="Download media"]').first();
await btn.click({ force: true });
await page.waitForTimeout(2500);
await page.screenshot({ path: shot });

const menu = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('[role="menuitem"], .mat-mdc-menu-item, .mdc-list-item, button').forEach((e) => {
    const r = e.getBoundingClientRect();
    const t = (e.innerText || '').trim().replace(/\s+/g, ' ');
    if (r.width > 20 && r.height > 10 && t && t.length < 70) out.push({ t, x: Math.round(r.x), y: Math.round(r.y) });
  });
  return out;
});
console.log('MENU:', JSON.stringify(menu.slice(0, 30)));
console.log('HITS:', JSON.stringify(hits.slice(0, 10)));
console.log('shot', shot);
process.exit(0);
