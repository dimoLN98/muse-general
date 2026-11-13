import test from 'node:test';
import assert from 'node:assert/strict';
import { launchOwnedBrowser, closeBrowser, getOwnedProcess, isBrowserConnected } from '../src/browser/connect.js';

test('optional offline Chrome smoke owns and stops its process without Google navigation', { skip: process.env.FLOW_RUN_OFFLINE_BROWSER !== '1' }, async () => {
  await launchOwnedBrowser({ headless: true });
  const proc = getOwnedProcess();
  assert.equal(isBrowserConnected(), true);
  assert.ok(proc?.pid);
  await closeBrowser();
  assert.equal(isBrowserConnected(), false);
  assert.notEqual(proc.exitCode, null);
});
