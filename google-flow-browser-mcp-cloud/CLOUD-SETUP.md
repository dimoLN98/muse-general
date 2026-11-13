# Google Flow Browser MCP — Cloud Edition

A clone of the original `google-flow-browser-mcp` server, rebuilt so it can be
used with the **already-signed-in cloud browser** instead of a local Chrome.

## Why this edition exists

The original server drives Google Flow by launching **its own local Chrome**
via Playwright CDP (port 9334) and signing in to Google inside it. On this VM
that path is dead:

1. **Google rejects the local Chrome as an unrecognized device.** Sign-in
   reaches `accounts.google.com/v3/signin/rejected`: "Couldn't sign you in —
   You're trying to sign in on a device Google doesn't recognize, and we don't
   have enough information to verify that it's you." Passkeys also failed
   ("No passkeys available … on this device"). The VM's Chrome is "Chrome for
   Testing" on a datacenter egress IP with no prior Google device history.
   Do not hammer retries — the block is device/location trust, not a wrong
   password.
2. **The cloud browser exposes no CDP endpoint.** `browser.windows` returns
   only task_id / tabs / URLs / profiles, so no MCP server can attach to it
   directly.

The cloud browser **is** signed in to Google Flow as Your Name,
`you@example.com`, PRO, 1,050 credits (verified 2026-11-12). So this
edition works the other way round: **the MCP plans and queues the work; the
agent executes it in the signed-in cloud browser and records the result back
through the MCP.**

- Cloud browser window: `browser-task:00000000-0000-0000-0000-000000000000`
- Existing project: https://flow.google.com/project/00000000-0000-0000-0000-000000000000
  ("Acme Test")

## Architecture

```
agent ──▶ MCP (this server, stdio) ──▶ state/cloud-queue/<taskId>.json
  │                                        │  assignment: exact steps
  │   browser.browse in the signed-in      ▼
  │   cloud browser window            agent executes the steps
  │                                        │
  └─ flow_cloud_complete ◀── result ───────┘
```

- **No local Chrome.** `src/browser/connect.js` is a stub: `getPage()` throws
  a clear "cloud edition: no local Chrome" error. Nothing in this edition
  launches Playwright, opens a CDP port, or needs a display.
- **Queue.** `src/cloud/cloud-queue.js` — disk queue under
  `state/cloud-queue/`. Each task is `<taskId>.json`:
  `{id, tool, args, status: 'queued'|'done'|'failed', created_at,
  needs_approval, spend_estimate_credits, assignment, result}`.
  Task ids look like `cloud-<timestamp>-<rand4>`.
- **Assignments.** `prepareCloudTask(tool, args, ctx)` validates the args
  (same rules as the original handlers) and returns a **self-contained**
  `browser.browse` task text built from the original tool's Flow knowledge
  (selectors and steps taken from `src/tools/*.js` and
  `src/navigation/flow-ui.js` in the original server). Every assignment
  includes: the Flow URL/project to open, exact steps, what success looks
  like, what to report back (clip/media URL or id, credits before/after,
  errors), and the permission-card rule.
- **Identity.** There is no live page to read, so identity is the last
  verified record in `state/cloud-connection.json`, written by
  `flow_cloud_complete` after a connect / account-check task. Browser tools
  may still **enqueue** while unverified, but their assignment starts with
  "STEP 0 — VERIFY FIRST: check the account chip shows
  you@example.com". If the recorded account is a *different* account
  than expected, the gate throws `WRONG_GOOGLE_ACCOUNT`.

## Tools — 39 total (36 original + 3 new; v1.1.0 added flow_generate_batch)

Same 36 tool names and input schemas as the original server. They fall into
three groups:

**Queued (browser work, executed by the agent in the cloud browser):**
`flow_connect`, `flow_status`, `flow_account_check`, `flow_discover_ui`,
`flow_generate_image`, `flow_generate_video`, `flow_edit_video`,
`flow_download_latest`, `flow_create_character`, `flow_import_character`,
`flow_open_characters`, `flow_create_scene`, `flow_add_to_scene`,
`flow_open_tools_gallery`, `flow_use_grid_architect`, `flow_use_tool`,
`flow_create_tool`, `flow_refine_tool`, `flow_inspect_tool`,
`flow_screenshot`, `flow_music_generate`, `flow_music_download`,
`flow_music_songs`, `flow_music_trim`, `flow_music_stems`.
Each returns `{status: 'queued', task_id, needs_approval,
spend_estimate_credits, assignment, how_to_execute}`.

- `flow_connect` is special: it enqueues a verification task **and**
  immediately returns the cloud context
  `{driver: 'cloud', expectedAccount: 'you@example.com',
  cloudBrowserWindow: 'browser-task:00000000-0000-0000-0000-000000000000',
  account: 'you@example.com'}`.
- `flow_disconnect` clears `state/cloud-connection.json`. The cloud browser
  window itself **stays open** and signed in.
- `flow_save_frame` is split: the ffmpeg frame extraction runs locally
  in-process (free, 0 credits); only the upload half is queued, as
  `flow_save_frame_upload`.

**Local-only (run unchanged in-process, no browser, no credits):**
`flow_accounts`, `flow_video_options`, `flow_stitch_videos`,
`flow_qc_report`, `flow_analyze_beats`, `flow_beat_sync`,
`flow_motion_overlay`, `flow_music_shorten`.
`flow_accounts` with `refresh_active: true` does **not** use CDP — it
enqueues a balance-read task (`flow_account_check` with `balance_read`) and
returns the last-read balance with a note.

**New (cloud plumbing):**
- `flow_cloud_complete {task_id, result, status: 'done'|'failed', error?}` —
  records the agent's execution result. Completing a connect/account-check
  task with `accountVerified: true` + the expected account writes
  `state/cloud-connection.json`; a reported `balance`/`credits` updates
  `state/accounts.json`.
- `flow_cloud_result {task_id}` — returns the stored task + result.

`flow_queue_status` returns both the original job queue and the cloud task
queue.

## The agent loop (how to use it)

1. Call a `flow_*` tool. It returns a `task_id` and an `assignment`.
2. If `needs_approval` is true, **get Muse's spend approval first** — do not
   execute. The assignment says so explicitly.
3. Run the assignment in the signed-in cloud browser (`browser.browse`,
   window `browser-task:00000000-0000-0000-0000-000000000000`). Do not sign
   in again; do not open a local Chrome.
4. Call `flow_cloud_complete` with the `task_id` and the result
   (media id/URL, credits before/after, errors).
5. Later reads use `flow_cloud_result` / `flow_queue_status`.

## Spend and safety rules (unchanged from the original)

- `auto_confirm: false` is **PREPARE-only**: the assignment says "type the
  prompt, set the options, report the settings, do NOT click Start
  generation". Nothing is spent, nothing is sent.
- Any task that would spend credits is flagged `needs_approval: true` with a
  `spend_estimate_credits` and its assignment starts with
  "SPEND APPROVAL REQUIRED". **Ask Muse before executing it.**
- **Never click "Always approve"** on Flow's permission card — only
  "Approve". Every assignment says this.
- Cost reference (from `flow_video_options`): Omni 1.2 Flash 4s = 12 credits
  (720p) / 20 (1080p); Veo 3.1 - Lite 4s = 10 credits; Veo 3.1 - Quality 4s
  ≈ 100 credits — refused unless `allow_expensive: true` is passed
  explicitly. Flow Music ≈ 5 credits per compose take, 10 per chat take.
  Balance on file: 1,050 credits (last read 2026-11-12).

## Config

`config/flow.config.json` — `driver: 'cloud'`,
`cloudBrowserWindow: 'browser-task:00000000-0000-0000-0000-000000000000'`,
`cloudProjectUrl: 'https://flow.google.com/project/00000000-0000-0000-0000-000000000000'`,
`expectedAccount: 'you@example.com'`. No `chromeUserDataDir`, `cdpPort`
or `headless` — there is no local Chrome.

`state/accounts.json` — single Muse account, `last_balance: 1050`,
`signed_in: false` (means "no local profile", **not** "signed out of Flow"),
`cloud_verified: false` until a connect/account-check task is completed as
verified.

## Running it

```bash
cd google-flow-browser-mcp-cloud
npm install          # 94 packages (@modelcontextprotocol/sdk, playwright, zod)
npm test             # runs the smoke test below
node start-stdio.mjs # start the server over stdio (or scripts/start-mcp.sh)
```

OpenCode registration (cloud name): `scripts/register-opencode.sh`
registers `google-flow-browser-cloud`.

## Smoke test

`scripts/cloud-smoke-test.mjs` — starts the server over stdio as a real MCP
client. Local only: no browser, no credits, no sign-in. It creates cloud
tasks, then deletes the ones it created and restores
`state/cloud-connection.json` / `state/accounts.json` to their prior content.

It verifies (39 checks, all passing as of 2026-11-12):

- `tools/list` returns **38 tools** (36 original + 2 new), all original
  names present.
- `flow_accounts` returns `you@example.com` only, balance 1050.
- `flow_video_options` returns the model cheat sheet (Omni 1.2 Flash,
  Veo 3.1 - Lite = 10 credits / 4s; unknown model → `unknown_model`).
- `flow_connect` returns the cloud context + a queued connect task whose
  assignment starts with VERIFY FIRST while unverified.
- `flow_generate_video` with `auto_confirm: false` queues a PREPARE task
  (assignment mentions Omni 1.2 Flash, 12 credits, PREPARE ONLY, "do not
  send"); with `auto_confirm: true` it needs approval, estimates 12
  credits, and demands spend approval; Veo 3.1 - Quality without
  `allow_expensive` is refused.
- `flow_accounts {refresh_active: true}` enqueues a balance-read task and
  still returns the last-read balance.
- `flow_queue_status` lists the queued tasks.
- `flow_cloud_complete` + `flow_cloud_result` round-trip works; completing
  the connect task as verified writes `state/cloud-connection.json` and
  updates the balance; a later task's assignment no longer carries the
  VERIFY FIRST preamble.
- Unknown task id returns an error.

The `flow_save_frame` local half is covered only when an mp4 exists under
`outputs/` (none is shipped, so that check is skipped).

## What could not be ported faithfully

- **Local file uploads / reference images.** The original handlers upload
  files from the MCP VM's disk (character references, frame images) via the
  local Chrome's file chooser. The cloud browser cannot pick files off this
  VM, so assignments say so explicitly: the agent must supply the file
  another way (e.g. upload it in the cloud browser first) or report that
  the step cannot be done as written. The MCP receives media ids/URLs, not
  local paths.
- **Downloads.** Files generated in Flow land in the **cloud browser's
  download folder**, not on this VM. `flow_download_latest` assignments
  report the media id/URL and the download location instead of a local path.
- **No live page reads.** `flow_status`, `flow_discover_ui` and
  `flow_screenshot` cannot inspect a live DOM. Their assignments ask the
  agent to observe and report what the cloud browser shows (including a
  screenshot description), and the result is recorded via
  `flow_cloud_complete`.
- **Balance is last-read, not live.** `flow_accounts` returns the balance
  from the last completed balance-read task (1,050 as of 2026-11-12). A live
  number requires running the queued balance-read task in the cloud browser.
- **Dead code kept as reference.** The original browser tool handlers under
  `src/tools/` (generate-video, generate-image, edit-video, flow-open,
  flow-status, discover-ui, create-scene, create-character, import-character,
  download-latest, grid-architect, create-tool, use-flow-tool,
  open-characters, open-tools-gallery, flow-music) are **not imported** by
  the cloud `src/index.js` and never execute here. They are kept because
  their selectors and step logic are the source the assignment builders in
  `src/cloud/cloud-queue.js` were written from. They import the `connect.js`
  stub, so calling one would fail fast with the clear cloud-edition error
  instead of a confusing Playwright failure.

## Known leftovers (not blocking)

- `src/navigation/flow-ui.js:132` still has a stale error string mentioning
  the deleted `scripts/login-flow.mjs` (it can only fire from a live page,
  which never exists here).
- `src/accounts/rotation.js` is dead code (single-account rule lives in
  `src/accounts/cloud-accounts.js` now); its comment still mentions the
  deleted `runtime.js`.
- `DIMO-SETUP.md` was copied from the original server and documents the
  local-Chrome setup and the failed sign-in attempt; it is history, not
  instructions for this edition. It contains only a masked phone reference,
  not the actual number.

## Files

- `src/index.js` — cloud server entry (38 tools, queue routing)
- `src/cloud/tool-definitions.js` — the 38 tool definitions (36 original
  schemas verbatim, descriptions reworded to cloud-queue wording, + 2 new)
- `src/cloud/cloud-queue.js` — disk task queue + assignment builders
  (`prepareCloudTask` / `buildAssignment`)
- `src/cloud/cloud-connection.js` — `state/cloud-connection.json` read/write
- `src/accounts/cloud-accounts.js` — `flow_accounts` (state-file only)
- `src/browser/connect.js` — stub (no local Chrome)
- `src/browser/account-check.js` — cloud-aware identity check
- `src/tool-gate.js` — cloud-aware identity gate (never blocks queueing)
- `scripts/cloud-smoke-test.mjs` — the smoke test

## 2026-11-12 live end-to-end test — PASSED (parent agent)
- flow_connect queued cloud-1794487330837-1a03; the agent ran its assignment in the signed-in cloud browser (browser-task:00000000-0000-0000-0000-000000000000): Flow app home, signed in as Your Name you@example.com PRO, 1,050 credits, reset Nov 29 4:47 AM. Nothing generated, no credits spent.
- flow_cloud_complete recorded it; state/cloud-connection.json now verified:true, account you@example.com, verified_at 2026-11-12T12:42:45.818Z. Later assignments (flow_account_check, flow_status) drop the VERIFY FIRST preamble and name the verified account. The full loop (MCP queues -> agent runs cloud browser -> MCP records result) works.
- Helper: scripts/mcp-call.mjs — one-shot MCP caller for the agent loop.

## 2026-11-13 v1.1.0 — Omni 1.1 default, direct-mode fallback, batch generation

- **Default model is now Omni 1.1 Flash** (the user's standing rule, 2026-11-13: 4 s = 7 credits vs 12 for Omni 1.2, quality still very good — Overthinking Reel: all 4 clips passed QC first try). Changed in `src/utils/video-models.js` (DEFAULT_VIDEO_MODEL + `default`/`cheap` shortcuts), `src/cloud/tool-definitions.js` (flow_generate_video description + model default), and the cost labels. Omni 1.1 retires 2026-12-05, so the default will need revisiting then.
- **Direct-generation fallback in flow_generate_video assignments**: if the agent fails with "Something went wrong" (it often does, free), the assignment now walks the browser through DIRECT mode (Agent off) with the live-mapped controls — Settings trigger pill, quick-settings popover (Mode / Video type / Aspect ratio / "Select model family" / Resolution / Length slider), and the "Generating will use N credits" footer as the cost contract. UI quirks (sticky menus, blank black page ~25 s) are in every assignment. Full map: `../research/flow-ui-map.md` (live-verified 2026-11-13); code-extracted companion: `../research/flow-ui-map-from-code.md`.
- **New tool `flow_generate_batch` (39 tools total)**: generate a whole Reel's clips (up to 4) in ONE cloud-browser task, all in direct mode, in order, downloading each. One browser round-trip instead of one per clip. Requires auto_confirm=true; the summed estimate needs approval before the task runs. A failed clip is noted and the batch continues with the rest.
- Smoke test updated: `tools/list` now expects 39 tools. Run `npm test` (scripts/cloud-smoke-test.mjs) after any change.

## 2026-11-13 v1.2.0 — direct-mode only (never the Agent)

- **DIRECT MODE ONLY.** the user's standing rule (2026-11-13): never use the Flow Agent, video or images. `assignmentGenerateImage` is now direct-only via a new `directImageModeBlock` (Agent OFF → Settings trigger pill → Mode "Image" → model Nano Banana 2.1/Pro/Lite → ratio → x1 → footer must read "Generating will use 0 credits" → paste prompt → attach ingredients → Start generation → download "2K Upscaled"); `assignmentGenerateVideo` goes direct-first (agent path and permission-card wait removed); `assignmentGenerateBatch`'s per-clip failure fallback is a direct retry after reload (never the Agent). Tool descriptions in `src/cloud/tool-definitions.js` say direct-only. The video-editor edit flow (`flow_edit_video`) still uses `permissionWaitBlock` — that is the editor's own flow, NOT the Agent toggle, and was deliberately left alone.
- **Flow image rate limit — root cause + fix.** "We noticed some unusual activity" is Google's anti-abuse velocity flag on the 0-credit image model, NOT a daily cap (Nano Banana 2.1+Lite share a 400/day pool) and NOT the prompt. The cloud browser is proven clean (webdriver false, not headless, Canadian TELUS IP 204.191.248.243); the flag is ON THE ACCOUNT, and you@example.com is a brand-new cold account doing heavy volume. Full diagnosis: `docs/flow-image-rate-limit.md`. `scripts/image-pacer.mjs` only logs attempts and warns on re-submits inside ~40 s (hard caps removed on the user's instruction).
- Smoke test 40 passed, 0 failed.

## 2026-11-13 v1.3.0 — paste (never type), click pace, no restore, 2K downloads

All four changes came from the user watching the cloud browser live (2026-11-13 ~04:28-05:10 CST) and correcting Muse's pace and habits:

- **PASTE the whole prompt at once — NEVER type it character by character.** Flow does not care whether you type word by word or paste the whole prompt at once; typing a 100-word prompt takes minutes and buys nothing. Every "type the prompt" in the MCP now says "paste" (`directModeBlock` step 5, `directImageModeBlock` step 5, the HUMAN-LIKE PACING block, all three "Paste the prompt" blocks). The 10 s wait after the paste is the human-like part — the typing is not.
- **Pacing numbers (the user's): 4 s after pasting the prompt, 10 s between generations.** the user corrected both: 4 s after paste is enough (not 10 s); 10 s between one generation and the next is enough (he first said 20 s, then corrected himself to 10 s). The 10-15 min cooldown after a refusal, the ~40 s re-submit rule, and "spread 3 attempts over ~3 min" are unchanged — those are about refusals, not normal generation spacing.
- **CLICK PACE — 30-50% faster between ordinary UI clicks.** New `clickPaceBlock()` in the image, video and batch assignments: as soon as a popover, menu or button appears, click it right away; do NOT wait extra seconds between clicks. The ONLY deliberate pauses are the 4 s wait after pasting and the 10 s pause between generations. Honest limit: the MCP instruction sets the pace, but the browser planner has its own step latency the MCP does not directly control — the next session shows whether the gaps actually shrank.
- **After a generation, STOP — do NOT switch the mode back to Video.** The `downloadBlock` now says "After the download, STOP. Do NOT change the mode back to Video, do NOT restore any settings" — switching back is wasted work; it only makes sense if the SAME task's next step is a video, and then the next step sets its own mode anyway. The dead `restoreSettingsBlock` function was removed.
- **2K Upscaled downloads for images (not 1K Original).** Verified 2026-11-13 on all 8 Flow covers, 1K vs 2K, one by one: the print is identical in every one (no garbled text, no moved lines, no hallucinated or lost details) and the 2K version downscaled to 1080x1920 is consistently a touch sharper than the 1K version upscaled. `downloadBlock` and `directImageModeBlock` step 6 now say "2K Upscaled". Full report: `../research/1k-vs-2k-verdict.md`.
- Smoke test 40 passed, 0 failed.
