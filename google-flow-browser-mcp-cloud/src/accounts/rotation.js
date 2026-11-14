// Google Flow credit rotation across the user's three Google accounts (rule set by the user, 27 Oct 2026; clarified 13 Nov 2026).
// STAY ON ONE ACCOUNT. Stay on the ACTIVE account while its balance covers the next generation.
// * Do NOT switch accounts to harvest another account's daily 50 credits — the daily 50 on the other accounts simply expires unused while you stay put. Only switch when the active account cannot cover the next generation (its daily AND monthly credits are both spent).
// * When it cannot, mark it exhausted and move FORWARD to the next account (1->2->3). Never switch back.
//
//   order: #1 you@example.com -> #2 shohreh.hassani1968@gmail.com -> #3 drtalebikids@gmail.com
//
// * There is NO monthly reset back to #1: every account refills on its own billing date, so the
//   rotation only ever moves when the active account is empty.
// * Extension (documented): when #3 is short too, keep walking the ring (3->1->2) and take the first
//   account that shows credits again (one refilled on its billing date). When every account is short,
//   stop with ALL_ACCOUNTS_EXHAUSTED; the caller alerts the operator.
//
// Cloud edition (2026-11-13): the three accounts all live in ONE cloud browser, signed in to the
// same Google session (multi-account). Rotation switches accounts via Google's /u/N/ URL or the
// account switcher — there are no separate Chrome profiles here (userDataDir is null for every
// cloud account). Fallback order (verified live 2026-11-13):
//   #1 you@example.com            (Your Name)            /u/3/  637 cr, resets Nov 29 04:47 AM
//   #2 shohreh.hassani1968@gmail.com  (Shohreh Hassani)    /u/1/  444 cr, resets Dec 8 02:18 PM
//   #3 drtalebikids@gmail.com         (Mohammadreza Talebi) /u/2/   50 cr, refreshes daily 8:28 PM
// The /u/N/ indices come from the Google sign-in order in this browser session (shohreh u/1,
// drtalebikids u/2, musedraft u/3). They are stable unless accounts are added/removed — treat
// them as data to verify live, not permanent truth; the account switcher UI is the fallback, and
// the indices are recorded in config/flow.config.json (accountRotation) so they can be corrected.
// Each account has its OWN Flow projects and assets: "Acme Test" exists only on #1;
// ingredients must be re-uploaded per account (out of scope for the rotation wiring — see
// CLOUD-SETUP.md).
//
// This file is pure logic + a small JSON state store. Browser work (switching accounts in the cloud
// browser, reading the "<N> Google Flow credits" chip) is injected, so the whole policy is
// unit-tested with fakes in test/account-rotation.test.js. Wiring to the real browser lives in
// ./cloud-accounts.js (state) and ../cloud/cloud-queue.js (switch assignment).
import fs from 'node:fs';
import path from 'node:path';
import { FlowError, ErrorCodes } from '../utils/errors.js';

export const PROFILES_ROOT = '/home/you/workspace/acme-video/google-flow-browser-mcp/browser-profiles'; // Muse / Muse local patch 2026-11-12
export const DEFAULT_ACCOUNTS = Object.freeze([
  { index: 1, email: 'you@example.com', name: 'Your Name', userDataDir: null, flowUrlIndex: 3, projectUrl: 'https://flow.google.com/project/00000000-0000-0000-0000-000000000000', balanceNote: '637 credits, resets Nov 29 at 4:47 AM (verified 2026-11-13)' },
  { index: 2, email: 'shohreh.hassani1968@gmail.com', name: 'Shohreh Hassani', userDataDir: null, flowUrlIndex: 1, projectUrl: null, balanceNote: 'PRO, 444 credits, resets Dec 8 at 2:18 PM (verified 2026-11-13)' },
  { index: 3, email: 'drtalebikids@gmail.com', name: 'Mohammadreza Talebi', userDataDir: null, flowUrlIndex: 2, projectUrl: null, balanceNote: '50 credits, refreshes daily at 8:28 PM (verified 2026-11-13)' },
]);
export const DEFAULT_STATE_PATH = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'state', 'accounts.json');
export const RULE_TEXT = 'Cloud 3-account rotation (order: you@example.com -> shohreh.hassani1968@gmail.com -> drtalebikids@gmail.com). STAY ON ONE ACCOUNT: stay on the active account while its balance covers the next generation; do NOT switch to harvest another account\'s daily 50 credits (those simply expire unused). Switch ONLY when the active account cannot cover the next generation (its daily AND monthly credits are both spent), then mark it exhausted and move FORWARD to the next account. Never switch back. No monthly reset back to #1 — each account refills on its own billing date. When every account is short, stop with ALL_ACCOUNTS_EXHAUSTED. Switching accounts changes which Flow projects are visible; "Acme Test" exists only on #1 and ingredients must be re-uploaded per account.';
const HISTORY_LIMIT = 50;

// ---- cost estimate ------------------------------------------------------------------------------------------
// Flow credits are now billed per second for Omni 1.2 (see utils/video-models.js + FLOW-UI-MAP.md §6).
import { estimateVideoCredits, estimateEditCredits, DEFAULT_VIDEO_MODEL } from '../utils/video-models.js';

/** Pure: estimated credits for one request. kind 'video' | 'video_edit'. */
export function estimateCost({ kind = 'video', model = DEFAULT_VIDEO_MODEL, duration = null, quantity = 1, resolution = '720p' } = {}) {
  if (kind === 'video_edit') return estimateEditCredits({ duration: Number(duration) > 0 ? Number(duration) : 4, resolution });
  return estimateVideoCredits({ model, duration, quantity, resolution });
}


// ---- Flow's own "out of credits" answers ----------------------------------------------------------------------
const INSUFFICIENT = /(not enough|insufficient|out of|ran out of|run out of|no more|don'?t have enough|do not have enough|exceeded (?:your )?)\s+(?:google flow\s+|ai\s+)?credits|credits?\s+(?:are|is|have been)\s+(?:exhausted|depleted|used up)|(?:buy|purchase|get) more credits|credit limit (?:reached|exceeded)/i;

/** Pure: does this text read like Flow refusing for lack of credits? */
export function isInsufficientCreditsText(text) { return INSUFFICIENT.test(String(text || '')); }

/** Pure: did a handler error/result report insufficient credits (mid-request)? */
export function reportsInsufficientCredits(outcome) {
  if (!outcome) return false;
  if (outcome instanceof Error) return outcome.code === ErrorCodes.INSUFFICIENT_CREDITS || isInsufficientCreditsText(outcome.message);
  if (outcome.status === 'success') return false;
  return isInsufficientCreditsText([outcome.agent_reply, outcome.message, outcome.error].filter(Boolean).join(' \n '));
}

/** Pure: "1,023 Google Flow credits" -> 1023; null when no balance is present. */
export function parseCreditsText(text) {
  const m = String(text || '').match(/([\d][\d,.\s]*)\s*Google Flow credits/i);
  if (!m) return null;
  const n = Number(m[1].replace(/[,.\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}

// ---- state store ------------------------------------------------------------------------------------------------

function freshAccount(a) {
  return {
    index: a.index, email: a.email, user_data_dir: a.userDataDir ?? null,
    // Config-authoritative (from DEFAULT_ACCOUNTS / config accountRotation): never overwritten by stale state.
    name: a.name ?? null, flow_url_index: a.flowUrlIndex ?? null, project_url: a.projectUrl ?? null,
    balance_note: a.balanceNote ?? null,
    // Dynamic, persisted from the last live read.
    last_balance: null, last_balance_at: null, exhausted: false, exhausted_at: null,
    signed_in: null, signed_in_checked_at: null, last_served_at: null, cloud_verified: false,
  };
}

/** Pure: merge configured accounts (authoritative order/email/profile) with persisted dynamic fields. */
export function normalizeState(raw, accounts = DEFAULT_ACCOUNTS) {
  const saved = raw && typeof raw === 'object' ? raw : {};
  const byIndex = new Map((Array.isArray(saved.accounts) ? saved.accounts : []).map((a) => [a.index, a]));
  const list = accounts.map((a) => {
    const prev = byIndex.get(a.index) || {};
    const base = freshAccount(a);
    for (const key of Object.keys(base)) if (!['index', 'email', 'user_data_dir', 'name', 'flow_url_index', 'project_url', 'balance_note'].includes(key) && prev[key] !== undefined) base[key] = prev[key];
    return base;
  });
  const indexes = list.map((a) => a.index);
  return {
    version: 1,
    rule: RULE_TEXT,
    order: indexes,
    active_index: indexes.includes(saved.active_index) ? saved.active_index : indexes[0],
    all_exhausted_at: saved.all_exhausted_at ?? null,
    accounts: list,
    history: Array.isArray(saved.history) ? saved.history.slice(-HISTORY_LIMIT) : [],
    updated_at: saved.updated_at ?? null,
  };
}

function sleepSync(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

/**
 * JSON state store shared by every MCP instance (each client spawns its own
 * server on the same file). Writes are atomic (tmp + fsync + rename) under an O_EXCL lock file.
 */
export function createStateStore(statePath = DEFAULT_STATE_PATH, { accounts = DEFAULT_ACCOUNTS, now = () => new Date() } = {}) {
  const lockPath = `${statePath}.lock`;
  const readRaw = () => {
    try { return JSON.parse(fs.readFileSync(statePath, 'utf-8')); } catch (e) {
      if (e.code === 'ENOENT') return null;
      throw new FlowError(ErrorCodes.CONFIG_ERROR, `Account state ${statePath} is unreadable: ${e.message}`);
    }
  };
  const writeAtomic = (state) => {
    fs.mkdirSync(path.dirname(statePath), { recursive: true, mode: 0o700 });
    const tmp = `${statePath}.${process.pid}.${Date.now()}.tmp`;
    const fd = fs.openSync(tmp, 'w', 0o600);
    try { fs.writeSync(fd, `${JSON.stringify(state, null, 2)}\n`); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(tmp, statePath);
  };
  const withLock = (fn) => {
    fs.mkdirSync(path.dirname(statePath), { recursive: true, mode: 0o700 });
    const deadline = Date.now() + 10000;
    let fd = null;
    while (fd === null) {
      try { fd = fs.openSync(lockPath, 'wx', 0o600); } catch (e) {
        if (e.code !== 'EEXIST') throw e;
        try { if (Date.now() - fs.statSync(lockPath).mtimeMs > 30000) fs.rmSync(lockPath, { force: true }); } catch { /* raced */ }
        if (Date.now() > deadline) throw new FlowError(ErrorCodes.CONFIG_ERROR, `Account state lock ${lockPath} is busy.`);
        sleepSync(25);
      }
    }
    try { return fn(); } finally { fs.closeSync(fd); fs.rmSync(lockPath, { force: true }); }
  };
  return {
    path: statePath,
    load() { return normalizeState(readRaw(), accounts); },
    /** mutator(state) edits in place (or returns a new state); the result is written atomically. */
    update(mutator) {
      return withLock(() => {
        const state = normalizeState(readRaw(), accounts);
        const next = mutator(state) || state;
        next.updated_at = now().toISOString();
        writeAtomic(next);
        return next;
      });
    },
    ensure() { if (readRaw() === null) this.update(() => {}); return this.load(); },
  };
}

// ---- policy -----------------------------------------------------------------------------------------------------

export function notSignedInError(acc) {
  return new FlowError(ErrorCodes.ACCOUNT_NOT_SIGNED_IN,
    `account #${acc.index} (${acc.email}) not signed in to the cloud browser: sign it in to Google in the cloud browser first. flow_switch_account can only switch between accounts that are already signed in`,
    { account_index: acc.index, email: acc.email, fix: 'Sign the account in to Google in the cloud browser, then retry the switch.' });
}

export function balancesLine(state) {
  return state.accounts.map((a) => `#${a.index} ${a.email}: ${a.last_balance ?? '?'}${a.exhausted ? ' (exhausted)' : ''}`).join('; ');
}

export function allExhaustedError(state, cost) {
  const line = balancesLine(state);
  return new FlowError(ErrorCodes.ALL_ACCOUNTS_EXHAUSTED,
    `All Google Flow accounts are out of credits for this request (needs ${cost}). Balances: ${line}. `
      + `Stop and alert the operator: "Google Flow credits exhausted on all 3 accounts: ${line}"`,
    { cost, balances: state.accounts.map((a) => ({ index: a.index, email: a.email, balance: a.last_balance, exhausted: a.exhausted, exhausted_at: a.exhausted_at })) });
}

const nextIndexOf = (order, idx) => order[(order.indexOf(idx) + 1) % order.length];

export class AccountRotator {
  /**
   * deps.activate(account)    -> { signedIn: boolean, email?: string } : make the browser use this account's profile.
   * deps.readBalance(account) -> number | null                        : read "<N> Google Flow credits" (null = unreadable).
   * recheckAllExhaustedMs: after a full ring found nothing, fail fast for this long instead of relaunching 3 browsers per call.
   */
  constructor({ store, activate, readBalance, now = () => new Date(), log = () => {}, recheckAllExhaustedMs = 15 * 60 * 1000 }) {
    Object.assign(this, { store, activate, readBalance, now, log, recheckAllExhaustedMs });
  }

  status() { return this.store.load(); }

  active() { const s = this.store.load(); return s.accounts.find((a) => a.index === s.active_index); }

  /**
   * Make sure the account that will serve the next paid request can cover `cost`.
   * forceAdvance: the active account just failed mid-request for lack of credits -> mark it exhausted and
   * only consider the other accounts.
   * Returns { account, balance, cost, switched_from, checked: [{index,email,balance}] }.
   */
  async ensureCredits(cost, { forceAdvance = false, reason = 'balance below estimated cost' } = {}) {
    const state = this.store.load();
    const order = state.order;
    const startIdx = state.active_index;
    const stamp = () => this.now().toISOString();

    if (!forceAdvance && state.all_exhausted_at) {
      const age = this.now().getTime() - Date.parse(state.all_exhausted_at);
      const activeAcc = state.accounts.find((a) => a.index === startIdx);
      if (age >= 0 && age < this.recheckAllExhaustedMs && activeAcc?.exhausted) throw allExhaustedError(state, cost);
    }

    const checked = [];
    let idx = startIdx;
    let steps = order.length;
    if (forceAdvance) {
      const failedAt = stamp();
      this.store.update((s) => {
        const a = s.accounts.find((x) => x.index === startIdx);
        a.exhausted = true; a.exhausted_at = failedAt;
        s.history.push({ at: failedAt, event: 'exhausted', index: startIdx, reason: 'Flow reported insufficient credits mid-request' });
      });
      idx = nextIndexOf(order, startIdx);
      steps = order.length - 1;
    }

    let current = null;   // account the browser was last pointed at during this call
    try {
      for (let step = 0; step < steps; step += 1, idx = nextIndexOf(order, idx)) {
        const acc = this.store.load().accounts.find((a) => a.index === idx);
        const accountRef = { index: acc.index, email: acc.email, userDataDir: acc.user_data_dir, flowUrlIndex: acc.flow_url_index, name: acc.name };
        const activation = await this.activate(accountRef);
        current = idx;
        const signedAt = stamp();
        this.store.update((s) => { const a = s.accounts.find((x) => x.index === idx); a.signed_in = Boolean(activation?.signedIn); a.signed_in_checked_at = signedAt; });
        if (!activation?.signedIn) throw notSignedInError(acc);

        const balance = await this.readBalance(accountRef);
        const at = stamp();
        checked.push({ index: idx, email: acc.email, balance });
        const enough = balance === null || balance >= cost;
        this.store.update((s) => {
          const a = s.accounts.find((x) => x.index === idx);
          if (balance !== null) { a.last_balance = balance; a.last_balance_at = at; }
          if (enough) {
            a.exhausted = false; a.exhausted_at = null; a.last_served_at = at;
            s.all_exhausted_at = null;
            if (s.active_index !== idx) s.history.push({ at, event: 'switched', from: startIdx, to: idx, reason: forceAdvance ? 'Flow reported insufficient credits' : reason, checked });
            s.active_index = idx;
          } else if (!a.exhausted) {
            a.exhausted = true; a.exhausted_at = at;
            s.history.push({ at, event: 'exhausted', index: idx, balance, cost });
          }
        });
        if (enough) {
          if (balance === null) this.log('warn', 'Credit balance unreadable; proceeding on the active account', { index: idx });
          return { account: { index: idx, email: acc.email }, balance, cost, switched_from: idx !== startIdx ? startIdx : null, checked };
        }
        this.log('info', 'Account cannot cover the request; moving to the next account', { index: idx, balance, cost });
      }
    } catch (error) {
      await this.#restore(startIdx, current);
      throw error;
    }
    const at = stamp();
    const final = this.store.update((s) => { s.all_exhausted_at = at; s.history.push({ at, event: 'all_exhausted', cost, checked }); });
    await this.#restore(startIdx, current);
    throw allExhaustedError(final, cost);
  }

  // Leave the browser on the account that is still active, so free tools keep working after a failed switch.
  async #restore(startIdx, current) {
    if (current === null || current === startIdx) return;
    const acc = this.store.load().accounts.find((a) => a.index === startIdx);
    try { await this.activate({ index: acc.index, email: acc.email, userDataDir: acc.user_data_dir, flowUrlIndex: acc.flow_url_index, name: acc.name }); } catch (e) {
      this.log('warn', 'Could not return the browser to the active account', { index: startIdx, error: e.message });
    }
  }

  /** Record a balance read outside ensureCredits (e.g. after a generation). */
  recordBalance(index, balance) {
    if (balance === null || balance === undefined) return;
    const at = this.now().toISOString();
    this.store.update((s) => { const a = s.accounts.find((x) => x.index === index); if (a) { a.last_balance = balance; a.last_balance_at = at; } });
  }

  /**
   * Run one paid request with rotation: pre-check the balance, run, and if Flow itself reports insufficient
   * credits mid-request, switch to the next account and retry exactly once.
   * run(account) performs the request; canRetry(firstOutcome) may veto the retry (e.g. a media id that only exists on the old account).
   * Returns { result, served, first, retried }.
   */
  async runPaid({ cost, run, canRetry = () => true }) {
    const first = await this.ensureCredits(cost);
    let outcome;
    try { outcome = await run(first); } catch (error) { outcome = error; }
    if (!reportsInsufficientCredits(outcome)) {
      if (outcome instanceof Error) throw outcome;
      return { result: outcome, served: first, first, retried: false };
    }
    this.log('warn', 'Flow reported insufficient credits mid-request; switching account and retrying once', { index: first.account.index });
    if (!canRetry(outcome)) {
      await this.ensureCredits(cost, { forceAdvance: true }).catch(() => {});
      throw new FlowError(ErrorCodes.INSUFFICIENT_CREDITS, `Account #${first.account.index} ran out of credits mid-request and this request cannot be retried on another account (its source media lives on #${first.account.index}). Re-run it with a local source_file.`);
    }
    const second = await this.ensureCredits(cost, { forceAdvance: true });
    const result = await run(second);
    if (reportsInsufficientCredits(result)) {
      throw new FlowError(ErrorCodes.INSUFFICIENT_CREDITS, `Flow reported insufficient credits on account #${second.account.index} too (retried once).`);
    }
    return { result, served: second, first, retried: true };
  }
}
