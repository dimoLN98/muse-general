// Cloud edition: flow_accounts reads the local state file only.
// There is no local Chrome profile and no CDP, so a live balance read is a
// queued cloud task (flow_account_check with balance_read) run by the agent
// in the signed-in cloud browser; the result lands via flow_cloud_complete.
import fs from 'node:fs';
import path from 'node:path';
import { getFlowHome } from '../utils/config.js';

const statePath = () => path.join(getFlowHome(), 'state', 'accounts.json');

export function readAccountsState() {
  try {
    return JSON.parse(fs.readFileSync(statePath(), 'utf-8'));
  } catch {
    return {
      version: 1,
      rule: 'Single account: Your Name, you@example.com. Stay on this account. No rotation.',
      order: [1], active_index: 1, all_exhausted_at: null, accounts: [],
      history: [], updated_at: null,
    };
  }
}

export function recordBalance(balance) {
  if (typeof balance !== 'number' || !Number.isFinite(balance)) return null;
  const state = readAccountsState();
  const active = state.accounts.find((a) => a.index === state.active_index) || state.accounts[0];
  if (!active) return null;
  active.last_balance = balance;
  active.last_balance_at = new Date().toISOString();
  state.updated_at = new Date().toISOString();
  fs.mkdirSync(path.dirname(statePath()), { recursive: true });
  fs.writeFileSync(statePath(), JSON.stringify(state, null, 2));
  return active;
}

export function markCloudVerified(verified, account) {
  const state = readAccountsState();
  const active = state.accounts.find((a) => a.index === state.active_index) || state.accounts[0];
  if (!active) return null;
  active.cloud_verified = verified === true;
  active.signed_in_checked_at = new Date().toISOString();
  state.updated_at = new Date().toISOString();
  fs.writeFileSync(statePath(), JSON.stringify(state, null, 2));
  return active;
}

/** flow_accounts tool body. refresh_active queues a balance-read task (done by the caller) — never CDP. */
export async function accountsReport({ refresh_active: refresh = false, balance_task_id = null } = {}) {
  const state = readAccountsState();
  const active = state.accounts.find((a) => a.index === state.active_index) || state.accounts[0] || null;
  return {
    rule: state.rule,
    state_file: statePath(),
    driver: 'cloud',
    active_index: state.active_index,
    active_email: active?.email || null,
    browser_profile_now: null,
    all_exhausted_at: state.all_exhausted_at,
    accounts: state.accounts,
    recent_history: (state.history || []).slice(-10),
    live: refresh
      ? {
          index: active?.index ?? null,
          balance: null,
          balance_task_id,
          note: balance_task_id
            ? 'Balance read queued as a cloud task — run it in the signed-in cloud browser, then flow_cloud_complete with the balance to update the last-read balance.'
            : 'No balance task was queued.',
        }
      : null,
    signin_command: null,
    status_command: 'flow_accounts (this tool)',
    note: 'Cloud edition: the Flow sign-in lives in the cloud browser window, not a local Chrome profile. signed_in=false in this file means "no local profile", not "signed out of Flow".',
  };
}
