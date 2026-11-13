import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { resolveBrowserProfile } from '../src/browser/profile-config.js';

test('accepts the dedicated acme profile and creates it mode 0700', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-profile-test-'));
  const allowed = path.join(base, 'acme', 'browser-profiles');
  const userDataDir = path.join(allowed, 'google-flow');
  const result = resolveBrowserProfile({ chromeUserDataDir: userDataDir, chromeProfile: 'Default' }, { allowedRoot: allowed });
  assert.equal(result.userDataDir, fs.realpathSync(userDataDir));
  assert.equal(result.profileDirectory, 'Default');
  assert.equal(fs.statSync(userDataDir).mode & 0o777, 0o700);
});

test('rejects real Chrome paths, traversal, root and symlink escape', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-profile-test-'));
  const allowed = path.join(base, 'acme', 'browser-profiles');
  fs.mkdirSync(allowed, { recursive: true });
  const outside = path.join(base, 'outside');
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(allowed, 'escape'));
  for (const candidate of ['/', path.join(base, '.config/google-chrome'), path.join(allowed, '..', 'outside'), path.join(allowed, 'escape')]) {
    assert.throws(() => resolveBrowserProfile({ chromeUserDataDir: candidate, chromeProfile: 'Default' }, { allowedRoot: allowed }), /dedicated|refus|escape/i);
  }
  assert.throws(() => resolveBrowserProfile({ chromeUserDataDir: path.join(allowed, 'ok'), chromeProfile: '../Profile 3' }, { allowedRoot: allowed }), /profile/i);
});
