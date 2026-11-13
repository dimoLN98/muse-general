# Production pipeline AROUND Google Flow — social ads for Acme (Oct 2026)

**Compiled:** 2026-10-16/17. **Scope:** everything *around* Flow generation: Agent / Characters / Scenebuilder / Flow Music workflows, the local finishing stack (ffmpeg + Python), music/SFX licensing, and publishing rules for AI-made ads on Instagram + TikTok in Canada. **Builds on, and does not repeat,** `flow-creative-playbook.md` (§1, 5, 7, 9) and `flow-official-facts.md`.

> **This is research, not legal advice.** Canadian law and platform policy change monthly; have a lawyer or Ad Standards pre-clearance review anything with price claims, endorsements, or "Made in Canada" language before paid spend.

**Live-verified Acme facts that WIN over every web source below** (from the task brief): Extend is absent in the shipped UI; Frames-to-Video entry is unreachable; a scene holds one timeline per project and exports as one file; downloads offer 270p GIF / 720p / 1080p-upscaled (4K is Ultra-only; account is PRO); clip duration is set via the prompt string.

**Tags.** **[G]** = Google/Meta/TikTok/Government primary domain. **[C]** = community, vendor, law-firm or third-party summary. **[unverified]** = could not confirm; source named. **✅ TESTED** = I ran it with ffmpeg 9.0.1 (local build at `~/.config/tools/ffmpeg-9.0.1-linux-x64`) on synthetic `lavfi` clips in the scratch dir (syntax + output sanity only; real footage not tried). **⚠ UNTESTED** = written from docs. Where sources disagree the disagreement is stated, not averaged.

**Extraction caveat.** Several help-center pages (Meta Help Center, TikTok Help, Flow Agent) hide accordion content from the extractor; where I could only read a search-result snippet of a primary page I say "snippet". Nothing below is quoted from a page I could not read.

---

## 1. Flow-side production workflow

### 1.1 Project structure & naming — what is documented vs what I recommend

- **Documented [G]:** a Flow *project* holds assets, Collections, Characters, one Scene (timeline); Agent chat Sessions are *per project* ([Agent help](https://support.google.com/labs/answer/17093911)). `@`-mentions of Characters/assets only resolve inside the same project ([gflow-cli guide](https://github.com/Desmondzwc/Google-Flow-Video/blob/develop/docs/USER_GUIDE.md) **[C]**, already in playbook §9). The Agent can **rename files, group media into a new Collection, and archive unused assets** ([Agent help](https://support.google.com/labs/answer/17093911)). Whole-project and per-collection download exist ([facts §7](flow-official-facts.md)).
- **No published agency standard exists.** I found no Google or credible agency source that documents a project/naming convention for Flow ad work; every "workflow" article is a generic tutorial ([aigcdev](https://aigcdev.com/en/articles/how-to-use-google-flow-for-small-business-ads), [thriftizer](https://www.thriftizer.com/blog/google-flow-for-ecommerce)) **[C]**. What follows is **our design**, built from the documented primitives.
- **Recommended structure (our design):**
  - **One Flow project per *campaign*** (e.g. `EPS-FW26-HOODIE-DROP`), not per clip — because Characters/ingredients/`@`-mentions are project-scoped and Scenebuilder is one-timeline-per-project.
  - **Collections inside the project = stages:** `00_refs` (locked character/product/look images), `01_stills` (Nano Banana keyframes), `02_drafts_360p`, `03_keepers_720p`, `04_rejects` (archive, don't delete — History keeps prompts, [edit help](https://support.google.com/flow/answer/16935718?hl=en) **[G]**).
  - **Asset names (set by the Agent's rename, or by our MCP):** `{campaign}_{concept}_{shot}_{v##}_{model}_{len}` e.g. `FW26_oversized-walk_S02_v03_omni1.1_6s`. Reason: the filename is the only thing that survives download (Flow download gives anonymous file names; the naming must be re-applied on our disk, see §6.3).
- **Keep the prompt as data.** Flow's History panel keeps previous versions and prompts ([edit help](https://support.google.com/flow/answer/16935718?hl=en) **[G]**), but we should also persist `prompt`, `model`, `length`, `ingredients`, `credits` per asset in a sidecar JSON in the campaign folder (§6.3). Meta/Google/TikTok disclosure workflows reward a per-asset "AI inventory" ([Digital Applied](https://www.digitalapplied.com/blog/ai-content-labeling-rules-advertisers-2026-reference) **[C]**).

### 1.2 Characters, ingredients and product references

(Mechanics are in facts §5; here is the *how to run it for a clothing brand*.)

- **Character = 1 or 2 images, must have ≥1 image, optional voice** ([Manage projects help](https://support.google.com/flow/answer/16935308?hl=en) **[G]**). Google's tip: references "on a plain or segmented background" ([Create videos](https://support.google.com/flow/answer/16353334?hl=en) **[G]**). Build **one Character per recurring model** and **one ingredient image per garment colourway** (flat-lay or ghost-mannequin of the *real* sample, not an AI invention) — see the product-truth rule in §4.3.
- **Omni Flash** is the Flow model Google says "improves character consistency, meaning identity and voice are preserved across every scene" ([Google blog, May 19 2026](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/) **[G]**). Voice refs only work on ingredient-based generations ([Create videos](https://support.google.com/flow/answer/16353334?hl=en) **[G]**).
- **Commercial pattern that shows up repeatedly:** use generated video for the part of the ad that *isn't the product* (hooks, environments, B-roll) and composite/cut in *real* product footage or stills; "the product on screen is your product, pixel for pixel" ([thriftizer](https://www.thriftizer.com/blog/google-flow-for-ecommerce) **[C]**). For hoodies/tees this is the safest path for Canadian "truthful representation" (§4.3) *and* for logo/print fidelity (AI warps small type — QC item in §6.1).
- **Likeness guardrails [G]:** no prominent people; no editing identifiable minors ([Where you can use Flow](https://support.google.com/flow/answer/16353544?hl=en)); avatar data isn't shareable ([avatars help](https://support.google.com/flow/answer/17102997?hl=en)). A student "model" must be a generated Character, or a real person who signed a release — Flow's own upload text makes *you* confirm you hold the rights ([release notes](https://support.google.com/flow/answer/16893714?hl=en) **[G]**).

### 1.3 Flow Agent — what it can batch and what "Confirm before generating" means

**Documented [G]** ([Use the Google Flow Agent](https://support.google.com/labs/answer/17093911)):
- Agent is **web & PC only**; media it generates **uses Flow credits**; everything it generates is saved to the **currently open project**; **Agent queries themselves cost no credits but have a daily quota**.
- Capabilities: brainstorm/storyboard/mood boards → actionable prompts; generate images/videos and **choose the model**; **edit selected assets**; **batch generate "multiple variations of an asset at once"**; rename/Collection/archive; accept dragged media plus **multi-select** with "which media you are referring to".
- **Agent Instructions** (project-level standing rules): *Agent Instructions → Add instruction → add a reference image and your guidelines → Done* ([snippet of the same help page](https://support.google.com/flow/answer/17093911?hl=en)). A creator walkthrough says the instruction's toggle must be switched on after saving **[C]** ([heizolshao on X](https://x.com/heizolshao/article/2094323528980193551), Chinese-language guide, [unverified]).
- **Settings → "Confirm before generating": Always (default) or Never.** "Never" lets the Agent "generate media and use credits on your behalf without pausing for approval" ([playbook §7.6](flow-creative-playbook.md), quoting the Agent help). Walkthroughs recommend **Always, 9:16, one clip at a time, Omni 1.1 Flash** as the first-run settings ([Nova Autonomous, Oct 7 2026](https://www.youtube.com/watch?v=wb6vxhrXxq0) **[C]**) and demo "Generate five versions of this advertisement" as a one-line batch ([Digital Seller Academy, Jun 28 2026](https://www.youtube.com/watch?v=_A9aDnziSLM) **[C]**).

**Implications for our browser-MCP pipeline:**
1. **Credits are charged per *generation*, not per request** — a single batch request that makes 2 videos is 2 charges ([credits](https://support.google.com/flow/answer/16526234?hl=en) **[G]**). "Batch of five variations" × 8 s Omni 720p = 5 × 12 = **60 credits**; × Veo Quality = 500. Budget before approving.
2. **Keep "Confirm before generating = Always"** and make the MCP treat the Agent's confirmation prompt as a *gate that needs a cost line and a human/agent policy check*. Our prior live finding stands: clip duration is set by the prompt string, so the Agent's plan must be inspected for `Video length: N seconds`.
3. **Agent-generated media is saved to the open project** — so *open the right campaign project first*; a wrong-project run silently scatters assets.
4. **The Agent rewrites prompts** (walkthroughs: it "writes its own prompts, makes the pictures first so both clips match, and asks you before it spends a single credit" — [Nova Autonomous](https://www.youtube.com/watch?v=wb6vxhrXxq0) **[C]**). Capture the *final* prompt it ran (sidecar JSON) — you can't reproduce a keeper otherwise.
5. **Use the Agent for the cheap, credit-free parts**: brief → shot list → prompt drafts, renaming, collection hygiene. Use direct prompt-box generation for anything where exact prompt wording must be preserved.
6. **Rate limits:** zero-credit models are rate-limited and "after a large number of generations in a day, the number you can make within a minute will decrease" ([credits](https://support.google.com/flow/answer/16526234?hl=en) **[G]**). Don't queue >2–3 in parallel (playbook §9).

### 1.4 "How many takes per keeper?" — no authoritative number; budget model

- I found **no Google figure and no credible agency-published keeper ratio**. Third-party posts give anecdotes only ([funiqskills](https://funiqskills.com/how-to-use-google-flow/) says "spend 80% of your time in storyboard mode"; [ugcgen](https://ugcgen.ai/blog/google-flow-pricing-credits-cost) says charge doesn't scale with length so "never generate short") **[C]**. Treat any "1 in 4" figure as **[unverified]**.
- **Derived budget (from [G] prices, PRO account = 1,000 monthly + 50 daily credits, [credits](https://support.google.com/flow/answer/16526234?hl=en)):**

| Step | Cost | Note |
|---|---|---|
| Omni 360p draft, 6 s | 5 cr | 4s=4, 6s=5, 8s=6, 10s=7 |
| Omni 360p → 720p upscale | **0 cr** (Pro/Ultra) | [models page](https://support.google.com/flow/answer/16352836?hl=en) |
| Omni 720p, 8 s | 12 cr | 4s=7, 6s=10, 10s=15 |
| 1080p upscale at download | 0 cr (Pro) | 4K Ultra-only |
| Omni edit (v2v) | 40 cr | Google's number; useapi says 20 — budget 40 |

  A 20-s ad = ~4 shots. **Draft-first loop (our design):** 3 × 360p drafts per shot (~15 cr) → pick best → promote to 720p via the free upscale (0 cr) instead of re-rendering. For a 4-shot ad at 3 drafts/shot ≈ **60 credits**, vs 4 × 3 × 12 = 144 if every take is 720p. A month of PRO (1,000) ≈ 16 such ads before daily credits. **Caveat:** does the free 360→720 upscale give identical output to a native 720p render? Google's blog says "Once you have a clip you're happy with, you can then download it in 720p" ([blog, Aug 27 2026](https://blog.google/innovation-and-ai/models-and-research/google-labs/new-creative-controls-google-flow/) **[G]**) — treat 720p quality as **[unverified]** until a side-by-side is run live.
- **Selection process (our design):** (1) generate drafts; (2) auto-QC each clip with the cheap checks in §6.1 (black/freeze/silence/loudness, frame-grab contact sheet) *before* a human sees it; (3) the user only reviews the ≤3 survivors/shot; (4) record the *reason* for every reject in the sidecar — it becomes next round's negative prompt.

### 1.5 Scenebuilder — use, limits, and why our pipeline assembles locally

- **Documented [G]:** arrange, reorder, trim with handles, preview, download as **one file**; **one scene per project**; YouTube direct upload only for individual clips ([Edit videos help](https://support.google.com/flow/answer/16935718?hl=en), [Manage assets help](https://support.google.com/flow/answer/16935308?hl=en)). Clip-count/total-length caps are **unpublished** (facts §4).
- A competitor's comparison calls it a "generate then assemble" timeline editor, not a storyboard tool ([Luma, Sept 15 2026](https://lumalabs.ai/news/google-flow-scenebuilder-vs-luma-scenes.md) **[C — vendor with an interest]**). Another blog describes Scene Builder as holding cast/environment rules ([MindStudio](https://www.mindstudio.ai/blog/how-to-use-google-flow-gemini-omni-video-editing) **[C]**) — that **contradicts Google's help page** (which lists only arrange/trim/preview/download); trust Google.
- **Stance for Acme:** with one scene per project and a single-file export, Scenebuilder cannot hold multiple ad variants (hook A/B, 9:16 vs 4:5). **Treat Scenebuilder as an optional preview**; do the real assembly with `flow_stitch_videos` / the recipes in §2 so every cut is reproducible from files on disk.

### 1.6 Flow Music — what it is, limits, licence

- **It is a separate Google Labs app**, not a panel inside Flow: sign in at flowmusic.app → *New session* → prompt → listen → Download ([Create & manage songs](https://support.google.com/flow/answer/17084348?hl=en) **[G]**). Google calls it "a new tool to our Google Flow family" ([Google blog May 19 2026](https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/) **[G]**). One third-party blog claims Flow Music is "a native AI music generation layer built directly into Google Flow" ([framia](https://framia.converge.ai/page/en-US/blog/flow-music-google-io-2026) **[C]**) — **contradicted by Google's own help pages; treat as wrong** until a live check shows a music control inside Flow.
- **Model:** Lyria 3.5, launched in Flow Music Jul 29 2026 — "easily control the tempo and duration" ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/lyria-3-5/) **[G]**, snippet). Also reachable via Gemini app/API since Sept 2026 ([aiwiki](https://aiwiki.ai/wiki/lyria_3_5) **[C]**).
- **Inputs [G]:** text, **your own audio** ("Use your music to create"), a mic recording, or an image ([Create songs](https://support.google.com/flow/answer/17084348?hl=en)). **Edits:** prompt-based structure/mix/style edits ("Shorten the intro to 4 bars"), *Compose* panel, **Remix → Extend / Cover / Replace** a selected section; Google's May blog adds highlight-a-section editing. **Downloads:** single or multi-select `.zip`.
- **Formats & stems:** the pricing page lists downloads **mp3, wav, m4a** and **stem downloads** ([Flow Music pricing](https://www.flowmusic.app/pricing) **[G]**); the stem set/format isn't specified in help ([sonilo](https://sonilo.com/blog/guides/lyria-3-5-google-flow-music) **[C]**).
- **Length:** "tracks up to three minutes" ([aiwiki](https://aiwiki.ai/wiki/lyria_3_5), [kompozy](https://kompozy.io/reviews/google-flow-music) **[C]**). A third-party API wrapper claims BPM 1–300, up to 240 s, extension +164 s ([snapgen](https://snapgen.org/models/flow-music) **[C]**) — **disagrees** with "three minutes"; irrelevant for 15–30 s ads either way. Ask for the **exact duration and BPM** in the prompt, then verify.
- **Plans [G]:** Free $0 (daily top-ups, 2 concurrent); Starter $6/mo annual (3,000 credits ≈600 songs, 8 concurrent); Plus $18 (10,000 ≈2,000, 12 concurrent); Member $48 (30,000, 16) ([pricing](https://www.flowmusic.app/pricing)). A review quotes monthly-billing prices $8/$24/$64 ([itechguides](https://www.itechguides.com/products/google-flow-music/) **[C]**) — same plans, monthly vs annual. **Mapping:** Google AI Plus→Starter, **AI Pro→Plus**, Ultra→Member ([credits & plan help](https://support.google.com/flow/answer/17083870)). Flow Music credits are **separate** from Flow credits ([Google One help](https://support.google.com/googleone/answer/16882689?hl=en) **[G]**, Plus page). **You must tick the Google One benefits checkbox on first login** to receive membership benefits ([Get started](https://support.google.com/flow/answer/17083868?hl=en) **[G]**) — an easy-to-miss setup step for Acme's PRO account.
- **Commercial licensing:** Google lists **"Commercial use rights"** among Starter-plan benefits ([Google One help — AI Plus](https://support.google.com/googleone/answer/16882689?hl=en) **[G]**, snippet); a secondary review says the same for Plus and Member and notes the *no-charge* page doesn't explicitly confirm commercial rights for free accounts ([Jack Righteous, Sept 3 2026](https://jackrighteous.com/blogs/music-creation-process-guide/google-flow-music-rights-commercial-use-2026) **[C]**). **Rule: generate under the PRO-mapped Plus plan, screenshot the plan page, save with the asset.** Google "does not claim ownership" of generated content — wording from Google's generative-AI terms (Gemini API version, [terms](https://ai.google.dev/gemini-api/terms.md.txt) **[G]**; the Flow Music-specific terms I could not read → **[unverified]**), and that is **not** a guarantee of copyright, Content-ID safety, or that the output doesn't resemble existing music ([Jack Righteous](https://jackrighteous.com/blogs/music-creation-process-guide/google-flow-music-rights-commercial-use-2026) **[C]**).
- **Gotchas:** every Lyria track carries a **SynthID** audio watermark ([aiwiki](https://aiwiki.ai/wiki/lyria_3_5), [kompozy](https://kompozy.io/reviews/google-flow-music) **[C]**; I did not find it on a Google page). *Published* songs allow community remix/download unless you switch off "Allow community remix" ([Create songs](https://support.google.com/flow/answer/17084348?hl=en) **[G]**) — **never publish brand audio**. Don't upload third-party recordings as references (rights stay yours to prove) ([whataidoineed](https://whataidoineed.com/tool/google-flow-music) **[C]**).
- **Platform fit [unverified]:** whether TikTok's CML-only rule or Meta's ad-music checks treat an AI-generated *original* track as acceptable commercial audio is not addressed by any platform page I read. In practice an original track you hold rights to is "separately cleared music" (Meta) / an "Owned Sound" (TikTok) — see §3 — but keep the plan evidence.

---

## 2. Finishing stack — scriptable recipes

**Environment I tested on:** ffmpeg 9.0.1 with libx264, libx265, libsvtav1, aac, libass (`ass`/`subtitles`), `drawtext`, `lut3d`, `noise`, `zscale`, `loudnorm`, `ebur128`, `xfade`, `minterpolate`, `blackdetect/freezedetect/silencedetect`. **Not installed locally:** whisper/faster-whisper/whisper.cpp, librosa, numpy, Pillow (so STT and beat detection below are ⚠ UNTESTED; the ffmpeg parts consuming their output are ✅ TESTED with stand-in data). Real footage was not used — validate once on a true Flow clip.

**ffmpeg 9 gotcha ✅:** `-filter_complex_script` no longer exists; use `-/filter_complex file.txt`.

### 2.0 What `flow_stitch_videos` does today (from `src/tools/stitch-videos.js`) and the gaps this research found
- Normalises to the **largest fps seen** (24 stays 24), `scale…decrease,pad`, x264 CRF 18, `max_height` 1080 **never upscales** (so a 720p Omni clip stays 720p unless canvas is forced), optional music `mix`/`replace` at fixed volume 0.35, `.srt` burn via plain `subtitles=<file>`.
- **Gap 1 — caption position ✅ TESTED:** plain `subtitles=file.srt` on a 1080×1920 frame renders at the **very bottom (~94% down, ~110 px glyphs)** — inside the bottom 35% that Meta says to keep clear (§5). I viewed the rendered frame. SRT is rendered in libass's default 384×288 script space, so `FontSize`/`MarginV` in `force_style` are in *those* units (FontSize=20 gave ~100 px glyphs; MarginV=120 ≈ 42% up the frame ✅ TESTED). **Use an `.ass` with `PlayResX/Y = 1080/1920` instead** (§2.3).
- **Gap 2:** no loudness normalisation, no ducking (§2.5–2.6). **Gap 3:** no end card, grade, grain. **Gap 4:** no QC report.

### 2.1 Ingest: 720p Omni → 1080×1920, and frame rate
- **Reality:** Omni generates at 720p (or 360p draft); 1080p/4K are upscales ([models page](https://support.google.com/flow/answer/16352836?hl=en) **[G]**). Flow's own 1080p upscale at download is free on PRO — **prefer Flow's 1080p download for keepers** (it's Google's model, 0 credits, [credits](https://support.google.com/flow/answer/16526234?hl=en) **[G]**) and use local upscaling only when you already hold a 720p file.
- **Local upscale, cheap & safe ✅ TESTED:**
  ```bash
  ffmpeg -i in720.mp4 -vf "scale=1080:1920:flags=lanczos,unsharp=5:5:0.5:5:5:0.0" \
    -c:v libx264 -crf 16 -preset slow -c:a copy up1080.mp4
  ```
  (Lanczos + mild luma-only unsharp. Don't push sharpen: Meta/TikTok re-encode will amplify halos.)
- **AI upscalers ⚠ UNTESTED:** Real-ESRGAN ncnn-vulkan runs on frames extracted with ffmpeg and needs a Vulkan GPU; upstream is unmaintained since April 2022 and its 2×/3× modes have a reported bug (fork with fix exists) ([xinntao repo](https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan), [yetidevworks fork](https://github.com/yetidevworks/Real-ESRGAN-ncnn-vulkan) **[C]**). Models are tuned for general/anime stills — they can invent texture on fabric/print and flicker temporally. For hoodie prints, **lanczos beats AI upscale** unless an A/B shows otherwise. Check the host's GPU before investing.
- **24 → 30 fps ✅ TESTED (all three ran; frame counts for an 8 s/24 fps source):**
  | Method | Command fragment | Frames out | Verdict |
  |---|---|---|---|
  | Duplicate | `fps=30` | 240 | cheapest; slight 3:2-style cadence judder |
  | Blend | `framerate=fps=30:interp_start=0:interp_end=255:scene=8` | 240 | softer, can ghost on fast motion |
  | Motion interp. | `minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1` | 238 | slowest; warps edges/hands — **avoid on AI video** (artifacts add to existing ones) |
  **Is 30 fps required?** No platform page I read mandates 30 fps. Meta Reels guidance cited by one aggregator is 24–60 fps ([postfa.st](https://postfa.st/sizes/facebook/reels) **[C]**); TikTok's ad spec lists no frame-rate rule ([TikTok in-feed specs](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en) **[G]**). **Recommendation:** keep Flow's native 24 fps through the edit; only force `fps=30` when joining 30 fps material (our end card) — and `-r 30` once at final export so the delivered file is constant-frame-rate.

### 2.2 Look: consistent grade, grain, vignette ✅ TESTED
- AI clips differ shot-to-shot in contrast/colour; one **LUT + light grain** as the last visual step glues them. `lut3d` reads `.cube`/`.3dl`/`.dat`/`.m3d`/`.csp`, interpolation `tetrahedral` is the smoothest ([ffmpeg lut3d docs](https://ayosec.github.io/ffmpeg-filters-docs/9.0/Filters/Video/lut3d.html), [media-os notes](https://github.com/damionrashford/media-os/blob/main/skills/ffmpeg-lut-grade/references/filters.md) **[C]**).
  ```bash
  # build a tiny 17^3 .cube look (python, stdlib only) then:
  ffmpeg -i in.mp4 -vf "lut3d=file=acme_look.cube:interp=tetrahedral,noise=alls=6:allf=t+u,vignette=PI/6" -c:a copy graded.mp4
  ```
  I generated a 17³ cube (contrast ×1.12 around mid-grey, R×1.03, B×0.97) with a 12-line Python script and ran the chain: ran clean. **Acme brand-grade idea (our design):** near-neutral blacks, slightly lifted whites, orange accent kept saturated — build the real `.cube` from a reference still in a free tool (e.g. DaVinci Resolve free, or hand-edit), **apply to all clips, including the end card background**.
- **Grain survives compression only if it's coarse enough:** at `alls=6–8` temporal grain is typically eaten by Meta/TikTok re-encodes; if you want visible texture use `alls=10` and check the *uploaded* result. **[unverified — my judgement]**
- Apply grade **before** adding captions/logos (so graphics stay clean).

### 2.3 Captions — brand font, animated, safe-zone-aware
**Why burn-in:** Flow does not add captions; sound-off viewing is common; and the Meta/TikTok ad disclaimer/CTA UI overlays the bottom. (Playbook §5.1.) **Also ship a sidecar `.srt`** (accessibility, §6.1).

**STT options (all free, local) ⚠ UNTESTED here:**
- **whisper.cpp** (MIT, CPU-only OK): word timestamps via `-ml 1` ("experimental") ([README](https://github.com/ggml-org/whisper.cpp)).
- **faster-whisper** (MIT, CTranslate2, int8 CPU, up to 4× faster than openai/whisper) ([SYSTRAN repo](https://github.com/SYSTRAN/faster-whisper)); `word_timestamps=True` is the API switch (recall from its README; snippet-level confirmation only **[unverified]**).
- **stable-ts** (MIT) wraps Whisper/faster-whisper for *stabilised* word timestamps and exports **ASS with karaoke effects** via `result.to_ass()` ([DeepWiki](https://deepwiki.com/jianfch/stable-ts/7.3-common-use-cases), [Whipscribe](https://whipscribe.com/tools/stable-ts) **[C]**).
- **Best trick for us (our design):** we *write* the dialogue in the Flow prompt, so we already know the script. Run STT only to get **word timings**, then **replace the recognised words with the script words** (fixes "Acme" → "acme"/brand names that Whisper mangles). Extract mono 16 kHz audio ✅ TESTED: `ffmpeg -i final.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le stt.wav`.

**Animated brand captions via ASS ✅ TESTED (rendered and viewed):**
```ini
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Acme,<BRAND FONT FAMILY>,78,&H00FFFFFF,&H00157BFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,5,0,2,120,120,760,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.50,0:00:02.50,Acme,,0,0,0,,{\fad(120,80)\k40}OVERSIZED {\k30}ON {\k50}PURPOSE
```
```bash
ffmpeg -i graded.mp4 -vf "ass=cap.ass:fontsdir=./fonts" -c:v libx264 -crf 18 -c:a copy captioned.mp4
```
- **Safe-zone math:** `Alignment=2` (bottom-centre) + `MarginV=760` puts the baseline at 760/1920 = **39.6% from the bottom → inside the clear zone** (Meta: keep bottom 35% / top 14% / sides 6% free; TikTok's own template differs, §5). In my render the line sat at ≈58% of frame height. ✅
- **Colours are BGR hex:** `&H00157BFF` = RGB `FF7B15` (an orange). In ASS karaoke `\k`, words **start in SecondaryColour and switch to PrimaryColour** as sung — so for "active word = orange", set Primary=orange, Secondary=white (my test had them reversed, which showed the unsung word orange).
- `fontsdir=` points libass at a folder of `.ttf/.otf` so the **brand font need not be installed system-wide** ([ffmpeg subtitles filter](https://ayosec.github.io/ffmpeg-filters-docs/3.3/Filters/Video/subtitles.html), [salivity guide](https://salivity.github.io/ffmpeg/article/f-fmpeg-custom-font-path-for-subtitles-and-ass) **[C]**). The `Fontname` must be the font's *family name*, not the filename.
- **Font licence:** use an SIL OFL font (e.g. from Google Fonts) or one you've licensed for video/advertising; OFL "permits any use, whether electronic or printed" with conditions ([SIL FAQ](https://software.sil.org/fonts/faq/), primary source for the OFL — applies only to SIL's own fonts; check each font's own licence file). Record the font + licence in the campaign sidecar.
- **Pattern for the generator (our design):** `captions.py` takes `script.json` (lines + optional emphasis words) + `words.json` (STT timings) → writes `cap.ass` with ≤2 lines, ≤32 chars/line, 0.25 s minimum on screen, active-word colour, 6 px outline for contrast.
- `drawtext` is fine for **one-off CTA text** ✅ TESTED (`alpha='if(lt(t,5),0,min(1,(t-5)/0.4))'` fade-in; `x=(w-text_w)/2:y=h*0.62`) but handles no wrapping/animation well; use ASS for dialogue.

### 2.4 End card with logo ✅ TESTED
```bash
# 2.4 s black card, wordmark + orange rule + URL, silent stereo audio, fade in
ffmpeg -f lavfi -i "color=c=black:s=1080x1920:r=30:d=2.4" -f lavfi -i "anullsrc=r=48000:cl=stereo" \
 -vf "drawtext=fontfile=fonts/Brand-Bold.ttf:text='ACME':fontsize=140:fontcolor=white:x=(w-text_w)/2:y=h*0.42,\
drawbox=x=(iw-220)/2:y=ih*0.42+190:w=220:h=8:color=0xFF7B15:t=fill,\
drawtext=fontfile=fonts/Brand-Bold.ttf:text='acme.ca':fontsize=48:fontcolor=white@0.85:x=(w-text_w)/2:y=h*0.42+240,fade=t=in:st=0:d=0.4" \
 -t 2.4 -c:v libx264 -pix_fmt yuv420p -c:a aac -ar 48000 -shortest endcard.mp4
# join: 0.4 s crossfade; offset = main_duration - 0.4
ffmpeg -i main30.mp4 -i endcard.mp4 -filter_complex \
 "[0:v][1:v]xfade=transition=fade:duration=0.4:offset=7.6[v];[0:a][1:a]acrossfade=d=0.4[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -crf 18 -c:a aac -b:a 192k joined.mp4
```
Result: 8 s + 2.4 s − 0.4 s = **10.000 s** (verified with ffprobe). **Both inputs must share size/fps/pixel format/sample rate**, or `xfade` errors — normalise main to 30 fps first (done above). **For a real logo use a transparent PNG:** `-loop 1 -i logo.png` + `overlay=(W-w)/2:(H-h)/2` instead of `drawtext` (⚠ UNTESTED; standard overlay). Keep the card **≤2.5 s** and the logo inside the safe zone. Ad-policy note: don't put the *only* price/offer disclosure on the end card (§4.3).

### 2.5 Music: mix, duck, beat-aligned cuts
- **Mix + sidechain ducking ✅ TESTED** (music −6 dB, ducks under Flow's ambience/dialogue):
  ```bash
  ffmpeg -i joined.mp4 -i music.wav -filter_complex \
   "[1:a]atrim=0:10,asetpts=PTS-STARTPTS,volume=-6dB,afade=t=out:st=8.8:d=1.2[m];\
    [0:a]asplit=2[vo][sc];[m][sc]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[md];\
    [vo][md]amix=inputs=2:duration=first:normalize=0[a]" \
   -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k mix.mp4
  ```
  Note the mixed result measured **−22.2 LUFS** (music at −6 dB under a quiet source) → **always loudness-normalise after mixing** (§2.6). `flow_stitch_videos`' fixed 0.35 volume mix has no ducking.
- **Beat-aligned cuts — ffmpeg half ✅ TESTED, detection half ⚠ UNTESTED.** Detect beats with librosa `beat.beat_track` (dynamic-programming tracker; returns tempo + beat frames/times) ([librosa docs](http://librosa.org/doc/0.11.0/generated/librosa.beat.beat_track.html)); needs `pip install librosa` (not present). **Simpler and exact:** since Flow Music lets you **specify tempo and duration** ([Google blog](https://blog.google/innovation-and-ai/models-and-research/google-labs/lyria-3-5/) **[G]**), request e.g. "120 BPM, 15 s" and *compute* beats (`60/BPM`) — no detection needed. Cutting from a beat list produced this clean build (8 segments × 1 s, cut every 2 beats at 0.5 s/beat → 8.000 s):
  ```python
  parts=[f"[0:v]trim=start={ss:.3f}:end={ss+1.0:.3f},setpts=PTS-STARTPTS[v{i}]" for i,ss in enumerate(starts)]
  fc=";".join(parts)+";"+"".join(f"[v{i}]" for i in range(n))+f"concat=n={n}:v=1:a=0[v]"
  open("beat_fc.txt","w").write(fc)
  # ffmpeg -i clip.mp4 -/filter_complex beat_fc.txt -map "[v]" -an -c:v libx264 -crf 20 beatcut.mp4
  ```
  Cut **on** the beat or ≈ 2–3 frames *before* it (perceptually tighter) — **[unverified editorial convention]**. Re-attach audio from the music file, not the clips.

### 2.6 Loudness
- **Targets disagree — no platform publishes a number:**
  | Claim | Source |
  |---|---|
  | −14 LUFS integrated, −1 dBTP for TikTok *and* Reels | [Media Strategy Lab](https://mediastrategylab.com/tools/lufs-loudness-reference) **[C]**, [audiopod](https://audiopod.ai/blog/creator-audio-loudness-best-practices-every-platform) **[C]** ("undocumented") |
  | ~−16 LUFS, −1 dBTP | [notnoise](https://notnoise.co/blog/mastering-for-streaming-2026) **[C]** |
  | "There is no TikTok loudness specification"; Meta encodes Reels with xHE-AAC whose loudness management "adapts to the playback environment" | [Valmera](https://valmera.io/tools/audio-loudness-targets) **[C]**, citing Meta engineering 2023 |
  **Decision:** deliver **−14 LUFS integrated / −1 dBTP / LRA ≤ 11** (conservative middle; ads should not be quieter than organic). The −1 dBTP ceiling is to survive lossy codec overshoot ([Media Strategy Lab](https://mediastrategylab.com/tools/lufs-loudness-reference) **[C]**).
- **Two-pass `loudnorm` ✅ TESTED** (parameters: `I`, `LRA`, `TP`, `measured_I/LRA/TP/thresh`, `offset`, `linear=true` per [loudnorm docs](https://ayosec.github.io/ffmpeg-filters-docs/8.1/Filters/Audio/loudnorm.html); dynamic mode upsamples to 192 kHz so add `aresample=48000`):
  ```bash
  ffmpeg -hide_banner -nostats -i in.mp4 -vn -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2> m.txt   # pass 1
  # parse the JSON block, then:
  ffmpeg -i in.mp4 -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=..:measured_LRA=..:measured_TP=..:measured_thresh=..:offset=..:linear=true,aresample=48000" -c:v copy out.mp4
  # verify (use framelog=quiet or the output floods):
  ffmpeg -nostats -i out.mp4 -af ebur128=peak=true:framelog=quiet -vn -f null - 2>&1 | grep -E "I:|Peak:"
  ```
  My synthetic test: measured −22.05 → output **−14.0 LUFS**. On the full mixed deliverable the final measurement read **−13.6 LUFS / −8.6 dBFS peak** (within a few tenths; `linear=true` can't hit the target exactly if it would exceed TP, and synthetic sine isn't speech). Accept ±1 LU.

### 2.7 Final export that survives re-compression
- **Principle:** platforms re-encode everything; the best defence is a **clean, high-bitrate, constant-frame-rate, 1080×1920 H.264 High/yuv420p/BT.709 MP4** — more data in = less visible loss out. 4K "gives Instagram more data to crush without adding sharpness" ([Lilach Bullock](https://www.lilachbullock.com/what-resolution-export-instagram-reels/) **[C]**).
- **What the platforms say:** Meta ads: **MP4/MOV, H.264, ≤4 GB** **[C]** (aggregators citing Meta's Ads Guide, e.g. [Coinis](https://coinis.com/how-to/best-way-to-create-facebook-reels-ad); the guide itself wouldn't load); TikTok non-Spark in-feed **[G]**: `.mp4 .mov .mpeg .3gp .avi`, **≤500 MB, ≥516 kbps, ≥540×960** ([TikTok specs](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en), updated June 2026). Neither platform publishes a recommended bitrate; "8–12 Mbps @1080p30" is community consensus ([doom10](https://doom10.org/recommended-instagram-reels-video-settings-and-specs/), [positioniseverything](https://www.positioniseverything.net/how-to-upload-high-quality-reels-videos-photos-on-instagram-without-losing-quality/) **[C]**) — they also say AAC ≥128 kbps/48 kHz, keyframe every 1–2 s.
- **Recommended master (✅ TESTED; ffprobe confirmed h264 High, 1080×1920, yuv420p, bt709, 30/1 fps, AAC-LC 48 kHz stereo, 5.4 Mbps on a synthetic clip):**
  ```bash
  ffmpeg -i mix.mp4 -vf "scale=1080:1920:flags=lanczos,format=yuv420p" -af "<loudnorm pass-2 string>" \
   -c:v libx264 -profile:v high -preset slow -crf 17 -maxrate 14M -bufsize 28M -r 30 -g 60 -bf 2 \
   -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
   -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart -map_metadata -1 final.mp4
  ```
  CRF 17 with a 14 Mbps cap lets simple AI footage stay small (~5 Mbps here) while complex grain-heavy shots can burst. Filename/size sanity: 10 s ≈ 7 MB — far under both 500 MB (TikTok) and 4 GB (Meta) limits.
- **H.265/AV1: skip (my judgement, [unverified] against platform pipelines).** The spec lists I found name H.264 (Meta, via aggregators) and mp4/mov containers (TikTok); nothing documented is gained from HEVC/AV1 and compatibility risk rises.

### 2.8 Crops and sibling formats ✅ TESTED
- **9:16 master → 4:5 feed:** `crop=1080:1350:0:285` (centre crop; verified 1080×1350). Because the 9:16 safe zone (14% top/35% bottom) and the 4:5 centre crop overlap well, **design text inside the central 1080×1350 AND the Meta safe zone** (roughly y ∈ 14%–65% of 1920 = 269–1248).
- **Instagram profile grid / Reel cover is a centre 3:4 crop** (≈1080×1440) since the Jan 2025 grid change ([postfa.st](https://postfa.st/sizes/instagram/reels), [Neal Schaffer](https://nealschaffer.com/instagram-post-size/) **[C]**; one source says 4:5 — [fitpreview](https://fitpreview.com/blog/instagram-reels-cover-size/) — **disagreement**; centre-safe to 1080×1350 satisfies both). Export a **cover still ✅** at ~1 s: `ffmpeg -ss 1 -i final.mp4 -frames:v 1 cover.png`.
- **TikTok:** ship the same 9:16 file; hold text out of its own L-shaped zone (right-hand action rail) (§5).

### 2.9 Provenance metadata — and what NOT to do
- **SynthID is invisible and survives re-encoding;** Flow says it "should not be tampered with or removed" ([Get started](https://support.google.com/flow/answer/16353333?hl=en&co=GENIE.Platform=Desktop) **[G]**). **C2PA Content Credentials:** Google says it uses C2PA "across a growing number of our generative media tools" ([Google blog May 19 2026](https://blog.google/innovation-and-ai/products/identifying-ai-generated-media-online/) **[G]**); whether *Flow* downloads carry a manifest is **not stated on Flow's pages** ([AdTestBench](https://adtestbench.com/guides/veo-prompts-for-ads/) **[C]**; a third-party "metadata remover" asserts they do — **[unverified]**, vendor selling removal).
- **Re-encoding with ffmpeg normally drops embedded C2PA/XMP** (`-map_metadata -1` makes it explicit; trade coverage: manifests "meet the same fate" as EXIF in transcodes — [Lumethic](https://www.lumethic.com/en/articles/content-credentials-social-media-platforms) **[C]**). **Do NOT use metadata-stripping as a way to avoid "AI info" labels** — Meta's detection reads these signals but the policies require honest self-disclosure for realistic AI content regardless (§4), and SynthID remains. **Policy for Acme: disclose via the platform toggles every time (§4); don't engineer around labels.**

---

## 3. Music & SFX sources and licensing realities

| Source | What it gives | Ad-safe? | Evidence |
|---|---|---|---|
| **Meta Sound Collection** | "over 14,000" (Instagram help) / "nearly 16,000" (Facebook help) royalty-free songs & SFX; "can be used for commercial purposes like ads" | **Yes, on Meta products** (platform-bound) | [Instagram licensed-music help](https://www.facebook.com/business/help/402084904469945/), [Facebook reels help](https://www.facebook.com/business/help/880459498798521) **[G]** (the 14k vs 16k difference is two Meta pages disagreeing) |
| **Meta licensed music library** (the in-app "trending" picker) | major-label tracks | **No** — "intended for personal, non-commercial use"; business accounts/types of posts are blocked | [Instagram help](https://www.facebook.com/business/help/402084904469945/) **[G]**; aggregator: Reels *ads* can't carry licensed music ([moda.app](https://moda.app/resources/sizes/meta-reels-ad) **[C]**) |
| **Ads Manager "Add music"** | auto/manual pick of ≤5 Sound Collection songs | Yes; **not available** for IG ads using existing posts/Creative Hub; formats: Reels, Stories, Feed single-image | [Meta Ads Manager music help](https://www.facebook.com/business/help/759279452000505) **[G]** |
| **TikTok Commercial Music Library (CML)** | pre-cleared; "1 million songs" (help, last updated July 2026) vs "600,000+" (older TikTok blog) — **two TikTok pages disagree**; filters by region/placement | **Yes — only this** for business content | [About CML](https://ads.tiktok.com/resources/help/article/commercial-music-library?lang=en), [How to use CML](https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library), [TikTok blog](https://ads.tiktok.com/business/en-US/blog/audio-library-royalty-free-music) **[G]** |
| **TikTok trending / original sounds** | creator uploads, label tracks | **No** — "Businesses cannot use the general music library for commercial usage"; "Original sounds are not cleared for commercial use" | [About CML](https://ads.tiktok.com/resources/help/article/commercial-music-library?lang=en), [Music legality one-pager](https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf), [TikTok support](https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/commercial-use-of-music-on-tiktok) **[G]** — outside the CML you must accept a "Music Usage Confirmation" |
| **CML licence scope** | "free and licensed for use on TikTok **only**" | Don't re-use the same track on Meta | [one-pager](https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf) **[G]** |
| **Own/commissioned/Flow Music original** | owned or licensed by you | Yes if you can prove rights; TikTok "Owned Sound" upload prompts a licence confirmation | [one-pager](https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf) **[G]**; Flow Music §1.6 |
| **Subscription libraries (Epidemic Sound etc.)** | catalogue licensed per plan | Epidemic's *Pro/Business* tiers list "digital ads … boosted social posts"; *Creator* tier does not | [Epidemic blog](https://www.epidemicsound.com/blog/artlist-vs-epidemic-sound/) **[C — vendor claim; read the licence]** |
| **Pixabay Music/SFX** | free; commercial use without attribution; not for standalone redistribution | Generally yes, but Content ID claims can still hit; no use of trademarks/logos in misleading ways | [Pixabay licence summary](https://pixabay.com/service/license-summary/), [FAQ](https://pixabay.com/service/faq/) **[G]**; Content ID caveat [C] |
| **Freesound** | per-sound CC0 / CC-BY / CC-BY-NC | CC0 only (BY needs credit; NC bans commercial) | [Freesound FAQ](https://freesound.org/help/faq/) **[G]** |
| **YouTube Audio Library** | standard licence tracks are YouTube-only; CC-BY tracks need credit | **Avoid for ads** | [YouTube help](https://support.google.com/youtube/answer/3376882?hl=en) **[G]**, [licenseorg](https://www.licenseorg.com/guide/music-audio/youtube-audio-library) **[C]** |

- **Flow/Veo/Omni *generated audio* (ambience, SFX, dialogue):** generated with the clip ([playbook §5.4](flow-creative-playbook.md)); Google's ownership language is "Google won't claim ownership" ([terms](https://ai.google.dev/gemini-api/terms.md.txt) **[G]**, API terms — Flow-specific terms **[unverified]**), and Flow's rights reminder puts responsibility for *inputs* on you ([release notes](https://support.google.com/flow/answer/16893714?hl=en) **[G]**). Practical rules: (1) mute generated *music* inside clips (prompt "no music" — playbook §5.4) so it can't be an accidental sound-alike; (2) keep generated SFX/ambience/dialogue; (3) if a clip's native audio contains an unprompted melody, **drop that clip's audio** (QC §6.1) — I found no source that says Veo's incidental music is cleared as a standalone track.
- **"Trending audio can't be used in ads" — confirmed on both platforms** (rows above). A common workaround — posting organically with a trending sound, then boosting/Spark-ing — is *still commercial use* by both platforms' definitions ([Soundstripe](https://www.soundstripe.com/blogs/royalty-free-music-for-instagram-ads) **[C]**; TikTok's CML page lists "Video ads, Branded content, Organic content" all under CML).
- **Sound-effects:** CML includes SFX ([TikTok blog](https://ads.tiktok.com/business/en-US/blog/audio-library-royalty-free-music) **[G]**); Meta Sound Collection includes SFX. For custom SFX use Pixabay/Freesound-CC0 or Flow-generated.

---

## 4. Platform rules for AI-made ads — Instagram/TikTok, Canada (as of Oct 2026)

### 4.1 Meta (Instagram + Facebook)
- **Organic.** Meta reads industry-standard signals (e.g. C2PA/IPTC) from third-party tools to apply an **AI label**; "Meta *may require* an AI label when content has **photorealistic video or realistic-sounding audio** that was digitally created, modified or altered, including with AI. This requirement does not apply to images" ([How to identify AI content on Meta](https://www.meta.com/help/artificial-intelligence/1783222608822690/) **[G]**; "Updated: 10 weeks ago" at fetch). Labelling "is different for ads" (same page).
- **Paid ads.**
  - **Feb 3 2025 (updated Jun 1 2026):** "About this ad" in the three-dot menu includes "AI info" labels for ads created/significantly edited with Meta's gen-AI tools, and Meta "will also begin automatically detecting ads created or edited using third-party AI tools through industry-standard signals" ([Meta newsroom](https://about.fb.com/news/2025/02/gen-ai-transparency-metas-ads-products/) **[G]**; "This experience may vary in certain regions due to legal requirements").
  - **Jul 7 2026 (trade report quoting Meta):** Meta "will automatically label ad content that has been created or edited using some of Meta's generative AI tools or with third-party generative AI tools offered by other products like Photoshop, Dall-E, or others", using "industry-standard detection methods, such as C2PA" ([Social Media Today](https://www.socialmediatoday.com/news/meta-adds-updated-disclosure-tags-for-ai-generated-ads/824658/) **[C quoting G]**).
  - **Self-disclosure** in Ads Manager is *required* for **social issue/election/political** ads with photorealistic AI-made media, with removal and account penalties for non-disclosure; general commercial ads are auto-label ([Digital Applied, Aug 2026](https://www.digitalapplied.com/blog/ai-content-labeling-rules-advertisers-2026-reference) **[C]** — a cross-platform reference that itself warns against SEO round-ups inventing "mandatory AI disclosure" dates). **Acme's apparel ads are not SIEP**, so: expect an automatic "AI info" label if C2PA is present; **no general-ad self-declare toggle was found**; label *absence* is not a safe harbour (below).
- **Canada-specific:** I found **no Canada-specific variation** in Meta's published AI-ad-label policy other than the generic "may vary in certain regions"; **[unverified]** whether any Canadian rule alters it.
- **Hard rules that apply regardless of label:** ads can't use deceptive/misleading practices ([Meta Unacceptable Business Practices](https://transparency.meta.com/en-gb/policies/ad-standards/fraud-scams/unacceptable-business-practices/) **[G]**) or content that violates the Community Standard on Misinformation ([Meta Misinformation ad policy](https://transparency.meta.com/policies/ad-standards/unacceptable-content/misinformation/) **[G]**).
- **Audio:** only Sound Collection or separately licensed music in ads (§3).

### 4.2 TikTok
- **Policy:** TikTok **requires** realistic AI-generated content to be labelled; creators have had an "AI-generated" toggle since Sept 2023; labels can be **creator-applied** ("creator labeled as AI-generated") or **auto-applied** from C2PA Content Credentials ([TikTok support](https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content), snippet; [TikTok newsroom](https://newsroom.tiktok.com/tiktok-ssa-shares-more-ways-to-spot-shape-and-understand-ai-generated-content?lang=en-ZA) **[G]**; "over 1.3 billion videos" labelled to date; invisible watermarks added for content with C2PA credentials).
- **Ads — stricter:** "**Mandatory disclaimers:** AI-generated, synthetic, or manipulated media. This includes images, video, or audio that are completely AI-generated or real source material that has been significantly modified by AI" ([About ad disclaimers](https://ads.us.tiktok.com/resources/help/article/about-ad-disclaimers-in-tiktok-ads-manager) **[G]**). The **AI-generated content disclaimer** adds a textual label at the bottom of the in-feed video for the whole ad; **works for Spark and non-Spark ads**; "you might not see the feature … if it's not available to you; contact your sales representative." Ads Manager path: campaign → ad group → **Select Placement = TikTok only** → ad level → **Add Disclaimer** ([Add disclaimers](https://ads.tiktok.com/resources/help/article/add-disclaimers-to-ads?lang=en) **[G]**, snippet). API: `aigc_disclosure_type = SELF_DISCLOSURE` puts "Advertiser labeled as AI-generated" on the ad ([TikTok Business API](https://business-api.tiktok.com/portal/docs/get-smart-creative-materials/v1.3) **[G]**). TikTok's synthetic-media ad rules sit on its "Misleading and false content" policy page ([policy](https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content) **[G]**, mostly hidden from the extractor).
- **Commercial-content toggle:** posts that promote a brand/product need the Commercial Content Disclosure on ([TikTok help](https://ads.tiktok.com/resources/help/article/about-the-content-disclosure-setting-for-creators?lang=en) **[G]**, snippet) and a **Music Usage Confirmation** if not using the CML ([TikTok support](https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/commercial-use-of-music-on-tiktok) **[G]**).
- **Misleading claims:** ads "must not promise or exaggerate results concerning a product's effect"; TikTok seller guidance also says don't use AI to show "unrealistic results … or product functions that the real item cannot perform" ([TikTok policy](https://ads.tiktok.com/help/article/tiktok-ads-policy-misleading-and-false-content), [TikTok Shop AIGC rules](https://seller-us.tiktok.com/university/essay?knowledge_id=491489038501663&lang=en) **[G]**, snippet).
- **Canada status — resolved:** the Nov 6 2024 order to wind up TikTok Technology Canada was set aside by the Federal Court (Jan 2026) and on **Mar 9 2026** Ottawa allowed TikTok Canada to proceed under binding undertakings (data protection, minors, third-party monitor) ([Government of Canada statement](https://www.canada.ca/en/innovation-science-economic-development/news/2026/03/minister-jolys-statement-on-the-outcome-of-the-further-national-security-review-of-tiktok-technology-canada-inc-under-the-investment-canada-act.html) **[G]**; [Wolters Kluwer](https://legalblogs.wolterskluwer.com/competition-blog/canadian-foreign-investment-law-an-update/), [Blakes](https://www.blakes.com/insights/blakes-competitive-edge-april-2026-update/) **[C]**). Earlier advice that Canadian advertisers couldn't buy TikTok ads is out of date — confirm Ads Manager availability on the actual account.

### 4.3 Canadian advertising law touch-points for fashion ads
Source for most: Competition Bureau (federal regulator) pages — authoritative **[G]** — plus law-firm summaries **[C]**. *Not legal advice.*

1. **Truthful representation / "general impression".** A representation is misleading if the **general impression**, as well as its literal meaning, is false in a material respect ([general impression test](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/general-impression-test) **[G]**; applies to "online and in-store advertisements … social media messages … endorsements" — [Bureau overview](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/misleading-representations-and-deceptive-marketing-practices) **[G]**). **Apply to AI visuals:** a hoodie shown with fabric weight, drape, colour or print detail the real product lacks is a product-misrepresentation risk. *This is my inference from the general-impression test — I found no Bureau guidance specifically about AI-rendered garments.* → use real product stills/footage for the garment (§1.2), and have the AI scene be setting/mood.
2. **Drip pricing.** Advertising a price that is not attainable because of **mandatory fixed fees** (shipping, "service" fees, etc.) is deemed false or misleading, except government-imposed taxes ([Competition Act s.74.01(1.1)](https://laws-lois.justice.gc.ca/eng/acts/C-34/section-74.01.html); [Bureau drip-pricing page](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/drip-pricing); [Guide to 2022 amendments](https://competition-bureau.canada.ca/en/guide-2022-amendments-competition-act) **[G]**). Cineplex: C$38.9M penalty ([DWPV](https://www.dwpv.com/insights/2024/canadian-competition-tribunal-case-competition-act) **[C]**). **Rule:** any price shown in an ad = the price the customer pays before taxes; **mandatory shipping** can't be added later — show "free shipping over $X" only if true, put threshold in the ad copy.
3. **Penalties scale:** corporations — greater of **$10M ($15M repeat)** or **3× benefit / 3% of worldwide gross revenue** ([Bureau 2022 guide](https://competition-bureau.canada.ca/en/guide-2022-amendments-competition-act) **[G]**). **Private parties** can seek leave to bring deceptive-marketing cases to the Tribunal since **Jun 20 2025** ([McCarthy](https://www.mccarthy.ca/en/insights/publications/significant-amendments-competition-act-are-finally-here), [Aird Berlis](https://www.airdberlis.com/insights/publications/publication/key-updates-released-by-competition-bureau-regarding-greenwashing-and-the-new-private-litigant-regime) **[C]**).
4. **Sale/"was" pricing.** An "ordinary price" must pass the volume test (substantial sales at that price) or time test (offered in good faith for a substantial period) — can't invent "$100, now $50" ([Bureau — Ordinary selling price](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/ordinary-selling-price), [Ordinary price guidelines](https://competition-bureau.canada.ca/en/how-we-foster-competition/education-and-outreach/ordinary-price-claims) **[G]**). A pre-launch brand with **no prior sales has no "regular price" to cite** — avoid "launch discount from $X" framing unless the product truly was offered at $X.
5. **"Made in Canada"/origin.** Not required to state origin, but if you do it must be accurate; use "Designed in Canada"/"Assembled in Canada" if criteria aren't met ([Bureau — Made in Canada claims](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/made-canada-claims) **[G]**; guideline thresholds: Product of Canada 98%, [guidelines](https://competition-bureau.canada.ca/en/how-we-foster-competition/education-and-outreach/publications/product-canada-and-made-canada-claims) **[G]**). Canadian flags/maple leaf imagery used deceptively "could raise concerns" (same page).
6. **Textiles.** Fibre-content labelling is mandatory on the garment; in advertising a fibre declaration is optional **but if you make one it must follow the Regulations**, and false/misleading textile representations are prohibited ([Bureau — Textile labelling & advertising guide](https://competition-bureau.canada.ca/en/guide-textile-labelling-and-advertising-regulations), [accuracy page](https://competition-bureau.canada.ca/en/labelling/textile-labelling/detailed-requirements-textile-labelling-requirements-accuracy) **[G]**). So "100% organic cotton" in a Reel needs to be true and compliant.
7. **Influencer / ambassador / AI persona disclosure.** Disclose **all material connections** (pay, free product, discounts, trips, relationships); disclosures "as visible as possible", not buried in long captions/hashtag blocks, visible without tapping to expand, **on each platform** ([Bureau — Influencer marketing](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/influencer-marketing-and-competition-act) **[G]**). Ad Standards Fall 2025 *Influencer Marketing Disclosure Guidelines*: `#Ad` is the "gold standard"; **AI-generated influencers still need material-connection disclosure; shouldn't give testimonials about qualities they can't experience (e.g. taste/smell); best practice is to disclose that a spokesperson is virtual; if content was generated or significantly altered by AI, disclose it (e.g. `#MadeWithAI`)** — responsibility is shared by brand, agency and influencer ([Ad Standards PDF](https://adstandards.ca/wp-content/uploads/Ad-Standards-Influencer-Marketing-Disclosure-Guidelines-2025-10-08.pdf) **[G]**, extractor returned only the intro; AI details from [Bennett Jones](https://www.bennettjones.com/Insights/Blogs/2025/12/Canadian-Code-of-Advertising-Standards-for-Influencer-Marketing), [Marks & Clerk](https://www.marks-clerk.com/insights/latest-insights/102lrcj-influencing-influencers-ad-standards-releases-latest-edition-of-influencer-marketing-disclosure-guidelines/), [Gowling](https://gowlingwlg.com/en/insights-resources/articles/2025/updated-influencer-marketing-disclosure-guidelines-in-canada) **[C]**). **For Acme:** an AI Character who "says" "I wear this every day" is a fabricated testimonial — keep AI characters as *scene/mood* performers, not as claimants of personal experience; label them AI.
8. **No "AI exception"; no statutory AI-ad-label law in Canada yet.** The Bureau's Sept 23 2026 submission to ISED's AI-transparency consultation (Jul 23–Sep 23 2026) says there is "no 'AI exception'" to the Competition Act and recommends technology-neutral, harms-focused rules; the consultation paper asks whether new measures are needed for AI-generated content etc. but **proposes no settled framework** ([BLG, Oct 15 2026](https://www.blg.com/en/insights/2026/10/ai-transparency-the-competition-bureau-weighs-in) **[C]**; consultation: [ISED](https://ised-isde.canada.ca/site/ised/en/have-your-say-advancing-ai-transparency-canada) **[G]**, not fetched). The Bureau notes AI can amplify fake reviews/endorsements/impersonation ([Bureau consultation summary](https://competition-bureau.canada.ca/en/how-we-foster-competition/education-and-outreach/consultation-artificial-intelligence-and-competition-what-we-heard) **[G]**) → **never use AI-generated "customer reviews" or fake UGC testimonials.**
9. **Quebec.** If Quebec students are targeted: French is required in commercial advertising; since Jun 1 2025 a non-French trademark in advertising must be registered and have no registered French version ([Cain Lamarre](https://cainlamarre.ca/en/resources/veille-juridique/passage-of-bill-96-act-respecting-french-the-official-and-common-language-of-quebec/), [Miller Thomson](https://www.millerthomson.com/en/insights/marketing-advertising-and-product-compliance/charter-french-language-quebec-publication-final-regulation-respecting-language-commerce-and-business/) **[C]**). Not researched further — **[unverified]** details; ask counsel before a Quebec-targeted campaign.
10. **Not covered:** privacy of likeness/model releases, CASL (email), Quebec Consumer Protection Act (ads to children), GST/HST price display, product-safety (hoodie drawstrings for kids) — out of scope; flag to counsel.

### 4.4 Where sources disagree (so you don't trust a tidy summary)
| Topic | View A | View B | Handling |
|---|---|---|---|
| Does Meta require **advertiser self-disclosure** for general AI ads? | Required only for SIEP/political; others auto-labelled ([Digital Applied](https://www.digitalapplied.com/blog/ai-content-labeling-rules-advertisers-2026-reference)) | Several round-ups say AI disclosure is "mandatory" for all ads ([Common Thread](https://commonthreadco.com/blogs/coachs-corner/meta-ai-ad-labels-mandatory-disclosure-ecommerce-2026), search snippet) **[C]** | Primary Meta pages describe *automatic* labelling; no general self-declare found → disclose in copy anyway (cheap, safe). |
| TikTok: "must" or "encourage" label? | Help: "we **encourage** creators to label … We also **require** … realistic" | Ads: **mandatory** AI disclaimer ([TikTok](https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content), [Ad disclaimers](https://ads.us.tiktok.com/resources/help/article/about-ad-disclaimers-in-tiktok-ads-manager)) | For *ads* assume mandatory; toggle it. |
| Loudness target | −14 LUFS | −16 / "no spec" | §2.6 |
| Flow Music "inside Flow"? | framia: built in | Google help: separate app | §1.6 |
| TikTok CML size | 1 M songs (Jul 2026) | 600 k+ (older) | newer page wins |

---

## 5. Ad specs (what to build to)

| Spec | Instagram Reels / Stories ads (Meta) | TikTok in-feed (non-Spark) |
|---|---|---|
| Aspect / size | **9:16, 1080×1920** (Meta recommends up to 1440×2560; min width 250 px <30 s / 500 px ≥30 s, 1% ratio tolerance on IG) — all via aggregators ([Sprout](https://sproutsocial.com/insights/social-media-video-specs-guide/), [moda](https://moda.app/resources/sizes/meta-reels-ad), [Kive](https://kive.ai/learn/meta-ad-sizes)) **[C]** | **9:16 ≥540×960** recommended; 16:9 ≥960×540; 1:1 ≥640×640 ([TikTok](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en) **[G]**) |
| Safe zone | **14% top / 35% bottom / 6% sides** free of text/logos (≈270 / 670 / 65 px of 1080×1920) ([Sprout](https://sproutsocial.com/insights/social-media-video-specs-guide/), [Kive](https://kive.ai/learn/meta-ad-sizes) **[C]**, quoting Meta's Ads Guide, which I couldn't load) | Official **downloadable template** per ad-caption length; "the longer the caption, the smaller the safe zone" ([TikTok](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en) **[G]**). One analyst measured it from the template: top 12.5% (240 px), bottom 34.4% (660 px), sides 11.1% (120 px), plus a right-hand action rail ([Solid Labs](https://www.solidlabs.com/social-safe-zones) **[C]**). **Use the union**: top 14%, bottom 35%, sides 11%. |
| Length | Reels ads 0 s–15 min (30 s recommended for Feed, 15 s for Reels) ([adsights](https://www.adsights.ai/resources/guides/meta-ad-creative-video-specs-guide), [Sprout](https://sproutsocial.com/insights/social-media-video-specs-guide/) **[C]**); one source says Facebook Reels ads max 60 s ([Coinis](https://coinis.com/how-to/best-way-to-create-facebook-reels-ad)) — **disagreement**, irrelevant ≤30 s | up to **10 min**; **TopView** 5–60 s (recommend 9–15 s) ([TikTok](https://ads.tiktok.com/resources/help/article/tiktok-reservation-topview) **[G]**); our target 15–30 s |
| File | MP4/MOV (GIF in some), H.264, **≤4 GB**; image overlays ≤30 MB | `.mp4 .mov .mpeg .3gp .avi`, **≤500 MB**, **≥516 kbps** (≥2,500 kbps for reservation/TopView) |
| Frame rate | 24–60 fps accepted per aggregator ([postfa.st](https://postfa.st/sizes/facebook/reels) **[C]**) | not specified |
| Captions | optional but recommended (Sprout) — our burn-in + `.srt` | **Ad caption** shown in white, uniform non-customisable font; **no clickable links, @, or hashtags** in non-Spark ad captions ([TikTok](https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?lang=en) **[G]**); Spark Ads caption max 4 lines |
| Music | Sound Collection only (no licensed music) | CML or owned only |
| Cover/profile grid | Reel cover shown in 9:16; **profile grid centre-crops 3:4 (~1080×1440)** | profile photo 98×98 px ≤50 KB |
| Disclaimers | auto "AI info" in "About this ad" | AI-generated **disclaimer toggle** (below video, whole ad) |
| 4:5 vs 9:16 in feed | 4:5 (1080×1350) is the max-height *feed* image/video; a 9:16 asset is cropped in-feed; build 9:16 master + 4:5 centre crop (§2.8) | n/a — vertical only |

**Organic vs paid:** organic Reels in-app can run much longer (Sprout: up to 20 min in-app, 3–90 s via publishing API) — irrelevant to the 15–30 s plan.

---

## 6. QC checklist, and campaign folder / naming convention

### 6.1 Pre-review QC (run by the agent before showing the user)
**A. Automatic (ffmpeg/ffprobe; all detectors ✅ TESTED to run; thresholds are starting points):**
1. `ffprobe`: codec h264/High, 1080×1920 (or documented exception), pix_fmt yuv420p, constant fps (r_frame_rate = avg_frame_rate), duration within target (±0.5 s), size < 500 MB, audio AAC 48 kHz stereo.
2. `blackdetect=d=0.2:pic_th=0.98` — flag black frames ≥0.2 s (a failed generation or bad join).
3. `freezedetect=n=-60dB:d=0.5` — flag frozen video. **My test flagged the static end card as a "freeze" at 8 s** — whitelist the end-card window.
4. `silencedetect=n=-50dB:d=0.5` — dead audio gaps.
5. `ebur128=peak=true:framelog=quiet` → I within −14 ±1, true peak ≤ −1 dBTP, LRA ≤ 11.
6. `cropdetect` to catch unexpected letter/pillarboxing; compare to 9:16.
7. Safe-zone overlay render ✅ (`drawbox` red bands for top 14%, bottom 35%, sides 6% → human glance, or compute text-bbox overlap from the `.ass`).
8. Contact sheet: `ffmpeg -i final.mp4 -vf "fps=1,scale=270:-1,tile=6x4" sheet.png` ⚠ UNTESTED (standard); lets the agent (or a vision model) check artifacts without watching.
**B. Artifact review (visual, per shot, from frame grabs at start/mid/end):**
- Hands/fingers, teeth, eyes, ears; face morphing between frames; limb count.
- **Garment:** hoodie/tee silhouette (oversized proportions), seams, hem, drawstring symmetry, **print/logo shape and spelling** (AI warps small type — reject), fabric physics, colour vs the real SKU.
- Background: warped signage, gibberish text, floating objects, physics breaks; **unwanted baked-in text/subtitles/watermarks** (visible watermark toggle is off in Canada but check, [Get started](https://support.google.com/flow/answer/16353333?hl=en&co=GENIE.Platform=Desktop)).
- Temporal: flicker, texture crawl on fabric, jump cuts that are not intentional, **identity drift between shots** (same Character?).
**C. Brand:** palette (black/white + restrained orange accent), correct wordmark/logo and clear-space, brand font in captions/end card, tone, no competitor marks or real celebrities (policy refusals, [Where you can use Flow](https://support.google.com/flow/answer/16353544?hl=en) **[G]**).
**D. Audio:** speech intelligible over music (duck ≥6 dB); no unprompted melody/sound-alike (§3); no clipping; music from an allowed source with the licence reference attached; dialogue lip-sync OK (<~10 words per clip, playbook §5.4).
**E. Disclosure & claims:** AI-generated flag set per platform (§4); `#Ad`/paid-partnership if an ambassador or free-product relationship exists (§4.3.7); no fake testimonial/"review" from an AI persona; price = all-in price (drip pricing); no unsupported performance/origin/fibre claims; "was" prices genuine; French variant if Quebec.
**F. Accessibility:** burned captions for all speech + sidecar `.srt` (WCAG 1.2.2 captions for prerecorded audio, [W3C](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html) **[G]**); caption/background contrast ≥4.5:1 (normal text; 3:1 large) ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) **[G]** — a web standard used here as a legibility benchmark, not a legal requirement for ads); **no more than 3 flashes per second** in strobing cuts (WCAG 2.3.1, [W3C](https://w3c.github.io/wcag/guidelines/22/) **[G]**); meaningful alt text / description in the post caption; don't convey information by colour only (orange accent).
**G. Output record:** `qc_report.json` (checks + pass/fail + frame grabs + loudness + licence/AI-inventory fields) stored beside the file; **only show the user drafts with zero hard-fails**.

### 6.2 Review hand-off
Show the user: the 9:16 final, 4:5 crop, cover still, caption `.srt`, the QC report (≤10 lines), the **AI-disclosure setting that will be used**, music source/licence line, and cost summary (Flow credits used). He approves the *post*, not the QC.

### 6.3 Folder & naming convention (our design)
```
campaigns/
  2026-FW_hoodie-drop/                       # {YYYY}-{season}_{slug}
    00_brief/        brief.md  shotlist.md  claims.md  (price/origin/fibre facts, source of truth)
    01_refs/         char_{name}_v01.png  product_{sku}_{colour}_v01.png  look_acme_v03.cube  fonts/  logo/
    02_flow_raw/     S01_v01_omni360.mp4  S01_v02_omni360.mp4 ...  (as downloaded)  + _meta/S01_v02.json
    03_selects/      S01_v02_720p.mp4  S02_v03_1080p.mp4          (keepers only)
    04_audio/        music_{source}_{id}.wav  music_{source}_{id}.licence.txt  vo/  sfx/
    05_edit/         cap_{cut}.ass  words_{cut}.json  captions_{cut}.srt  beatgrid.json  stitch_{cut}.json
    06_exports/      EPS-FW26-HOODIE_hookA_9x16_v03_2026-10-20.mp4   (+ _4x5, _cover.png)
    07_qc/           EPS-FW26-HOODIE_hookA_9x16_v03_qc.json  sheet.png
    08_published/    (copy of what actually went live + platform, date, AI-label setting, post URL)
```
- **Filename grammar:** `{CAMPAIGN}_{concept}_{ratio}_{v##}_{yyyy-mm-dd}.{ext}`; shots `S##_v##_{model}{res}` ; `v##` increments on any change; **never overwrite** an approved export.
- **Sidecar `_meta/*.json` fields:** `prompt_final`, `agent_session`, `model`, `length_s`, `resolution`, `ingredients[]`, `characters[]`, `credits`, `flow_project`, `flow_asset_name`, `ai_generated=true`, `reject_reason` — doubles as the AI-creative inventory recommended for ad-label compliance ([Digital Applied](https://www.digitalapplied.com/blog/ai-content-labeling-rules-advertisers-2026-reference) **[C]**).
- **Retention:** keep raw downloads (Flow history can be cleared; Takeout export exists — [Download your Flow data](https://support.google.com/flow/answer/17571126?hl=en) **[G]**) and `licence` evidence for the life of the ad plus a cushion (suggest ≥3 years — **[unverified]**, ask counsel).

---

## 7. Recommended Acme pipeline v1 (brief → approved export)

Legend: **A** = automated by existing tools · **P** = partly (needs wrapper/params) · **N** = needs new tooling · **H** = human.

| # | Step | Tooling | Status |
|---|---|---|---|
| 1 | **Brief & claims sheet:** concept, hook archetype, target length (15–30 s), 3–5 shots, *claims.md* (price all-in, origin, fibre, offer dates). Check §4.3 *before* generating. | Agent/LLM + template | **N** (template) / **H** (approve) |
| 2 | **Project setup in Flow:** one project/campaign; Collections `00_refs…04_rejects`; Agent Instructions with brand rules; **Confirm before generating = Always**; default 9:16, Omni 1.1 Flash. | `flow_status`, `flow_discover_ui`, `flow_create_character`, `flow_import_character`, `flow_open_characters` | **P** (settings toggle automation unverified) |
| 3 | **Lock references:** real product stills as ingredients; Character(s); brand look still. | `flow_generate_image`, `flow_create_character` | **A** |
| 4 | **Draft shots at 360p**, ~3 per shot, via Agent (batch) or prompt box; log prompt/credits. | `flow_generate_video` | **A** + **N** (sidecar writer, cost gate) |
| 5 | **Auto-QC drafts** (§6.1-A/B quick subset) and shortlist ≤3/shot. | — | **N** `qc-report` |
| 6 | **Promote keepers:** free 360→720 upscale, then Flow **1080p download**; save last frames for continuity. | `flow_download_latest`, `flow_save_frame` | **A** (upscale/1080 click path to verify live) |
| 7 | **Music:** Flow Music session (tempo/duration set) under the PRO-mapped plan *or* Meta Sound Collection / TikTok CML track; save licence evidence. | none (Flow Music is a separate app; no MCP) | **N** `flowmusic` browser tool *or* **H** (manual download + upload to `04_audio`) |
| 8 | **Assemble:** order, trim, joins; beat-aligned cuts from BPM; end card. | `flow_stitch_videos` (cuts/crossfade/9:16/music) | **P** → **N** `acme-assemble` (beat grid, end card, grade) |
| 9 | **Grade:** brand LUT + grain, apply to all clips. | ffmpeg recipe §2.2 | **N** (`apply-look`) |
| 10 | **Captions:** STT → script-aligned words → `.ass` (brand font, safe zone) + `.srt`; burn. | existing `.srt` burn is unsafe (§2.0) | **N** `auto-caption` (whisper + ASS generator) |
| 11 | **Mix + duck + loudnorm** (−14 LUFS/−1 dBTP). | ffmpeg §2.5–2.6 | **N** (`audio-finish`) |
| 12 | **Export master + variants:** 9:16 H.264 master, 4:5 crop, cover still, `.srt`. | ffmpeg §2.7–2.8 | **N** (`export-ad`) |
| 13 | **Full QC + compliance report** (§6.1 A–G), safe-zone overlay, contact sheet; fail-closed. | — | **N** `qc-report` |
| 14 | **Human review:** the user sees final + QC summary + disclosure setting + music licence + credits. | message / screenshot | **H** |
| 15 | **Publish prep (no auto-post):** caption text with `#Ad`/AI line as required; set **TikTok AI-generated disclaimer** / Meta self-declare where the account offers it; use only CML / Sound Collection audio; store in `08_published`. | — | **N** `publish-checklist` (generator only) / **H** (post) |
| 16 | **Post-mortem:** which hook/variant won; feed reject reasons back into Agent Instructions & negative prompts. | — | **H** + **N** (log parser) |

### Build order (what I'd build first, and why)
1. **`qc-report`** (ffprobe + blackdetect/freezedetect/silencedetect/ebur128 + contact sheet + safe-zone overlay → JSON). All detectors proved to run; it protects credits (cull drafts) and the user's time, and gates everything after.
2. **`auto-caption`** (whisper.cpp or faster-whisper → script-aligned words → ASS with PlayRes 1080×1920, `MarginV≥760`, brand font via `fontsdir`; also writes `.srt`). Fixes the **live bug** that today's `.srt` burn lands in the Reels/TikTok UI zone.
3. **`audio-finish`** (sidechain duck + 2-pass loudnorm + verify). Small, tested, high payoff; the current 0.35 mix has no duck and no loudness target.
4. **`export-ad`** (final H.264 encode + 4:5 crop + cover + sidecar JSON with AI/music/licence fields).
5. **`end-card` / `apply-look`** (logo PNG overlay + brand `.cube` + grain), then **`beatgrid`** (BPM → cut list; librosa only if we use licensed music with unknown tempo).
6. **Sidecar writer inside `flow_generate_video`** (persist final prompt, model, length, credits) + **credit gate** that refuses Agent confirmations above a per-run cap.
7. **Flow Music helper** — lowest priority; a manual download is acceptable until volume justifies browser automation.

---

## 8. Open questions / unverified (do these live or with counsel)
1. Does a Flow **download carry a C2PA manifest**? (Run `c2patool` or Meta's/Gemini's verify tool on one file.) Does the Meta "AI info" label fire on an unmodified Flow clip in Canada?
2. Is the free **360p→720p upscale** equal in quality to a native 720p render? (A/B before banking on the draft-first saving.)
3. Does Instagram/TikTok **re-time 24 fps** content badly vs 30? (Upload a test pair to a private account.)
4. Flow Music **commercial terms on the PRO-mapped Plus plan** — read the in-app terms page and screenshot; confirm the Google One checkbox was ticked.
5. Exact **Meta Reels ad specs** (Ads Guide pages 404'd for the extractor) — confirm in Ads Manager's upload preview. Same for any Canada-only Meta AI-label wrinkle.
6. TikTok **AI disclaimer availability** on Acme's account ("contact your sales representative" if absent) and whether TikTok Canada's undertakings change ad onboarding.
7. Quebec, privacy/likeness releases, CASL, children's advertising — counsel.
8. Which `faster-whisper`/`whisper.cpp` model size gives acceptable accuracy on *Flow-generated* speech (short phrases, synthetic voices) — benchmark on 5 real clips.

---

## 9. Source index (distinct URLs actually read or seen as primary snippets)
**Google/Flow [G]:** support.google.com/flow/answer/{17093911 (also support.google.com/labs/answer/17093911), 16352836, 16526234, 16353334, 16353333, 16935308, 16935718, 16893714, 16353544, 17102997, 17571126, 17083868, 17083870, 17084348, 17084421}; support.google.com/googleone/answer/16882689; blog.google (flow-updates; lyria-3-5; new-creative-controls-google-flow; identifying-ai-generated-media-online); flowmusic.app/pricing; ai.google.dev/gemini-api/terms.md.txt; support.google.com/youtube/answer/3376882.
**Meta [G]:** meta.com/help/artificial-intelligence/{1783222608822690, 355108217670024}; about.fb.com/news/2025/02/gen-ai-transparency-metas-ads-products/; facebook.com/business/help/{402084904469945, 759279452000505, 880459498798521}; transparency.meta.com ad-standards (unacceptable-business-practices, misinformation).
**TikTok [G]:** support.tiktok.com (ai-generated-content; commercial-use-of-music-on-tiktok); ads.tiktok.com help (commercial-music-library, how-to-use-the-commercial-music-library, tiktok-auction-in-feed-ads, tiktok-reservation-topview, add-disclaimers-to-ads, about-the-content-disclosure-setting-for-creators, misleading-and-false-content); ads.us.tiktok.com about-ad-disclaimers; ads.tiktok.com blogs and Music_Legality.pdf; newsroom.tiktok.com (more-ways-to-spot…); business-api.tiktok.com docs; seller-us.tiktok.com AIGC rules.
**Canada [G]:** competition-bureau.canada.ca (drip-pricing; general-impression-test; misleading-representations; influencer-marketing; ordinary-selling-price; ordinary-price-claims; made-canada-claims; product-canada guidelines; guide-2022-amendments; textile guide + accuracy; AI consultation); laws-lois.justice.gc.ca s.74.01; canada.ca (Minister Joly TikTok statement); adstandards.ca Influencer PDF.
**Law-firm/trade [C]:** BLG (Oct 2026), DWPV, McCarthy, Aird Berlis, Bennett Jones, Marks & Clerk, Gowling, Cain Lamarre, Miller Thomson, Wolters Kluwer, Blakes.
**Technical/community [C]:** ayosec ffmpeg-filters-docs (loudnorm, lut3d, subtitles), librosa docs, whisper.cpp / faster-whisper / stable-ts (GitHub, DeepWiki), Real-ESRGAN ncnn + fork, SIL OFL FAQ, Pixabay, Freesound, Epidemic Sound; Sprout, Kive, moda, postfa.st, Coinis, adsights, Solid Labs, doom10, Lilach Bullock, Neal Schaffer, fitpreview; mediastrategylab, notnoise, valmera, audiopod; Digital Applied, Social Media Today, Lumethic, AdTestBench; Soundstripe, jackrighteous, aiwiki, kompozy, sonilo, snapgen, itechguides, whataidoineed, framia; aigcdev, thriftizer, funiqskills, ugcgen, MindStudio, Luma; YouTube walkthroughs (Nova Autonomous; Digital Seller Academy); W3C WCAG 2.2 pages.
