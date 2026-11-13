// Inspect the Flow project grid: list media cards with their labels + geometry.
import { chromium } from 'playwright';

const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();

const info = await page.evaluate(() => {
  const out = [];
  // cards are typically elements with role=listitem or data-testid; collect by aria-label containing media-ish
  const all = Array.from(document.querySelectorAll('[aria-label]'));
  for (const el of all) {
    const lab = el.getAttribute('aria-label') || '';
    if (!/stud|chemistry|desk|Download|More options/i.test(lab)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 5 || r.height < 5) continue;
    out.push({ tag: el.tagName, label: lab.slice(0, 90), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), cls: (el.className || '').toString().slice(0, 60) });
  }
  return { url: location.href, scrollH: document.body.scrollHeight, items: out };
});
console.log(JSON.stringify(info, null, 1));
process.exit(0);
