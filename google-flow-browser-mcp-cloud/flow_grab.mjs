// Grab the open Flow clip by reading its media URL from the page/network and fetching with the session cookies.
// usage: node flow_grab.mjs <outPath>
import fs from 'node:fs';
import { chromium } from 'playwright';

const outPath = process.argv[2];
const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const page = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
await page.bringToFront();

// 1) direct src from any <video> on the page
const srcs = await page.evaluate(() =>
  Array.from(document.querySelectorAll('video')).map((v) => ({ src: v.currentSrc || v.src, dur: v.duration, w: v.videoWidth, h: v.videoHeight }))
);
console.log('video elements:', JSON.stringify(srcs));

let url = srcs.map((s) => s.src).find((s) => s && /^https?:/.test(s));

// 2) if blob:, watch network for a media response and reload the viewer
if (!url || url.startsWith('blob:')) {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const found = [];
  cdp.on('Network.responseReceived', (e) => {
    const t = e.response && e.response.type;
    const u = e.response && e.response.url;
    if ((t === 'Media' || t === 'XHR' || t === 'Fetch') && u && /googleusercontent|googlevideo|\.mp4/i.test(u)) found.push(u);
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  console.log('network candidates:', JSON.stringify(found.slice(0, 6)));
  url = found.find((u) => /\.mp4|\/videoplayback|googleusercontent/.test(u));
}

if (!url) { console.log('NO MEDIA URL FOUND'); process.exit(3); }
console.log('fetching', url.slice(0, 160));
const res = await ctx.request.get(url);
console.log('status', res.status(), res.headers()['content-type'], res.headers()['content-length']);
if (res.status() !== 200) { console.log('BAD STATUS'); process.exit(4); }
const buf = await res.body();
fs.writeFileSync(outPath, buf);
console.log('SAVED', outPath, buf.length);
process.exit(0);
