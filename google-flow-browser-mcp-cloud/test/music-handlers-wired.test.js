import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as FM from '../src/tools/flow-music.js';

// Regression for the defect found 12 Nov 2026: src/index.js dispatched every flow_music_* tool to a
// handleMusic* function that src/tools/flow-music.js never defined, so each call threw
// `ReferenceError: handleMusicGenerate is not defined` at request time. The driver underneath was live and
// tested, which is why the unit tests passed while the tools were unusable. Nothing checked the seam.

const REQUIRED = [
  'handleMusicGenerate', 'handleMusicDownload', 'handleMusicShorten',
  'handleMusicSongs', 'handleMusicTrim', 'handleMusicStems',
];

test('flow-music exports every handler that src/index.js dispatches', () => {
  for (const name of REQUIRED) {
    assert.equal(typeof FM[name], 'function', `${name} must be exported by src/tools/flow-music.js`);
  }
});

test('every handle* call in src/index.js resolves to something importable', async () => {
  const src = fs.readFileSync(path.join(import.meta.dirname, '..', 'src', 'index.js'), 'utf8');
  const namespaces = new Map();
  for (const m of src.matchAll(/import \* as (\w+) from '(\.\/[^']+)'/g)) {
    namespaces.set(m[1], await import(path.join(import.meta.dirname, '..', 'src', m[2].replace(/^\.\//, ''))));
  }
  const direct = new Set();
  for (const m of src.matchAll(/import \{([^}]+)\} from '\.\/tools\/[^']+'/g)) {
    for (const piece of m[1].split(',')) {
      const n = piece.trim().split(/\s+as\s+/).pop().trim();
      if (n) direct.add(n);
    }
  }
  const unresolved = [];
  for (const line of src.split('\n')) {
    if (!line.includes('case \'') || !line.includes('handle')) continue;
    for (const h of line.matchAll(/(?:(\w+)\.)?(handle[A-Za-z]+)\(/g)) {
      const [, ns, name] = h;
      const ok = ns
        ? typeof (namespaces.get(ns) || {})[name] === 'function'
        : direct.has(name);
      if (!ok) unresolved.push(`${ns ? ns + '.' : ''}${name}`);
    }
  }
  assert.deepEqual(unresolved, [], `unresolved handlers: ${unresolved.join(', ')}`);
});

test('negative control: the check fails on a bare, un-imported handler name', () => {
  // If this control ever passes silently, the test above proves nothing.
  const line = "case 'flow_music_generate': { const r = await handleMusicGenerate(args); }";
  const found = [...line.matchAll(/(?:(\w+)\.)?(handle[A-Za-z]+)\(/g)].map((m) => m[2]);
  assert.deepEqual(found, ['handleMusicGenerate']);
  const importable = new Set(['handleSomethingElse']);
  assert.equal(importable.has(found[0]), false, 'a bare handler missing from the import set must be reported unresolved');
});
