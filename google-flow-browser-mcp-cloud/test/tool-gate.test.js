import test from 'node:test';
import assert from 'node:assert/strict';

import { invokeWithIdentityGate, isIdentityExemptTool } from '../src/tool-gate.js';

test('only explicit diagnostics and lifecycle tools bypass identity gate', () => {
  for (const name of ['flow_connect', 'flow_disconnect', 'flow_status', 'flow_account_check', 'flow_queue_status', 'flow_screenshot', 'flow_video_options']) assert.equal(isIdentityExemptTool(name), true);
  for (const name of ['flow_open', 'flow_discover_ui', 'flow_generate_image', 'flow_generate_video', 'flow_download_latest', 'flow_create_character']) assert.equal(isIdentityExemptTool(name), false);
});

test('fresh identity verification happens before protected handler side effects', async () => {
  let sideEffects = 0;
  await assert.rejects(() => invokeWithIdentityGate('flow_generate_image', async () => { sideEffects += 1; }, async () => ({ verified: false, reason: 'absent' })), /not verified/i);
  assert.equal(sideEffects, 0);
  const result = await invokeWithIdentityGate('flow_generate_image', async () => { sideEffects += 1; return 'ok'; }, async () => ({ verified: true }));
  assert.equal(result, 'ok');
  assert.equal(sideEffects, 1);
});

test('wrong-account errors remain blocking and handler is not invoked', async () => {
  let invoked = false;
  const wrong = Object.assign(new Error('wrong account'), { code: 'WRONG_GOOGLE_ACCOUNT' });
  await assert.rejects(() => invokeWithIdentityGate('flow_use_tool', async () => { invoked = true; }, async () => { throw wrong; }), (error) => error === wrong);
  assert.equal(invoked, false);
});
