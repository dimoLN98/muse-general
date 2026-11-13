import test from 'node:test';
import assert from 'node:assert/strict';
import { buildManualLoginArgs } from '../src/browser/manual-login.js';

test('manual login uses only dedicated profile and has no CDP or secret automation flags', () => {
  const args = buildManualLoginArgs('/dedicated/google-flow', 'Default');
  assert.deepEqual(args.slice(0, 2), ['--user-data-dir=/dedicated/google-flow', '--profile-directory=Default']);
  assert.ok(!args.some((arg) => /remote-debugging|password|cookie|Profile 3|\.config\/google-chrome/.test(arg)));
});
