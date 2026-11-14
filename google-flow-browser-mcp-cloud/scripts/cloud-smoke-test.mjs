#!/usr/bin/env node
// Cloud-edition smoke test: starts the server over stdio and drives it as a
// real MCP client. Local only — no browser, no Flow credits, no sign-in.
//   node scripts/cloud-smoke-test.mjs
// Exit 0 when every check passes, 1 otherwise.
// The test creates cloud tasks; it deletes the ones it created and restores
// state/cloud-connection.json to its prior content afterwards.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// The server reads/writes state from config/flow.config.json's flowHome (an
// absolute path), NOT from its own directory — so the test must read the state
// from the same place, or a fresh extract (where the test's own state/ does not
// exist yet) fails the two state-dependent checks while the server happily
// reads the live state. (Found 2026-11-13 while verifying the v4 toolkit zip.)
const FLOW_HOME = (() => {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'flow.config.json'), 'utf-8'));
    return typeof cfg.flowHome === 'string' && cfg.flowHome ? cfg.flowHome : ROOT;
  } catch { return ROOT; }
})();
const QUEUE_DIR = path.join(FLOW_HOME, 'state', 'cloud-queue');
const CONN_FILE = path.join(FLOW_HOME, 'state', 'cloud-connection.json');
const ACCOUNTS_FILE = path.join(FLOW_HOME, 'state', 'accounts.json');

const createdTaskIds = [];
let passed = 0;
let failed = 0;
const failures = [];
function check(name, ok, detail = '') {
  if (ok) { passed += 1; console.log(`  PASS ${name}`); }
  else { failed += 1; failures.push(name); console.log(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
}

const connBefore = fs.existsSync(CONN_FILE) ? fs.readFileSync(CONN_FILE, 'utf-8') : null;
const accountsBefore = fs.existsSync(ACCOUNTS_FILE) ? fs.readFileSync(ACCOUNTS_FILE, 'utf-8') : null;

// Stored state drifts as real work happens (the recorded balance moves when a
// balance-read task completes; the connection record flips verified when a connect
// task completes), so the balance and verify-first expectations below are read from
// the state files instead of hardcoded. (2026-11-13: the 1050 hardcoding broke once
// the stored balance became 1026 and the connection record became verified.)
const EXPECTED_BALANCE = (() => { try { return JSON.parse(accountsBefore).accounts?.[0]?.last_balance ?? null; } catch { return null; } })();
const CONN_VERIFIED_BEFORE = (() => { try { return JSON.parse(connBefore)?.verified === true; } catch { return false; } })();

// ---- minimal MCP stdio client (newline-delimited JSON-RPC) ----
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
    try { msg = JSON.parse(line); } catch { console.error('  (non-JSON stdout line ignored)', line.slice(0, 120)); continue; }
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
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`timeout waiting for ${method}`)); }, 20000);
    pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  });
}
function notify(method, params = {}) {
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`);
}
function toolText(result) {
  const block = result?.content?.[0];
  if (!block || block.type !== 'text') throw new Error('tool returned no text content');
  return JSON.parse(block.text);
}
async function callTool(name, args = {}) {
  const result = await send('tools/call', { name, arguments: args });
  return result;
}

async function main() {
  console.log('Cloud smoke test — google-flow-browser-mcp-cloud');
  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'cloud-smoke-test', version: '1.0.0' },
  });
  notify('notifications/initialized');

  // 1. tools/list — 40 tools (36 original + 4 new)
  const list = await send('tools/list');
  const names = list.tools.map((t) => t.name);
  check('tools/list returns 40 tools', names.length === 40, `got ${names.length}`);
  const ORIGINAL_36 = ['flow_connect', 'flow_disconnect', 'flow_status', 'flow_account_check', 'flow_accounts', 'flow_discover_ui', 'flow_generate_image', 'flow_generate_video', 'flow_video_options', 'flow_edit_video', 'flow_stitch_videos', 'flow_qc_report', 'flow_analyze_beats', 'flow_beat_sync', 'flow_motion_overlay', 'flow_music_generate', 'flow_music_download', 'flow_music_shorten', 'flow_music_songs', 'flow_music_trim', 'flow_music_stems', 'flow_save_frame', 'flow_download_latest', 'flow_create_character', 'flow_import_character', 'flow_open_characters', 'flow_create_scene', 'flow_add_to_scene', 'flow_open_tools_gallery', 'flow_use_grid_architect', 'flow_use_tool', 'flow_create_tool', 'flow_refine_tool', 'flow_inspect_tool', 'flow_screenshot', 'flow_queue_status'];
  check('all 36 original tools present', ORIGINAL_36.every((n) => names.includes(n)), `missing: ${ORIGINAL_36.filter((n) => !names.includes(n)).join(',')}`);
  check('flow_cloud_complete + flow_cloud_result present', names.includes('flow_cloud_complete') && names.includes('flow_cloud_result'));
  check('flow_generate_batch present', names.includes('flow_generate_batch'));
  check('flow_switch_account present', names.includes('flow_switch_account'));

  // 2. flow_accounts — 3 rotation accounts in order, musedraft active by default.
  // On a fresh install there is no stored account state yet, so the balance
  // check is skipped (balances are null until the first live read), but the
  // 3-account shape comes from config and is always asserted.
  const accounts = toolText(await callTool('flow_accounts', {}));
  check('flow_accounts returns the 3 rotation accounts in order', accounts.accounts?.length === 3 && accounts.accounts.map((a) => a.email).join(',') === 'you@example.com,shohreh.hassani1968@gmail.com,drtalebikids@gmail.com', JSON.stringify(accounts.accounts?.map((a) => a.email)));
  check('flow_accounts active account is musedraft (#1)', accounts.active_email === 'you@example.com' && accounts.active_index === 1, `got ${accounts.active_email} #${accounts.active_index}`);
  if (EXPECTED_BALANCE !== null) {
    check('flow_accounts last_balance matches the stored balance', accounts.accounts?.[0]?.last_balance === EXPECTED_BALANCE, `got ${accounts.accounts?.[0]?.last_balance}, stored ${EXPECTED_BALANCE}`);
  } else {
    console.log('  SKIP flow_accounts balance check (no stored balance yet — run flow_connect / a balance read first)');
  }

  // 3. flow_video_options — cheat sheet, no browser
  const opts = toolText(await callTool('flow_video_options', {}));
  check('flow_video_options returns the model cheat sheet', opts.status === 'success' && Array.isArray(opts.models) && opts.models.some((m) => m.model === 'Omni 1.2 Flash'), `status=${opts.status}`);
  const lite = toolText(await callTool('flow_video_options', { model: 'Veo 3.1 - Lite' }));
  check('Veo 3.1 - Lite costs 10 credits for 4s', lite.model?.credits_720p_4s === 10, `got ${lite.model?.credits_720p_4s}`);
  const unknown = toolText(await callTool('flow_video_options', { model: 'No Such Model' }));
  check('unknown model returns unknown_model', unknown.status === 'unknown_model');

  // 4. flow_connect — cloud context + queued connect task
  const connect = toolText(await callTool('flow_connect', {}));
  check('flow_connect returns driver cloud', connect.driver === 'cloud', `got ${connect.driver}`);
  check('flow_connect returns the cloud browser window', connect.cloudBrowserWindow === 'browser-task:00000000-0000-0000-0000-000000000000', `got ${connect.cloudBrowserWindow}`);
  check('flow_connect returns expectedAccount you@example.com', connect.expectedAccount === 'you@example.com');
  const connectTaskId = connect.connect_task?.task_id;
  check('flow_connect enqueues a connect task', typeof connectTaskId === 'string' && connectTaskId.startsWith('cloud-'), `got ${connectTaskId}`);
  if (connectTaskId) createdTaskIds.push(connectTaskId);
  check('connect assignment mentions you@example.com', (connect.connect_task?.assignment || '').includes('you@example.com'));
  // The assignment says VERIFY FIRST only while the connection record is unverified;
  // once verified it names the signed-in account instead. Assert consistency with the
  // state at test start, not a fixed preamble.
  check('connect assignment matches the stored verification state',
    CONN_VERIFIED_BEFORE
      ? !(connect.connect_task?.assignment || '').includes('VERIFY FIRST') && (connect.connect_task?.assignment || '').includes('Signed in as you@example.com')
      : (connect.connect_task?.assignment || '').includes('VERIFY FIRST'),
    `verified_before=${CONN_VERIFIED_BEFORE}`);

  // 5. flow_generate_video auto_confirm=false — PREPARE task, nothing executed
  const prep = toolText(await callTool('flow_generate_video', { prompt: 'Medium shot of a plain black hoodie on a ghost mannequin, slowly rotating. Video length: 4 seconds.', duration: 4, auto_confirm: false }));
  check('prepare video queues (status queued)', prep.status === 'queued', `got ${prep.status}`);
  check('prepare video needs no approval', prep.needs_approval === false, `got ${prep.needs_approval}`);
  check('prepare assignment mentions Omni 1.1 Flash (the default)', (prep.assignment || '').includes('Omni 1.1 Flash'));
  check('prepare assignment mentions 7 credits', (prep.assignment || '').includes('7 credits'));
  check('prepare assignment says PREPARE ONLY', (prep.assignment || '').includes('PREPARE ONLY'));
  check('prepare assignment says do not send', /Do NOT click Start generation/i.test(prep.assignment || ''));
  const prepTaskId = prep.task_id;
  if (prepTaskId) createdTaskIds.push(prepTaskId);

  // 6. Expensive model refused without allow_expensive
  const expensive = await callTool('flow_generate_video', { prompt: 'test', model: 'Veo 3.1 - Quality', auto_confirm: true });
  check('Veo 3.1 - Quality refused without allow_expensive', expensive.isError === true && /premium tier|100 credits/.test(expensive.content?.[0]?.text || ''), expensive.content?.[0]?.text?.slice(0, 120));

  // 7. flow_generate_video auto_confirm=true — needs approval, ~12 credits
  const confirm = toolText(await callTool('flow_generate_video', { prompt: 'Medium shot of a plain black hoodie, slowly rotating.', duration: 4, auto_confirm: true }));
  check('confirmed video queues', confirm.status === 'queued');
  check('confirmed video needs approval', confirm.needs_approval === true);
  check('confirmed video estimates 7 credits (Omni 1.1, 4s)', confirm.spend_estimate_credits === 7, `got ${confirm.spend_estimate_credits}`);
  check('confirmed assignment demands spend approval', (confirm.assignment || '').includes('SPEND APPROVAL REQUIRED'));
  check('confirmed assignment forbids Always approve', (confirm.assignment || '').includes('DIRECT MODE ONLY') && !(confirm.assignment || '').includes('PERMISSION CARD RULE'));
  const confirmTaskId = confirm.task_id;
  if (confirmTaskId) createdTaskIds.push(confirmTaskId);

  // 8. flow_accounts refresh_active — enqueues a balance-read task, returns last balance
  // (skipped on a fresh install: no stored balance exists yet to compare against)
  const refreshed = toolText(await callTool('flow_accounts', { refresh_active: true }));
  if (EXPECTED_BALANCE !== null) {
    check('refresh_active returns the stored balance', refreshed.accounts?.[0]?.last_balance === EXPECTED_BALANCE, `got ${refreshed.accounts?.[0]?.last_balance}, stored ${EXPECTED_BALANCE}`);
  } else {
    console.log('  SKIP refresh_active balance check (no stored balance yet)');
  }
  check('refresh_active enqueues a balance-read task', typeof refreshed.live?.balance_task_id === 'string' && refreshed.live.balance_task_id.startsWith('cloud-'), `got ${refreshed.live?.balance_task_id}`);
  if (refreshed.live?.balance_task_id) createdTaskIds.push(refreshed.live.balance_task_id);

  // 9. flow_queue_status lists the queued tasks
  const qs = toolText(await callTool('flow_queue_status', {}));
  check('flow_queue_status reports the cloud queue', qs.cloud_queue && qs.cloud_queue.total >= 4, `total=${qs.cloud_queue?.total}`);
  check('flow_queue_status shows queued tasks', qs.cloud_queue?.queued >= 4, `queued=${qs.cloud_queue?.queued}`);

  // 10. flow_cloud_complete + flow_cloud_result round-trip (prepare task)
  const done = toolText(await callTool('flow_cloud_complete', {
    task_id: prepTaskId,
    status: 'done',
    result: { status: 'ready_for_confirmation', model_used: 'Omni 1.2 Flash', prompt: 'Medium shot of a plain black hoodie on a ghost mannequin, slowly rotating. Video length: 4 seconds.', project_url: 'https://flow.google.com/project/00000000-0000-0000-0000-000000000000' },
  }));
  check('flow_cloud_complete records the task', done.status === 'recorded' && done.task?.status === 'done', `got ${done.status}/${done.task?.status}`);
  const back = toolText(await callTool('flow_cloud_result', { task_id: prepTaskId }));
  check('flow_cloud_result returns the stored result', back.status === 'done' && back.result?.model_used === 'Omni 1.2 Flash', `got ${back.status}`);

  // 11. Completing the connect task as verified writes the connection record
  const connDone = toolText(await callTool('flow_cloud_complete', {
    task_id: connectTaskId,
    status: 'done',
    result: { browserConnected: true, flowAccessible: true, accountVerified: true, account: 'you@example.com', credits: 1050, currentUrl: 'https://flow.google.com/project/00000000-0000-0000-0000-000000000000' },
  }));
  check('connect task completes', connDone.status === 'recorded');
  const connRecord = JSON.parse(fs.readFileSync(CONN_FILE, 'utf-8'));
  check('connection record now verified as you@example.com', connRecord.verified === true && connRecord.account === 'you@example.com', JSON.stringify(connRecord));
  // The connect result updates the stored balance only when an account is
  // already recorded; on a fresh install there is none, so this is skipped
  // until the first balance read seeds state/accounts.json.
  if (fs.existsSync(ACCOUNTS_FILE)) {
    const accountsAfter = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
    check('accounts balance updated to 1050 from the connect result', accountsAfter.accounts?.[0]?.last_balance === 1050);
  } else {
    console.log('  SKIP accounts balance check (no stored account state yet)');
  }

  // 12. After verification, a new task's assignment no longer starts with VERIFY FIRST
  const after = toolText(await callTool('flow_status', {}));
  check('flow_status queues', after.status === 'queued');
  check('verified assignment has no VERIFY FIRST preamble', !(after.assignment || '').includes('VERIFY FIRST'), 'preamble still present');
  check('verified assignment names the signed-in account', (after.assignment || '').includes('Signed in as you@example.com'));
  if (after.task_id) createdTaskIds.push(after.task_id);

  // 13. flow_switch_account — enqueue, verify assignment, complete, switch back.
  // No browser involved here: the test simulates the agent's completion result.
  const switchTo2 = toolText(await callTool('flow_switch_account', { account_index: 2 }));
  check('flow_switch_account queues', switchTo2.status === 'queued', `got ${switchTo2.status}`);
  check('switch task needs no approval (spends nothing)', switchTo2.needs_approval === false, `got ${switchTo2.needs_approval}`);
  check('switch assignment names shohreh.hassani1968@gmail.com', (switchTo2.assignment || '').includes('shohreh.hassani1968@gmail.com'));
  check('switch assignment uses the /u/1/ URL', (switchTo2.assignment || '').includes('flow.google.com/u/1/'));
  check('switch assignment never signs anyone out', !(switchTo2.assignment || '').toLowerCase().includes('sign out'));
  if (switchTo2.task_id) createdTaskIds.push(switchTo2.task_id);
  // Completing it as verified makes #2 the active account and records its balance.
  const switchDone = toolText(await callTool('flow_cloud_complete', {
    task_id: switchTo2.task_id,
    status: 'done',
    result: { verified: true, account: 'shohreh.hassani1968@gmail.com', balance: 444, currentUrl: 'https://flow.google.com/u/1/?pli=1', projects_visible: [] },
  }));
  check('switch task completes', switchDone.status === 'recorded');
  const accountsAfterSwitch = toolText(await callTool('flow_accounts', {}));
  check('active account is now #2 shohreh', accountsAfterSwitch.active_index === 2 && accountsAfterSwitch.active_email === 'shohreh.hassani1968@gmail.com', `got #${accountsAfterSwitch.active_index} ${accountsAfterSwitch.active_email}`);
  const connAfterSwitch = JSON.parse(fs.readFileSync(CONN_FILE, 'utf-8'));
  check('connection record now verified as shohreh', connAfterSwitch.verified === true && connAfterSwitch.account === 'shohreh.hassani1968@gmail.com', JSON.stringify(connAfterSwitch));
  // Cost check: a 40-credit generation is covered by #2 (444) but not #3 (50);
  // a 500-credit one is covered only by #1 (637/1050), so the ring walks forward.
  const costCheck = toolText(await callTool('flow_accounts', { cost_estimate: 40 }));
  check('cost_check recommends the active account when it covers the cost', costCheck.cost_check?.recommended?.index === 2, JSON.stringify(costCheck.cost_check?.recommended));
  const costCheckBig = toolText(await callTool('flow_accounts', { cost_estimate: 500 }));
  check('cost_check recommends #1 when #2 cannot cover 500 credits', costCheckBig.cost_check?.recommended?.index === 1, JSON.stringify(costCheckBig.cost_check?.recommended));
  // Switch back to #1 so the rest of the test (and the restored state) see musedraft again.
  const switchBack = toolText(await callTool('flow_switch_account', { account_index: 1 }));
  check('switch back to #1 queues', switchBack.status === 'queued');
  if (switchBack.task_id) createdTaskIds.push(switchBack.task_id);
  const backDone = toolText(await callTool('flow_cloud_complete', {
    task_id: switchBack.task_id,
    status: 'done',
    result: { verified: true, account: 'you@example.com', balance: 637, currentUrl: 'https://flow.google.com/project/00000000-0000-0000-0000-000000000000', projects_visible: ['Acme Test'] },
  }));
  check('switch back to #1 completes', backDone.status === 'recorded');
  const accountsAfterBack = toolText(await callTool('flow_accounts', {}));
  check('active account is #1 musedraft again', accountsAfterBack.active_index === 1 && accountsAfterBack.active_email === 'you@example.com', `got #${accountsAfterBack.active_index} ${accountsAfterBack.active_email}`);
  // An unknown account is refused before anything is queued.
  const badSwitch = await callTool('flow_switch_account', { account_index: 9 });
  check('unknown account index is refused', badSwitch.isError === true, badSwitch.content?.[0]?.text?.slice(0, 120));

  // 14. Unknown task id errors
  const unknownTask = await callTool('flow_cloud_result', { task_id: 'cloud-0000000000000-dead' });
  check('unknown task id returns an error', unknownTask.isError === true);

  // 15. flow_save_frame local half (only if a local mp4 exists)
  const outputsDir = path.join(ROOT, 'outputs');
  let mp4 = null;
  if (fs.existsSync(outputsDir)) {
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { const hit = walk(p); if (hit) return hit; }
        else if (/\.mp4$/i.test(e.name)) return p;
      }
      return null;
    };
    mp4 = walk(outputsDir);
  }
  if (mp4) {
    const frame = toolText(await callTool('flow_save_frame', { video_file: mp4, at: 'middle' }));
    check('flow_save_frame extracts a frame locally', frame.status === 'success' && fs.existsSync(frame.output), `status=${frame.status}`);
    check('flow_save_frame spends 0 credits', frame.credits_used === 0);
  } else {
    console.log('  SKIP flow_save_frame local half (no mp4 under outputs/)');
  }

  console.log(`\n${passed} passed, ${failed} failed${failures.length ? ` — failed: ${failures.join(', ')}` : ''}`);
}

try {
  await main();
} catch (err) {
  console.error('SMOKE TEST CRASHED:', err);
  failed += 1;
} finally {
  // Clean up: remove tasks this test created, restore prior connection/accounts state.
  for (const id of createdTaskIds) {
    try { fs.rmSync(path.join(QUEUE_DIR, `${id}.json`), { force: true }); } catch { /* ignore */ }
  }
  try {
    if (connBefore === null) fs.rmSync(CONN_FILE, { force: true });
    else fs.writeFileSync(CONN_FILE, connBefore);
  } catch { /* ignore */ }
  try { if (accountsBefore !== null) fs.writeFileSync(ACCOUNTS_FILE, accountsBefore); } catch { /* ignore */ }
  child.kill('SIGTERM');
  setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* ignore */ } }, 2000);
  process.exit(failed ? 1 : 0);
}
