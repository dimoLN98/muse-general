#!/usr/bin/env node
// MCP reserves stdout for JSON-RPC; upstream informational logs use console.log.
console.log = (...args) => console.error(...args);
console.debug = (...args) => console.error(...args);
// Chromium and Playwright both derive temp paths from $TMPDIR, and Playwright captures it at import
// time - before any tool handler runs. the host launches this server with a long profile-scoped TMPDIR,
// which (a) makes Chrome abort with "Socket path too long" (its process-singleton socket is AF_UNIX
// capped at 108 bytes; this surfaced as flow_connect's "CDP endpoint did not become ready"), and
// (b) parks Playwright's playwright-artifacts-* download dir where a scratch prune deletes it
// mid-run, so a finished generation failed to save with ENOENT. Point both at one short, stable,
// owned dir before any module can capture the old value.
//
// The dir is per PROCESS, not per user: two MCP children sharing one artifacts dir delete each
// other's finished downloads (INC-0091, 3 Nov 2026 - seven stale children shared
// /tmp/flow-mcp-1000, one relaunched Chrome mid-download, and a paid clip was lost to
// "copyfile ... playwright-artifacts-*/... ENOENT"). Per-pid keeps the path short (Chrome's socket
// limit) while making cross-client deletion impossible.
// Install the per-process TMPDIR (see src/tmpdir.mjs for the INC-0091 history) before any module
// that captures it is imported.
const { installTmpdir } = await import('./src/tmpdir.mjs');
installTmpdir();
await import('./src/index.js');
