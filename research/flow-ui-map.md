# Google Flow UI map — canonical (live-verified 2026-11-13)

**Project:** "Acme Test" — https://flow.google.com/project/00000000-0000-0000-0000-000000000000
**Account:** Your Name, you@example.com, PRO. **Balance at mapping:** 762 credits, resets Nov 29 at 4:47 AM.
**Verified:** live in the cloud browser 2026-11-13 01:03–01:16 CST. Research only: nothing generated, no credits spent, no files uploaded. Agent settings were opened and closed with Back (no Save, no changes). Final state left as found: Agent mode off, direct settings "Video · 720p · 4s x1", empty prompt, Start generation disabled.
**Companion file:** `flow-ui-map-from-code.md` (1,044 lines) — the same UI extracted from the MCP server source (routes, `config/selectors.map.json`, Tools gallery controls, character/scene forms). This file is the live-verified core; the code map is the deeper reference. Where they disagree, this file wins — it was checked against the running app.

---

## 0. How to use this map

- Every control is listed with its **exact visible label** and, where the walkthrough could read it, its **selector** (`button[aria-label="..."]`, `textbox[aria-label="..."]`, `slider[aria-label="..."]`, `radio "..."`).
- **Direct generation (Agent mode off) is the primary generation path** for Acme work — the agent fails often ("Something went wrong", free) and direct generation is the reliable fallback. Section 3 documents the direct path completely, including the settings popover and where the credit cost is shown.
- **The project's UI default model is Omni 1.2 Flash.** the user's standing rule is Omni 1.1 Flash for Acme videos (4 s = 7 cr vs 12 cr, quality still very good). Every generation must explicitly pick Omni 1.1 in the model picker — never trust the default.
- **Credits live inside the Account settings dialog** (avatar → "762 Google Flow credits"), not as a top-bar chip. The per-generation cost is shown in the direct settings popover footer ("Generating will use N credits") — that number is the contract; check it before every generation.

---

## 1. Top bar (project page, left to right)

| Control | What it does |
|---|---|
| `button[aria-label="Home"]` (house icon) | Goes to flow.google.com (project list). |
| Heading "Acme Test" (h1) + `textbox[aria-label="Editable text"]` | Project title, editable in place. |
| `button[aria-label="More options for the project"]` (⋮) | Menu: "Rename", "View trash", "Delete". |
| `button[aria-label="Search"]` (magnifier) + `textbox[aria-label="Search"]` | Expands a full-width search field with a "Back" button (exits search mode) and a "Clear search input" button. No scope dropdown. |
| `button[aria-label="Filtering and sorting options"]` (funnel) | Opens the "Filters" dialog: Type (checkboxes Images, Videos, Collections, Scenes, Characters); Aspect ratio (Landscape, Portrait, Freeform); Created (Generated, Uploaded, Favorites); Duration (3 s–15 s checkboxes); Resolution (720p, 360p); Sort by radio Newest [checked] / Oldest; footer shows result count ("39 results") and button "Clear all filters". |
| `button[aria-label="Add media menu"]` (+) | Menu: "Upload", "New collection", "Create character", "New scene". Submenus did not visibly expand on hover in this session. Clicking "Upload" closed the menu and surfaced NO file picker (see the upload lesson below). |
| `button[aria-label="Product help"]` (?) | Opens the Help Panel (right-side iframe): heading "Help", "Close Help Panel" button, "Popular help resources" with links "Get started with Google Flow (Help article)", "Manage your Google Flow credits (Help article)", "Create videos in Google Flow (Help article)", "Learn about Google Flow models & supported features (Help article)", "Edit videos & build scenes in Google Flow (Help article)", button "Search Help", button "Send feedback". |
| `button[aria-label="Settings"]` (gear, "View settings") | "View settings" menu: View mode radio Grid [checked] / Batch; Grid size radio S / M [checked] / L; switches "Sound on hover", "Return silent videos", "Show tile details", "Clear prompt on submit" [checked]. |
| `button[aria-label="More options"]` (⋮, top-right, global app menu) | Menu: "Download project" (submenu), "Product help" (submenu), "Flow help center", "View all changelogs", "Flow Music", "Flow TV", "About Flow", "Learn Flow", "Send app feedback" (submenu), "Report legal issue", "Privacy notice". |
| `button[aria-label="Account details"]` (avatar "D" with "PRO tier" chip) | Opens the "Account settings" dialog: "Your Name" / "you@example.com", link "Switch account", link "762 Google Flow credits" + text "Resets Nov 29 at 4:47 AM" + link "Upgrade", button "Create avatar", link "Manage subscription", button "Sign out of all accounts", switch "Visible watermarking", links "Privacy", "Terms of Service", "Licenses", plus a reCAPTCHA notice. |

## 2. Left nav / projects

- Navigation "Project navigation": buttons "All media", "Images", "Videos", "Characters", "Scenes", "Uploads"; link "Library" with button "Create collection" (+) inside it; link "Tools"; link "Create tool"; link "Trash"; button "Collapse".
- Home page (flow.google.com, "Google Flow - AI Creative Studio for Video, Images & Custom Tools"): top bar with "Google Flow" logo link, links "Flow Music" and "Flow TV", links "Link to Google Labs Discord server", "Link to Flow on Instagram", "Link to Flow on X (Twitter)", "Product help" and "More options" buttons, account avatar. Promotional banner: "Introducing Gemini Omni 1.2 Flash" — "Better character and scene consistency, sharper visuals and fewer jump cuts. See what our newest video model can do!" — buttons "Try it now!" and "Dismiss banner". Project list: one project card, link "Open project" ("Acme Test", thumbnail = mannequin black hoodie), buttons "Edit project title" (pencil) and "Delete project" (trash), plus button "New project" (creates a project). No community/explore feed on this home page.
- Trash (`/project/<id>/trash`): heading "Trash", "Back button to go to previous page", buttons "Restore all" [disabled] and "Delete all" [disabled], empty state "Trash is empty".
- Library: clicking the left-nav "Library" row in this session did not navigate anywhere — the grid stayed on All media. Collections are created via its "Create collection" + button; none exist in this project.
- Project settings = the project-title ⋮ menu (Rename / View trash / Delete) and the Agent settings panel (§3). History = the agent session history (§3) and the editor's History panel (§6).

## 3. Create / generate panel (bottom prompt bar)

- `textbox[aria-label="What do you want to create?"]` — the prompt box. Button "Expand" (top-right of the prompt box; opens the Agent panel when Agent mode is on). `button[aria-label="Add ingredients to the prompt box"]` (+) — opens the Ingredients panel (§4).
- **Agent mode:** button "Agent" (toggle; pressed = on). When on, the bar adds button "Agent instructions" and `button[aria-label="Settings"]` (tune icon) for Agent settings; the direct "Settings trigger" pill is hidden.
- **Direct mode (Agent off):** button "Settings trigger" pill showing "Video · 720p · 4s x1" — opens the direct quick-settings popover (below). `button[aria-label="Start generation"]` (→) — disabled until a prompt is entered (description "Prompt must be provided").

### 3.1 Direct quick-settings popover (from the Settings trigger pill)

- Mode radiogroup: radio "Image" / radio "Video" [checked].
- Video type radiogroup: radio "Frames" / radio "Ingredients" [checked].
- Aspect ratio radiogroup: radio "16:9" [checked] / radio "9:16".
- Button "Select model family" (shows current model, "Omni 1.2 Flash") — opens the model menu (§3.2).
- Video resolution radiogroup: radio "360p — 360p generates faster at lower resolution" (with an info icon) / radio "720p" [checked].
- Length slider (`slider[aria-label="Length"]`, value 1 = "4 Sec") — range 3 Sec (value 0) to 15 Sec (value 12), default 4 Sec. (Verified by moving it to its ends with End/Home keys and returning it to 4 Sec.)
- Output count radiogroup: radio "x1" [checked] / "x2" / "x3" / "x4".
- Footer link **"Generating will use 12 credits"** — the credit cost, bottom of the popover. Observed for Omni 1.2 Flash / 720p / x1: 3 Sec → 9 credits, 4 Sec → 12 credits, 15 Sec → 60 credits. **This is the contract — read it before every generation.**

### 3.2 Model picker

Identical list in the direct popover ("Select model family") and in Agent settings ("Video generation default model"). Menu items (no per-model credit/duration text in either menu):

- "Omni 1.2 Flash"
- "Omni 1.1 Flash" (red subtext "Leaving Dec 5")
- "Veo 3.1 - Lite"
- "Veo 3.1 - Fast" (red subtext "Leaving Dec 5")
- "Veo 3.1 - Quality" (red subtext "Leaving Dec 5")

**Acme default: Omni 1.1 Flash.** Billing (verified): Omni 1.1 per clip — 4 s = 7 cr, 6 s = 10, 8 s = 12, 10 s = 15. Omni 1.2 bills per second at 720p (3 cr/s → 4 s = 12). Omni 1.1 retires 2026-12-05, so the default will need revisiting then.

### 3.3 Agent settings panel

(`button[aria-label="Settings"]` tune icon, Agent mode on; heading "Agent settings" — "Settings for the agent within this project.")

- "Confirm before generating" radiogroup: radio "Always — Agent will ask for confirmation before generating media." [checked] / radio "Never — Agent will generate media and spend credits automatically." **Never pick "Never" and never click "Always approve" — only "Approve" on a single generation.**
- "Image generation default": aspect-ratio radios 16:9 [checked] / 4:3 / 1:1 / 3:4 / 9:16, output-count radios x1 / x2 [checked] / x3 / x4, button "Image generation default model" (🍌 "Nano Banana 2.1") — menu: "🍌 Nano Banana Pro", "🍌 Nano Banana 2 Lite", "🍌 Nano Banana 2.1".
- "Video generation default": aspect-ratio radios 16:9 [checked] / 9:16, output-count radios x1 [checked] / x2 / x3 / x4, button "Video generation default model" ("Omni 1.2 Flash") — same 5-model menu as §3.2.
- Buttons "Save" and "Back" (top-left, exits without saving).

### 3.4 Agent panel

Opened by the "Expand" button or by the Agent toggle. Right slide-over with button "Open session history" (☰), session title heading (current: "University Campus Cinematic Narrative"), button "Start new session" (pencil icon), button "Close" (X). Each past turn shows: the user prompt text; the agent reply ("I'm going to generate a 4-second video of … using your default model, Omni 1.2 Flash." + "Would you like me to kick off this 1 video generation, costing 12 credits?"); radiogroup "Permission options" (radio "Approve" / radio "Always approve in project" / radio "Reject" — on past turns shown disabled with the chosen one checked); group "Media options gallery" with button "Open video in editor"; the agent's confirmation text ("I've started generating …"); buttons "Good response" (thumbs up), "Bad response" (thumbs down), "Copy", "Flag output"; and where applicable an "Attached ingredients" section with an "Image ingredient" button (thumbnail). **Direct-mode generations do not appear in this history.**

Session history (from "Open session history"): heading "Session history", buttons "New session" and "Create new session" (they create a session), session list with buttons "University Campus Cinematic Narrative" (current) and "Acme Genetics Apparel Campaign", each with a "More options" button whose menu is "Rename", "Report legal issue", "Delete"; button "Back".

### 3.5 Agent instructions

Button "Agent instructions" in the Agent prompt bar. Panel heading "Agent instructions", "Back" and "Close" buttons, button "Add instruction", "Done" button. The list is currently empty (no instructions set).

## 4. Ingredients panel

(`button[aria-label="Add ingredients to the prompt box"]`)

- Combobox "Select project" ("Acme Test").
- Tablist "Category navigation": tabs "All" [selected], "Images", "Videos", "Voices", "Characters", "Avatars", "Uploads".
- Button "Upload media" (bottom-left, upload icon). **Plain clicks never surface a file picker** — the working upload route is the browser's file transfer onto this button (see the upload lesson in §8).
- Textbox "Search assets"; combobox "Sort assets" ("Recent"); listbox "Asset list" (each option is a video or image, e.g. "Woman talking in dorm room Video", "backpack-navy-front-womens-lifestyle.jpg Image", "hoodie-white-back-model-female.jpg Image").
- Preview pane on the right (video: "Video preview" with "Play" [disabled until loaded], times "00:00:00" / "00:04:00", "Unmute"; image: "Preview of <filename>") and button "Add to prompt" (bottom-right). Clicking an asset previews it; **only "Add to prompt" attaches it**, which adds an "Ingredient" chip to the prompt box and an "Attached ingredients" section to the turn.
- The "Uploads" tab lists only the 11 uploaded images (backpack-navy-front-womens-lifestyle.jpg, hoodie-black-back-model-womens.jpg, hoodie-white-back-model-female.jpg, hoodie-white-front-model-female.jpg, hoodie-white-back-flat.jpg, hoodie-black-back-model-male.jpg ×3, hoodie-black-back-flat.jpg, hoodie-black-back.jpg ×2).
- **No ingredient-strength slider and no character/scene options control appears anywhere in this panel.**

## 5. Generation modes

- **Text to Video:** prompt box with no ingredient, Mode "Video", Video type either.
- **Frames to Video:** Mode "Video" + Video type radio "Frames".
- **Ingredients to Video:** Mode "Video" + Video type radio "Ingredients" + an attached ingredient chip.
- **Image mode:** Mode radio "Image" (uses the image defaults: Nano Banana models, x2 count).
- **Scenes:** left-nav "Scenes" button; "New scene" in the Add media menu (+); tile context menu "Add to scene ›" submenu (lists existing scenes, plus "New scene" — no scenes exist here, so only "New scene" shows); the editor is a scene editor ("Done editing scene" button, timeline with "Add clip" to append another clip to the scene).
- **Extend:** no standalone "Extend" button was found in the current UI. The closest equivalents are the editor's "Add clip" (appends a new clip to the scene timeline) and the editor's edit prompt box ("Describe how to edit this video…") with its own model selector ("Select model family", currently "Omni 1.2 Flash") and "Start generation" button.

## 6. Output / history (generated clip)

- Grid tile (group, clickable → opens the editor at `/project/<id>/edit/<media-id>`): video tiles are image "Generated video thumbnail" (play icon overlay), image tiles are image "Tile displaying a user's image". Hovering/selecting a tile shows buttons "Favorite" (heart), "Reuse prompt", "More options" (⋮, description "More"), and a title button (opens a details popover).
- Tile context menu (button "More options" on a tile): "Favorite", "Reuse prompt", "Add to scene" › ("New scene"), "Add to prompt", "Download" ›, "Copy", "Rename", "Share" ("Sharing allows anyone with the link to view and remix your creation."), "Publish to YouTube", "Set project cover", "Flag output", "Move to trash" (red). Its "Download" submenu: "270p Animated GIF", "720p Original size", "1080p Upscaled", "4K Upscaled" [disabled], link "Upgrade". **"720p Original size" is the original — always download that one.**
- "Reuse prompt" fills the prompt box with that clip's prompt and re-attaches its ingredient, and reveals a button "Clear prompt" to empty the box again.
- Editor (`/project/<id>/edit/<media-id>`, e.g. media 079d7b3b-d733-4edf-965a-2b3662758611 "Woman turning in lecture hall"): top media carousel — "Previous media" / "Next media" buttons and a button per project media (video tiles and image files) to switch media without leaving; heading = media title + `textbox[aria-label="Editable text"]` (rename in place). Top-right toolbar: button "Favorite", button "Share", `button[aria-label="Download media"]` (same options as the tile Download submenu), button "Move to trash", button "Hide history" (toggles the History panel), button "More options" (the same global app menu as the project page), button "Done editing scene". Player: image "Scene video preview", button "Save frame", button "Mute", "Current time: 00:00:00", buttons "Skip to previous clip" / "Play" / "Skip to next clip", "Total duration: 00:04:00", button "Full screen" (tooltip: "Toggle fullscreen (f)"), button "Disable loop" [pressed]. Timeline (bottom): second ruler (00–20), clip strip frames, button "Add clip" (+ after the clip), button "Move the playhead away from the clip edge" [disabled], "Timeline scrollbar", "Zoom out" / "Zoom in" [disabled] buttons. Edit prompt box: textbox "Describe how to edit this video…", button "Add ingredients to the prompt box", button "Select model family" ("Omni 1.2 Flash"), button "Start generation" [disabled until a prompt is entered]. History panel (right, region "History"): the generation's thumbnail + "Ingredient" chip (image "Ingredient image"), the full prompt text, buttons "Reuse prompt" and "Expand prompt".
- A media ID lives in the editor URL (`/edit/<media-id>`) and in the angle-bracket "media" links on the home/project pages. A transient "Failed to load scene" toast can appear in the editor — it is harmless and does not block download.

## 7. Tools, Flow TV, and the rest

- **Tools page** (`/project/<id>/tools`, from left-nav "Tools"): heading "Explore tools", radios "My Tools" [checked] / "Community" / "Templates"; hero "Submit your tool to be featured" ("Each week we share a handful of the community's most exciting new tools for everyone to use."); section "My creations" with button "Create New". Templates tab: hero "Build all the tools you can imagine." — "An idea and a description are all it takes to make whatever tool you need." — button "Create tool"; categories Image (Simple Sketch, Scene Explorer, Mockup, Image Editor, Shot Explorer, Mask Magic by Arden Schager, Converge by Chris Maestas, Grid Architect by Henry Daubrez), Video (Shader Effects, Type Overlays, pixelBento by László Gaal, Poster Designer by Heysu Oh and Kaloyan Kolev, Video Sketch, Transition Machine by Scotch Johnson, Weirdcore by Kaloyan Kolev, Video Resizer, Stringout Creator, Video Granulator by Arden Schager), Prompting (Character X-Ray by MetaPuppet, Style Writer, Storyboard Studio, Prompt Tree by Scotch Johnson, Story Sketch), Experimental (Frame Deconstructor by Shashwath Santosh and Alan Yam, Blob Tracking by Arden Schager, DepthWarp 4D by Sam Lawton, Webcam Set, Datamosh by Kaloyan Kolev, 3D Model Visualizer by Filip Havlena, Scout360 by PJ Ace, Ribbit by Kat Zhang, Whisk, Pose Text by Alan Yam, 3D Face Swap). Community tab: "Submit your tool to be featured" banner carousel (6 slides), "Spotlight creatives" (e.g. Character Poster by James Gerde, Character Arc / Pixel Machine by Anurag Tiwari, Lucid Glass by Ezra Paulekas, Pocket Studio, Mondo Sónico, SwissFlow Studio by Hashem Al-Ghaili, CaptionCast by Jay Pirabakaran), then Image / Video / Experimental community tools (e.g. B-2 Illustrator, Background Remover, 8-Bit Quest, AI Subtitle Generator, GeoVisualizer, Mars Blueprint Architect). Each tool card has a "More options" (⋮) button.
- **Flow TV** (More options menu → "Flow TV"; opens a separate tab at labs.google/flow/tv/channel/<name>/<id>?random=true): top bar with "Flow TV" logo, button "Play random channel", textbox "Search", links "Create with Flow" and "Join our Discord", buttons "About Flow TV" and "See more options" (⋮); player controls "Go to previous video" (Previous Clip), "Pause video" (Playing), "Go to next video" (Next Clip), "Loop all channel videos" (Loop Channel), "Unmute video" (Muted), "Go fullscreen" (Full Screen); checkbox "Show additional data" [checked] (shows the prompt and model tags, e.g. "Text to Video", "Veo 2"); link "Reuse Prompt"; links "Enter lightbox view" and "Enter grid view"; "CHANNEL" section with link "View all", "Go to previous channel" / "Go to next channel", "Share" button.
- **Keyboard shortcuts:** no Flow-specific keyboard-shortcuts list was found in the account menu, the More options menu, or View settings. The only in-app keyboard hints seen: the player "Full screen" control ("Toggle fullscreen (f)") and the Help panel header note ("To move the Help panel, press space bar to grab it. Use arrow keys to move it.").

## 8. Standing lessons (from the Acme builds — these override any generic advice)

- **Upload lesson:** in the cloud browser, plain clicks on Flow's "Upload" / "Upload media" buttons NEVER surface a file picker. The working route is to route the granted file through the browser's file transfer onto the ingredients panel's "Upload media" button — that attaches the file to the project. Once uploaded, pick the file from the project's asset list as the generation ingredient.
- **Agent fails often** ("Something went wrong", free) — direct generation (Agent mode off) is the reliable fallback: no permission card, the cost shows in the settings popover.
- **Never click "Always approve"** (only "Approve" on a single generation). Agent settings "Confirm before generating" stays on "Always".
- **Never put character names or ages in a prompt** — Flow bakes them in as on-screen name labels.
- **Flow garbles small on-screen text** — generate garments plain, add the ACME. wordmark and all text locally (HyperFrames/ffmpeg). Never ask the model to write brand text — attach the real logo as an ingredient.
- **Back-print scale drifts** — state a frame-relative size ("the text line only about 15 to 20 percent of the frame width") + static camera + a real site mockup as the ingredient, then measure the generated print against the mockup before accepting.
- **Credit deductions can lag** — a generation may not reduce the displayed balance immediately (seen for both Flow video and Flow Music). Plan on the deducted number, not the displayed one.
- **Sticky menus:** open menus in Flow are sticky — pressing Escape does not reliably close tile/session context menus, and clicks on covered elements are refused. The reliable ways to close one are clicking a harmless menu item (e.g. "Product help", "Reuse prompt") or reloading the project page.
- **Blank black page:** after navigation a blank black page can recur once and renders after a ~25 s wait (known soft block; no bot-challenge call needed).
- **The "Your video has been downloaded!" toast alone is not proof of a download** — confirm the file actually arrived in the download folder.
- **Flow Music is a separate app** (flowmusic.app) with separate credits. Its full UI map lives in the code-extracted companion file (`flow-ui-map-from-code.md`, Part B) and in the MCP's `docs/research/flow-music-ui-map.md`.

## 9. What changed vs the code-extracted map

- The direct quick-settings popover (§3.1) and the model picker (§3.2) are now fully mapped live — the code map had no direct-generation flow at all.
- The Ingredients panel (§4) is confirmed live: no ingredient-strength slider exists; only "Add to prompt" attaches.
- No standalone "Extend" button exists in the current UI (§5).
- The Tools page (§7) and Flow TV are now mapped with their live contents.
- Selector freshness: the core code map dates from 2026-10-16 and the prompt-box container already changed once (2026-11-10). This file is the 2026-11-13 live truth; re-verify selectors when a generation step starts failing.
