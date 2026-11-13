import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VIDEO_MODELS, DEFAULT_VIDEO_MODEL, VIDEO_SHORTCUTS,
  resolveVideoDuration, estimateVideoCredits, estimateEditCredits, videoOptionsSummary,
} from '../src/utils/video-models.js';
import { handleVideoOptions } from '../src/tools/video-options.js';
import { modelLabel, resolveModel } from '../src/navigation/flow-ui.js';

test('the live menu is the registry: Omni 1.2 first, three models marked for retirement', () => {
  assert.equal(DEFAULT_VIDEO_MODEL, 'Omni 1.2 Flash');
  assert.deepEqual(Object.keys(VIDEO_MODELS), [
    'Omni 1.2 Flash', 'Omni 1.1 Flash', 'Veo 3.1 - Lite', 'Veo 3.1 - Fast', 'Veo 3.1 - Quality',
  ]);
  assert.equal(VIDEO_MODELS['Omni 1.1 Flash'].retiring, '2026-12-05');
  assert.equal(VIDEO_MODELS['Veo 3.1 - Fast'].retiring, '2026-12-05');
  assert.equal(VIDEO_MODELS['Veo 3.1 - Quality'].retiring, '2026-12-05');
  assert.equal(VIDEO_MODELS['Veo 3.1 - Lite'].retiring, null);
  assert.equal(VIDEO_SHORTCUTS.flash, 'Omni 1.2 Flash');
  assert.equal(VIDEO_SHORTCUTS.legacy, 'Omni 1.1 Flash');
});

test('duration resolves per model: 3-15s on Omni 1.2, fixed lists elsewhere', () => {
  assert.deepEqual(resolveVideoDuration('Omni 1.2 Flash', 12), { duration: 12, snapped: false });
  assert.deepEqual(resolveVideoDuration('Omni 1.2 Flash', 15), { duration: 15, snapped: false });
  assert.deepEqual(resolveVideoDuration('Omni 1.2 Flash', 3), { duration: 3, snapped: false });
  assert.deepEqual(resolveVideoDuration('Omni 1.2 Flash', 11.6), { duration: 12, snapped: true });
  assert.match(resolveVideoDuration('Omni 1.2 Flash', 2).error, /3-15s per clip/);
  assert.match(resolveVideoDuration('Omni 1.2 Flash', 16).error, /3-15s per clip/);
  assert.match(resolveVideoDuration('Omni 1.2 Flash', 0).error, /positive number/);
  assert.deepEqual(resolveVideoDuration('Omni 1.1 Flash', 9), { duration: 8, snapped: true });
  assert.deepEqual(resolveVideoDuration('Veo 3.1 - Lite', 7), { duration: 6, snapped: true });
  assert.deepEqual(resolveVideoDuration('Veo 3.1 - Quality', 4), { duration: 8, snapped: true });
  assert.match(resolveVideoDuration('Imagen 4', 8).error, /unknown video model/);
});

test('credits are per second on Omni 1.2 and per clip on Veo', () => {
  assert.equal(estimateVideoCredits({ model: 'Omni 1.2 Flash', duration: 4 }), 12);
  assert.equal(estimateVideoCredits({ model: 'Omni 1.2 Flash', duration: 15 }), 60);
  assert.equal(estimateVideoCredits({ model: 'Omni 1.2 Flash', duration: 6, quantity: 2 }), 36);
  assert.equal(estimateVideoCredits({ model: 'Omni 1.2 Flash', duration: 12, resolution: '360p' }), 14);
  assert.equal(estimateVideoCredits({ model: 'Veo 3.1 - Lite', duration: 8 }), 10);
  assert.equal(estimateVideoCredits({ model: 'Veo 3.1 - Fast', duration: 8 }), 20);
  assert.equal(estimateEditCredits({ duration: 4 }), 12);
});

test('flow_video_options reports the registry without a browser', async () => {
  const all = await handleVideoOptions();
  assert.equal(all.status, 'success');
  assert.equal(all.default_model, 'Omni 1.2 Flash');
  assert.equal(all.models.length, 5);
  assert.match(all.routing_rule, /retire on 2026-12-05/);
  assert.match(all.long_form, /flow_stitch_videos/);
  const one = await handleVideoOptions({ model: 'Veo 3.1 - Lite' });
  assert.equal(one.model.duration_rule, 'fixed: 4/6/8s');
  const unknown = await handleVideoOptions({ model: 'Sora 3' });
  assert.equal(unknown.status, 'unknown_model');
  assert.ok(unknown.available.includes('Omni 1.2 Flash'));
  assert.equal(videoOptionsSummary({ model: 'Omni 1.2 Flash' }).credits_720p_15s, 60);
});

test('retiring menu items still match their plain model name', () => {
  assert.equal(modelLabel('Veo 3.1 - Fast\nLeaving Dec 5'), 'Veo 3.1 - Fast');
  assert.equal(modelLabel('Omni 1.1 Flash Leaving Dec 5'), 'Omni 1.1 Flash');
  assert.equal(modelLabel('Omni 1.2 Flash'), 'Omni 1.2 Flash');
  assert.equal(modelLabel('🍌 Nano Banana 2.1'), 'Nano Banana 2.1');
  assert.equal(resolveModel('video', 'Veo 3.1 - Quality Leaving Dec 5'), 'Veo 3.1 - Quality');
  assert.equal(resolveModel('video', undefined), 'Omni 1.2 Flash');
});
