import { chromium } from 'playwright';
const url = process.argv[2];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();
if (url) { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); }
await page.waitForTimeout(4000);
const tiles = await page.locator('[aria-label]').evaluateAll((els) =>
  els.map((e) => e.getAttribute('aria-label')).filter((t) => t && t.length < 120)
);
console.log(JSON.stringify(tiles.slice(0, 80), null, 1));
const shot = '/tmp/flow_nav.png';
await page.screenshot({ path: shot, fullPage: false });
console.log('shot', shot, 'url', page.url());
process.exit(0);
