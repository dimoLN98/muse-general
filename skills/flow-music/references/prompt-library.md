# Flow Music prompts, length/start/end/tempo tactics
_Source: `integrations/google-flow-browser-mcp/docs/research/flow-music-craft.md` (cited; tags [G] Google, [C] community, [M] measured by us, [unverified])._

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
