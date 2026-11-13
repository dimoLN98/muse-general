// Live, read-only readers for the Flow account panel. Verified 2026-10-27 on flow.google.com (home and project
// pages, headful and headless): the header chip `flow-header-user-icon [role=button][aria-label="Account details"]`
// opens a dialog panel listing the account email and `span.credits-count` = "886 Google Flow credits". The count
// sits inside a link, so it is read, never clicked. Nothing here spends credits or changes settings.
import { parseCreditsText } from './rotation.js';

export const ACCOUNT_CHIP = 'flow-header-user-icon [aria-label="Account details"]';
export const CREDITS_COUNT = 'span.credits-count';
export const FLOW_HOME = 'https://flow.google.com/';
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

async function readPanel(page, timeoutMs) {
  const chip = page.locator(ACCOUNT_CHIP).first();
  await chip.waitFor({ state: 'visible', timeout: timeoutMs });
  await chip.click();
  try {
    await page.locator(CREDITS_COUNT).first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    const { countText, panelText } = await page.evaluate((sel) => {
      const count = document.querySelector(sel);
      const panel = count?.closest('[role=dialog], .panel') || document.querySelector('[role=dialog]');
      return { countText: count?.textContent || '', panelText: panel?.innerText || '' };
    }, CREDITS_COUNT);
    const credits = parseCreditsText(countText) ?? parseCreditsText(panelText);
    const emails = [...new Set((panelText.match(EMAIL) || []).map((e) => e.toLowerCase()))];
    return { credits, email: emails.length === 1 ? emails[0] : null };
  } finally {
    await closePanel(page);
  }
}

const BACKDROP = '.cdk-overlay-backdrop';
const backdropCount = (page) => page.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0).length, BACKDROP).catch(() => 0);

/**
 * Escape does NOT close this panel (verified 2026-10-27), and a left-open `cdk-overlay-backdrop` intercepts the next
 * click (it made flow_download_latest time out on the grid tiles). Click the backdrop's empty corner, then the chip.
 */
export async function closePanel(page) {
  for (let attempt = 0; attempt < 3 && (await backdropCount(page)) > 0; attempt += 1) {
    if (attempt < 2) await page.locator(BACKDROP).last().click({ position: { x: 4, y: 4 }, timeout: 3000 }).catch(() => {});
    else await page.locator(ACCOUNT_CHIP).first().click({ force: true, timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
  return (await backdropCount(page)) === 0;
}

/**
 * Read { credits, email } from the Flow account panel. Uses the current page when it shows the chip (home and
 * project root do); otherwise a temporary tab on Flow home, so the caller's project/page state is untouched.
 */
export async function readFlowAccountPanel(page, { timeoutMs = 20000 } = {}) {
  if (await page.locator(ACCOUNT_CHIP).first().isVisible().catch(() => false)) {
    try { return await readPanel(page, 4000); } catch { /* fall through to a temp tab */ }
  }
  const temp = await page.context().newPage();
  try {
    await temp.goto(FLOW_HOME, { waitUntil: 'domcontentloaded', timeout: 45000 });
    if (new URL(temp.url()).origin === 'https://accounts.google.com') return { credits: null, email: null, loginRequired: true };
    return await readPanel(temp, timeoutMs);
  } finally {
    await temp.close().catch(() => {});
  }
}

export async function readFlowCredits(page, opts) {
  return (await readFlowAccountPanel(page, opts)).credits;
}
