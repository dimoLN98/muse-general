import { getPage, isBrowserConnected } from '../browser/connect.js';
import { verifyAccountOnPage, isTrustedFlowRoute } from '../browser/account-check.js';
import { jobQueue } from '../queue/job-queue.js';
import { parseFlowUrl } from '../navigation/flow-ui.js';
import { get } from '../utils/config.js';

export async function handleFlowStatus() {
  const expectedAccount = get('expectedAccount');
  const status = {
    browserConnected: isBrowserConnected(), flowAccessible: false, loginRequired: false,
    accountVerified: false, account: null, expectedAccount, currentUrl: null, pageTitle: null,
    queue: jobQueue.getStatus(),
  };
  if (!status.browserConnected) return status;
  try {
    const page = getPage();
    status.currentUrl = page.url();
    status.pageTitle = await page.title();
    const parsed = new URL(status.currentUrl);
    status.loginRequired = parsed.origin === 'https://accounts.google.com';
    status.flowAccessible = isTrustedFlowRoute(parsed);
    if (status.flowAccessible) {
      try {
        const identity = await verifyAccountOnPage(page, expectedAccount);
        status.accountVerified = identity.verified;
        status.account = identity.verified ? expectedAccount : null;
        status.accountReason = identity.reason;
        // Flow's tool, scene, character and media-viewer pages hide the account chip; say so instead of implying a problem.
        const info = parseFlowUrl(status.currentUrl);
        if (!identity.verified && info.kind === 'project' && info.section !== 'project') {
          status.accountHint = 'This Flow page does not show the account chip. Run flow_account_check to re-verify (it returns to this page).';
        }
      } catch (error) {
        status.accountReason = error.code === 'WRONG_GOOGLE_ACCOUNT' ? 'wrong-account' : 'verification-error';
      }
    }
  } catch (error) { status.browserError = error.message; }
  return status;
}
