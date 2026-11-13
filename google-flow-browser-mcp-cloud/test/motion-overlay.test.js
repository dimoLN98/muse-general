import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { resolveTimes, renderOverlayFrames, OVERLAY_HTML } from '../src/tools/motion-overlay.js';

test('resolveTimes converts beats to seconds', () => {
  const [a] = resolveTimes([{ type: 'word', text: 'x', beat0: 2, beat1: 4 }], { bpm: 120, start: 0.5 });
  assert.equal(a.t0, 1.5); assert.equal(a.t1, 2.5);
});

test('resolveTimes rejects timed items without times', () => {
  assert.throws(() => resolveTimes([{ type: 'word', text: 'x' }]), /needs t0\/t1/);
});

const chromeOk = fs.existsSync(process.env.FLOW_RENDER_CHROME || '/opt/google/chrome/chrome');
test('overlay renders transparent frames with visible pixels and flags unsafe text', { skip: !chromeOk }, async () => {
  assert.ok(fs.existsSync(OVERLAY_HTML));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mo-test-'));
  try {
    const r = await renderOverlayFrames({
      items: [
        { type: 'word', text: 'ACME', x: 0.5, y: 0.3, size: 110, t0: 0, t1: 2, anim: 'pop' },
        { type: 'word', text: 'TOO LOW', x: 0.5, y: 0.9, size: 110, t0: 0, t1: 2, anim: 'rise' },
      ],
      width: 540, height: 960, fps: 10, duration: 1, dir, auditAt: [1],
    });
    assert.equal(r.frames, 10);
    const first = path.join(dir, 'f00000.png');
    assert.ok(fs.statSync(first).size > 100);
    const bad = r.audit[0].elements.filter((e) => e.outside.length);
    assert.ok(bad.some((e) => e.text === 'TOO LOW' && e.outside.includes('bottom')));
    assert.ok(!bad.some((e) => e.text === 'ACME'));
    // transparency: a corner pixel must be fully transparent
    const px = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(dir, 'f00009.png'), '-vf', 'crop=1:1:0:0,format=rgba', '-f', 'rawvideo', '-'], { stdio: ['ignore', 'pipe', 'pipe'] });
    assert.equal(px[3], 0);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
