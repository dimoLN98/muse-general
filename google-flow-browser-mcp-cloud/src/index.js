#!/usr/bin/env node
// Google Flow Browser MCP — CLOUD edition.
//
// Same 36 tools as the original server (same names, same input schemas), plus
// flow_generate_batch, flow_cloud_complete, flow_cloud_result and
// flow_switch_account (3-account rotation, 2026-11-13). The difference is the driver:
//
//   Original: launches its OWN local Chrome via Playwright CDP (port 9334) and
//   drives Flow in it. That Chrome cannot sign in to Google on this VM —
//   Google rejects it as an unrecognized device ("Couldn't sign you in").
//   The cloud browser exposes no CDP endpoint either, so no server can attach
//   to it directly.
//
//   Cloud edition: no local Chrome, no CDP. Browser tools ENQUEUE a task
//   (state/cloud-queue/<taskId>.json) carrying a self-contained assignment:
//   exact steps for the agent to run in the already-signed-in cloud browser
//   with browser.browse. The agent then calls flow_cloud_complete with the
//   result, and flow_cloud_result reads it back.
//
//   Local-only tools run unchanged in-process (no browser, no credits):
//   flow_video_options, flow_stitch_videos, flow_qc_report, flow_analyze_beats,
//   flow_beat_sync, flow_motion_overlay, flow_music_shorten, and the local
//   frame-extraction half of flow_save_frame.
//
// Spend rules (unchanged): auto_confirm=false is PREPARE-only — the assignment
// says "type, do not send" and nothing is spent. Any task that would spend
// credits is flagged needs_approval and its assignment says so; it must not
// be executed until Muse approves the spend. Never click "Always approve" on
// Flow's permission card — only "Approve".
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { logger } from './utils/logger.js';
import { FlowError, ErrorCodes } from './utils/errors.js';
import { TOOL_DEFINITIONS } from './cloud/tool-definitions.js';
import {
  enqueueCloudTask, completeCloudTask, getCloudTask, listCloudTasks, prepareCloudTask,
} from './cloud/cloud-queue.js';
import { readCloudConnection, writeCloudConnection, clearCloudConnection } from './cloud/cloud-connection.js';
import { enforceIdentityGate, checkCloudIdentity } from './tool-gate.js';
import { jobQueue } from './queue/job-queue.js';
import { handleVideoOptions } from './tools/video-options.js';
import { handleStitchVideos } from './tools/stitch-videos.js';
import { handleQcReport } from './tools/qc-report.js';
import { handleBeatSync, handleAnalyzeBeats } from './tools/beat-sync.js';
import { handleMotionOverlay } from './tools/motion-overlay.js';
import { handleMusicShorten } from './tools/flow-music.js';
import { handleSaveFrame } from './tools/save-frame.js';
import { accountsReport, recordBalance, markCloudVerified, setActiveByEmail, markAccountExhausted, activeAccount, configuredAccounts } from './accounts/cloud-accounts.js';
import { isInsufficientCreditsText } from './accounts/rotation.js';
import config, { get } from './utils/config.js';

const DRIVER = 'cloud';
const CLOUD_WINDOW = () => get('cloudBrowserWindow', 'browser-task:00000000-0000-0000-0000-000000000000');
const EXPECTED_ACCOUNT = () => get('expectedAccount', 'you@example.com');
// Rotation index for an email, or null when it is not a configured rotation account.
const rotationIndexOf = (email) => (typeof email === 'string'
  ? configuredAccounts().find((a) => a.email.toLowerCase() === email.toLowerCase())?.index ?? null
  : null);

// Browser tools: routed through the cloud task queue (nothing executes here).
const QUEUED_TOOLS = new Set([
  'flow_connect', 'flow_status', 'flow_account_check', 'flow_switch_account',
  'flow_discover_ui', 'flow_generate_image', 'flow_generate_video', 'flow_generate_batch', 'flow_edit_video',
  'flow_download_latest', 'flow_create_character', 'flow_import_character', 'flow_open_characters',
  'flow_create_scene', 'flow_add_to_scene', 'flow_open_tools_gallery',
  'flow_use_grid_architect', 'flow_use_tool', 'flow_create_tool', 'flow_refine_tool', 'flow_inspect_tool',
  'flow_screenshot', 'flow_music_generate', 'flow_music_download', 'flow_music_songs',
  'flow_music_trim', 'flow_music_stems',
]);

function cloudContext() {
  return {
    driver: DRIVER,
    expectedAccount: EXPECTED_ACCOUNT(),
    activeAccount: activeAccount()?.email || EXPECTED_ACCOUNT(),
    cloudBrowserWindow: CLOUD_WINDOW(),
    account: EXPECTED_ACCOUNT(),
  };
}

/** Enqueue a browser tool and return the queue receipt the agent acts on. */
function enqueueTool(tool, args) {
  const identity = checkCloudIdentity();
  const prepared = prepareCloudTask(tool, args || {}, identity);
  const task = enqueueCloudTask(tool, prepared.args, {
    needs_approval: prepared.needs_approval,
    spend_estimate_credits: prepared.spend_estimate?.credits ?? null,
    spend_note: prepared.spend_estimate?.note || null,
    assignment: prepared.assignment,
  });
  return {
    status: 'queued',
    driver: DRIVER,
    tool,
    task_id: task.id,
    needs_approval: task.needs_approval,
    spend_estimate_credits: task.spend_estimate_credits,
    spend_note: task.spend_note,
    assignment: task.assignment,
    how_to_execute: 'Run the assignment in the signed-in cloud browser (browser.browse), then call flow_cloud_complete with this task_id and the result.',
  };
}

function textResult(obj) {
  return { content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] };
}

async function handleToolCall(name, args) {
  logger.info('Tool called', { tool: name, args: args ? JSON.stringify(args).substring(0, 200) : 'none' });

  await enforceIdentityGate(name);

  switch (name) {
    case 'flow_connect': {
      // Special: enqueue a verification task AND immediately return the cloud context.
      const receipt = enqueueTool('flow_connect', args || {});
      return textResult({
        status: 'connected',
        ...cloudContext(),
        browserConnected: true,
        flowAccessible: true,
        accountVerified: checkCloudIdentity().verified,
        connect_task: receipt,
        message: 'Cloud edition: no local Chrome is launched. The Flow session lives in the signed-in cloud browser window; run the connect task there to verify the account, then flow_cloud_complete.',
      });
    }

    case 'flow_disconnect': {
      clearCloudConnection();
      return textResult({
        status: 'disconnected',
        driver: DRIVER,
        cloud_browser_window: 'left open (still signed in)',
        message: 'Cloud connection record cleared. The cloud browser window itself stays open and signed in.',
      });
    }

    case 'flow_status':
    case 'flow_account_check':
    case 'flow_switch_account':
    case 'flow_discover_ui':
    case 'flow_generate_image':
    case 'flow_generate_video':
    case 'flow_generate_batch':
    case 'flow_edit_video':
    case 'flow_download_latest':
    case 'flow_create_character':
    case 'flow_import_character':
    case 'flow_open_characters':
    case 'flow_create_scene':
    case 'flow_add_to_scene':
    case 'flow_open_tools_gallery':
    case 'flow_use_grid_architect':
    case 'flow_use_tool':
    case 'flow_create_tool':
    case 'flow_refine_tool':
    case 'flow_inspect_tool':
    case 'flow_screenshot':
    case 'flow_music_generate':
    case 'flow_music_download':
    case 'flow_music_songs':
    case 'flow_music_trim':
    case 'flow_music_stems': {
      return textResult(enqueueTool(name, args || {}));
    }

    case 'flow_accounts': {
      const refresh = args?.refresh_active === true;
      let balanceTaskId = null;
      if (refresh) {
        // No CDP: enqueue a balance-read task in the cloud browser instead.
        const receipt = enqueueTool('flow_account_check', { balance_read: true });
        balanceTaskId = receipt.task_id;
      }
      const result = await accountsReport({ refresh_active: refresh, balance_task_id: balanceTaskId, cost: args?.cost_estimate ?? null });
      return textResult(result);
    }

    case 'flow_video_options': {
      const r = await handleVideoOptions(args);
      return textResult(r);
    }

    case 'flow_stitch_videos': {
      const result = await handleStitchVideos(args);
      return textResult(result);
    }

    case 'flow_qc_report': {
      const result = await handleQcReport(args);
      return textResult(result);
    }

    case 'flow_analyze_beats': {
      const result = await handleAnalyzeBeats(args);
      return textResult(result);
    }

    case 'flow_beat_sync': {
      const result = await handleBeatSync(args);
      return textResult(result);
    }

    case 'flow_motion_overlay': {
      const result = await handleMotionOverlay(args);
      return textResult(result);
    }

    case 'flow_music_shorten': {
      const r = await handleMusicShorten(args);
      return textResult(r);
    }

    case 'flow_save_frame': {
      // Local half runs here (ffmpeg frame extraction — free). The upload half,
      // if asked for, is a queued cloud task; the frame file lives on this VM,
      // so the cloud browser cannot pick it in a file chooser (the assignment says so).
      const local = await handleSaveFrame({ ...(args || {}), upload_to_flow: false, attach_to_prompt: false });
      let uploadTask = null;
      if (args?.upload_to_flow || args?.attach_to_prompt) {
        const identity = checkCloudIdentity();
        const prepared = prepareCloudTask('flow_save_frame_upload', {
          frame_path: local.output,
          attach_to_prompt: !!args.attach_to_prompt,
          project_name: args.project_name,
          campaign: args.campaign,
        }, identity);
        const task = enqueueCloudTask('flow_save_frame_upload', prepared.args, {
          needs_approval: false,
          assignment: prepared.assignment,
        });
        uploadTask = { status: 'queued', task_id: task.id, assignment: task.assignment };
      }
      return textResult({ ...local, upload_task: uploadTask });
    }

    case 'flow_queue_status': {
      return textResult({
        driver: DRIVER,
        job_queue: jobQueue.getStatus(args?.history_limit),
        cloud_queue: listCloudTasks({ limit: args?.history_limit || 50 }),
      });
    }

    case 'flow_cloud_complete': {
      const taskId = args?.task_id;
      const status = args?.status === 'failed' ? 'failed' : 'done';
      const result = (args?.result && typeof args.result === 'object') ? args.result : {};
      if (!taskId || typeof taskId !== 'string') {
        throw new FlowError(ErrorCodes.INVALID_PARAMS, 'task_id is required.');
      }
      const before = getCloudTask(taskId);
      if (!before) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unknown cloud task: ${taskId}`);
      const task = completeCloudTask(taskId, result, status, args?.error || null);
      // Side effects: a verified connect/account-check/switch records the identity
      // (any configured rotation account) and makes it the active account; a
      // balance read updates the last-read balance (on the account it was read for).
      if (status === 'done' && (before.tool === 'flow_connect' || before.tool === 'flow_account_check' || before.tool === 'flow_switch_account')) {
        const verifiedAccount = typeof result.account === 'string' ? result.account : null;
        const verified = result.accountVerified === true || result.verified === true;
        const balance = typeof result.balance === 'number' ? result.balance : (typeof result.credits === 'number' ? result.credits : null);
        if (verified && verifiedAccount && rotationIndexOf(verifiedAccount) !== null) {
          writeCloudConnection({ verified: true, account: verifiedAccount, method: 'cloud-browser-verified' });
          setActiveByEmail(verifiedAccount, {
            balance,
            reason: before.tool === 'flow_switch_account' ? 'verified switch in the cloud browser' : 'verified in the cloud browser',
          });
          markCloudVerified(true, verifiedAccount);
        }
        if (balance !== null) recordBalance(balance, rotationIndexOf(verifiedAccount));
      }
      if (status === 'done' && before.tool === 'flow_accounts_balance' && typeof result.balance === 'number') {
        recordBalance(result.balance, rotationIndexOf(result.account));
      }
      // A generation that failed for lack of credits marks the ACTIVE account
      // exhausted, so the next call can fall back to the next account (rotation
      // policy). Other failures do not touch the rotation state.
      if (status === 'failed' && ['flow_generate_video', 'flow_generate_batch', 'flow_edit_video'].includes(before.tool)) {
        const text = [args?.error, result?.error, result?.message, result?.agent_reply].filter(Boolean).join(' ');
        if (isInsufficientCreditsText(text)) {
          try { markAccountExhausted(activeAccount()?.index ?? 1, 'Flow reported insufficient credits mid-request'); } catch { /* state unavailable */ }
        }
      }
      return textResult({ status: 'recorded', task });
    }

    case 'flow_cloud_result': {
      const task = getCloudTask(args?.task_id);
      if (!task) throw new FlowError(ErrorCodes.INVALID_PARAMS, `Unknown cloud task: ${args?.task_id}`);
      return textResult(task);
    }

    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
}

const server = new Server(
  { name: 'google-flow-browser-mcp-cloud', version: '1.0.0-cloud.1' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOL_DEFINITIONS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await handleToolCall(request.params.name, request.params.arguments);
  } catch (error) {
    logger.error('Tool execution error', { tool: request.params.name, error: error.message });
    if (error instanceof McpError) throw error;
    const message = error.message || 'Unknown error';
    const isBlocking = ['WRONG_GOOGLE_ACCOUNT', 'ACCOUNT_NOT_SIGNED_IN', 'ALL_ACCOUNTS_EXHAUSTED'].includes(error.code) || message.includes('MUST') || message.includes('cannot') || message.includes('blocked');
    return {
      content: [{ type: 'text', text: JSON.stringify({
        error: true,
        message,
        code: error.code || (isBlocking ? 'BLOCKING' : 'ERROR'),
        needsManualIntervention: isBlocking,
        ...(error.details && Object.keys(error.details).length ? { details: error.details } : {}),
      }, null, 2) }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
// Node 26 may leave an idle piped stdin unreferenced; MCP must remain alive until its client closes the pipe.
process.stdin.resume();
process.stdin.ref?.();
const stdioKeepAlive = setInterval(() => {}, 60_000);
process.stdin.once('end', () => clearInterval(stdioKeepAlive));
logger.info('Google Flow Browser MCP (cloud edition) running on stdio');
