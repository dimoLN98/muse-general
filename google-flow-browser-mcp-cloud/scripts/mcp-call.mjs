#!/usr/bin/env node
// Generic one-shot MCP caller for the cloud edition (local only).
//   node scripts/mcp-call.mjs <tool> [args-json]
// Starts the server over stdio, calls one tool, prints its text result, exits.
// Used for the live agent loop: flow_connect -> (agent runs browser.browse)
// -> flow_cloud_complete -> flow_account_check / flow_status.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [tool, argsJson] = process.argv.slice(2);
if (!tool) { console.error('usage: node scripts/mcp-call.mjs <tool> [args-json]'); process.exit(2); }
let args = {};
if (argsJson) { try { args = JSON.parse(argsJson); } catch { console.error('bad args json'); process.exit(2); } }

const child = spawn('node', ['start-stdio.mjs'], { cwd: ROOT, stdio: ['pipe', 'pipe', 'pipe'] });
let buf = '';
let nextId = 1;
const pending = new Map();
child.stdout.on('data', (chunk) => {
  buf += chunk.toString();
  let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id !== undefined && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.code}: ${msg.error.message}`));
      else resolve(msg.result);
    }
  }
});
child.stderr.on('data', () => { /* server logs; ignore */ });
function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`timeout ${method}`)); }, 30000);
    pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  });
}
const result = await send('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'mcp-call', version: '1.0.0' } });
child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
const call = await send('tools/call', { name: tool, arguments: args });
const block = call?.content?.[0];
console.log(block?.type === 'text' ? block.text : JSON.stringify(call, null, 2));
child.kill();
process.exit(0);
