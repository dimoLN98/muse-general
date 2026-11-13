# Flow Music craft guide for Acme (Lyria 3.5 "Producer" chat): ads, Reels/TikTok, sound identity

Researched 2026-10-16 by web research only (no logins, no generation, no credits spent). This is research, not legal advice.
Acme context: pre-launch Canadian streetwear, black/white + orange #FA7F14, oversized hoodies, university students, 15-30 s vertical ads.
Evidence tags used on every claim:
- **[G]** Google official (blog.google, deepmind.google, ai.google.dev, docs.cloud.google.com, support.google.com, flowmusic.app, policies.google.com).
- **[C]** community / third-party (reviews, blogs, SEO guides, Reddit, vendors). Treat as a lead, not a fact.
- **[M]** measured by us (the user's agent) in `skills/media/google-flow/references/music-and-beat-sync.md`.
- **[unverified]** logical inference or folklore with no source. Test live before relying on it.
- **[derived]** arithmetic we computed ourselves (shown so you can check it).

## 0. Read this first: source hygiene

1. **Lookalike sites are NOT Google.** `flow-music.app`, `flow-music.net`, `flowmusic.io`, `lyria3-pro.com`, `nanobananapro.hk` and similar sell
   "Flow Music" wrappers with their own plans ("royalty-free commercial rights on all tracks", "C2PA certificate", "44.1 kHz WAV"). One of them states
   in its own terms that it "has no official affiliation with Google" (https://www.flow-music.app/terms-of-service). Ignore their commercial-rights and
   pricing claims. The real product lives at `flowmusic.app` / `flowmusic.google` (the latter redirects to the former, checked with curl on 2026-10-16),
   and its Terms link goes to Google's general Terms (https://www.flowmusic.app/terms resolves to https://policies.google.com/terms).
2. Many "Lyria 3.5 guides" are SEO pages. Several describe the **Gemini API / Vertex** (single-turn, MP3, `negative_prompt` parameter), not the Flow
   Music Producer chat (multi-turn editing, Remix, stems). Where a claim comes from the API docs, it is marked "API" below.

## 1. Top takeaways (details and URLs in the sections below)

1. **Tempo and length are requests, not guarantees.** Google itself says duration can be "influenced" by the prompt (https://ai.google.dev/gemini-api/docs/music-generation)
   and that results "may vary between calls, even with the same prompt" [G]. Our own run: asked 120 BPM / ~30 s, got 126 and 122 BPM, both 2:30 [M].
   An independent Gemini-app test asked "exactly 60 s" and got a 61.9 s file (59.6 s audible), then a 54 s ask came back 66.0 s with music running ~64 s [C]
   (https://sonilo.com/blog/guides/lyria-3-5-video-creator-review). Always measure, then trim or beat-sync.
2. **Flow Music has real controls beyond the chat box**: Compose panel with Lyrics / Sound / Details (https://support.google.com/flow/answer/17084348?hl=en) [G],
   and reportedly BPM, Length, Seed and Model fields (https://note.com/mydearnana/n/n2cd80f163ee3?hl=en) [C]. Whether they are obeyed is untested by us.
3. **Editing beats re-rolling.** Remix offers Extend / Cover / Replace on a selected section [G]; chat edits such as "Shorten the intro to 4 bars" are
   documented by Google [G]; Trim (waveform start/end) and Variation are reported by a reviewer [C].
4. **Structure tags and timestamps are officially supported** for Lyria 3.5: `[Intro] -> [Verse 1] -> [Chorus]`, `[0:00 - 0:10] Intro: ...`, and
   "Build to a beat drop at 12 seconds" [G] (https://ai.google.dev/gemini-api/docs/lyria-prompt-guide). Hitting the exact second is NOT guaranteed [M][C].
5. **Instrumental-only = say so in words** ("Instrumental only, no vocals") [G]; Vertex also has a `negative_prompt` parameter (API only), and Google's own example
   uses it to remove drums/vocals/sudden changes (https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/music/music-gen-prompt-guide).
6. **Stems**: "Split stems" -> drums, bass, vocals, other (4 lanes) in one reviewer's test, no separate credit line [C]; another reviewer got failures at launch [C]
   (https://aialleyway.com/google-flow-music/ vs https://note.com/mydearnana/n/n2cd80f163ee3?hl=en). Pricing page lists stem downloads on every plan [G].
7. **Credits**: ~5 credits per song/take, ~30 free credits/day on Free, 500 one-time bonus [C]; Plus (your Google AI Pro mapping) = 10,000 credits/month (~2,000 songs), 12 concurrent [G].
   Downloads are advertised as unlimited/free [G]. A 15 s music video cost 188 credits [C].
8. **Commercial use**: Google One help pages say Starter/Plus/Member (via AI Plus/Pro/Ultra) include "Commercial use rights" [G]; the Flow Music pricing page and
   terms say nothing music-specific, only Google's general "Google won't claim ownership over that content" [G]. The Free plan's commercial status is **not stated**. Section 7.
9. **Platform rules matter more than model rules for ads**: Meta says commercial music use "is prohibited unless you have obtained appropriate licenses"
   (https://www.facebook.com/legal/music_guidelines) [G-platform]; TikTok says businesses must use the Commercial Music Library for organic, ads and branded content
   (https://ads.tiktok.com/help/article/commercial-music-library) [G-platform]. A licensed Flow Music track is "your own original audio", not a library track; keep the licence proof.
10. **Every Lyria track carries SynthID** [G] (https://deepmind.google/models/lyria/); YouTube and TikTok have AI-disclosure rules that can apply to realistic AI audio
    (https://support.google.com/youtube/answer/14328491?hl=en, https://seller-us.tiktok.com/university/essay?knowledge_id=491489038501663&lang=en).
11. **Sound identity**: store an "Acme sound DNA" paragraph in Customize producer -> Instructions (auto-enabled in new sessions) [G]
    (https://support.google.com/flow/answer/17083868?hl=en) and reuse the same prompt skeleton, key and tempo family for all beds.
12. **Mixing**: -14 LUFS integrated, -1 dBTP is the common social target but neither Meta nor TikTok publishes a number [C]
    (https://valmera.io/tools/audio-loudness-targets). Duck music roughly 6+ LU under speech [C] (https://mediastrategylab.com/guides/audio-ducking).

## 2. What Flow Music is (facts)

| Fact | Detail | Tag / URL |
|---|---|---|
| Model | Lyria 3.5 launched in Flow Music 2026-07-29: "improved musicality, enhanced lyrics, improved vocals, creative control: more easily control the tempo and duration" | [G] https://blog.google/innovation-and-ai/models-and-research/google-labs/lyria-3-5/ |
| Max length | "up to 3 minutes" on DeepMind page; "prompt for the length you need ... quick 60-second clip, a half-length track, or a full 3-minute song" | [G] https://deepmind.google/models/lyria/ |
| Heritage | ProducerAI (ex-Riffusion) joined Google Labs Feb 2026; renamed Flow Music (April 2026 per one source) | [G] https://blog.google/innovation-and-ai/models-and-research/google-labs/producerai/ ; rename date [C] https://postcutoff.com/e/2026-02-25-google-acquires-producerai/ |
| Eligibility | 18+, supported region, free signup with Google Account | [G] https://support.google.com/flow/answer/17083868?hl=en |
| Chat settings | "Instrument", "Ghostwriter", "Producer" model pickers; Customize producer: Instructions, Google Flows (custom slash commands), Memories | [G] same page |
| Producer modes | Standard (quality/reasoning) vs Fast; Ghostwriter Standard/Pro | [C] https://note.com/mydearnana/n/n2cd80f163ee3?hl=en |
| Model labels | Lyria 3.5 = "Top performing, flagship model"; Lyria 3 Pro = "Legacy model" | [C] https://aialleyway.com/google-flow-music/ |
| Output | Two takes per request in our runs; 48 kHz stereo WAV measured | [M]. API docs say 44.1 kHz MP3 default / optional WAV (https://ai.google.dev/gemini-api/docs/music-generation) [G, API] - conflict, trust the local file |
| Generation time | ~40 s for two 3-min takes (reviewer); ~1-2 min [M] | [C] https://aialleyway.com/google-flow-music/ |
| Downloads | MP3, WAV, M4A, video, stems; single or batch zip; homepage: "Unlimited downloads" | [G] https://support.google.com/flow/answer/17084348?hl=en ; https://www.flowmusic.app/ |
| Model training claim | Lyria 3 Pro "using materials that YouTube and Google has a right to use under our terms of service, partner agreements and applicable law" | [G] https://blog.google/innovation-and-ai/models-and-research/google-labs/believe-flow-music-partnership/ |
| Limits to know | Prompts asking for specific artist voices or copyrighted lyrics are blocked by safety filters | [G, API] https://ai.google.dev/gemini-api/docs/music-generation |
| Privacy default | Uploads, outputs, feedback collected; human reviewers sample data; "Help improve Google Flow Music" toggle (on by default in one reviewer's account); conversations kept up to 18 months | [G] https://www.flowmusic.app/privacynotice ; default-on [C] https://aialleyway.com/google-flow-music/ |

## 3. Prompting: what controls work (verified vs folklore)

### 3.1 Official guidance (all [G] unless noted)
Sources: https://ai.google.dev/gemini-api/docs/lyria-prompt-guide, https://ai.google.dev/gemini-api/docs/music-generation,
https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/music/music-gen-prompt-guide. These are developer docs for Lyria 3.5; the Flow Music chat
runs the same model but adds a Gemini "Producer" layer, so treat them as strong hints, not a Flow Music spec.
| Control | What Google says | Reliability for ads |
|---|---|---|
| Framework | `[Genre & style] + [Mood] + [Instrumentation] + [Tempo & rhythm] + [Vocal style & language] + [Lyrics]`, optional Arrangement, Soundscape, Production quality | Good for sound, weak for timing |
| Genre | "Lead your prompt with the primary genre"; hybrids and eras allowed; keyword list includes Deep House, Lo-Fi Hip Hop, Trap Beat, Synthpop, Indie Pop, Hyperpop, Afrobeat, etc. | Good (judged by ear) |
| Instruments | Declare explicitly (e.g. "TR-909 Drum Machine", "Rhodes Piano", "Boomy Bass", "Kalimba"); model chooses otherwise | Good |
| Tempo | "Set the tempo directly (e.g. 120 BPM, slow tempo around 72 BPM, fast 160 BPM)" | **Approximate**: [M] 126 and 122 for a 120 request |
| Key | "in G major, in D minor" | Unmeasured by us; check with a tuner/analysis |
| Mood words | Ambient, Bright, Chill, Dark, Dreamy, Euphoric, Funky, Groovy, Nostalgic, Upbeat, ... | Good |
| Structure tags | `[Intro] -> [Verse 1] -> [Chorus] -> ... -> [Outro]` "for Lyria 3.5" | Order obeyed more than clock |
| Timestamps | `[0:00 - 0:10] Intro: ...`; also `[mm:ss]` markers; "Build to a beat drop at 12 seconds", "The chorus kicks in at 22 seconds" | Suggestion; [M] drop landed ~bar 10 instead of bar 5 |
| Intensity | Vertex example adds `Intensity: 1/10 (Very low)` per segment | Cheap dynamic control, unmeasured |
| Instrumental | "Specify 'instrumental' in your prompt to exclude vocals completely" (Vertex); "Instrumental only, no vocals" (Gemini API) | Strong; verify with vocals stem (section 10) |
| Negative prompt | Vertex parameter `negative_prompt`, e.g. "vocals, excessive cymbal crashes, distorted guitar"; example: "complex melodies, loud dynamics, sudden changes, drums, vocals" | API-only; in chat use inline "Avoid: ..." [unverified] |
| Lyrics | `Lyrics:` header, tag sections, parentheses for backing vocals; keep lyrics separate from musical direction | Good; own lyrics only |
| Duration | "create a 2-minute song" or timestamps; Clip model "always generates 30 seconds" | **Approximate** |
| Images | up to 10 images (API); Flow Music has Add -> Image | Mood/palette, not literal |
| Safety | Artist-voice requests and copyrighted lyrics blocked; recitation + artist-intent checks | Avoid naming artists |
| Non-determinism | "Results may vary between calls, even with the same prompt." | Plan for 2-4 attempts |
| Multi-turn | API says single-turn only; **Flow Music's Producer does multi-turn edits** (help centre) | Use Flow Music edits |

### 3.2 Flow Music-specific controls (documented)
- Create: **New session** -> prompt -> optional **Add** -> Recording (mic), Audio ("Use your music to create"), Image ("inspire lyrics or cover art") -> Send [G]
  https://support.google.com/flow/answer/17084348?hl=en
- Edit via chat: "Shorten the intro to 4 bars", "Add a bridge before the final chorus", "Make the kick drum punchier", "Change the instruments to an acoustic folk vibe" [G, same URL].
- **Compose** (top right of a song): Lyrics / Sound / Details -> Generate [G, same URL]. A Japanese reviewer lists Lyrics, Sound, BPM, Length, Seed, Model, title, cover [C]
  (https://note.com/mydearnana/n/n2cd80f163ee3?hl=en); another says "Advanced Controls" has tempo and duration sliders [C]
  (https://www.onecooltip.com/2026/10/create-studio-quality-songs-with-google.html). Neither page is Google. **What the "Advanced sound" toggle does is not documented anywhere I found [unverified].**
- Tip from a Japanese tutorial: do not pack many edits into one instruction, e.g. "Please shorten only the intro. Keep the current vibe, but change it from 8 bars to 4 bars." [C]
  https://note.com/npaka/n/n68e7d8194c3d?hl=en
- Draft cheaply: the API's own best-practice is "Iterate with Clip first" (30 s, faster) then render the full model [G, API]. In Flow Music a separate Clip model is not documented [unverified]; the Gemini app also offers "short or longer tracks" with Lyria 3.5 (https://blog.google/innovation-and-ai/products/gemini-app/better-tracks-lyria-gemini/) [G], but **its licence terms for ads are separate and not confirmed here**.

### 3.3 Folklore (not verified by Google, mark as test-first)
- "Exactly 60 seconds", "no fade-in", "kick on beat one", "no riser" - plausible, but [M] shows they are often ignored (take 2 had near-silent first 9 bars).
- "Seamless loop" prompts - no source confirms Lyria loops cleanly; loop in the editor instead (section 5.4).
- Putting BPM, key and instrument names "in that order" (https://www.eachlabs.ai/google/gemini/lyria-3-5) [C] - consistent with Google's framework but not proven.

## 4. Length, clean start/end, tempo, instrumental, negative space

### 4.1 Getting a specific length
1. Ask in the prompt (words + timestamps) AND set Length in Compose if the field exists [C]; treat both as hints [G][M].
2. Prefer **short asks** ("15-second bed", "30-second bed"). Third-party evidence that Lyria gives short files when asked is mixed: reviewer got 61.9 s for 60 s and 66 s for 54 s [C]; our "~30 s" request gave 2:30 [M]. No source shows a reliable 15/30 s result in Flow Music [unverified].
3. If the take is long: **Trim** (waveform Start/End, loop-preview) [C note.com], or cut in your editor/ffmpeg on a bar line (section 10).
4. If the take has the right first N seconds but a bad ending: **Remix -> Replace** the ending section, or chat "End on a resolved single hit, no fade, no long tail" [G mechanism; wording unverified].
5. If you only need the tail/intro: **Remix -> Extend** to continue a good short phrase [G].
6. Plan with a **bar budget**, not seconds [derived]: seconds = bars x 4 x 60 / BPM. 16 bars at 128 BPM = 30.0 s; 8 bars at 128 = 15.0 s; 12 bars at 96 = 30.0 s; 14 bars at 112 = 30.0 s;
   8 bars at 120 = 16.0 s. Since Lyria drifts ~2-5 % [M], re-measure BPM and recompute the cut.

### 4.2 Clean start (on the beat, no silent intro)
- Say it, and expect partial compliance: "Starts immediately on beat one with a kick; no fade-in; no pickup; no silence before the first hit." [unverified wording].
- Verify first-beat time and early energy. [M] take 1 first beat 0.023 s (good); take 2 first beat 0.035 s but bars 1-9 near-silent. Always look at RMS for the first 4 bars, not just first-beat time.
- Fixes in order: (a) pick the other take; (b) chat "Replace the first 4 bars with the full groove (kick, bass, hats)" or "Shorten the intro to 1 bar" [G mechanism, from the "Shorten the intro to 4 bars" example]; (c) Trim start to the first strong bar line; (d) start the music at its build in the editor (what our beat-sync did with `music_start`) [M].
- Ads rule of thumb: music must be recognisable in 1.5-2 s [C] https://tikadsuite.com/blog/best-music-for-tiktok-ads/ , https://raagengine.com/tiktok-music/ .

### 4.3 Clean end
- Ask for a **hard resolved stop** with a short tail: "ends on a single accented hit, tail under 0.5 s" [unverified]. The reviewer saw ~2.3 s of near-silence after audible end [C], so always `silencedetect` the tail.
- For ads, the end is best made in the edit: bar-aligned cut + 30-80 ms fade or hard cut on the last hit, then logo sting (section 8).

### 4.4 Constant tempo
- Lyria's measured track was "rock steady (476 ms intervals)" [M], so drift is mostly **offset from the requested BPM**, not tempo wobble. A community reviewer complains of "hiccups in the rhythm" in some songs [C] https://www.reddit.com/r/SunoAI/comments/1vc9b1o/lyria_35_on_google_flow_music/ - check each take (interval std-dev in the beat tool).
- Keep one tempo in the prompt ("one steady tempo, no tempo changes, no half-time sections") [unverified]; section tags in vocal tracks encourage changes, so for beds use few or no section tags.
- Frame grid at 30 fps: whole frames per beat only when 1800/BPM is an integer: 60, 72, 75, 90, 100, 120, 150, 180 BPM [derived]. (A source gives the 25 fps version: https://www.versely.studio/blog/lyria-3-5-three-minute-vocal-tracks [C].) Because Lyria rarely lands on the exact requested BPM [M], don't chase frame-exact BPMs; detect and snap cuts to the measured grid.

### 4.5 Instrumental-only reliably
1. Toggle **Instrumental** in the compose panel [M] AND write "Instrumental only, no vocals, no vocal chops, no spoken words" [G wording: "instrumental only, no vocals"].
2. Avoid vocal-suggesting words: "anthem", "chorus", "singer", "lyrics", "hook" (use "lead synth motif" instead) [unverified]. Google's guide shows vocal chops/spoken-word are prompt-able, so exclude them explicitly [G].
3. Verify: Split stems and check the vocals stem is near silent; or listen on headphones to the first 3 bars [unverified method].

### 4.6 Negative space for voiceover
- Ask for it by role: "a restrained bed with clean space for narration, no lead melody, sparse mids" [C] https://sonilo.com/blog/guides/lyria-3-5-google-flow-music ; "Ask for instrumental only and the arrangement leaves space where the dialogue sits" [C] https://morphic.com/resources/how-to/lyria-3-5-guide .
- Specify what carries the groove: kick + sub + soft hats; avoid chord stabs and piano leads in 1-4 kHz [unverified; general mixing practice].
- Then duck in the edit (section 9). Don't rely on the model to leave pockets exactly where speech occurs.
- A vocal track "competes with the narration for the same frequency range" -> use instrumentals under VO [C] https://www.versely.studio/blog/lyria-3-5-three-minute-vocal-tracks .
## 5. Copy-ready prompt library (20 prompts)

Status of ALL prompts below: built from [G] guidance (framework, tags, timestamps, instrumental wording), **none tested by us**; results are [unverified] until run.
Common suffix (paste after each, or put in Customize producer -> Instructions): see section 8.2. Do not name real artists (blocked/risky) [G].
Expected behaviour for every prompt: BPM within about +-5 % of request [M], length likely longer than requested, 2 takes.
### 5.1 15 s and 30 s ad beds
**P1 - 15 s upbeat campus bed (Reels/TikTok)**
```
Instrumental only, no vocals. 15-second upbeat campus-life bed for a streetwear ad. Indie-pop meets clean electronic, 128 BPM, one steady tempo, key of D minor.
Starts immediately on beat one with a punchy kick and handclaps, no fade-in, no silence. Bright plucked synth motif, round sub bass, tight hats.
8 bars total, energy lifts at bar 5 with a snare fill, ends on one accented hit with no long tail. Avoid: vocals, risers longer than 1 bar, guitar solos, reverb wash.
```
**P2 - 30 s lo-fi streetwear bed**
```
Instrumental only. 30-second lo-fi hip hop bed for a minimalist black-and-white streetwear brand, 92 BPM, one steady tempo, key of F minor.
Dusty boom-bap drums starting on beat one, warm Rhodes chords, soft vinyl texture, round upright-style bass. Calm and confident, not sleepy.
Section plan: [0:00 - 0:08] drums + bass only, [0:08 - 0:22] add Rhodes chords, [0:22 - 0:30] strip to drums and bass, end on a clean stop.
Avoid: vocals, sudden dynamic jumps, busy melodies, long fade-out.
```
**P3 - 30 s fashion lookbook / runway**
```
Instrumental only. 30-second runway-style lookbook track, minimal deep house, 124 BPM, steady tempo, key of A minor.
Four-on-the-floor TR-909-style kick from the first beat, offbeat closed hats, dry sub bass, one sparse metallic synth stab every 2 bars.
Cool, confident, understated. Intensity 4/10 for the first 16 seconds, 7/10 for the last 14. Ends on a single kick and a short reverb throw.
Avoid: vocals, melodic leads, big risers, genre changes.
```
### 5.2 Hooks, stingers, sonic logos
**P4 - 2-3 s opening hook**
```
Instrumental only. A very short 2-second ad opener: one deep sub-bass hit with a tight snap on beat one, immediate and loud, then a dry silence-free tail that ends cleanly.
No melody, no riser, no fade-in. Tempo 120 BPM. Dark, minimal, premium.
```
**P5 - sonic logo A (melodic, 2 s)**
```
Instrumental only. A 2-second sonic logo for a premium streetwear brand: three ascending notes on a warm glass-like synth with a soft sub thud underneath, resolving on a clean major-feeling interval, short natural reverb tail.
Key of D, 120 BPM, no drums, no riser, starts immediately, ends cleanly within 2 seconds.
```
**P6 - sonic logo B (percussive "thud-click", 1.5 s)**
```
Instrumental only. A 1.5-second brand sting: a heavy soft-hoodie-fabric thud (low sub hit) followed by a crisp tick of a zipper-like high click, then one short warm synth tone. No melody beyond that tone, no reverb wash.
```
Tip: percussive stings are easier to cut accurately than melodic ones, and a single human-edited layer (your own recorded fabric/zipper sample) strengthens authorship (section 7.6).
**P15 - 2 s end-card outro sting**
```
Instrumental only. A 2-second outro sting: resolves the track on a warm D major chord with a soft sub drop, then silence. 120 BPM feel, no drums, no riser, starts immediately.
```
### 5.3 Product-reveal builds, beat drops
**P7 - product-reveal build (15 s)**
```
Instrumental only. 15-second cinematic-minimal product reveal for a black hoodie, 100 BPM, steady tempo, key of C minor.
[0:00 - 0:04] Sparse, soft pulse and sub bass only, intensity 2/10.
[0:04 - 0:08] Add tight hats and a rising filtered synth, intensity 5/10.
[0:08 - 0:09] One bar of near-silence (a stop) then a big kick-and-bass drop at 0:09, intensity 9/10.
[0:09 - 0:15] Full groove with a bright orange-colored lead stab pattern, ends on one accented hit.
Avoid: vocals, long tails, trap hi-hat rolls, genre changes.
```
**P11 - beat drop at an exact time (use after P7 fails)**
```
Instrumental only. 128 BPM, steady tempo, key of F minor. Build for exactly 8 bars with a filtered synth riser and snare roll, then drop at bar 9 (about 15 seconds) into a full kick, bass and lead groove.
Build to a beat drop at 15 seconds. Total length 30 seconds. No intro silence.
```
[G] shows "Build to a beat drop at 12 seconds" as supported wording; [M] the drop came ~bar 10 when bar 5 was requested. Measure and re-time picture to the real drop.
**P16 - drop-day / countdown hype (15-20 s)**
```
Instrumental only. 20-second drop-day hype bed for a limited hoodie release, 140 BPM, steady tempo, key of E minor. Starts immediately with a tight kick, bass stabs and a rhythmic synth pluck. Add a one-bar snare build at bar 5, a hard stop, then the full hit returns. Aggressive but clean, minimal.
Avoid: vocals, orchestral hits, long reverb.
```
### 5.4 UGC beds, VO space, loops
**P8 - UGC / talking-head bed that leaves room for speech**
```
Instrumental only. A quiet bed for a talking-head UGC video, 88 BPM, steady, key of A minor. Soft kick and rim click, warm sub bass, one slow felt-piano note every bar, very low density.
No lead melody, no vocals, no chord stabs, dynamics flat so it never competes with a spoken voice. Starts immediately. 30 seconds.
```
**P9 - voiceover bed with gentle forward motion**
```
Instrumental only. Restrained 30-second bed under narration for a campus-life ad, 100 BPM, steady, key of G major. Soft synth pulse, muted percussion, warm pad. Leave clean space for narration, no lead melody in the middle range.
Pulse enters at 0:08, tiny lift at 0:20, resolves cleanly at 0:30 with no long tail.
```
**P10 - loopable 8-bar bed**
```
Instrumental only. An 8-bar loopable groove at 100 BPM, key of D minor: kick, soft snare, hats, sub bass, one repeating 2-bar synth motif. Identical energy for all 8 bars, no riser, no fill, no fade, starts immediately on beat one and ends right on the end of bar 8 so it repeats seamlessly.
```
Reliability of "seamless" is [unverified]. Reliable method: pick two bar-aligned points from the measured grid (e.g. bar 5 start and bar 13 start) and crossfade 20-50 ms [unverified method, standard editing].
### 5.5 Style genres
**P12 - lo-fi / study-session streetwear**
```
Instrumental only. Lo-fi hip hop at 85 BPM, key of C minor: dusty vinyl crackle, mellow Rhodes chords, slow boom-bap drum pattern, jazzy upright bass. Calm, confident, a little nostalgic. 30 seconds, starts on the downbeat.
```
(This prompt pattern is the API-docs/Morphic style; https://morphic.com/resources/how-to/lyria-3-5-guide [C].)
**P13 - upbeat campus (daytime, friendly)**
```
Instrumental only. Upbeat indie-pop bed for a campus-life ad, 118 BPM, steady, key of G major: jangly clean guitar, live-sounding drums, bright bass, claps, a short whistle-like synth hook. Happy but not cheesy. 15 seconds, hook within the first bar.
```
**P14 - runway walk / strut track**
```
Instrumental only. 120 BPM strut-walk track, key of E minor: dry club kick, tight clap on 2 and 4, deep sub, a single repeating minor-key synth motif with long gaps. Cool and understated, builds slowly over 30 seconds.
```
### 5.6 Vocal jingle, image-to-music, reference, edits
**P17 - 8-second vocal jingle (own tagline; test only)**
```
Short jingle, 8 seconds, 110 BPM, key of D major, bright pop-electronic. Warm confident female alto vocal, close-mic and dry, in English.
Lyrics:
[Chorus]
Wear what you study
(Acme)
Wear what you study
```
Use your own tagline (not copyrighted lyrics) [G]. A sung brand name is riskier for naming accuracy; verify pronunciation, and consider the AI-vocal disclosure rules (section 7.5). Prefer an instrumental logo plus a recorded human voice tag.
**P18 - image-to-music (hoodie flat-lay or ad still)**
Attach 1-3 stills (Add -> Image, up to 10 in the API [G]) then:
```
Instrumental only. Compose a 30-second bed inspired by the mood, palette and setting of these images: black fabric, clean white backdrop, a single orange accent. Minimal, confident, modern. 110 BPM. Starts immediately.
```
Reviewers say image input reads mood/palette more than objects [C] https://aivideosensei.com/guides/lyria-3-5-flow-music-guide .
**P19 - consistency via reference audio (after you approve a "master" bed)**
Attach the approved track with Add -> Audio, then:
```
Use the attached track as the reference. Make a new 15-second variation in the same key, same tempo, same drum kit and same synth motif, but with a harder ending and no intro. Instrumental only.
```
Upload/reference behaviour is [G] documented ("Use your music to create"), results [unverified]; one launch-week reviewer got upload errors [C] https://note.com/mydearnana/n/n2cd80f163ee3?hl=en .
**P20 - edit commands to paste into the chat on a chosen take** (one change per message) [G mechanism]
```
Shorten only the intro to 1 bar. Keep the groove and tempo identical.
Replace bars 1-2 with the full groove: kick, bass, hats from beat one.
Make the ending a single accented hit followed by silence, no fade.
Remove the vocal chops and any spoken words; keep everything else unchanged.
Make the kick punchier and the mids sparser so voiceover sits on top.
```

## 6. Features: what each does, costs, limits

| Feature | What it does | Credits / limits | Tag / URL |
|---|---|---|---|
| Producer chat | Gemini-powered chat; describe, iterate, "edit this song" | Song ~5 credits/take; chat edits that re-render cost like a generation | [C] https://aialleyway.com/google-flow-music/ |
| Compose panel | Manual Lyrics / Sound / Details; reportedly BPM, Length, Seed, Model | same as generating | [G] https://support.google.com/flow/answer/17084348?hl=en ; fields [C] https://note.com/mydearnana/n/n2cd80f163ee3?hl=en |
| Remix | Extend, Cover, Replace on a selected section | Cover cost 5 credits (same as a song) | [G] same help page ; cost [C] aialleyway |
| Variation, Trim, Reimagine | Variation, waveform Trim (Start/End, loop preview), Reimagine (different atmosphere) | Trim presumably free [unverified] | [C] https://aialleyway.com/google-flow-music/ ; https://note.com/mydearnana/n/n2cd80f163ee3?hl=en |
| Split stems / Get stems | Separate into stems; 4 lanes drums / bass / vocals / other with mute-solo; 2-stem vocals/instrumental was also suggested by Producer | Split showed no separate credit line in one test; one launch-week reviewer saw failures | [C] aialleyway ; note.com mydearnana |
| Add audio | Upload your track as a reference ("Use your music to create"); up to 40 MB reported | Tied to privacy: uploads may be used to improve services | [G] help page ; 40 MB [C] note.com ; privacy [G] https://www.flowmusic.app/privacynotice |
| Add image | Image inspires lyrics/cover art; model uses it as mood reference | - | [G] help page |
| Voice mode | Speak/hum editing instructions into the mic | - | [C] https://ai-deck.app/blog/flow-music/ |
| Audio effects | Homepage lists "Audio effects" and "Remix your audio" | - | [G] https://www.flowmusic.app/ |
| Music videos | Veo-based video from a song; aspect 9:16 / 16:9; model selectable in Settings -> Video Generation | 188 credits for 15 s 720p 16:9 (balance fell exactly 188); 750 credits for 60 s 720p; ends with "Made with Google Flow Music" card | [G] https://support.google.com/flow/answer/17084421?hl=en&co=GENIE.Platform=Desktop ; cost [C] aialleyway / note.com |
| Spaces | "Vibe-coded" mini-apps: instruments, sequencers, games, plugins; web & PC only; shareable | Plugins export (Oct 6, 2026) as VST3/AU, **macOS only**, standard synthetic audio only | [G] https://support.google.com/flow/answer/17083802?hl=en ; https://blog.google/innovation-and-ai/models-and-research/google-labs/create-music-production-plugins-google-flow/ ; https://support.google.com/flow/answer/18631279?hl=en&ref_topic=17084184 |
| Turntable | Vote A/B for the sample that matches the prompt (listen 10 s each) to **earn extra AI credits** | Free credits | [G] https://support.google.com/flow/answer/17083870?hl=en |
| Projects | Group "sessions" (and their songs); generate songs in a project; delete project vs remove project | - | [G] https://support.google.com/flow/answer/17080645?hl=en |
| Playlists | Group songs; share with the community; multi-select Add to playlist | - | [G] https://support.google.com/flow/answer/17083869?hl=en |
| Publish / Share | Publish makes a song public; Share -> Copy link; "Allow community remix" off disables remix, vibes, downloads by others | Keep brand masters unpublished [unverified default] | [G] help page 17084348 |
| Plans | Free $0 (daily top-ups, 2 concurrent); Starter $6/mo (3,000 cr, 8); Plus $18/mo (10,000 cr, 12); Member $48/mo (30,000 cr, 16). Prices shown as annual-billing "Save 25 %" | Extra credits purchasable only on paid plans while subscribed | [G] https://www.flowmusic.app/pricing ; monthly list prices $8 / $24 / $64 [C] https://aialleyway.com/google-flow-music/ |
| Daily top-up | Free account: "Daily Free Credits" 30 + one-time 500 bonus; paid-plan top-up amount not published | - | [C] https://aialleyway.com/google-flow-music/ ; https://www.orcarouter.ai/blog/lyria-3-5-launch |
| Your plan (AI Pro) | = Flow Music Plus: 10,000 credits (~2,000 songs), separate from Google AI credits, daily top-ups, 12 concurrent, "All core features", "Commercial use rights" | Benefit must be granted: flowmusic.app -> Log in -> Continue with Google -> Allow (shares Google One benefit status) | [G] https://support.google.com/googleone?p=g1_aip_flow&hl=en-HN |

## 7. Commercial use, SynthID, claims, proof

### 7.1 What Google actually says
- Google One help (AI Plus): "Google AI Plus members get the benefits of Google Flow Music's Starter plan: 3,000 monthly credits (~600 songs) ... 8 concurrent generations. All core features. **Commercial use rights.**" [G] https://support.google.com/googleone/answer/16882689?hl=en
- Google One help (AI Pro): "Members of Google AI Pro get the benefits of Google Flow Music's Plus plan: 10,000 monthly credits ... 12 concurrent generations. All core features. **Commercial use rights.**" [G] https://support.google.com/googleone?p=g1_aip_flow&hl=en-HN
- Google One help (AI Ultra): Member plan, same "Commercial use rights" line, plus Member badge/discord/events/early access [G] https://support.google.com/googleone/answer/16286513?hl=en
- Flow Music pricing page lists Free / Starter / Plus / Member with credits, concurrency and "All core features" but **no "commercial use" line and no licence text** [G] https://www.flowmusic.app/pricing ; independent reviewers noticed the same gap [C] https://toolsfine.com/best-ai-tools/google-flow-music , https://useaiforx.com/tool/google-flow-music/ .
- Terms: Flow Music's Terms link resolves to Google Terms of Service (https://policies.google.com/terms) [G], which say: "Some of our services allow you to generate original content. Google won't claim ownership over that content." and "Your content remains yours" [G]. The Believe/Flow Music post repeats "Google doesn't claim ownership of the original content generated with Flow Music" [G] https://blog.google/innovation-and-ai/models-and-research/google-labs/believe-flow-music-partnership/ .
- The same Google Terms prohibit "misleading others into thinking that generative AI content was created by a human" and "using AI-generated content from our services to develop machine learning models" [G] https://policies.google.com/terms?hl=en-US .
- Non-ownership is not a licence or a guarantee of release-clearance [C] https://aialleyway.com/google-flow-music/ , https://www.itechguides.com/music-generator-producerai-joins-google-labs-then-becomes-flow-music-what-changed/ .
- The Gemini API's separate terms add: "You acknowledge that Google may generate the same or similar content for others and that we reserve all rights to do so." [G, API terms - may not govern Flow Music] https://ai.google.dev/gemini-api/terms . **Flag**: if the same applies to Flow Music, your sonic logo is not exclusive.

### 7.2 Per-plan matrix (as far as public sources go)
| Plan | Commercial rights | Source |
|---|---|---|
| Free | **Not stated** anywhere official I found. Treat as non-commercial draft only [unverified] | pricing page silent [G] |
| Starter (= Google AI Plus) | "Commercial use rights" | [G] Google One AI Plus page |
| Plus (= Google AI Pro, the user's mapping) | "Commercial use rights" | [G] Google One AI Pro page |
| Member (= Google AI Ultra) | "Commercial use rights" | [G] Google One AI Ultra page |
| Standalone paid Flow Music subscription (not via Google One) | Not stated on the pricing page; Google One pages describe the *bundle* | [unverified] |
Open wording gaps: the scope of "Commercial use rights" (paid ads? sync? exclusivity? territory? duration? trademark of sonic logo?) and whether rights attach at generation time or at download time, and whether tracks made while on Free and later re-downloaded on a paid plan are covered. **Ask Google support in writing** and keep the reply.

### 7.3 SynthID
- "All of our tracks are imperceptibly watermarked with SynthID technology, allowing you to detect whether music has been created or edited using AI." [G] https://deepmind.google/models/lyria/ ; API doc: all generated audio includes it [G] https://ai.google.dev/gemini-api/docs/music-generation .
- Robustness claims (survives MP3, pitch shift) come from an SEO article, not Google [C] https://www.techtimes.com/articles/322113/20260729/googles-lyria-35-sharpens-vocals-lyrics-while-rivals-fight-court.htm . Assume the watermark persists after your edit and platforms may auto-label.

### 7.4 Content ID / false claims on YouTube, Instagram, TikTok
- YouTube auto-detects AI content (YouTube GenAI tools, C2PA metadata, internal systems) and AI-music may show a player label; disclosure "won't limit a video's audience or impact its eligibility to earn money" [G] https://support.google.com/youtube/answer/14328491?hl=en . The help excerpt I fetched also lists "Creates music that's the main focus of the video" among examples; the heading above that list was cut off, so read the page before relying on it [unverified].
- Content ID claim scenarios (a distributor-registered AI track matching your upload; false cross-claims between similar AI tracks) are discussed by a vendor blog with unclear rigor [C] https://undetectr.com/blog/ai-music-youtube-copyright-claims . Real mitigation: do NOT register your Flow Music beds with Content ID/distributors; keep a dispute pack (7.7).
- Meta: music guidelines state "Use of music for commercial or non-personal purposes in particular is prohibited unless you have obtained appropriate licenses" and unauthorised content may be "blocked, muted or removed" [G-platform] https://www.facebook.com/legal/music_guidelines . Business accounts are limited to Sound Collection or music you license; Reels ads cannot use licensed library music, original audio is allowed [C] https://sonilo.com/ai-music/royalty-free-music-for-instagram-reels , https://hellothematic.com/music-rules-tiktok-instagram-youtube/ . Fact to verify in Ads Manager: that a self-uploaded licensed track passes Meta's audio matching.
- TikTok: "Businesses cannot use the general music library for commercial usage" - use the CML for organic, ads and branded content; "If you choose to use original sound from other users or other licensed sounds ... consult your legal team to ensure you have obtained a proper license" [G-platform] https://ads.tiktok.com/help/article/commercial-music-library . Our Flow Music track in a TikTok ad would be uploaded as video audio (your own original audio), not selected from CML [unverified fit].
- Instagram reportedly scans AI audio for matches against existing works, so a track that resembles a known song can still be flagged [C] https://www.foximusic.com/blog/instagram-reels-music-copyright-legal-guide/ . Mitigate: avoid named-artist prompts, avoid "sounds like" requests, check candidates by ear.

### 7.5 Disclosure and AI labels
- TikTok: AIGC label ("Disclosed by creator as AI-generated"); disclosure "especially important" with synthetic faces/voices or realistic content; platform may auto-label from technical metadata; creators cannot remove an auto-label [G-platform] https://seller-us.tiktok.com/university/essay?knowledge_id=491489038501663&lang=en .
- Branded TikTok posts: also use the commercial-content toggle [C] https://www.auditsocials.com/blog/tiktok-commercial-content-disclosure-2026-branded-content-toggle-ai-labels-hashtags .
- Google's own Terms ban misleading people that AI content is human-made [G] (above). If a sung AI vocal appears, disclose; instrumental beds are lower risk but still carry SynthID [unverified risk grading].

### 7.6 Ownership / copyright caveat for a sonic logo
- US Copyright Office (Jan 2025): "prompts alone do not provide sufficient human control to make users of an AI system the authors of the output"; protection exists for human-authored elements and creative selection/arrangement/modification [G-gov] https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf . Canada is Acme's home jurisdiction; I did not research Canadian law [unverified].
- Practical consequence: AI-only beds may not be protectable or exclusive. For the sonic logo, add human authorship (own recorded sample, a re-played/edited melody, a documented edit decision list) and ask an IP lawyer about sound-mark registration.
- Litigation noise: a March 2026 proposed class action by indie musicians alleges Lyria 3 was trained on copyrighted recordings; Google moved to dismiss in June 2026 [C] https://www.musicbusinessworldwide.com/watch-out-suno-google-has-upgraded-lyria/ . Google's training statement is quoted in section 2. Risk is unresolved; mention to anyone signing sponsor/agency contracts.

### 7.7 Proof to keep (per released track) - the "licence pack"
1. Screenshot of Flow Music **Account settings -> Subscription** showing Plus/Starter and a screenshot of the Google One page stating "Commercial use rights" (page URL + date).
2. The exact prompt(s), the chat transcript or session URL, take ID, timestamp, Lyria model shown in Settings.
3. The original downloaded WAV + SHA256, plus the edited master and an EDL (which seconds were used).
4. Rights-holder email from Google support if you ask scope questions.
5. Publishing info: not registered in Content ID; AI disclosure toggle used where realistic.

## 8. Acme sound identity

### 8.1 Architecture (what to build)
Industry sources describe a modular system: a short **sonic logo** (1-3 s), a **theme/anthem** (30-60 s), an **ambient bed/loop** (60-90 s with clean loop), and UI/micro-cues
[C] https://brainy.ink/paper/sonic-brand-identity , https://www.influencers-time.com/audio-branding-in-2025-crafting-a-memorable-sonic-identity/ ; TikTok for Business says the logo is "typically 2-4 seconds" and the ecosystem includes a "sonic DNA" track [C-platform] https://ads.tiktok.com/business/en-US/blog/sonic-branding-guide-music-sound .
For Acme, three recurring beds + two stings is enough pre-launch:
| Asset | Spec | Use |
|---|---|---|
| Sting A "Logo" | 1.5-2.5 s, 120 BPM feel, key D, no drums, resolves | End card on every ad (P5/P15) |
| Sting B "Thud-click" | 1-1.5 s percussive | Product hit / cut transitions (P6) |
| Bed 1 "Campus Day" | 15 s and 30 s, 118-128 BPM, major/minor-neutral, claps + plucks | Reels/TikTok daytime lifestyle (P1/P13) |
| Bed 2 "Studio Night" | 30 s, 85-95 BPM, lo-fi / dusty drums, Rhodes | Talking-head, GRWM, study content (P2/P8/P12) |
| Bed 3 "Drop Day" | 15-20 s, 128-140 BPM, kick + sub + stab | Releases, countdowns, reveals (P7/P11/P16) |

### 8.2 Consistency kit (the "Acme sound DNA")
1. Put this in **Customize producer -> Instructions** so it auto-applies to new sessions [G] https://support.google.com/flow/answer/17083868?hl=en :
```
Brand: Acme (minimal black/white streetwear for Canadian university students). Always instrumental unless I say "vocal". Always no named artists, no copyrighted lyrics.
Sound DNA: dry punchy kick, deep round sub, tight hats, one short plucked synth motif in D minor/F minor, warm Rhodes for calm beds, no big reverb washes, no orchestral hits, no risers longer than one bar.
Timing: start on beat one, no fade-in, steady tempo, ends on one accented hit with no long tail. Keep mids sparse for voiceover.
```
2. Use the same **prompt skeleton** for every bed: Purpose -> Duration -> Genre -> Mood -> Tempo/Key -> Instrumentation -> Structure/timestamps -> "Instrumental only" -> Avoid [C] https://www.kapwing.com/resources/how-to-use-google-lyria-3-5/ (same logic as the Google framework).
3. **Fixed key family**: D minor / F minor (+ D major for the logo resolution) [unverified choice]; fixed tempo anchors 92 / 100 / 124-128 BPM; tag the anchor in the filename (`EPS_Bed1_128_Dm_v03.wav`).
4. **Reference audio**: after you approve a master bed, attach it ("Add -> Audio") to make siblings (P19) [G mechanism; effect unverified]. Don't upload confidential material [C] https://sonilo.com/blog/guides/lyria-3-5-google-flow-music .
5. **Projects**: create `Acme Sound` project and put each session in it [G] https://support.google.com/flow/answer/17080645?hl=en ; keep accepted tracks in a Playlist (private; don't Publish) [G] https://support.google.com/flow/answer/17083869?hl=en .
6. **Memories** (Customize producer) can teach the Producer your sound over time; decide whether to keep it on (privacy trade-off, section 2) [G] https://support.google.com/flow/answer/17083868?hl=en .
7. Keep one **musical DNA motif** (a 3-4 note cell) that appears, transposed or re-orchestrated, in logo + beds, as pro sonic-branding guidance recommends ("same brief, same tone direction, same root motif") [C] https://brainy.ink/paper/sonic-brand-identity . Build the final logo with human edits (7.6).

### 8.3 Vocal vs instrumental jingle
- Instrumental logo + human voice tag ("Acme", recorded by the user/talent) = best for consistency, rights clarity and less AI-label exposure [unverified judgement].
- Sung jingle: Lyria 3.5 sings your own lyrics from `Lyrics:` blocks [G]; a reviewer says it sang a supplied lyric sheet word-for-word [C] https://aialleyway.com/google-flow-music/ . Brand-name pronunciation and consistent vocal timbre across takes are not guaranteed [unverified]; Reddit users call the vocals impressive but the app "buggy" with "not much control" [C] https://www.reddit.com/r/SunoAI/comments/1vc9b1o/lyria_35_on_google_flow_music/ .
- Voice demographics control: gender, range (soprano/alto/tenor/baritone), timbre ("gravelly, soulful, breathy"), language list (English, German, Spanish, French, Hindi, Japanese, Korean, Portuguese) [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/music/music-gen-prompt-guide .

### 8.4 What works for Gen-Z fashion/campus on Reels/TikTok (mostly folklore)
- Hook inside 1.5-3 s, front-loaded energy, ads that open on a beat pattern [C, SEO] https://tikadsuite.com/blog/best-music-for-tiktok-ads/ , https://raagengine.com/tiktok-music/ .
- BPM bands: 115-140 for social ads / fashion; 120-128 for dance/transition; 75-100 for GRWM/lifestyle; 80-95 for B-roll [C, SEO, no data] https://www.foximusic.com/blog/video-production-styles-music-guide/ , https://raagengine.com/tiktok-music/ . Treat as starting points; test with your own retention graphs.
- Loop-friendly beds help because short-form videos auto-loop [C] https://www.aimagicx.com/blog/ai-music-social-media-tiktok-reels-2026 .
- The classic example of a 2-beat logo: TikTok's own "boom-bling" sonic logo, a detuned sub note + unresolved chord [C] https://www.marketing-interactive.com/massivemusic-sonic-branding-interview-next-level .

## 9. Mixing, BPM grid, loudness

### 9.1 Beat grid cheat-sheet [derived: seconds per beat = 60 / BPM]
| BPM | Beat (s) | Bar (s) | 8 bars (s) | 16 bars (s) |
|---|---|---|---|---|
| 92 | 0.652 | 2.609 | 20.87 | 41.74 |
| 100 | 0.600 | 2.400 | 19.20 | 38.40 |
| 112 | 0.536 | 2.143 | 17.14 | 34.29 |
| 120 | 0.500 | 2.000 | 16.00 | 32.00 |
| 122 | 0.492 | 1.967 | 15.74 | 31.48 |
| 124 | 0.484 | 1.935 | 15.48 | 30.97 |
| 126 | 0.476 | 1.905 | 15.24 | 30.48 |
| 128 | 0.469 | 1.875 | 15.00 | 30.00 |
| 130 | 0.462 | 1.846 | 14.77 | 29.54 |
| 140 | 0.429 | 1.714 | 13.71 | 27.43 |
| 150 | 0.400 | 1.600 | 12.80 | 25.60 |
At 126 BPM, 0.476 s agrees with the measured 476 ms intervals [M]. For 120-150 BPM the grid is 0.50-0.40 s, as in the brief.
Cut rule: put hard cuts on beats, scene changes on bar lines (every 4 beats), reveals on phrase starts (every 4 or 8 bars) [M] (phrase rule in music-and-beat-sync.md).

### 9.2 Ducking and balance
| Rule | Value | Tag / URL |
|---|---|---|
| Music under speech | ~6 LU below dialogue; ~3 LU below in gaps | [C] https://mediastrategylab.com/guides/audio-ducking |
| Alternative | Automate music down 10-15 dB under VO, then back up in b-roll | [C] https://kudoflix.com/blog/2026/08/02/background-music-for-video/ |
| Pre-lower before master | pull music 4-5 dB under speech, duck further while speaking | [C] https://cutscore.io/blog/loudness-for-instagram-reels |
| Compressor timing | attack 80-150 ms, release 300-500 ms | [C] https://mediastrategylab.com/tools/lufs-loudness-reference |
| Our pipeline | `music_volume ~0.55`, `duck_music: true`, final loudnorm -14 LUFS | [M] |
Conflict: the three sources disagree (6 LU vs 10-15 dB vs 4-5 dB). Recommended start for phone speakers: bed ~8-10 LU under dialogue while speaking, ~4 LU in gaps, then listen on a phone speaker [unverified judgement - none of the sources tested phone-speaker intelligibility].

### 9.3 Loudness for ads
- Master at **-14 LUFS integrated, true peak <= -1 dBTP** for social video [C] https://valmera.io/tools/audio-loudness-targets , https://mediastrategylab.com/tools/lufs-loudness-reference .
- No official Instagram or TikTok number: "TikTok: There is no TikTok loudness specification"; Meta Reels use xHE-AAC with adaptive loudness management [C] https://valmera.io/tools/audio-loudness-targets . Other sources say -16 for most social platforms (kudoflix). -14 is a safe middle.
- TikTok ad policy: audio must not be "unclear or muffled" [C] https://www.revid.ai/blog/how-to-make-tiktok-video-with-music (secondary; check TikTok ad policy).
- Raw Lyria tracks arrive at modest loudness (take 1 at -16.4 LUFS, take 2 about -22 dB mean [M]); normalize after mixing, never before the duck.
- Phone speakers lack deep bass; check the mix with a high-pass at ~100-150 Hz as a sanity test [unverified, general practice]; a Suno guide claims ">200 Hz" [C] https://raagengine.com/suno-prompts-for-reels/ .

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

## 12. Open questions needing LIVE testing in Flow Music

1. Does Compose **BPM** and **Length** (if present) tighten the miss? Test 5 runs at 100/128 BPM with Length 15/30; log requested vs measured.
2. What does **Advanced sound** change (prompt expansion? sound-only editing)? Compare same prompt with and without.
3. Do timestamps (`[0:00 - 0:08] ...`) hit better than words? Test P7/P11 and measure drop time error.
4. Can a **15 s or 30 s** file be produced directly? Does "Length" or a short-form request ever return <60 s?
5. Does "start on beat one, no intro" reduce silent intros (n >= 6 takes)? Track first-beat and bar 1-4 RMS.
6. Do **Extend / Replace / Trim** preserve tempo and key at the edit seam? Measure seam beat error.
7. How many credits does each action cost: a two-take instrumental request, a Replace, a Cover, Split stems, a Variation, Trim? Read the credit history before/after.
8. Are stems truly four lanes with correct isolation; do they sum back to the original; are stems downloadable as WAV; any credit use?
9. Does Add -> Audio with an approved Acme bed produce stable "family" tracks (same key/tempo/palette)? Does the reference change length?
10. Does the Instrumental toggle plus text ever produce vocal chops? Use stems to check.
11. Loopability: do 8-bar "loopable" asks loop cleanly or need manual crossfade?
12. Account rights: confirm the user's profile shows Plus (via Google AI Pro) after granting the Google One benefit (his decision), and capture the evidence. Ask Google support about ad use, exclusivity and trademarks of a sound logo.
13. Do SynthID-bearing tracks trigger auto AI labels on Reels/TikTok/YouTube Shorts when used as an uploaded audio track? Test with an unlisted post/draft.
14. Are published/unpublished defaults private? Check a new song's visibility and the "Allow community remix" default before saving brand assets.
15. Quality of **Voice mode** and **image-to-music** with Acme stills (P18) relative to text-only prompts.

## 13. Sources (URLs actually opened or returned by search; tag shows reliability)

[G] Google / platform official
- https://blog.google/innovation-and-ai/models-and-research/google-labs/lyria-3-5/
- https://blog.google/innovation-and-ai/products/gemini-app/better-tracks-lyria-gemini/
- https://blog.google/innovation-and-ai/technology/ai/lyria-3-pro/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/producerai/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/believe-flow-music-partnership/
- https://blog.google/innovation-and-ai/models-and-research/google-labs/create-music-production-plugins-google-flow/
- https://deepmind.google/models/lyria/
- https://ai.google.dev/gemini-api/docs/lyria-prompt-guide
- https://ai.google.dev/gemini-api/docs/music-generation
- https://ai.google.dev/gemini-api/terms
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/music/music-gen-prompt-guide
- https://support.google.com/flow/answer/17083868?hl=en (Get started)
- https://support.google.com/flow/answer/17084348?hl=en (Songs)
- https://support.google.com/flow/answer/17083870?hl=en (Credits / plan / Turntable)
- https://support.google.com/flow/answer/17083802?hl=en (Spaces)
- https://support.google.com/flow/answer/17083869?hl=en (Playlists)
- https://support.google.com/flow/answer/17080645?hl=en (Projects/sessions)
- https://support.google.com/flow/answer/17084421?hl=en&co=GENIE.Platform=Desktop (Music videos)
- https://support.google.com/flow/answer/18631279?hl=en&ref_topic=17084184 (DAW plugins)
- https://support.google.com/googleone/answer/16882689?hl=en (AI Plus)
- https://support.google.com/googleone?p=g1_aip_flow&hl=en-HN (AI Pro)
- https://support.google.com/googleone/answer/16286513?hl=en (AI Ultra)
- https://www.flowmusic.app/pricing ; https://www.flowmusic.app/ ; https://www.flowmusic.app/privacynotice
- https://policies.google.com/terms?hl=en-US
- https://support.google.com/youtube/answer/14328491?hl=en
- https://www.facebook.com/legal/music_guidelines
- https://ads.tiktok.com/help/article/commercial-music-library
- https://seller-us.tiktok.com/university/essay?knowledge_id=491489038501663&lang=en
- https://ads.tiktok.com/business/en-US/blog/sonic-branding-guide-music-sound
- https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf
[C] Community / third-party (useful, not authoritative)
- https://aialleyway.com/google-flow-music/ (hands-on free-account review, 2026-10-07)
- https://note.com/mydearnana/n/n2cd80f163ee3?hl=en ; https://note.com/npaka/n/n68e7d8194c3d?hl=en
- https://sonilo.com/blog/guides/lyria-3-5-video-creator-review ; https://sonilo.com/blog/guides/lyria-3-5-google-flow-music ; https://sonilo.com/ai-music/royalty-free-music-for-instagram-reels (vendor of a competing product; disclosed)
- https://morphic.com/resources/how-to/lyria-3-5-guide ; https://www.kapwing.com/resources/how-to-use-google-lyria-3-5/ ; https://queststudio.io/blog/google-lyria-3-5-flow-music-guide ; https://tonegame.org/blog/lyria-3-5-guide ; https://www.eachlabs.ai/google/gemini/lyria-3-5
- https://www.versely.studio/blog/lyria-3-5-three-minute-vocal-tracks ; https://aivideosensei.com/guides/lyria-3-5-flow-music-guide ; https://ai-deck.app/blog/flow-music/ ; https://www.onecooltip.com/2026/10/create-studio-quality-songs-with-google.html
- https://www.techtimes.com/articles/322113/20260729/googles-lyria-35-sharpens-vocals-lyrics-while-rivals-fight-court.htm ; https://www.musicbusinessworldwide.com/watch-out-suno-google-has-upgraded-lyria/ ; https://www.orcarouter.ai/blog/lyria-3-5-launch ; https://postcutoff.com/e/2026-02-25-google-acquires-producerai/
- https://www.reddit.com/r/SunoAI/comments/1vc9b1o/lyria_35_on_google_flow_music/
- https://toolsfine.com/best-ai-tools/google-flow-music ; https://useaiforx.com/tool/google-flow-music/ ; https://www.itechguides.com/music-generator-producerai-joins-google-labs-then-becomes-flow-music-what-changed/
- https://undetectr.com/blog/ai-music-youtube-copyright-claims ; https://hellothematic.com/music-rules-tiktok-instagram-youtube/ ; https://www.foximusic.com/blog/instagram-reels-music-copyright-legal-guide/ ; https://www.auditsocials.com/blog/tiktok-commercial-content-disclosure-2026-branded-content-toggle-ai-labels-hashtags ; https://www.revid.ai/blog/how-to-make-tiktok-video-with-music
- https://brainy.ink/paper/sonic-brand-identity ; https://www.influencers-time.com/audio-branding-in-2025-crafting-a-memorable-sonic-identity/ ; https://www.marketing-interactive.com/massivemusic-sonic-branding-interview-next-level
- https://tikadsuite.com/blog/best-music-for-tiktok-ads/ ; https://raagengine.com/tiktok-music/ ; https://raagengine.com/suno-prompts-for-reels/ ; https://www.foximusic.com/blog/video-production-styles-music-guide/ ; https://www.aimagicx.com/blog/ai-music-social-media-tiktok-reels-2026
- https://valmera.io/tools/audio-loudness-targets ; https://mediastrategylab.com/guides/audio-ducking ; https://mediastrategylab.com/tools/lufs-loudness-reference ; https://kudoflix.com/blog/2026/08/02/background-music-for-video/ ; https://cutscore.io/blog/loudness-for-instagram-reels
[Not Google, ignored for facts] https://www.flow-music.app/ , https://www.flow-music.app/terms-of-service , https://flow-music.net/ , https://flowmusic.io/pricing , https://lyria3-pro.com/lyria-3-5 .
[M] Local: /home/you/.config/profiles/acme/skills/media/google-flow/references/music-and-beat-sync.md