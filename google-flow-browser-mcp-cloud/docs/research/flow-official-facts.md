# Google Flow — official facts, hard limits, and UI labels

**Compiled:** 2026-10-17 (UTC). Product: Google Flow, `flow.google.com` (canonical marketing URL) / `labs.google/fx/tools/flow` (the URL Google's own docs still link to). Help-center IDs below are current as of this read.

**How to read this file.** Everything is cited inline. A claim is *authoritative* only if it comes from `support.google.com/flow/*`, `blog.google`, `labs.google`, or `policies.google.com`. Anything from a third-party API wrapper, MCP server, or guide is labelled **[third-party]** with the source. Anything I could not confirm on Google's own domain is labelled **[unverified]** and the source is named.

**Method caveat.** The `google_flow` browser MCP was **not connected** at research time (`flow_status` → `browserConnected: false`, `flowAccountCheck` not possible), so I could **not** capture live DOM labels. I also could not spend money/credits. Every UI label quoted below is copied from Google's help center, which documents the product's own on-screen strings (e.g. `+ Add start frame`, `Add to Scene`). A live DOM pass is still owed.

---

## 1. Model matrix

Google Flow's own model page: "Google Flow provides a range of features powered by various Veo models, in addition to Gemini Omni (available in standard 720p and draft 360p) and Gemini. Different models support different features." — [Models & supported features](https://support.google.com/flow/answer/16352836?hl=en)

### 1a. Video models

| Model (help-center name) | T2V | Frames: first | Frames: first+last | Ingredients/refs | Video-to-video edit | Extend |
|---|---|---|---|---|---|---|
| **Veo 3.1 - Lite** | ✓ | ✓ | ✓ | ✓ (8s only) | ✗ | ✓ (8s only) |
| **Veo 3.1 - Fast** | ✓ | ✓ | ✓ | ✓ (8s only) | ✗ | ✗ |
| **Veo 3.1 - Quality** | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Veo 3.1 - Lite (Lower Priority)** | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Gemini Omni Flash 1.1** (UI label `Omni 1.1 Flash`) | ✓ | ✓ | ✓ | ✓ | ✓ (up to 10s) | **"Features coming soon"** |

Source for every row: [Models & supported features](https://support.google.com/flow/answer/16352836?hl=en). Additional constraints from the same page:

- Durations — Veo 3.1 (all variants): **4s, 6s, 8s**. Gemini Omni Flash 1.1: **4s, 6s, 8s, 10s**. Both "aspect ratios" for all models (i.e. the two the picker offers: 16:9 landscape and 9:16 portrait).
- "Gemini Omni Flash 1.1 → Video-to-video editing: Both aspect ratios, Up to 10s video length."
- "All users can access Gemini Omni models." Omni-exclusive features: 360p draft at ~half credit cost, 10s clips, start & end frames, editing uploaded and generated videos, custom voices, and 360p→720p upscale.
- "Add start & end frames: Define the first and last frames of your video clip. **Important: This feature is currently only available at Google Flow on web.**"
- "Upscale Omni 360p videos: Pro and Ultra subscribers can upscale their Omni 360p video generations to 720p for 0 credits."
- Veo 3.1 — "native audio" per [flow.google.com](https://flow.google.com) ("Veo delivers expanded creative controls, native audio, and quality videos"). Audio is generated with video; see §7/§9 for audio-failure refunds and "Return silent videos".
- Omni adds voice references and custom voices ([Create videos](https://support.google.com/flow/answer/16353334?hl=en)).

**Conflict inside Google's own docs:** the model page lists Veo 3.1 Fast and Quality as supporting "4s, 6s, 8s video lengths", while the credits table says **Veo 3.1 - Quality: "8s videos only"** ([credits](https://support.google.com/flow/answer/16526234?hl=en)). Quote both; trust the credits table for Quality length.

**Additional Veo durations claimed by a third party:** **[third-party]** [useapi.net](https://useapi.net/docs/api-google-flow-v1/post-google-flow-videos) states Veo T2V/I2V supports `4, 6, 8 (default) — 4/6 are Ultra-only` and that Veo also accepts `1:1, 4:3, 3:4` while Omni 1.1 Flash does not. This **contradicts** the help center's "Both aspect ratios" and its listing of 4s/6s for all tiers. Not confirmed on Google's domain → treat the Ultra-only claim and the extra ratios as **[unverified]**.

**Resolution.** Help center: Omni is "available in standard 720p and draft 360p". Veo clips generate at 720p (upscalable, §7/§8). **[third-party]** useapi.net's `resolution` field accepts only `360p`/`720p` and rejects 360p on Veo models.

### 1b. Image models

Official, verbatim ([Models page](https://support.google.com/flow/answer/16352836?hl=en)):

1. **Nano Banana Pro** — "advanced image model built for complex designs, highly accurate details, and professional-grade control. It is the default model for Google AI Ultra subscribers."
2. **Nano Banana 2 Lite** — "highly efficient model for fast, high-quality image generation and editing. It is the default model available at no charge."
3. **Nano Banana 2.1** — "standard model for fast, high-quality image generation and editing."

Default image model in the prompt box: "By default, Google Flow sets the model to **Nano Banana Pro**" ([Create videos](https://support.google.com/flow/answer/16353334?hl=en)) — note this contradicts the model page's "default at no charge = Nano Banana 2 Lite" and the **Nano Banana 2 Lite** being the "default model". Quote both; the in-product default is model-page/third-party-dependent.

**Naming drift [third-party]:** useapi.net calls the middle model `nano-banana-2` / "Nano Banana 2" (marketing) and says "`nano-banana-2-lite` — its default since July 2026"; gflow-cli says "Nano Banana 2.1 (`nano2`, which replaced Nano Banana 2 there)". Google's help center consistently says **Nano Banana 2.1**. Image aspect ratios [third-party]: `16:9, 4:3, 1:1, 3:4, 9:16` (+`auto` in image-to-image).

---

## 2. Extend

**Official** ([Edit videos & build scenes](https://support.google.com/flow/answer/16935718?hl=en), [models page](https://support.google.com/flow/answer/16352836?hl=en)):

- Trigger: open a project → click the clip → at the bottom click **Extend** → describe how the action continues → **Generate**.
- Hard gate: "**Important:** You can currently only extend Veo generated videos."
- Which model runs it: "Extend videos … 8s videos only … Veo 3.1 Lite, Fast, and Quality videos only. **Tip:** All Veo 3.1 8s videos can be extended, **but you must use Veo 3.1 Lite to extend them.**" So the *source* clip may come from Lite, Fast or Quality; the *extend generation* is always a Veo 3.1 Lite generation.
- Clip length: **8s clips only**. Neither the help center nor the models page states a maximum number of chained extends.
- Restriction: "You can't apply other edit modes such as insert, remove, and camera to extended video clips."
- **Omni/`Gemini Omni Flash` extend has NOT shipped.** The Omni 1.1 Flash feature list places "Extend videos" under **"Features coming soon"**, and the extend procedure is restricted to "Veo generated videos".
- Cost = the Veo 3.1 Lite row: **10 credits** (non-Ultra) / **5 credits** (Ultra) / **0** (Lite Lower Priority, Ultra + family-plan managers only). Credited per *generation*.

**Google's internal contradiction:** the credits table lists "Extend" as a generation type for Veo 3.1 **Fast** and **Quality** as well ([credits](https://support.google.com/flow/answer/16526234?hl=en)), even though the models page marks Extend unsupported on both. The models-page rule ("you must use Veo 3.1 Lite to extend them") is the specific one — treat the credits table's Fast/Quality "Extend" rows as stale/misleading.

**[third-party]** useapi.net's `POST /videos/extend`: "Creates an additional **8-second segment** that continues from the last **~1 second** of the source video"; "Video extension requires a paid Google AI subscription with remaining credits"; the extended clip inherits the source aspect ratio; extended clips have "**~1 second overlap** with the source video's last frame. Use `trimStart` … to remove overlap when combining clips"; the input may be "a previously generated **or extended** video" (⇒ **chaining is possible**); "The source video must be Veo-generated — `omni-flash` videos cannot be extended here. To extend an Omni clip, chain V2V edits with `referenceVideo_1` … and join them with concatenate." Model options for extend: `veo-3.1-fast` (default), `veo-3.1-quality`, `veo-3.1-lite`, `veo-3.1-lite-low-priority`. **[unverified]** where it conflicts with the help center (Google says Lite only).

---

## 3. Frames-to-Video

**Official** ([Create videos → "Add start & end frames to your prompt"](https://support.google.com/flow/answer/16353334?hl=en)):

1. In the prompt box, click the model name.
2. Click **Video** → **Frames**.
3. "**To add your start frame:** Drag an image to '+ Add start frame.'" / "**To add your end frame:** Drag an image to '+ Add end frame.'"
4. Describe the action/transition between the frames in the text prompt.
5. Select video preferences → **Generate**.

- Inputs: **start frame alone, or start + end frame.** End-frame-only is **not** supported **[third-party]** ([useapi.net](https://useapi.net/docs/api-google-flow-v1/post-google-flow-videos): "End-frame-only is not supported").
- Supported models (official): every Veo 3.1 variant supports "Frames to Video: First" **and** "Frames to Video: First and last"; Gemini Omni Flash 1.1 supports both. Availability caveat on the page: "Product feature availability may differ by country/region of use. Certain image types may not be supported."
- Durations: Veo 3.1 → 4s/6s/8s. Omni 1.1 Flash → 4s/6s/8s/10s.
- Ratios: "Both aspect ratios" (official).
- Cost: no separate frames price — you pay the selected model × duration generation price (§8). **[third-party]** Omni frames mode is frames-only: "the two frames are the only accepted input, so `referenceImage_*`, `character_*` and `referenceAudio_*` are rejected alongside them."
- Frame sources: upload an image, generate one, or **save a frame from an existing video** ("Save frame" in the video's frame scrubber, [Edit videos](https://support.google.com/flow/answer/16935718?hl=en)).

---

## 4. Scene / clip assembly (Scenebuilder)

**Official** ([Edit videos & build scenes](https://support.google.com/flow/answer/16935718?hl=en)): the page states "you can also build **one scene per project** out of a sequence of video clips in Flow's Scenebuilder." Documented Scenebuilder operations, verbatim:

- "Arrange multiple clips in a sequence."
- "Rearrange the order of your clips."
- "Trim the beginning and end of each clip with the handles."
- "Preview the whole sequence."
- "Download a scene."

Exact UI path to add a clip: hover a clip → **More** → **Add to Scene**. To reorder: click a clip and "Drag your clips in the order you want."

**Export / download:** Scenebuilder exports the sequence as **one file** — [Manage projects, assets & collections](https://support.google.com/flow/answer/16935308?hl=en): "Currently, direct YouTube upload is only supported for individual video clips. To upload a full sequence from Scenebuilder, you must download the sequence as a single file, and then upload it via YouTube Studio." Project-level and collection-level downloads also exist (**More → Download project**; hover a collection → **Download**).

**Clip-count and total-length limits are NOT published by Google** → **[unverified]**. No help-center page states a maximum number of clips per scene or a max sequence duration. The nearest hard number is **[third-party]** useapi.net's `POST /videos/concatenate`: "Combines **2-10 videos** into a single video file", all clips must share an aspect ratio and Google Flow account, each clip contributes its full length (8s standard Veo, 4/6s short Veo, up to 10s per Omni edit), and per-clip `trimStart`/`trimEnd` are `0-10` seconds ("trimStart plus trimEnd must be less than the clip's own length, otherwise the request returns 400"). Do **not** present the 10-clip figure as a Google limit — it is the limit of one third-party exporter.

---

## 5. Ingredients & references

**Characters** ([Manage projects, assets & collections](https://support.google.com/flow/answer/16935308?hl=en), [Create videos](https://support.google.com/flow/answer/16353334?hl=en)):

- Created from the left rail: **Characters** → **New Character** → describe → "Upload or generate **1 or 2 images** that show the visual appearance of your character. **A character must contain at least one image to be used.**" Name it, attach a voice ("Select a voice" → preset or custom), **Add to Character** → **Done**.
- Referenced in a prompt by typing `@` + character name; `@me` inserts your avatar.

**Ingredients (visual references):**

- Prompt box → model name → **Video** → **Ingredients**; add by dragging media in from your device/project, typing `@` to search uploaded assets by name, or **Add** under the prompt. Example prompt style used in the docs: "The woman, whose torso is the lava lamp, walks down the foggy street."
- Official tip: "For the best results, provide subject or product references on a plain or segmented background."
- **Max counts per generation are NOT published on Google's domain → [unverified].** Google only says Ingredients is supported on Veo 3.1 Lite, Fast and Gemini Omni Flash (8s videos only on Veo), and unsupported on Veo 3.1 Quality. The counts come from **[third-party]** useapi.net: image refs `referenceImage_1..7` — "up to **3** (slots `_1..3`; **not on `veo-3.1-quality`**)" on Veo and "up to **7** (R2V) / up to **5** (V2V edit)" on Omni; characters `character_1..7` — "**3 total** with `referenceImage_*`" on Veo (fast/lite/lite-low-priority only, 8s only) and "**7 total** (R2V)" on Omni. Their characters endpoint: 1–2 images per character, `displayName` 1–200 chars, `personalityNotes` ≤ 2000 chars.

**Voice references / custom voices** (official, Omni only): select model **Omni Flash** → **Video** → **Ingredients** → **Add → Voices**; hover a voice for a 10-second sample preview; reference it in-prompt with `@Voice` (e.g. `@Voice: Andrew`). **Create New Voice** = pick a Base Voice, name it, describe the performance, optional 8-second sample, **Sync** → **Save New Voice**. Hard rule: "You can add voice references only to video generations that use ingredients. For all other kinds of generations, you'll get an error." **[third-party]** useapi.net counts: 1 voice on Veo, up to 5 on Omni R2V / 3 on Omni V2V edit.

**Likeness / rights guardrails (official):**

- Avatars: "For safety and policy reasons, your avatar data **cannot be shared** via Google Flow Tools or public project links. Google Flow also runs strict recitation and safety checks on all generated likeness content." ([Create & use your avatar](https://support.google.com/flow/answer/17102997?hl=en))
- Flow "features precautions to protect minors and uploaded photos of people" ([Get started](https://support.google.com/flow/answer/16353333?hl=en)).
- Region policy: "Google Flow does **not** support these features in any region: Editing uploaded videos of **identifiable minors**. Generating videos of **prominent people**." ([Where you can use Flow](https://support.google.com/flow/answer/16353544?hl=en))

---

## 6. Upload / ingredient rules we must respect

**Official — the only fully-documented upload limit is for video-to-video editing** ([Edit videos](https://support.google.com/flow/answer/16935718?hl=en)):

- "Upload, drag, or select a video up to **60 seconds long and 1 GB** in one of these supported formats: **.mov, .mp4, .avi, .wmv**."
- "When you upload a video that's longer than **30 seconds**, you must trim it down to **30 seconds** in Google Flow."
- "Google Flow will automatically process, format, and run safety checks on your video."
- Then: "In the trimming window, select up to a **10-second segment** of your video" and prompt an edit. "You can continue for up to **3 conversational turns** without losing the context of your previous edits."

**Image file types and image size limits are NOT published on Google's domain → [unverified].** The best available numbers are **[third-party]** useapi.net's upload endpoint: `image/png`, `image/jpeg`, `image/webp` at **20 MB** max each; `video/mp4` at **100 MB** max. Its error surface confirms the image cap: `{"error":"File size (25165824) is over 20971520 bytes"}`. A separate third-party CLI (gflow-cli / Google-Flow-Video) accepts PNG/JPEG/WebP/GIF for uploads. Verify against the live picker before hard-coding.

**The "rights to use this content" attestation — Google's own wording** ([Stay up-to-date with changes in Flow](https://support.google.com/flow/answer/16893714?hl=en)):

> "**Reminder:** By using this feature, you confirm that you have the necessary rights to any content that you upload. Do not generate content that infringes on others' intellectual property or privacy rights."

That is an official Google Flow help-center statement, but note it appears in the **Nov 11, 2025 / July 7, 2025 release-note entries** attached to the "make your images talk" feature — it is the *policy* text, not a copy of the current modal. **[third-party]** evidence that the flow still shows a blocking dialog at upload time: the FlowPilot MCP exposes a config key `acceptUploadRights` (default `true`) documented as "**Auto-accept rights dialog for uploads**" ([FlowPilot on Glama](https://glama.ai/mcp/servers/Rocco3D/FlowPilot)). The exact modal string ("I confirm I have the rights to use this content" or similar) is **not verified** — capture it live.

---

## 7. Downloads & exports

**Video** ([Manage projects, assets & collections](https://support.google.com/flow/answer/16935308?hl=en)): hover the asset → **More → Download** → "Select the file type you want to download. **To download a GIF, click 270p.**" (i.e. the download dialog offers a **GIF at 270p** and the video file itself).

**Upscaling before download** — official credits table ([credits](https://support.google.com/flow/answer/16526234?hl=en)):

- **1080p upscaling** (all models): "Plus, Pro, and Ultra subscribers: **0**" / "Non-subscribers: **Not available**".
- **4K upscaling** (all models): "Non-Ultra subscribers: Not available" / "Ultra subscribers: **50**" credits.

Official blog ([Google Flow brings new creative control features](https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/), Aug 27, 2026): "Export crisp video in **1080p or 4K**, ready for high-end digital, social, or broadcast editing workflows" and "Draft videos quickly and upscale for quality. Test out concepts and compositions at a faster, lower-credit **360p** resolution … Once you have a clip you're happy with, you can then **download it in 720p**."

**[third-party]** useapi.net `POST /videos/upscale`: targets `720p`, `1080p`, `4K`; "Video upscaling requires a paid Google AI subscription. **Free accounts cannot upscale at any resolution.** … 4K requires a Google AI Ultra subscription. Other paid accounts can use 720p and 1080p."; "**720p and 1080p upscaling are free.** 4K upscaling currently costs **50 credits**."; "Upscaling the same video twice returns a **cached** result (no additional credits consumed)." Note Google's own table lists only 1080p and 4K upscaling rows — the free 720p upscale of a 360p Omni clip is documented in the models page ("Pro and Ultra subscribers can upscale their Omni 360p video generations to 720p for 0 credits") but the `720p` upscale option itself is **[unverified]**.

**Images [third-party]:** `POST /images/upscale` with `2k` (default; any plan) or `4k` ("requires a paid Google account"). Not listed on the official credits table.

**Bulk export:** whole-project download (**More → Download project**), whole-collection download, and full Takeout export of media, prompts, settings, project/collection structure, characters, scenes and edit stacks ([Download your Flow data](https://support.google.com/flow/answer/17571126?hl=en)).

**Watermarking** ([Get started](https://support.google.com/flow/answer/16353333?hl=en), [Manage assets](https://support.google.com/flow/answer/16935308?hl=en)):

- "All outputs generated in Google Flow using **Veo, Omni, or Nano Banana include invisible SynthID watermarks**." — applies to **all tiers**, images and video.
- "a **visible** watermark can be added … You can control this with the '**Visible watermarking**' toggle in the drop-down menu under your profile picture. A visible watermark will be **applied automatically if you reside in India, South Korea, or Vietnam**."
- SynthID "should not be tampered with or removed."
- No tier-based watermark difference is documented beyond the mandatory IN/KR/VN visible watermark.

---

## 8. Credits & tiers

**Allowances (official, [credits](https://support.google.com/flow/answer/16526234?hl=en)):** "With or without a subscription, you receive **50 Google Flow credits per day**."

| Plan | Extra Flow credits |
|---|---|
| No subscription | 50 per day (that's all) |
| Google AI **Plus** | +200 / month |
| Google AI **Pro** | +1,000 / month |
| Google AI **Ultra $100** | +10,000 / month |
| Google AI **Ultra $200** | +25,000 / month |

- Refresh: "Your daily credit refresh is triggered by your **first generation**" (e.g. first used Aug 12 → next 50 on Aug 13). "Unused daily credits **don't roll over**." Monthly subscription credits "refresh at the start of your billing cycle" and don't roll over either.
- Non-subscriber throttle: "During peak hours, roughly **2 PM to 5 PM UTC**, you may not be able to generate videos without a subscription. You can still generate images and use the Google Flow Agent."
- Family sharing: "You can share AI credits with your Google One family group, but only the plan manager can purchase more AI credits or change the subscription."
- Top-ups: purchasable by Plus/Pro/Ultra "In supported regions (**except Japan**)". AI credits "may expire after a certain period".
- Workspace: qualifying plans (Business Starter/Standard/Plus; Enterprise Starter/Standard/Plus; G Suite Legacy Free; Education Standard/Plus; Google AI Pro for Education) get Flow "at no extra charge, along with **50 daily AI Credits**" ([Workspace admin doc](https://knowledge.workspace.google.com/admin/generative-ai/workspace-with-gemini/access-google-labs-tools-in-google-workspace)).

### Credit cost table (verbatim, [credits](https://support.google.com/flow/answer/16526234?hl=en))

| Model | Generation type(s) | Credits per generation |
|---|---|---|
| Veo 3.1 - Lite (Lower Priority) | 4s, 6s, 8s videos; Extend | Ultra subscribers & family plan managers: **0**; Ultra family members & non-Ultra: **Not available** |
| Veo 3.1 - Lite | 4s, 6s, 8s videos; Extend | non-Ultra: **10**; Ultra: **5** |
| Veo 3.1 - Fast | 4s, 6s, 8s videos; Extend | non-Ultra: **20**; Ultra: **10** |
| Veo 3.1 - Quality | 8s videos; Extend | **All users: 100** |
| Gemini Omni Flash (720p) | 4s, 6s, 8s, 10s — excludes edits | **All users:** 4s **7** · 6s **10** · 8s **12** · 10s **15** |
| Gemini Omni Flash (360p) | 4s, 6s, 8s, 10s — excludes edits | **All users:** 4s **4** · 6s **5** · 8s **6** · 10s **7** |
| Gemini Omni Flash | Edit uploaded & generated videos, all lengths and resolutions | **All users: 40** |
| All models | 1080p upscaling | Plus/Pro/Ultra: **0**; non-subscribers: **Not available** |
| All models | 4K upscaling | Ultra: **50**; non-Ultra: **Not available** |

Critical unit rule, official: "The Google Flow/AI credit costs below are **per generation, not per request**. Some product features will create multiple generations per request. For example, in Google Flow, you can make a single request that may generate **2 videos**." The page also notes: "Limits are subject to change at any time. To find the latest costs, at the top right of your prompt box, click **Settings**."

- Blocks are **invisible** to a generation: "If we detect you're trying to use a feature that is not available in your selection, we'll default you to a **compatible model**. You can check the model and related credit costs in settings before confirming."
- Failures are free: "You are not charged any credits for failed generations" — including the "Audio Generation Failed" case, where "your credits will be refunded".
- Free-tier edge: **image** generation with Nano Banana models costs **0 credits** **[third-party]** ([FlowPilot](https://glama.ai/mcp/servers/Rocco3D/FlowPilot): "image generation with Nano Banana models costs 0 credits"); Google's own credits table simply omits image rows. Google only documents Nano Banana 2 Lite as "the default model available **at no charge**". Treat "all Nano Banana image gens are free" as **[unverified]**.
- Rate limiting is real and documented: "To balance the available resources for all users and prevent abuse of our platform, we may **rate-limit** the number of generations you can make, particularly for **zero-credit models**. After you've made a large number of generations in a day, the number of generations you can make within a minute will decrease." Users see "You're requesting generations too quickly". Also: "We noticed some unusual activity" → "Disable VPNs or proxies."

### Access requirement (Google contradicts itself)

- [Get started](https://support.google.com/flow/answer/16353333?hl=en): "you must meet all of these requirements: 1. age verified, **18 years of age or older**; 2. located in one of our supported regions; 3. **be subscribed to Google AI Plus, Google AI Pro, or Google AI Ultra**."
- [Credits](https://support.google.com/flow/answer/16526234?hl=en) documents a **non-subscriber** tier in detail (50/day, peak-hour video lockout, images + Agent still available).
- [Models page](https://support.google.com/flow/answer/16352836?hl=en): "**All users can access Gemini Omni models.**"
- [flow.google.com](https://flow.google.com) itself: "Features may vary by Google AI subscription tier, platform (web vs. mobile), and region. 18+."
Take #3 as effectively stale/plan-gated rather than an absolute wall; the non-subscriber path is documented.

---

## 9. Content policy

**What Flow refuses (official):**

- "[W]e prohibit users from knowingly generating **harmful, illegal, or inappropriate** content. For example, Google Flow features precautions to protect **minors and uploaded photos of people**, and certain queries might not be generated." → the governing text is the [Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy) ([Get started](https://support.google.com/flow/answer/16353333?hl=en)).
- Unsupported **in every region**: (a) "Editing uploaded videos of **identifiable minors**"; (b) "Generating videos of **prominent people**". "Additional image and video creation features regarding identifiable minors and prominent people may vary by region." ([Where you can use Flow](https://support.google.com/flow/answer/16353544?hl=en))
- Feature blocks by region (official, same page): "**Edit uploaded videos** — not supported in: European Economic Area (EEA), Switzerland, United Kingdom." "**Use Avatars** — unavailable in: EEA, Switzerland, United Kingdom." "**Purchase AI credits** — currently unavailable in **Japan**."
- **[third-party]** error identifiers an automation must expect in `failureReasons`: `PUBLIC_ERROR_UNSAFE_GENERATION`, `PUBLIC_ERROR_PROMINENT_PEOPLE_FILTER_FAILED`, `PUBLIC_ERROR_AUDIO_FILTERED`, `PUBLIC_ERROR_MINOR`, `PUBLIC_ERROR_SEXUAL`, `PUBLIC_ERROR_DANGER_FILTER`, `PUBLIC_ERROR_IP_INPUT_IMAGE`, plus the classifier label `IP_PROHIBITED` (intellectual-property flag on an *input* image; retrying the same image won't help) and `PUBLIC_ERROR_UNUSUAL_ACTIVITY` on captcha/abuse screens ([useapi.net](https://useapi.net/docs/api-google-flow-v1/post-google-flow-videos)). "If your generation is moderated, retrying with the same prompt often succeeds on subsequent requests — moderation decisions can vary between requests."
- Diagnostics label for non-subscriber throttling is only descriptive; treat the error string set as Google's, not exhaustive.

**Canada specifically:**

- Canada **is** a supported country/territory — the region list includes "Canada" ([Where you can use Flow](https://support.google.com/flow/answer/16353544?hl=en)). Google separately lists the UI language "**français (Canada)**" among supported languages (same page), while recommending English prompts.
- **No Canada-specific content-policy exception, age rule, watermark rule, or credit restriction is listed anywhere I checked.** Canada is *not* in the EEA/Switzerland/UK feature-block group, and *not* in the Japan credit-purchase block. So a Canada-based automation inherits the **global** policy set: no prominent-people generation, no editing uploaded videos of identifiable minors, no avatar data sharing via Tools or public links, SynthID on all outputs, invisible-watermark-only unless the user is in India/South Korea/Vietnam.
- No Canada-specific data-processing legal-basis section exists — the [Manage your data](https://support.google.com/flow/answer/17025472?hl=en) page carries a UK-specific legal-bases block but **no Canadian equivalent**. Whether PIPEDA/Quebec Law 25 adds anything is **not addressed by Google Flow docs → [unverified] / out of scope of Google's own documentation**.

---

## Contradictions with our prior "known" list

| Our prior claim | Status |
|---|---|
| Veo Lite 10 / Fast 20 / Quality 100 credits | ✅ Confirmed as the **non-Ultra** prices. Add: Ultra pays 5 / 10 / 100; Veo 3.1 Lite Lower Priority is 0 but Ultra-only (and, since 2026-09-23 per **[third-party]** useapi.net, only on the Ultra $199 manager's own account, not invited family members). |
| Omni 720p ~7–15 credits by length | ✅ Confirmed exactly: 7/10/12/15 for 4/6/8/10s (360p draft: 4/5/6/7). |
| Omni video-to-video ~40 credits | ⚠️ **Conflict.** Google's credits table: "Gemini Omni Flash — Edit uploaded & generated videos of all lengths and resolutions — **All users: 40**." **[third-party]** useapi.net: "Plus / Pro / Ultra: **20 at 720p, 10 at 360p**." Trust Google (40) until a live run shows otherwise — but charge the 40 figure when budgeting. |
| 1080p upscale free for some subscribers; 4K 50 credits Ultra-only; base ~50 credits/day | ✅ All confirmed verbatim. Also: 1080p is **unavailable** to non-subscribers, and 4K is Ultra-only. "Free" means 0 credits for Plus/Pro/Ultra. |
| (implied) Veo Fast can extend | ❌ **Correct this.** Only **Veo 3.1 Lite** can *run* Extend: "All Veo 3.1 8s videos can be extended, but you must use Veo 3.1 Lite to extend them." Fast and Quality cannot run Extend. |
| Omni 1.1 Flash is the only v2v/edit model | ✅ Confirmed — "Video to Video editing" appears only under Gemini Omni Flash 1.1, and the credit row for edits exists only for Omni Flash. |
| (unstated) Omni extend availability | ❌ **Not shipped.** "Extend videos" sits under "**Features coming soon**" for Omni 1.1 Flash; the official Extend how-to says "you can currently only extend Veo generated videos." |
| (unstated) Veo Quality capabilities | Note Quality supports Frames-to-Video (first, and first+last) but **not Ingredients, not Extend, not v2v** — and the credits table caps it at **8s only**. |
| (unstated) `Nano Banana 2.1` naming | Google help center says **Nano Banana 2.1**; third-party API docs say "Nano Banana 2"; gflow-cli says "Nano Banana 2.1 (`nano2`, which replaced Nano Banana 2 there)". Match on the `Nano Banana 2.1` label in the UI. |
| (unstated) subscription is mandatory | Google's Get-started page says you must be subscribed; its credits page documents a working non-subscriber 50/day tier. Treat as tier-gated, not absolute. |

## Uncertainty register (all **[unverified]**, third-party-sourced)

1. Max reference images per generation — Veo 3 (not on Quality), Omni 7 R2V / 5 V2V edit (useapi.net).
2. Max characters per generation — 3 total with image refs on Veo; 7 total on Omni (useapi.net).
3. Max voice refs — 1 on Veo; 5 Omni R2V / 3 V2V edit (useapi.net).
4. Image upload types/sizes — PNG/JPEG/WebP ≤ 20 MB; MP4 ≤ 100 MB on upload (useapi.net). Google publishes no image size limit.
5. Scenebuilder clip count and total sequence length — no Google limit published. 2–10 clips is one third-party exporter's cap (useapi.net `concatenate`).
6. Extra video aspect ratios (1:1, 4:3, 3:4) on Veo models and "4s/6s are Ultra-only" for Veo (useapi.net) — contradicts the help center's "Both aspect ratios" and its tier-agnostic 4s/6s listing.
7. `720p` upscale being free and available as an explicit target (useapi.net); Google documents only the Omni-360p→720p promotion (Pro/Ultra, 0 credits) and the 1080p/4K rows.
8. Image upscale costs — `2k` any plan / `4k` paid (useapi.net); absent from Google's credits table.
9. All Nano Banana image generation being 0-credit (FlowPilot); Google only says Nano Banana 2 Lite is "default … at no charge".
10. The exact wording of the upload **rights dialog** in the current UI. Google's policy sentence is quoted in §6; FlowPilot's `acceptUploadRights` proves a blocking dialog exists but does not quote it. **Capture this string live.**
11. Veo 3.1 Lite Lower Priority family-plan behaviour and the 2026-09-23 change (useapi.net).

## Sources I trust most

1. **`support.google.com/flow/*`** — models & supported features ([16352836](https://support.google.com/flow/answer/16352836?hl=en)), credits ([16526234](https://support.google.com/flow/answer/16526234?hl=en)), create videos ([16353334](https://support.google.com/flow/answer/16353334?hl=en)), edit & scenes ([16935718](https://support.google.com/flow/answer/16935718?hl=en)), assets/characters/uploads ([16935308](https://support.google.com/flow/answer/16935308?hl=en)), regions & feature restrictions ([16353544](https://support.google.com/flow/answer/16353544?hl=en)), images ([16729550](https://support.google.com/flow/answer/16729550?hl=en)), data/export ([17025472](https://support.google.com/flow/answer/17025472?hl=en), [17571126](https://support.google.com/flow/answer/17571126?hl=en)), release notes ([16893714](https://support.google.com/flow/answer/16893714?hl=en)). This is the only set that reflects the shipped UI strings and prices.
2. **[blog.google](https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/)** (Aug 27, 2026 — Omni 1.1 Flash, start/end frames, 1080p/4K export, 360p→720p) and **[May 19, 2026 Flow update](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/)** (Gemini Omni Flash, Agent, Tools, mobile apps).
3. **[flow.google.com](https://flow.google.com)** landing page for the model lineup (Gemini Omni, Nano Banana, Veo 3.1) and the "Features may vary by subscription tier, platform, and region. 18+." disclaimer.
4. Third-party, used only where Google is silent and always labelled: **useapi.net** Google Flow API v1 docs (most precise credit/limit plumbing; contradicts Google on the Omni edit price and on Extend model support), **FlowPilot**, **gflow-cli**, **ParkSangGwon/google-flow-mcp**, **felipedamacenoteodoro/mcp-google-flow**.
