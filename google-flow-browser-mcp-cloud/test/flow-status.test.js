import test from 'node:test';
import assert from 'node:assert/strict';
import { handleFlowStatus } from '../src/tools/flow-status.js';
import { setConnected, setPage } from '../src/browser/connect.js';

test.afterEach(() => { setConnected(false); setPage(null); });

test('status distinguishes connected, Flow access, login, and verified identity', async () => {
  setConnected(true);
  setPage({
    url: () => 'https://labs.google/fx/en/tools/flow', title: async () => 'Flow',
    locator: () => ({ evaluateAll: async () => ['first@example.com'] }),
  });
  const verified = await handleFlowStatus();
  assert.equal(verified.browserConnected, true);
  assert.equal(verified.flowAccessible, true);
  assert.equal(verified.loginRequired, false);
  assert.equal(verified.accountVerified, true);

  setPage({ url: () => 'https://accounts.google.com/login', title: async () => 'Login' });
  const login = await handleFlowStatus();
  assert.equal(login.flowAccessible, false);
  assert.equal(login.loginRequired, true);
  assert.equal(login.accountVerified, false);
});

test('disconnected status names expected account but never treats it as proof', async () => {
  const status = await handleFlowStatus();
  assert.equal(status.browserConnected, false);
  assert.equal(status.expectedAccount, 'first@example.com');
  assert.equal(status.accountVerified, false);
  assert.equal(status.account, null);
});
