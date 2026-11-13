# Music + longer clips + beat-synced ads (practice run 2, 2026-10-17)

Credits **938 → 899 (39 spent)**: B1 Omni 8 s = 12, B2 Omni 10 s = 15, B4 Omni 8 s = 12. Music and images cost no Flow credits.
Brand orange approved by the user: **#FA7F14** (measured from the logo files). the user approved building the `Maya` character.

## Flow Music (flowmusic.app) — how it works and how to drive it
* Separate app (Flow's `More options → Flow Music` is `https://www.flowmusic.app/?utm_source=flow`). Sign in with **Continue with Google**
  from the already-signed-in profile: the account that appears is the profile's own Google account (a free "FREE" plan; the page
  banner "Grant access to your Google One subscription" is a **benefit grant that is the user's call**, never clicked).
* **Model: Lyria 3.5** (chat "Producer"). Prompt box = `textarea[placeholder*="create" i]`, send = `button[aria-label="Send message"]`.
  Settings (`Chat settings`): Customize Producer, Instrument (Lyria 3.5), Ghostwriter, Producer (Standard/fast thinking).
  Compose panel has `Instrumental` and `Advanced sound` toggles. It always returns **two takes**; build time ≈ 1–2 min.
* Each song's `More options for <title>` menu: Remix · Details · **Download → Download video / Get stems / M4A / MP3 / WAV** · Share ·
  Add to · **Split stems** · Report · Delete. Download WAV: hover `Download`, then click the format and catch Playwright's `download` event.
  WAV came back 48 kHz stereo, ~2:30 long (29–34 MB). Free-account downloads are unlimited per the page copy.
* **Rights (read before using in a paid ad):** Google lists *commercial-use rights* as a benefit of the Flow Music plans bundled with Google
  AI Plus/Pro/Ultra (Starter/Plus/Member). The standalone **FREE plan's commercial rights are not stated** on the public pages. the user's profile
  shows FREE and the Google One benefit is not granted, so **treat these tracks as drafts only**; for any paid ad, get the benefit granted
  (his decision) or use a Meta Sound Collection / TikTok Commercial Music Library track, and keep the plan screenshot as licence evidence.
  Output carries SynthID.
* **Prompting for editing, not for listening:** ask for an exact tempo, "kick on the very first beat, no fade-in, no riser", "four-on-the-floor",
  a drop on a named bar, and "about 30 seconds". **It ignores most of this** (see below), so always measure the result.

## What Lyria actually returned for "exactly 120 BPM, kick on beat one, ~30 s, drop at bar 5"
| | Take 1 | Take 2 |
|---|---|---|
| Length | **2:30** (not 30 s) | 2:30 |
| Tempo measured | **126 BPM** (not 120), rock steady (476 ms intervals) | **122 BPM** |
| First beat | 0.023 s (kick immediately: good) | 0.035 s, but **bars 1–9 are near-silent** (energy ~1/3), build lands ~bar 10 (≈17.7 s) |
| Loudness | -16.4 LUFS | quieter (mean -22.6 dB) |
The beat detector's 126 grid scored **71/80** kick-band hits on-beat (ratio 2.46) while a naive 120 grid scored 39/77 (ratio 1.02): so
**the requested BPM is only a suggestion; detect it.** Pick the take by listening/measuring: take 1 was usable from second 0; take 2 only
after its build (cut from bar 10 with `music_start`).

## Beat sync (`flow_analyze_beats`, `flow_beat_sync`) — verified
* Detector: ffmpeg → mono PCM → FFT spectral flux (bass-weighted) → autocorrelation tempo → phase search → grid. No Python/librosa.
  Synthetic click tracks with loud off-beat noise at 100/120/128/140 BPM: tempo within 0.5 BPM, **beat error ≤ 28 ms**.
* On the real Lyria track the scene-detect of the final video put cuts at 2.875 / 7.625 / 11.417 s vs planned 2.857 / 7.619 / 11.429 s, and the
  audible beat nearest each cut was a constant **+23 ms** away (an analysis-window calibration, below the ~40 ms where sync reads as off).
* Method: every clip gets a **whole number of beats** (`beats`: 4 = one bar), so every cut lands on a beat; the music starts on its first
  detected beat (or `music_start`); end card via `logo` + `logo_beats` fades the picture out one beat before the logo fades in; dialogue clips use
  `clip_audio_volume: 1.0`, `music_volume: ~0.55`, `duck_music: true`; final loudnorm -14 LUFS.
* Phrase-length rule: use clip lengths of 6/8/10/16 beats (3/4/5/8 bars) so cuts fall on bar lines; avoid 5 or 7-beat clips.

## Finished drafts (all pass QC hard checks; 720x1280; ~-14 LUFS)
* `EPS_AdA_reveal_beatsync_9x16_v02_draft.mp4` — 15.25 s, 126 BPM, clips of 6/10/8/8 beats, logo end card.
* `EPS_AdB_maya_beatsync_captioned_9x16_v02_draft.mp4` — 15.75 s, 122 BPM from bar 10 of take 2, three Maya clips (8/16/8 beats), ducked music,
  whisper-timed captions at 0.46 height, logo end card. Transcript verified: "Midterms week. This is the uniform. … Wear what you study."

## Longer clips (8 s and 10 s) — what held
* Omni 10 s works with a reference (B2: 10.01 s, 720x1280, back print stable, same woman, natural walk). Cost 15.
* Omni 8 s dialogue (B1, B4): line finishes in the first 4 s as asked, then a held smile; the remaining seconds are cut room.
  **Always tell dialogue clips to finish the line early** and keep clips 8 s for flexibility; B4 "Wear what you study" transcribed correctly with
  Whisper `small.en` (`base.en` heard "Where": use `small.en` for transcripts).
* Quiet raw audio persists (B2 -37 LUFS; dialogue clips -19/-23): loudnorm after mixing is mandatory.

## The Maya character
* Two model sheets (4 views, plain black tee) with Nano Banana 2.1 at x2, 16:9: 0 credits. Picked sheet 1; created Flow character `Maya`
  (`50045afd-5f96-43fc-b3d6-cfb6b2b40d3c`) from it via `flow_create_character` (from_photo mode). Project `Acme Practice 1`.
* Using `@Maya` in text was not tested; passing the **cropped front view as an ingredient** worked: B1 and B4 are the same woman as the sheet
  (hair, skin tone, face) and, in B2, the back crop kept the same hair and build. Resemblance was judged by a vision model, n=1; a human check is still due.
* Pitfall: **the model sheet shows a plain tee; the hoodie comes from the second reference**, and both appeared correctly (logo present, hoodie correct). Keep refs in the order: person first, garment second, and say "from the first/second reference image".

## Bugs found and fixed in this run
* Flow tab not in front (after using the Music tab) → overlay backdrop blocked clicks: scratch harness now `bringToFront()` + Escape. MCP code that opens other tabs must switch back.
* Ingredient picker: when a project holds many assets, the new asset is outside the visible window → now uses the picker's "Search assets" box.
* `flow_generate_image` hit the same lost-TMPDIR ENOENT on the **old MCP child** (before restart); fixed in code, but the running child keeps the old environment until reloaded.
