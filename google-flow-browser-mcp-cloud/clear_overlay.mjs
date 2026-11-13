import { chromium } from 'playwright';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
let p=null; for (const c of b.contexts()) for (const q of c.pages()) if (q.url().includes('flow.google.com')) p=q;
for (let i=0;i<4;i++){ await p.keyboard.press('Escape'); await p.waitForTimeout(400); }
const n = await p.locator('.cdk-overlay-backdrop-showing').count();
console.log('backdrops showing after escape:', n);
process.exit(0);
