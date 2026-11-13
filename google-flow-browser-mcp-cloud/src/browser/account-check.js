// Cloud edition: identity is proven by the agent in the signed-in cloud
// browser, not by reading a live local page (there is no local Chrome).
// The last verified result lives in state/cloud-connection.json, written by
// flow_cloud_complete after a flow_connect / flow_account_check task.
// verifyAccount() reads that record; it never touches a browser.
import { get } from '../utils/config.js';
import { FlowError, ErrorCodes } from '../utils/errors.js';
import { readCloudConnection } from '../cloud/cloud-connection.js';
import { parseFlowUrl, routes } from '../navigation/flow-ui.js';

export const ACCOUNT_SELECTOR = '[data-account-email], [role="button"][aria-label*="account" i], [role="button"][aria-label*="gmail" i], [aria-label*="Google Account" i]';

const unverified = (reason, extra = {}) => ({ verified: false, account: null, method: null, reason, ...extra });

/** The last identity the agent verified in the cloud browser (or unverified). */
export function verifyAccount() {
  const expected = get('expectedAccount');
  const record = readCloudConnection();
  if (!record.verified) return unverified('No verified cloud-browser sign-in on record. Run flow_connect first; its assignment verifies the account in the cloud browser.');
  if (!record.account) return unverified('Verified record has no account email.');
  if (record.account.toLowerCase() !== String(expected).toLowerCase()) {
    throw new FlowError(ErrorCodes.WRONG_GOOGLE_ACCOUNT, `The cloud browser is verified as ${record.account}, not the configured expected account ${expected}.`);
  }
  return { verified: true, account: expected, method: record.method || 'cloud-browser-verified', reason: null, verified_at: record.verified_at };
}

/** Same as verifyAccount in the cloud edition (no live page to recover to). */
export async function verifyAccountWithRecovery() {
  return verifyAccount();
}

/** No live page exists in the cloud edition. */
export async function visibleAccountEmails() {
  throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, 'Cloud edition: no local Chrome page to read account UI from. Verify the account in the cloud browser with flow_account_check.');
}

export function isTrustedFlowRoute(parsed) {
  if (parsed.origin === 'https://flow.google.com') return true;
  return parsed.origin === 'https://labs.google' && /^\/fx\/(?:[a-z]{2}\/)?tools\/flow(?:\/|$)/i.test(parsed.pathname);
}

export { parseFlowUrl, routes };
