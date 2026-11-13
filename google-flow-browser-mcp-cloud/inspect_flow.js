// Inspect the live Flow tab over CDP 9334: blocking dialogs, composer, model chip, tune/settings buttons.
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
  const ctxs = browser.contexts();
  let page = null;
  for (const c of ctxs) {
    for (const p of c.pages()) {
      const u = p.url();
      if (u.includes('flow.google.com')) page = p;
      console.log('PAGE', u, '|', (await p.title()).slice(0, 60));
    }
  }
  if (!page) { console.log('NO FLOW PAGE'); process.exit(1); }
  const info = await page.evaluate(() => {
    const out = {};
    out.url = location.href;
    // visible dialogs
    out.dialogs = [...document.querySelectorAll('[role="dialog"], dialog, [role="alertdialog"]')]
      .filter(d => d.offsetParent !== null)
      .map(d => (d.innerText || '').slice(0, 400));
    // aria-labelled buttons with text
    out.buttons = [...document.querySelectorAll('button,[role="button"]')]
      .filter(b => b.offsetParent !== null)
      .map(b => ({ label: b.getAttribute('aria-label'), text: (b.innerText || '').trim().slice(0, 60), cls: (b.className || '').toString().slice(0, 60) }))
      .filter(b => b.label || b.text);
    out.editable = [...document.querySelectorAll('[contenteditable="true"], textarea')]
      .filter(e => e.offsetParent !== null)
      .map(e => ({ ph: e.getAttribute('data-placeholder') || e.getAttribute('aria-label') || e.getAttribute('placeholder'), tag: e.tagName }));
    return out;
  });
  console.log(JSON.stringify(info, null, 1).slice(0, 9000));
  await page.screenshot({ path: '/home/you/Documents/Acme/05_Ops/cards/rework-V076-worn-scenario-20261111/work/flow_live.png', fullPage: false });
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(2); });
