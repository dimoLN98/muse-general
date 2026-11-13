# Flow UI map (flow.google.com)

Live-mapped reference for the current Flow web UI. Everything here was observed against the real
product, not inferred. Where something could not be checked without spending credits it is marked
**unverified**. Statements from Google's Flow help pages are marked as documented; live-UI findings
were observed directly on this account. Selectors that the server depends on live in `src/navigation/flow-ui.js`.

## 1. Routes

| Path | What it is |
| --- | --- |
| `/` | Home: project tiles (`New project`), account menu, plan chip |
| `/about` | Marketing page — the app still serves it on some cold loads, so entry retries |
| `/project/<uuid>` | Project: media grid + agent chat panel + prompt box |
| `/project/<uuid>/tools` | Tool gallery: tabs My Tools / Community / Templates |
| `/project/<uuid>/create-tool` | "New tool": describe an applet, Flow builds it |
| `/project/<uuid>/tool/<uuid>?mode=APP&fromViewSource=tools` | Applet runtime (tool app) |
| `/project/<uuid>/character` and `/character/<uuid>` | Characters list / one character |
| `/project/<uuid>/scene/<uuid>` | Scene editor (video timeline) |
| `/project/<uuid>/edit/<uuid>` | Media editor for one image or video |
| `/project/<uuid>/trash` | Per-project trash (undoable) |

Notable custom elements (`FLOW-*`): `FLOW-PROJECT-SHELL`, `FLOW-PROJECT-PAGE`, `FLOW-AGENT-PANEL`,
`FLOW-CHAT-VIEW`, `FLOW-CHAT-EMPTY-STATE`, `FLOW-CREATIVE-AGENT-PROMPT-BOX`, `FLOW-BASE-PROMPT-BOX`,
`FLOW-RICH-TEXT-EDITOR`, `FLOW-ADD-MENU`, `FLOW-GENERATE-ICON-BUTTON`, `FLOW-MEDIA-UPLOAD`,
`FLOW-CREDIT-BANNER`, `FLOW-USER-TIER-CHIP`, `FLOW-GRID-TILE-CONTAINER`, `FLOW-TILE-VIEW-HEADER`,
`FLOW-APPLET-CARD`, `FLOW-APPLET-MANAGER-PAGE`, `FLOW-APPLET-VIEW-PAGE`, `FLOW-APPLET-PROMPT-BOX`,
`FLOW-APPLET-CHAT-SIDEBAR`, `FLOW-APPLET-BANNER`, `FLOW-SCENE-BUILDER`, `FLOW-SCENE-TIMELINE`,
`FLOW-SCENE-EDITOR-CANVAS`, `FLOW-PLAYBACK-CONTROL`, `FLOW-EDITOR-HISTORY-PANEL`,
`FLOW-EDIT-VIDEO-PROMPT-BOX`, `FLOW-CLIP-CONTEXT-MENU`, `FLOW-EDITABLE-TEXT`.

## 2. Agent settings (the only place models/ratio/count are chosen)

Opened with the **tune** icon inside the prompt box — `button[aria-label="Settings"]:has-text("tune")`.
There is a *second* `button[aria-label="Settings"]` in the header (`settings_2`, view options); clicking
that one is the usual cause of "panel never opened".

| Section | Options (observed) |
| --- | --- |
| Confirm before generating | `Always` (agent asks before spending) / `Never` |
| Image generation default | ratio `16:9 4:3 1:1 3:4 9:16`, count `x1 x2 x3 x4`, models `Nano Banana Pro`, `Nano Banana 2 Lite`, `Nano Banana 2.1` |
| Video generation default | ratio `16:9 9:16` only, count `x1 x2 x3 x4`, models `Omni 1.2 Flash` (default), `Omni 1.1 Flash` *Leaving Dec 5*, `Veo 3.1 - Lite`, `Veo 3.1 - Fast` *Leaving Dec 5*, `Veo 3.1 - Quality` *Leaving Dec 5* — re-mapped 2026-11-09 |

* **No duration control anywhere in this panel** — clip length is not configurable here.
* Ratios/counts are `button[role="radio"]`; models are menu items, and the selected one carries
  class `selected` on its `flow-menu-item`.
* Escaping a model menu leaves `.cdk-overlay-backdrop-showing` in front of the page; the next click
  fails until it detaches (`waitForNoBackdrop` in `flow-ui.js`).
* Header `settings_2` menu is view prefs only: View mode (dashboard / Grid / Batch), Grid size S M L,
  Sound on hover, Return silent videos, Show tile details, Clear prompt on submit.

## 3. Prompt box / agent chat

Buttons in the prompt box row: `Add ingredients to the prompt box`, `Agent instructions`,
`Settings` (tune), `Start generation`; a `Clear prompt` button appears once text exists.

* **There is no image/video mode switch.** You describe what you want in prose ("create a 4 second
  video of …") and the agent picks the matching capability and its defaults.
* With `Confirm before generating = Always`, the agent stops and asks, quoting the price —
  verbatim: "I'm going to generate a 4-second video of a paper lantern drifting over a misty lake at
  dawn with a slow dolly movement using Omni 1.1 Flash. Would you like me to kick off this 1 video
  generation, costing 7 credits?" The card offers `Approve`, `Always approve` and `Reject`.
* **`Always approve` silently flips Agent settings to `Confirm before generating = Never`** ("Agent
  will generate media and spend credits automatically") — verified by reading the radio group
  afterwards. Re-select `Always` and press `Save` to undo it. Never click `Always approve` from an
  automated run: it removes the only spend guard the user has.
* Prompt box text is a `contenteditable` `[role="textbox"][aria-label="What do you want to create?"]`.
* Agent replies live in `.messages-list`; result images are `img[alt^="Option"]`, and clicking one
  opens `/edit/<id>`.

## 4. Video

Two different surfaces generate video:

* **Agent prompt box** (project page) — the agent picks the video model/ratio/count from the
  *Video generation default* settings and decides the clip length itself. No duration or model
  control is exposed there.
* **Clip prompt box** (scene editor, `FLOW-EDIT-VIDEO-PROMPT-BOX`) — the classic generator: a
  ProseMirror editor (`[role="textbox"][aria-label="Select a clip to edit"]`),
  `Add ingredients to the prompt box`, a static model chip (`Omni 1.1 Flash`), a
  **`button[aria-label="Settings trigger"]` whose label is the current clip length (e.g. `8s`)**,
  and `Start generation`. In an empty scene the trigger renders `hidden=""` and the chip is not
  clickable, so the real option list only appears once a clip exists or is being composed —
  **unverified** (Google documents aspect ratio, number of outputs, model and *Generation length*
  as prompt-box settings).

Documented capabilities and limits (Google Flow help, read 2026-10-16):

| Thing | Detail |
| --- | --- |
| Clip length | **3-15s in 1-second steps on Omni 1.2 Flash** (11-15s needs Google AI Plus or better), 4 / 6 / 8 / 10s on Omni 1.1 Flash, 4 / 6 / 8s on Veo 3.1 Lite and Fast, 8s only on Veo 3.1 Quality (re-mapped 2026-11-09) |
| Longer than one clip | **Omni Extend** (subscribers only): append 3-10s at a time to an Omni 1.2 clip, up to 3 image references, web only. Veo Extend was retired 2026-11-05 and Veo clips can no longer be extended. Locally: `flow_stitch_videos`. (Updated 2026-11-09) |
| Frames | `Frames to Video: First` and `First and last` on all Veo tiers and on Omni; prompt box → model name → Video → Frames → drag into "+ Add start frame" / "+ Add end frame" |
| Image → video | select an image and `Animate` (or `Animate photo` from a device photo) |
| Ingredients / references | reference images/videos for character, object and style consistency. Veo 3.1: 8s only and **not** on Quality; Omni: 4/6/8/10s |
| Video-to-video edit | **Omni only**: edits uploaded *and* generated video, **multi-turn conversational edits on clips up to 15s on 1.2** (≤10s on 1.1). Uploads ≤60s, ≤1GB, .mov/.mp4/.avi/.wmv; anything >30s must be trimmed to 30s in Flow. Billed per second like a generation: 720p 3 credits/s, 360p 1 credits/s (was a flat 40 on 1.1) |
| Audio | native to the model (Veo 3.1 also adds audio to Ingredients/Frames/Extend); direct sound in the prompt. Omni supports voice references. Project setting `Return silent videos` forces silence |
| Upscale | Omni 1.2 360p draft → 720p/1080p: 0 credits for 1-10s (+1 credit per extra second), subscribers; 4K: 50 credits flat for 1-10s (+5/s), Ultra only. Drafting at 360p costs 1 credit/s instead of 3 and upscaling the winner is free. (Updated 2026-11-09) |
| Watermark | every output carries an invisible SynthID watermark |
| Export | right-click → Download offers a GIF (270p) or the video file; also share-link, publish to YouTube, whole-project download, and Takeout |

Verified live (4s Omni 1.1 Flash clip, 7 credits):

* Asking the agent for "a 4 second video …" produced a `FLOW-VIDEO-TILE` auto-titled from the prompt
  ("Paper lantern drifting over lake"); rendering showed progress 56% → 68% → 80% → 93% → 99% and
  took roughly two minutes for 4s.
* The clip's own editor is `/edit/<uuid>`, and it is the **scene builder loaded with a single clip** —
  components include `FLOW-EDITOR-DISPATCHER`, `FLOW-SCENE-BUILDER`, `FLOW-SCENE-EDITOR-CANVAS`,
  `FLOW-PLAYBACK-CONTROL`, `FLOW-EDITOR-HISTORY-PANEL`, `FLOW-EDITOR-HISTORY-STEP-VIDEO`,
  `FLOW-VIDEO-EDIT-HISTORY-HOTBAR`, `FLOW-EXPANDABLE-PROMPT`, `FLOW-SCENE-TIMELINE`,
  `FLOW-THUMBNAIL-STRIP`, `FLOW-EXTEND-MENU`, `FLOW-CLIP-CONTEXT-MENU`, `FLOW-EDIT-VIDEO-PROMPT-BOX`.
* Header/toolbar: `Back`, `Favorite`, `Share`, `Download media`, `Move to trash`, `history`,
  `More options`, `Done editing scene`; playback row adds `Save frame`, `Save to projects`,
  `Download`, `Flag output`, `Reuse prompt`, `Mute`, `Disable loop`, full screen, zoom in/out.
* **Video-to-video editing ran** (40 credits, Omni only): the box reads
  `[role="textbox"][aria-label="Describe how to edit this video…"]` next to the `Omni 1.1 Flash` chip
  and `Start generation`. After the edit the history panel held two steps (original prompt + the edit
  prompt, the source clip attached as a `videocam` ingredient) and the project tile showed `stacks`,
  i.e. versions accumulate on one media item.
* `Download media` on a video offers `270p Animated GIF`, `720p Original size`, `1080p Upscaled`,
  `4K Upscaled` (+ `Upgrade` when the tier does not cover it). The 720p original of the 4s clip was a
  1.4 MB MP4.
* The `More options` menu is project-level: Download project, Product help, Flow help center, View all
  changelogs, Flow Music, Flow TV, About Flow, Learn Flow, Send app feedback, Report legal issue,
  Privacy notice.
* Account menu (user chip) shows the credit balance: "1,023 Google Flow credits" plus `Upgrade`,
  `Create avatar`, `Manage subscription`, `Switch account`, `Visible watermarking`.
  Verified 2026-10-27 (home + project pages, headful and headless): the chip is
  `flow-header-user-icon [role=button][aria-label="Account details"]`; the panel shows the email and
  `span.credits-count` ("886 Google Flow credits", inside a link: read, never click). **Escape does not close it** —
  click the `.cdk-overlay-backdrop` corner (a left-open backdrop eats the next click). Used by account rotation.

**Scenes** (`/scene/<uuid>`) are the timeline, and are how clips are assembled:

* `FLOW-SCENE-BUILDER`, `FLOW-SCENE-TIMELINE`, `FLOW-SCENE-EDITOR-CANVAS`, `FLOW-PLAYBACK-CONTROL`,
  `FLOW-EDITOR-HISTORY-PANEL`, `FLOW-CLIP-CONTEXT-MENU`, `FLOW-EDIT-VIDEO-PROMPT-BOX`.
* Controls: play / skip prev / skip next / mute / `Disable loop` / full screen, `Toggle aspect ratio`
  (16:9 default), zoom in / out, `history`, `Add clip`, `Download scene`, `Move to trash`,
  `Done editing scene`, and the clip prompt box.
* `Add clip` opens a media picker (`Select media`): project media filtered to **Videos**, **Uploads**,
  `Upload media`, `Recent`. With one video in the project the list showed
  "Paper lantern drifting over lake · 00:00:00 → 00:04:00 · muted" plus an `Add media` button and no
  "generate a clip here" option — clips arrive from the project or an upload.
* With a clip in the scene the prompt box becomes the same
  "Describe how to edit this video…" box, i.e. a selected clip is edited (video-to-video), not
  replaced by a fresh generation.
* The `button[aria-label="Settings trigger"]` labelled `8s` (the clip-length control) stayed
  `hidden=""` in **every** state observed — empty scene, scene with a real clip, and the video editor
  — so clip length could not be changed from the UI on this account; Google documents
  "Generation length" as a prompt-box setting, so treat its absence here as **unverified**.
* Empty state reads "Select a clip to edit"; the model chip shows the video model that will be used.

## 5. Tools (applets)

Gallery at `/project/<uuid>/tools`, tabs as `button[role="radio"]`, cards are `flow-applet-card`
(`.applet-name`, `.applet-author`, preview `img.applet-preview-image`, one `More options` button).

* **My Tools is account-wide, not per-project**, and it is populated with *your personal copies*:
  opening a template from the Templates tab clones it as `Remix of <name>` (the runtime URL then
  carries `fromViewSource=tools`).
* Counts observed: My Tools 4 (remixes of Simple Sketch, Shot Explorer, Image Editor, Grid Architect),
  Community 34, Templates 34 (a fixed set: Simple Sketch, Scene Explorer, Mockup, Image Editor,
  Shot Explorer, Mask Magic, Converge, Grid Architect, Shader Effects, Type Overlays, pixelBento,
  Poster Designer, Video Sketch, Transition Machine, Weirdcore, Video Resizer, Stringout Creator,
  Video Granulator, Character X-Ray, Style Writer, Storyboard Studio, Prompt Tree, Story Sketch,
  Frame Deconstructor, Blob Tracking, DepthWarp 4D, Webcam Set, Datamosh, 3D Model Visualizer,
  Scout360, Ribbit, Whisk, Pose Text, 3D Face Swap).
* Applet runtime page (`/tool/<uuid>?mode=APP`): the app itself renders in an iframe on
  `scf.usercontent.goog` (so element queries must target the frame); page chrome is
  `FLOW-APPLET-VIEW-HEADER` (name, `Tool`/`Edit` switch, Favorite, Share, More options, Done),
  `FLOW-APPLET-BANNER`, `FLOW-APPLET-VIEW-FOOTER` ("This Tool may consume credits").
* The right-hand **Tool Builder** sidebar (`FLOW-APPLET-CHAT-SIDEBAR`) holds a textarea
  `Ask applet agent to make changes` — describe a change and the applet agent rewrites the tool.
* Documented tool mechanics: `Favorite` (use everywhere), `Pin to dock` (this project), `Remix tool`
  (editable personal copy), `Share` (a shared link exposes the tool's code, name and thumbnail), and
  `Delete` (which deletes it for anyone it was shared with). Media a tool generates is saved to the
  project you have open automatically, and tool usage spends credits with a warning banner.
* `/create-tool` ("New tool") is the from-scratch builder: "Start building any creative tool you can
  dream by describing it below." Starter chips: Time stretcher (frame rate / clip speed),
  Style morph, Image filter. Footer states: **"Creating tools does not currently cost credits."**

## 6. Costs (Google's published Flow credit table, re-read 2026-11-09)

Charged per **generation**, not per request (x2 outputs = twice the credits):

| Action | Credits |
| --- | --- |
| **Omni 1.2 Flash 720p** | **3 credits per second up to 10s; 11-15s bill 6 credits per extra second (15s = 60)** |
| **Omni 1.2 Flash 360p** | **1 credit per second up to 10s; 11-15s bill 2 per extra second** |
| Omni 1.2 Extend (subscribers) | 1/s at 360p, 3/s at 720p per second added |
| Omni 1.2 edit of an uploaded or generated video | billed like a generation: 3/s at 720p, 1/s at 360p |
| Omni 1.2 upscale 360p → 720p/1080p | 0 credits for 1-10s, +1/s over 10s |
| Omni 1.2 upscale → 4K | 50 flat for 1-10s, +5/s over 10s, Ultra only |
| Omni 1.1 Flash 720p *(retiring 2026-12-05)* | 4s 7 / 6s 10 / 8s 12 / 10s 15 |
| Omni 1.1 Flash 360p draft *(retiring)* | 4s 4 / 6s 5 / 8s 6 / 10s 7 |
| Veo 3.1 Lite | 10 (Ultra 5) |
| Veo 3.1 Fast *(retiring 2026-12-05)* | 20 (Ultra 10) |
| Veo 3.1 Quality *(retiring 2026-12-05)* | 100 |

* 50 credits per day for everyone, refreshed at your first generation of the day; subscriptions add
  monthly credits (Pro +1,000). Nothing rolls over.
* **No published per-image price** — the table covers video generations and upscaling only; the
  prompt box shows the live cost before you commit ("Generating will use N credits").
* Non-subscribers can be blocked from video generation at peak hours (~2–5 PM UTC).
* Observed live: applet footer warns "This Tool may consume credits"; `/create-tool` states
  "Creating tools does not currently cost credits"; the plan chip on this account reads `PRO`.
* Agent *queries* are not charged but have a daily quota, and tool creation has its own daily quota.
* Confirmed live: the agent quoted "costing 7 credits" for a 4s Omni 1.1 Flash clip, and after one
  clip (7) plus one video-to-video edit (40) the account menu read **1,023 credits remaining** —
  matching Google's table rather than the third-party numbers.

## 7. Gotchas for automation

* **The agent's permission card is not made of `<button>` elements.** It is a
  `<flow-permission-message>` block whose choices are `div[role="radio"]` carrying
  `aria-label="Approve" / "Always approve" / "Reject"`; an answered card is `read-only` +
  `aria-disabled` with the chosen option `aria-checked="true"`. A `button` sweep finds none of them,
  so anything relying on `button` text cannot answer this card. `agentPermissionOptions()` /
  `clickPermissionOption()` handle it; `getByRole('radio', { name })` resolves the options.
* **The card is not reliably shown at all — never treat it as a spend guard.** Live: with Agent
  settings reading `Confirm before generating = Always`, asking for one image in a project that
  already had media produced **two new tiles** (Agent default count is x2) with no permission card at
  any point across 80s of 5s-interval polling. On a brand-new empty project the same style of run for
  a 4s video *did* show a card quoting "costing 7 credits". So spend control belongs in the tool
  (`auto_confirm=false`), not in the account setting.
* Never click `Always approve`, by hand or in code: it rewrites Agent settings to
  `Confirm before generating = Never`. The one recorded card in the test project has exactly that
  option selected, which is how the setting flipped during an earlier unattended run.
* The credit chip read `1,023` before and after those two unattended image generations, so either
  the number does not refresh promptly or images at this tier are covered by an allowance —
  **unverified**.

* Two "Settings" buttons — target the tune one.
* `.cdk-overlay-backdrop-showing` intercepts clicks after Escape; wait for it to detach.
* Applet UIs are in `scf.usercontent.goog` iframes; `detectPageElements` accepts a Frame for this.
* Home project tiles: `Delete project` is **permanent** ("All your clips, ingredients, and prompts
  will be permanently deleted"); scenes and media go to Trash instead.
* Clip length / model / Frames live behind `button[aria-label="Settings trigger"]` inside the *scene*
  clip prompt box, not in Agent settings, and that trigger is `hidden` until a clip exists.
* Templates and Community tabs are ordered the same as the lists above; the default tab depends on
  what was last opened, so select the tab explicitly by name.
* Home tile titles live in `flow-editable-text`/`.editable-text-container input`, not the `a` text.

## 8. Verified through the host' MCP path (after app restart, 2026-10-17)

The MCP child runs the current code once the desktop app is restarted; `flow_connect` then reports
`connected` / `flowAccessible: true` / `accountVerified: true` for `first@example.com`.

* `flow_generate_image({auto_confirm: false})` is a true dry run: it types the prompt and reports
  `agent_confirmation_setting` (the account's confirm-before-generating value), plus
  `agent_settings_current` vs `agent_settings_will_apply`, changing nothing.
* `flow_generate_image({auto_confirm: true, quantity: 1, ratio: '1:1'})` works end to end: one
  `success`, a 1024x1024 JPEG in `outputs/images/`, one media id, the agent's reply, and
  `agent_confirmation_clicked: null` — **no permission card appeared for the image**, so there was
  nothing to click. Agent settings were restored afterwards (`16:9`, count 2, Nano Banana 2.1).
* **Image generations did not move the credit balance.** Three images (2 unattended + 1 via the tool)
  left the chip at `1,023`, the same value it held after the 47 credits spent on video. The chip does
  move for video, so image generation appears covered/unmetered at this tier — **reason unverified**.
* With no project open the tool **creates its own project** (a "Google Flow - <date>" project), which
  is easy to leave behind; pass `project_name` / `campaign`, or delete the project afterwards.

Still unverified: clicking `Approve` on a live permission card (no live card was ever produced for an
image, and the video card only appeared on a brand-new project).

## 9. Assets, downloads and the video path (verified live 2026-10-17)

**Uploading**
* The header `+ > Upload` accepts images AND video — its own accept filter is
  `.png,.jpg,.jpeg,.webp,.gif,.heif,.heic,.mp4,.m4v,.mov,.3gp,.avi` (no webm). The scene's
  `Add clip > Upload media` chooser is video-only, same extensions.
* **Video uploads raise a one-time rights attestation**: "Rights to use this video — Make sure you
  have the necessary rights to any content or files that you upload … Cancel / I agree, do not show
  again / I agree". Until it is answered the upload silently never completes (no tile, no upload in the
  picker, "No assets found"), which looks exactly like a broken upload. Answering it lets the clip
  through: a 1.4 MB mp4 uploaded in ~6s and landed as a normal project asset.
* An uploaded image attaches to the agent prompt as an ingredient (`Ingredient image` chip) and was
  used to generate both an image and a video. Uploaded videos become project assets that open in
  Flow's editor (`/edit/<media id>`), where the edit box is the video-to-video surface.
* Upload names are content-hash prefixed, so re-uploading the same file is a no-op.

**Downloading** (`Download media` menu)
* Video: `270p Animated GIF`, `720p Original size`, `1080p Upscaled`, `4K Upscaled`. `original` maps to
  720p and is free; upscales cost credits. A 4s clip downloads as ~1.4 MB mp4.
* Image: an image opened from the project grid has **no quality menu** — `Download media` only shows a
  tooltip there, while a plain `Download` control in a hover hotbar saves straight away. Videos opened
  the same way do use the menu. Both paths are handled.
* Clips are filed under `outputs/videos`, stills under `outputs/images`.

**Video generation (Omni 1.1 Flash, the configured default)**
* One real run: 4s, 16:9, single clip, uploaded image attached as an ingredient → h264 **1280x720**,
  96 frames at 24fps (4.01s) plus AAC audio, ~7 credits.
* **Flow's permission card was answered live with `Approve`** (`agent_confirmation_clicked: "Approve"`)
  — never "Always approve", and the account's confirm-before-generating setting stayed on `Always`.
* Agent settings were applied for the run and restored afterwards (`16:9`, count 1, Omni 1.1 Flash).
* Video tiles show `Queued` and a percentage while rendering, then load their `<video>` lazily: a
  missing `<video>` element must NOT be read as "still rendering".

## 10. Navigation, per-asset actions, and the missing Extend (mapped live 2026-10-17)

**Project sidebar** (the real navigation — the only entries there are these):
`All media` (dashboard) · `Videos` (videocam) · `Characters` (accessibility_new) · `Scenes` (movie) ·
`Tools` (apps_spark_2) · `Create tool` (add) · `Trash` (delete) · `Collapse`.
There is no `/scenes` route — drive Scenes from the sidebar button. `/tools` is a normal route.

**All media grid**: `flow-grid-tile-container`, `aria-label` = the media name, newest first. Hovering a
tile reveals `Favorite`, `Reuse prompt` and `More options`. The tile's **More options menu** (verbatim
order) is the per-asset action list:

`Favorite` · `Reuse prompt` · **`Add to scene`** · **`Add to prompt`** · `Download` · `Copy` ·
`Rename` · `Share` · `Publish to YouTube` · `Set project cover` · `Flag output` · `Move to trash`

So clips are reused two ways: `Add to prompt` (sent to the agent as an ingredient) and `Add to scene`
(assembled into a scene). In the agent session, results also carry
`button[aria-label="Open video in editor"]` / `"Open image in editor"`.

**Clip editor = scene editor.** Opening a clip (`/project/<id>/edit/<media id>`) is opening the scene that
holds it. Toolbar: `Back` · `Favorite` · `Share` · `Download media` · `Move to trash` · `history` ·
`More options` (this one is the *app* menu: Download project, Product help, Flow help center,
changelogs, Flow Music, Flow TV, About Flow, Learn Flow, feedback, report, privacy). Playback:
`Skip to previous clip` / `Play` / `Skip to next clip` / `Mute` / `Full screen` / `Disable loop` with a
`Total duration` readout, a zoomable timeline, and `Add` (`Add clip`) to append another clip to the scene.
Editing box: `Describe how to edit this video…`, `Add ingredients to the prompt box`, a model chip
(e.g. `Omni 1.1 Flash`), `Start generation`, plus **`Save frame`** and **`Done editing scene`**.

**Scenes view** empty state is `Start creating or drop media` — that is where a sequence is assembled.

**Tools gallery** (`/project/<id>/tools`) is an applet marketplace with tabs `My Tools` / `Community` /
`Templates` and Image/Video categories. Google's own templates as listed today:

* Image: Simple Sketch · Scene Explorer · Mockup · Image Editor · Shot Explorer · Mask Magic · Converge · Grid Architect
* Video: Shader Effects · Type Overlays · pixelBento · Poster Designer · Video Sketch · **Transition Machine** ("Generate seamless transitions between your videos") · Weirdcore · **Video Resizer** ("Resize your videos into any aspect ratio") · **Stringout Creator** ("Stitch multiple video clips together") · Video Granulator · 3D Face Swap · character-tracking text labels
* Prompting: Character X-Ray · MetaPuppet · Style Writer · Storyboard Studio

`flow_use_tool({ tool_name: 'Stringout Creator' })` opens any of these (copies it into the project);
`flow_discover_ui` then reads the applet's inner controls.

**Superseded 2026-11-09: Extend now exists as Omni Extend** (subscribers, +3-10s per extension, web only) — see §16. The 2026-10-17 finding below still explains why the old code stitches clips, and that route is still the free one.

**There is no Extend control (2026-10-17 finding).** A document-wide sweep for `/extend|stretch|stringout|add clip|continue the shot/`
over All media, the clip editor, Scenes and Tools matched nothing but page scripts. So a 4s clip does not
get extended in place. What actually works, in order of preference:

1. **Scene assembly** — `Add to scene` on each clip, then `Add clip` in the editor (`Done editing scene` to commit).
2. **Stringout Creator** (template) — stitches multiple clips together inside Flow.
3. **Transition Machine** — seamless joins between clips.
4. **Locally, free and instant** — `flow_stitch_videos` normalises every clip to one canvas and joins with
   cuts or crossfades (optional 9:16 reframing, music, .srt burn-in). Verified: two 4s 720p clips →
   7.42s 1280x720 crossfade; three clips → 12.02s at 406x720 for Reels, with no upscaling.
5. **Continue the shot** — `Save frame` in the editor (or `flow_save_frame` locally: first/middle/last/timestamp)
   gives a jpg; upload it and use it as an ingredient, then prompt "continue this shot …". Verified route:
   an uploaded image already generated both an image and a video.

## 11. Corrections and additions from Google's documentation (2026-10-17)

Sourced from `docs/research/flow-official-facts.md` (35 KB, `support.google.com/flow/*` cited line by line).
**My earlier "there is no Extend" note was too strong** — see below.

**Extend DOES exist — but only for Veo clips.**
* Path (help center): open a project → click the clip → at the bottom click **Extend** → describe how the
  action continues → Generate.
* Hard gate: "You can currently only extend Veo generated videos"; **8s clips only**; the extend generation
  always runs on **Veo 3.1 Lite** even when the source was Fast or Quality (Google's credits table lists
  Extend under Fast/Quality as well, which contradicts its own models page — treat the models page as correct).
* An extended clip **loses insert / remove / camera** edits, so do object edits first.
* **Omni extend has not shipped** ("Features coming soon").
* **Closure attempt, 2026-10-17 (spent 10 credits): still no Extend in this build.** I generated a real
  8s **Veo 3.1 - Lite** clip — project `26388423-d2e9-4782-94a0-5f8efc2b0ed5` ("Veo Extend Verify"),
  media `484e7767-edba-41a3-8fc6-f239b02b48ee`, verified 1280x720 / 192 frames / 8.000s — and then swept
  its editor for the control. Results, all negative:
  - no node anywhere in the page matches `/extend/i` except `<title>` and `<style>`/`<script>` blobs;
  - the visible toolbar is exactly: Back · Favorite · Share · Download media · Move to trash · history ·
    More options · Done editing scene · Save frame · Mute · Skip to previous/next clip · Play ·
    Full screen · Disable loop · Add clip · Zoom out/in · Add ingredients to the prompt box ·
    Start generation;
  - no hover hotbar appears over the clip (the `<video>` element is not even in the DOM — the viewer
    renders outside it, which is also why a hover-based `Extend` could be missed by DOM sweeps);
  - `More options` on that page is the **app** menu (Download project / help / changelogs / Flow Music /
    Flow TV / About / Learn / feedback / report / privacy), not clip actions;
  - the edit box's model chip (`Omni 1.1 Flash`) exposes no dropdown here;
  - the tile's More-options menu has no Extend entry either.
  Conclusion: Google's help center documents Extend, but the shipped UI in this account/region does not
  surface it (at least not reachable from the media grid, the clip/scene editor, or the tile menus).
  Treat Extend as unavailable and use the routes below. Should Google surface it later, the documented
  path to look for is "open the clip, click Extend at the bottom, describe the continuation".

**Video length is controlled by the prompt, not by a UI control.** Appending "Video length: 8 seconds."
produced a genuine 8.000s clip (192 frames @24fps), and 4 seconds produced 4.010s. The `Settings trigger`
chip stayed `hidden` in every state I could reach, so the prompt string is the reliable way to set duration.

**Model dropdown options (Agent settings > Video generation default), verified:** `Omni 1.1 Flash`,
`Veo 3.1 - Lite`, `Veo 3.1 - Fast`, `Veo 3.1 - Quality`; image side: `🍌 Nano Banana 2.1`. A generation run
sets the model it needs and restores the account default afterwards (verified after the Veo Lite run: back
to `Omni 1.1 Flash`).

**Frames-to-Video: documented, entry point not located.** Help center: `Video → Frames` then
`+ Add start frame` / `+ Add end frame`, described action in the prompt; supported on all Veo 3.1 variants
and Omni 1.1 Flash (web only for Omni). I could not find that control in this build, after checking: the
agent prompt box before typing and after typing (only `Clear prompt`, `add`, `article_spark`, `tune`,
`arrow_forward`), Agent settings (no frames option), the clip editor, the header `+ → Add media menu`, the
sidebar `Videos` entry (inert in this view) and the Tools gallery. Treat the documented path as the truth
and the UI gap as ours to find. Until then the verified equivalent is: `flow_save_frame` → upload → attach
as an ingredient → "continue this shot".

**Scenebuilder** (help center, plus verified above): one scene per project; enter via header
`+ → New scene` or a tile's `More options → Add to scene`; drag-reorder, trim handles, preview; the sequence
exports as **one file** — direct YouTube upload is per-clip only, so a full sequence must be downloaded and
uploaded manually. No published clip-count or total-length limit.

**The create-mode control is server-driven, so the header `+` menu is the reliable entry:** `Upload` ·
`New collection` · `Create character` · **`New scene`** — nothing else. Verified live.

**Agent settings panel, verbatim (gear `button[aria-label="Settings"]:has-text("tune")`):**
`Agent settings` → `Confirm before generating` (Always / Never) → `Image generation default`
(`16:9`, `4:3`, `1:1`, `3:4`, `9:16`; `x1`-`x4`; model `🍌 Nano Banana 2.1`) → `Video generation default`
(`16:9`, `9:16`; `x1`-`x4`; model `Omni 1.1 Flash`) → `Save`. It opens as a panel with a `close`/`arrow_back`,
not an overlay, so an overlay-only dump reads it as empty.

**Model gates that silently change what you can do:** Veo 3.1 Quality cannot use Ingredients or Extend;
Veo 3.1 Fast cannot Extend; **only Omni edits video**. Picking a model can therefore remove features
mid-project.

**Credits (official):** charged **per generation, not per request** (2 outputs = 2× the bill), and failed
generations are refunded. Veo 3.1 Lite 10 / Fast 20 / Quality 100 (Ultra: 5/10/100); Omni 720p 7/10/12/15
for 4/6/8/10s and 360p draft 4/5/6/7. Base allowance 50/day, no rollover, refreshed by the first
generation. Peak hours 2–5 PM UTC: non-subscribers get no video generation. The account here reads **PRO**.

**Upload rules (official):** video uploads are capped at **60s / 1 GB**, types `.mov .mp4 .avi .wmv`;
anything over 30s must be trimmed to 30s to use as an ingredient reference, the edit window is ≤10s and a
conversation can carry ≤3 turns. Rights attestation text: "you confirm that you have the necessary rights
to any content that you upload".

**Watermark:** SynthID is embedded invisibly in all Veo/Omni/Nano Banana outputs; a visible watermark is
optional, and **mandatory in India, South Korea and Vietnam**. Canada is fully supported with no extra
policy, credit or watermark restriction.

**In-app MCP verification (2026-10-17, after reconnect):** `flow_stitch_videos` (2 clips, cut → 12.02s,
1280x720, 0 credits), `flow_save_frame` (`at: last` → 3.95s jpg, 0 credits) and `flow_add_to_scene` (clip into the
existing lantern-project scene, 0 credits) all execute through the MCP. Note the server refuses **every** `flow_*`
tool, including the purely local stitch/save-frame, with `BROWSER_NOT_CONNECTED` until `flow_connect` has run.
Credit balance read from the profile menu before and after: **986** → **986** (PRO). Three rejected calls in a row
make the the host client pause the server for ~54s, so connect first.

**Cleanup (2026-10-17, approved by the user):** trashed the scratch project "Veo Extend Verify"
(`26388423-d2e9-4782-94a0-5f8efc2b0ed5`; home-card `delete` → "Delete project" dialog, permanent) and the scene
"Untitled Scene 10-17 02:17:32" in the lantern project (scene editor `Move to trash`). The lantern clip itself and
the other two projects were left untouched; the home grid now lists exactly two projects.

## 12. Building Flow Tools (verified live 2026-10-17, PRO account, lantern test project)

Built two zero-credit tools through the real UI and then through the `flow_create_tool` handler: "Safe Zone Checker"
(`d59d9c78-469e-4b29-91d5-353f16e0516e`) and "Palette Police" (`e1e4e195-e37f-403d-8b1a-babf7722715c`), both in project
`622f69bd-8b26-484c-a5b8-c09d95a678ec`. Credits read 986 before; building spent **0** (the page says "Creating tools does not
currently cost credits").

* **Create page** `/project/<id>/create-tool`: prompt box is a ProseMirror div (`.ProseMirror`, aria-label = placeholder
  "Build a retro pixel effect app…"), starter chips (Time stretcher / Style morph / Voice over), send =
  `button[aria-label="Start generation"]` (disabled until text exists). Type with `keyboard.insertText`.
* **After submit** the URL becomes `/project/<id>/tool/<uuid>?mode=EDIT` immediately. The page is the builder: tabs
  `Preview` / `Code`, sidebar "Tool Builder", header with a `Tool | Edit` switch, `Apply to be featured`, Favorite, Share, More options, Done.
  Header name is `flow-applet-view-header input.editable-text-input` (renaming = fill + Enter, verified).
* **Done-signal:** `button[aria-label="Stop"]` is visible while the agent builds and disappears when finished; then
  `Send message`, `Good response/Bad response/Copy/Flag` and `Restore tool to this version` appear. Build times: 100 s (Safe Zone
  Checker, 9 files) and 144 s (Palette Police, 7 files); a one-line refinement took 27 s.
* **There is no Save click.** The tool autosaves and appears in `My Tools` (cards `.applet-card`, `.applet-name`).
* **Refine box:** `textarea[aria-label="Ask applet agent to make changes"]` (placeholder "What do you want to create?") +
  `button[aria-label="Send message"]`. The agent answered a one-line change correctly and changed nothing else (n=1).
* **Run mode** `?mode=APP`: the app is a blob iframe on `*.scf.usercontent.goog`; find it with a non-main frame whose URL matches
  and that has buttons. `input[type=file]` is directly usable with `setInputFiles`. The footer says "This Tool may consume
  credits" **even for tools that make no AI calls**, so the footer is generic, not a cost quote.
* **What a generated tool is:** a React + TypeScript project (7–9 files such as `App.tsx`, `components/*.tsx`, `utils/*.ts`)
  readable in the `Code` tab (`flow-applet-code-explorer` lists files; click a name to show it). Both tools made **no
  fetch/XHR/WebSocket/beacon calls and contained no external URLs**; they import `{ Flow } from 'flow-sdk'` and use only
  `Flow.media.select()`, `Flow.media.selectMultiple()` (gallery pickers returning base64) and
  `Flow.download({ base64, mimeType, filename })` (export). So the builder prompt should say to use those.
* **Functional check:** Safe Zone Checker accepted a 1080×1920 PNG, detected 9:16, and flagged a box in the bottom UI zone
  `WARN 100%`. Palette Police's built-in math benchmark produced exactly 45% black / 45% white / 8% orange / 2% other with the
  expected PASS/FAIL verdicts. (Its orange accent is the placeholder `#FF5A1F`: **the user has not confirmed Acme's exact orange.**)
* **MCP tools:** `flow_create_tool`, `flow_refine_tool`, `flow_inspect_tool` (src/tools/create-tool.js). They never click inside a
  tool's own UI, so nothing can spend credits through them. The app's running MCP child must be restarted/reloaded before the
  new tool names appear in the host.
* Still unknown: the daily creation quota and its limit message; whether Remix is under More options (not mapped); what deleting a
  tool does to shared links.

## 13. QC and captions (2026-10-17)

* `flow_qc_report` (src/tools/qc-report.js): ffprobe + blackdetect/freezedetect/silencedetect/ebur128, contact sheet + JSON in
  `outputs/qc/`. Parser output matches raw ffmpeg on a real Flow clip. **That Omni clip measured -39.1 LUFS / -24.1 dBTP**: Flow
  audio is far quieter than the -14 LUFS platform target, so loudness normalisation is a mandatory finishing step.
* `flow_stitch_videos` captions: a bare `subtitles=file.srt` drew text ~94% down a 1080x1920 frame. libass lays SRT out in a
  384x288 script space, so style values are script units; the default `subtitle_position: "safe"` now lifts portrait captions to
  end above ~64% of the frame height.

## 14. Practice run 1 (2026-10-17) — facts that changed the code

* Ingredient picker (`button[aria-label="Add ingredients to the prompt box"]`): picking an asset can now open a **preview with an
  "Add to prompt" button** instead of attaching on click (seen from the 2nd generation in a project). The chip appears only after
  that click. The option list also loads progressively (our asset was missing from the first read).
* Downloads go through Playwright's `<TMPDIR>/playwright-artifacts-*`. A server launched with another profile's `TMPDIR` lost a paid
  clip (`download.saveAs ENOENT`). `ensureOwnTmpDir()` now sets `TMPDIR=outputs/.tmp`. Recover a generated-but-unsaved clip by
  opening the project and running the download handler on the newest tile (no extra credits).
* Credits observed: 986 → 938 over 6 generations (5× Omni 720p: 4 s=7, 6 s=10; 1× Veo Lite 8 s=10) = 48.
* Raw clip loudness: Omni -30…-52 LUFS, Veo Lite -14.8 LUFS. Output size 720x1280.

## 15. Flow Music and beat sync (2026-10-17)

* Flow's app menu (`More options`) has a `Flow Music` item = `<a href="https://www.flowmusic.app/?utm_source=flow" target="_blank">`.
  Open it in a new tab of the same CDP profile (our harness: `ctx.newPage()`); log in with `Continue with Google` (the profile's own account).
  **Bring the Flow tab back to the front afterwards**, or Flow's overlays block clicks.
* Flow Music: Lyria 3.5 "Producer" chat. Prompt `textarea[placeholder*="create" i]`, `button[aria-label="Send message"]`; two takes per prompt;
  song menu `button[aria-label^="More options for <title>"]` → Download → `Download video / Get stems / M4A / MP3 / WAV` (Playwright `download` event).
  Banner "Grant access to your Google One subscription to use your benefits" is **not** clicked: it is the user's decision (commercial-use rights are tied to the paid benefit).
* Tools added: `flow_analyze_beats`, `flow_beat_sync` (src/tools/beat-sync.js). Accuracy: tempo ≤0.5 BPM and beat error ≤28 ms on synthetic click tracks with loud
  off-beat noise; +23 ms constant offset against real-track audio, cuts matched planned times within 20 ms in the rendered video.
* Lyria ignores tempo/length requests (asked 120 BPM / 30 s; got 126 and 122 BPM, 2:30). Always measure.
* Ingredient picker: when a project has many assets, use its `Search assets` field (the list shows only a window of recent assets).
* Credits: 938 → 899 for 8 s / 10 s / 8 s Omni (12 + 15 + 12).

## 12. Flow Music (flowmusic.app) — re-mapped 2026-11-02

Signed in as first@example.com, plan PLUS (10 545 credits on the day). **Signed in ≠ shell renders**:
`src/tools/flow-music.js` `gotoMusic()` waited for `a[href="/library/my-songs"]`, which the redesigned sidebar
no longer renders, and raised `UNKNOWN_UI_CHANGE: Flow Music shell (sidebar) did not render` — which earlier runs
misread as "signed out". Live shell marker: **`button[aria-label="New session"]`** (fallbacks kept: the old anchor,
`button[aria-label="Toggle compose panel"]`). Fixed in `gotoMusic()` the same day.

- Sidebar (top → bottom): `New session`, `Songs`, `Playlists`, `Spaces`, `Music videos`, `Projects`, `Profile`,
  `Turntable`, then the session list, then the account chip (`<display name> PLUS <n> Invite`).
- First visit after a fresh profile shows Google's **cookie consent banner** (`Agree` / `No thanks`) which intercepts
  clicks; `dismissCookieBanner()` clicks it before any panel interaction.
- Compose panel: `button[aria-label="Toggle compose panel"]`, `textarea[aria-label="Sound description"]`,
  `button[role=switch][aria-label="Toggle instrumental mode"]`, `button[role=switch][aria-label="Toggle advanced sound mode"]`
  → `label:text-is("BPM") ~ input`, `label:text-is("Length") ~ input` ("1:00"), then a single `Generate` button.
- **Completion detection: `/song/` anchors are NOT reliable.** A placeholder `Untitled` (`/song/<uuid>`) appears
  immediately and has no `NN%` node, so `listSongs()`+`generating()` can call it finished, or never settle.
  Observed good recipe: click Generate → poll `document.body.innerText` for `NN%` to disappear → wait ~60 s →
  read the new `/song/<uuid>` id → `downloadTrack(..., format:'WAV')`. One compose song = **5 credits**, WAV 48 kHz
  stereo, 60–104 s in these tests.
- Settings route `/settings` still works and carries the authoritative `<n> available` credit figure.

## 16. Omni 1.2 Flash remap (verified live 2026-11-09, PRO account, project `story-realism-20261109`)

Google shipped Gemini Omni 1.2 Flash on 2026-11-05 and the Flow menu changed under us. Re-mapped live
(read-only: `flow_discover_ui`, CDP DOM reads, screenshots — no credits spent):

* **The video-model menu is now:** `Omni 1.2 Flash` (selected by default in a fresh project),
  `Omni 1.1 Flash / Leaving Dec 5`, `Veo 3.1 - Lite`, `Veo 3.1 - Fast / Leaving Dec 5`,
  `Veo 3.1 - Quality / Leaving Dec 5`. The "Leaving Dec 5" suffix is part of the label.
  `Veo 3.1 Fast`, `Veo 3.1 Quality` and `Omni 1.1 Flash` are retired **2026-12-05**.
* **Agent settings are unchanged in shape** — `Confirm before generating`, image ratio/count/model,
  video ratio/count/model, `Save`. Still **no resolution and no duration control**, so duration must
  travel in the prompt text ("Video length: 12 seconds.") and output is 720p. Selecting a model there
  only changes the default; it does not spend anything.
* **Clip tiles now print `model • resolution • duration`** under the prompt, e.g.
  `Omni 1.1 Flash • 720p • 4s`. That line is the cheapest way to audit what a run actually produced.
* **Omni 1.2 capabilities** (Google docs + menu): 3-15s in 1s steps (3-10s without a subscription);
  text-to-video, frames-to-video (first / first+last), ingredients + references (images, motion clips
  ≤3s, audio cues), video-to-video with **multi-turn conversational edits** on clips up to 15s,
  **Omni Extend** (+3-10s, up to 3 image refs, subscribers, web only), 360p drafts and upscale to
  1080p, custom voices (preset + prompt to restyle). Veo 3.1 Lite keeps 4/6/8s, ingredients at 8s
  only, no edits and no extend.
* **Veo Extend is gone** (retired 2026-11-05); any clip that needs to grow uses Omni Extend or
  `flow_stitch_videos` locally.
* **Credits moved from per-clip to per-second** (§6). A 4s 720p clip is 12 credits (was 7 on 1.1),
  a 15s clip is 60; edits are per second too, so the old flat 40 for a 4s edit is now 12.
  360p would be cheaper, but the user rejects 360p: always 720p.

**Prompt craft that Omni 1.2 rewards** (from Google's release notes + the Flow help pages; apply in
`acme-ad-scripting`):

1. **One continuous shot per clip.** 1.2 holds scale and framing far better with an explicit camera
   path ("slow dolly in from chest height, no cuts") than with several implied shots stitched by the
   model; jump cuts are the usual failure.
2. **Give the length in whole seconds in the prompt** (`Video length: 12 seconds.`) — that is the only
   duration control that exists, and 1.2 honours 3-15s.
3. **Reference, don't describe, anything that must match**: attach the print, the garment flat and the
   character as ingredients; 1.2 keeps faces, garment cut and typography stable across angles. Keep our
   standing rule that prints/logos are composited locally, never model-drawn.
4. **Iterate with an edit, not a regeneration.** Ask for the one change ("swap the background to a wet
   street, keep the framing") — each turn is billed at 3 credits/s, which is still cheaper than a new
   15s generation.
5. **720p only (the user, 9 Nov 2026).** No 360p drafts; save credits with fewer, shorter takes and edits.
6. **Dialogue**: name the speaker per line and keep lines short; 1.2 improved lip-sync and
   multi-speaker routing. Still ask for "no subtitles, no on-screen text" and set type locally.
