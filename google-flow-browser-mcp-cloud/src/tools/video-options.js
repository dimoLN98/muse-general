import { VIDEO_MODELS, DEFAULT_VIDEO_MODEL, DEFAULT_RESOLUTION, videoOptionsSummary } from '../utils/video-models.js';

/**
 * Read-only: what each Flow video model can do today, what it costs, and which ones are about to disappear.
 * Pure — no browser, no credits. The registry is kept in sync with the live menu (FLOW-UI-MAP.md §2/§6).
 */
export async function handleVideoOptions(args = {}) {
  const only = typeof args.model === 'string' && args.model.trim() ? args.model.trim() : null;
  if (only) {
    const summary = videoOptionsSummary({ model: only });
    if (!summary) {
      return {
        status: 'unknown_model',
        requested: only,
        available: Object.keys(VIDEO_MODELS),
        hint: 'Call flow_video_options with no arguments to list every model.',
      };
    }
    return { status: 'success', default_model: DEFAULT_VIDEO_MODEL, resolution: DEFAULT_RESOLUTION, model: summary };
  }
  return {
    status: 'success',
    default_model: DEFAULT_VIDEO_MODEL,
    resolution: DEFAULT_RESOLUTION,
    credit_basis: 'Google Flow credits per generation at 720p; Omni 1.2 bills per second, Veo bills per clip.',
    models: Object.keys(VIDEO_MODELS).map((model) => videoOptionsSummary({ model })),
    routing_rule: 'Default = Omni 1.2 Flash. Use Veo 3.1 - Lite only when a Veo-specific look or the 10-credit flat clip is wanted. Veo 3.1 - Fast, Veo 3.1 - Quality and Omni 1.1 Flash retire on 2026-12-05 — do not start new work on them.',
    long_form: 'One clip is 3-15s. For longer pieces either chain clips with flow_stitch_videos (local, free) or use Omni Extend in the Flow UI (+3-10s per extension, subscribers only; no MCP tool yet).',
  };
}
