# Google Flow Tools & the Tool Builder — cited field guide for Acme

**Compiled:** 2026-10-17 (research only: web search/extract; nothing was created in Flow, no credits spent, no logins, no browser touched).
**Builds on (not repeated):** `FLOW-UI-MAP.md` §5/§10, `docs/research/flow-official-facts.md`, `docs/research/flow-creative-playbook.md`.
**Tags:** **[G]** = Google first-party page (help center, blog, Flow site, Google X account/YouTube). **[C]** = community / third-party / creator. **[L]** = our own live-verified note in `FLOW-UI-MAP.md`. **[unverified]** = inference or single weak source. "(inferred)" = my reading of a [G] sentence, not a Google statement.
**Research limits (read first):** no source I could reach documents the applet runtime's API surface, sandbox policy, quota numbers or the Tool Builder's system prompt. Reddit had almost no Flow-Tools-specific threads (searches returned generic vibe-coding threads); the useful community material is YouTube/Substack/X. Several fetches were rate-limited (Firecrawl 429), so a few pages are known only from search snippets — those are marked.

---

## 0. Top takeaways (the 12 things that matter)

1. **Tools are LLM-written mini web apps, not saved presets.** Google: "Google Flow writes the code and builds the tool's interface for you" [G: https://support.google.com/flow/answer/17104535?hl=en]. Anyone sharing a link shares the *code* [same page].
2. **Everyone can run Tools; creating/remixing needs a paid plan.** Google's plan table lists "Google Flow Tools (Usage only)" on the free tier and "Google Flow Tools (Creation)" starting at Google AI Plus ($4.99/mo US list) [G: https://flow.google.com/]. Two creators say "Pro/Ultra" [C: https://www.youtube.com/watch?v=yqAxSVpoSPo] — Google's own table disagrees (see §9).
3. **Building is not billed in credits; running a generative step is.** "Agent queries do not currently cost Google Flow credits… there is a daily quota on how many Tools you can create"; "Media generated through Tools uses your Google Flow credits" and a warning banner appears when a run might spend credits [G: support 17104535]. The quota number is **not published** [C: https://saascrmreview.com/google-flow-review/].
4. **The person who clicks Generate pays** (inferred from "uses *your* credits" + output saved to "the project you currently have open"). Nothing in any source says the author pays when someone else runs a shared tool.
5. **Sharing = snapshot of code at link time; the only way to stop sharing is to delete the tool** [G: support 17104535]. Never bake brand assets into a tool you share — default images travel with the link [C: https://www.youtube.com/watch?v=yqAxSVpoSPo].
6. **The applet agent is weak at restraint.** It "will 'help' by changing things you didn't ask it to touch", so save versions as you go and change one thing at a time [C: https://carlaeng.substack.com/p/personalize-your-ai-animation-tools].
7. **Version control is manual** (remix + rename; chat rollback works only sometimes) [C: https://carlaeng.substack.com/p/google-flow-ai-animation-pipeline].
8. **No official API/CLI/MCP exists for creating or running Tools.** Only UI automation (third-party MCP servers; ours). Details in §7.
9. **Privacy:** tool sessions are stored 18 months by default; human reviewers see a sample with uploads/tool outputs disconnected from your account; "Help improve Flow" toggle exists [G: https://labs.google/flow/privacy]. Canada is a supported country [G: https://support.google.com/flow/answer/16353544?hl=en]. Tools are web/PC only [G: support 17104535].
10. **Best ROI for an apparel brand = zero-credit utility tools** (hook writer, shot planner, safe-zone checker, palette checker, caption stamper, sequencer) — the model-calling tools (grid, multi-angle) are the ones that can drain credits.
11. **Vet community tools like third-party code.** Code is inspectable ("while in editing mode… you can actually view the underlying code" [C: carlaeng pipeline post]) but no source documents network/egress restrictions, so assume a tool can send your uploads anywhere until you read the code (§8.2).
12. **Official template one-liners are thin; credit cost per tool is never published** — a tool's cost is just the model calls it makes (use the credit table in `FLOW-UI-MAP.md` §6 [L]).

---

## 1. What Flow Tools are and how they work

### 1.1 Official facts [G]

| Fact | Source |
|---|---|
| "Build custom, reusable tools and mini-apps using natural language… share Tools publicly and add shared Tools to your library. Google Flow also comes with a preset of Tools supplied by Google." | https://support.google.com/flow/answer/17104535?hl=en |
| Web & PC only (no mobile) | same |
| Created from Tools → Create Tool → describe → Generate → review → **Save** | same |
| Edit: open tool → **Edit** (top) → describe change on right → Generate. More menu: Edit icon, Edit description, Rename, Pin (this project), Remix tool, Favorite (heart, global) | same |
| Launched May 19, 2026 (I/O): "All Google Flow users globally are able to use existing Tools, while Google AI subscribers can also create and remix them." | https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/ ; https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/ |
| Keynote framing: "vibe code any creative tool… designing video effects, hand-drawn animations, or layering text" | http://www.youtube.com/watch?v=FLynjUYg79I (transcript seen in search snippet) |
| "Flow Tool Builder uses Gemini behind the scenes to write code" (Google's own workshop film) | https://www.youtube.com/watch?v=_qWItNk5a9Q |
| Plans: Free = 50 daily credits + "Google Flow Tools (Usage only)"; AI Plus $4.99 = 200 monthly credits + "Google Flow Tools (Creation)"; Pro $19.99 = 1,000; Ultra $99.99 = 10,000; $199.99 = 25,000 ("prices may vary by market") | https://flow.google.com/ |
| Gemini subscriptions page also lists "custom tool creation" with the 200-credit tier | https://gemini.google/subscriptions/ (search snippet) |
| Official X how-to: Tools → **Create New** under My Tools → describe → test window → save; non-generative output (doodle, text overlay, shader) "must be specified to be saved in your project media or they'll default to exporting"; heart icon to keep it across projects | https://x.com/FlowbyGoogle/article/2077884458993406337 |
| Community submission: My Tools → open tool → "Apply to be featured" → form (name/description/thumbnail auto-fill) → email if selected; Community tab declared live Jul 22, 2026 | https://x.com/FlowbyGoogle/status/2079971262278054263 |
| Changelog entry "Community Tools Market" dated 6/30/2026 and "Agent, Google Flow Tools, Gemini Omni Flash, and more!" 5/19/2026 | https://labs.google/fx/tools/flow/changelogs |

### 1.2 What the applet can call (evidence ladder — no official API list exists)

| Capability | Evidence | Tag |
|---|---|---|
| Image generation with **Nano Banana 2 / Pro** | Carla's Shot-Explorer-style spec had "Fast: Nano Banana 2 … Pro: Nano Banana Pro"; her thumbnail tool "uses Nano Banana Pro for image generation" | [C] https://carlaeng.substack.com/p/personalize-your-ai-animation-tools ; https://carlaeng.substack.com/p/how-to-vibe-code-a-personalized-thumbnail |
| **Video** generation (Omni Flash / Veo) inside a tool | A tool built to "generate each individual video scene using OmniFlash… then join all the scenes" ; TheAIGRID adds a "create video" button to a sketch tool; he also says you can tell the builder "add nano banana pro, add VO3.1 flash as the default" | [C] https://www.youtube.com/watch?v=G74ltLKqQi0 ; https://www.youtube.com/watch?v=yqAxSVpoSPo |
| **Gemini text/LLM** inside the running tool (headline brainstorm, prompt writing) | thumbnail tool "uses … an LLM to write the prompts behind the scenes"; Carla: "Gemini text/tokens cover everything conversational" as a separate cheaper meter | [C] carlaeng thumbnail post ; personalize post |
| Pick from / save to the **Flow media gallery** | "Gallery Integration: a Select Image workflow to pull starting frames from the Media Gallery"; Mockup demo imports from other projects' uploads; "All media generated by a Tool is automatically saved to the project you currently have open" | [C] personalize post ; [C] https://www.youtube.com/watch?v=nafm6r1V2io ; [G] support 17104535 |
| **File upload** (images; videos) | "You can sometimes upload specific files like images, but that's the limit." Video Resizer takes video in; Type Overlays/Resizer operate on clips | [C] personalize post |
| **Subject-aware video analysis** (smart reframe) | Remixed Resizer "analyzes the subject, and you export a vertical clip that tracks the action" — mechanism unknown (client vs Gemini) | [C] personalize post |
| **Local ffmpeg-in-browser** | **No source says Flow tools use ffmpeg.wasm.** Type Overlays is reported "punishingly slow to render", which is *consistent with* client-side rendering but is not proof. | [unverified] |
| **Persistent storage** across sessions | "Memory is currently limited (no persistent file storage yet)"; her Storyboard remix lost work on reload until she asked for save/load | [C] https://carlaeng.substack.com/p/google-flow-ai-animation-pipeline |
| Access to desktop files / Drive | "Flow runs in a contained space with no access to your desktop or Drive." | [C] personalize post |
| External web APIs / third-party fetch | **Not documented anywhere.** Treat as possible-until-proven-blocked for security, and as unavailable for planning. | [unverified] |
| Sandbox | Applet renders in a `scf.usercontent.goog` iframe (cross-origin from flow.google.com) | [L] FLOW-UI-MAP §5 |

Comparison point: Google AI Studio "Build" apps can use Firebase/Firestore, auth and a server runtime [G: https://ai.google.dev/gemini-api/docs/aistudio-build-mode]. Nothing equivalent is documented for Flow applets, and Carla's "no persistent storage" observation says it is not there. Don't assume AI-Studio features in Flow.

### 1.3 Credits, quotas, who pays

* Agent/builder queries: free "currently", but under a daily quota [G: support 17104535]. Creation also under a daily quota; Flow's own `/create-tool` footer says "Creating tools does not currently cost credits" [L].
* Two meters (creator's framing): Gemini-text for building/remixing/exploring vs video credits that "tick down only when you actually generate images or video" [C: personalize post].
* Quota values: Google does not publish them; a review site says the same [C: https://saascrmreview.com/google-flow-review/]. Learn it empirically (open question Q1).
* Credit table for model calls: see `FLOW-UI-MAP.md` §6 [L] (Omni 1.1 Flash 720p 7/10/12/15 for 4/6/8/10s; Veo Lite 10, Fast 20, Quality 100; Omni edit of existing video 40). Images: no published price; one free-tier tester reports the image menu showing 0 credits but a separate daily image cap [C: https://workshop.tingyudeco.com/google-flow.html].
* Credits don't roll over; daily 50 refresh from first use [G: https://support.google.com/flow/answer/16526234?hl=en].
* **Who pays for a shared tool:** the runner (inferred, see takeaway 4). A free-tier runner can run it ("Usage only") but spends their own 50 daily credits [G: flow.google.com plans].

### 1.4 My Tools vs Community vs Templates

* Gallery tabs today: **My Tools / Community / Templates** [L]; a YouTube walkthrough shows the same three tabs [C: https://www.youtube.com/watch?v=6sXs-aGtU4c snippet]. The July workshop write-up calls the Google-built tab "Discover" [C: personalize post] — pre-Community naming, same content.
* **Templates** = Google/partner-built, fixed set (34 observed [L]; a medical-education blog independently says "34 Flow Tools" [C: tingyudeco]).
* **Community** = user-submitted tools curated through the "Apply to be featured" form with human review (Google says submissions are "reviewed"; criteria unpublished) [G: x.com/FlowbyGoogle/status/2079971262278054263].
* **My Tools** = account-wide, filled with your creations and remixes [L]. Opening a shared link "creates the tool in their workspace" [G: official X article].
* Categories used in Google's own X guide: Image, Video, Prompting, Experimental [G: https://x.com/FlowbyGoogle/article/2077884458993406337].

### 1.5 Sharing, remix, deletion

* Link exposes **code, name, thumbnail** (incl. default thumbnail images); link is a **snapshot** — later edits are not shared; stopping sharing = delete the tool [G: support 17104535].
* Recipients can view, remix and re-share [C: https://www.youtube.com/watch?v=yqAxSVpoSPo]. Free users cannot create/remix [C: https://www.geeky-gadgets.com/google-flow-tools-guide-2026/].
* A tool's default sample images ship in the share [C: yqAxSVpoSPo].
* Delete also deletes it for people it was shared with [L, from help text per FLOW-UI-MAP §5].
* Claims of an authorship chain / "private tools visible only to a working group" appear in one SEO article [C: https://pasqualepillitteri.it/en/news/2944/google-flow-tools-custom-ai-workflows] — **not supported by Google's help page, treat as [unverified]**.

### 1.6 Privacy, region, policy

* Flow collects interactions, uploads, outputs; "By default, Google stores your sessions with the Agent and Tools for 18 months"; human reviewers read a sample; uploads and tool outputs are disconnected from your account before review; toggle "Help improve Flow" in the main menu; reviewed conversations are retained up to 18 months even after deletion; tool outputs/sessions must be deleted individually [G: https://labs.google/flow/privacy].
* Canada is on the supported-country list; 18+ [G: https://support.google.com/flow/answer/16353544?hl=en; https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/].
* Avatar data cannot be shared via Tools [G, already in `flow-official-facts.md` line ~127: https://support.google.com/flow/answer/17102997?hl=en].
* Data export (Takeout) covers media, prompts, projects, characters, scenes [G: https://support.google.com/flow/answer/17571126]; it does **not** list tool code — so **back up tool code yourself** (open question Q9).

---

## 2. Lifecycle — create, test, edit, version, share, use

### 2.1 Step list (agent-executable)

1. Open a project → sidebar **Tools** → **Create tool** (`/project/<id>/create-tool`) [G+L].
2. Paste one prompt (≤ ~250 words works; Carla pasted ~500 words in "YOLO mode" successfully, ~1 minute build) [C: carlaeng thumbnail post]. Starter chips exist (Time stretcher, Style morph, Image filter) [L].
3. Click **Generate**; wait for the agent to finish; review the interface; click **Save** [G].
4. **Test with a fixture, not real brand files** (§2.3).
5. **Edit** (top switch) → use the sidebar textarea "Ask applet agent to make changes" for changes; one change per message [G+C].
6. After every working state: **Remix tool → rename `Name v1`, `v2`…** = your only reliable version history [C: carlaeng pipeline post].
7. Favorite (heart) to expose it in all projects; Pin for current project [G].
8. Share only when the code contains no brand secrets/default brand images (§8) [G+C].

### 2.2 Iterating with the applet agent (what creators report)

* Brief it "like a junior engineer who will execute your request literally" [C: personalize post].
* "Prototype, then rebuild": the first chat is for discovery; then write a clean feature list and start a *fresh* tool [C: pipeline post].
* Split a large spec: give the full context, then "focus on a particular section first" [C: personalize post].
* If a tool misbehaves, **try different images/prompt phrasing before blaming the code**; then use the Edit chat to debug [C: https://www.youtube.com/watch?v=yqAxSVpoSPo].
* Missing generation behaviour is often a *model/config* gap: TheAIGRID's multi-angle tool did nothing until he said "Add a section so I can choose the image model to use" [C: same video].
* The agent is inconsistent — "a prompt that worked a minute ago can come back flagged, and re-running it sometimes just works" [C: personalize post].
* Exports can silently not land in the gallery (Carla's Resizer remix: "the export option was not saving to the gallery", later fixed) [C: personalize post].
* You can read the generated code in edit mode and have an outside coding agent audit it [C: pipeline post].
* A Vietnamese tutorial argues for starting from a Google template (it shows an n8n-style zoomable node canvas) rather than describing a complex automation cold [C: https://www.youtube.com/watch?v=02cu2P8CSN8 — page shows only the opening; claim from the visible excerpt].

### 2.3 Testing protocol (ours)

1. **Fixture pack**: 1 flat product jpg, 1 4-second 9:16 clip, 1 neutral audio file — no faces, no real unreleased products.
2. Run the happy path; screenshot the iframe; record the footer text. If it says "This Tool may consume credits" [L], do **not** click generate until the credit quote is read.
3. Break it: empty inputs, huge file, wrong aspect ratio, double-click on Generate.
4. Check the outputs actually land where promised (project gallery vs downloads) — see X-guide save rule [G].
5. Reload the page: does state survive? (Probably not [C].)
6. Remix-snapshot as `v1`, then iterate.

---

## 3. Writing a good Tool Builder prompt

### 3.1 Structure that repeatedly works (synthesised from [C] sources)

```
GOAL (1 sentence: what it makes, for whom)
INPUTS (every field, type, default, required?)
PROCESS (numbered steps, which model/LLM per step; fast vs pro toggle)
OUTPUTS (what appears, file type/size, where it is saved, naming)
UI (tabs/sections in order, buttons, empty states, error messages)
RULES (brand constants, limits, "never do X")
BUILD ORDER ("build navigation and layout first, then each tab in order")
ACCEPTANCE (what I will test)
```
Sources for the ingredients: product-manager-style feature list [personalize post]; four-tab architecture + "never-lose-my-work navigation first" [thumbnail post]; "describe the desired outputs first… add dropdowns for options… upload a sample image early" [https://www.wisdomai.com/insights/TheAIGRID/google-flow-tools-creative-workflows-remix-tools-ai-image-video-cf3232c1].

### 3.2 Real prompts people used (verbatim where the source gave them)

| # | Prompt | Result | Source |
|---|---|---|---|
| a | "Make an image filter app with a slider for grayscale and hue shift." | Google's own example | [G] support 17104535 |
| b | "Build a tool that adds a warm, 1970s cinematic grain filter to any uploaded video clip and ensures consistent audio tones." | Google's X example (also suggests `{scene_description}` style variables) | [G] https://x.com/FlowbyGoogle/article/2077884458993406337 |
| c | "Build a tool that allows me to instantly get multiple shots of the current scene. Make it so I can have drop-down menu of how I want the scene to look before the angle…" | Angle grid worked only after he added "Add a section so I can choose the image model to use." | [C] https://www.youtube.com/watch?v=yqAxSVpoSPo |
| d | "Make it so it has a video creation button." (on remixed Simple Sketch) | "create video" button added to each result | [C] same |
| e | "Add a smart reframe option so that when the video is reframed from 16:9 to 9:16, the character stays in view. Don't just hold the center of the frame, smartly follow the character." | Working "smart character follow" option; export bug fixed later | [C] personalize post |
| f | "In Storyboards, add an option to provide notes to edit the existing image rather than regenerating it." and "Also add a tab with animation capability that uses the storyboards and the script to create prompts… submit each individually or all for batch." | Edit-in-place + animate tab | [C] personalize post |
| g | Thumbnail blueprint (4 tabs: Background / Text Overlays / Visual Styles / Prompts; keep-lists; "Write all prompts"; "generate all"; "download all" bundle; build nav first, then tabs one at a time) | Functional app in ~1 min build, ~15 min total with fixes (bullets leaked into text; initial headlines non-editable; host image replaced by random people until told not to) | [C] https://carlaeng.substack.com/p/how-to-vibe-code-a-personalized-thumbnail |
| h | "I need a tool where I can select animated clips, edit their length, add text to timed portions, and export the whole thing as a single file." | Video editor tool; she added crop/transition/download | [C] pipeline post |
| i | Long-video tool: script split by "scene 1, scene 2…", generate each with Omni Flash, concatenate in order (prompt drafted by ChatGPT; user later had to specify clip length) | Auto long-video assembly | [C] https://www.youtube.com/watch?v=G74ltLKqQi0 (excerpt) |
| j | Remix hack: "Just click remix tool at the top center, then hit edit… type something like every image must be green" | Demonstrates a global-rule remix | [C] https://www.youtube.com/watch?v=oIb4K_cnM8A (search-snippet quote) |
| k | Mockup remix adding "studio quality" lighting controls | Mockup engine updated; agent apologised mid-build ("Sorry about that") | [C] https://www.youtube.com/watch?v=nafm6r1V2io |

### 3.3 Six+ pattern templates (ready to adapt)

**P1 — Feature-list spec (new tool).** `Create a tool to [outcome]. It includes: 1) Inputs … 2) Processing … 3) Outputs … 4) UI … 5) Rules …. Build the layout first, then each section in order.` (From Carla's PM-style list [C].)

**P2 — Blueprint-first (outsource the spec).** Ask Claude/Gemini to turn your rough notes into "a simple natural language blueprint", read it, then paste it [C: thumbnail post]. Use when you can't yet describe the tool crisply.

**P3 — Surgical patch (remix/edit).** `In [tool], add [one behaviour]. Do not change any other feature, layout, text or styling. After the change, tell me exactly which code areas you touched.` The last sentence is my addition to counter "helpful" collateral edits [C: personalize post] — [unverified that the agent reports accurately].

**P4 — Model pin + toggle.** `Add a dropdown "Quality": Fast = Nano Banana 2, Pro = Nano Banana Pro. Default Fast. Show which model was used on every result card.` (Echoes Carla's spec and TheAIGRID's "choose the image model" fix [C].)

**P5 — Async result feed with inspector.** `Results appear as cards in a feed; several runs can be in flight; each card has Re-run, Save to project, Delete, and a "prompt inspector" showing the exact text sent to the model.` (Lifted from Carla's Shot-Explorer feature list [C].) Inspector = your debugging window.

**P6 — Staged build.** `First build only the navigation and empty tabs and prove I can move between them without losing data. Stop. I'll tell you which tab to fill next.` [C: thumbnail post "full YOLO" vs section-by-section].

**P7 — Debug patch.** `Bug: when I [action], [observed]. Expected: [expected]. Reproduce: [steps]. Fix only this. Add a visible error message when [condition] happens.` (Pattern from the "talk to the tool in Edit mode" advice [C: yqAxSVpoSPo].)

**P8 — Cost guard.** `Before any button that generates an image or video, show "This will generate N items" and require a confirm click. Add a Dry-run mode that produces the prompts only.` — My recommendation; Flow already shows its own banner [G] but a dry-run mode makes agent testing free. Effectiveness [unverified].

**P9 — Export contract.** `Every result has Download and Save to project. Name files [tool]-[timestamp]-[n].` Needed because non-generative output defaults to export, not project save [G: X guide].

**P10 — Brand constants block** (reuse everywhere): `Brand: Acme. Palette: black #000000, white #FFFFFF, orange accent #FF5A1F (editable fields, default as shown). Accent ≤ 10% of any frame. Typeface: clean grotesque sans, uppercase, wide tracking (selectable). No emojis, no stock-photo look, copy in sentence case.` (Orange hex is my placeholder — replace with the real value.)

---

## 4. Catalogue of existing tools

Credit cost per *tool* is never published; cost = the model calls inside it ([L] §6). "Ad use" is my judgement for IG Reels/TikTok apparel ads.

### 4.1 Google Templates

| Tool | What it does (source wording) | Evidence | Ad use |
|---|---|---|---|
| Type Overlays | "Add animated text to your videos" | [G] https://flow.google.com/ ; slow renders [C] personalize post | Captions/titles — but "do titles in Canva or a real editor" for now [C] |
| Video Resizer | "Resize your videos into any aspect ratio"; no true subject tracking out of box | [G] flow.google.com ; [C] personalize post | 16:9 → 9:16 repurposing; remix for smart reframe |
| Image Editor | "Transform objects, add text, and adjust image sizing with a layer based editor" | [G] flow.google.com | Quick static ad edits |
| Storyboard Studio | "Write a script, create the cast, and visualize a storyboard"; stages Script → Assets → Storyboard, doesn't animate | [G] flow.google.com ; [C] personalize post | Pre-viz of UGC ad sequence |
| Shader Effects | "Apply customizable visual filters to your videos and images" | [G] flow.google.com | Grain/halftone brand look |
| Mockup | "Comp your image into different environments"; works from a logo/graphic; no watermark | [G] flow.google.com ; [C] https://www.youtube.com/watch?v=nafm6r1V2io | Hoodie/tee graphics into scenes |
| Ribbit | "Perform videos live as the beat drives playback." | [G] flow.google.com | Beat-reactive edits |
| Character X-ray | "Develop your characters and their backstory" | [G] flow.google.com ; asks questions to match look to backstory [G: https://www.youtube.com/watch?v=_qWItNk5a9Q] | Persona for recurring character |
| pixelBento | "Apply post-processing effects like lo-fi and glitch" (by László Gaal) | [G] flow.google.com ; blog | Y2K/lo-fi aesthetic |
| Grid Architect | "Create image grids and extract individual images from them" | [G] flow.google.com | 6-up product/lookbook sheets |
| Scout360 | "Capture a 360 degree environment from an image" | [G] flow.google.com | Location scouting |
| Transition Machine | "Generate seamless transitions between your videos" | [L] §10; also in [C] pipeline post | Join generated clips |
| Stringout Creator | "Stitch multiple video clips together" | [L] §10 | Assemble a cut |
| Simple Sketch | sketch (canvas or upload) + description → rendered image | [C] https://www.youtube.com/watch?v=i75QUftYY3A | Low |
| Scene Explorer | describe a location → multiple visual interpretations ("mood board engine") | [C] same | Mood boards |
| Shot Explorer | one angle in → alternate angles out (overhead, zoom, "surprise me"); uses model choice | [C] personalize post | Coverage for a product shot |
| Converge | "Render your sketches" | [G] flow.google.com (earlier landing text) | Low |
| Poster Designer, Video Sketch, Weirdcore, Video Granulator, Mask Magic, Style Writer, Prompt Tree, Story Sketch, Frame Deconstructor, Blob Tracking, DepthWarp 4D, Webcam Set, Datamosh, 3D Model Visualizer, Pose Text, 3D Face Swap, MetaPuppet | Names confirmed [L]; the 10 standard video presets named in [C] https://www.youtube.com/watch?v=NdK6SYl9DXk (keywords); "DepthWarp 4D" described as quirky/experimental [C] yqAxSVpoSPo | Names only — **no usable descriptions found**; 3D Face Swap needs an identity/consent review before any ad use | n/a |

### 4.2 Google-featured creator tools

* **Mondo Sónico** — background ambience/foley/SFX on separate editable stems [G] https://blog.google/innovation-and-ai/models-and-research/google-labs/six-new-tools-built-by-creatives/
* **CaptionCast** (Jay Pirabakaran) — "transcribes, styles, and animates multilingual captions" in a single pass [G, same page]. **Highest relevance to us** (verify export quality, brand-font control).
* **ThumbnailForge** — single image + headline + prompt → social thumbnails [G, same]; **Surface** — textures mapped to 3D walls/floors [G]; **CollageMotion Pro** — animated collages from text; **SwissFlow Studio** — scripts → Swiss-style motion graphics [G]. Bluntly useful for typographic ad intros.
* **pixelBento**, Kat Zhang's and metapuppet's tools — launch partners [G] https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/
* **Styling Suite** and **Runway Visualization** — co-built with designers Jane Wade and Sergio Hudson for NYFW prep (virtual styling of head-to-toe looks; staging lighting/props within a budget). Fashion precedent; public availability not stated [G] https://blog.google/innovation-and-ai/technology/ai/google-flow-fashion-week/

### 4.3 Community tools seen in sources (all [C], none verified by a Google page except where noted)

| Tool | Author | What | Source |
|---|---|---|---|
| Vector Sticker Studio | Glenn Booker | die-cut stickers from images with style sampler (featured in Community tab) | https://x.com/FlowbyGoogle/status/2079971262278054263 (comment) |
| Angle Studio Pro and others | Latent Space | multi-angle generator; additional custom tools, build-from-scratch demo | https://www.youtube.com/watch?v=LNoULxZ0h7c |
| Thumbnail generator | Carla Engelbrecht | 4-tab headline × style × reference prompt matrix | https://carlaeng.substack.com/p/how-to-vibe-code-a-personalized-thumbnail |
| Smart-reframe Resizer remix; Storyboard remix | Carla Engelbrecht | see §3.2 | personalize post |
| "social media carousel builders", "character consistency generators", "360° drone orbits" | various | named in a Community-tab test video description | https://www.youtube.com/watch?v=fJkzN2p7oY0 |
| "Elite Designer Collective", "Director Camera & Path Vector Board" | various | chapter names in a Burmese Community-tools walkthrough | https://www.youtube.com/watch?v=rBoiD7N-NbU |
| Japanese-portrait "Fine Art Studio" | leftbank | portrait mini-app (note.com; page rate-limited, known from snippet) | https://note.com/leftbank/n/nfd30a6d32702?hl=en |

Gallery URLs of Google's examples (shared-tool links) are in the blog posts above; our MCP's `flow_tools` can list the live Community tab (id, name, author, tags) read-only per a third-party server doc [C: https://github.com/hainguyen-keyti/google-flow-mcp/blob/master/docs/tools.md].

---

## 5. Eight custom tools for Acme

Common agent rules: build in a **throwaway project**; run **dry-run/fixture first**; read the credit banner/quote before any generate click; Remix-save `v1` when green; do not Share until reviewed. Every prompt below is ≤ 250 words (checked by script) and starts with the brand block idea from P10 where relevant. Orange `#FF5A1F` is a placeholder.

### Tool 1 — Caption Stamper (brand-font captions, batch)

* **Why:** captions are mandatory for silent viewing and Flow doesn't burn them in (`flow-creative-playbook.md`); Google's Type Overlays is reported slow [C]; CaptionCast exists [G] but brand-font control is unverified. Zero generative credits.
* **Inputs → outputs:** 9:16 video(s) + caption lines (start/end/text) or pasted SRT → preview + 1080×1920 export with burned-in captions.
* **Risk:** export may be real-time (clip duration) or fail on large files; fonts limited to what the sandbox can load. Credits: none expected.
* **Verify:** 4-second fixture clip with 3 captions → exported file duration ±0.1 s, text inside safe zone, correct case; reload test.

```text
Create a tool called "Acme Caption Stamper". Purpose: burn brand captions onto vertical videos. No AI generation, no credits.
Inputs: upload one or more 9:16 videos; paste captions as lines "start-end | text" or an SRT; choose font from a dropdown (Inter, Archivo, Space Grotesk, Bebas Neue) or upload a .ttf/.otf; style presets: White on black bar, Black on white bar, Orange word highlight (accent colour field, default #FF5A1F); position: lower-third within the safe zone (default margins: top 270px, bottom 670px, sides 120px of a 1080x1920 frame; editable).
Behaviour: live canvas preview with scrubber; captions uppercase option; auto line-wrap at max 2 lines; warn in red if any text falls outside the safe zone.
Output: render each video to 1080x1920 MP4 or WebM with captions burned in; a Batch queue applies the same caption template to many videos; each result card has Download and "Save to project"; files named acme-caption-[n].
Build order: layout and upload first, then caption parsing, then preview, then export. Show a clear error if the browser cannot export.
Do not call any image or video model. Do not add anything not described here.
```

### Tool 2 — Reels/TikTok Safe-Zone Checker

* **Why:** sources disagree on margins by 2× (IG Reels bottom 350–672 px, TikTok bottom 484–660 px) so a configurable overlay beats a fixed template: Solid Labs IG top 269/bottom 672/sides 65 [C: https://www.solidlabs.com/social-safe-zones]; Selzee TikTok 240/660/120 + 180 px button column [C: https://selzee.com/tools/tiktok-safe-zone-checker]; Sprites TikTok 130/484/44/140 [C: https://www.sprites.ai/ad-specs/tiktok/safe-zone].
* **Inputs → outputs:** image/video + platform dropdown → overlay preview, PASS/WARN per sampled frame, annotated PNGs + JSON report.
* **Risk:** none on credits (keep the optional text-detection Gemini call off by default; unknown whether it's metered).
* **Verify:** feed a synthetic image with text boxes placed inside/outside each zone; JSON must flag exactly the outside ones.

```text
Create a tool called "Safe Zone Checker" for 1080x1920 social video and images. No credits, no generation.
Inputs: upload an image or video; platform dropdown: Instagram Reels, TikTok, Both (strictest of the two).
Overlay: semi-transparent red bands for UI-covered areas, drawn on top of the media, toggleable. Defaults (all editable number fields, in pixels at 1080x1920): top 270, bottom 670, left 120, right 120, plus a right-side action column 180px wide spanning 35% to 80% of frame height. Store presets per platform and a Reset button.
Behaviour: video gets a scrubber and an "Auto-sample" button that checks 8 evenly spaced frames. Let me draw rectangles on the frame to mark where text or logos are (drag to draw, label each); the tool computes whether each rectangle intersects a red zone and shows PASS or WARN with the overlap percentage.
Output: an annotated PNG for each checked frame, plus a JSON report listing frame time, each marked rectangle, zone hit, and overall PASS/FAIL, with Download buttons for both.
Build order: upload and overlay first, then rectangle marking, then report export. Do not call any AI model. Keep the interface minimal, black and white with an orange accent.
```

### Tool 3 — Hook Lab (A/B hook generator)

* **Why:** hooks are the highest-leverage part of a short ad; this makes test variants cheap and structured. Text only.
* **Inputs → outputs:** product fields, audience, angle → 12 hooks over 6 formulas (on-screen ≤ 8 words, spoken ≤ 10 words — playbook: dialogue is reliable under ~10 words), first-frame description, A/B grouping, CSV/JSON export.
* **Risk:** uses Gemini text inside the tool (builder queries are free; in-tool LLM calls are an [unverified] cost); invented claims (cost/stock/discount) — rules forbid.
* **Verify:** run twice; schema check (12 rows, word limits, 6 formulas covered); no forbidden words.

```text
Create a tool called "Hook Lab" that writes A/B test hooks for short vertical ads for a Canadian streetwear brand called Acme (minimal black and white, oversized hoodies and tees, university students).
Inputs: product name, fit and fabric notes, colour, price in CAD (optional), target audience (default: university students), campaign angle (text), and a "forbidden claims" box.
When I press Generate, use the built-in Gemini text agent to produce 12 hooks, two for each of six formulas: pattern interrupt, POV, lecture-hall relatable, drop/scarcity (no invented numbers), question, contrarian.
Each hook returns: on-screen text (max 8 words), spoken line (max 10 words), first-frame visual description (one sentence), and the formula name.
Rules: sentence case, no emojis, no hype words like "insane", never invent discounts, stock levels, reviews or celebrity use. Respect the forbidden claims box.
UI: results as a table I can edit; tick up to 4 hooks into an "A/B set" panel labelled A, B, C, D; Regenerate button per row; "Export CSV" and "Export JSON" buttons.
Build the form and table first, then generation, then export. Do not generate any images or video.
```

### Tool 4 — Drop Grid (product shot → 6-image grid)

* **Why:** one clean product photo becomes six consistent assets (front, back detail, fabric macro, on-model street, flat-lay, hanger) for carousel/story. Starting point should be a **remix of Grid Architect** ("Create image grids and extract individual images from them" [G]) — try that first; use this prompt if its controls don't fit.
* **Inputs → outputs:** 1 product photo (+ optional style reference) → one 3×2 sheet → 6 cropped frames + zip.
* **Risk (credits):** every Generate spends image credits (price unpublished; check banner); logo/text drift on the garment; one-grid-per-click cap in the prompt.
* **Verify:** 6 crops same size; garment colour/graphic match source by eye; stop if banner shows a high quote.

```text
Create a tool called "Drop Grid". It turns one product photo of a hoodie or tee into a 3x2 contact sheet of six images and splits it into six separate files.
Inputs: upload or pick from the project gallery one product image; optional second image as a style reference; a Quality dropdown: Fast (Nano Banana 2) or Pro (Nano Banana Pro), default Fast; a text box for extra notes.
Six fixed shots: 1 front on a plain light studio background; 2 back detail; 3 fabric macro; 4 on a model walking a city street at dusk, oversized fit; 5 flat-lay on concrete; 6 on a hanger against a white wall.
Rules sent to the model: the garment's colour, cut, logo, print and text must match the source exactly; do not invent text; keep a consistent black, white and muted orange look.
Flow: show "This will generate 1 image sheet" and require a Confirm click before generating. After generation, split the sheet into six equal crops, show them as cards with Download and Save to project, plus a "Download all" button. Allow only one generation per Confirm.
Build the layout and the splitter first (test with a sample grid), then the generation step.
```

### Tool 5 — Beat Cut Stringout

* **Why:** music-led edits are the Reels/TikTok default; Ribbit ("Perform videos live as the beat drives playback" [G]) and Stringout Creator [L] exist but not tuned to our cuts. Zero model credits.
* **Inputs → outputs:** 3–10 clips + one audio file → detected beats → clip order/cut points → preview → 9:16 export.
* **Risk:** beat detection quality; large audio/video memory use; real-time export; **music licensing** is your responsibility (not researched here).
* **Verify:** use a metronome fixture at 120 BPM; cut points must land within ±50 ms of grid; total length = audio length.

```text
Create a tool called "Beat Cut Stringout". No AI generation, no credits.
Inputs: upload 3 to 10 video clips (any aspect ratio) and one audio file. Controls: cut every N beats (1, 2, 4, 8; default 4), BPM override field, "tap tempo" button, clip order mode (as uploaded, shuffle, manual drag), crop mode (centre-crop to 9:16, or smart follow if available), transition (hard cut default, 3-frame flash cut, short crossfade), and an optional end card text.
Behaviour: analyse the audio in the browser to detect tempo and beat times, show the beat markers on a waveform, and allow clicking to nudge any marker. Build a timeline that assigns a segment of each clip to each beat interval, looping clips if needed. Provide a live preview with the audio and a 'Download' button that renders a 1080x1920 MP4 or WebM matching the audio length.
Show a timeline list of cuts with timestamp and clip name; let me swap or remove any cut.
Save the finished render via 'Save to project' as well as Download.
Build order: upload and waveform first, beat detection, timeline, preview, then export. Report errors clearly if the browser cannot decode a file.
```

### Tool 6 — Palette Police (brand-palette enforcer)

* **Why:** the brand is black/white + restrained orange; AI frames drift to teal-orange cinematic grading. A deterministic checker catches that for free.
* **Inputs → outputs:** stills or video frames → % black/white/orange/other, pass/fail vs thresholds, heat-map of off-palette pixels, optional client-side "snap toward palette" grade.
* **Risk:** pixel math on compressed video is approximate; "other" colours inside skin tones/denim are expected — thresholds editable. No credits unless the user adds a generative fix (prompt forbids).
* **Verify:** fixtures: pure black (PASS), 12% orange block (PASS if limit 15%), 40% teal (FAIL); exact numbers within ±2%.

```text
Create a tool called "Palette Police". It checks images and video frames against a brand palette. No AI generation and no credits.
Palette fields (editable colour pickers with hex): black #000000, white #FFFFFF, orange accent #FF5A1F. Tolerance slider (default 12% in colour distance). Rules (editable numbers): orange accent maximum 12% of pixels, "other" colour maximum 25%, black plus white minimum 60%.
Inputs: upload up to 20 images, or one video with a button "sample 8 frames".
For each image or frame, compute the share of black, white, orange and other pixels, and show a bar plus PASS or FAIL against the rules. Show a heat-map toggle that highlights off-palette pixels. Show a summary table and a Download JSON report button.
Add a "Snap toward palette" button that applies a client-side colour grade (deepen blacks, lift whites, desaturate non-orange hues) with a strength slider, shows before and after, and lets me download the result. Do not call any model.
Build order: upload, pixel analysis, rules and report, then the grade preview. Include a built-in test with solid colour swatches so I can check the maths.
```

### Tool 7 — Lookbook Sequencer

* **Why:** pre-launch brand with stills: turns 6–20 images into a Reel *and* a numbered carousel set without an editor.
* **Inputs → outputs:** images + per-slide caption (product name, price CAD, "Drop 01") → 9:16 slideshow video (cut/crossfade/slow push-in) + 4:5 PNG carousel set.
* **Risk:** real-time render; slideshow motion looks cheap if overused (use cuts); credits none.
* **Verify:** 6-image fixture, 1.5 s each → 9.0 s ±0.2; 4:5 PNGs 1080×1350; filenames sequential.

```text
Create a tool called "Lookbook Sequencer". No AI generation, no credits.
Inputs: upload 6 to 20 still images; drag to reorder; for each slide set duration in seconds (default 1.5), a short caption line (product name, price in CAD, optional tag such as "Drop 01"), caption position (lower-left or lower-centre, kept out of the Reels UI zones: bottom 670px, top 270px of 1080x1920), and a motion option: hard cut, crossfade, or slow push-in.
Global controls: background colour (default black), caption typeface dropdown, accent colour (default #FF5A1F) used for a thin progress bar, optional audio upload.
Outputs: (1) a 1080x1920 MP4 or WebM Reel with all slides, captions and optional audio; (2) a carousel set of numbered 1080x1350 PNGs with the same captions. Provide Preview, Download for each output, and 'Save to project'.
Behaviour: show total runtime; warn if images are lower resolution than 1080 wide; centre-crop with a focal-point click per image.
Build order: upload and reorder, preview, captions, Reel export, then carousel export. Show clear errors if the browser cannot export.
```

### Tool 8 — UGC Shot Planner (script → shots → prompts)

* **Why:** converts a script into a Flow-ready shot list with locked character/garment blocks, durations matching model lengths (4/6/8/10 s [L]), and ≤ 10-word dialogue. **Has no generate button on purpose** so it costs nothing and our agent reads the JSON and submits prompts in the main prompt box.
* **Risk:** none on credits; model prompt quality depends on LLM; must not describe real people.
* **Verify:** JSON schema check (durations in allowed set, sum ≤ target, dialogue ≤ 10 words, identical lock block in every prompt).

```text
Create a tool called "UGC Shot Planner". It never generates media; it only plans.
Inputs: pasted script (hook, problem, product reveal, proof, call to action), target total length in seconds (default 24), platform (Reels or TikTok), a "character lock" text box describing one fictional student presenter (age range, hair, clothing basics), a "garment lock" text box describing the Acme oversized hoodie or tee (colour, cut, graphic placement), and a "never show" box.
When I press Plan, use the built-in Gemini text agent to split the script into shots. Allowed durations: 4, 6, 8 or 10 seconds. Each shot returns: number, duration, camera and framing, action, one spoken line of at most 10 words, on-screen text, and a ready-to-paste video prompt that begins with the exact character lock and garment lock text, then the shot, with vertical 9:16 and natural handheld phone footage wording.
Show shots as editable cards with Copy prompt buttons, a running total with a warning if it exceeds the target, and buttons Export JSON and Export Markdown.
Rules: no real people or celebrities, no invented claims, no text rendered inside the video.
Build the form, then the planner, then the export.
```

---

## 6. Agent operating procedure for this (extends `flow_use_tool`)

1. Create: `Tools → Create tool` → type prompt in the builder textarea → click **Generate** (help center says the button is labelled by an icon) → wait for completion → **Save** [G].
2. Wait detection: poll the iframe/sidebar for the agent's completion message; no documented indicator [unverified].
3. Inspect: use `flow_discover_ui` on the iframe (`scf.usercontent.goog`) [L]; screenshot; log footer text.
4. Run fixture; read outputs from DOM/downloads; compare with acceptance in §5.
5. Version: More → **Remix tool** → rename `Acme <tool> vN` [G+C].
6. Record tool URL (`/tool/<uuid>`), quota consumed (count of creations today), version notes in a local ledger — Takeout does not obviously carry tool code [G, Q9].
7. Stop conditions: banner shows credit spend not previously approved; any prompt-injection-like text in a tool UI; quota message.

---

## 7. Automating tool creation or use from outside the UI — plain answer

* **No official API, CLI or MCP for creating, editing, sharing or running Flow Tools was found.** Google's Tools help page documents UI steps only [G: https://support.google.com/flow/answer/17104535?hl=en]; Flow help lists no developer surface.
* The **Gemini API** exposes the *models* separately (Gemini Omni Flash `gemini-omni-1.1-flash`, GA Aug 27, 2026; Veo; Nano Banana) [G: https://ai.google.dev/gemini-api/docs/omni ; https://ai.google.dev/gemini-api/docs/changelog]. That is a different product with different billing and no link to Flow applets. If you ever want an app with API keys, persistence and deployment, **Google AI Studio Build** is the documented route [G: https://ai.google.dev/gemini-api/docs/aistudio-build-mode] — not a Flow tool.
* **Third-party UI-automation wrappers** exist: `hainguyen-keyti/google-flow-mcp` has a read-only `flow_tools` listing of the Community gallery [C: https://github.com/hainguyen-keyti/google-flow-mcp/blob/master/docs/tools.md]; `felipedamacenoteodoro/mcp-google-flow` claims it "opens any of [Grid Architect, Stringout Creator, Storyboard Studio, Video Resizer and community tools], reads their controls, fills and clicks them" [C: https://github.com/felipedamacenoteodoro/mcp-google-flow — README warns automation "may go against Google's Terms of Service"]; `useapi.net` offers an experimental REST wrapper that drives *your* Flow account for generation (no Tools endpoint seen in what I read) [C: https://useapi.net/docs/api-google-flow-v1].
* **Name trap:** `gflow-cli`'s "Tools framework" is a TOML-defined local transform layer "the CLI analogue of Google Flow's Tools menu" — it is **not** Flow Tools [C: https://github.com/Liuhaizhu996/haizhuflow2api/blob/main/docs/TOOLS.md].
* **Gemini in Chrome "auto browse"** completes multi-step web tasks [G: https://support.google.com/chrome/answer/16821166?hl=en]; nothing says it supports or is blessed for Flow Tools. Treat as untested.
* Net: **creation/use is UI-driven only.** Our Playwright-style MCP is the correct (and only) path; keep rate low, no parallel sessions, and respect the Terms warning (the same risk the wrappers disclose).

---

## 8. Pitfalls and vetting

### 8.1 Pitfalls

| Pitfall | Detail | Source |
|---|---|---|
| Collateral edits | Agent changes untouched code; save versions often | [C] personalize post |
| Lost state | No persistent storage; reload loses work unless you ask for save/load | [C] pipeline post |
| Silent export failure | Resizer remix not saving to gallery | [C] personalize post |
| Non-generative output defaults to export | Specify "save to project" or expect a download | [G] X guide |
| Credit spend inside tools | Footer: "This Tool may consume credits"; banner when running might spend | [G] support 17104535 ; [L] |
| Slow tools | Type Overlays "punishingly slow to render" | [C] personalize post |
| Slow uploads | "Upload images and videos into google Flow are super slow" (user complaint under Google's post) | [C] https://x.com/FlowbyGoogle/status/2067657276043706499 |
| Rate limiting | "You're requesting generations too quickly" FAQ exists | [G] https://support.google.com/flow/answer/16353333?hl=en (snippet) |
| Unpublished quotas | Creation + Agent queries | [C] saascrmreview |
| Mobile | Tools web/PC only | [G] |
| iframe | Controls live in `scf.usercontent.goog` frame; page-level selectors miss them | [L] |
| Default images shared | Thumbnail/defaults ride in the link | [G]+[C] |
| Delete cascades | Deleting stops sharing for everyone | [G]+[L] |
| Experimental quirks | Tools "occasionally experimental"; re-test after Flow updates | [C] wisdomai summary ; `flow-creative-playbook.md` |
| Misleading SEO articles | See §9 | — |

### 8.2 Vetting a community or shared tool (checklist)

Why: a link exposes code [G]; you open it into **your** workspace [G]; you then hand it your uploads. No source states the applet's network egress rules, so assume it can transmit anything you give it [unverified either way].

1. Open the tool in a **throwaway project/account context** with only fixture media.
2. Switch to **Edit** and read the code (viewable in edit mode [C]). Search for: `fetch(`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon`, `new Image().src`, `<script src=`, `eval`, `atob`, `postMessage`, any hard-coded URL/domain.
3. Cross-check with the browser Network panel while using it (our agent can request HAR-like logs through the browser tool): any request to a non-Google host = stop.
4. Ask the applet agent "list every external URL and network call in this tool" — **useful but not authoritative** (it wrote the code).
5. Prefer **Remix** over using the original: you get your own copy and can strip risky parts; then still re-audit.
6. Check the author/featured status: Community entries pass a review (criteria unpublished) [G]; a featured tool is a weak signal, not an audit.
7. Don't upload unreleased designs, faces, minors (policy blocks anyway [G: flow-official-facts]), or customer data. Remember reviewers may sample uploads and tool outputs [G: privacy].
8. Never paste credentials/API keys into any tool field.
9. Re-audit after the owner "updates" — shared links are snapshots [G], but a *new* link to an updated tool is a new snapshot.

---

## 9. Where sources disagree

| Topic | Source A | Source B | My call |
|---|---|---|---|
| Who can create | Plus ($4.99) "Tools (Creation)" [G] https://flow.google.com/ | "pro/ultra subscriptions" [C] yqAxSVpoSPo; "Google Pro or Ultra" [C] 02cu2P8CSN8 | Trust Google's table (Plus+). Verify live on a Plus account (Q2). |
| Gallery tab name | "Discover" [C] July | "Templates" + Community [L], [C] 6sXs-aGtU4c | UI renamed after Community launch; use Templates. |
| Community launch date | Changelog 6/30/2026 [G] | "officially LIVE" 7/22/2026 [G] | Submissions opened 6/30; tab went live 7/22. |
| Tool model options | MindStudio says Veo 2 / Imagen 3, input "variables", private/collaborator sharing [C] https://www.mindstudio.ai/blog/what-is-google-flow-tools-custom-ai-workflows-no-code | Google: link share, Nano Banana/Omni era, Veo 2 deprecated 3/2/2026 [G changelog] | Treat MindStudio and the "whiskailabs" clone as unreliable; I used neither for facts. |
| Authorship chain / team-private tools | pasqualepillitteri.it [C] | Google help: link-only sharing [G] | [unverified] |
| Safe-zone pixels | IG bottom 672 (Solid Labs), 400 (CampaignSwift), 350 (ScreenSnap) | TikTok bottom 660 (Selzee) vs 484 (Sprites) vs 20% (AdManage) | Use strictest union, editable (Tool 2). |
| Tools "free to use" | "free to use for everyone" [C] | Credits still spent per generation [G] | Both true: the UI is free to *use*; models cost credits. |
| Price of image generation | tingyudeco: image menu shows 0 credits [C] | Google credit table lists video only [L] | Read the live banner (Q3). |

---

## 10. Open questions needing LIVE testing in the Flow UI

* **Q1.** How many tools can be created per day on this account, and what message appears at the limit? Does remixing count?
* **Q2.** Does the plan chip PRO/PLUS gate Create vs Remix vs run (and in Canada)? Exact CAD price of Plus?
* **Q3.** Credit line items: does a Grid-Architect/Shot-Explorer run quote credits before click; are images 0-credit on this plan; does Omni-in-tool show the same table?
* **Q4.** What does the builder's completion state look like in the DOM (so the agent can wait deterministically)? Is **Save** a separate click after every Generate?
* **Q5.** Can applet code be read through the UI (Edit → code view) and exported by copy? If yes, store it in the repo as a backup.
* **Q6.** Network egress: can an applet call an arbitrary external URL? Test with a harmless endpoint inside a throwaway tool; check CSP errors in console.
* **Q7.** File limits in applets: max image/video size, duration, type (MOV/MP4), and whether an audio upload works.
* **Q8.** Does in-browser export (MediaRecorder/ffmpeg.wasm?) work and how long does a 15 s 1080×1920 render take — e.g., Type Overlays vs a self-built Caption Stamper?
* **Q9.** Does Takeout export tool code, and does "Delete" on a tool also remove its saved sessions (18-month retention)?
* **Q10.** What happens when someone opens a shared link whose author later deletes the tool?
* **Q11.** Can a tool read gallery media of a *different* project, and does "Save to project" always target the open project?
* **Q12.** Does the footer warning appear for non-generative tools (should be absent for Tools 1,2,5–8)?
* **Q13.** Persistence: does a tool remember settings (palette, safe-zone margins) between sessions via any supported mechanism?
* **Q14.** Does the "Apply to be featured" form expose review criteria; does a featured tool carry extra trust signals?

---

## 11. Source index (distinct sources used)

**Google first-party [G]**
1. https://support.google.com/flow/answer/17104535?hl=en (also /labs/answer/17104535) — Create & manage Tools
2. https://blog.google/innovation-and-ai/models-and-research/google-labs/flow-updates/ — May 19, 2026 launch
3. https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/ — I/O items 81–82
4. https://blog.google/innovation-and-ai/models-and-research/google-labs/six-new-tools-built-by-creatives/ — Sep 23, 2026
5. https://blog.google/innovation-and-ai/technology/ai/google-flow-fashion-week/ — Sep 18, 2026
6. https://x.com/FlowbyGoogle/article/2077884458993406337 — official how-to
7. https://x.com/FlowbyGoogle/status/2079971262278054263 (thread incl. 2072052471774515284 submission steps)
8. https://x.com/FlowbyGoogle/status/2067657276043706499
9. https://flow.google.com/ and https://flow.google.com/about — template blurbs, plans
10. https://labs.google/fx/tools/flow/changelogs
11. https://labs.google/flow/privacy
12. https://support.google.com/flow/answer/16353544?hl=en — countries
13. https://support.google.com/flow/answer/16526234?hl=en — credits
14. https://support.google.com/flow/answer/17571126 — data export
15. https://support.google.com/flow/answer/16353333?hl=en — get started FAQ (snippet)
16. https://www.youtube.com/watch?v=_qWItNk5a9Q — Google "Exploring Tools in Google Flow"
17. http://www.youtube.com/watch?v=FLynjUYg79I — I/O keynote (snippet)
18. https://gemini.google/subscriptions/ (snippet)
19. https://ai.google.dev/gemini-api/docs/aistudio-build-mode ; 20. https://ai.google.dev/gemini-api/docs/omni and /changelog
21. https://support.google.com/chrome/answer/16821166?hl=en

**Community [C]**
22. https://carlaeng.substack.com/p/personalize-your-ai-animation-tools
23. https://carlaeng.substack.com/p/google-flow-ai-animation-pipeline
24. https://carlaeng.substack.com/p/how-to-vibe-code-a-personalized-thumbnail (+ video https://www.youtube.com/watch?v=w_9bei_VNg4)
25. https://maven.com/p/208fd3/personalize-your-ai-animation-tools-with-google-flow
26. https://www.youtube.com/watch?v=yqAxSVpoSPo (TheAIGRID) ; 27. https://www.wisdomai.com/insights/TheAIGRID/google-flow-tools-creative-workflows-remix-tools-ai-image-video-cf3232c1 ; 28. https://www.geeky-gadgets.com/google-flow-tools-guide-2026/
29. https://www.youtube.com/watch?v=i75QUftYY3A (AI Drill, image tools) ; 30. https://www.youtube.com/watch?v=NdK6SYl9DXk (video tools) ; 31. https://www.youtube.com/watch?v=oIb4K_cnM8A (snippets)
32. https://www.youtube.com/watch?v=nafm6r1V2io (Mockup) ; 33. https://www.youtube.com/watch?v=G74ltLKqQi0 ; 34. https://www.youtube.com/watch?v=02cu2P8CSN8 ; 35. https://www.youtube.com/watch?v=LNoULxZ0h7c ; 36. https://www.youtube.com/watch?v=fJkzN2p7oY0 ; 37. https://www.youtube.com/watch?v=rBoiD7N-NbU ; 38. https://www.youtube.com/watch?v=6sXs-aGtU4c (snippet)
39. https://saascrmreview.com/google-flow-review/ ; 40. https://pasqualepillitteri.it/en/news/2944/google-flow-tools-custom-ai-workflows ; 41. https://www.mindstudio.ai/blog/what-is-google-flow-tools-custom-ai-workflows-no-code ; 42. https://workshop.tingyudeco.com/google-flow.html ; 43. https://note.com/opi/n/n7366b895496b?hl=en ; 44. https://note.com/leftbank/n/nfd30a6d32702?hl=en (snippet)
45. https://github.com/hainguyen-keyti/google-flow-mcp ; 46. https://github.com/felipedamacenoteodoro/mcp-google-flow ; 47. https://github.com/Liuhaizhu996/haizhuflow2api ; 48. https://useapi.net/docs/api-google-flow-v1
49. https://www.solidlabs.com/social-safe-zones ; 50. https://selzee.com/tools/tiktok-safe-zone-checker ; 51. https://www.sprites.ai/ad-specs/tiktok/safe-zone ; (also campaignswift.com / screensnap.pro / admanage.ai snippets in §9)

**Local [L]:** `FLOW-UI-MAP.md` §5, §6, §10; `docs/research/flow-official-facts.md`; `docs/research/flow-creative-playbook.md`.

**Distinct external sources cited: ~52.** Weakest evidence: Reddit (nothing Tools-specific found), YouTube pages known only from snippets/excerpts (#17, #31, #34, #38), rate-limited note.com page (#44).
