import pkg from 'playwright-core';
const { chromium } = pkg;
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = b.contexts()[0];
const p = await ctx.newPage();
await p.goto('https://www.flowmusic.app/session', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(3000);
for (const t of ['No thanks','Agree']) { const btn = p.locator(`button:has-text("${t}")`).first(); if (await btn.count()) { await btn.click({timeout:3000}).catch(()=>{}); console.log('clicked', t); break; } }
await p.waitForTimeout(2500);
const info = await p.evaluate(() => ({
  url: location.href,
  buttons: [...document.querySelectorAll('button,a')].filter(e=>e.offsetParent!==null).map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), a:e.getAttribute('aria-label'), h:e.getAttribute('href')})).filter(x=>x.t||x.a).slice(0,60),
  textarea: [...document.querySelectorAll('textarea')].map(t=>t.getAttribute('aria-label')||t.placeholder),
  body: (document.body.innerText||'').replace(/\s+/g,' ').slice(0,600),
}));
console.log(JSON.stringify(info,null,1));
await p.screenshot({ path: '/home/you/Documents/Acme/05_Ops/cards/rework-V076-worn-scenario-20261111/work/music_probe2.png' });
await p.close();
process.exit(0);
