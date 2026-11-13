#!/usr/bin/env node
// INC-0091 regression test: two MCP server children must never share one temp/artifacts dir.
//
// The 3 Nov 2026 failure: several stale start-stdio.mjs children all used /tmp/flow-mcp-1000, one
// child relaunched Chrome while another was mid-download, and the finished clip died with
//   download.saveAs: ENOENT: copyfile '/tmp/flow-mcp-1000/playwright-artifacts-...'
// The fix gives each process its own TMPDIR before Playwright is imported (src/tmpdir.mjs). This
// test spawns two real children and asserts the invariant on the environments they actually got,
// not on the source text.
//
// Run: node test/tmpdir-isolation.test.js
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const MODULE = path.join(ROOT, 'src', 'tmpdir.mjs');

function probeOnce(label) {
  return new Promise((resolve, reject) => {
    const script = `
      import fs from 'node:fs';
      const shared = '/tmp/flow-mcp-shared-${label}';
      process.env.TMPDIR = shared;
      const { installTmpdir } = await import(${JSON.stringify(MODULE)});
      const dir = installTmpdir();
      console.log(JSON.stringify({ dir, env: process.env.TMPDIR, exists: fs.existsSync(dir), pid: process.pid }));
    `;
    const child = spawn(process.execPath, ['--input-type=module', '-e', script], {
      cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) return reject(new Error(`child ${label} exited ${code}: ${err.slice(0, 400)}`));
      try { resolve(JSON.parse(out.trim().split('\n').pop())); }
      catch { reject(new Error(`child ${label} unparseable output: ${out.slice(0, 200)}`)); }
    });
  });
}

const a = await probeOnce('a');
const b = await probeOnce('b');

assert.notEqual(a.dir, b.dir, `two children shared one TMPDIR: ${a.dir}`);
assert.equal(a.env, a.dir, 'TMPDIR env was not set to the per-process dir');
assert.equal(b.env, b.dir, 'TMPDIR env was not set to the per-process dir');
assert.match(a.dir, /^\/tmp\/flow-mcp-(?:\d+|x)-\d+$/, `TMPDIR is not per-pid: ${a.dir}`);
assert.equal(a.dir.includes('shared'), false, 'the shared default was not overridden');
assert.equal(a.exists, true, 'TMPDIR was not created before use');

// Chrome's AF_UNIX singleton socket must stay under the 108-byte cap.
const socket = path.join(a.dir, 'SingletonSocket');
assert.ok(Buffer.byteLength(socket) < 108, `socket path too long: ${Buffer.byteLength(socket)} bytes`);

try { fs.rmdirSync(a.dir); } catch { /* child removed it */ }
try { fs.rmdirSync(b.dir); } catch { /* child removed it */ }

console.log(`ok tmpdir-isolation: ${a.dir} (pid ${a.pid}) and ${b.dir} (pid ${b.pid}) are distinct, socket path ${Buffer.byteLength(socket)} bytes`);
