// Dump the settings overlay in detail: every button/radio inside the cdk-overlay-pane, with aria-labels.
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
  let page = null;
  for (const c of browser.contexts()) for (const p of c.pages()) if (p.url().includes('flow.google.com/project')) page = p;
  const paneVisible = await page.locator('.cdk-overlay-pane').first().isVisible().catch(() => false);
  if (!paneVisible) { await page.locator('button[aria-label="Settings trigger"]').first().click(); await page.waitForTimeout(1200); }
  // switch to Video and dump again
  const dump = async (tag) => page.evaluate((tag) => {
    const pane = [...document.querySelectorAll('.cdk-overlay-pane')].find(p => p.offsetParent !== null);
    if (!pane) return { tag, error: 'no pane' };
    const items = [...pane.querySelectorAll('button,[role="radio"],mat-radio-button,[role="button"],input,mat-select')]
      .map(b => ({
        tag: b.tagName, role: b.getAttribute('role'), label: b.getAttribute('aria-label'),
        text: (b.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        checked: b.getAttribute('aria-checked'), value: b.getAttribute('value'), type: b.getAttribute('type'),
        cls: (b.className || '').toString().slice(0, 70),
      }));
    return { tag, text: (pane.innerText || '').slice(0, 800), items };
  }, tag);
  console.log(JSON.stringify(await dump('image-mode'), null, 1).slice(0, 6000));
  // click the Video radio
  await page.locator('.cdk-overlay-pane [role="radio"]:has-text("Video")').first().click().catch(e => console.log('video click err', e.message));
  await page.waitForTimeout(1200);
  console.log(JSON.stringify(await dump('video-mode'), null, 1).slice(0, 7000));
  await page.screenshot({ path: '/home/you/Documents/Acme/05_Ops/cards/rework-V076-worn-scenario-20261111/work/flow_settings_video.png' });
  process.exit(0);
})().catch(e => { console.error('ERR', e.message); process.exit(2); });
