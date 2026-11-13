# Post-download checklist and six Acme briefs
_Source: `integrations/google-flow-browser-mcp/docs/research/flow-music-craft.md` (cited; tags [G] Google, [C] community, [M] measured by us, [unverified])._

## 10. Acme music brief templates + post-download checklist

### 10.1 Six ready-to-paste briefs (each: paste, expected range, verify)
Common: paste into a **New session** with Lyria 3.5 selected (Settings -> Instrument), Instrumental toggle ON. Request count 1; keep both takes; name files `EPS_<asset>_<bpm>_<key>_v##`.
**B1 - 15 s Reels bed ("Campus Day")**
```
Instrumental only, no vocals. 15-second upbeat bed for a campus-life streetwear ad, 128 BPM, steady tempo, key of D minor. Starts on beat one with kick and handclaps, no fade-in. Bright plucked synth motif, round sub bass, tight hats. Energy lifts at bar 5. Ends on one accented hit, no tail. Avoid: vocals, long risers, guitar solos.
```
Expected: tempo 122-134; length 15 s to 2:30 (use first 8 bars); first beat <= 50 ms. Verify: tempo, first-beat time, early RMS, vocals stem silent, cut 8 bars at measured BPM.
**B2 - 30 s talking-head / VO bed ("Studio Night")**
```
Instrumental only. 30-second lo-fi bed under spoken voice, 90 BPM, steady, key of F minor. Soft boom-bap drums from beat one, warm Rhodes chord every 2 bars, round bass. No lead melody, no vocals, flat dynamics, clean space for narration. Ends on a clean stop.
```
Expected: 86-95 BPM; may include a melody anyway. Verify: mid-range energy 1-4 kHz during the "speech" portion, ducking test with a sample VO, total length.
**B3 - product-reveal build + drop (15 s)** = P7 above with 100 BPM. Expected: build exists, drop somewhere bars 3-10, not exactly 0:09. Verify: detect the real drop time (energy jump), then retime picture to it; if the drop is unusable use Remix -> Replace on the build section with "stop for one beat, then full drop".
**B4 - sonic logo set (generate three variations in one session)**
```
Instrumental only. Make three different 2-second sonic logos for a premium minimalist streetwear brand, each starting immediately, no drums, no riser, resolving on a warm D-major feeling interval, short natural tail:
1) three ascending glass-synth notes with a soft sub thud;
2) a single deep bell-like tone with a tick at the start;
3) a two-note descending-then-rising motif on a warm pad.
```
Expected: Lyria returns long tracks, not 2 s files; the Producer may split them. Verify: pick the best 2 s via Trim/ffmpeg; check peak/clipping, tail <= 0.5 s, mono-compatibility.
**B5 - loop bed ("Drop Day" calm version)**
```
Instrumental only. 8-bar loopable groove at 100 BPM, key of D minor: kick, snare, hats, sub bass, one repeating 2-bar synth motif. Flat energy across 8 bars, no fills, no riser, starts on beat one, ends on the last beat of bar 8 so it repeats cleanly.
```
Expected: 96-106 BPM; a longer track with a build anyway. Verify: pick two bar-aligned points 8 bars apart (e.g. bars 3-11) with matching spectral energy; crossfade 20-50 ms; loop-play for 60 s; no click.
**B6 - drop-day hype (20 s)** = P16. Expected: 132-146 BPM. Verify: steadiness of interval, no vocals, loudness, ending.

### 10.2 Post-download checklist (agent runs after every Download)
Do all steps on the **WAV**, not the preview. Keep the raw file untouched; work on copies.
1. **Identify**: `ffprobe -v error -show_entries format=duration:stream=sample_rate,channels,codec_name -of default=nw=1 file.wav` -> record duration, 48 kHz/stereo [M] (API doc says 44.1 kHz, so confirm).
2. **Tempo and grid**: run the local beat tool (`flow_analyze_beats`) -> BPM, beat grid, kick-band on-beat ratio, interval std-dev [M]. Pass: ratio > ~2, steady intervals. Fail: ratio ~1 (beat detector sees no groove) like the naive 120 grid test [M].
3. **First beat and silent intro**: first beat time <= 50 ms; also `ffmpeg -i file.wav -af silencedetect=noise=-45dB:d=0.15 -f null -` to list silence at the start and tail. Compute mean RMS per bar for bars 1-4: if bar 1-4 < ~50 % of the loudest section [M observed ~1/3], reject or trim to the build.
4. **Silence gaps mid-track**: any silence >0.3 s inside the planned cut = reject (unless intended stop for a drop).
5. **Loudness**: `ffmpeg -i file.wav -af ebur128=peak=true -f null -` -> integrated LUFS, LRA, true peak. Record raw values (raw Lyria was -16.4 LUFS [M]). Don't normalize yet.
6. **Instrumental check**: Split stems -> vocals lane near silent, or listen to first 3 bars; fail on any vocal chop/"yeah" [unverified method].
7. **Choose cut**: from the measured BPM, choose bars so that seconds = bars x 4 x 60 / BPM hits the target length; start at the first strong bar line; end on a downbeat + last hit. Print: `start_s`, `end_s`, `bars`.
8. **Trim**: `ffmpeg -ss <start> -t <len> -i file.wav -af "afade=t=out:st=<len-0.05>:d=0.05" out.wav` (50 ms fade; use 5-10 ms for hard hits). If a tail/ring-out is wanted, extend by <= 0.5 s.
9. **Recheck**: re-run beat tool + ebur128 on the trimmed file; confirm first beat 0-30 ms, end clean, no click at edges.
10. **Mix test**: place under a sample VO, apply duck (section 9.2), loudnorm to -14 LUFS / -1 dBTP: `ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11 out.wav`; listen on phone speaker.
11. **Metadata + proof**: write `docs`/sidecar JSON: prompt, session URL, take #, model, plan, timestamp, SHA256, chosen start/end, BPM measured, LUFS. Screenshot plan page (section 7.7). Do not publish the track in Flow Music.
12. **Rights gate**: confirm the account shows a plan with "Commercial use rights" before using in any paid placement; otherwise label file `DRAFT_ONLY`.

## 11. Source conflicts and unclear points (explicit)

1. **Commercial rights**: Google One pages say Starter/Plus/Member have "Commercial use rights" [G]; flowmusic.app/pricing and Terms are silent and rely on Google's general Terms [G]; reviewers call this "not a licence" [C]. Free plan: unknown.
2. **Stems**: Pricing page lists stem downloads for all plans [G]; a Reddit commenter says "no stems, no covers" (written at launch or from the Gemini surface) [C]; a Japanese reviewer's stem split failed in launch week [C]; another reviewer got four stems [C]; the API doc documents no stems [G, API]. Treat stems as available but verify per file.
3. **Sample rate/format**: API doc says 44.1 kHz stereo MP3/WAV [G]; TechTimes says 48 kHz 16-bit [C]; our download measured 48 kHz [M].
4. **Length**: "up to 3 minutes" [G]; reviewer got 2:59 and 3:02 [C]; we got 2:30 [M]; an asked 60 s gave 61.9 s [C, Gemini app].
5. **Tempo control**: Google says "more easily control the tempo and duration" [G]; our measurement is a 2-5 % miss [M]; one reviewer asserts Lyria 3.5 "lets you set it outright" [C] https://aivideosensei.com/guides/lyria-3-5-flow-music-guide (not a hands-on test: that article says "not a listening review").
6. **Multi-turn**: API says single-turn only [G, API]; Flow Music help documents prompt-based edits to existing songs [G].
7. **Pricing**: flowmusic.app/pricing shows $6/$18/$48 (annual-billing discount); reviewers quote $8/$24/$64 monthly [C]. Your plan comes bundled via Google AI Pro so price is moot.
8. **Daily top-up**: "Daily top-up credits" with no number [G]; 30/day on Free [C].
9. **Sonic logo length**: 1-3 s [C] vs 2-4 s [C-platform TikTok blog].
10. **Ducking depth**: 6 LU vs 10-15 dB vs 4-5 dB [C] (section 9.2).
11. **Content ID guidance**: only one vendor blog [C] undetectr.com; low confidence.
12. **Voice mode / Variation / Trim / Reimagine** appear in reviewer notes, not on Google help pages I fetched [C]; the **Advanced sound toggle** is undocumented everywhere I looked.
13. **Lyria 3.5 in Gemini vs Flow Music**: the Gemini app now also runs Lyria 3.5 (Sep 4, 2026) [G] but its commercial/ads terms are not the Flow Music Plus terms [unverified]. One lookalike site claims otherwise; ignore.
