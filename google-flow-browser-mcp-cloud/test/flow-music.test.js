import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMusicPrompt, normalizeLength, parseTime, formatTime, planBeatAlignedTrim, buildTrimArgs, safeName, shortenTrack } from '../src/tools/flow-music.js';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('buildMusicPrompt carries the brief, instrumental wording and the bpm hint', () => {
  const p = buildMusicPrompt({ genre: 'lo-fi hip hop', mood: 'calm', instruments: 'Rhodes, dusty drums', bpm: 90, key: 'F minor', targetSec: 30, avoid: 'vocals' });
  assert.match(p, /lo-fi hip hop/);
  assert.match(p, /instrumental, no vocals/);
  assert.match(p, /90 bpm/);
  assert.match(p, /F minor/);
  assert.match(p, /no fade-in/);
});

test('normalizeLength clamps to the app range', () => {
  assert.equal(normalizeLength(16).clamped, true);
  assert.equal(normalizeLength(16).seconds, 60);
  assert.equal(normalizeLength(600).seconds, 180);
  assert.equal(normalizeLength(90).seconds, 90);
});

test('parseTime and formatTime round-trip', () => {
  assert.equal(parseTime('1:23.4'), 83.4);
  assert.equal(formatTime(16), '0:16');
  assert.equal(formatTime(15.996, { tenths: true }), '0:16');   // tenths, rounded: 16.0 -> the zero tenth is dropped
  assert.equal(formatTime(15.84, { tenths: true }), '0:15.8');
});

test('planBeatAlignedTrim gives whole bars from the first kick', () => {
  const r = planBeatAlignedTrim({ firstBeat: 0.023, bpm: 126, targetSec: 15.24 });
  assert.equal(r.bars, 8); assert.equal(r.beats, 32);
  assert.ok(Math.abs(r.duration - 15.238) < 0.01);
  assert.ok(r.start <= 0.023);
});

test('shortenTrack cuts a real track on the bar grid (ffmpeg)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fm-test-'));
  try {
    const click = path.join(dir, 'click.wav');
    // 120 BPM click for 12 s: 0.5 s interval, first click at 0.02 s
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='0.8*sin(2*PI*1000*t)*exp(-60*mod(t+0.48,0.5))':s=48000:d=12", '-ac', '1', click]);
    const out = path.join(dir, 'cut.wav');
    const r = shortenTrack({ input: click, output: out, targetSec: 4 });
    assert.ok(fs.existsSync(out));
    assert.ok(Math.abs(r.plan.duration - 4) < 0.15, `duration ${r.plan.duration}`);
    assert.ok(r.analysis.rawBpm >= 110 && r.analysis.rawBpm <= 130, `bpm ${r.analysis.rawBpm}`);
    assert.ok(r.durationSec > 3.5, `probed duration ${r.durationSec}`);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
