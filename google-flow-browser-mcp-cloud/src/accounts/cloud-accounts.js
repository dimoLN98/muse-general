// Cloud accounts state (cloud edition, 2026-11-13).
//
// The cloud browser has ONE Google session with THREE accounts signed in
// (multi-account). Rotation moves between them via the account switcher /
// /u/N/ URLs — there are no separate Chrome profiles here (userDataDir is
// null for every cloud account). The account list comes from
// config/flow.config.json `accountRotation` when present (it is the editable
// record of the /u/N/ indices and last verified balances); DEFAULT_ACCOUNTS
// in rotation.js is the built-in fallback with the same three accounts.
//
// Policy (the user, 27 Oct 2026) lives in rotation.js and is reused here:
// stay on the ACTIVE account while its balance covers the next generation;
// when it cannot, mark it exhausted and move FORWARD (1->2->3); NO monthly
// reset back to #1. When every account is short, stop with
// ALL_ACCOUNTS_EXHAUSTED.
//
// Per-account limitation: each Google account has its OWN Flow projects and
// assets. "Acme Test" exists only on #1 (musedraft); ingredients
// (mockups, logos) must be re-uploaded per account. Switching accounts
// changes which projects are visible — see CLOUD-SETUP.md.
//
// Live balance reads are queued cloud tasks (flow_account_check with
// balance_read) run by the agent in the signed-in cloud browser; the result
// lands via flow_cloud_complete. There is no local Chrome profile and no CDP.
import { createStateStore, balancesLine, DEFAULT_ACCOUNTS, RULE_TEXT } from './rotation.js';
import { get, getFlowHome } from '../utils/config.js';
import path from 'node:path';

const statePath = () => path.join(getFlowHome(), 'state', 'accounts.json');

/** The configured account list, as rotation.js account records. Config wins; DEFAULT_ACCOUNTS is the fallback. */
export function configuredAccounts() {
  const cfg = get('accountRotation', null);
  const list = Array.isArray(cfg?.accounts) ? cfg.accounts : null;
  if (list && list.length > 0) {
    return list.map((a) => ({
      index: a.index,
      email: a.email,
      name: a.name ?? null,
      userDataDir: null,
      flowUrlIndex: a.flowUrlIndex ?? null,
      projectUrl: a.projectUrl ?? null,
      balanceNote: a.balanceNote ?? null,
    }));
  }
  return DEFAULT_ACCOUNTS;
}

const store = () => createStateStore(undefined, { accounts: configuredAccounts() });

/** Full state, normalised against the configured account list (3 accounts, active_index, exhausted flags). */
export function readAccountsState() {
  return store().load();
}

/** The currently active account record (email, index, balance, projectUrl...). */
export function activeAccount() {
  const state = readAccountsState();
  return state.accounts.find((a) => a.index === state.active_index) || state.accounts[0];
}

export function activeAccountEmail() {
  return activeAccount()?.email || get('expectedAccount', 'you@example.com');
}

/** Record a balance read. `index` defaults to the active account. */
export function recordBalance(balance, index = null) {
  if (typeof balance !== 'number' || !Number.isFinite(balance)) return null;
  const at = new Date().toISOString();
  return store().update((s) => {
    const target = index ?? s.active_index;
    const a = s.accounts.find((x) => x.index === target);
    if (a) { a.last_balance = balance; a.last_balance_at = at; }
    return s;
  });
}

/**
 * Make `index` the active account (after a verified switch in the cloud browser).
 * Clears its exhausted flag, records the balance when given, and logs the switch in history.
 */
export function setActiveAccount(index, { balance = null, reason = 'switched via flow_switch_account' } = {}) {
  const at = new Date().toISOString();
  return store().update((s) => {
    const from = s.active_index;
    const a = s.accounts.find((x) => x.index === index);
    if (!a) throw new Error(`unknown account index ${index}`);
    a.exhausted = false; a.exhausted_at = null; a.last_served_at = at;
    if (balance !== null && balance !== undefined) { a.last_balance = balance; a.last_balance_at = at; }
    s.all_exhausted_at = null;
    if (from !== index) s.history.push({ at, event: 'switched', from, to: index, reason });
    s.active_index = index;
    return s;
  });
}

/** Same as setActiveAccount, looked up by email (the browser reports emails, not indices). */
export function setActiveByEmail(email, { balance = null, reason = 'switched via flow_switch_account' } = {}) {
  const state = readAccountsState();
  const acc = state.accounts.find((a) => a.email.toLowerCase() === String(email || '').toLowerCase());
  if (!acc) throw new Error(`account ${email} is not one of the configured rotation accounts`);
  return setActiveAccount(acc.index, { balance, reason });
}

/** Mark an account exhausted (Flow reported insufficient credits on it). */
export function markAccountExhausted(index, reason = 'Flow reported insufficient credits') {
  const at = new Date().toISOString();
  return store().update((s) => {
    const a = s.accounts.find((x) => x.index === index);
    if (!a) throw new Error(`unknown account index ${index}`);
    a.exhausted = true; a.exhausted_at = at;
    s.history.push({ at, event: 'exhausted', index, reason });
    return s;
  });
}

/** Mark the active account (or `index`) as verified in the cloud browser. */
export function markCloudVerified(verified, account) {
  const at = new Date().toISOString();
  return store().update((s) => {
    const target = typeof account === 'string'
      ? (s.accounts.find((a) => a.email.toLowerCase() === account.toLowerCase())?.index ?? s.active_index)
      : s.active_index;
    const a = s.accounts.find((x) => x.index === target);
    if (a) { a.cloud_verified = verified === true; a.signed_in = true; a.signed_in_checked_at = at; }
    return s;
  });
}

/**
 * flow_accounts tool body. refresh_active queues a balance-read task (done by
 * the caller) — never CDP. When `cost` is a number (estimated credits for the
 * next generation), adds a cost check: which accounts can cover it and which
 * one to switch to first (ring order starting at the active account).
 * Unknown balances (never read) are reported as unknown, never as covering.
 */
export function accountsReport({ refresh_active: refresh = false, balance_task_id = null, cost = null } = {}) {
  const state = readAccountsState();
  const active = state.accounts.find((a) => a.index === state.active_index) || state.accounts[0] || null;
  const out = {
    rule: state.rule || RULE_TEXT,
    state_file: statePath(),
    driver: 'cloud',
    active_index: state.active_index,
    active_email: active?.email || null,
    active_account: active ?? null,
    browser_profile_now: null,
    all_exhausted_at: state.all_exhausted_at ?? null,
    accounts: state.accounts,
    balances: balancesLine(state),
    recent_history: (state.history || []).slice(-10),
    rotation: {
      order: state.order,
      fallback: 'stay on the active account while its balance covers the next generation; when it cannot, mark it exhausted and move FORWARD to the next account (1->2->3); no monthly reset back to #1',
      switch_tool: 'flow_switch_account',
      per_account_projects: '"Acme Test" exists only on #1 (you@example.com). Each account has its own Flow projects and assets; ingredients must be re-uploaded per account.',
    },
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
    note: 'Cloud edition: the Flow sign-in lives in the cloud browser window, not a local Chrome profile. All three rotation accounts are signed in to the same Google session; switch with flow_switch_account. signed_in=false in this file means "not verified in the cloud browser", not "signed out of Flow".',
  };
  if (cost !== null && cost !== undefined) {
    const n = Number(cost);
    const ring = [...state.accounts].sort((a, b) => {
      const ia = (a.index - state.active_index + state.accounts.length) % state.accounts.length;
      const ib = (b.index - state.active_index + state.accounts.length) % state.accounts.length;
      return ia - ib;
    });
    const canCover = ring.map((a) => ({
      index: a.index, email: a.email,
      last_balance: a.last_balance,
      can_cover: a.last_balance === null ? null : (!a.exhausted && a.last_balance >= n),
      exhausted: a.exhausted,
    }));
    const recommended = canCover.find((c) => c.can_cover === true) || null;
    out.cost_check = {
      cost: n,
      can_cover: canCover,
      recommended,
      note: recommended
        ? (recommended.index === state.active_index
          ? 'The active account can cover this generation.'
          : `Switch to account #${recommended.index} (${recommended.email}) with flow_switch_account before generating.`)
        : 'No account has a verified balance covering this generation. Read the active balance first (refresh_active), or switch and read the next account.',
    };
  }
  return out;
}

/** Task payload for a balance-read assignment (see cloud-queue.js). */
export function buildTask({ account, taskId, assignment, cloudBrowserWindow, cloudProjectUrl }) {
  return {
    task_id: taskId,
    assignment,
    account,
    cloudBrowserWindow,
    cloudProjectUrl,
    created_at: new Date().toISOString(),
    status: 'pending',
    kind: 'balance_read',
  };
}
