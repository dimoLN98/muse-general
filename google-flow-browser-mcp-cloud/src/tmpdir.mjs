// Per-process TMPDIR, installed before Playwright or Chromium can capture it.
//
// Why this exists (INC-0091, 3 Nov 2026): Chromium and Playwright both derive temp paths from
// $TMPDIR, and Playwright captures it at import time. the host launches this server with a long
// profile-scoped TMPDIR, which made Chrome abort with "Socket path too long" (AF_UNIX, 108-byte
// cap) and parked Playwright's playwright-artifacts-* download dirs where a scratch prune could
// delete them mid-run. Worse, several MCP children sharing one /tmp/flow-mcp-<uid> deleted each
// other's finished downloads: a paid clip died with
//   download.saveAs: ENOENT: copyfile '/tmp/flow-mcp-1000/playwright-artifacts-...'
//
// Per PROCESS, not per user: short enough for the socket cap, and cross-client deletion becomes
// impossible because no two children share a directory.
import fs from 'node:fs';

export function tmpdirFor(pid = process.pid, uid = (typeof process.getuid === 'function' ? process.getuid() : 'x')) {
  return `/tmp/flow-mcp-${uid}-${pid}`;
}

export function installTmpdir({ pid, uid } = {}) {
  const dir = tmpdirFor(pid, uid);
  process.env.TMPDIR = dir;
  try {
    fs.mkdirSync(dir, { recursive: true });
    // Remove only when empty: Playwright cleans its artifacts subdir itself.
    process.on('exit', () => { try { fs.rmdirSync(dir); } catch { /* not empty: leave it */ } });
  } catch { /* a missing temp dir is not fatal; Playwright recreates what it needs */ }
  return dir;
}
