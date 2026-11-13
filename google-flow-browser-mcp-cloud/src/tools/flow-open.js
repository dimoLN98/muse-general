import { logger } from '../utils/logger.js';
import { getPage } from '../browser/connect.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { takeScreenshot } from '../utils/screenshots.js';
import { visibleAccountEmails } from '../browser/account-check.js';
import { FLOW_ORIGIN, routes, parseFlowUrl, gotoFlow } from '../navigation/flow-ui.js';

/** Open a Flow page (default: home) and report whether the signed-in app (not the marketing page) is showing. */
export async function handleFlowOpen(args = {}) {
  const page = getPage();
  const url = args.url || routes.home();
  if (new URL(url).origin !== FLOW_ORIGIN) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Only ${FLOW_ORIGIN} pages can be opened.`);
  logger.info('Opening Flow page', { url: url.substring(0, 80) });

  try {
    await gotoFlow(page, url, { waitMs: args.waitFor || 2500 });
    const info = parseFlowUrl(page.url());
    const accounts = await visibleAccountEmails(page).catch(() => []);
    await takeScreenshot(page, 'flow-opened');
    const isFlowPage = info.kind === 'home' || info.kind === 'project';
    const isLoggedIn = isFlowPage && accounts.length === 1;
    return {
      status: isLoggedIn ? 'connected' : 'needs_login',
      url: page.url(),
      title: await page.title(),
      isLoggedIn,
      isFlowPage,
      kind: info.kind,
    };
  } catch (err) {
    if (err instanceof FlowError) throw err;
    await takeScreenshot(page, 'flow-open-error');
    throw new FlowError(ErrorCodes.FLOW_PAGE_NOT_FOUND, `Failed to open Flow: ${err.message}`, { url });
  }
}
