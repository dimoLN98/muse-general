import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  AccountRotator, createStateStore, DEFAULT_ACCOUNTS, estimateCost, parseCreditsText, isInsufficientCreditsText,
  reportsInsufficientCredits, normalizeState,
} from '../src/accounts/rotation.js';
import { projectBelongsToAccount } from '../src/navigation/project-navigator.js';
// NOTE: the local-edition modules src/accounts/signin.js and
// src/accounts/runtime.js do not exist in the cloud edition (no local Chrome
// profiles, no google-chrome launcher). The signin-command and
// stale-singleton tests from the old rotation suite were dropped with them;
// the cloud switch path (flow_switch_account) is covered by the smoke test.

const tmpState = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'flow-accounts-test-')), 'state', 'accounts.json');

/** Fake world: per-account balances and sign-in, plus a log of which profile the "browser" was pointed at. */
function world({ balances = { 1: 100, 2: 100, 3: 100 }, signedIn = { 1: true, 2: true, 3: true }, now = new Date('2026-10-27T20:00:00Z'), statePath = tmpState(), recheckAllExhaustedMs } = {}) {
  const store = createStateStore(statePath, { now: () => clock.now });
  const clock = { now };
  const activations = [];
  const reads = [];
  let browserOn = null;
  const rotator = new AccountRotator({
    store,
    now: () => clock.now,
    recheckAllExhaustedMs,
    activate: async (acc) => { activations.push(acc.index); browserOn = acc.index; return { signedIn: signedIn[acc.index], email: acc.email }; },
    readBalance: async (acc) => { reads.push(acc.index); return balances[acc.index]; },
  });
  return { store, rotator, activations, reads, balances, signedIn, clock, browserOn: () => browserOn };
}

test('stays on the active account while its balance covers the request', async () => {
  const w = world({ balances: { 1: 50, 2: 999, 3: 999 } });
  for (let i = 0; i < 3; i += 1) {
    const got = await w.rotator.ensureCredits(7);
    assert.equal(got.account.index, 1);
    assert.equal(got.switched_from, null);
    w.balances[1] -= 7;
  }
  assert.deepEqual([...new Set(w.activations)], [1]);
  assert.deepEqual([...new Set(w.reads)], [1]);
  const s = w.store.load();
  assert.equal(s.active_index, 1);
  assert.equal(s.accounts[0].last_balance, 36);
  assert.equal(s.accounts[0].exhausted, false);
});

test('switches 1 -> 2 when #1 cannot cover the next generation, and records exhausted_at', async () => {
  const w = world({ balances: { 1: 6, 2: 1000, 3: 1000 } });
  const got = await w.rotator.ensureCredits(7);
  assert.equal(got.account.index, 2);
  assert.equal(got.account.email, 'shohreh.hassani1968@gmail.com');
  assert.equal(got.switched_from, 1);
  assert.equal(w.browserOn(), 2);
  const s = w.store.load();
  assert.equal(s.active_index, 2);
  assert.equal(s.accounts[0].exhausted, true);
  assert.equal(s.accounts[0].exhausted_at, '2026-10-27T20:00:00.000Z');
  assert.equal(s.accounts[0].last_balance, 6);
  assert.equal(s.accounts[1].last_balance, 1000);
  assert.ok(s.history.some((h) => h.event === 'switched' && h.from === 1 && h.to === 2));
  // and it stays on #2 afterwards (no going back to #1)
  const again = await w.rotator.ensureCredits(7);
  assert.equal(again.account.index, 2);
  assert.ok(!w.activations.slice(2).includes(1));
});

test('switches 2 -> 3', async () => {
  const w = world({ balances: { 1: 0, 2: 10, 3: 500 } });
  w.store.update((s) => { s.active_index = 2; s.accounts[0].exhausted = true; s.accounts[0].exhausted_at = '2026-10-20T00:00:00.000Z'; });
  const got = await w.rotator.ensureCredits(40);
  assert.equal(got.account.index, 3);
  assert.equal(got.account.email, 'drtalebikids@gmail.com');
  assert.deepEqual(w.activations, [2, 3]);
  const s = w.store.load();
  assert.equal(s.active_index, 3);
  assert.equal(s.accounts[1].exhausted, true);
  assert.equal(s.accounts[0].exhausted_at, '2026-10-20T00:00:00.000Z', 'earlier exhaustion time is kept');
});

test('all three exhausted -> ALL_ACCOUNTS_EXHAUSTED listing every balance, browser back on the active account', async () => {
  const w = world({ balances: { 1: 3, 2: 0, 3: 5 } });
  w.store.update((s) => { s.active_index = 3; });
  await assert.rejects(() => w.rotator.ensureCredits(7), (error) => {
    assert.equal(error.code, 'ALL_ACCOUNTS_EXHAUSTED');
    assert.match(error.message, /#1 musedraft@gmail\.com: 3/);
    assert.match(error.message, /#2 shohreh\.hassani1968@gmail\.com: 0/);
    assert.match(error.message, /#3 drtalebikids@gmail\.com: 5/);
    assert.match(error.message, /Stop and alert the operator/);
    assert.deepEqual(error.details.balances.map((b) => b.balance), [3, 0, 5]);
    return true;
  });
  assert.deepEqual(w.activations, [3, 1, 2, 3], 'ring 3 -> 1 -> 2, then back to the active #3');
  const s = w.store.load();
  assert.equal(s.active_index, 3, 'active does not move when nothing has credits');
  assert.ok(s.all_exhausted_at);
  assert.ok(s.accounts.every((a) => a.exhausted));

  // within the recheck window it fails fast without relaunching browsers
  w.activations.length = 0;
  await assert.rejects(() => w.rotator.ensureCredits(7), /ALL|out of credits/i);
  assert.deepEqual(w.activations, []);
});

test('wrap-around extension: after #3 runs dry, the first account in order with credits again is used', async () => {
  const w = world({ balances: { 1: 1000, 2: 0, 3: 2 } });
  w.store.update((s) => { s.active_index = 3; s.accounts[0].exhausted = true; s.accounts[1].exhausted = true; });
  const got = await w.rotator.ensureCredits(7);
  assert.equal(got.account.index, 1);
  const s = w.store.load();
  assert.equal(s.active_index, 1);
  assert.equal(s.accounts[0].exhausted, false);
  assert.equal(s.all_exhausted_at, null);
});

test('after the recheck window an all-exhausted ring is re-read and a refilled account is picked up', async () => {
  const w = world({ balances: { 1: 0, 2: 0, 3: 0 }, recheckAllExhaustedMs: 60_000 });
  await assert.rejects(() => w.rotator.ensureCredits(7), /ALL|out of credits/i);
  w.balances[2] = 1000;   // #2's billing date arrives
  w.clock.now = new Date(w.clock.now.getTime() + 61_000);
  const got = await w.rotator.ensureCredits(7);
  assert.equal(got.account.index, 2);
});

test('no reset on a new month: active #2 keeps serving on 1 November even though #1 might have refilled', async () => {
  const w = world({ balances: { 1: 1000, 2: 300, 3: 1000 }, now: new Date('2026-11-01T07:00:00Z') });
  w.store.update((s) => { s.active_index = 2; s.accounts[0].exhausted = true; s.accounts[0].exhausted_at = '2026-10-28T00:00:00.000Z'; });
  for (const day of ['2026-11-01T07:00:00Z', '2026-12-01T07:00:00Z']) {
    w.clock.now = new Date(day);
    const got = await w.rotator.ensureCredits(15);
    assert.equal(got.account.index, 2);
  }
  assert.ok(!w.activations.includes(1), 'account #1 is never touched while #2 has credits');
  assert.equal(w.store.load().active_index, 2);
});

test('next account not signed in -> clear error naming the account; active stays put', async () => {
  const w = world({ balances: { 1: 2, 2: 1000, 3: 1000 }, signedIn: { 1: true, 2: false, 3: false } });
  await assert.rejects(() => w.rotator.ensureCredits(7), (error) => {
    assert.equal(error.code, 'ACCOUNT_NOT_SIGNED_IN');
    assert.equal(error.message, 'account #2 (shohreh.hassani1968@gmail.com) not signed in to the cloud browser: sign it in to Google in the cloud browser first. flow_switch_account can only switch between accounts that are already signed in');
    return true;
  });
  const s = w.store.load();
  assert.equal(s.active_index, 1);
  assert.equal(s.accounts[0].exhausted, true);
  assert.equal(s.accounts[1].signed_in, false);
  assert.equal(w.browserOn(), 1, 'browser returned to the active account so free tools keep working');
});

test('mid-request insufficient credits: switch to the next account and retry exactly once', async () => {
  const w = world({ balances: { 1: 50, 2: 1000, 3: 1000 } });
  const servedBy = [];
  const out = await w.rotator.runPaid({
    cost: 7,
    run: async (acc) => {
      servedBy.push(acc.account.index);
      if (acc.account.index === 1) return { status: 'no_media_generated', agent_reply: "You don't have enough credits to generate this video." };
      return { status: 'success', files: ['clip.mp4'] };
    },
  });
  assert.deepEqual(servedBy, [1, 2]);
  assert.equal(out.retried, true);
  assert.equal(out.served.account.index, 2);
  assert.equal(out.result.status, 'success');
  const s = w.store.load();
  assert.equal(s.active_index, 2);
  assert.equal(s.accounts[0].exhausted, true);

  // thrown error variant, and a second failure is not retried again
  const w2 = world({ balances: { 1: 50, 2: 1000, 3: 1000 } });
  let calls = 0;
  await assert.rejects(() => w2.rotator.runPaid({ cost: 7, run: async () => { calls += 1; throw new Error('Insufficient credits'); } }), (error) => {
    assert.match(error.message, /insufficient credits/i);
    return true;
  });
  assert.equal(calls, 2);

  // retry veto (edit of a media id that only exists on the old account)
  const w3 = world({ balances: { 1: 50, 2: 1000, 3: 1000 } });
  let runs = 0;
  await assert.rejects(() => w3.rotator.runPaid({ cost: 40, canRetry: () => false, run: async () => { runs += 1; return { status: 'no_media_generated', agent_reply: 'Not enough credits' }; } }), (error) => error.code === 'INSUFFICIENT_CREDITS');
  assert.equal(runs, 1);
  assert.equal(w3.store.load().active_index, 2, 'still moves the rotation forward for the next call');
});

test('ordinary failures are not mistaken for credit exhaustion and do not switch', async () => {
  const w = world();
  await assert.rejects(() => w.rotator.runPaid({ cost: 7, run: async () => { throw new Error('The "Start generation" button is missing or disabled.'); } }), /Start generation/);
  const res = await w.rotator.runPaid({ cost: 7, run: async () => ({ status: 'no_media_generated', agent_reply: 'I could not create that, try rephrasing.' }) });
  assert.equal(res.retried, false);
  assert.equal(w.store.load().active_index, 1);
});

test('unreadable balance does not trigger a switch (Flow refusing mid-request is the backstop)', async () => {
  const w = world({ balances: { 1: null, 2: 1000, 3: 1000 } });
  const got = await w.rotator.ensureCredits(7);
  assert.equal(got.account.index, 1);
  assert.equal(got.balance, null);
});

test('state file: atomic writes, 0600, configured emails win, cloud fields come from config', () => {
  const p = tmpState();
  const store = createStateStore(p);
  store.update((s) => { s.accounts[1].last_balance = 42; s.accounts[1].email = 'tampered@example.com'; s.accounts[1].flow_url_index = 99; });
  const dir = path.dirname(p);
  assert.deepEqual(fs.readdirSync(dir).filter((f) => f.endsWith('.tmp') || f.endsWith('.lock')), []);
  assert.equal(fs.statSync(p).mode & 0o777, 0o600);
  const s = store.load();
  assert.equal(s.accounts[1].last_balance, 42);
  assert.equal(s.accounts[1].email, 'shohreh.hassani1968@gmail.com');
  assert.equal(s.accounts[1].flow_url_index, 1, 'config /u/N/ index wins over tampered state');
  assert.deepEqual(s.order, [1, 2, 3]);
  assert.equal(DEFAULT_ACCOUNTS[0].userDataDir, null, 'cloud accounts have no local Chrome profile');
  assert.equal(DEFAULT_ACCOUNTS[0].flowUrlIndex, 3);
  assert.equal(DEFAULT_ACCOUNTS[1].flowUrlIndex, 1);
  assert.equal(DEFAULT_ACCOUNTS[2].flowUrlIndex, 2);
  assert.equal(DEFAULT_ACCOUNTS[0].projectUrl, 'https://flow.google.com/project/00000000-0000-0000-0000-000000000000');
  assert.equal(DEFAULT_ACCOUNTS[1].projectUrl, null, '#2 has no recorded Flow project yet');
  assert.equal(normalizeState({ active_index: 9 }).active_index, 1);
  assert.ok(!JSON.stringify(s).match(/password|cookie/i));
});

test('cost estimates follow the published credit table', () => {
  // Omni 1.2 bills per second: 720p 3/s up to 10s, then 6/s; 360p 1/s then 2/s.
  assert.equal(estimateCost({ model: 'Omni 1.2 Flash', duration: 4 }), 12);
  assert.equal(estimateCost({ model: 'Omni 1.2 Flash', duration: 9 }), 27);
  assert.equal(estimateCost({ model: 'Omni 1.2 Flash', duration: 10, quantity: 2 }), 60);
  assert.equal(estimateCost({ model: 'Omni 1.2 Flash', duration: 15 }), 60);
  assert.equal(estimateCost({ model: 'Omni 1.2 Flash', duration: 12 }), 42);
  assert.equal(estimateCost({ model: 'Omni 1.2 Flash', duration: 4, resolution: '360p' }), 4);
  // Retiring models keep their old tables until 2026-12-05.
  assert.equal(estimateCost({ model: 'Omni 1.1 Flash', duration: 4 }), 7);
  assert.equal(estimateCost({ model: 'Omni 1.1 Flash', duration: 10, quantity: 2 }), 30);
  assert.equal(estimateCost({ model: 'Veo 3.1 - Lite' }), 10);
  assert.equal(estimateCost({ model: 'Veo 3.1 - Quality' }), 100);
  // Edits are billed like generations: Omni 1.2 at 3 credits/second, so 12 for a 4s clip.
  assert.equal(estimateCost({ kind: 'video_edit' }), 12);
});

test('credit text parsing and insufficient-credit detection', () => {
  assert.equal(parseCreditsText('886 Google Flow credits'), 886);
  assert.equal(parseCreditsText('close | Your Name | 1,023 Google Flow credits | Upgrade'), 1023);
  assert.equal(parseCreditsText('PRO'), null);
  for (const t of ["You don't have enough credits", 'Insufficient credits', 'You have run out of Google Flow credits', 'Not enough AI credits']) assert.ok(isInsufficientCreditsText(t), t);
  for (const t of ['Generating will use 7 credits', 'costing 7 credits?', 'Creating tools does not currently cost credits']) assert.ok(!isInsufficientCreditsText(t), t);
  assert.equal(reportsInsufficientCredits({ status: 'success', agent_reply: 'not enough credits' }), false);
});

test('campaign projects are scoped to the account that owns them (legacy entries = account #1)', () => {
  assert.equal(projectBelongsToAccount({ campaign: 'x' }, 'you@example.com'), true);
  assert.equal(projectBelongsToAccount({ campaign: 'x' }, 'shohreh.hassani1968@gmail.com'), false);
  assert.equal(projectBelongsToAccount({ campaign: 'x', account: 'shohreh.hassani1968@gmail.com' }, 'shohreh.hassani1968@gmail.com'), true);
});
