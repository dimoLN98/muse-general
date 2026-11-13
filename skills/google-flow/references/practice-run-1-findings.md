# Practice run 1 (2026-10-17): what actually happened, measured

Project `Acme Practice 1` (`7b0d95c8-b042-45a0-916a-78a676db2dc6`). Account first@example.com (PRO).
Credits **986 → 938 (48 spent)**. Refs were cropped halves of the user's own mockups (`Products/Neuroscience/Hoodie/104e.png`).
All findings are n=1 per shot; treat as strong hints, not statistics. Brand orange measured from the logo files: **#FA7F14**
(median of 9,104 orange pixels across the six logo variants; per file #FD7213 / #F7800F / #FA882B / #F68330). the user delegated the choice.

| Shot | Model | Len | Cost | Result |
|---|---|---|---|---|
| A1 fleece macro, orange gel sweep | Omni 720p | 4 s | 7 | Believable heavy bouclé-looking fleece, orange rim restrained. No text. Hook-quality. |
| A2 back reveal, ref = back mockup | Omni 720p | 6 s | 10 | **Print held across all frames** (two neurons, orange arrow, "fire together"). Real-looking person from behind. |
| A3 dusk street walk, ref = back mockup | Omni 720p | 4 s | 7 | Print stable, natural walk, warm sodium lamps. Best shot of the set. |
| A4 hoodie plate, 90° arc, ref = front mockup | Veo 3.1 Lite | 8 s | 10 | Chest logo mostly held, but the arc turns the logo side-on and it degrades. Mannequin neck visible. Usable for ~4 s only. |
| B1a UGC line, colon dialogue | Omni 720p | 4 s | 7 | Whisper transcript: "Midterms week, this is the uniform." Words land 0.0–2.0 s. |
| B1b UGC line, quoted dialogue | Omni 720p | 4 s | 7 | Same words, delivered 1.5–3.5 s (a slower start). Both formats worked: **no practical difference**. |

## Lessons (promote into practice)
1. **Reference-driven video works for apparel.** Back-mockup crop as ingredient + the pin clause gave a stable print in both Omni shots. The "text-only invents the garment" warning is justified; refs fix it.
2. **Crop the mockup to ONE hoodie** (front or back half) before attaching; attaching the side-by-side image invites two garments.
3. **A camera arc that turns a chest logo side-on loses the logo.** Keep the logo facing camera; prefer push-ins and 20–30° sways over 90° orbits.
4. **Raw Flow audio is very quiet** (-30 to -52 LUFS on Omni, -14.8 on Veo Lite). Always `loudnorm=I=-14:TP=-1.5:LRA=11` in finishing; afterwards QC read -13.9 / -13.8 LUFS.
5. **Output is 720x1280, not 1080x1920.** QC warns `resolution` on every Flow clip; an upscale step is still to build.
6. **Dialogue works and is checkable offline** with faster-whisper `base.en` (venv in `cache/scratch/stt`; decode with ffmpeg to a float32 array because the bundled PyAV rejects `metadata_errors`).
7. **Captions must avoid the chest logo.** Default safe-zone caption landed on the logo in a selfie framing; `subtitle_position: 0.43` placed it between chin and logo.
8. **Logo end card:** white logo from `Logo/Transparent/acme-logo-white.png` at 420 px wide, centred slightly above middle, 0.6 s fade-in while the last shot fades out. Looked crisp with the orange dot.
9. **A short black tail with a small logo is an end card, not a failure** (QC now classes it as the soft `end_card_black` warning).
10. Credits tracked per shot match Google's table (4 s = 7, 6 s = 10, Veo Lite 10). A failed save does NOT refund (see bugs).

## Bugs found and fixed during the run (all committed)
- **Paid clip generated but not saved** (7 credits): the MCP child inherited `TMPDIR` of another profile's pruned scratch dir, so Playwright's download artifact vanished (`ENOENT ... profiles/ted/cache/scratch/...`). Fix: `ensureOwnTmpDir()` points `TMPDIR` at `outputs/.tmp` before Chrome starts. The clip was recovered with `flow_download_latest` equivalent.
- **Ingredient attach failed in a project that already had uploads**: the picker now shows a preview with an **"Add to prompt"** button instead of attaching on click; handled via `ADD_TO_PROMPT`.
- **Picker fills progressively**: the first option appears before the rest, so the attach step now polls up to 8 s for the asset.
- `flow_qc_report`: tail-black end-card handling; `flow_stitch_videos`: numeric caption height.

## Still unknown / next experiments
- Whether 360p drafts exist in the UI, and whether upscaled 360p holds up (not tested; no control found).
- Reference-image cap per generation (only ever attached 1).
- Consistent *person* across shots (A2 and A3 used different people: no model sheet / Character yet). Build the `@Character` before real ads.
- A4 needs a re-shoot without the arc; B-ad shots B2–B4 and the colourway smash-cut were not generated.
