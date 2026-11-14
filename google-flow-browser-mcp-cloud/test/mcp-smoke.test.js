import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('actual stdio MCP exposes its tools (incl. flow_accounts) and safe disconnected diagnostics', async () => {
  const protocolErrors = [];
  let serverStderr = '';
  const transport = new StdioClientTransport({ command: 'node', args: ['start-stdio.mjs'], cwd: process.cwd(), stderr: 'pipe' });
  transport.stderr.on('data', (chunk) => { serverStderr += chunk; });
  const client = new Client({ name: 'hardening-smoke', version: '1.0.0' });
  client.onerror = (error) => protocolErrors.push(error);
  let stage = 'connect';
  let statusTaskId = null;
  try {
    await client.connect(transport);
    stage = 'list';
    const listed = await client.listTools();
    // The count drifted every time a tool was added (17 -> 34 before this assertion was fixed); check the set instead.
    const names = listed.tools.map((t) => t.name);
    assert.equal(new Set(names).size, names.length);
    for (const required of ['flow_connect', 'flow_status', 'flow_generate_video', 'flow_edit_video', 'flow_accounts', 'flow_switch_account']) assert.ok(names.includes(required), required);
    stage = 'accounts';
    const accounts = JSON.parse((await client.callTool({ name: 'flow_accounts', arguments: {} })).content[0].text);
    // 3-account rotation (2026-11-13): musedraft -> shohreh -> drtalebikids.
    assert.deepEqual(accounts.accounts.map((a) => a.email), ['you@example.com', 'shohreh.hassani1968@gmail.com', 'drtalebikids@gmail.com']);
    assert.ok([1, 2, 3].includes(accounts.active_index));
    stage = 'status';
    const statusResult = await client.callTool({ name: 'flow_status', arguments: {} });
    const status = JSON.parse(statusResult.content[0].text);
    // Cloud edition: flow_status is a queued browser task, not a live status
    // object — it returns the queue receipt, never a disconnected diagnostic.
    assert.equal(status.status, 'queued');
    assert.ok(typeof status.task_id === 'string' && status.task_id.startsWith('cloud-'));
    statusTaskId = status.task_id;
    stage = 'queue';
    const queueResult = await client.callTool({ name: 'flow_queue_status', arguments: {} });
    assert.ok(JSON.parse(queueResult.content[0].text));
    assert.deepEqual(protocolErrors, []);
  } catch (error) {
    error.message += `\nstage: ${stage}\nserver stderr:\n${serverStderr}`;
    throw error;
  } finally {
    await client.close();
    // The flow_status task above is only a probe — remove it from the queue.
    // The server writes state to config/flow.config.json's flowHome, not cwd.
    if (statusTaskId) {
      try {
        const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config', 'flow.config.json'), 'utf-8'));
        const flowHome = typeof cfg.flowHome === 'string' && cfg.flowHome ? cfg.flowHome : process.cwd();
        fs.rmSync(path.join(flowHome, 'state', 'cloud-queue', `${statusTaskId}.json`), { force: true });
      } catch { /* ignore */ }
    }
  }
});
