// Scan loaded resources + page globals for media URLs.
import { chromium } from 'playwright';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
const res = await page.evaluate(() => {
  const urls = performance.getEntriesByType('resource').map((e) => e.name);
  const interesting = urls.filter((u) => /googleusercontent|\.mp4|videoplayback|media/i.test(u)).slice(0, 60);
  const html = document.documentElement.innerHTML;
  const m = html.match(/https:\/\/[^"'\\ ]{20,200}\.mp4[^"'\\ ]*/g) || [];
  const g = html.match(/https:\/\/[^"'\\ ]*(googleusercontent|googlevideo)[^"'\\ ]*/g) || [];
  return { n: urls.length, interesting, mp4: [...new Set(m)].slice(0, 10), gu: [...new Set(g)].slice(0, 15) };
});
console.log(JSON.stringify(res, null, 1));
process.exit(0);
