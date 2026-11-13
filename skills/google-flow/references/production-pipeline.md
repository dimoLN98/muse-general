# Production pipeline around Flow (finishing, QC, publishing rules) — distilled

Long form with URLs and tested ffmpeg recipes: `docs/research/flow-production-pipeline.md`. **This is research, not legal
advice**; have a lawyer/Ad Standards review price claims, endorsements and "Made in Canada" language before paid spend.
the user approves every post; nothing here authorises posting, spend or supplier commitments.

## Known gotchas first
* **Captions:** a bare `subtitles=file.srt` burn landed at ~94% height (inside the bottom UI zone). **Fixed 2026-10-17:**
  `flow_stitch_videos` now defaults `subtitle_position: "safe"` (portrait text ends above ~64%, 12% side margins);
  `"bottom"` restores the old behaviour. A full ASS pipeline (brand font, word highlight) is still to build.
* **Keep Flow's native 24 fps** through the edit; set `-r 30` once at export if wanted; avoid minterpolate on AI footage.
* **ffmpeg 9** removed `-filter_complex_script` (use `-/filter_complex`); local build: `~/.config/tools/ffmpeg-9.0.1-linux-x64`.
* **A 16:9 clip stitched to 9:16 is padded with black bars.** Generate natively at 9:16 for real ads.
* **Flow Agent batch** bills per generation (5 variations of an 8 s Omni 720p = 60 cr). Keep "Confirm before generating =
  Always"; generated media lands in whichever project is open; the Agent rewrites prompts → capture the **final prompt** in a sidecar.
* **Flow Music is a separate app** (flowmusic.app), not a Flow panel. PRO maps to Flow Music "Plus" (commercial use per a
  secondary source — read the in-app terms and screenshot them as licence evidence). Published songs allow community remix → don't publish brand audio.

## Local tools that already exist
`flow_stitch_videos` (join, 9:16 reframe, music, safe-zone captions) · `flow_save_frame` · `flow_qc_report` (format, black/frozen/silence,
loudness, contact sheet + JSON) · `flow_create_tool/refine/inspect` for planning/checking helper apps.
**Measured: a raw Flow Omni clip came out at -39.1 LUFS / -24.1 dBTP** — about 25 dB under the -14 LUFS platform target, so
loudnorm is mandatory in finishing, not optional polish (one clip; re-check on others).

## Finishing recipes (all ffmpeg/Python, tested only on synthetic lavfi clips; try real footage once)
Ingest 720p→1080×1920 · brand LUT + grain · ASS captions with `fontsdir` · end card with xfade/acrossfade · sidechain ducking ·
two-pass loudnorm **-14 LUFS integrated / -1 dBTP / LRA ≤11** (sources disagree: -14/-16; normalise *after* mixing) · final export
H.264 High, yuv420p, BT.709, faststart · 4:5 center-crop + 3:4-safe cover for the IG grid. Whisper/librosa were **not installed**
(STT and beat detection untested). Don't strip provenance metadata (SynthID/C2PA/IPTC).

## Specs to build to
9:16, 1080×1920, H.264 MP4 (<500 MB TikTok, <4 GB Meta). Safe zone = union of Meta's 14% top / 35% bottom / 6% sides and
TikTok's ~11% sides. Exact Meta Reels-ad specs came from aggregators (Meta pages didn't load) — re-check before paid.

## Music
Trending/licensed music is **not allowed in ads** on either platform. Use Meta Sound Collection, TikTok Commercial Music Library
(TikTok-only licence), music you own/license, or Flow Music under the plan terms. Always store a `.licence.txt` beside the audio.

## Platform rules (Canada, Oct 2026; re-verify before launch)
* **TikTok:** AI-generated disclaimer required on ads that are fully/significantly AI (Ads Manager toggle or API
  `aigc_disclosure_type=SELF_DISCLOSURE`); availability on Acme's account unconfirmed. TikTok continues in Canada (wind-up order set aside, Mar 2026).
* **Meta:** mostly auto-labels ("AI info", via C2PA signals); self-disclosure required for political/social-issue ads. Don't strip metadata to dodge labels.
* **Canada:** no AI-label statute found; Competition Act "general impression" test, "no AI exception" (Bureau, Sept 2026);
  drip pricing; genuine "was" prices; accurate fibre/"Made in Canada" claims; Ad Standards (Fall 2025): material-connection
  disclosure for AI influencers, AI-persona testimonials about product experience are a problem. Quebec adds French-language
  rules; CASL, minors, likeness/model releases not covered → counsel.
* AI visuals of a garment must not mislead on fit/colour/print (use real product stills for the product truth).

## QC before showing the user (target: only drafts with zero hard-fails)
Automatic: ffprobe (h264/High, 1080×1920, yuv420p, CFR, duration ±0.5 s, AAC 48 kHz) · `blackdetect=d=0.2:pic_th=0.98` ·
`freezedetect=n=-60dB:d=0.5` (whitelist the end card) · `silencedetect=n=-50dB:d=0.5` · `ebur128=peak=true` (-14 ±1, ≤-1 dBTP,
LRA ≤11) · `cropdetect` · safe-zone overlay · contact sheet (`fps=1,scale=270:-1,tile=6x4`).
Visual per shot (frames at start/mid/end): hands/teeth/eyes, limb count, face morph, hoodie silhouette/seams/drawstring, **print
and logo shape and spelling (reject warped small type)**, fabric physics, colour vs real SKU, baked-in text/watermarks, flicker,
identity drift between shots. Brand: palette, wordmark/clear space, brand font, no competitor marks/celebrities.
Audio: speech intelligible (duck ≥6 dB), no sound-alike melody, no clipping, licence attached, lip-sync OK (<~10 words).
Disclosure/claims: platform AI flag set, `#Ad` if any material connection, no AI-persona "reviews", all-in price, genuine
"was" prices, French variant if Quebec. Accessibility: burned captions + sidecar `.srt`, contrast ≥4.5:1, ≤3 flashes/s.
Hand-off to the user: 9:16 final, 4:5 crop, cover still, `.srt`, QC summary (≤10 lines), the AI-disclosure setting that will be used,
music source/licence, credits used.

## Campaign folder + naming
```
campaigns/{YYYY}-{season}_{slug}/ 00_brief (brief, shotlist, claims.md) 01_refs 02_flow_raw (+_meta/*.json) 03_selects
04_audio (+.licence.txt) 05_edit 06_exports 07_qc 08_published
```
Files: `{CAMPAIGN}_{concept}_{ratio}_{v##}_{yyyy-mm-dd}.ext`; shots `S##_v##_{model}{res}`; never overwrite an approved export.
Sidecar JSON per asset: `prompt_final, agent_session, model, length_s, resolution, ingredients[], characters[], credits,
flow_project, flow_asset_name, ai_generated=true, reject_reason`.

## Pipeline v1 (A automated · P partly · N needs a new tool · H human)
1 brief + claims sheet (N/H) → 2 Flow project setup, Confirm=Always, 9:16, Omni (P) → 3 lock references: real packshots as
ingredients + Character (A) → 4 draft shots ~3 per shot (A + sidecar N) → 5 auto-QC drafts (N) → 6 promote keepers, 1080p
download, save last frames (A) → 7 music with licence evidence (N/H) → 8 assemble (`flow_stitch_videos`, P) → 9 grade (N) →
10 captions: STT → ASS → burn (N) → 11 mix + duck + loudnorm (N) → 12 export master + 4:5 + cover + srt (N) → 13 full QC +
compliance report (N) → 14 **the user reviews** (H) → 15 publish checklist, no auto-post (N/H) → 16 post-mortem (H).
**Build order:** `qc-report` → `auto-caption` (whisper + ASS) → `audio-finish` → `export-ad` → `end-card`/`apply-look`/`beatgrid` →
sidecar writer + credit gate inside `flow_generate_video` → Flow Music helper (lowest).

## Takes-per-keeper budget (derived, not authoritative)
(SUPERSEDED: the user rejects 360p, 9 Nov 2026 — use 720p takes only) 3 Omni 360p drafts per shot (4–7 cr each) + free 360→720 upscale + free 1080p download ≈ 60 cr per 4-shot ad versus 144 if
every take is 720p. Whether the upscale equals a native 720p render is unverified — test once before relying on it.
