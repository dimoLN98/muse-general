---
name: flow-music
description: Use when making music in Google Flow Music (Lyria).
version: 1.0.0
author: Muse
license: MIT
metadata:
  tags: [flow-music, lyria, music, ads, sound-identity]
  related_skills: [google-flow, commercial-music-sourcing]
---

# Flow Music (flowmusic.app, Lyria 3.5) for ads, Reels/TikTok and your brand's sound identity

## When to Use

* Generating, editing, downloading or measuring a track in Flow Music (Lyria) for an ad, Reel, TikTok or brand sound.
* Planning a sonic logo, music bed, beat-synced cut, or checking commercial rights of an AI track.

Separate app from Google Flow (video). Signed in as first@example.com; the account shows plan **PLUS** (Google AI Pro benefit).
Google's Google One pages list *Commercial use rights* for Starter/Plus/Member. Scope (paid ads, exclusivity, sound-mark) is NOT spelled out: keep a licence pack, see `references/rights-and-proof.md`.
UI map + tested module: `integrations/google-flow-browser-mcp/docs/research/flow-music-ui-map.md` (301 lines, every selector tagged [live]/[documented]/[unverified]) and `src/tools/flow-music.js` (509 lines, registered as the `flow_music_*` MCP tools).
Lookalike domains (flow-music.app, flow-music.net, flowmusic.io, lyria3-pro.com) are NOT Google; ignore their claims.

## The one rule that matters
**Tempo, length, key and structure are hints, not controls.** Proven live by the mapping run (`docs/research/flow-music-ui-map.md`): the compose panel's Length field accepts only **1:00-3:00** (smaller values are clamped on blur) and still overshoots by 4-10 %; a 0:16 request returned 2:19. BPM is appended to the prompt text as `, <n> bpm` and the model has a strong **120 BPM attractor**: 120 -> 120.0, 140 -> 143.8, 100 -> 105, but 90 -> 120.0 twice. First test by us: asked 120, got 126 and 122. Natural endings are always a 2-3 s fade.
**So the method for an exact length is: generate anything, then cut locally.**
1. `flow_music_generate` (compose route; 5 credits per take, ~20-38 s; both takes come back).
2. `flow_music_download` format `WAV` (free, 48 kHz stereo, 2-6 s), keep the raw file.
3. `flow_music_shorten` (free): measures tempo + first kick with the beat engine and cuts whole bars from the first kick (16.00 s at 120 BPM = 8 bars = 32 beats; measured result 15.996 s with the kick 11 ms after the cut, 4 ms fade-in, 40 ms fade-out).
Alternative in-app cuts (both free): song menu > Remix > **Trim** (0.1 s steps; 0:00.4-0:16.4 gave exactly 16.000 s), or chat "Trim the track to the first 16 seconds". **Natural track ends are long fades, so the local cut's end fade is what makes the ending clean.**
Never plan picture to the requested BPM: measure what came back (`flow_analyze_beats`) and choose the bar count.

## Workflow
1. Brief: purpose, length target, BPM band, key, mood, instruments, structure, `Instrumental only, no vocals`, `Avoid: ...` (no artist names).
2. Generate (New session, Instrumental on, Lyria 3.5). Two takes come back; keep both.
3. Download **WAV** (48 kHz stereo, ~30 MB for 2:30), keep the raw file untouched.
4. Run the post-download checklist (`references/post-download-checklist.md`): duration, BPM + on-beat ratio, first-beat time, RMS of bars 1-4, silence gaps, LUFS, vocals check.
5. Fix by chat edits (one change per message: "Shorten only the intro to 1 bar. Keep groove and tempo identical."), Remix (Extend/Cover/Replace), Trim, or just cut locally on a bar line.
6. Mix: bed ~8-10 LU under speech while speaking (`music_volume ~0.55`, `duck_music:true`), final loudnorm -14 LUFS / -1 dBTP.
7. Save a sidecar: prompt, session URL, take, model, plan, SHA256, measured BPM/LUFS, cut start/end.

## Tool inventory (module `src/tools/flow-music.js`, registered as `flow_music_*`)
| Tool | What | Cost |
|---|---|---|
| `flow_music_generate` | Compose-panel generation from structured fields (genre, mood, instruments, bpm, key, target_sec, avoid) -> both takes | 5 credits/take |
| `flow_music_download` | Download WAV/MP3/M4A to `outputs/music` | free |
| `flow_music_shorten` | Cut a beat-aligned excerpt of whole bars, locally | free |
| `flow_music_songs` | List library songs (id, title, length, date) | free |
| `flow_music_trim` | Trim inside the app (Remix > Trim), keeps a new library song | free |
| `flow_music_stems` | 4 stems (drums, bass, other, vocals) as AAC m4a, unzipped | free |
Measured credits: 5 per generation; downloads, Trim (menu and chat), stem splits and "Simple" music video were all **0**. The Settings balance lags one generation behind - `/settings` is authoritative. Flow Music windows are opened with `Target.createTarget {newWindow:true}` in their own Chrome window so they never steal focus from the Flow tab.

## Other live facts from the mapping run
* Split stems returns **drums, bass, other, vocals** (AAC m4a, unzipped, ~33 s). One ledger entry "Stem Separation -5" could not be tied to a specific split: check the balance after splitting.
* "Simple" music video = 720x1280 H.264 24 fps + AAC, 0 credits (found to take ~40 s).
* Deleting songs and stems from the library is free and works.
* A stray "Interactive Music Spaces" Producer session starts if `New space` is clicked (0 credits, could not be deleted by the mapper) - **don't click New space**.
* Official prompt guidance still applies (genre framework, instruments, mood, section tags, `Avoid:`), but the clock is theirs: structure tags and timestamps are obeyed in ORDER more than in time.

## Prompt skeleton (same order every time)
`Instrumental only, no vocals. <duration> <purpose> bed for <brand/ad>. <genre>, <BPM> BPM, one steady tempo, key of <key>. Starts on beat one with <drums>, no fade-in. <instruments>. <structure / timestamps / intensity>. Ends on one accented hit, no long tail. Avoid: vocals, long risers, ...`
Officially supported: genre-first framework, instrument names, mood words, `[Intro]/[Verse]/[Chorus]` tags, timestamps `[0:00 - 0:10]`, "Build to a beat drop at 12 seconds", `Intensity: 3/10`. Vertex has `negative_prompt`; in chat use an inline `Avoid:`. 20 copy-ready prompts: `references/prompt-library.md`.

## Brand sound identity

* Define your brand's sound DNA (tempo, instruments, mood, what to avoid) and put that paragraph in **Customize producer -> Instructions** so every session inherits it.
* Fix a key family and tempo anchors for your brand, and reuse one short motif in the logo sting and the beds so the sound is recognisable.
* Build the final sonic logo with a human-made layer (your own recorded sound): prompts alone give weak authorship, and Google may generate similar tracks for others.
## Do / don't
* Don't register Flow Music tracks with Content ID or distributors; don't Publish in Flow Music; keep tracks private in a Playlist/Project for your brand.
* Don't name real artists (blocked/risky). Don't use sung AI vocals without disclosure; prefer instrumental logo + human voice tag.
* Don't click the Upgrade/credits/Invite/Share-publicly items. Flow Music credits are separate from Google Flow credits.
* TikTok and Meta ads: the Flow Music track is *your own original audio*; for libraries see skill `commercial-music-sourcing`.
* Raw Lyria loudness is low (-16 to -22 LUFS): normalise only after mixing.

## References
* `references/prompt-library.md` - P1-P20 prompts + length/start/end/tempo/instrumental/VO-space tactics.
* `references/post-download-checklist.md` - 12-step check, six briefs B1-B6 with expected ranges.
* `references/rights-and-proof.md` - what Google says per plan, SynthID, Content ID/AI labels, licence pack.
* Also: the `google-flow` skill file `references/music-and-beat-sync.md` (measured results of the first run).
* Full cited guide: `google-flow-browser-mcp-cloud/docs/research/flow-music-craft.md` (550 lines, 75 sources).

## Open questions (the mapping run answered most of these; these remain)
* Extend / Replace / Cover were mapped but never generated: does Extend return only the new segment or the whole clip? (Costs unknown.)
* `generateTrack({via:'chat'})` is implemented but untested; the compose route is the tested one.
* AI Music-video template credit price, Playlist/Project/Space creation, Publish, batch download zip, Voice mode, error banners and queue behaviour untested.
* You cannot get a tempo other than ~120 reliably: 90 came back as 120 twice. Workaround to test: upload your own click/beat as Audio and use Remix Cover/Extend.
* A late banner "Grant access to your Google One subscription" reappeared while the plan badge still said PLUS and credits worked. Decide whether to grant (the user's call).
