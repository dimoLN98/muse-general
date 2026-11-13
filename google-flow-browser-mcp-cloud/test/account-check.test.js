import test from 'node:test';
import assert from 'node:assert/strict';

import { verifyAccountWithRecovery, verifyAccountOnPage } from '../src/browser/account-check.js';

const expected = 'first@example.com';
function page(url, markers = [], bodyText = '') {
  return {
    url: () => url,
    locator: () => ({
      evaluateAll: async () => markers,
    }),
    textContent: async () => bodyText,
  };
}

test('verifies one exact visible account marker on trusted Flow route', async () => {
  assert.deepEqual(await verifyAccountOnPage(page('https://labs.google/fx/en/tools/flow', [expected]), expected), {
    verified: true, account: expected, method: 'visible-account-ui', reason: null,
  });
});

test('returns unverified for absent account UI without trusting page text', async () => {
  const result = await verifyAccountOnPage(page('https://labs.google/fx/en/tools/flow', [], `Welcome ${expected}`), expected);
  assert.equal(result.verified, false);
  assert.match(result.reason, /visible account/i);
});

test('blocks wrong and ambiguous accounts without exposing found emails', async () => {
  await assert.rejects(() => verifyAccountOnPage(page('https://labs.google/fx/en/tools/flow', ['other@gmail.com']), expected), (error) => {
    assert.equal(error.code, 'WRONG_GOOGLE_ACCOUNT');
    assert.doesNotMatch(error.message, /other@gmail/);
    return true;
  });
  await assert.rejects(() => verifyAccountOnPage(page('https://labs.google/fx/en/tools/flow', [expected, 'other@gmail.com']), expected), /ambiguous/i);
});

test('rejects foreign origins, login, non-Flow routes, and token prefix/suffix confusion', async () => {
  for (const [url, markers] of [
    ['https://evil.example/?next=https://labs.google/fx/en/tools/flow', [expected]],
    ['https://accounts.google.com/login', [expected]],
    ['https://labs.google/', [expected]],
    ['https://labs.google/fx/en/tools/flow', [`x${expected}`]],
    ['https://labs.google/fx/en/tools/flow', [`${expected}.evil`]],
  ]) {
    try {
      const result = await verifyAccountOnPage(page(url, markers), expected);
      assert.equal(result.verified, false);
    } catch (error) {
      assert.equal(error.code, 'WRONG_GOOGLE_ACCOUNT');
    }
  }
});

test('trusts the migrated flow.google.com host and rejects lookalike origins', async () => {
  assert.deepEqual(await verifyAccountOnPage(page('https://flow.google.com/', [expected]), expected), {
    verified: true, account: expected, method: 'visible-account-ui', reason: null,
  });
  for (const url of ['https://flow.google.com.evil.example/', 'https://evil.example/flow.google.com/', 'http://flow.google.com/']) {
    const result = await verifyAccountOnPage(page(url, [expected]), expected);
    assert.equal(result.verified, false);
  }
});

test('identity recovery re-proves the account on the project root and returns to the original page', async () => {
  const projectId = '0e45cd4a-7c8b-4860-8def-fe2fbd6e9eb8';
  const original = `https://flow.google.com/project/${projectId}/tools`;
  let current = original;
  const visited = [];
  const fake = {
    url: () => current,
    goto: async (target) => { visited.push(target); current = target; },
    waitForTimeout: async () => {},
    // the account chip only exists on the project root
    locator: () => ({ evaluateAll: async () => (current === `https://flow.google.com/project/${projectId}` ? [expected] : []) }),
  };
  const result = await verifyAccountWithRecovery(fake);
  assert.equal(result.verified, true);
  assert.deepEqual(visited, [`https://flow.google.com/project/${projectId}`, original]);
  assert.equal(current, original);
});

test('identity recovery stays fail-closed when the project root shows no account either', async () => {
  const projectId = '0e45cd4a-7c8b-4860-8def-fe2fbd6e9eb8';
  let current = `https://flow.google.com/project/${projectId}/edit/12c6024c-946b-48e6-a653-54048345f568`;
  const fake = {
    url: () => current, goto: async (target) => { current = target; }, waitForTimeout: async () => {},
    locator: () => ({ evaluateAll: async () => [] }),
  };
  const result = await verifyAccountWithRecovery(fake);
  assert.equal(result.verified, false);
  assert.equal(current, `https://flow.google.com/project/${projectId}`);
});

test('identity recovery never navigates away from non-project or foreign pages', async () => {
  for (const url of ['https://flow.google.com/', 'https://accounts.google.com/login', 'https://evil.example/']) {
    let moved = false;
    const fake = { url: () => url, goto: async () => { moved = true; }, waitForTimeout: async () => {}, locator: () => ({ evaluateAll: async () => [] }) };
    const result = await verifyAccountWithRecovery(fake);
    assert.equal(result.verified, false);
    assert.equal(moved, false);
  }
});
