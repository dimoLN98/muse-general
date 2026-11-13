# Google Flow — Creator & Marketer Playbook (October 2026)

**Scope:** practical, procedural knowledge for a beginner-to-intermediate creator who drives Google Flow (`flow.google.com`, formerly `labs.google/fx/tools/flow`) partly through browser automation. Written 2026-10-16.

> **Live findings override this document (2026-10-17).** Verified in the shipped UI on the PRO account, see
> `FLOW-UI-MAP.md` §10–§11: **Extend is absent** (§1.3, §6, §7.4, §8.4 "start on Lite so you can extend" do not
> apply); the **Frames-to-Video entry point is unreachable** (§1.2, §7.3 — use save-frame → upload → ingredient);
> **Insert/Remove/camera controls are not in the clip-editor toolbar**; clip **duration is set by the prompt string**
> ("Video length: 8 seconds."); **4K upscale is Ultra-only** (unavailable); one scene per project. The distilled,
> corrected version for agents is the `google-flow` skill (`SKILL.md` + `references/`).

**How to read this document**

- Statements sourced from Google's own help center, Google blogs, or Google API docs are cited with the URL and are treated as authoritative for *this* date.
- Statements from creator guides, review sites, Reddit, or third-party API wrappers are labelled **[community]** — treat them as reported behavior, not guaranteed behavior.
- Anything I could not verify is tagged **[unverified]**. Where sources disagree, the disagreement is stated explicitly rather than averaged.
- **Google Flow changes fast.** Google's own help page says to check the model, resolution, and credit cost in the prompt-box settings before every run because limits change ([models help](https://support.google.com/flow/answer/16352836?hl=en)). Anything below about credits or feature support should be re-verified in the UI before you build automation on it.

---

## 0. Fast facts you must not get wrong

| Thing | Current state | Source |
|---|---|---|
| Video models | **Gemini Omni Flash 1.1** ("Omni Flash", "Omni 1.1 Flash") + **Veo 3.1 Lite / Fast / Quality** | [models help](https://support.google.com/flow/answer/16352836?hl=en) |
| Image models | **Nano Banana 2.1** (standard), **Nano Banana 2 Lite** ("default model available at no charge"), **Nano Banana Pro** (default for Ultra) | [models help](https://support.google.com/flow/answer/16352836?hl=en) |
| Video aspect ratios | 16:9 and 9:16 only | [models help](https://support.google.com/flow/answer/16352836?hl=en) |
| Image aspect ratios | 16:9, 4:3, 1:1, 3:4, 9:16 (plus `auto` in image-to-image) [community/API] | [useapi image docs](https://useapi.net/docs/articles/google-flow-images-bash) |
| Video lengths | Veo 3.1: 4/6/8s. Omni Flash: 4/6/8/**10**s | [models help](https://support.google.com/flow/answer/16352836?hl=en) |
| Generation resolution | Omni in **720p standard / 360p draft**; 1080p & 4K are **upscales**, not native | [models help](https://support.google.com/flow/answer/16352836?hl=en), [Android Authority](https://www.androidauthority.com/google-flow-gemini-omni-1-1-flash-video-update-3704288/) |
| Default prompt-box model | Help says the model picker opens on **Nano Banana Pro**; the models page says the *no-charge* default is Nano Banana 2 Lite — **Google's own pages disagree**, check the picker | [create videos](https://support.google.com/flow/answer/16353334?hl=en), [models help](https://support.google.com/flow/answer/16352836?hl=en) |
| Eligibility | 18+, supported region, **Google AI Plus / Pro / Ultra** subscription for the full experience | [get started](https://support.google.com/flow/answer/16353333?hl=en) |
| Canada | **Listed as a supported country** | [where you can use Flow](https://support.google.com/flow/answer/16353544?hl=en) |
| Browser | Google recommends **Chromium (Chrome/Edge)** | [get started](https://support.google.com/flow/answer/16353333?hl=en) |
| Watermark | **All** outputs (Veo, Omni, Nano Banana) carry an invisible **SynthID** watermark that "should not be tampered with or removed". A visible watermark is a toggle, and is applied **automatically in India, South Korea, Vietnam** — not Canada | [projects/assets help](https://support.google.com/flow/answer/16935308), [get started](https://support.google.com/flow/answer/16353333?hl=en) |

**Other surfaces that exist and matter for planning:** Flow **Agent** (multi-step, batched generation and editing), Flow **Tools** (natural-language "vibe-coded" custom tools; agents' queries currently don't cost credits), **Characters**, **Avatars** (`@me`), **Scenebuilder** (clip assembly), **video-to-video editing**, **Flow Music** integration ([I/O 2026 roundup](https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/), [Tools help](https://support.google.com/flow/answer/17104535?hl=en), [Agent help](https://support.google.com/flow/answer/17093911?hl=en)).

---

## 1. End-to-end workflows

### 1.1 The recommended production spine

Google's own guidance for Omni 1.1 is to **draft cheap, then commit**: test concepts at 360p, download the chosen clip at 720p, then export at 1080p or 4K ([new creative controls blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/); 360p is "up to 60% faster at roughly one-third the cost" per [Android Authority](https://www.androidauthority.com/google-flow-gemini-omni-1-1-flash-video-update-3704288/) and [XenoSpectrum](https://xenospectrum.com/en/google-gemini-omni-flash/)).

The durable end-to-end loop:

1. **Lock references first.** Create the character(s), product images, and (optionally) a look/style image *before* any video work ([Characters help](https://support.google.com/flow/answer/16935308)).
2. **Shoot the stills.** Generate frames and ingredients as images with Nano Banana in the same project.
3. **Generate shot candidates** — 360p drafts if you're prototyping, 720p if it's a keeper.
4. **Edit on the clip** (Insert / Remove / camera / restyle) — *before* extending, because extending closes those doors (see §6).
5. **Extend** only if the shot must run longer than 8–10s.
6. **Assemble in Scenebuilder**, trim, reorder, preview.
7. **Upscale and download**, then finish captions/music/end-card in an external editor.

### 1.2 Image → video
**Text-to-video with a still as frame:** prompt box → model name → **Video → Frames** → drag an image to `+ Add start frame` (and optionally `+ Add end frame`) → describe the action/transition **between** the frames → set aspect/length/model → Generate ([create videos help](https://support.google.com/flow/answer/16353334?hl=en)).

**Image-to-video with references held:** prompt box → **Video → Ingredients** → add reference images, or type `@` to search project assets by name → describe how each ingredient is used ([create videos help](https://support.google.com/flow/answer/16353334?hl=en)).

**Frame harvesting (the trick most people miss):** in an existing project, click a video → pause on a frame → hover → **Save frame**. That saved frame becomes reusable as an ingredient, start frame, or end frame in later generations ([edit videos help](https://support.google.com/flow/answer/16935718?hl=en)). This is how you chain shots that share an exact composition.

Practical rule from creators: **settle the still, then animate** — Frames-to-Video is the most controllable path for anything that must hit a precise composition ([veovault walkthrough](https://www.veovault.com/blog/how-to-use-google-flow) **[community]**).

Frames-to-Video support: 4/6/8s on every Veo 3.1 tier; 4/6/8/10s on Omni Flash, both aspect ratios, on **First** and **First and last** ([models help](https://support.google.com/flow/answer/16352836?hl=en)).

### 1.3 Video → longer video (Extend)
1. Open the project, click the clip, click **Extend** at the bottom.
2. In the prompt box, describe **how the action continues** (not a new scene).
3. Generate ([edit videos help](https://support.google.com/flow/answer/16935718?hl=en)).

Hard rules as of this date:

- **Only Veo-generated videos can be extended**, and only **8s** clips. Uploaded footage is outside this path entirely.
- **The extension itself must run on Veo 3.1 Lite**, even when the source was Quality. "All Veo 3.1 8s videos can be extended, but you must use Veo 3.1 Lite to extend them."
- **An extended clip can no longer use Insert, Remove, or camera edits.** Treat Extend as a one-way door — do all object work first.
- Omni Flash in the **web app** lists **Extend as "coming soon"**.

Sources: [models help](https://support.google.com/flow/answer/16352836?hl=en), [edit videos help](https://support.google.com/flow/answer/16935718?hl=en).

**How long can you actually go?** The Gemini API docs describe extension as generating a seamless continuation using **the last 10s of your original video as context**, with some final frames edited to make the transition seamless ([Gemini Omni API docs](https://ai.google.dev/gemini-api/docs/omni)). The [useapi wrapper](https://useapi.net/docs/api-google-flow-v1/post-google-flow-videos-extend) says each pass adds an 8s segment continuing from the last ~1 second, with **~1 second of overlap** you should trim when concatenating **[community]**.

Community numbers for Veo chaining: ~7 seconds added per pass, up to ~148 s (~2.5 min) theoretical, **but quality degrades after 3–5 hops** so 30–60s is the practical ceiling ([aivideopicks review](https://aivideopicks.com/posts/google-flow-review-2026.html), [hantsing4](https://hantsing4.com/google-flow-extend-feature-longer-videos/)) **[community, treat as approximate]**. A field-tested creator guide is blunter: "Extend sparingly. One extension is usually clean. Three stacked extensions drift." ([veovault](https://www.veovault.com/blog/how-to-use-google-flow)) **[community]**.

For Omni, the API supports extension to roughly 40s cumulative; independent coverage confirms 10s per output and notes 40s is *cumulative, not one shot* ([XenoSpectrum](https://xenospectrum.com/en/google-gemini-omni-flash/)) **[community]**.

### 1.4 Stitching clips into one longer piece (Scenebuilder)
Scenebuilder is Flow's in-project storyboard. It can: arrange multiple clips in sequence, rearrange order, trim the beginning and end of each clip with handles, preview the whole sequence, and **download a scene** ([edit videos help](https://support.google.com/flow/answer/16935718?hl=en)).

Steps: hover a clip → **More → Add to Scene**; switch to Scenebuilder; drag to reorder; trim edges; preview; download.

**What it cannot do:** it is not a timeline editor. There is no multi-track audio, no custom music/VO upload, no color grading, no keyframe animation, and clips added to a scene cannot be published straight to YouTube — you download the sequence as a single file and upload via YouTube Studio ([projects/assets help](https://support.google.com/flow/answer/16935308); [aivideopicks](https://aivideopicks.com/posts/google-flow-review-2026.html) **[community]**).

Recommended order when building a sequence (synthesised from [Saascrmreview's capability notes](https://saascrmreview.com/google-flow-review/) and [FlowTool's Scenebuilder guide](https://flowtool.app/tutorials/google-flow-scenebuilder-storyboard)) **[community]**:
1. One project for the whole sequence (assets, characters, scenes together).
2. Reusable references created and saved.
3. Generate shot candidates with **identical identity/environment/lighting language**.
4. Save the chosen version before adding it to the scene (use History).
5. Extend eligible clips last.
6. Add clips, reorder, trim, preview, download.

Screen-direction and action continuity at each cut is worth checking in the preview — it is cheap to fix there and expensive to fix after export.

### 1.5 Finishing & export
- **Per-asset download:** hover asset → More → **Download** → pick file type; **270p GIF** is also an option ([projects/assets help](https://support.google.com/flow/answer/16935308)).
- **Upscaling:** 1080p upscaling costs **0 credits for Plus/Pro/Ultra** and is **not available to non-subscribers**; **4K upscaling costs 50 credits and is Ultra-only**. Non-subscribers are capped at the generated resolution (720p, or 720p-behind-upgrade from a 360p draft) ([credits help](https://support.google.com/flow/answer/16526234?hl=en); free-account hands-on: [AI Alleyway](https://aialleyway.com/google-flow-free/) **[community]**).
- **Publishing:** individual clips can be published to YouTube from Flow (details: title, description, visibility, tags, category). **Scenebuilder sequences cannot** — download as one file first ([projects/assets help](https://support.google.com/flow/answer/16935308)).
- **Export back-up:** Google Takeout exports generated/uploaded media **plus** prompts, aspect ratios, model names, camera controls, voice configs, trim offsets, projects, collections, characters, scenes, and ordered edit history. Download links in the archive expire after seven days ([Saascrmreview](https://saascrmreview.com/google-flow-review/)) **[community, but consistent with Google's data-management article linked from the help page]**.
- **Automation note:** Flow does not expose a credit-balance API; the balance lives in the profile menu / prompt-box settings **[community: useapi, gflow-cli]**. Any credit pre-flight check must scrape the UI.

---

## 2. Video prompt formulas with real examples

### 2.1 Google's own formula
Google Cloud's Veo 3.1 prompting guide gives the canonical five parts:

> **[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]**
> ([Ultimate prompting guide for Veo 3.1](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1))

Google's worked example:

> "Medium shot, a tired corporate worker, rubbing his temples in exhaustion, in front of a bulky 1980s computer in a cluttered office late at night. The scene is lit by the harsh fluorescent overhead lights and the green glow of the monochrome monitor. Retro aesthetic, shot as if on 1980s color film, slightly grainy."
> ([same guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1))

Google's own Flow tips page adds the audio dimension and the ingredient/frames/scenebuilder workflow ([5 tips for getting started with Flow](https://blog.google/innovation-and-ai/products/flow-video-tips/)) — note that page is from the Veo 3 launch era and says "Jump To and Extend only work with Veo 2", which is **stale**; treat its workflow tips as good and its feature-support claims as outdated.

**Why it works:** Veo/Omni are trained on cinematographic language. Naming a shot size and a movement removes ambiguity about whether the camera or the subject moves; naming a light source and quality fixes the mood; naming one action keeps an 8-second clip physically coherent. Google explicitly recommends keeping short clips focused on **one scene** rather than chaining several distinct events into a single prompt ([queststudio summary of Google's guide](https://queststudio.io/blog/veo-3-prompt-guide-length-limits-best-templates)) **[community restating Google]**.

### 2.2 The six-slot operating version (what I'd actually automate)
```
[shot type] of [subject with 2-3 concrete attributes], [single action]
[setting: place, time of day, weather]
[one camera move + lens feel]
[lighting: source, direction, quality]
Audio: [ambience]; SFX: [effects]; [Character] says, "[short line]"
```
Every "slot" maps to a variable your automation can permute for A/B variants. Keep **one camera move** and **one action** per clip (multiple moves in a single 8s prompt is the most common cause of mush) — corroborated by [Versely](https://www.versely.studio/blog/veo-3-1-prompting-complete-guide) and [8frame](https://www.8frame.co/blog/veo-3-prompt-guide) **[community]**.

### 2.3 Example prompts (camera-first, audio-included)

**A. Product hero, 9:16, 8s** (paid ad opening shot)
```
Macro product shot, a matte-black stainless steel water bottle with a fine
brushed texture, standing on wet black slate. Single hard spotlight from
camera right rakes across the metal; deep falloff into black; a slow 90-degree
orbit keeps the label facing camera. 85mm look, shallow depth of field.
Audio: low room tone, a single water droplet impact. No dialogue.
```
*Why it works:* the light direction and one orbit are unambiguous, the label-facing constraint protects legibility, and the audio line gives a natural hook beat at 0:00.

**B. UGC-style testimonial, 9:16, 8s** (with `@Character`)
```
Medium close-up of @Maya, a woman in her 30s with short curly hair in a
mustard sweater, mid-sentence looking at camera, leaning slightly toward the
lens at a kitchen counter. Morning window light from frame left, soft shadows.
Handheld, slight drift. Audio: quiet kitchen ambience; @Maya says, "I stopped
buying three of these."
```
*Why it works:* the `@`-mention drives identity stability ([create videos help](https://support.google.com/flow/answer/16353334?hl=en)); a short quoted line (under 10 words) is where dialogue sync is reliable — longer lines drift ([theplanettools](https://theplanettools.ai/tools/google-flow)) **[community]** — and the line is itself the hook.

**C. Cinematic B-roll, 16:9 or 9:16, 8s** (sequence filler)
```
Wide establishing shot, an empty fogged-in coastal road at dawn.
Slow crane-down from a high angle to eye level, 24mm, deep focus.
Grey diffuse light, mist particles catching a distant headlight glow.
Audio: distant surf, wind through grass. No music.
```
*Why it works:* crane-down + "empty" (positive framing, not "no cars") is straight out of Google's Nano Banana advice that transfers well to video: describe what you want, not what you don't ([Nano Banana prompting guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)).

**D. Staircase/bottle-style "viral physics" shot, 9:16, 8s** — the widely-copied structure is: fixed POV camera position stated first, subject geometry, then **step-by-step physics beats** ("hits the first stair and bounces…"), then realism anchors ("photorealistic physics, realistic gravity, realistic glass destruction") and platform framing ("viral Instagram reel style, 4K") ([prepphint example](https://www.prepphint.com/2026/07/google-flow-viral-ai-video.html)) **[community]**.
*Why it works:* physics and continuity are the weakest part of short-clip generation, so enumerating each impact beat constrains the model. The stated 2-second hook ("the object starts rolling immediately") is the point of the shot.

**E. Restyle / edit prompt (Omni, not generation)** — see §7; the pattern is one change + "Keep everything else the same."

### 2.4 Prompting rules that hold across models
- **Audio is a separate sentence with labels.** `Audio:`, `SFX:`, `Ambience:`. Put dialogue in **quotation marks** so the model times it ([Veo prompting guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1)).
- **Say the camera move explicitly** — otherwise you get static or subtle handheld ([LTX guide](https://ltx.io/blog/veo-prompt-guide)) **[community]**.
- **Prompt in English** for Veo/Omni; write the intent in your own language first if that helps, then translate ([French Flow guide](https://googleflow.fr/__l5e/assets-v1/6f968dc7-10f2-49a5-a826-935ef8836ed8/guide-google-flow.pdf)) **[community]**.
- **Sky, water, crowds, hands, and text** are the classic weak spots; prefer shots that avoid all five in frame when reliability matters **[community consensus across review threads]**.
- **Don't fight refusals by rewording endlessly** — see §6 for the actual escalation ladder.

---

## 3. Image prompting for Nano Banana 2.1 / Pro

### 3.1 Model choice in Flow
- **Nano Banana Pro** — complex designs, accurate detail, professional control; **default for Ultra**; needed when typography or packaging text must stay sharp ([models help](https://support.google.com/flow/answer/16352836?hl=en); [carat.im](https://carat.im/en/curated/nano-banana-25-guide) **[community]**).
- **Nano Banana 2.1** — the standard fast/high-quality model.
- **Nano Banana 2 Lite** — "the default model available at no charge". Google does **not publish a per-image credit cost** for any image model ([models help](https://support.google.com/flow/answer/16352836?hl=en); [izzedo](https://www.izzedo.chat/blog/nano-banana-price-and-limits) **[community]**). Community reports that images effectively cost 0 credits and that Flow charges for video only ([nano-banana-mcp](https://github.com/frannkurt/nano-banana-mcp)) — **[community, unverified against Google]**. Verify in the prompt-box settings.
- **Draft-cheap-then-promote:** community testing says prompts transfer unchanged between Lite → 2.1 → Pro, so draft on the cheap model and re-run the winner on Pro ([bananabanana.pro](https://bananabanana.pro/prompts/product-photography)) **[community]**.

### 3.2 Google's image prompt structure
Google's Cloud guide prescribes: **[Subject] + [Action] + [Location/context] + [Composition] + [Style]**, plus these rules ([Ultimate prompting guide for Nano Banana](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)):
- Be specific about subject, lighting, composition.
- **Use positive framing** ("empty street", not "no cars").
- Control the camera with photographic terms ("low angle", "aerial view").
- Iterate conversationally rather than rewriting wholesale.
- Start with a **strong verb** naming the operation.

The Google blog for Nano Banana Pro adds the slots creators under-use: **composition and aspect ratio** ("A 9:16 vertical poster"), **camera and lighting detail** ("low-angle shot, shallow depth of field f/1.8", "golden hour backlighting"), **specific text integration** (quote the exact string and describe the font and position), and **explicit roles for each reference image** ("Use Image A for pose, Image B for style, Image C for background") ([7 tips to get the most out of Nano Banana Pro](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)).

### 3.3 Copy-ready image formulas

**Photoreal / editorial (Google's own template shape):**
> A photorealistic [shot type] of [subject] in [setting], [light], shot from [angle] with [lens].
> (each bracket filled with something concrete — [eachlabs](https://www.eachlabs.ai/blog/nano-banana-2-1-review-tested-prompts))

**Product / packshot (PDP hero, marketplace listing):**
> [Product + 2–3 concrete material details] on [named surface], against [named backdrop]. Lighting: [one named source, direction, quality]. [Camera angle]. [One finishing note: focus target, lens, mood].
> ([bananabanana.pro product guide](https://bananabanana.pro/blog/nano-banana-pro-product-photography), [8frame](https://www.8frame.co/blog/nano-banana-pro-prompts-for-product-photography)) **[community, but the structure matches Google's template]**

Worked example (community-tested):
> "A high-resolution, studio-lit product photograph of a minimalist wristwatch with a brushed steel case, a forest-green sunburst dial with slim silver baton markers and a dark brown leather strap, standing upright on a low light-gray stone pedestal against a seamless off-white background. The lighting is a three-point softbox setup that creates soft gradients across the brushed steel and a gentle shadow under the strap. Slightly elevated 45-degree camera angle. Ultra-realistic, with sharp focus on the sunburst texture of the dial."
> ([bananabanana.pro](https://bananabanana.pro/blog/nano-banana-pro-product-photography)) **[community]**

Lighting phrases that read reliably in community testing: *three-point softbox* (clean e-comm), *single hard spotlight* (dramatic), *soft window light from one side* (lifestyle warmth), *golden hour backlight* (outdoor), *overcast daylight* (flat, colour-accurate) ([bananabanana.pro](https://bananabanana.pro/blog/nano-banana-pro-product-photography)) **[community]**.

**E-commerce specifics that materially change output quality** **[community]**:
- White/neutral seamless background with a **subtle contact shadow** under the base — contact shadows are what stop a product looking pasted on ([nanobananao](https://nanobananao.com/blog/nano-banana-pro-ecommerce-lifestyle-product-photos/)).
- Name the surface and backdrop every time and **keep that wording identical across a catalog set**, changing only the product and composition, so the set reads as one shoot ([8frame](https://www.8frame.co/blog/nano-banana-pro-prompts-for-product-photography)).
- Focal length shapes perspective: **85mm/100mm** for close packshots, **35mm** for environmental lifestyle; don't mix within a set ([nanobananao](https://nanobananao.com/blog/nano-banana-pro-ecommerce-lifestyle-product-photos/)).
- Upload a real white-background photo of your actual product; the model restyles the scene around it instead of inventing a lookalike ([bananabanana.pro](https://bananabanana.pro/prompts/product-photography)).
- Check four things before approving: label readable and undistorted, contact-shadow direction matches the light source, scale believable, background props not overpowering the product ([nanobananao](https://nanobananao.com/blog/nano-banana-pro-ecommerce-lifestyle-product-photos/)).

**Text-in-image:** quote every word you want rendered, name the font style, say where it goes, and add "no additional text" when you need a clean layout ([eachlabs](https://www.eachlabs.ai/blog/nano-banana-2-1-review-tested-prompts); [Nano Banana Pro tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)). Community practice: put brand/branding rules in a **separate system instruction** when your surface supports it, and keep the prompt about the shot only ([fal.ai](https://fal.ai/learn/tools/how-to-use-nano-banana-2-1)) **[community; Flow's UI doesn't expose a system prompt — this applies if you drive the model via API]**.

**Image editing (the conversational pattern):**
> Using the provided image: keep [face / hairstyle / product shape / label text] identical. Change [one thing]. Do not change anything else.
> ([eachlabs](https://www.eachlabs.ai/blog/nano-banana-2-1-review-tested-prompts), [nanobananao prompt guide](https://nanobananao.com/prompt-guide/)) **[community]**

Flow's own image-editing surface includes a **lasso tool** for selecting a region, **drawing directly on the image**, and natural-language tweaks like "remove the man" or "add Koi fish in the water" ([Feb 2026 Flow update](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates-february-2026/)).

**Resolution discipline:** images generate around 1K; you can **upscale to 2K on any plan** and **4K on a paid plan** (Ultra for video 4K). Set the ratio before generating; raise resolution only for print or large-format use because it's invisible on a phone and costs more ([useapi image docs](https://useapi.net/docs/articles/google-flow-images-bash), [note.com guide](https://note.com/leftbank/n/nfd30a6d32702?hl=en) **[community]**).

---

## 4. Ingredients, references, characters, and keeping a subject stable

### 4.1 The three reference systems in Flow
| System | What it is | Where it's used | Key limit |
|---|---|---|---|
| **Ingredients / references** | Reference images (and in Omni, reference **videos** and **voices**) attached to a prompt | Prompt box → Video → Ingredients | Veo 3.1: **8s videos only** for Ingredients; **Veo 3.1 Quality cannot use ingredients at all** |
| **Characters** | A saved, reusable bundle of visual + audio references with a **name** and a **voice** | Left panel → Characters; call with `@Name` | Requires **at least 1 image**; reference images limited to 1–2 per character |
| **Avatar** | Your own verified likeness + voice | `@me` | Not available in EEA / UK / Switzerland; **Canada is fine**; can't be shared via Tools or public links |

Sources: [create videos help](https://support.google.com/flow/answer/16353334?hl=en), [models help](https://support.google.com/flow/answer/16352836?hl=en), [characters help](https://support.google.com/flow/answer/16935308), [avatars help](https://support.google.com/flow/answer/17102997).

### 4.2 How to get real consistency
**Google's own rules for ingredients** ([create videos help](https://support.google.com/flow/answer/16353334?hl=en)):
- Provide subject/product references on a **plain or segmented background**.
- Location and style references **shouldn't contain extra subjects** unless intentional.
- Your text prompt must **complement, not contradict**, the visual inputs.
- A **consistent look and feel across all ingredient images** helps the model blend them.

**Characters** bundle face, clothing and voice so they stay consistent "across multiple generations without needing to upload the same images every time" ([characters help](https://support.google.com/flow/answer/16935308)). Google's own X account describes the loop as: create a saveable character in the Character tab → generate reference images to lock details → use those images in the prompt ([Google Flow on X](https://x.com/FlowbyGoogle/status/2085823649253327149)).

**The community technique that actually moves the needle — the reference sheet** **[community]**:
1. Build **one image containing the subject in three angles — front, three-quarter, profile** — because "that geometry is what keeps their face consistent when they turn their head later."
2. Describe the subject with **concrete, non-neutral specifics** (skin tone, hair texture, build, makeup level). "Whatever you bake into the reference, you inherit in every scene after it."
3. Upload that sheet as the character's reference image, then stress-test it: change angle, change lighting, change outfit ([How to Create a Consistent Character in Google Flow](https://www.youtube.com/watch?v=G2h6d9Y60FE)) **[community]**.
4. A second reference image is allowed and is intended to teach Flow the character from another angle (Flow "uses your original image as the anchor reference and generates new perspectives of the exact same person"). **Two references total** ([AMERICAN RARE walkthrough](https://www.youtube.com/watch?v=_rQvE6wWN0E)) **[community]**.

**Voice stability:** voice references attach **only to video generations that use ingredients**. A frames-first shot cannot take a voice reference and will error ([create videos help](https://support.google.com/flow/answer/16353334?hl=en); [Saascrmreview](https://saascrmreview.com/google-flow-review/) flags the same constraint). Custom voices are made by picking a base voice and describing a performance ("slightly raspy with a New York accent") ([create videos help](https://support.google.com/flow/answer/16353334?hl=en)).

**The ingredient recipe for a locked product** **[community]**: one clean cutout-style product image + one product-in-hand image as the two ingredients, kept in the same project, referenced by `@` in every shot. Keeping them project-scoped is important because `@`-mentions resolve **within the project** ([gflow-cli user guide](https://github.com/Desmondzwc/Google-Flow-Video/blob/develop/docs/USER_GUIDE.md)).

**Jump To / Extend legacy note:** Google's own Flow tips page describes a **Jump To** feature — "transition a character or object to a completely new setting while preserving their appearance from the previous shot" — but says at the time of writing it worked only with Veo 2 ([5 tips](https://blog.google/innovation-and-ai/products/flow-video-tips/)). **I could not verify whether Jump To exists in the current product** as a named control; treat it as **[unverified]**. Current cross-shot character preservation is done with Characters + Ingredients + first/last frames, which is what the 2026 help center documents.

**Agent Instructions as a project-wide style lock:** you can add a reference image plus standing creative guidelines to the Agent, which then applies them as a permanent style/tone/character instruction across the project ([Agent help](https://support.google.com/flow/answer/17093911?hl=en)). Creators report using this as the "show bible" so identity and look survive across many generations ([TexUpdate tutorial](https://www.youtube.com/watch?v=I8VQPHUTbzU)) **[community]**.

**Expectant failure mode:** consistency is *improved*, not guaranteed. Community reviews report subtle drift (eye colour, hair, proportions) between clips even with ingredients ([aivideopicks](https://aivideopicks.com/posts/google-flow-review-2026.html)) **[community]**. Plan a QC pass at the *sequence* level, not the clip level.

---

## 5. Instagram Reels / Shorts / paid-ad playbook

### 5.1 Non-negotiables
- **9:16, full-screen, 1080×1920.** Anything pillarboxed or letterboxed loses screen real estate and "reads instantly as repurposed feed content" ([AdGenZ Reels ads playbook 2026](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026)). Generate at 9:16 **before** you render — Flow's video aspect ratio is a generation setting, not a crop ([models help](https://support.google.com/flow/answer/16352836?hl=en)).
- **Hook inside 1 second; the first 1–3 seconds carry the entire ad.** Meta-aligned guidance: the first 2 seconds carry the hook; for cold-audience prospecting keep runtimes **under 15 seconds**; the universal rule is **20s to 30s max for real completion rates** ([AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026), [Digital Applied](https://www.digitalapplied.com/blog/instagram-reels-ads-2026-creative-strategy-guide)).
- **Frame 1 must contain motion.** "Static first frames trigger the same scroll reflex as a pause — the eye interprets stillness as content that has ended" ([Digital Applied](https://www.digitalapplied.com/blog/instagram-reels-ads-2026-creative-strategy-guide)). This is the single most reliable hook enhancement and it maps directly onto a Flow prompt: put the motion in the first clause.
- **The hook must work as a still frame, with sound off** ([AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026)).
- **Cuts every 2–3 seconds.** Longer runtimes work only with sustained pacing, not just a strong open ([AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026)).
- **Keep text out of the bottom ~250px** of a 1080×1920 frame (Reels/Stories UI overlay) ([zsky.ai](https://zsky.ai/blog/how-to-make-free-ai-ads)).
- **Captions are mandatory**, not optional: a large share of viewers watch without sound ([vidau](https://www.vidau.ai/create-ai-generated-videos/)). Flow does not burn captions in — plan a caption step in your editor or use a Flow Tool ([Tools help](https://support.google.com/flow/answer/17104535?hl=en); a community-built "Type Overlays" tool exists in the Flow Tools gallery **[community: maven.com session](https://maven.com/p/208fd3/personalize-your-ai-animation-tools-with-google-flow)]**).

### 5.2 Hook archetypes that map onto Flow prompts
| Archetype | Flow prompt shape | Source |
|---|---|---|
| Mid-action open | Start the prompt mid-verb: "already sprinting", "mid-sentence" — no establishing beat | [AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026) |
| Pattern-interrupt claim | Bold, specific, slightly counterintuitive text overlay over motion (made as a Nano Banana still, then animated in Frames-to-Video) | [AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026) |
| Native testimonial cold-open | `@Character` mid-reaction talking to camera, no logo, no intro card, framed like UGC | [AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026) |
| Visual before/after snap | Hard cut within the first second; generate two clips with matching composition and cut on the frame | [AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026) |
| Question to camera | Direct eye contact, one question tied to a real pain, first frame, no preamble | [AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026) |
| Result-first | Show the finished payoff immediately, then explain | [zsky.ai](https://zsky.ai/blog/how-to-make-free-ai-ads) |

### 5.3 The 15–30 second structure that keeps showing up
> **0–3s hook** (native-style) → **4–10s problem/agitation** → **11–20s product demo or social proof** → **final 5–10s direct CTA**
> ([Digital Applied](https://www.digitalapplied.com/blog/instagram-reels-ads-2026-creative-strategy-guide))

Because Flow clips are 4–10s, that maps cleanly onto **3–5 clips** assembled in Scenebuilder:
- Clip 1 (4–6s): hook, motion in frame 1.
- Clip 2 (6–8s): problem/value in one beat, dialogue if you have a `@Character`.
- Clip 3 (8–10s): demo or proof.
- Clip 4 (4–6s): CTA to camera or product hero with on-screen text.
- **>=15s total**: only if you can sustain a cut every 2–3s.

Alternative structure if you write with an LLM first: **Hook → Product Introduction → Key Benefits → Social Proof → CTA**, then split into 3–8s scenes and generate each ([asfarkhanak](https://asfarkhanak.com/how-to-create-ai-ugc-videos-chatgpt-flow)) **[community]**.

### 5.4 Sound
- Omni Flash and Veo 3.1 generate **native audio with the video** — ambience, SFX, dialogue, and (in Flow Music's case) music ([Flow updates blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/); [Veo update blog](https://blog.google/innovation-and-ai/products/veo-updates-flow/)).
- **Flow cannot accept your own music, VO or SFX upload** — all audio in a Flow clip is generated. For a licensed track, export and composite in an external editor ([aivideopicks](https://aivideopicks.com/posts/google-flow-review-2026.html)) **[community]**.
- Dialogue sync is reliable for **short phrases (under ~10 words)** and drifts on longer monologues ([theplanettools](https://theplanettools.ai/tools/google-flow)) **[community]**. Write one or two sentences per clip max.
- Always give audio its own labelled sentence; be literal — "no music" is a valid instruction ([Versely](https://www.versely.studio/blog/veo-3-1-prompting-complete-guide)) **[community]**.

### 5.5 Testing matrix (paid)
Run a small matrix rather than one-off ads: **a handful of creative angles × 9:16 (+1 alternate format) × 2 hook variants against the same body** ([AdGenZ](https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026)). With Flow this is cheap in *images* but expensive in *video credits*, so build the matrix from **stills first** (Nano Banana, effectively free/low cost) and only render the winning hooks to video.

### 5.6 Disclosure — do not skip this
- YouTube requires disclosure when AI makes a real person appear to say/do something they didn't, alters footage of a real event or place, or generates a realistic scene that didn't occur ([YouTube AI disclosure policy](https://support.google.com/youtube/answer/14328491)).
- Since **May 2026**, YouTube also auto-detects photorealistic AI and applies the label itself; the label sits **under the player** for long-form and **as an overlay on Shorts**. Labels **cannot be removed** for content made with YouTube's own AI tools, content with C2PA metadata, or manually labelled content ([YouTube blog](https://blog.youtube/news-and-events/improving-ai-labels-viewers-creators/); [YouTube policy updates](https://support.google.com/youtube/answer/10008196)).
- YouTube states plainly that a disclosure label **does not affect recommendations or monetization eligibility** ([YouTube community](https://support.google.com/youtube/thread/424874071/updates-to-ai-content-disclosure-and-labels)). Failing to disclose repeatedly can mean forced labels, removal, or YPP suspension.
- Flow's own route to YouTube notes that Flow outputs carry the invisible **SynthID** watermark and it "should not be tampered with or removed" ([projects/assets help](https://support.google.com/flow/answer/16935308)).
- **Practical:** animated/fantastical content often only gets the description-level label; photorealistic "real scene that didn't happen" gets the prominent one. If you're making photoreal UGC-style ads, assume the label.

---

## 6. What Flow does badly — and the workarounds

| Weakness | Evidence | Workaround |
|---|---|---|
| **8s clip cap on Veo; extension only via Veo 3.1 Lite, only on 8s Veo clips, and it disables Insert/Remove/camera on that clip** | [models help](https://support.google.com/flow/answer/16352836?hl=en), [edit videos help](https://support.google.com/flow/answer/16935718?hl=en) | Do all object edits **before** extending. Start any shot you *know* will need extension on Lite. Prefer **10s Omni clips** over extension. For anything over ~20s, prefer **Scenebuilder cuts** over extension chains. |
| **Progressive quality decay across extension chains** (community reports drift after 3–5 hops) | [aivideopicks](https://aivideopicks.com/posts/google-flow-review-2026.html), [hantsing4](https://hantsing4.com/google-flow-extend-feature-longer-videos/) **[community]** | Treat one extension as clean, two as acceptable, three+ as a last resort. Budget for the shot to be *cut*, not extended. |
| **Omni Flash "Extend videos" is listed as "coming soon"** in Flow even though the Gemini API supports extension | [models help](https://support.google.com/flow/answer/16352836?hl=en) vs [Gemini Omni API docs](https://ai.google.dev/gemini-api/docs/omni) | For long Omni shots today, chain clips in Scenebuilder rather than extending. |
| **Model choice silently strips features.** Veo 3.1 **Quality cannot use Ingredients** or Extend. Veo 3.1 **Fast cannot Extend**. Only Omni Flash edits uploaded/generated video. | [models help](https://support.google.com/flow/answer/16352836?hl=en); [Saascrmreview](https://saascrmreview.com/google-flow-review/) | Decide the whole pipeline per shot *before* generating: if you need ingredients → Lite/Fast/Omni; if you need v2v editing → Omni only. |
| **Scenebuilder is assembly, not editing.** No multi-track audio, no custom music/VO upload, no color grading, no complex transitions, no keyframes. Sequences also can't be published direct to YouTube. | [edit videos help](https://support.google.com/flow/answer/16935718?hl=en), [projects/assets help](https://support.google.com/flow/answer/16935308); [aivideopicks](https://aivideopicks.com/posts/google-flow-review-2026.html) **[community]** | Treat Flow as a *shot factory*. Finish in an NLE (Premiere/Resolve/CapCut) whenever you need captions, music, end-cards, or brand LUTs. Download the Scenebuilder sequence as one file and go. |
| **Flow has no public API.** All automation is UI-level. | [koda.community review](https://www.koda.community/reviews/2026-05-20-google-flow-generate-cinematic-video-with-consistent-characters.html) **[community]**; corroborated by the existence of third-party UI drivers ([useapi](https://github.com/useapi/google-flow-api), [gflow-cli](https://github.com/Desmondzwc/Google-Flow-Video)) | Automate the browser with a persistent, real profile. See §9. |
| **"We noticed some unusual activity" / "You're requesting generations too quickly"** — a rate-limit-shaped error that can escalate to multi-hour or multi-day lockouts, including on paid plans. Google's own help says limits tighten after many generations in a day, and to "**retry after a couple of minutes**" and "**disable VPNs or proxies**". | [get started help](https://support.google.com/flow/answer/16353333?hl=en) | See §9 for the full ladder. Do not hammer Retry; it compounds. |
| **Content-policy refusals on benign prompts**, plus reported false positives (community reports of cat/milk scenes flagged, AI faces matched to real celebrities). | [r/GeminiAI thread](https://www.reddit.com/r/GeminiAI/comments/1t2jxkz/why_google_flow_is_just_not_worth_it_anymore/), [r/Bard thread](https://www.reddit.com/r/Bard/comments/1tmxmyn/is_anyone_else_struggling_to_use_flow_lately/) **[community]** | Rewrite rather than retry: remove **proper names of real people**, remove words with dual meanings, and describe the visual rather than the intent. Community escalation ladder: rephrase → regenerate → switch project → switch browser profile. |
| **Character/ingredient drift across shots** — improvement, not a guarantee | [aivideopicks](https://aivideopicks.com/posts/google-flow-review-2026.html) **[community]** | Reference sheet with three angles; two references max; identical identity language copy-pasted into every prompt; QC at sequence level. |
| **4K is an upscale, not native** — Flow generates at 720p (Omni) and upscales | [models help](https://support.google.com/flow/answer/16352836?hl=en), [nemovideo](https://www.nemovideo.com/blog/ai-video-editing/google-flow-editing-review) **[community]** | Don't promise clients native 4K. Upscale only the final selects; 1080p upscale is free for subscribers, 4K is 50 credits and Ultra-only. |
| **Region gaps:** editing **uploaded** videos is not supported in the EEA, Switzerland or the UK; **Avatars** are unavailable there too; prominent-people and identifiable-minor editing is unsupported everywhere. | [where you can use Flow](https://support.google.com/flow/answer/16353544?hl=en), [avatars help](https://support.google.com/flow/answer/17102997) | **Canada is fine for both.** If a collaborator is in the EU, they cannot do v2v edits — route that step through a Canadian/US account. |
| **Voice references only work on ingredient-based generations.** | [create videos help](https://support.google.com/flow/answer/16353334?hl=en) | If dialogue continuity matters, build the shot on **Ingredients**, never on Frames-only. |
| **Vibe-coded Tools can be buggy.** | [Maven session description](https://maven.com/p/208fd3/personalize-your-ai-animation-tools-with-google-flow) **[community]** | Treat created Tools as scrappy utilities and re-test after any Flow update. |
| **Everything is watermarked with SynthID and it must stay.** | [projects/assets help](https://support.google.com/flow/answer/16935308) | Disclose per platform policy; don't strip it (it's invisible anyway, so not a visual problem). |

---

## 7. Editing features (the post-generation toolkit)

Google's Flow support articles and blogs document this set. **Feature availability is model-gated — Omni Flash is the only model that edits existing video** ([models help](https://support.google.com/flow/answer/16352836?hl=en)).

### 7.1 Video-to-video editing (Omni Flash only)
1. Open a project → prompt box model picker → **Video** → **Omni Flash**.
2. Upload/drag a video up to **60s / 1 GB** in `.mov`, `.mp4`, `.avi`, `.wmv`. Anything over 30s **must be trimmed to 30s** inside Flow. Flow processes, formats, and runs safety checks.
3. Click the video → in the trimming window select **up to a 10-second segment**.
4. Write a prompt describing what to change. Google's example: *"Change the lighting to a cinematic sunset"* / *"Add a text overlay that says 'Coming Soon'"*.
5. Optionally add ingredients.
6. Generate. You can then refine with **up to 3 conversational turns** without losing prior-edit context.
([edit videos help](https://support.google.com/flow/answer/16935718?hl=en))

**Prompt discipline for edits** (from the Gemini Omni API docs, which drive the same model):
> **Short, single-change prompts. Append "Keep everything else the same."**
> Documented edit archetypes: **Restyle** ("Make this video anime"), **Add** ("Put a fashionable hat on this person"), **Remove** ("Make the phone invisible. Keep everything else the same."), **Relight** ("Change the lighting to be more dramatic"), **Re-shoot** ("Change the camera angle to over his shoulder").
([Gemini Omni API docs](https://ai.google.dev/gemini-api/docs/omni), restated by [omnirender](https://omnirender.ai/blog/how-to-use-gemini-omni-flash))**The longer and more detailed the edit prompt, the more the model changes** — this is the single most common way to ruin a good clip.

**Version safety:** "When you edit a video in Google Flow, you don't lose the original video. In the History panel, you can find all previous versions of the video and the prompts you used." On the mobile app, edits stack and you swipe left/right to compare against the original ([edit videos help](https://support.google.com/flow/answer/16935718?hl=en)).

### 7.2 Insert / Remove objects
- **Insert:** open clip → **Insert** → describe the object; **click-and-drag a box** to specify where it should appear → Generate. Flow handles shadows and scene lighting so additions look natural ([edit videos help](https://support.google.com/flow/answer/16935718?hl=en), [Veo 3.1 Flow blog](https://blog.google/innovation-and-ai/products/veo-updates-flow/)).
- **Remove:** open clip → **Remove** → drag a box around the object → Generate; Flow reconstructs the background ([edit videos help](https://support.google.com/flow/answer/16935718?hl=en)).
- Removal was shipped as **experimental** and rolled out after insert ([Flow refine blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-refine-videos/)).
- **Image-side equivalents:** lasso-select a region and instruct in natural language ("remove the man", "add Koi fish in the water"), or draw directly on the image ([Feb 2026 blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates-february-2026/)).

### 7.3 Frames to video (first / last frame)
Prompt box → **Video → Frames** → `+ Add start frame`, `+ Add end frame` → describe the transition **between** them → Generate ([create videos help](https://support.google.com/flow/answer/16353334?hl=en)). Google positions start/end frames as the control that "keep[s] the characters and narrative consistent as you thoughtfully transition between frames" ([new creative controls blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/)). Available 4/6/8/10s on Omni and 4/6/8s on all Veo 3.1 tiers ([models help](https://support.google.com/flow/answer/16352836?hl=en)).

**Best practice:** harvest frames from your own good clips (`Save frame`) and use them as the start frame of the *next* shot. That is the most reliable continuity device in the product.

### 7.4 Extend
See §1.3. One-way door: no insert/remove/camera after extending.

### 7.5 Camera controls and other post-generation edits
Google's Feb 2026 update added **orchestrating camera motion**, plus seamless clip-length extension, add/remove objects ([Feb 2026 blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates-february-2026/)). Note that these are **post-generation controls applied to an existing clip**, not real-time direction — you can't adjust mid-generation ([theplanettools](https://theplanettools.ai/tools/google-flow)) **[community]**.

### 7.6 Scene/clip assembly
**Scenebuilder:** Add to Scene → drag to reorder → trim handles → preview → download ([edit videos help](https://support.google.com/flow/answer/16935718?hl=en)).

**Agent as a batch editor:** the Agent can create multiple variations at once and **batch-edit** so a tweak applies across all your assets, plus rename files, group media into Collections, and delete unused assets ([Flow updates blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/), [Agent help](https://support.google.com/flow/answer/17093911?hl=en)). For a 20-clip campaign that all need "warmer light", this is dramatically cheaper than 20 manual edits.

**Agent guardrail for automation:** in Flow settings you choose whether the Agent **confirms before generating** — *Always* (default) or *Never*. "If you select **Never**, the Agent can generate media and use credits on your behalf without pausing for approval" ([Agent help](https://support.google.com/flow/answer/17093911?hl=en)). **Set this to Always if credits matter.**

**Tools** let you vibe-code reusable utilities (image editors, video resizers, text overlays, custom shaders) and share/remix them; all users can *use* existing Tools, subscribers can *create and remix* them; Agent queries currently don't cost credits, but there's a daily quota on how many Tools you can create ([Tools help](https://support.google.com/flow/answer/17104535?hl=en), [I/O 2026 roundup](https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/)).

---

## 8. Credit & spend hygiene

### 8.1 The allowance structure
- **50 Flow credits per day, with or without a subscription.** Daily refresh is triggered by your first generation of the day; unused credits **do not roll over**.
- Subscribers add monthly credits: **AI Plus +200/mo, AI Pro +1,000/mo, Ultra $100 +10,000/mo, Ultra $200 +25,000/mo**; monthly credits do not roll over.
- Credits are **shared across the account across devices**; family-group sharing is possible but only the plan manager can buy more.

Sources: [credits help](https://support.google.com/flow/answer/16526234?hl=en), [Google One AI plans](https://one.google.com/about/google-ai-plans/).

**Community caveat:** multiple community sources say the **free daily 50 credits can only be spent on Veo 3.1**, not Omni Flash ([note.com](https://note.com/treasurefoot_ai/n/n9e5fbacf2918?hl=en), [aireiter](https://aireiter.com/blog/google-flow-overview), [veo3ai](https://www.veo3ai.io/blog/is-google-flow-free)) — but Google's own models page now says "**All users can access Gemini Omni models**" ([models help](https://support.google.com/flow/answer/16352836?hl=en)) and PCMag tested a free account using Omni Flash ([PCMag](https://www.pcmag.com/how-to/can-google-flow-turn-your-prompts-into-movie-magic-i-had-to-find-out)). **Sources conflict; verify on your own account.** The most defensible reading: "all users can *access* Omni" describes availability of the model, while the *free-credit eligibility* may still be Veo-restricted. **[unresolved][unverified]**

### 8.2 Cost table (credits per **generation**)
| Model / operation | Credits | Notes |
|---|---|---|
| Veo 3.1 **Lite** (4/6/8s and Extend) | **10** (Ultra **5**); a **Lower Priority** queue is **0** for Ultra plan managers **[community: lazykiwi, saascrmreview]** | Cheapest Veo; the only tier that can run Extend |
| Veo 3.1 **Fast** (4/6/8s) | **20** (Ultra 10) | No Extend |
| Veo 3.1 **Quality** (8s) | **100** all tiers | No Extend, no Ingredients |
| **Omni Flash 720p** (4/6/8/10s) | **7 / 10 / 12 / 15** | Excludes edits |
| **Omni Flash 360p** (4/6/8/10s) | **4 / 5 / 6 / 7** | "Half the credit cost of 720p"; upscalable to 720p for **0 credits** on Pro/Ultra |
| **Omni Flash — edit** uploaded & generated video, any length/resolution | **40** | Per edit, not per request |
| **1080p upscaling**, any model | **0** for Plus/Pro/Ultra; **not available** to non-subscribers |
| **4K upscaling**, any model | **50**, **Ultra only** |
| Images (Nano Banana family) | **Google does not publish a per-image credit cost.** Nano Banana 2 Lite is "the default model available at no charge". | [models help](https://support.google.com/flow/answer/16352836?hl=en), [izzedo](https://www.izzedo.chat/blog/nano-banana-price-and-limits) |
| Flow **Agent** queries | **Do not currently cost credits** | [Tools help](https://support.google.com/flow/answer/17104535?hl=en) |

**Golden rule:** "**costs are per generation, not per request**." If you set 2 outputs, you pay twice ([credits help](https://support.google.com/flow/answer/16526234?hl=en)).

### 8.3 Contradictions in the credit numbers you will encounter
- **PCMag (May 2026 launch) and note.com list Omni Flash at 15/20/25/30 credits and edits at 40.** Google's current credit help page says **7/10/12/15** at 720p and **4/5/6/7** at 360p. Google's page is later and is the one linked from the product → **use Google's numbers**, and treat any guide quoting 15–30 as pre-launch pricing.
- **Third-party API wrappers list the Omni video-edit at 20 credits (720p) / 10 (360p)** ([useapi](https://useapi.net/docs/api-google-flow-v1/post-google-flow-videos)), while Google's help page says **40** for editing uploaded & generated video. These may be different operations (reference-video-to-video generation vs. the UI's Edit flow) — **do not assume they're the same price**. **[unresolved]**

### 8.4 Which model when
| Situation | Use | Why |
|---|---|---|
| Exploring composition, timing, or a hook | **Omni 360p** (4–7 cr) | Roughly one-third the cost and up to 60% faster; upscalable to 720p free on Pro/Ultra ([Android Authority](https://www.androidauthority.com/google-flow-gemini-omni-1-1-flash-video-update-3704288/)) |
| Product/character must hold identity | **Veo 3.1 Lite** or **Omni Flash** with Ingredients/Characters | Quality **cannot** use ingredients ([models help](https://support.google.com/flow/answer/16352836?hl=en)) |
| Need a 10s single shot | **Omni Flash** | Veo tops out at 8s ([models help](https://support.google.com/flow/answer/16352836?hl=en)) |
| Need to edit existing footage (yours or generated) | **Omni Flash** (40 cr/edit) | Only model with v2v ([models help](https://support.google.com/flow/answer/16352836?hl=en)) |
| Need to extend an 8s shot | Generate on **Veo 3.1 Lite** from the start | Extension must run through Lite anyway ([models help](https://support.google.com/flow/answer/16352836?hl=en)) |
| Final hero shot for a client | **Veo 3.1 Quality** once (100 cr) | Quality-only, text+frames only, no ingredients |
| Stills, thumbnails, hook frames, ad matrix variants | **Nano Banana Lite → 2.1 → Pro** | Draft on Lite, promote winners to Pro for typography/detail ([bananabanana.pro](https://bananabanana.pro/prompts/product-photography)) **[community]** |

### 8.5 Credit-hygiene rules
1. **Check the prompt-box settings before every run.** Google says so explicitly, because model resolution and costs change ([models help](https://support.google.com/flow/answer/16352836?hl=en)).
2. **Set outputs to 1x while iterating.** 2x doubles the bill for the same prompt ([credits help](https://support.google.com/flow/answer/16526234?hl=en)).
3. **Draft at 360p, commit at 720p, upscale to 1080p (free).** Reserve 4K (50 cr, Ultra) for delivery masters.
4. **Turn Agent "Confirm before generating" to Always** ([Agent help](https://support.google.com/flow/answer/17093911?hl=en)).
5. **Never loop Retry on a failure** — failed generations may still consume credits and retries compound rate limits ([credits/rate-limit behavior](https://support.google.com/flow/answer/16353333?hl=en); [community: gflow-cli notes that in-flight requests may still consume credits](https://github.com/Desmondzwc/Google-Flow-Video/blob/develop/docs/USER_GUIDE.md)).
6. **Do the math per deliverable, not per clip.** A 30s vertical ad = 4 shots × (1 draft + 2 attempts) ≈ 12 Omni 360p generations ≈ **50–84 credits**, plus 4 final 720p renders ≈ **28–48 credits**, plus an edit or two at 40. That's roughly **120–180 credits for one finished 30s ad** before revisions — about 12–18% of a Pro plan's monthly 1,000 **[my arithmetic from Google's published per-generation costs; attempt counts from community reporting]**.
7. **Use the free tier's 50/day for discovery**, not production. Community reviews stress that a no-subscription account is capped at 720p downloads with 1080p/4K behind "Upgrade" ([AI Alleyway](https://aialleyway.com/google-flow-free/)) **[community]**.
8. **Track spend in the profile menu** — there is no balance API for automation **[community]**; if you automate, scrape the badge and abort the batch below a threshold.
9. **Ultra halves Veo video generation cost** (Lite 10→5, Fast 20→10) but **does not** discount Veo Quality (100 for everyone) or Omni Flash. If your workload is Quality-heavy, the tier barely matters ([Saascrmreview](https://saascrmreview.com/google-flow-pricing/)) **[community]**.
10. **Google Takeout is your archive** — it captures prompts, models, characters, scenes and edit history, not just renders ([Saascrmreview](https://saascrmreview.com/google-flow-review/)) **[community]**.

---

## 9. Appendix — automation-relevant details (browser MCP)

These are the points that matter specifically because you drive Flow through a browser.

- **Use a persistent, real browser profile, not incognito.** Community consensus across the Gemini help forum and automation guides is that letting Google cookies persist builds a "trust score" that reduces unusual-activity flags, and that incognito/proxy patterns *increase* flags ([Gemini help thread](https://support.google.com/gemini/thread/435902768/we-noticed-some-unusual-activity-connection-based-rate-limiting?hl=en)) **[community]**. Google's own help says to **disable VPNs or proxies** when you see the message ([get started](https://support.google.com/flow/answer/16353333?hl=en)).
- **Pace it.** Community automation guides recommend **2–3 concurrent prompts at peak** and **random delays of 30s or more** ([veo-automation-user-guide](https://github.com/trgkyle/veo-automation-user-guide)) **[community]**. Google confirms limits tighten "after you've made a large number of generations in a day" ([get started](https://support.google.com/flow/answer/16353333?hl=en)).
- **Escalation ladder on "unusual activity":** wait 2 minutes → reload the tab → sign out and back in → fully restart the browser → clear the site's cookies/cache → new project → new browser profile ([get started](https://support.google.com/flow/answer/16353333?hl=en), [r/Bard thread](https://www.reddit.com/r/Bard/comments/1ts7but/flow_rate_limits_error_messages/), [ApiPass guide](https://apipass.dev/blogs/google-flow-errors-troubleshooting-guide)) **[community]**.
- **One Google account per browser profile.** Multiple simultaneous Google accounts in one browser cause session conflicts **[community: ApiPass]**.
- **Captchas will appear and you must solve them by hand.** Third-party drivers state this explicitly as intentional anti-bot behavior ([gflow-cli](https://github.com/Desmondzwc/Google-Flow-Video/blob/develop/docs/USER_GUIDE.md)) **[community]**. Budget for a human-in-the-loop step; don't build an unattended pipeline on the assumption of zero captchas.
- **`@`-mentions resolve project-scoped.** A character/asset mention must exist inside the project you're working in, or it fails **[community: [gflow-cli](https://github.com/Desmondzwc/Google-Flow-Video/blob/develop/docs/USER_GUIDE.md)]**. Keep all assets for a sequence in one project.
- **Stable UI anchors to target:** the prompt box model picker, the `+ Add start frame` / `+ Add end frame` slots, `More → Add to Scene`, `Extend` / `Insert` / `Remove` at the bottom of a selected clip, `Save frame` on hover, the **History** panel, `More → Download`, `More → Publish to YouTube`, and the credit badge under the profile menu ([create videos](https://support.google.com/flow/answer/16353334?hl=en), [edit videos](https://support.google.com/flow/answer/16935718?hl=en), [projects/assets](https://support.google.com/flow/answer/16935308)).
- **Useful project settings toggles for automation:** *Clear prompt on submit*, *Return silent videos* (all video generations silent), *Show tile details* (shows asset type & prompt on tiles), grid/batch view ([projects/assets help](https://support.google.com/flow/answer/16935308)). These change what your scraper sees.
- **Existing automation prior art worth reading before you build:** [useapi.net Google Flow API](https://github.com/useapi/google-flow-api) (drives your own subscription through a REST layer), [gflow-cli](https://github.com/Desmondzwc/Google-Flow-Video) (Playwright + structured logs, documents endpoint names and error classes), [Google-Flow-Video](https://github.com/Desmondzwc/Google-Flow-Video) docs on `@Name` mentions.

---

## 10. Source index

**Google (authoritative for this date)**
- Models & supported features — https://support.google.com/flow/answer/16352836?hl=en
- Manage credits — https://support.google.com/flow/answer/16526234?hl=en
- Get started / eligibility / rate limits / watermark — https://support.google.com/flow/answer/16353333?hl=en
- Create videos (frames, ingredients, characters, voices, best practices) — https://support.google.com/flow/answer/16353334?hl=en
- Create & edit images — https://support.google.com/flow/answer/16729550?hl=en
- Projects, assets, collections, characters, download, YouTube upload — https://support.google.com/flow/answer/16935308
- Edit videos & build scenes (v2v, insert, remove, extend, scenebuilder, frames) — https://support.google.com/flow/answer/16935718?hl=en
- Google Flow Agent — https://support.google.com/flow/answer/17093911?hl=en
- Create & manage Tools — https://support.google.com/flow/answer/17104535?hl=en
- Avatars — https://support.google.com/flow/answer/17102997?hl=en
- Where you can use Google Flow (country list) — https://support.google.com/flow/answer/16353544?hl=en
- 5 tips for getting started with Flow (flow tips; Veo 3 era, partly stale) — https://blog.google/innovation-and-ai/products/flow-video-tips/
- Introducing Veo 3.1 and advanced capabilities in Flow (Insert/Remove origin) — https://blog.google/innovation-and-ai/products/veo-updates-flow/
- New ways to create and refine content in Flow (Feb 2026: lasso, doodle, camera orchestration) — https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates-february-2026/
- 4 ways to refine your content in Flow (Nano Banana Pro, insert/remove, object removal experimental) — https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-refine-videos/
- Introducing Gemini Omni for Google Flow and Flow Music (May 19, 2026) — https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/
- Google Flow brings new creative control features (Omni 1.1, start/end frames, 1080p/4K, 360p draft) — https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/
- 100 things we announced at I/O 2026 — https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/
- Ultimate prompting guide for Veo 3.1 — https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
- Ultimate prompting guide for Nano Banana — https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana
- 7 tips to get the most out of Nano Banana Pro — https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/
- Gemini Omni Flash API docs (editing patterns, extension, "Keep everything else the same") — https://ai.google.dev/gemini-api/docs/omni
- Gemini image generation docs (photos, templates) — https://ai.google.dev/gemini-api/docs/image-generation
- YouTube AI disclosure — https://support.google.com/youtube/answer/14328491 ; https://blog.youtube/news-and-events/improving-ai-labels-viewers-creators/ ; https://support.google.com/youtube/answer/10008196
- Google One AI plans — https://one.google.com/about/google-ai-plans/
- flow.google.com product page — https://flow.google.com/

**Creator / community (reported behavior — verify before relying on it)**
- PCMag hands-on — https://www.pcmag.com/how-to/can-google-flow-turn-your-prompts-into-movie-magic-i-had-to-find-out
- Saascrmreview Flow review (capability matrix, credit contradictions) — https://saascrmreview.com/google-flow-review/
- Magichour Flow pricing — https://magichour.ai/blog/google-flow
- lazykiwi Flow Veo 3.1 tutorial — https://lazykiwi.ai/blog/google-flow-veo-tutorial
- AI Alleyway free-tier test — https://aialleyway.com/google-flow-free/
- veovault full walkthrough — https://www.veovault.com/blog/how-to-use-google-flow
- FlowTool Scenebuilder & storyboard guide — https://flowtool.app/tutorials/google-flow-scenebuilder-storyboard
- aivideopicks review (extension degradation, audio limits) — https://aivideopicks.com/posts/google-flow-review-2026.html
- theplanettools Flow review — https://theplanettools.ai/tools/google-flow
- hantsing4 Extend deep dive — https://hantsing4.com/google-flow-extend-feature-longer-videos/
- XenoSpectrum on Omni 1.1 (360p math, upscale-vs-native) — https://xenospectrum.com/en/google-gemini-omni-flash/
- Android Authority on Omni 1.1 — https://www.androidauthority.com/google-flow-gemini-omni-1-1-flash-video-update-3704288/
- omnirender Omni editing guide — https://omnirender.ai/blog/how-to-use-gemini-omni-flash
- bananabanana.pro product photography — https://bananabanana.pro/blog/nano-banana-pro-product-photography ; prompts — https://bananabanana.pro/prompts/product-photography
- 8frame Nano Banana Pro product prompts — https://www.8frame.co/blog/nano-banana-pro-prompts-for-product-photography ; Veo prompt guide — https://www.8frame.co/blog/veo-3-prompt-guide
- nanobananao e-commerce lifestyle guide — https://nanobananao.com/blog/nano-banana-pro-ecommerce-lifestyle-product-photos/ ; prompt guide — https://nanobananao.com/prompt-guide/
- eachlabs Nano Banana 2.1 ad-brief review — https://www.eachlabs.ai/blog/nano-banana-2-1-review-tested-prompts
- fal.ai How to use Nano Banana 2.1 — https://fal.ai/learn/tools/how-to-use-nano-banana-2-1
- izzedo Nano Banana price & limits — https://www.izzedo.chat/blog/nano-banana-price-and-limits
- AdGenZ Reels ads playbook 2026 — https://www.adgenz.ai/blog/instagram-reels-ads-creative-playbook-2026
- Digital Applied Reels ads strategy 2026 — https://www.digitalapplied.com/blog/instagram-reels-ads-2026-creative-strategy-guide
- zsky.ai free AI ads — https://zsky.ai/blog/how-to-make-free-ai-ads
- asfarkhanak AI UGC with ChatGPT + Flow — https://asfarkhanak.com/how-to-create-ai-ugc-videos-chatgpt-flow
- vidau AI social video guide — https://www.vidau.ai/create-ai-generated-videos/
- useapi Google Flow REST docs — https://useapi.net/docs/articles/google-flow-images-bash ; https://useapi.net/docs/api-google-flow-v1/post-google-flow-videos ; https://useapi.net/docs/api-google-flow-v1/post-google-flow-videos-extend ; https://useapi.net/docs/articles/google-flow-nano-banana-compare
- gflow-cli user guide — https://github.com/Desmondzwc/Google-Flow-Video/blob/develop/docs/USER_GUIDE.md
- veo-automation-user-guide (rate-limit tactics) — https://github.com/trgkyle/veo-automation-user-guide
- ApiPass Flow errors troubleshooting — https://apipass.dev/blogs/google-flow-errors-troubleshooting-guide
- r/GeminiAI "unusual activity" thread — https://www.reddit.com/r/GeminiAI/comments/1ulboax/google_flow_unusual_activity_detected_error_on/
- r/GeminiAI content-filter thread — https://www.reddit.com/r/GeminiAI/comments/1t2jxkz/why_google_flow_is_just_not_worth_it_anymore/
- r/Bard rate-limit thread — https://www.reddit.com/r/Bard/comments/1ts7but/flow_rate_limits_error_messages/
- Google Gemini help forum rate-limit answers — https://support.google.com/gemini/thread/436872483 ; https://support.google.com/gemini/thread/435902768
- Flow character-consistency tutorials — https://www.youtube.com/watch?v=G2h6d9Y60FE ; https://www.youtube.com/watch?v=_rQvE6wWN0E ; https://www.youtube.com/watch?v=I8VQPHUTbzU
- Google Flow on X, character-consistency post — https://x.com/FlowbyGoogle/status/2085823649253327149

---

## 11. Open questions / known gaps

1. **Does the free daily 50-credit allowance cover Omni Flash?** Google's models page says "all users can access Gemini Omni models" and PCMag used Omni on a free account, but multiple community guides insist the free credits are Veo-only and Omni is paid-plan-only. **Unresolved.**
2. **What does an image generation actually cost in credits?** Google publishes no per-image credit cost and no formula. Community sources claim images are effectively free, others say Pro images consume credits. **Unresolved.**
3. **Is the Omni video-edit 40 credits or 20?** Google's help page says 40 for edits to uploaded/generated video; the third-party API wrapper prices its reference-video-to-video path at 20 (720p) / 10 (360p). Possibly different operations, possibly stale. **Unresolved.**
4. **Does `Jump To` still exist?** Google's own Flow tips page describes it but dated it to Veo 2. I found no current help-center article for it. **[unverified]**
5. **Exact extension ceiling and quality curve.** Community figures (~7s/pass, ~148s max, degradation after 3–5 hops) come from review sites, not Google. Google documents only "up to 60s upload / 10s edits / 30s trim" and API extension context of "last 10s". **Approximate at best.**
6. **Whether Omni 360p → 720p zero-credit upscale applies on every plan.** Google's models page states it for **Pro and Ultra**. Free/Plus behavior is unstated.
