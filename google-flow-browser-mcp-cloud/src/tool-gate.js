// Cloud edition identity gate.
//
// The original gate threw NOT_LOGGED_IN whenever the live local page could not
// prove the account. That cannot work here: there is no live page, only the
// last verified record in state/cloud-connection.json. So the cloud gate:
//   - never blocks queueing: browser tools may still enqueue while unverified,
//     but their assignment starts with "verify signed in as <active account>
//     first" (added by buildAssignment when ctx.verified is false);
//   - still throws WRONG_GOOGLE_ACCOUNT when the recorded account is not one
//     of the configured rotation accounts (3-account rotation, 2026-11-13);
//   - exempts the same tools as before, plus the new cloud tools and the
//     local-only tools (they need no account at all).
import { FlowError, ErrorCodes } from './utils/errors.js';
import { get } from './utils/config.js';
import { readCloudConnection } from './cloud/cloud-connection.js';
import { configuredAccounts } from './accounts/cloud-accounts.js';

const EXEMPT_TOOLS = new Set([
  'flow_connect', 'flow_disconnect', 'flow_status', 'flow_account_check', 'flow_switch_account', 'flow_queue_status',
  'flow_screenshot', 'flow_accounts',
  // pure, read-only registry lookup: no browser, no account, no credits
  'flow_video_options',
  // cloud plumbing + local-only tools: no account needed
  'flow_cloud_complete', 'flow_cloud_result',
  'flow_stitch_videos', 'flow_qc_report', 'flow_analyze_beats', 'flow_beat_sync',
  'flow_motion_overlay', 'flow_music_shorten',
]);

export const isIdentityExemptTool = (name) => EXEMPT_TOOLS.has(name);

/**
 * Cloud identity check. Returns { verified, account, reason } and never throws
 * for "not verified" — the caller enqueues anyway and the assignment carries
 * the verify-first preamble. Throws only when the recorded account is not one
 * of the configured rotation accounts.
 */
export function checkCloudIdentity() {
  const expected = get('expectedAccount');
  const allowed = configuredAccounts().map((a) => a.email.toLowerCase());
  const record = readCloudConnection();
  if (record.verified && record.account && !allowed.includes(record.account.toLowerCase())) {
    throw new FlowError(ErrorCodes.WRONG_GOOGLE_ACCOUNT, `The cloud browser is verified as ${record.account}, not one of the configured Flow accounts (${configuredAccounts().map((a) => a.email).join(', ')}). The default is ${expected}.`);
  }
  return {
    verified: record.verified === true,
    account: record.account || null,
    verified_at: record.verified_at || null,
    reason: record.verified ? null : 'No verified cloud-browser sign-in on record. Run flow_connect first; its assignment verifies the account in the cloud browser.',
  };
}

export async function enforceIdentityGate(name) {
  if (isIdentityExemptTool(name)) return null;
  return checkCloudIdentity();
}

export async function invokeWithIdentityGate(name, handler) {
  await enforceIdentityGate(name);
  return handler();
}
