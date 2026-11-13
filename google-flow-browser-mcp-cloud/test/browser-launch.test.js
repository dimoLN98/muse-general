import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

import { assertPortAvailable, buildChromeArgs } from '../src/browser/connect.js';

test('Chrome args bind loopback and use only dedicated persistent profile', () => {
  const args = buildChromeArgs({ userDataDir: '/dedicated/google-flow', profileDirectory: 'Default', cdpPort: 9333, headless: true });
  assert.deepEqual(args.slice(0, 4), [
    '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=9333',
    '--user-data-dir=/dedicated/google-flow', '--profile-directory=Default',
  ]);
  assert.ok(args.includes('--headless=new'));
  assert.ok(!args.some((arg) => /Profile 3|\.config\/google-chrome|AutomationControlled|\/tmp/.test(arg)));
});

test('busy CDP port fails closed without attaching to or killing its owner', async () => {
  let closeOrKillCalled = false;
  const fakeNet = { createServer() {
    const server = new EventEmitter();
    server.unref = () => {};
    server.close = () => { closeOrKillCalled = true; };
    server.listen = () => queueMicrotask(() => server.emit('error', Object.assign(new Error('busy'), { code: 'EADDRINUSE' })));
    return server;
  } };
  await assert.rejects(() => assertPortAvailable(9333, fakeNet), (error) => {
    assert.equal(error.code, 'CDP_PORT_BUSY');
    assert.match(error.message, /already occupied/i);
    return true;
  });
  assert.equal(closeOrKillCalled, false);
});
