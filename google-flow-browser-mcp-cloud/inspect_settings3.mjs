// Deep dump of the new Flow settings overlay: footer buttons, model menu items, persistence behaviour.
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
  let page = null;
  for (const c of browser.contexts()) for (const p of c.pages()) if (p.url().includes('flow.google.com/project')) page = p;
  const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

  const paneOpen = await page.locator('.cdk-overlay-pane').first().isVisible().catch(() => false);
  if (!paneOpen) { await page.locator('button[aria-label="Settings trigger"]').first().click(); await page.waitForTimeout(1000); }
  // ensure Video mode
  const vidOn = await page.evaluate(() => {
    const r = [...document.querySelectorAll('.cdk-overlay-pane [role="radio"]')].find(e => /Video/.test(e.innerText));
    return r?.getAttribute('aria-checked');
  });
  if (vidOn !== 'true') { await page.locator('.cdk-overlay-pane [role="radio"]:has-text("Video")').first().click(); await page.waitForTimeout(800); }

  const footer = await page.evaluate(() => {
    const pane = [...document.querySelectorAll('.cdk-overlay-pane')].find(p => p.offsetParent !== null);
    const all = [...pane.querySelectorAll('button')].map(b => ({ label: b.getAttribute('aria-label'), text: (b.innerText || '').replace(/\s+/g, ' ').trim(), cls: (b.className || '').toString().slice(0, 60) }));
    const bottom = pane.getBoundingClientRect();
    return { all, rect: { h: Math.round(bottom.height), w: Math.round(bottom.width) } };
  });
  console.log('PANEL BUTTONS', JSON.stringify(footer, null, 1).slice(0, 4000));

  // resolution + length rows
  const rows = await page.evaluate(() => {
    const pane = [...document.querySelectorAll('.cdk-overlay-pane')].find(p => p.offsetParent !== null);
    return [...pane.querySelectorAll('*')].filter(e => e.children.length === 0 && (e.innerText || '').trim())
      .map(e => ({ t: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40), tag: e.tagName, cls: (e.className || '').toString().slice(0, 50) }))
      .slice(0, 60);
  });
  console.log('LEAVES', JSON.stringify(rows, null, 1).slice(0, 4000));

  // open model menu
  await page.locator('.cdk-overlay-pane button[aria-label="Select model family"]').first().click();
  await page.waitForTimeout(900);
  const menu = await page.evaluate(() => [...document.querySelectorAll('[role="menuitem"], .cdk-overlay-pane [role="menuitemradio"], mat-option')]
    .filter(e => e.offsetParent !== null)
    .map(e => ({ role: e.getAttribute('role'), text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60), label: e.getAttribute('aria-label') })));
  console.log('MODEL MENU', JSON.stringify(menu, null, 1).slice(0, 4000));
  const menus = await page.evaluate(() => [...document.querySelectorAll('.cdk-overlay-pane')].filter(p => p.offsetParent !== null).map(p => (p.innerText || '').replace(/\s+/g, ' ').slice(0, 600)));
  console.log('OVERLAY PANES', JSON.stringify(menus, null, 1).slice(0, 3000));
  await page.screenshot({ path: '/home/you/Documents/Acme/05_Ops/cards/rework-V076-worn-scenario-20261111/work/flow_model_menu.png' });
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(2); });
