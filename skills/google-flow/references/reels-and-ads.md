# Reels / Shorts / paid-ad playbook, workarounds, post-generation toolkit

Distilled from `docs/research/flow-creative-playbook.md` §5, §6, §7. Live findings override the playbook where
marked **[live]**. Ad-craft numbers are community guidance **[C]**, not Google policy.

## 1. Non-negotiables for vertical video
* **9:16, 1080×1920**, generated at 9:16 from the start — Flow's ratio is a generation setting, not a crop.
* **Hook in the first 1 s; first 1–3 s carry the ad.** Frame 1 must contain **motion** — put the motion in the
  prompt's first clause (static first frames read as "ended").
* The hook must work **as a still with sound off**.
* **Length:** cold prospecting < 15 s; hard ceiling 20–30 s unless you sustain a cut every 2–3 s.
* **Cuts every 2–3 s.**
* **Keep text out of the bottom ~250 px** (UI overlay).
* **Captions are mandatory** and Flow does not burn them in → CaptionCast / Type Overlays / SwissFlow Studio via
  `flow_use_tool`, or an external editor.
* **Flow cannot take your own music/VO.** All audio in a clip is generated; licensed audio is composited outside.
  `flow_stitch_videos` can add music locally.

## 2. Hook archetypes → prompt shapes
| Archetype | Prompt shape |
|---|---|
| Mid-action open | Start mid-verb ("already sprinting", "mid-sentence"); no establishing beat |
| Pattern-interrupt claim | Bold counterintuitive text overlay over motion (still made in Nano Banana, then animated) |
| Native testimonial | `@Character` mid-reaction to camera, no logo/intro, UGC framing |
| Before/after snap | Two clips with matching composition, hard cut inside the first second |
| Question to camera | Direct eye contact, one pain-linked question, frame 1 |
| Result-first | Show the finished payoff immediately, then explain |

## 3. Structure (15–30 s → 3–5 clips)
`0–3 s hook → 4–10 s problem → 11–20 s demo/proof → last 5–10 s CTA`
* Clip 1 (4–6 s) hook · Clip 2 (6–8 s) problem/value, dialogue if `@Character` · Clip 3 (8–10 s) demo/proof ·
  Clip 4 (4–6 s) CTA to camera or product hero with on-screen text. ≥15 s only with a cut every 2–3 s.
* LLM-first alternative: Hook → Product → Key benefits → Social proof → CTA, then split into 3–8 s scenes.
* **Dialogue:** one or two short sentences per clip.
* **Testing:** a few angles × 9:16 (+1 alt) × 2 hooks on the same body. **Build the matrix from stills first**
  (images are cheap), render only winning hooks to video.
* **Assemble:** `flow_stitch_videos` (aspect `9:16`, crossfade/cuts, music, `.srt`) or `flow_add_to_scene` then
  `Add clip` in the editor. Check screen direction and action continuity at each cut in preview.

## 4. Disclosure (don't skip)
* YouTube requires disclosure for realistic AI content (real person saying/doing what they didn't, altered real
  events, realistic scenes that didn't occur). Since May 2026 YouTube also auto-labels photoreal AI; labels can't be
  removed for content with C2PA metadata / YouTube's own tools. A label does **not** affect reach or monetization.
* Photoreal UGC-style ads → assume the prominent label. SynthID stays; never strip it.
* Visible watermark: optional; mandatory only in India / South Korea / Vietnam (Canada: no).

## 5. What Flow does badly → workaround
| Weakness | Workaround |
|---|---|
| **Extend** — documented for Veo 8 s clips only | **[live] Not in this build's UI (proved with a paid Veo Lite 8 s clip). Ignore the playbook's Extend advice, including "start on Lite so you can extend".** Use Omni 10 s clips, `flow_stitch_videos`, scene assembly, or save-frame continuation. |
| Quality decay across extension chains [C] | Moot here; budget shots to be **cut**, not extended |
| Model choice strips features | Decide the pipeline *per shot* first: ingredients → Lite/Fast/Omni; v2v → Omni only; Quality has no ingredients |
| Scenebuilder = assembly, not editing (no multitrack audio, no music upload, no grading, no keyframes); can't publish a sequence to YouTube | Treat Flow as a shot factory; finish captions/music/end-card externally; one file out per scene |
| One timeline per project [live] | One scene per project; plan the sequence in a single project |
| No public API | UI-driven MCP; persistent real Chrome profile, not incognito |
| "Unusual activity" / "requesting too quickly" | Never hammer Retry. Ladder: wait 2 min → reload → re-sign-in → restart browser → clear site cookies → new project → new profile. No VPN/proxy. Pace: ≤2–3 concurrent prompts, ≥30 s random gaps. One Google account per profile. Captchas need a human. |
| Content refusals on benign prompts | Rewrite (remove names / dual meanings), don't retry |
| Drift across shots | Reference sheet, ≤2 refs, identical identity wording, sequence-level QC |
| 4K is an upscale | Don't promise native 4K; this account is PRO → 1080p upscale free, **4K is Ultra-only (unavailable)** |
| Voice refs only on ingredient generations | Build dialogue shots on Ingredients, not Frames |
| EEA/CH/UK can't v2v-edit uploads | Canada is fine |
| Vibe-coded Tools can be buggy | Re-test after Flow updates |

## 6. Post-generation toolkit — what is actually reachable here
| Feature | Documented | **[live] status** |
|---|---|---|
| Video-to-video edit (Omni) | box "Describe how to edit this video…"; Omni 1.2: multi-turn on clips up to 15 s (1.1 was ≤10 s, ≤3 turns) | **Works** → `flow_edit_video` (Omni 1.2: 3 cr/s at 720p, 12 for 4 s; was a flat 40 on 1.1) |
| Save frame | hover/pause → Save frame | **Works** → `flow_save_frame` |
| Add to scene / Scenebuilder | tile → More options → Add to scene; reorder, trim, preview, download | **Works** → `flow_add_to_scene`; editor has `Add clip`, `Done editing scene` |
| Download | per asset: 270p GIF / 720p / 1080p upscaled / 4K upscaled | **Works** → `flow_download_latest` (4K needs Ultra) |
| Frames-to-Video | Video → Frames → + Add start/end frame | **Entry point not reachable** → save-frame → upload → ingredient |
| **Extend** | clip → Extend at bottom | **Absent from UI** (verified) |
| Insert / Remove object, camera orchestration | click clip → Insert/Remove, drag a box | **Not found in the clip-editor toolbar** (sweep of the Veo Lite clip showed none). Treat as unavailable until re-mapped. |
| Agent batch edit | one instruction edits many assets; rename, collections | Exists in Agent chat; not wrapped by a tool |
| Tools gallery | My Tools / Community / Templates | `flow_use_tool` |

Version safety: edits never destroy the original (History panel). Extended clips would lose insert/remove/camera —
do object edits before any extension *if* Extend ever appears.
