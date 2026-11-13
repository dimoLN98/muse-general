# Google Flow best practices — a guide for Acme Reels

**Researched:** 2026-11-13 (all sources accessed this day)
**Scope:** Google Flow (Veo 3.1 + Gemini Omni Flash) and Flow Music (Lyria 3.5), for making
9:16 vertical Reels (15–20 s) for Acme, a Canadian academic streetwear brand.
**Status of prices and features:** Flow changes fast. Prices below are what multiple
independent guides reported from Google's Flow Help Center in Oct–Nov 2026. Always check
the cost shown in Flow's own settings popover before a generation — that number is the
contract. Where sources disagree, the disagreement is flagged, not smoothed over.

---

## 0. The Acme baseline (house rules already proven in practice)

These are not from the web — they are what we learned making the first four Acme
videos (Ad 03, Same Major, Mostly Unconscious, Overthinking), and they still stand:

- **Default model: Omni 1.1 Flash, 720p.** 4 s clip = 7 credits, quality still very good
  (all 4 Overthinking clips passed QC first try). Omni 1.1 retires 2026-12-05, so the
  default will need revisiting then.
- **Daily cap: 110 Flow credits/day** unless the user waives it. Quote the one-take price
  AND a remake allowance in every brief.
- **Never put character names or ages in a prompt.** Flow bakes them in as on-screen
  name labels ("CHLOE 22 YEAS"). Describe people by appearance only.
- **Flow garbles small on-screen text.** Generate garments plain; add the ACME.
  wordmark, captions, payoff plates and end cards locally (HyperFrames/ffmpeg).
  Never ask the model to write brand text — attach the real logo as an ingredient.
- **Back-print scale drifts.** State a frame-relative size ("the text line only about
  15 to 20 percent of the frame width") + static camera + a real site mockup as the
  ingredient, then measure the generated print against the mockup before accepting.
- **Agent mode fails often** ("Something went wrong", free). Direct generation
  (Agent mode off) is the reliable fallback.
- **Flow Music:** BPM has a ~120 attractor (a 115 request measured 120.00); Length
  clamps 1:00–3:00 and overshoots. Generate, download the WAV, measure the real BPM,
  cut locally to whole bars. Never plan picture to the requested BPM.
- **Music rule (standing):** never reuse a track across Reels — every video gets its
  own fresh, never-before-used track.

The rest of this guide is what the wider world has learned, checked against that
baseline. Where web advice conflicts with a house rule, the house rule wins — it was
paid for in credits.

---

## 1. Prompting for Veo / Flow video

### 1.1 Google's official five-part formula

Google's Veo 3.1 prompting guide (Google Cloud blog, "The ultimate prompting guide
for Veo 3.1", 16 Oct 2025) gives one formula, in this order:

```
[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]
```

Google calls cinematography "the most powerful tool for conveying tone and emotion",
so camera work goes **first**. The Gemini API's Veo guide lists near-identical
elements (subject, action, style, then camera positioning/motion, composition, focus
and lens effects, ambiance), but only the Cloud blog states an order and calls its
list a formula. Google's own worked example:

> "Medium shot, a tired corporate worker, rubbing his temples in exhaustion, in front
> of a bulky 1980s computer in a cluttered office late at night. The scene is lit by
> the harsh fluorescent overhead lights and the green glow of the monochrome monitor.
> Retro aesthetic, shot as if on 1980s color film, slightly grainy."

Add **audio as a separate block** after the picture description. Veo 3.1 generates a
synchronised soundtrack from the same prompt, so dialogue, SFX and ambience belong
in their own lines:

```
Dialogue: <speaker> says: <line>
SFX: <one or two cued sounds>
Ambient noise: <the room tone>
```

### 1.2 Camera language is the highest-leverage part

Google's guide and every practitioner guide agree: write camera direction in the
words a film crew would use. "Cinematic camera" is a mood, not an instruction;
"slow dolly-in toward her face" is an operation the model can execute. One camera
move per clip, one framing choice per clip — three moves in 8 seconds leaves each
one under 3 seconds.

| Move / framing | What it looks like | Good for in a Reel |
|---|---|---|
| Static / locked-off | Camera does not move | Dialogue, print reveal, product detail |
| Slow dolly-in / push-in | Camera moves toward subject | Building attention on the print or a face |
| Tracking shot | Camera travels alongside a moving subject | Walk-away, campus walk, following a model |
| Crane shot | Camera rises or falls vertically | Opening/closing reveals, quad establishing |
| Slow pan | Camera turns from a fixed spot | Rooms, lecture hall, skyline |
| 180-degree arc | Camera circles the subject | Front-to-back turn, print reveal |
| Close-up / medium / wide | Shot size | Detail / dialogue / establishing |
| POV | First-person view | "You are the student" hooks |
| Shallow depth of field | Background soft, subject sharp | Product close-ups, face close-ups |
| 35mm / 50mm / 85mm | Lens character | 35mm wide campus, 85mm portrait feel |

Separate camera movement from subject movement: a dolly-in means the camera
approaches; a character walking toward the lens is subject motion. Say both
explicitly when both happen. Lens words (macro, wide-angle, soft focus, deep focus)
also change the look; pick one lens effect per clip.

### 1.3 One shot, one action, one move

Every guide repeats this, and it is the single biggest cause of drift when ignored:

- **One shootable moment per clip.** Veo clips are 4, 6 or 8 seconds (Omni Flash
  up to 10 s). That is one shot, not a scene and not a story. A prompt that chains
  several distinct events into one generation produces mush.
- **One action with a beginning and an end inside the clip.** "Walking slowly
  through heavy rain, looking over her shoulder" works; "standing in the rain"
  does not — without defined movement the model invents micro-movements that look
  unnatural.
- **Prompt length:** practitioners converge on roughly **80–180 words**. Shorter
  reads as vague; longer confuses the model with conflicting instructions. (One
  guide caps at ~175 words; Veo's text input ceiling is 1,024 tokens.)
- **Do not put settings in the prompt text.** Do not include the model name or
  version, duration, aspect ratio or resolution in the prompt — those are picker
  settings, not prompt content.
- **Write in English.** Google's API documentation says English is fully supported
  and other languages have not been evaluated; Flow's help page recommends English
  prompts for the best results.

### 1.4 Dialogue and audio — and the subtitle problem

Two Google surfaces disagree on dialogue format, and the disagreement matters:

- **Gemini API guide:** dialogue in quotation marks.
- **Google Cloud guide:** use a colon after the speaker's action and **avoid
  quotation marks**, so the model does not draw the words on screen.

For Flow, practitioner guides recommend starting with the **colon format** and
separating ambience with an `Audio:` sentence. Our own practice (colon-form
dialogue, no contractions, no names/ages) has produced word-perfect dialogue in
every Reel so far — keep it.

**The subtitle bug (practitioner-reported, not in Google's docs):** Veo often burns
garbled subtitles into clips that contain dialogue. The widely used workaround is
to append a no-text line to every prompt that has speech:

> "No subtitles, no captions, no on-screen text."

Keep dialogue lines short (one breath, speakable in a few seconds) and prefer one
speaker per clip. Two speakers in one 4-second clip is possible (we have done it),
but one speaker per clip is the safer default.

Sound goes in three kinds, on separate lines: **who speaks + their words**,
**SFX:** (one or two cued sounds), **Ambient noise:** (the room tone). Name the
sound you want, and say "no music" if you do not want any — otherwise Veo may add
its own music, which then fights the Flow Music bed in the mix.

### 1.5 Negative prompts — Google and practitioners disagree

- **Google's advice:** describe what the scene **should** contain instead of
  listing bans. Its example turns "no man-made structures" into a landscape
  described as having no buildings or roads. Instead of "no people", write "an
  empty beach at dawn"; instead of "no text", write "a clean frame".
- **Practitioner advice:** a short negative list (5–6 items max) at the end of the
  prompt, tied to defects actually observed — e.g. "blurry face, distorted hands,
  oversaturated colors, jittery motion, extra limbs". Twenty exclusions confuse
  the model the same way an overloaded positive prompt does.

**House position:** follow Google (positive description) as the default, and add a
short negative list only to fix a recurring defect. Flow's interface also has a
"Things to avoid" field under More options in some surfaces — even with it, say
what fills the frame in the main description.

### 1.6 Consistency: ingredients and fixed wording

(See §2 for the tools; this is the prompting discipline that makes them work.)

- **Refer to each ingredient by a short, fixed description**, worded identically
  in every prompt in the project: "the woman in the black Overthinking hoodie",
  "the navy backpack". Never vary the wording.
- **Do not re-describe what the reference shows.** Repeating hair colour and
  outfit can conflict with the image and cause drift. Mention only what the
  reference cannot tell the model — expression, pose, action.
- **Keep a one-line character description and a one-line style description** at
  the top of the project notes and paste them into every prompt unchanged.
  Light the whole sequence the same way; a change from dusk to noon between shots
  is more jarring than a slightly different face.
- **Generate two outputs for any shot showing a face**, because likeness varies
  between them, and pick the better one before building on it.
- **Review the sequence in order after every two or three clips** — drift shows
  across a cut, not inside a single clip.

### 1.7 Prompt templates for Acme Reels

Each template follows the five-part formula. Slots in [brackets] are filled per
Reel. Keep the character/style wording identical across all four clips of a Reel.
All templates assume: no names, no ages, no on-screen text, one action, one camera
move, dialogue in colon form.

**Template A — Campus hook (Clip A, 0–4 s)**
> [Wide/Medium shot], [one camera move]. [Chloe: a woman in her early twenties
> with blonde hair, wearing a plain black hoodie], [one action with a clear
> beginning and end, e.g. walks across the university quad toward the library,
> looking around]. [University campus, golden morning light, students in the
> background out of focus]. [Warm natural light, shallow depth of field,
> photorealistic, 35mm film look]. Audio: [ambient campus sounds, footsteps on
> pavement, no music]. No subtitles, no captions, no on-screen text.

**Template B — Back-print reveal (Clip B, 4–8 s)**
> Static camera, [medium/wide shot]. [Chloe, same description as Template A],
> [turns slowly so her back faces the camera, then stands still]. The back of
> her hoodie shows [the print: describe it in one line, e.g. a white fine-line
> brain drawn as tangled looping lines with one bright orange thread]. The text
> line of the print is only about 15 to 20 percent of the frame width. [Same
> campus setting, same light as Clip A]. Audio: [soft fabric movement, ambient
> campus sounds, no music]. No subtitles, no captions, no on-screen text.
>
> *Ingredient: the on-model back mockup from example.com. House note: Flow's
> floor for print scale is ~0.42–0.50 of garment width even with this wording;
> measure against the mockup and accept 0.25–0.40 (Biology) or the design's own
> measured range.*

**Template C — Two-person dialogue (Clip C, 8–12 s)**
> [Medium two-shot], static camera. [Ethan: a young man with brown curly hair,
> wearing a grey t-shirt] stands in [a doorway / at a table] and [Chloe, same
> description] [sits up in bed / turns toward him], listening. [Setting, same
> light as the other clips]. [Warm indoor light, shallow depth of field,
> photorealistic]. Dialogue: Ethan says: [one short line]. Chloe says: [one
> short line]. Audio: [room tone, no music]. No subtitles, no captions, no
> on-screen text.
>
> *Keep each line speakable in ~2 seconds. Colon form, no contractions, no names.*

**Template D — Product close-up / fabric detail (B-roll or payoff)**
> [Extreme close-up / macro], slow dolly-in. [The product, e.g. the black hoodie
> laid flat / the backpack front], [one slow action, e.g. a hand traces the
> embroidered thread / the fabric shifts slightly in a breeze]. [Plain neutral
> background, soft window light]. [Soft morning light, shallow depth of field,
> fine fabric texture visible, photorealistic]. Audio: [soft fabric rustle, no
> music]. No subtitles, no captions, no on-screen text.
>
> *Useful for: fabric-reveal B-roll, the payoff plate's motion, or a "craft"
> beat. Practitioner reports ("Fabric Reveal" style) show close-ups of texture,
> zipper and embroidery read as premium even from a plain product photo.*

**Template E — Hero walk-away (Clip D, 12–16 s)**
> [Wide shot], static camera. [Chloe, same description, wearing the hoodie and
> the backpack], [walks away from the camera across the quad toward the library,
> getting smaller as she walks]. [Same campus, golden light, long shadows].
> [Warm golden-hour light, photorealistic, 35mm film look]. Audio: [footsteps,
> distant campus ambience, no music]. No subtitles, no captions, no on-screen
> text.
>
> *Static camera + a walking-away subject is the most reliable walk-away: the
> model does not have to track, and the print stays readable longer.*

---

## 2. Creative uses of Flow beyond basic text-to-video

Flow is a workspace, not just a generator. The four core modes (Veo 3.1 era,
Oct 2025 update) are:

| Feature | What it does | Acme usefulness |
|---|---|---|
| **Text to Video** | Prompt → clip with native audio | Core. Every Reel starts here. |
| **Ingredients to Video** | Up to 3 reference images (character, object, style) guide the generation | **Core.** The mockup-as-ingredient workflow is this feature. Also use it for Chloe/Ethan consistency and for a style frame. |
| **Frames to Video** | A start frame (and optional end frame) defines the shot; Flow generates the motion between them | **High.** Best when composition must be exact — e.g. a product in a precise position, or a transition between two known frames. More dependable than ingredients for exact framing. |
| **Extend** | Continues a clip from its final second, so a shot can grow to a minute or more | **Medium.** Useful when a good shot ends a second too early. Only works on 8-second Veo 3.1 clips and is generated with Veo 3.1 Lite; 3–4 extensions is a practical limit before drift shows. Describe only what happens next, never re-describe the scene. |
| **Scenebuilder** | Arrange, trim, reorder and preview clips as a sequence; save frames to reuse | **Medium.** Good for previewing a scene as a whole rather than isolated clips. Our local HyperFrames assembly does the same job with more control (captions, end cards, beat grid), so Scenebuilder is a preview tool for us, not the finisher. |
| **Insert / Remove** | Insert adds an object (model matches scene light/shadows); Remove takes an object out and reconstructs the background | **Low–medium.** Handy for fixing a shot (remove a stray object, add a prop) instead of regenerating. Not a primary creative tool for Reels. |
| **Voice reference (Omni Flash)** | Add a voice reference to keep a character's voice across clips | **Try it.** Our dialogue is short and two-person; a consistent voice would help the Chloe/Ethan cast feel like the same people across Reels. Unverified in our workflow so far. |
| **Nano Banana images** | Still images inside Flow (also the ingredient source) | **High.** Generate clean multi-angle product sheets, style frames and character sheets before spending video credits. Image generation is free in Flow. |

### 2.1 What actually works for a small streetwear brand

Ranked by evidence, not hype:

1. **Product photo → campaign.** The most reported fashion workflow: upload a
   real product photo, add a detailed prompt describing high-fashion energy and
   camera movement, generate. Variants seen in the wild: a virtual runway walk,
   a cinematic campaign showcase, a studio shoot without a studio, a dramatic
   product reveal. For Acme this is the mockup-ingredient workflow we already
   run — the difference is to also try the *same* product photo with different
   creative directions (see §2.2).
2. **Style transfer / command-style prompting.** Creators report driving one
   product image into many styles with short commands: `/watercolor ads`,
   `/claymation ads`, `/lego ads`, `/pixar style ads`, `/smoke reveal`,
   `/UGC product hook`, `/luxury commercial`, `/miniature world`. The formula
   is *Product Image + Command + Creative Direction = New Ad Concept*. Most of
   these are gimmicks for a brand whose identity is "fashion first, footnotes
   second" — but two are worth one cheap test each: **`/smoke reveal`** for a
   product reveal beat, and **`/UGC product hook`** for a lo-fi, creator-style
   opening. Judge them against the brand, not against novelty.
3. **Style-first campaign.** Google Flow's own example workflow: generate a
   *visual style reference image first* (fog, mist, neon tones, a mood), then
   use that style to generate the product shots, the model shots and the B-roll
   — all sharing one aesthetic. This is the correct way to run a multi-Reel
   campaign: one style frame, reused as an ingredient in every shot, is what
   makes five Reels feel like one brand.
4. **Fabric/craft close-ups.** Extreme close-ups of texture, zipper, embroidery
   and print detail read as premium and are cheap to generate (Template D).
   They also sidestep the two hardest things for the model: faces and text.
5. **Frames to Video for transitions.** A film made only of text-to-video clips
   feels like a slideshow; bridging two scenes with a start/end frame feels
   directed. For a 20-second Reel this matters less than for a 60-second film,
   but the hook→reveal transition is a good place to try it.

### 2.2 What to skip (or test once, cheaply)

- **Full CGI/style-transfer ads** (claymation, LEGO, Pixar-style) as the main
  Reel: fun, but they hide the actual product — the opposite of the mockup rule.
  One cheap test for a Story or a B-side post, not a Reel.
- **Face-consistency promises.** Commenters on fashion-Flow tutorials repeatedly
  report that the same face does not come back consistently. Our cast works
  because we accept small variation and cut around it; do not build a Reel that
  depends on a face being identical across six shots.
- **Long single takes via Extend.** Extension suits one long establishing view,
  not cutting between angles, and drift accumulates. Our 4-clip structure is
  faster and cheaper than extending.
- **In-Flow text.** Flow still renders text unreliably. Keep every word local.

---

## 3. Editing and post-production: what stays local

The consensus across 2026 guides is blunt: **the AI tool that generates your
video is almost never the right place to finish it.** The winning pipeline is
plan → generate → import → edit → export. AI generation is probabilistic — the
same prompt twice gives different results, clips are short, and every clip still
needs to be assembled, captioned, coloured and mixed.

| Job | In Flow | Local (do it here) |
|---|---|---|
| Footage generation | Yes — the only place | — |
| Clip selection / QC | Rough pick in Flow | Final QC on downloaded files (frames, Whisper, loudness) |
| Assembly / cutting to a beat grid | Scenebuilder preview only | HyperFrames / ffmpeg (our pipeline) |
| Captions | No | Local — timed to Whisper word timings |
| End cards, payoff plates, logos | No | Local — real logo files, real mockups |
| Music | Flow Music generates the track | Cut to whole bars + mix locally (ffmpeg) |
| Colour matching across clips | No | Local — AI clips commonly come out warmer/cooler than each other |
| Voiceover | No (Omni voice reference is for in-clip voices) | Local TTS (Kokoro), mixed under ducked music |
| Export for Reels | Download the clip | 1080×1920, 24 fps, H.264 + AAC, ~-14 LUFS |

### 3.1 Tool comparison for finishing Reels

| Tool | Best for | Watch out for |
|---|---|---|
| **CapCut** (free; Pro ~$8/mo) | The fastest finisher for vertical Reels. Best-in-class free auto-captions with animation styles, templates, trending audio, stock audio, direct publish. Built by ByteDance for exactly this format. | Ceiling is precision: no frame-accurate cuts, no real multi-track mixing, colour grading is filter-level. Free export max 15 min (irrelevant for Reels). |
| **DaVinci Resolve** (free; Studio ~$254/yr) | Professional finishing: Colour page to match white balance across AI clips, Fusion for text overlays, proper multi-track audio. Free version does ~90% of Studio. | Slow for daily vertical work: stylised animated captions are manual (15–20 min per minute of video) unless you pay for Studio. Overkill for a 20-second Reel, right-sized for a hero ad. |
| **Adobe Premiere Pro** | Industry standard, best if you are already in Adobe's ecosystem; good for long-form and client work. | Subscription cost; heavier than the job needs for Reels. |
| **Runway Gen-4.5** | Creative control and editing of generated footage: text/image-to-video, camera-movement choreography, motion-intensity controls. The pick when Flow's output needs reshaping rather than just assembling. | A second generator with its own credits and learning curve — use it to fix or extend, not as a second default. |
| **VEED / Descript** | Text-based editing (cut video by editing words); fast for talking-head and captioned cuts. | Less useful for our visual, music-driven Reels than for dialogue-heavy content. |
| **HyperFrames + ffmpeg (current stack)** | Programmatic, repeatable assembly: beat-grid cuts, caption lanes, payoff plates, loudnorm-calibrated mix, exact loudness targets. Every Reel rebuilds identically. | No GUI; every new graphic is code. That is a feature for repeatability, a cost for one-off experiments. |

**House recommendation:** keep HyperFrames/ffmpeg as the finisher (it is already
built, calibrated and repeatable). Use **CapCut** when the user wants a fast one-off
— a Story, a quick caption variant, a trend-format test — because its auto-captions
and templates are 10× faster than hand-building them. Use **DaVinci Resolve**
only for a hero ad where colour matching across clips and proper grading matter.

### 3.2 Specific finishing notes

- **Colour matching:** AI generators do not guarantee consistency between
  separate prompts. Two clips in one Reel commonly come out noticeably warmer or
  cooler than each other. Check the cut frames side by side; a small white-balance
  or saturation match in the grade is often the difference between "AI" and
  "filmed".
- **Captions:** viewers watch Reels muted. Time captions to measured Whisper word
  timings, not to round windows — a 2-second window cuts words mid-syllable.
  Keep the caption lane clear of faces (our lane moved to top 1240 px / 44 px
  after Chloe's chin sat lower than expected).
- **Text:** AI generators still cannot reliably render clean, legible text inside
  a video. Every word the viewer reads should be composited locally.
- **Music sync:** cut picture to a beat grid (120 BPM = 0.5 s/beat; our 20 s
  Reels are 40 beats) and cut the music to whole bars at its *measured* BPM.
  The first kick should land on a picture beat (ours: film 3.5 s, beat 7).
- **Export:** 1080×1920, 24 fps, H.264, AAC 192k, loudness ~-14 LUFS with true
  peak under -1 dBTP. Verify loudness on the *decoded AAC*, not the pre-mix —
  loudnorm overshoots by ~+0.3 LU on our content, so the apply target is
  I=-14.32, not -14.

---

## 4. Music and sound

### 4.1 Flow Music (Lyria 3.5) — prompting and features

Lyria 3.5 launched in Flow Music on 29 July 2026. Google's launch notes claim
richer melodies, better lyrics, more realistic and emotionally nuanced vocals,
and easier tempo/length control. Songs run up to three minutes, with vocals or
instrumental only. Flow Music's home page lists **stem split** and remixing your
own audio; the documented edit tools are **Extend**, **Cover** and **Replace**
(Replace regenerates one section — e.g. a chorus that feels too busy — while
keeping the rest).

Google's own prompting tips, from its help pages and API guide:

1. **Start with a verb:** write, compose, create.
2. **Name the genre and the instruments**, then the subject and the setting.
   Google's example: "Compose a lo-fi hip-hop beat with a chill, melancholic
   vibe and a simple piano melody."
3. **Give it the numbers your edit needs:** BPM, key, mood, length. The API
   also takes timed sections such as `[0:00 - 0:10]` for an intro.
4. **Say "Instrumental only, no vocals"** for background music under a voice.
5. **Image-to-music:** feed it a photo and it matches mood, atmosphere and
   energy to the visual — useful for scoring a scene from a single frame.

**House caveats (measured, not claimed):** the Length field clamps 1:00–3:00
and overshoots; BPM has a ~120 attractor (115 requested → 120.00 measured,
twice). Generate, download the WAV (48 kHz stereo), measure the real BPM and
first beat, cut locally to whole bars, skip any silent intro. Never plan picture
to the requested BPM.

**Two legal notes:** every Lyria track carries Google's imperceptible SynthID
watermark. And Flow Music's pricing page (as of Oct 2026) does **not** state what
each plan allows for commercial use; Google's Terms of Service say Google will
not claim ownership over content you generate, but that is not the same as a
commercial-use licence. For a brand account posting ads, treat Flow Music as
"probably fine for organic Reels, unconfirmed for paid ads" and check the current
terms before boosting a Reel that uses it.

### 4.2 Alternatives for original background music

| Source | What it is | Cost / licence (checked Oct–Nov 2026) |
|---|---|---|
| **Meta Sound Collection** | Royalty-free tracks + SFX inside Meta Business Suite, pre-cleared for commercial use on Facebook/Instagram (organic Reels, boosted posts, ads). ~14,000–16,000 tracks. | Free. **Meta-scoped only** — the licence does not cover TikTok, YouTube, your website or TV. The in-app Reels music picker is a different, personal-use catalogue: a business account cannot use it for ads. |
| **TikTok Commercial Music Library (CML)** | ~1 million pre-cleared tracks for business accounts on TikTok (organic, ads, branded content). | Free. **TikTok-only** — terms explicitly rule out use on other platforms. |
| **YouTube Audio Library** | Free music + SFX for YouTube videos; some tracks need a credit line. | Free, YouTube-scoped. |
| **Epidemic Sound** | Subscription stock library, cleared for Meta ads on the right tier. | Creator $9.99/mo (personal only); **Pro $16.99/mo** billed yearly for commercial work; Business $30/mo. |
| **Artlist** | Subscription stock library, cleared for Meta ads on the right tier. | Social $9.99/mo (personal); **Pro $24.92/mo** billed yearly for commercial use (music-only $16.58/mo). |
| **Soundstripe** | Subscription stock library. | Personal $9.99/mo; **Pro $19.99/mo** billed yearly covers commercial content. |
| **Flow Music / Lyria** | Original generated tracks, unique per Reel. | Flow Music credits (separate from Flow video credits). See the commercial-use caveat in §4.1. |

**House position:** Flow Music stays the default — a fresh, unique track per Reel
is part of the brand's sound identity, and it costs a few credits instead of a
subscription. Keep Meta Sound Collection as the fallback when a Reel needs a
track that is *certain* to be cleared for a boosted post or ad, and keep a paid
library (Epidemic Pro or Artlist Pro) in mind if Acme starts running paid
campaigns at volume.

### 4.3 Sound design for Reels

- **Room tone is not silence.** Our clips carry lecture-hall ambience, dorm-room
  tone and campus atmosphere; Whisper hallucinates words over low-level ambience,
  so check the final mix with Whisper and do not caption anything that is not
  scripted speech.
- **SFX bed:** a light, consistent SFX layer (footsteps, fabric, room tone) under
  the music makes AI footage feel filmed. Reuse one SFX bed per grid — it costs
  nothing and keeps the Reels coherent.
- **Voiceover:** record/generate the brand line separately and mix it loud.
  Pre-normalise VO to -16 LUFS and duck the music hard under it; the VO is the
  only part of the Reel that says the brand name out loud.
- **Ducking done right:** a stream used as both a sidechain input and an amix
  input is silently attenuated ~-13 dB — `asplit` every sidechain source first.
  No final `alimiter` — loudnorm's own true-peak limiter is the safety.

---

## 5. Workflow speed and credit economy

### 5.1 What a clip costs (Google's Flow Help Center table, as reported Oct–Nov 2026)

| Model / action | Credits per generation | Notes |
|---|---|---|
| Veo 3.1 Lite | 10 (5 on Ultra) | Same cost for 4, 6 or 8 s |
| Veo 3.1 Fast | 20 (10 on Ultra) | Same cost for 4, 6 or 8 s |
| Veo 3.1 Quality | 100 (everyone) | 8 s only in Flow; text + frames only — **no ingredients** |
| Gemini Omni Flash 720p | 4 s: 7, 6 s: 10, 8 s: 12, 10 s: 15 | Per clip, by length; supports ingredients at any length |
| Gemini Omni Flash 360p | 4 s: 4, 6 s: 5, 8 s: 6, 10 s: 7 | Cheap draft previews |
| Gemini Omni Flash edit | 40 | Any length or resolution |
| Veo 3.1 Extend | 10 (Lite rate) | 8 s Veo clips only |

Also: every account gets **50 free Flow credits a day** (videos may be blocked
at peak hours, reported as ~2–5 PM UTC for non-subscribers); daily credits do
**not** roll over, and monthly plan credits do not roll over either. Plans (US,
Oct–Nov 2026): Plus $4.99/mo (200 credits), Pro $19.99/mo (1,000), Ultra
$99.99/mo (10,000) or $199.99/mo (25,000). **Credits are charged per generation,
not per request** — a single prompt that returns two videos costs twice. Our
account (Your Name, you@example.com, PRO, 1,050 credits/month, reset Nov 29)
sits on top of the 50/day free allowance; the 110/day internal cap is the user's
rule, not Google's.

Retirement dates are genuinely confusing across sources: the Gemini API's Veo
3.1 preview model IDs were listed with a shutdown of 22 Oct 2026, the Gemini
Enterprise GA model with retirement 17 Nov 2026 or later, and our own standing
note says Veo 3.1 / Omni 1.1 retire 2026-12-05 in Flow. Treat all three as
"check the model picker before you plan" — the dates differ by surface, and
Flow's own picker is the authority.

### 5.2 The credit-saving rules that actually work

1. **Draft cheap, finish on the good model.** Test a prompt on Veo 3.1 Lite
   (10 cr) or Omni Flash 360p (4–7 cr) before spending Fast/Quality credits.
   Never drop to 360p for a *final* clip to save credits — the quality loss
   shows on a phone screen.
2. **A good prompt saves more credits than any setting.** Every weak generation
   costs the same as a good one. Spend the time on the prompt, not on retries.
3. **Generate two outputs for face shots, pick the better one.** Likeness
   varies; the second output is often the keeper, and it is cheaper than a
   re-prompt.
4. **Extend, do not restart.** If a good shot ends a second too early, extend
   it (10 cr) instead of generating a new clip.
5. **Riskiest clip first.** Generate the print reveal or the hardest shot as a
   test before the easy ones — if the approach fails, you learn it on one clip,
   not four.
6. **Reuse ingredients, not generations.** The same mockup, character sheet and
   style frame feed every clip of a Reel and every Reel of a campaign. Save the
   ingredient files with the project — a prompt without its references cannot be
   rerun.
7. **Batch the Reel in one session.** Write all four prompts first, generate
   A→D in order, QC each before the next. Context-switching between Reels is
   where retakes multiply.
8. **Lock, then vary one thing.** Same identity/wardrobe/lens/lighting language
   verbatim across a set; change one variable per iteration. If a retry changes
   five things and works, you do not know which one fixed it.
9. **Retry discipline.** A failed agent attempt costs nothing; a failed
   *generation* costs full price. Before retrying a failed clip, change the
   prompt (usually: simplify the action, or make the camera static) — the same
   prompt usually fails the same way.
10. **Budget remakes in the brief.** Our Mostly Unconscious Reel was approved
    at 48 cr and cost 108 cr (print reveal took 4 attempts, walk-away 2).
    Quote one-take price + remake allowance, and treat the 110/day cap as a
    hard ceiling unless the user waives it.

### 5.3 Model choice for Acme (decision table)

| Job | Model | Why |
|---|---|---|
| Everyday Reel clips (4 s) | **Omni 1.1 Flash, 720p** (7 cr) | Cheapest good quality; ingredients at any length; voice reference; 10 s option |
| Prompt test / draft | Omni 1.1 360p (4 cr) or Veo 3.1 Lite (10 cr) | Cheapest way to learn whether a prompt works |
| Cinematic hero shot (8 s) | Veo 3.1 Fast (20 cr) | Better prompt adherence and realism than Lite; still cheap |
| Single hero shot for a paid ad | Veo 3.1 Quality (100 cr) | Best quality, but no ingredients — only when the shot needs no reference |
| Continuing a good 8 s shot | Extend (10 cr, Lite) | Cheaper than a new generation, keeps continuity |
| Editing uploaded footage | Omni Flash edit (40 cr) | The only in-Flow way to edit real footage |

For a 4-clip 20-second Reel at one take per clip: **28 cr on Omni 1.1** vs
**80 cr on Veo 3.1 Fast** vs **400 cr on Quality**. That is the whole argument
for Omni 1.1 as the default.

### 5.4 Speed checklist for the next Reel

- [ ] Brief approved with one-take price + remake allowance
- [ ] Mockups downloaded from example.com; print baselines measured
- [ ] Ingredients ready: mockup(s), character description (fixed wording),
      style frame
- [ ] Music generated FIRST (fresh track), BPM measured, 20 s cut ready
- [ ] Riskiest clip generated first as a test
- [ ] Each clip QC'd (frames viewed, print measured, dialogue Whisper-checked)
      before the next generation
- [ ] Assembly on the beat grid; loudness verified on decoded AAC
- [ ] Final viewed end-to-end before delivery (the user's QC process)

---

## 6. Sources

All accessed 2026-11-13. Prices and feature availability are as reported by
these sources on their check dates; Google changes Flow frequently.

**Prompting (official + practitioner)**
- Google Cloud Blog — "The ultimate prompting guide for Veo 3.1" (16 Oct 2025):
  https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
- QuestStudio — "Veo 3.1 Prompt Guide (2026): 10 Google Flow Examples":
  https://queststudio.io/blog/veo-3-prompt-guide-length-limits-best-templates
- Nereo — "Google Flow Prompts: 30 Veo 3.1 Prompts to Try (2026)":
  https://www.nereo.io/blog/google-flow-prompts
- Toybox AI — "Veo 3 Prompting Guide: Camera, Dialogue and Sound Cues":
  https://toyboxai.io/blog/ai-video-music-prompt-guide/
- Promptsera — "Google Veo 3 Prompt Engineering Guide (2026)":
  https://promptsera.com/google-veo-3-prompt-engineering/
- Converge — "Veo 3 Prompt Guide: Best Practices & Examples for Cinematic AI Video":
  https://converge.ai/framia/blog/veo-3-prompt/
- Vidau — "Veo 3 Prompt Guide: Seed, Scheduler and Stable Video Results":
  https://www.vidau.ai/veo-3-prompt-guide-for-great-results/
- ClipDance — "Veo 3 Realistic Video Prompt Guide: Camera, Light, Motion, and Audio":
  https://clipdance.ai/blog/veo-3-realistic-video-prompt-guide
- Prompt Architects — "Veo 3 Prompt Structure: Complete Guide with 25 Examples (2026)":
  https://prompt-architects.com/blog/21-veo3-prompt-structure
- DesignerBox — "AI Video Prompt Examples: 24 Prompts for Product Ads":
  https://designerbox.ai/blog/ai-video-prompt-examples/
- acrid-brain (GitHub) — "Platform prompt recipes — Veo/Flow, Nano Banana, GPT Image":
  https://github.com/acrid-auto/acrid-brain/blob/HEAD/skills/visuals-architect/PLATFORMS.md

**Flow features (Ingredients, Frames, Extend, Scenebuilder)**
- DreamDrive — "Flow Ingredients and Scenebuilder: Consistent Characters"
  (published 2026-10-06, updated 2026-10-15):
  https://www.dreamdrive.ai/learn/google-labs/flow-ingredients-and-scenebuilder-consistency/
- GE Roundtable — "How to Make AI Videos with Google Flow and Veo":
  https://geroundtable.com/flow-veo-ai-videos/
- WebsNP — "Google Flow in Nepal: AI Video Guide, Credits and Price":
  https://www.websnp.com/google-ai-pro/google-flow
- NextFor — "Google Flow: AI Filmmaking Tool Features, Pricing & Use Cases":
  https://www.nextfor.ai/products/google-flow
- MarketerCoffee — "What is Google Flow? Google's AI filmmaking tool explained":
  https://marketercoffee.com/glossary/google-flow/
- TechBullion — "8 Best AI Filmmaking Tools":
  https://techbullion.com/8-best-ai-filmmaking-tools/

**Pricing and credits (all citing Google's Flow Help Center; checked Oct–Nov 2026)**
- Interlinkey — "Google Flow Review (2026): Free Credits, Plans, and How Many AI Videos You Really Get":
  https://ai.interlinkey.com/blog/google-flow-review/
- DigitalTatva — "Google Veo: How to Use Flow to Make AI Videos (2026)":
  https://digitaltatva.com/how-to-use-google-flow-veo/
- PromptVideo — "Google Flow: Pricing, Limits and What It's Good For":
  https://www.promptvideo.pro/google-flow
- Genativity — "Google Flow Pricing 2026: Veo 3.1 Credits per Gemini Plan":
  https://genativity.com/guides/google-flow-pricing
- BlurStudio — "Higgsfield vs Google Veo and Flow for Small Teams":
  https://www.blurstudio.ai/knowledge/higgsfield-vs-veo-and-flow
- AI Alleyway — "Google Veo 3 Pricing: What It Really Costs Per Clip":
  https://aialleyway.com/veo-3-pricing/

**Flow Music / Lyria**
- Boson — "Lyria 3.5: what it is, and can you use its music?":
  https://getboson.app/models/lyria-3-5
- FullStackCreators — "Google Flow Music Is a Free AI Music Studio From Google":
  https://fullstackcreators.com/google-flow-music-ai-studio-creators/
- OneCoolTip — "Create Studio-Quality Songs With Google Flow Music and Lyria 3.5":
  https://www.onecooltip.com/2026/10/create-studio-quality-songs-with-google.html
- Sonilo — "Lyria 3.5 Flow Music Workflow for Video Soundtracks":
  https://sonilo.com/blog/guides/lyria-3-5-google-flow-music

**Editing and post-production**
- TechNow — "AI Video Generators vs Traditional Editors in 2026":
  https://www.technow.blog/2026/11/ai-video-generators-vs-traditional-editors-2026.html
- FluxNote — "DaVinci Resolve Alternative for Vertical Video (2026 Compared)":
  https://fluxnote.io/guides/davinci-resolve-alternative-vertical-video
- PikyAI — "How to Make AI Videos in 2026":
  https://www.pikyai.com/articles/how-to-make-ai-videos-2026
- Lilach Bullock — "Where to Edit an AI Generated Video (Without Making It Look Worse)":
  https://www.lilachbullock.com/where-to-edit-an-ai-generated-video/

**Fashion / product ads with Flow (creator reports — treat as practitioner claims, not verified tests)**
- EssoAIShow — "110 Gemini Commands for AI Product Ad Videos (Free List)":
  https://essoaishow.com/how-to-create-professional-product-ads-with-gemini-using-commands/
- Instagram tutorials on Flow fashion workflows (virtual runway, fabric reveal,
  style-transfer commands) — search "Google Flow fashion product ads", Nov 2026.
  Face consistency is repeatedly reported as the weak point.

**Music licensing alternatives**
- ShutterGen — "Meta Music Library: the 2026 reference for Reels and ads":
  https://shuttergen.com/resources/meta-music-library
- ClipCraft — "Music for Real Estate Videos: What You Can Use":
  https://www.clipcraft.ai/blog/music-for-real-estate-videos
- Uppbeat — "Sponsored post music licensing: A 2026 guide for creators and freelancers":
  https://uppbeat.io/blog/royalty-free-and-copyright-free-music/sponsored-post-music-licensing-a-2026-guide-for-creators-and-freelancers
- ReelMusic — "Music for Instagram Reels on a business account":
  https://reelmusic.app/music-for-instagram-reels-business-account/
