// Click the live "Settings trigger" in Flow and dump the settings panel structure.
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
  let page = null;
  for (const c of browser.contexts()) for (const p of c.pages()) if (p.url().includes('flow.google.com/project')) page = p;
  if (!page) { console.log('NO FLOW PROJECT PAGE'); process.exit(1); }
  const trigger = page.locator('button[aria-label="Settings trigger"]').first();
  console.log('trigger visible:', await trigger.isVisible().catch(() => false));
  await trigger.click();
  await page.waitForTimeout(1200);
  const dump = await page.evaluate(() => {
    const vis = (el) => el && el.offsetParent !== null;
    const panels = [...document.querySelectorAll('[role="dialog"], [role="menu"], .mat-mdc-menu-panel, .cdk-overlay-pane')].filter(vis);
    return {
      panels: panels.map(p => ({ cls: (p.className || '').toString().slice(0, 120), text: (p.innerText || '').slice(0, 1500) })),
      buttons: [...document.querySelectorAll('button,[role="button"],[role="radio"],mat-radio-button')]
        .filter(vis)
        .map(b => ({ label: b.getAttribute('aria-label'), role: b.getAttribute('role'), text: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80), checked: b.getAttribute('aria-checked') }))
        .filter(b => b.label || b.text),
      headings: [...document.querySelectorAll('h1,h2,h3,[role="heading"]')].filter(vis).map(h => (h.innerText || '').slice(0, 80)),
    };
  });
  console.log(JSON.stringify(dump, null, 1).slice(0, 12000));
  await page.screenshot({ path: '/home/you/Documents/Acme/05_Ops/cards/rework-V076-worn-scenario-20261111/work/flow_settings.png' });
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(2); });
