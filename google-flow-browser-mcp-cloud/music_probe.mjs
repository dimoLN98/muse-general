import pkg from 'playwright-core';
const { chromium } = pkg;
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = b.contexts()[0];
const pages = ctx.pages().filter(p => p.url().includes('flowmusic'));
console.log('music tabs open:', pages.map(p=>p.url()));
const p = await ctx.newPage();
await p.goto('https://www.flowmusic.app/session', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(4000);
console.log('URL', p.url(), 'TITLE', await p.title());
const info = await p.evaluate(() => ({
  newSession: !!document.querySelector('button[aria-label="New session"]'),
  oldLib: !!document.querySelector('a[href="/library/my-songs"]'),
  cookie: [...document.querySelectorAll('button')].map(b=>b.innerText.trim()).filter(t=>/accept|agree|reject|consent/i.test(t)),
  signIn: [...document.querySelectorAll('a,button')].map(b=>b.innerText.trim()).filter(t=>/sign in/i.test(t)).slice(0,3),
  body: (document.body.innerText||'').replace(/\s+/g,' ').slice(0,400),
  ariaLabels: [...document.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label')).slice(0,40),
}));
console.log(JSON.stringify(info,null,1));
await p.screenshot({ path: '/home/you/Documents/Acme/05_Ops/cards/rework-V076-worn-scenario-20261111/work/music_probe.png' });
await p.close();
process.exit(0);
