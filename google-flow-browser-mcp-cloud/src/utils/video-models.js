/**
 * Flow video-model registry — one place that knows what each model can do and what it costs.
 *
 * Verified live in the Flow UI on 2026-11-09 (model menu, agent settings, clip tile metadata) and
 * against Google's published credit table (support.google.com/flow/answer/16526234):
 *   - the menu now lists `Omni 1.2 Flash` first and marks `Omni 1.1 Flash`, `Veo 3.1 - Fast` and
 *     `Veo 3.1 - Quality` as "Leaving Dec 5" (they are retired on 2026-12-05);
 *   - clip tiles print `model • resolution • duration`, e.g. `Omni 1.2 Flash • 720p • 12s`;
 *   - Omni 1.2 generates 3–15s natively, one second at a time (subscribers; 3–10s without a plan);
 *   - AGENT settings still expose NO resolution and NO duration control, so duration travels in the
 *     prompt text ("Video length: 12 seconds.") and output is 720p. DIRECT mode (Agent off) DOES
 *     have both: the Settings trigger pill opens a quick-settings popover with a Resolution radio
 *     (360p/720p) and a Length slider (3–15 s, value = seconds − 3), plus a "Generating will use N
 *     credits" footer — that footer is the contract (live-mapped 2026-11-13, research/flow-ui-map.md).
 * DEFAULT MODEL (the user's standing rule, 2026-11-13): Omni 1.1 Flash — 4 s = 7 credits vs 12 for
 * Omni 1.2, and the quality is still very good (Overthinking Reel: all 4 clips passed QC first
 * try). Omni 1.1 retires 2026-12-05, so the default will need revisiting then.
 */

export const VIDEO_MODELS = {
  'Omni 1.2 Flash': {
    family: 'omni', version: '1.2', durations: { min: 3, max: 15, step: 1 },
    retiring: null, supportsEdit: true, supportsExtend: true, supportsIngredients: true,
    credits: { '720p': { perSecond: 3, upTo: 10, extraPerSecond: 6 }, '360p': { perSecond: 1, upTo: 10, extraPerSecond: 2 } },
  },
  'Omni 1.1 Flash': {
    family: 'omni', version: '1.1', durations: { values: [4, 6, 8, 10] },
    retiring: '2026-12-05', supportsEdit: true, supportsExtend: false, supportsIngredients: true,
    credits: { '720p': { table: { 4: 7, 6: 10, 8: 12, 10: 15 } } },
  },
  'Veo 3.1 - Lite': {
    family: 'veo', version: '3.1', durations: { values: [4, 6, 8] },
    retiring: null, supportsEdit: false, supportsExtend: false, supportsIngredients: true,
    credits: { '720p': { flat: 10 } },
  },
  'Veo 3.1 - Fast': {
    family: 'veo', version: '3.1', durations: { values: [4, 6, 8] },
    retiring: '2026-12-05', supportsEdit: false, supportsExtend: false, supportsIngredients: true,
    credits: { '720p': { flat: 20 } },
  },
  'Veo 3.1 - Quality': {
    family: 'veo', version: '3.1', durations: { values: [8] },
    retiring: '2026-12-05', supportsEdit: false, supportsExtend: false, supportsIngredients: false,
    credits: { '720p': { flat: 100 } },
  },
};

export const DEFAULT_VIDEO_MODEL = 'Omni 1.1 Flash';
export const DEFAULT_RESOLUTION = '720p';

/** Shortcuts → canonical menu label. `default`/`cheap` now mean Omni 1.1 (the user's standing rule, 2026-11-13: fewer credits, quality still very good); `flash`/`omni` keep meaning the newer 1.2; `legacy` keeps 1.1 reachable by name until Dec 5. */
export const VIDEO_SHORTCUTS = {
  flash: 'Omni 1.2 Flash', omni: 'Omni 1.2 Flash', 'omni-1.2': 'Omni 1.2 Flash',
  default: 'Omni 1.1 Flash', cheap: 'Omni 1.1 Flash', simple: 'Omni 1.1 Flash',
  legacy: 'Omni 1.1 Flash', 'omni-1.1': 'Omni 1.1 Flash',
  lite: 'Veo 3.1 - Lite', test: 'Veo 3.1 - Lite',
  fast: 'Veo 3.1 - Fast', speed: 'Veo 3.1 - Fast',
  quality: 'Veo 3.1 - Quality', premium: 'Veo 3.1 - Quality',
};

export function isKnownVideoModel(model) {
  return Object.prototype.hasOwnProperty.call(VIDEO_MODELS, model);
}

/**
 * Resolve a requested number of seconds against the model's real options.
 * Omni 1.2 takes any whole second from 3 to 15; Veo/Omni 1.1 only the fixed list, so we snap.
 * Returns { duration, snapped } or { error } — never silently changes a length that cannot be made.
 */
export function resolveVideoDuration(model, seconds) {
  const spec = VIDEO_MODELS[model];
  if (!spec) return { error: `unknown video model "${model}"` };
  const wanted = Number(seconds);
  if (!Number.isFinite(wanted) || wanted <= 0) return { error: 'duration must be a positive number of seconds' };
  if (spec.durations.values) {
    const list = spec.durations.values;
    const nearest = list.reduce((best, d) => (Math.abs(d - wanted) < Math.abs(best - wanted) ? d : best), list[0]);
    return { duration: nearest, snapped: nearest !== wanted };
  }
  const { min, max, step } = spec.durations;
  const whole = Math.round(wanted / step) * step;
  if (whole < min || whole > max) {
    return {
      error: `${model} generates ${min}-${max}s per clip (whole seconds); ${wanted}s needs a split and a local stitch (flow_stitch_videos) or Extend in the Flow UI.`,
    };
  }
  return { duration: whole, snapped: whole !== wanted };
}

/** Estimated Flow credits for one paid call. Unknown models fall back to the dearest Omni 1.2 length. */
export function estimateVideoCredits({ model = DEFAULT_VIDEO_MODEL, duration = null, quantity = 1, resolution = DEFAULT_RESOLUTION } = {}) {
  const count = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
  const spec = VIDEO_MODELS[model];
  const d = Number(duration) > 0 ? Number(duration) : 4;
  if (!spec) return 60 * count;
  const table = spec.credits[resolution] || spec.credits[DEFAULT_RESOLUTION];
  let each;
  if (table.table) each = table.table[d] ?? table.table[4];
  else if (table.flat !== undefined) each = table.flat;
  else each = d <= table.upTo ? table.perSecond * d : table.perSecond * table.upTo + table.extraPerSecond * (d - table.upTo);
  return each * count;
}

/** Credits for a video-to-video edit (Omni only, billed exactly like a generation: per second). */
export function estimateEditCredits({ duration = 4, resolution = DEFAULT_RESOLUTION } = {}) {
  return estimateVideoCredits({ model: 'Omni 1.2 Flash', duration, quantity: 1, resolution });
}

/** Human-readable summary used by flow_video_options and tool descriptions. */
export function videoOptionsSummary({ model = DEFAULT_VIDEO_MODEL } = {}) {
  const spec = VIDEO_MODELS[model];
  if (!spec) return null;
  return {
    model, ...spec,
    duration_rule: spec.durations.values ? `fixed: ${spec.durations.values.join('/')}s` : `${spec.durations.min}-${spec.durations.max}s in ${spec.durations.step}s steps`,
    credits_720p_4s: estimateVideoCredits({ model, duration: 4 }),
    credits_720p_15s: spec.durations.values ? null : estimateVideoCredits({ model, duration: 15 }),
  };
}
