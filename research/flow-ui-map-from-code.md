# Google Flow + Flow Music UI map — extracted from the MCP server source code

**Status:** DRAFT, extracted from code only (no live browser walkthrough, no credits spent).
**Date:** 2026-11-13.
**Sources:**
- `~/workspace/acme-video/google-flow-browser-mcp-cloud/` — cloud edition (38 tools):
  `src/navigation/flow-ui.js` (the selector source of truth, mapped against the live UI 2026-10-16),
  `src/cloud/tool-definitions.js`, `src/cloud/cloud-queue.js` (assignment builders),
  `src/tools/*.js`, `src/browser/account-check.js`, `src/accounts/flow-balance.js`,
  `src/utils/video-models.js`, `config/flow.config.json`, `config/selectors.map.json`
  (discovered UI, last updated 2026-11-12), `CLOUD-SETUP.md`.
- `~/workspace/acme-video/google-flow-browser-mcp/` — original local edition (same tools,
  local Chrome via Playwright CDP), `DIMO-SETUP.md`.
- `google-flow-browser-mcp/docs/research/flow-music-ui-map.md` — Flow Music map, verified live
  2026-10-17 (account first@example.com, plan PLUS, Lyria 3.5).
- `~/workspace/acme-video/research/ad-overthinking-brief.md`,
  `research/mostly-unconscious-build-report.md` — behaviours learned in practice (Nov 2026).

**How to read it:** every control lists the exact selector/label from the code and what it does.
Flows are the step sequences the code automates. Quirks are failure modes recorded in code comments
or in the Acme build reports. §6 lists what the code does NOT cover — a live browser walkthrough
still needs to fill those in.

**Scope note:** the two MCP editions share the same `src/tools/` and `src/navigation/flow-ui.js`
(they diff identically except one `.bak` file). The cloud edition never executes those handlers —
its `src/index.js` does not import them; they are kept as the selector/step source the assignment
builders in `src/cloud/cloud-queue.js` were written from. The local edition executes them against
its own Chrome (CDP port 9334, profile `browser-profiles/google-flow-muse`).

---

# PART A — Google Flow (flow.google.com)

## A.1 Routes (from `flow-ui.js` `routes` + `FLOW_PATH_RE`)

| Route | Purpose |
|---|---|
| `https://flow.google.com/?pli=1` | Home (app home; bare `/` sometimes serves the `/about` marketing page instead — `goHome()` retries once with plain `/`) |
| `/about` | Marketing landing page |
| `/project/<uuid>` | Project page (prompt box + media grid) |
| `/project/<uuid>/tools` | Tools gallery |
| `/project/<uuid>/create-tool` | Create-tool (Tool Builder) page |
| `/project/<uuid>/trash` | Trash |
| `/project/<uuid>/character` | "New character" form |
| `/project/<uuid>/character/<uuid>` | Character detail (after creation) |
| `/project/<uuid>/scene/<uuid>` | Scene editor |
| `/project/<uuid>/edit/<uuid>` | Media viewer/editor (image or video) |
| `/project/<uuid>/tool/<uuid>` | Tool (applet) page; `?mode=EDIT` = builder + preview, `?mode=APP` = run mode |

Project used in practice: "Acme Test",
`https://flow.google.com/project/00000000-0000-0000-0000-000000000000`.

## A.2 Global shell — home page

| Control | Selector / label (code) | What it does |
|---|---|---|
| New project | `button:has-text("New project")` | Creates a project immediately; Flow opens `/project/<uuid>` at once. Project title is then renamed via the inline editable field. |
| Project card | `a[href^="/project/"]` | Opens an existing project. Home lists newest first. Card actions (from `selectors.map.json` "stable"): "Edit project title", "Delete project". |
| Account chip | `flow-header-user-icon [role=button][aria-label="Account details"]` (see `flow-balance.js` `ACCOUNT_CHIP`) | Opens the account dialog panel listing the account email and `span.credits-count` = e.g. "886 Google Flow credits". The count sits inside a link, so it is read, never clicked. |
| Account check (fallback selectors) | `[data-account-email]`, `[role="button"][aria-label*="account" i]`, `[role="button"][aria-label*="gmail" i]`, `[aria-label*="Google Account" i]` (`account-check.js` `ACCOUNT_SELECTOR`) | Alternate ways the code finds the signed-in account. |
| Sign-in wall detection | redirect to `accounts.google.com` | `gotoFlow()` throws `NOT_LOGGED_IN` ("Redirected to Google sign-in") when the page lands on Google sign-in. Cloud assignments say: if a sign-in page appears, STOP and report `login_required`; do not attempt to sign in from there. |

## A.3 Project page — header, sidebar, prompt box

Discovered 2026-11-12 (`config/selectors.map.json` "project" section; account shown there was
`second@example.com`, "Acme") and 2026-10-16 ("scenes" section; account
`first@example.com`, "Your Name").

| Control | Selector / label (code) | What it does |
|---|---|---|
| Home | `button[aria-label="Home"]` (icon text `home`) | Back to Flow home. |
| Project title (editable) | `.editable-text-container input` (`SEL.projectTitleInput`); also `input[aria-label="Editable text"]` | Inline rename of the project (and of scenes); commit with Enter. `renameCurrentProject()` verifies the new value stuck, else throws. |
| More options for the project | `button[aria-label="More options for the project"]` (icon `more_vert`) | Project-level menu (contents not enumerated in code — see §6). |
| Search | `button[aria-label="Search"]` (icon `search`) | Opens the project search input (`input[aria-label="Search"]`). |
| Filtering and sorting options | `button[aria-label="Filtering and sorting options"]` (icon `filter_list`) | Grid filters: Type, Aspect ratio, Created, Duration, Resolution; Sort by Newest/Oldest (`selectors.map.json` "stable" → `filters`). |
| Add media menu | `button[aria-label="Add media menu"]` (icon `add`, the header "+") | Opens the Add media menu. Menu items (from `selectors.map.json` "stable"): **Upload** \| **New collection** \| **Create character** \| **New scene**. `uploadAsset()` clicks `button[role="menuitem"]:has-text("Upload")`. |
| Product help | `button[aria-label="Product help"]` (icon `help`) | Help (contents not enumerated in code — see §6). |
| Settings (view settings) | `button[aria-label="Settings"]` (icon `settings_2`) in the header | View settings — **not** Agent settings (the code warns: "header 'settings_2' is view settings, not this"). Contents not enumerated in code — see §6. |
| Account details / PRO chip | `button[aria-label="Account details"]` (text `PRO`) | Opens the account dialog (email + `span.credits-count`). |
| Google Account link | `a[aria-label="Google Account: <name> (<email>), Google membership"]` | Account link in the header. |
| Sidebar filters | Buttons with text `dashboard All media`, `image Images`, `movie Scenes`, `accessibility_new Characters`, `drive_folder_upload Uploads` (icons + labels; `selectors.map.json`) | Filter the project grid by media type. Full sidebar list (from "stable"): **All media, Images, Videos, Characters, Scenes, Tools, Create tool, Trash**. |
| Sidebar collapse | `button` with text `left_panel_openExpand` / `left_panel_closeCollapse` | Expand/collapse the sidebar. |
| Prompt box | `[role="textbox"][aria-label="What do you want to create?"]` (`SEL.promptBox`) | The agent-first chat prompt box. Since 2026-11-10 it is an Angular ProseMirror editor inside `flow-creative-agent-prompt-box` (the old `.agent-panel-prompt-box` container is gone). `fillPrompt()` clicks, Ctrl+A, Backspace, `insertText`, then verifies the typed text and re-types with `keyboard.type` (delay 8 ms) if the first attempt did not stick. Max prompt 4000 chars (enforced by the MCP). |
| Start generation | `button[aria-label="Start generation"]` (icon `arrow_forward`) | Sends the prompt to the Flow agent. `generate-video.js` throws `GENERATION_BUTTON_DISABLED` if it is missing or disabled. |
| Start new session | `button[aria-label="Start new session"]` (icon `edit_square`) | Starts a fresh agent session. `startNewSession()` only clicks it when message rows exist (`.messages-list .message-row` count > 0); otherwise returns false. |
| Open session history | `button[aria-label="Open session history"]` (icon `menu`) | Opens the session history panel (contents not enumerated in code — see §6). |
| Close (session panel) | `button[aria-label="Close"]` | Closes a side panel / dialog. |
| Agent (tab/button) | Button with text `Agent` | Agent panel toggle (behaviour not detailed in code — see §6). |
| Agent instructions | `button[aria-label="Agent instructions"]` (icon `article_spark`) | Agent instructions (contents not enumerated in code — see §6). |
| Add ingredients to the prompt box | `button[aria-label="Add ingredients to the prompt box"]` (icon `add`) | Opens the ingredients picker (see A.6). |
| Settings trigger (agent bar) | `button[aria-label="Settings trigger"]` — text shows the current default model, e.g. `🍌 Nano Banana 2.1 crop_16_9 x2` | Shows the current Agent defaults (model + ratio + count) in the prompt bar. Distinct from the Agent settings button. |
| Agent settings button | `button[aria-label="Settings"]:has-text("tune")` (`SEL.agentSettingsButton`, icon `tune`) | Opens the **Agent settings** panel (see A.4). |

## A.4 Agent settings panel ("Agent settings")

Opened by the tune button. Title: `h2:has-text("Agent settings")` (`SEL.agentSettingsTitle`).
`openAgentSettings()` returns early if the panel is already open. Closing: click
`button[aria-label="Back"]` — the code warns **"Back" returns to the chat; "Close" would collapse
the whole agent panel**. If Back fails, press Escape. A leftover
`.cdk-overlay-backdrop-showing` layer after escaping a menu swallows the next click
("intercepts pointer events"); `waitForNoBackdrop()` waits up to 6 s for it to detach.

| Control | Selector / label (code) | What it does |
|---|---|---|
| Image generation default model | `button[aria-label="Image generation default model"]` (`SEL.imageModelButton`) | Opens the image model menu (`button[role="menuitem"]` items). Models (config): **Nano Banana 2.1** (default), **Nano Banana Pro**, **Nano Banana 2 Lite**. Aliases: "Nano Banana", "Nano Banana 2", "NB2" → 2.1; "NB Pro" → Pro. |
| Video generation default model | `button[aria-label="Video generation default model"]` (`SEL.videoModelButton`) | Opens the video model menu (`button[role="menuitem"]` items). Models (config + `video-models.js`): **Omni 1.2 Flash** (default), **Omni 1.1 Flash**, **Veo 3.1 - Lite**, **Veo 3.1 - Fast**, **Veo 3.1 - Quality**. Retiring tiers render as two lines, e.g. "Veo 3.1 - Fast\nLeaving Dec 5" — the code strips the "Leaving <date>" line before matching. |
| Ratio radios | `button[role="radio"]` with text matching `(\d+:\d+)` | Image ratios: 16:9, 4:3, 1:1, 3:4, 9:16. Video ratios: 16:9, 9:16. The code assigns a radio to the image or video section by DOM position relative to the two model buttons (`compareDocumentPosition`). Only the radio with `aria-checked="true"` is read. |
| Count radios | `button[role="radio"]` with text `xN` | Quantity 1–4 (`resolveCount`: integer 1–4, else null). |
| Confirm before generating | `input[type="radio"][name^="mat-radio-group"]:checked` | Value `1` = "always", value `2` = "never" (mapped in `scrapeAgentSettings()`). The code warns when it reads `never`: "Flow agent is set to generate WITHOUT asking for confirmation". |
| Save | `button` with role button, name `Save`, exact | Persists the changed defaults. `applyAgentSettings()` clicks Save only when something changed, then re-reads the panel and throws if the wanted values did not persist. |
| Model menu items | `button[role="menuitem"]` | Model choices; matched by emoji-stripped label (`modelLabel()`). If the wanted model is not offered, the code throws `MODEL_NOT_AVAILABLE` listing the offered models. |

**Reading quirk:** cold page loads can briefly show default values before the saved ones arrive;
`scrapeStable()` reads the panel repeatedly (up to 6 × 600 ms) until two consecutive reads agree.

**No resolution, no duration control:** Agent settings expose NO resolution and NO duration control
(`video-models.js` header). Output is 720p; duration travels in the prompt text as
`"Video length: N seconds."` (appended by `generate-video.js`).

## A.5 Agent chat — messages, permission card, busy state

| Control / signal | Selector / label (code) | What it does / means |
|---|---|---|
| Agent message | `.messages-list .agent-row .agent-message-content` (`SEL.agentMessage`) | Latest agent reply text. `lastAgentReply()` strips the UI words "Show thinking", "arrow_forward_ios", "thumb_up", "thumb_down", "content_copy", "flag" from it. |
| Message row | `.messages-list .message-row` (`SEL.messageRow`) | Any chat row; counted to decide whether "Start new session" is needed. |
| Result thumbnails | `.messages-list img[alt^="Option"]` | "Option N" thumbnails in agent replies. Clicking one opens the media editor at `/edit/<uuid>` (`openAgentOption()`). |
| Agent busy | A visible `<button>` whose inner text is exactly `stop` (`agentBusy()`) | The agent is working. Note: Flow keeps its "stop" button visible while it waits for the permission card — checking `busy` first deadlocked generation (2026-11-12: card shown at +22 s, never answered, Flow cancelled it with "no credits were spent"). The code now answers a live permission card **before** the busy check. |
| Good / Bad response, Copy, Flag output | `button[aria-label="Good response"]` (`thumb_up`), `button[aria-label="Bad response"]` (`thumb_down`), `button[aria-label="Copy"]` (`content_copy`), `button[aria-label="Flag output"]` (`flag`) | Feedback controls on agent messages (discovered 2026-10-16; not driven by any tool — see §6). |
| Permission card | `<flow-permission-message>` block; choices are `div[role="radio"]` with `aria-label` **Approve** / **Always approve** / **Reject** — **not** `<button>` elements, so a button sweep finds nothing | Flow's spend-confirmation card, e.g. "Would you like me to kick off this 1 video generation, costing 7 credits?". Title in `.title`. An already-answered card is marked `frozen` (`read-only` class + `aria-disabled="true"`) and Flow's choice is `checked`. Chat history keeps answered cards around; the code picks the newest **unanswered** card (`agentPermissionOptions()`). |
| Permission card — click rule | `card.getByRole('radio', { name: label, exact: true })` | The MCP answers only with **Approve** (never "Always approve"). `pickConfirmLabel()` accepts labels matching `/\b(approve\|accept\|confirm\|generate\|continue\|proceed\|go ahead\|yes\|ok\|okay)\b/i` and refuses anything matching `/always|reject|cancel|^\s*no\b/i`. |
| Permission card — the "Always approve" trap | (same card) | **Flow pre-selects "Always approve" in this card, and that selection rewrites the account's "Confirm before generating" setting to `Never` (auto-spend). Never commit the card with a stray Enter — click the precise option you mean.** (`flow-ui.js` `clickPermissionOption()` comment; also the cloud assignment `approveRule()`.) |

## A.6 Add media / upload / ingredients

| Control | Selector / label (code) | What it does |
|---|---|---|
| Add media menu (header "+") | `button[aria-label="Add media menu"]` | Opens the menu: Upload / New collection / Create character / New scene. |
| Upload (menu item) | `button[role="menuitem"]:has-text("Upload")` | Opens the OS file chooser. The chooser's own accept filter (from `flow-ui.js`): images `.png,.jpg,.jpeg,.webp,.gif,.heif,.heic` + videos `.mp4,.m4v,.mov,.3gp,.avi`. Limits enforced by the MCP: images max **20 MB**, videos max **200 MB** (transcoded on Flow's side; video upload can take minutes). The stored name is content-hash prefixed (`<sha1-8>_<basename>`, max 100 chars), so the same file is never uploaded twice. |
| Upload rights attestation | Buttons with text **"I agree, do not show again"** / **"I agree"** (and a "Cancel" the code never clicks) | Video uploads raise a one-time rights dialog ("Rights to use this video ... Cancel / I agree, do not show again / I agree") and the upload stalls until answered. The account holder approved answering it permanently, so the code clicks the "do not show again" variant and never Cancel. The dialog can also appear mid-upload; the code re-checks it in the wait loop. |
| Add ingredients to the prompt box | `button[aria-label="Add ingredients to the prompt box"]` | Opens the ingredients picker: a list of `[role="option"]` assets (filled progressively — the code polls up to 16 × 500 ms for the asset name). If the asset is outside the picker's limited recent window, a search box finds it: `input[placeholder*="Search assets" i]` / `input[aria-label*="Search assets" i]` — fill with the base name without extension. Clicking an option attaches the asset. |
| Add to prompt (preview) | Button with exact text **"Add to prompt"** (`ADD_TO_PROMPT = /^\s*Add to prompt\s*$/i`) | Newer Flow builds show a preview of the picked asset with this button instead of attaching on first click (seen 2026-10-17). Older behaviour attached immediately; the code handles both and verifies a chip appeared. |
| Ingredient chip | `flow-ingredient-chip img[alt="Ingredient image"]`, `flow-image-ingredient-chip img[alt="Ingredient image"]` (legacy: `.agent-panel-prompt-box img[alt="Ingredient image"]`); video assets render `img[alt="Ingredient video"]` or a `<video>` inside the chip | Attached ingredients render as `flow-ingredient-chip.reference-ingredient-chip` → `flow-image-ingredient-chip` → `button.chip-container[aria-label="Ingredient"]` → `img.chip-image[alt="Ingredient image"]`. Counting chips is how attachment is verified. 2026-11-10 note: the prompt box is now inside `flow-creative-agent-prompt-box` (ProseMirror); the old `.agent-panel-prompt-box` chip scope matched nothing and every reference image reported "Could not attach" even though the chip was visibly attached. |
| Scene "Upload media" | (scene editor; accept filter video only) | The scene editor's upload accepts video only (from the `uploadAsset()` comment). |
| Max ingredients | — | `attachReferenceImages()` caps at **4** files per prompt. |

**Cloud-edition upload limitation:** the cloud browser cannot pick files off the MCP VM, so cloud
assignments say so explicitly ("LOCAL FILES — LIMITATION") and the agent must supply the file another
way or report the step blocked. In practice (2026-11-12, Acme) the working route in the cloud
browser is: route the granted file through the browser's file transfer onto the ingredients panel's
"Upload media" button — plain clicks on Flow's "Upload" / "Upload media" buttons **never** surface a
file picker there. Once uploaded, pick the file from the project's asset list as the ingredient.

## A.7 Media grid (project)

| Control / signal | Selector / label (code) | What it does / means |
|---|---|---|
| Tile | `flow-grid-tile-container` (`SEL.tile`), `role=group`, `aria-label=<name>` | One media item. Children: `flow-image-tile`, `flow-video-tile`, `flow-scene-tile`, etc. (`/^FLOW-.+-TILE$/`). Newest first (Flow's default sort). |
| Tile type | child tag name minus `FLOW-` / `-TILE` | e.g. `image`, `video`, `scene`. |
| Pending tile | Tile inner text matches `\b\d{1,3}\s*%` or `\bqueued\b` (case-insensitive), or an image tile with no `<img>` yet | "Queued" and a percentage are the only reliable in-progress signals; a video tile lazy-loads its `<video>` element, so its absence must **not** be read as "still rendering". |
| Tile "More options" | `button[aria-label="More options"]` (icon `more_vert`) inside a tile | Per-tile menu. Known items (from `create-scene.js`): **"Add to scene"** (`[role="menuitem"]:has-text("Add to scene")`, or a button with that text). The chooser then offers scenes (or "New scene"). Other menu items are not enumerated in code — see §6. |
| Tile "Favorite" | `button[aria-label="Favorite"]` (icon `favorite`) | Favourite a tile (discovered 2026-10-16; not driven by any tool — see §6). |
| Open tile | click the tile | Opens the media viewer/editor at `/edit/<uuid>` (image/video) or `/scene/<uuid>` (scene). `openTile()` waits for the URL to match `/\/(edit\|scene)\/[0-9a-f-]{36}/`. |
| Open agent result | `img[alt^="Option"]` in a message row | Opens `/edit/<uuid>` for that result. |

## A.8 Media viewer / editor (`/edit/<uuid>`)

| Control | Selector / label (code) | What it does |
|---|---|---|
| Download media | `button[aria-label="Download media"]`, `button[aria-label="Download scene"]` (`SEL.downloadMedia`); fallback `button[aria-label="Download"]` | Opens the Download menu. The image viewer keeps its download control in a hotbar that only appears on hover — the code hovers `img, video` first and waits 700 ms. Menu items (`button[role="menuitem"]`): **"1K Original size"** / **"2K Upscaled"** / **"4K Upscaled"** (from `selectors.map.json` "stable" → `mediaViewer`). The MCP picks the item matching the requested quality (`original` default; `1k`/`2k`/`4k`); if none matches it takes the first item. Upscales may cost credits (1080p/4K). An image opened in `/edit/<id>` can have a plain `Download` control that saves straight away with no quality menu — the "Download media" one only shows a tooltip there, so the code falls back to the direct control. Download is awaited via the Playwright `download` event (90 s timeout). |
| Move to trash | `button[aria-label="Move to trash"]` (`SEL.moveToTrash`) | Moves the open media to Trash. |
| Settings trigger (viewer) | `button[aria-label="Settings trigger"]` | Shows **"Generating will use N credits"** (from `selectors.map.json` "stable" → `mediaViewer`). This is where the credit cost of a generation is displayed in the UI. |
| Video edit prompt box | `[role="textbox"][aria-label^="Describe how to edit this video"]` (`SEL.videoEditBox`) | Prose edit prompt for Omni video-to-video edit. The editor history is read from `flow-editor-history-panel` (`SEL.editorHistoryPanel`) and steps counted via `flow-editor-history-step-video` (`SEL.editorHistoryStep`); a `%` in the panel text is the in-progress signal. |
| Save frame | Button **"Save frame"** in the editor (referenced in `save-frame.js` comment) | Saves one frame of a clip into the project. The MCP re-implements it locally (ffmpeg, free) and can upload the frame back. |
| Editor history | `flow-editor-history-panel`, `flow-editor-history-step-video` | Version stack of edits on the same clip ("Flow keeps versions stacked on the same clip"). |

## A.9 Characters

| Control | Selector / label (code) | What it does |
|---|---|---|
| Characters (sidebar) | Button with text `accessibility_new Characters` | Opens the Characters view (`/project/<uuid>/character`). If Flow jumps straight to the "New character" form, there are no characters yet. |
| Character description box | `[role="textbox"][aria-label="Describe your character…"]` (`SEL.characterPrompt`) | Description / image prompt for the new character. |
| Select model family | `button[aria-label="Select model family"]` (`SEL.characterModel`) | Model picker for character generation. Discovered 2026-10-16 showing `🍌 Nano Banana 2.1` with `arrow_drop_down`. |
| Upload (character form) | `button:has-text("Upload")` | Opens the file chooser; **instantly turns a photo into a character** (no generation). Only image types `.jpg/.jpeg/.png/.webp`, max 20 MB (MCP-enforced). |
| Start generation (character) | `button[aria-label="Start generation"]` (icon `arrow_forward`) | Sends the description; Flow opens `/character/<uuid>` when the character image is ready (MCP waits up to the generation timeout, polling for a large loaded `<img>` and no `%` text). |
| Character name | `input[aria-label="Character name"]` | Name field on the created-character page (waits up to 60 s for it). |
| Character personality | `textarea[aria-label="Character personality"]` | Character info: how the character acts. |
| Done | `button:has-text("Done")` | Finishes character creation. |
| Character archetype cards | Buttons with text **"The Eccentric"**, **"The Professional"**, **"The Wildcard"**, **"The Familiar"**, **"The Wicked"**, **"The Fantastical"** (discovered 2026-10-16 on the character page) | Preset character archetypes (not driven by any tool — see §6). |
| Format | `button[aria-label="Format"]` (icon `personal_recommendationsFormat`) | Format control on the character page (discovered 2026-10-16; purpose not recorded in code — see §6). |
| Add from project | Button with text **"addAdd from project"** | Add an asset from the project as a character ingredient (discovered 2026-10-16; not driven by any tool — see §6). |

## A.10 Scenes

| Control | Selector / label (code) | What it does |
|---|---|---|
| Scenes (sidebar) | Button with text `movie Scenes` | Shows the project's scenes (sidebar "Scenes" filter; `listTiles()` filtered to `type === 'scene'`). |
| New scene | `button[role="menuitem"]:has-text("New scene")` (in the Add media menu) | Creates an empty scene; Flow opens the scene editor at `/scene/<uuid>`. |
| Add clip | `button[aria-label="Add clip"]` | Scene editor entry point — the editor only accepts a prompt once a clip is selected, and the clip picker lists generated videos. |
| Scene title | `.editable-text-container input` / `input[aria-label="Editable text"]` | Rename the scene (commit with Enter). |
| Select a clip to edit | `[role="textbox"][aria-label="Select a clip to edit"]` | Clip picker prompt box inside the scene editor (from `selectors.map.json` "stable" → `scene`). |
| Toggle aspect ratio | `button[aria-label="Toggle aspect ratio"]` | Scene editor aspect-ratio toggle (from "stable" → `scene`). |
| Move to trash (scene) | `button[aria-label="Move to trash"]` | Scene editor trash control (from "stable" → `scene`). |
| Add to scene (tile menu) | `button[aria-label="More options"]` on a tile → menu item **"Add to scene"** | Adds a finished clip/image to a scene — free; only generating inside the scene spends credits. Flow scenes hold one timeline per project. |

**Scene limitation (code):** a scene is a timeline of video clips. The prompt and character names
cannot be placed inside a new empty scene; they are only recorded in local metadata. Undo: move the
scene to Trash in Flow.

## A.11 Tools gallery, tool pages, Tool Builder

Tools run in sandboxed blob iframes on `*.scf.usercontent.goog` (`getToolFrame()` returns the first
frame on that host with interactive elements). **Running a tool can spend credits, so nothing in the
MCP ever clicks a tool's own controls** (`create-tool.js` header).

| Control | Selector / label (code) | What it does |
|---|---|---|
| Tools page | `/project/<uuid>/tools` | Gallery. Heading (discovered 2026-10-16): H1 **"Build all the tools you can imagine."**; H2 sections **Image, Video, Prompting, Experimental**. |
| Tools tabs | `button[role="radio"]` with text **My Tools** / **Community** / **Templates** | Tab selector (selection is remembered). `selectTab()` clicks only if `aria-checked` is not already `true`, then waits 1800 ms. |
| Tool card | `.applet-card` (name in `.applet-name`) | One tool. Card text also carries author/description; the literal texts `more_vert` and `add` are filtered out when listing. The card **"Create New"** is filtered out of listings. |
| Create tool (gallery) | Button with text **"Create tool"** | Opens the create-tool page. |
| Open a tool | Click a card | Reuses the existing copy in "My Tools" (named "Remix of \<tool\>" or the tool name); otherwise clicking a Template/Community card **copies** it into the project. Opens `/tool/<uuid>`. |
| Tool page tabs | Buttons with text **"Tool"** / **"Edit"** (discovered 2026-10-16, gridArchitect page) | Run mode vs builder mode. |
| Done | Button with text **"Done"** | Finishes on the tool page (discovered 2026-10-16). |
| Favorite / Share / More options | `button[aria-label="Favorite"]`, `button[aria-label="Share"]` (icon `share`), `button[aria-label="More options"]` (`more_vert`) | Tool-page actions (discovered; not driven by any tool). |
| Apply to be featured | Button with text **"star Apply to be featured"** | Tool-page action (discovered; not driven). |
| Toggle tools | `button[aria-label="Toggle tools"]` (icon `keyboard_arrow_down`) | Tool-page control (discovered; not driven). |
| Edit icon | `button[aria-label="Edit icon"]` | Tool-page control (discovered; not driven). |
| Debug Menu (Mock Error) | `button[aria-label="Debug Menu (Mock Error)"]` (icon `bug_report`) | Tool-page debug control (discovered; not driven). |
| Close assistant | `button[aria-label="Close assistant"]` | Closes the tool assistant panel (discovered; not driven). |
| Create-tool prompt box | `.ProseMirror` on `/project/<id>/create-tool` (aria-label = the placeholder) | The Tool Builder prompt. Spec 20–8000 chars; ~250 words works best. The MCP validates the prompt and flags whether the *built tool* may spend credits when run (mentions of veo/omni/nano banana/gemini/generation vs "no credits, no generation"). |
| Start generation (builder) | `button[aria-label="Start generation"]` | Submits the tool spec. After submit the URL becomes `/project/<id>/tool/<uuid>?mode=EDIT` (builder + preview); there is no separate Save click (autosaved). |
| Stop (builder) | `button[aria-label="Stop"]` | Visible while the builder works; done when it is gone and "Send message" is back (~100 s for a 9-file React app). |
| Send message (builder) | `button[aria-label="Send message"]` (icon `arrow_forward`) | Sends a message to the applet agent. |
| Ask applet agent to make changes | `textarea[aria-label="Ask applet agent to make changes"]` + `button[aria-label="Send message"]` | Refine box: ask the tool's applet agent for ONE change. The code warns the agent often edits things you did not ask for — re-test afterwards and snapshot versions with Remix. |
| Tool name (builder header) | `input.editable-text-input` | Rename the tool after the build (commit with Enter). |
| Code tab | Button with text **"Code"** | Opens the code explorer: `flow-applet-code-explorer` lists the files (`button`, `[role="treeitem"]`, `li`). |
| Preview tab | Button with text **"Preview"** | Preview the built tool. |
| Tool SDK (for specs) | `Flow.media.select()` (gallery picker), `Flow.download({base64, mimeType, filename})` (exports) | The MCP tells the builder to use these in the spec. |
| Tool code scan | (static, in `scanToolCode()`) | Flags in generated tool code: `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `eval`, `new Function`, remote `<script>`, `postMessage`, `new Image().src` beacon, `localStorage`/`sessionStorage`/`document.cookie`, external URLs, `Flow.*` SDK calls. |

**Tool costs (code):** building a tool costs no credits ("Creating tools does not currently cost
credits", read live 2026-10-17) but there is an unpublished daily creation quota. Running a
generative tool can spend credits — test it yourself with fixture media and read its footer first.

### Grid Architect (a Template tool, mapped in code)

Inside the `*.scf.usercontent.goog` iframe:

| Control | Label (code) | What it does |
|---|---|---|
| START ARCHITECTING | Button with text **"START ARCHITECTING"** | The landing overlay swallows clicks until this is pressed. |
| ENGINE | Dropdown button **"ENGINE"** | Options: **Nano Banana 2**, **Nano Banana Pro**. |
| FORMAT RATIO | Dropdown button **"FORMAT RATIO"** | Options: 1:1, 16:9, 9:16, 4:3, 3:4. |
| VISUAL LOGIC | Dropdown button **"VISUAL LOGIC"** | Options: **Style from References**, **Ultra Realistic**, **Cinematic Movie**, **Film Noir**, **Anime / Manga**, + Custom Style. |
| UNIFIED THEME | Button **"UNIFIED THEME"** | Mode: one theme textarea (the MCP fills the first `textarea` in the frame). |
| SEQUENCE | Button **"SEQUENCE"** | Mode: up to 4 shots; each has a shot-size select, an angle select, and a `textarea[placeholder="Shot details..."]`. |
| PROMPT WIZARD | (from `selectors.map.json` "stable" → `gridArchitect`) | Mode: textarea with placeholder "Paste script..." + BREAKDOWN. Not driven by the MCP (only UNIFIED THEME / SEQUENCE are). |
| GENERATE | Button **"GENERATE"** | **Never pressed by the MCP** — it spends credits; press it in the open Flow tab. |
| References | `input[type="file"]` in the frame (if exposed) | Upload reference images; if no file input is exposed the MCP reports that references were not uploaded. |

## A.12 Trash

Route `/project/<uuid>/trash`. Sidebar item **Trash**. Media is moved there via
`button[aria-label="Move to trash"]` (viewer and scene editor). No other trash controls are
enumerated in code (restore/empty/delete-forever are not mapped — see §6).

## A.13 Models, ratios, counts, durations, credits (from `video-models.js` + config)

Verified live in the Flow UI 2026-11-09 (model menu, agent settings, clip tile metadata) and against
Google's published credit table (support.google.com/flow/answer/16526234). Clip tiles print
`model • resolution • duration`, e.g. `Omni 1.2 Flash • 720p • 12s`.

| Model | Durations | Retires | Edit | Extend | Ingredients | Cost (720p) |
|---|---|---|---|---|---|---|
| Omni 1.2 Flash (default) | 3–15 s, whole seconds | — | yes | yes | yes | 3 cr/s up to 10 s, then 6 cr/s extra (4 s = 12, 10 s = 30, 15 s = 60); 360p 1 cr/s up to 10 s then 2 cr/s |
| Omni 1.1 Flash | fixed 4 / 6 / 8 / 10 s | **2026-12-05** | yes | no | yes | per clip: 4 s = 7, 6 s = 10, 8 s = 12, 10 s = 15 |
| Veo 3.1 - Lite | fixed 4 / 6 / 8 s | — | no | no | yes | flat 10 per clip |
| Veo 3.1 - Fast | fixed 4 / 6 / 8 s | **2026-12-05** | no | no | yes | flat 20 per clip |
| Veo 3.1 - Quality | 8 s only | **2026-12-05** | no | no | no | flat ~100 per clip (refused unless `allow_expensive=true`) |
| Nano Banana 2.1 (image default) | — | — | — | — | yes | (image models; costs not tabulated in the video registry) |
| Nano Banana Pro | — | — | — | — | yes | — |
| Nano Banana 2 Lite | — | — | — | — | yes | — |

Shortcuts in code: `flash`/`omni`/`simple`/`cheap`/`default` → Omni 1.2 Flash; `legacy`/`omni-1.1` →
Omni 1.1 Flash; `lite`/`test` → Veo 3.1 - Lite; `fast`/`speed` → Veo 3.1 - Fast;
`quality`/`premium` → Veo 3.1 - Quality. Aliases: "Gemini Omni Flash" → 1.2, "Gemini Omni Flash 1.1" → 1.1,
"Omni Flash" → 1.2, "Omni Legacy" → 1.1, "Veo Lite" → Lite, "Veo Fast" → Fast.

Ratios: image 16:9, 4:3, 1:1, 3:4, 9:16; video 16:9, 9:16. Quantity: 1–4.
**Extend:** Flow's own Extend (Omni Extend, subscribers, +3–10 s at a time) exists in the UI but has
no MCP tool; Omni 1.2 already generates 3–15 s natively, so the MCP joins longer pieces locally
(`flow_stitch_videos`, ffmpeg, free).

## A.14 Flows the code automates (Google Flow)

1. **Sign-in / verify (cloud).** Open `https://flow.google.com/?pli=1` (or the default project if
   the marketing page shows). Check the account chip (top-right avatar) shows `you@example.com`;
   read the credit balance chip ("N Google Flow credits"). If a Google sign-in page appears, STOP,
   report `login_required`. (Local edition: `flow_connect` launches its own Chrome via Playwright CDP
   9334 with profile `browser-profiles/google-flow-muse`; see §A.16 for why that path is dead on
   this VM.)
2. **Open / create a project.** Reuse the open project, or a stored project matching the campaign
   (`config/flow.projects.json`), else click "New project" on home and rename via the title input.
   `ensureProjectInContext()` implements this order.
3. **Read Agent settings.** Click the tune button, read model/ratio/count per section + Confirm
   before generating; wait for two stable reads; close with Back.
4. **Apply Agent settings.** Same panel; click the model button → menu item with the exact model
   name; click ratio/count radios; click Save; re-read and verify the values persisted.
5. **Generate an image (agent mode).** Fresh session → apply/read settings → attach up to 4
   reference assets (upload + picker) → type prompt (max 4000 chars; prompts asking for video are
   refused) → (auto_confirm=false: stop, report `ready_for_confirmation`) → click Start generation
   → answer the permission card with Approve → wait for new image tiles (no `%`) → open each result
   (tile or "Option N" thumbnail) → Download menu → quality.
6. **Generate a video (agent mode).** Same as (5), plus: duration is appended to the prompt as
   "Video length: N seconds."; the wait loop answers a live permission card **before** the busy
   check (see A.5); completion = new video tiles finished (no `%`, no "Queued"); then open each
   tile → Download (original quality) → restore the previous Agent settings.
7. **Direct generation (fallback, NOT in the MCP).** When the agent fails with "Something went
   wrong" (free), the Acme builds used direct generation instead: Agent mode off, set model /
   ratio / duration in the generation settings popover (the 12-credit cost shows there), generate
   directly. No permission card appears. See §A.15.
8. **Edit a video (Omni video-to-video).** Resolve the source (upload a local clip first — rights
   dialog "I agree, do not show again" — or open `/edit/<media-id>`, or take the newest finished
   video tile) → type the edit prompt into `[role="textbox"][aria-label^="Describe how to edit
   this video"]` → (staged: stop) → Start generation → permission card Approve → wait until the
   editor history gains a new `flow-editor-history-step-video` and no `%` remains → download the
   new version. Edits chain conversationally on the same clip (each turn billed like a generation:
   Omni 1.2, 3 cr/s at 720p).
9. **Upload an asset + attach as ingredient.** Header "+" → Upload → file chooser (accept filter
   above) → wait for the tile to appear and stop being pending (video transcode can take minutes;
   images seconds) → "Add ingredients to the prompt box" → find the asset in `[role="option"]`
   (or the "Search assets" box) → click → if a preview appears, click "Add to prompt" → verify an
   ingredient chip is present. (Cloud limitation + the working file-transfer route: see A.6.)
10. **Download the newest media.** Open the newest finished tile (or stay in an open viewer) →
    hover the image/video to reveal the toolbar → Download media / Download → quality menu
    (original / 1K / 2K / 4K) → save via the download event. Video originals come as 720p mp4.
11. **Create a character.** Open `/character` → type the description into "Describe your
    character…" → optionally pick the model family → (staged: stop) → Start generation → wait for
    `/character/<uuid>` and a loaded image → fill "Character name" / "Character personality" →
    click "Done". From a photo: click "Upload" on the form (photo becomes the character directly,
    no generation; description saved as character info).
12. **Create a scene.** Open project → header "+" → "New scene" → wait for `/scene/<uuid>` and
    the "Add clip" button → rename via the title input. Prompt/characters are local-only.
13. **Add a clip to a scene.** Project → sidebar "All media" → find the tile (by name or newest
    index) → hover → "More options" → "Add to scene" → pick the scene in the chooser (or "New
    scene"). Free.
14. **Open the Tools gallery / use a tool.** Open `/tools` → pick a tab (My Tools / Community /
    Templates) → click a card (Template/Community copies into the project as "Remix of \<name\>")
    → wait for the `*.scf.usercontent.goog` iframe → fill inputs by label/placeholder/aria-label
    → **never** click a button matching `/generate|create|render|run|start|submit|export|apply|
    upscale/i` (running a tool can spend credits).
15. **Configure Grid Architect.** Open the tool → wait for its iframe → click "START
    ARCHITECTING" → ENGINE / FORMAT RATIO / VISUAL LOGIC dropdowns → "UNIFIED THEME" textarea, or
    "SEQUENCE" with up to 4 `textarea[placeholder="Shot details..."]` → never press GENERATE.
16. **Build a tool.** Open `/create-tool` → type the spec into the ProseMirror box → Start
    generation → wait for `/tool/<uuid>?mode=EDIT` → wait for the "Stop" button to disappear
    (~1–2 min) → optionally rename via `input.editable-text-input` → read the Code tab
    (`flow-applet-code-explorer`) and scan for network/dynamic-code/external-URL/Flow-SDK risks.
    Never run the tool here.
17. **Refine / inspect a tool.** Open the tool in `?mode=EDIT` → refine: fill
    `textarea[aria-label="Ask applet agent to make changes"]` → "Send message" → wait for the
    builder to finish. Inspect: Code tab → read every file → static scan (read-only).
18. **Save a frame.** (Local, free, ffmpeg) Extract a frame (first/middle/last/timestamp) →
    optionally upload it to the project (header "+" → Upload) and attach it to the prompt as an
    ingredient, so it can seed the next generation or the first frame of a different scene.
19. **Discover the UI.** `flow_discover_ui` opens a page (main / project / image-generation /
    video-generation / characters / scenes / tools-gallery / grid-architect) and records visible
    buttons (text), inputs (placeholder / aria-label / name), headings, model names, ratio texts
    into `config/selectors.map.json`.
20. **Read the balance.** Open the project root (the project root always shows the account chip;
    tool/scene/media-viewer pages hide it) → click the account chip → read `span.credits-count`
    ("N Google Flow credits"). In Flow Music the authoritative balance is on `/settings` ("N
    available"); the Settings-menu item is cached and lags 1–3 generations.

## A.15 Quirks and failure modes (Google Flow, from code + Acme practice)

- **Agent "Something went wrong".** The Flow agent fails often with this message (free, no credits).
  Observed: 5× on one clip attempt (Same Major Clip B attempt 4), 2× each on two other clips,
  1× on every Overthinking clip. **Fallback: direct video generation (Agent mode off)** — no
  permission card, the cost shows in the settings popover. Every Overthinking clip used it after
  one free agent failure.
- **Agent stuck on "Thinking…"** (DIMO-SETUP.md, 2026-11-12): agent mode stuck ~5 min, stopped,
  no generation started, no credits spent. A separate direct-generation attempt then showed a grey
  placeholder ~5–6 min, the editor went blank after reload, the project showed empty, and the 12
  credits were never deducted.
- **Permission card pre-selects "Always approve".** Committing it (e.g. with a stray Enter) rewrites
  "Confirm before generating" to Never. Always click the precise "Approve" radio.
- **"Confirm before generating" = Never.** If the panel reads `never`, the agent generates without
  asking — the spend guard is gone for the whole account.
- **Plain clicks on Upload never surface a file picker** (cloud browser, Acme 2026-11-12). Working
  route: route the granted file through the browser's file transfer onto the ingredients panel's
  "Upload media" button; then pick the file from the project's asset list.
- **The "Your video has been downloaded!" toast alone is not proof of a download** — confirm the file
  actually arrived (Acme practice).
- **Browser preview-frame notes can be wrong.** Repeatedly proven: the MU Clip B "reversed turn" note
  was wrong; the OT Clip B "turn may not complete" warning was wrong; the OT Clip C "smile not
  visible" note was wrong; the navy women's lifestyle photo was misdescribed (bun/pink shirt vs
  loose blonde hair, dark sleeveless top, jeans). Verify the mockup and clips yourself.
- **Character names/ages in a prompt get baked in as on-screen labels.** MU Clip A attempt 1 failed
  QC because Flow rendered "CHLOE 22 YEAS" / "ETHAN ET. BE" name labels. Standing lesson: never put
  character names or ages in a Flow prompt — describe by appearance only.
- **Flow cannot spell "ACME." as small chest text** (failures: "E*SILON.", "EI'SILON."). Generate
  the garment plain and add the brand mark locally. (Acme logo rule.)
- **Back-print scale drifts large.** Flow's floor across attempts was ~0.42–0.50 of back width vs the
  real 0.32 (Biology). Passing recipe: frame-relative size wording ("the text line only about 15 to
  20 percent of the frame width" / "one quarter of the back width") + wide full-body framing + static
  camera + on-model mockup ingredient. Measure before accepting.
- **Agent settings panel is flaky on cold load.** Default values can flash before saved ones arrive;
  the code reads until two reads agree. A `.cdk-overlay-backdrop-showing` layer can swallow the next
  click after escaping a menu. The AI session panel can dock over the header tools container and
  cover the "+" (Add media) button — `ensureAddMediaVisible()` presses Escape / clicks Close up to
  3 times before giving up.
- **Ingredients picker is a limited recent window.** Once a project has many assets, the wanted one
  may be outside it; use the "Search assets" box.
- **Prompt-box container changed 2026-11-10.** Old `.agent-panel-prompt-box` chip scope matched
  nothing; the current container is `flow-creative-agent-prompt-box` (ProseMirror). Selectors tied to
  the old container silently fail.
- **Retiring models render two-line labels.** "Veo 3.1 - Fast\nLeaving Dec 5" etc. — match on the
  first line only.
- **Credit deductions can lag / not show.** 2026-11-13: live balance read 762 after the MU Reel
  (870 − 108 = 762 exact), but the 4 Overthinking clips (28 cr) did not appear deducted yet. Same
  pattern in Flow Music (generations showed no deduction). Plan on the inferred lower number until
  the deduction shows.
- **Local MCP sign-in is blocked by Google device trust** (see A.16). The local Chrome profile is
  signed out; passkey and phone recovery were rejected ("Couldn't sign you in — You're trying to
  sign in on a device Google doesn't recognize"). Do not hammer retries.
- **Local MCP Chrome could not reach the internet at first** (DIMO-SETUP.md): the VM egress proxy
  returns 403 for Chrome's parallel CONNECT tunnels. Fix: local serializing forward proxy
  `scripts/local-proxy.mjs` on 127.0.0.1:18080, Chrome launched via it plus
  `--ignore-certificate-errors` and `--disable-background-networking`. `flow_connect` also had
  headless hardcoded false (headful Chrome with no DISPLAY exited instantly) — now defaults to
  config. `headless: true` in config.

## A.16 The two MCP editions (architecture, from CLOUD-SETUP.md / DIMO-SETUP.md)

- **Local edition** (`google-flow-browser-mcp/`): drives Flow by launching its own local Chrome via
  Playwright CDP (port 9334), profile `browser-profiles/google-flow-muse`, patched for a single
  account (`you@example.com`), local serializing proxy on 127.0.0.1:18080. Its profile is
  **signed out** and Google blocks its sign-in (device/location trust). 36 tools. `npm test`: 82/84
  pass before the patch, 68/84 after — the 14 failures are 3-account rotation tests, failing by
  design under single-account config.
- **Cloud edition** (`google-flow-browser-mcp-cloud/`): the one to use. The cloud browser exposes no
  CDP endpoint, so the MCP plans and queues work (`state/cloud-queue/<taskId>.json`:
  `{id, tool, args, status, created_at, needs_approval, spend_estimate_credits, assignment, result}`),
  the agent executes it in the already-signed-in cloud browser
  (`browser-task:00000000-0000-0000-0000-000000000000`) via `browser.browse`, and records the result
  back via `flow_cloud_complete`. 38 tools (36 original + `flow_cloud_complete` + `flow_cloud_result`).
  Helper: `node scripts/mcp-call.mjs <tool> [args-json]` from that folder. Smoke test: 39 passed,
  0 failed. Live end-to-end test passed 2026-11-12 (verified signed in as Your Name, you@example.com,
  PRO, 1,050 credits, reset Nov 29 4:47 AM); no credits spent.
- **Spend rules (both editions):** `auto_confirm=false` never spends (PREPARE only: type the prompt,
  report the settings, do not click Start generation). Credit-spending tasks are flagged
  `needs_approval` and must not run without approval. Never click "Always approve". Cost reference:
  Omni 1.2 Flash 4 s = 12 cr (720p); Veo 3.1 - Lite 4 s = 10; Veo 3.1 - Quality 4 s ≈ 100
  (refused unless `allow_expensive=true`); Flow Music ≈ 5 cr per compose take, 10 per chat take.
- **Cloud limitations (from CLOUD-SETUP.md):** local file uploads / reference images cannot be
  picked from the VM disk by the cloud browser; downloads land in the cloud browser's download
  folder, not on the VM (`flow_download_latest` reports media id/URL, not a local path); no live
  page reads (`flow_status`, `flow_discover_ui`, `flow_screenshot` ask the agent to observe and
  report); balance is last-read, not live. `flow_save_frame` is split: ffmpeg extraction runs
  locally (free), only the upload half is queued.
- **Identity:** no live page to read, so identity is the last verified record in
  `state/cloud-connection.json`. Assignments start with "STEP 0 — VERIFY FIRST: check the account
  chip shows you@example.com" while unverified; once verified, later assignments drop the
  preamble. If the recorded account is a *different* account than expected, the gate throws
  `WRONG_GOOGLE_ACCOUNT`.

---

# PART B — Flow Music (flowmusic.app, Lyria 3.5)

Separate app from Google Flow: its own tab, its own credits, its own library. Mapped live
2026-10-17 (`docs/research/flow-music-ui-map.md`, account first@example.com, plan PLUS) and
in `src/tools/flow-music.js`. The cloud assignments open it in a **new tab — never the Flow tab**.

## B.1 Routes (seen live)

`/`, `/session`, `/session/<uuid>`, `/session/<uuid>?t=true`, `/song/<uuid>`, `/library/my-songs`,
`/library/favorites`, `/library/playlists`, `/library/favorite-playlists`, `/library/spaces`,
`/library/plugins`, `/library/favorite-spaces`, `/library/videos`, `/library/favorite-videos`,
`/projects`, `/turntable`, `/settings`, `/pricing`, `/<username>`, `/privacy`, `/privacynotice`,
`/terms` (redirects to policies.google.com/terms), `/docs` (redirects to
support.google.com/flow/answer/17083868), `/oss/attributions.txt`, `/docs/faq/availability`.

## B.2 Global shell

| Control | Selector / label (code) | What it does |
|---|---|---|
| Logo / Home | `a[href="/"]` | Home feed (Explore: Songs/Playlists/Videos/Spaces, Featured, Grid/List toggle, starter cards). |
| Search | `button[aria-label="Search"]` → `input[placeholder="Find songs, playlists, and people"]` | Search songs, playlists, people. (Result layout not captured — see §6.) |
| Close sidebar | `button[aria-label="Close sidebar"]` | Collapses the sidebar. |
| New session | `a[href="/session"]`; also `button[aria-label="New session"]` (sidebar marker the driver waits for) | Fresh Producer chat + compose panel. |
| Songs | `a[href="/library/my-songs"]` | Library list; tabs "Library" / "Favorites" (`/library/favorites`). |
| Playlists | `a[href="/library/playlists"]`, `/library/favorite-playlists`; expand: `button[aria-label="Expand Playlists"]` | "New playlist" dialog: Generate from prompt / Upload image / Name / Description (0/500) / Create. |
| Spaces | `a[href="/library/spaces"]`, `/library/plugins`, `/library/favorite-spaces` | "New space" starts a Producer session ("Let's create a space together") at `/session/<id>?t=true`; a vibe-coding tool for custom instruments/music apps. Costs 0 credits to open. |
| Music videos | `a[href="/library/videos"]` | "New music video" dialog: videos up to 2 min, pick song, subject image + style image; "Credits are required ... can be expensive". |
| Projects | `a[href="/projects"]`; `Expand Projects` | "New project" dialog: image, Prompt, Name, Description (0/250), Create. |
| Profile | `a[href="/<username>"]` (e.g. `/tonalflourish`) | Plays/likes/followers; tabs Songs/Playlists/Music Videos/Spaces; only published songs listed. |
| Turntable | `a[href="/turntable"]` | A/B preference voting game: "Vote for the sample that better matches the prompt. Rating boosts your personalization, improves our models, and earns you credits." Needs 10 s listening per side; intro dialog "Let's go". Not needed for production. |
| Session list | Sidebar links `a[href^="/session/"]` | Titles like "Today at 11:35 PM" or first prompt. |
| Settings menu | `button[aria-label="Settings menu"]` (text "\<user\> / PLUS") | Items: Theme, Account settings (`/settings`), Customize Producer, **"N credits"** (`a[href="/settings"]`), Invite friends, Submit to Featured, Updates, Try Google Flow, Discord, Pricing, Learn more (Docs, Help, Discord, X, Instagram, Manage cookies, Report legal issue, Privacy policy, Terms of service, Privacy notice, Attributions), Log out. **Never click Invite friends / Log out / Pricing.** |
| Plan badge | Text "PLUS" in the Settings button | Plan indicator. |
| Diamond badge | Sidebar `button` with a diamond icon and a number (1, 2, 3), next to "Invite" | **NOT the credit balance.** The number rose 1 → 3 as songs were made; looks like a progress/points counter linking `/personalize`. (Unverified.) |
| Invite | Sidebar button "Invite" | Do not click. |
| Credit balance | Settings menu item "N credits"; `/settings` shows "N available" | The menu value is cached and lagged 1–3 generations behind in tests; **`/settings` is authoritative**. `getCredits(page, {fresh:true})` reads `/settings` and navigates back. |
| Player bar (bottom) | `Play previous track`, `Play <title>`, `Play next track`, `Enable shuffle`, `Enable repeat`, `Open player queue`, `Adjust volume`, `Full screen` | Playback. Queue panel says "Queue is empty" until songs are queued. |
| Cookie banner | Buttons **"No thanks"** / **"Agree"** | Google's cookie-consent banner; it intercepts clicks if covering the app. `dismissCookieBanner()` clicks the first matching button. |
| Google One consent banner | Dark top banner: "Grant access to your Google One subscription to use your benefits. [Grant access]" (also `Agree | No thanks | Grant access` buttons on `/settings`) | Appeared late in the 2026-10-17 session. Plan badge still said PLUS and credits kept working, but it was **NOT clicked** (rule: no consent prompts). The user should decide whether to grant it. |

## B.3 Producer chat (session page)

| Control | Selector / label (code) | What it does |
|---|---|---|
| Message box | `textarea[aria-label="Chat message"]` (placeholder "Ask Producer..." in a session, "Let's create..." on home) | Producer chat input. |
| Send message | `button[aria-label="Send message"]` (disabled while empty) | Sends the chat prompt. While Producer works the send button becomes a square stop button (no aria-label). |
| Add audio or image | `button[aria-label="Add audio or image"]` | Menu: **Live > Recording** ("Record audio into session"), **Upload > Audio** ("Use your music to create (max 40mb)"), **Upload > Image** ("Use image to inspire lyrics or cover art"). Hidden `input[type=file]`: audio accepts `audio/*` plus .mp3 .wav .m4a .aac .flac .ogg .opus .aiff .mp4 .mov .webm and ~40 more, single file; image `image/*`, single file. |
| Chat settings | `button[aria-label="Chat settings"]` | Menu: Customize Producer ("Progress, memories, and more"), Instrument ("Frontier music models": Lyria 3.5), Ghostwriter ("World class lyric writing": Standard), Producer ("Standard or fast thinking": Standard). |
| Voice mode | `button[aria-label="Voice mode"]` | Opens a voice conversation; not exercised (unverified). |
| Thoughts | Text **"Thoughts"** (click) | Expands the Producer's tool log: `Created "<title>"`, `Applied audio effects`, `Saved lyrics`, the exact Sound/Lyrics sent, `Seed: 759816`. |
| Header icons | `Toggle compose panel`, `Toggle session songs`, `Share session` | Share session dialog: "Anyone with this link can see your username, messages, and any songs not set to Private" + Share link. **Do not click Share link.** |
| Suggestion chips | Plain text buttons under Producer replies, e.g. "Add a heavy bassline", "Export this track now", "Extend the outro out", "Isolate the vocals", "Remix the beat", "Add dreamy synths" | Send that sentence to Producer; contextual, not a fixed set. |

**Producer chat edits (live):** "Trim the latest 1:00 instrumental ... to exactly the first 0:16 seconds"
→ "Trimmed the track to the first 16 seconds", new song "\<title\> (0:00-0:16)", sub-label "Audio
effects", 0 credits, 34 s total including the model round trip. Documented prompts: "Shorten the
intro to 4 bars", "Add a bridge before the final chorus". **Producer prompts that generate music
cost 10 credits per prompt (2 takes)** (live, from the Usage ledger: −10).

## B.4 Compose panel (right column)

Open with `button[aria-label="Toggle compose panel"]`. On a fresh `/session` the panel is closed; it
is open when `textarea[aria-label="Sound description"]` is visible. On the home page "Open compose
panel" is covered by an overlay (click intercepted): **always use a session page**.

| Section | Control | Selector | Notes |
|---|---|---|---|
| Lyrics | Lyrics textarea | `textarea[aria-label="Lyrics"]` | When Instrumental is on it shows the placeholder "Instrumental". Supports tags like `[Instrumental]`, `[End - 1:00]`. |
| Lyrics | Instrumental switch | `button[role=switch][aria-label="Toggle instrumental mode"]` | `aria-checked` true/false. |
| Sound | Sound description | `textarea[aria-label="Sound description"]` (maxlength 3000) | Free-text style prompt. |
| Sound | Advanced switch | `button[role=switch][aria-label="Toggle advanced sound mode"]` | Reveals "Dynamics". |
| Dynamics | BPM | `label:text-is("BPM") ~ input` (maxlength 3, placeholder "Auto") | Accepts 20, 120, 400; rejects letters. Appended as `, <n> bpm` to Sound. |
| Dynamics | Length | `label:text-is("Length") ~ input` (placeholder "Auto") | m:ss. Normalises on blur: "30" → 3:00 (seconds are NOT supported as plain numbers: "90"→3:00, "45"→3:00, "2"→2:00 minutes), "0:30"/"0:45"/"0:59" → 1:00, "3:01" → 3:00, "1:30" stays, "1:01" stays. Appended as `[End - m:ss]` to Lyrics. **Clamps to 1:00–3:00.** |
| Dynamics | Seed | `label:text-is("Seed") ~ div input` (placeholder "Auto") + a dice button | Fixed seed (Producer logs "Seed: 759816"). |
| Dynamics | Model | Button with text **"Lyria 3.5"** (`aria-haspopup=menu`) | Items: **Lyria 3.5** "Top performing, flagship model", **Lyria 3 Pro** "Legacy model". |
| Details | Title | `textarea` under "Details" (`button[aria-label="Expand Details section"]`) | Song title; also "Upload image" and "Prompt image" (cover art). |
| Footer | Generate | `button:has-text("Generate")`; Ctrl+Enter shortcut (tooltip "Generate CtrlEnter") | Trash icon button on the left clears the form. |

**Does NOT exist (live):** key / scale field, time signature, vocal gender, exclude/negative styles,
weirdness or creativity sliders, structure editor, "make loop" mode. Key and structure can only be
prose in the Sound prompt (hint only).

## B.5 Generating and detecting completion

- **Compose panel Generate:** 1 song, **5 credits**, 20–38 s. A row titled "Untitled" appears
  immediately with "Generating Untitled..." and a leaf text node `NN%` that climbs ~4% per second;
  the URL changes `/session` → `/session/<uuid>`; when the percentage node disappears the row shows
  the real link `a[href^="/song/<uuid>"]` and the title (compose generations keep the title
  "Untitled" unless Details > title is set). Completion detection: new `/song/` id **and** no `NN%`
  node for 3 s (3 consecutive polls).
- **Producer chat prompt:** 2 takes "\<title\>" and "\<title\> (Take 2)", **10 credits**, Producer
  messages stream in.
- Credits post a few seconds after the song appears (a fresh balance read right at completion was
  stale by 5).
- Errors: no error banner was ever triggered, so no verified selector. Candidates
  `[data-sonner-toast]`, `[role=alert]` are collected by the driver on timeout. (Unverified.)
- Concurrency limit is 12 on PLUS (documented, /pricing). Never tested.

## B.6 Song rows and the "..." menu

Row selectors (session or library, live): container = nearest ancestor of `a[href="/song/<id>"]`
that holds `button[aria-label^="More options"]`; per-song buttons (appear on hover in a session):
`button[aria-label="Play <title>"]`, `Like <title>`, `Dislike <title>`, `Remix <title>` (opens the
Remix menu), `Download video for <title>`, `Share link for <title>`, `More options for <title>`,
`div[aria-label="Open details for <title>"]`.

The "..." menu is `[role=menu]` with items `[role=menuitem]`. Open a submenu by hovering the parent
item, then waiting ~600 ms; `Escape` twice closes everything.

| Menu item | Submenu / action | Verified |
|---|---|---|
| Remix | **Start session** (opens `/session/<uuid>?t=true` with the song's Lyrics/Sound loaded into the compose panel, no charge), **Cover**, **Replace**, **Extend** (each opens an edit panel, see B.7, nothing is generated until Generate), **Use prompt** (loads the song's prompt into the compose panel, no charge), **Variation** (**generates immediately, 5 credits, no dialog**: made "\<title\> (Remix)", 62.9 s, 123.8 BPM), **Trim** | live |
| Details | Privacy (Link only), Edit details (name, cover art, displayed lyrics [documented]), Go to session, Pin to profile | live |
| Download | **Download video**, **Get stems**, separator, **M4A**, **MP3**, **WAV** | live |
| Share... | Copy link, Share song via... | live, never clicked |
| Add to... | Playlist, Queue | live |
| Split stems | Direct action, see B.8 | live |
| Report | Send app feedback, Report legal issue | do not click |
| Delete | Direct action on the song (library bulk Delete asks "Delete N tracks? This action cannot be undone") | used only on own songs |

## B.7 Edit panels (Remix > Cover / Replace / Extend) and the Trim dialog

Edit-panel layout (live): song name, timer `0:00 / 1:02`, `button[aria-label="Close edit mode"]`,
mode dropdown (COVER / REPLACE / EXTEND, switches mode), mini waveform with a draggable region,
play button, `button` **"SETTINGS"** (popover), Instruction textarea
(`textarea[aria-label="Instruction"]` for Extend/Cover), "Edit Lyrics", collapsible "Source Lyrics",
"Advanced" (only Seed), "Details", Generate.

- **Extend** (live UI, generation not run): the SETTINGS popover has "Extend from / Start time for
  the extension" and "Extend until / End time"; default region on a 1:02 clip was 0:32.5 to 1:32.5,
  label "Extend 0:32-1:32" (so a 60 s extension from the middle). Setting from = clip end and until
  = from + 16 s could append a short segment, but whether the result is only the new segment or the
  whole clip is **unverified** (no generation budget left).
- **Replace** (live UI): region default 0:16.3–0:46.3 "Replace 0:16-0:46",
  `button[aria-label="Add region"]`, textarea "Describe the changes for all regions...".
  Regenerates only the region. (Outcome unverified.)
- **Cover** (live UI): Instruction "Instruction for how to change the sound or lyrics",
  **Strength** slider "How much to modify the song" (More Similar ↔ More Different).
  (Outcome unverified.)
- Documented behaviour: Cover transforms the style keeping structure; Replace/Extend edit a
  highlighted section; upload of your own audio (beats/instrumentals) can be remixed with these
  (documented, Updates dialog 2026-07-16).

**Trim dialog** (`Remix > Trim`): `[role=dialog]` "Trim Song - A new version will be saved to your
library": play button, title, `Copy playhead timestamp` / `Copy duration timestamp` buttons,
**inputs[0] = Start**, **inputs[1] = End** (format m:ss or m:ss.t), a **Loop** switch (preview loop),
waveform with two handles, **Cancel** / **Trim**, `Close dialog`. Pitfalls (live): (1) the dialog
resets Start/End to the full range when the waveform finishes loading, so wait until End shows the
real duration plus ~1 s before typing; (2) set **End first then Start** (an End below the current
Start produced a corrupt "-1:-1" Start in one probe); (3) Tab or Enter commits a field. Trim
completes in ~1 s and the new song (`<title> (trim <start>-<end>)`, sub-label "Audio effects")
appears in the session and library. **0 credits.** Tenths are honoured (0:00.4–0:16.4 → 16.000 s
measured, 48 kHz).

## B.8 Split stems

"..." > **Split stems** (not a submenu) posts the Producer message `Split the stems for "<title>"
(clip id: <uuid>)`, shows "Splitting stems..." and, after ~13 s (33 s end to end including download
in the module test), a stems card: rows **Drums, Bass, Other, Vocals** (each with M, S buttons and
`button[aria-label="Options for <stem> track"]` menu: Details, Download stem, Share..., Add to...,
Report, Delete), waveform, Play, and a download icon whose **title** (not aria-label) is
`Download tracks (zip)`: `[title="Download tracks (zip)"]`. The zip holds 4 files
`<title>_drums.m4a`, `_bass.m4a`, `_other.m4a`, `_vocals.m4a`, AAC 48 kHz stereo, same duration as
the song (16.000 s for a 16 s song, ~2.4 s download). Each stem also becomes a library entry
"\<title\> - drums" with label "Stem" (appears in Songs; clean up after use). Cost: balance
unchanged after both splits (10505 → 10505 and 10480 → 10480) (live); the Usage ledger names one
"Stem Separation -5" entry but total spend matched 5 per generation exactly, so treat stems as
**0–5 credits** (unverified split).

## B.9 Song page `/song/<uuid>`

Cover art, author link, relative time, plays/likes counters, title (editable textbox for the owner),
Play, Like, Dislike, Remix (`button[aria-label="Remix"]`), Share (`button[aria-label="Share"]`), a
"..." button without aria-label, **Publish** (top right, **never click**), then SOUND (the exact
prompt incl. appended `, 120 bpm`), Lyrics (e.g. `[Instrumental]` and `[End - 1:00]`). There is **no
BPM / key / length / model readout on the page**; the length is only in the player bar
(`0:00 ... 1:03`). The Details submenu does not show BPM/key either.

## B.10 Library pages

- **Songs** `/library/my-songs`: rows with art, title, sub-line (prompt text, or "Audio effects"
  for trims, "Stem" for stems), duration at right, Like, Dislike, "..." and a checkbox
  `button[aria-label="Select song"]`. Selecting shows "N selected" with **Add to playlist**,
  **Delete**, **Download** (batch zip per documentation), `Clear selection`. The "Library" dropdown
  button was not clickable by the probe (`button:text-is("Library")` timed out). No sort control was
  found. (Live.)
- **Search** (`button[aria-label="Search"]`): input "Find songs, playlists, and people"; result
  layout not captured. (Live, partial.)
- **Playlists / Projects / Spaces / Music videos**: all empty on this account; the New dialogs are
  described in B.2. Creating one was not needed and was not done. (Live.)
- **Music video** (live + documented): the Download video menu item opens "Pick a template to create
  your video" with **Music video** (NEW, AI generated, needs credits: the New music video dialog
  says "Credits are required ... can be expensive. Upgrade to Member for a free video"; model per
  the Updates dialog: Gemini Omni Flash with lip sync), **Modern**, **Player**, **Simple**. Simple
  rendered and downloaded in 37–40 s, 0 credits, **720x1280 (9:16) H.264 24 fps + AAC 48 kHz**,
  duration = audio length + ~2.5 s (16.0 s audio → 18.58 s file). The AI "Music video" template was
  not run. Settings > "Visible watermarking" (Off) adds a visible AI mark to images/videos.

## B.11 Download paths (all live, measured with ffprobe)

| Option | How | Result | Time | Credits |
|---|---|---|---|---|
| WAV | row "..." > hover Download > click `WAV` | PCM s16le, **48 kHz stereo**, 1.536 Mb/s; 16.0 s = 3.7 MB, 2:30 = 30 MB. The file also carries an mjpeg cover-art stream: ffprobe lists 2 streams, strip with `-map 0:a -c copy` | 2.7–5.7 s | 0 |
| MP3 | same, `MP3` | MP3 **128 kbps** (not 320), 48 kHz stereo, + cover stream | ~2.8 s | 0 |
| M4A | same, `M4A` | AAC LC ~120 kbps, 48 kHz stereo, + cover stream | ~2.4 s | 0 |
| Get stems | "..." > Download > Get stems, or the stems card zip button | zip of 4 AAC m4a stems | ~2.4 s after split | see B.8 |
| Download video | "..." > Download > Download video > template | mp4 720x1280 24 fps | 37–40 s | 0 for Simple |
| Batch | Songs library select > Download | zip of selected (documented) | not run | — |

Playwright: arm `page.waitForEvent('download')` **before** the click, then `download.saveAs()`. The
suggested filename keeps the title with `:` replaced by `_`. The download does not open a new tab.

## B.12 Length / tempo — the core finding (live, measured)

- **There is no real length, tempo, key or structure control.** The compose panel's "Advanced"
  switch only exposes BPM, Length, Seed and Model; the UI turns BPM into the text `, <n> bpm`
  appended to the Sound prompt and Length into a `[End - m:ss]` line appended to the Lyrics. Lyria
  treats both as hints.
- **Length field:** accepts 1:00–3:00 only (smaller values clamped to 1:00, bigger to 3:00 on blur).
  Returned tracks overshoot: asked 1:00, got 62.5 s, 62.9 s, 66.4 s. Without it tracks were 1:56–3:00.
  Asking for 0:16 in the lyrics tag or prose returned 2:19. A natural end is always a fade tail
  (last 2–3 s below −60 dB).
- **Tempo:** the model has a strong **120 BPM attractor**. "120 bpm" gave 120.0 (text) or 123.8
  (Advanced + Length), "140" gave 143.8, "100" gave 105.4, but "90" gave 120.0 twice (Advanced field
  and plain text). First test by the main agent asked for 120 and got 126 and 122. Tempo is steady
  inside a track (measured 120.03 over 138 s).
- **So the method for an exact length is: generate anything, then cut.** Cutting is free:
  1. local and sample-exact: download WAV (0 credits), `shortenTrack()` = analyseTrack + ffmpeg cut
     of whole bars from the first kick (16.0 s at 120 BPM = 8 bars = 32 beats). Live: 15.996 s from
     a 138.7 s track, kick 11 ms after the cut.
  2. in-app: song menu > Remix > Trim, Start/End in 0.1 s steps, 0 credits, makes a new library
     song "\<title\> (trim a-b)". Live: 0:00.4–0:16.4 gave 16.000 s, 0:00.3–0:16.7 gave 16.405 s.
  3. by chat: "Trim the track to the first 16 seconds" makes Producer run the same trim tool
     (0 credits, 2–3 s).
- To get a tempo other than 120 you must **measure** what came back and pick the nearest bar length;
  do not trust the request. Re-roll (5 credits) if the grid is off. A tempo-exact alternative would
  be uploading your own click/beat and using Remix Cover/Extend (Audio upload is live per the
  Updates dialog) — documented, unverified.

Measured generations (all instrumental, this account):

| # | Route and settings | Asked | Got length | Measured BPM | Credits |
|---|---|---|---|---|---|
| 0 | Producer chat "30 s, 120 BPM" | 0:30 / 120 | 2:30, 2:57 (take 2) | 126 / 122 | 10 |
| 1 | compose, Advanced BPM 120 + Length 1:00 | 1:00 / 120 | 62.5 s | 123.7 | 5 |
| 2 | compose, Advanced off, Lyrics `[End - 0:20]` (a leftover `[End - 1:00]` also present) | 0:20 / 120 | 115.9 s | 123.8 | 5 |
| 3 | compose, Advanced BPM 100 + Length 1:00 | 1:00 / 100 | 66.4 s | 105.4 | 5 |
| 4 | compose, Advanced off, `[End - 0:16]` + timestamped prose + "total length 16 seconds" | 0:16 / 120 | 138.7 s | 120.03 | 5 |
| 5 | compose, Advanced BPM 90, no length | — / 90 | 162.7 s | 120.06 | 5 |
| 6 | compose, text "90 bpm", Advanced off | — / 90 | 179.6 s | 120.05 | 5 |
| 7 | module `generateTrack`, Advanced BPM 140, no length | — / 140 | 70.2 s | 143.8 | 5 |
| 8 | Remix > Variation of #1 | — | 62.9 s | 123.8 | 5 |

Tail check: #1, #3, #4, #8 end in digital silence below −60 dB for the last 2–3 s (a fade), none ends
on a hit. Start: kicks are present within the first 5–15 ms of every track cut, no leading silence
("starts on beat 1" in the prompt may help, unproven because there was no A/B).

## B.13 Flows the code automates (Flow Music)

1. **Open a private window.** `openMusicWindow()`: `Target.createTarget { newWindow: true }`
   (1500×950) on flowmusic.app; reuses an existing flowmusic.app page if one exists. **Never use a
   flow.google.com tab.** Close with `closeMusicWindow()` (only ever a flowmusic.app page).
2. **Navigate + shell check.** `gotoMusic(page, route)`: SPA navigation, wait for the shell marker
   (`button[aria-label="New session"]`, fallback `a[href="/library/my-songs"]` or
   `button[aria-label="Toggle compose panel"]`); dismiss the cookie banner; if the URL is
   `accounts.google.com`, throw `NOT_LOGGED_IN` (Flow Music wants a Google sign-in; stop and ask
   the user).
3. **Read credits.** Menu read: click `button[aria-label="Settings menu"]`, find the
   `[role=menuitem]` matching `/credits/i` ("N credits"), Escape. Fresh read: go to `/settings`,
   match `/([\d,]+)\s+available/i`, navigate back. (Menu lags 1–3 generations; `/settings` is
   authoritative.)
4. **Generate (compose).** Go to `/session` (new session) → open the compose panel if the Sound
   description box is hidden → set the Instrumental switch (`button[role=switch][aria-label="Toggle
   instrumental mode"]`) → if not instrumental, fill `textarea[aria-label="Lyrics"]` → set the
   Advanced switch → fill BPM / Length / Seed inputs → fill `textarea[aria-label="Sound
   description"]` → click the "Generate" button (or Ctrl+Enter) → wait for a new `/song/` link and
   no `NN%` progress node (about 20 s; completion = new song id + no `NN%` for 3 s).
5. **Generate (Producer chat).** Fill `textarea[aria-label="Chat message"]` → click
   `button[aria-label="Send message"]` → 2 takes, 10 credits.
6. **List songs.** `a[href^="/song/"]` links, de-duplicated by id, in DOM order (a new song row is
   added at the bottom of the session list; `listSongs` returns DOM order, newest last).
7. **Download a song.** Hover the song row → click `button[aria-label^="More options"]` → menu
   appears → hover "Download" → click the format (`WAV` / `MP3` / `M4A`). Arm the Playwright
   `download` event **before** the click. WAV: strip the mjpeg cover stream with
   `-map 0:a -c copy` (optional; the MCP does it by default).
8. **Trim in-app.** "..." → Remix → Trim → in the "Trim Song" dialog wait until End shows the real
   duration (+ ~1 s) → fill **End first, then Start** (m:ss or m:ss.t) → Tab to commit → click
   "Trim" → wait for the new library song "\<title\> (trim a-b)". 0 credits.
9. **Split stems.** "..." → "Split stems" → wait for "Splitting stems..." to finish (~13 s) and the
   stems card to appear → click `[title="Download tracks (zip)"]` → unzip (system `unzip` when
   present). 0–5 credits.
10. **Download a template video.** "..." → Download → "Download video" → dialog "Pick a template to
    create your video" (Music video / Modern / Player / Simple) → click the template (Simple
    rendered and downloaded in ~37 s, 0 credits, 720x1280). **"Music video" (AI video) is
    credit-priced per the dialog text and is deliberately not offered.**
11. **Cut locally (free).** `shortenTrack()`: `analyseTrack()` measures tempo + first kick, then
    ffmpeg cuts whole bars from the first kick (4 ms fade-in, 40 ms fade-out). `trimTrack()` cuts a
    sample-accurate excerpt. `buildMusicPrompt()` composes the Lyria sound prompt from structured
    fields (genre, mood, instruments, bpm, key, no-vocals, start-on-beat-1, no-fade-in,
    end-on-downbeat, steady tempo).

## B.14 Quirks and failure modes (Flow Music, from code + live map)

- **Length and BPM are hints only** (see B.12). Never plan picture to the requested BPM — measure
  the real one. The 120 BPM attractor means a 115 request measured 120.00 on the Acme v2 track
  (first beat 0.232 s) and 120.08 on the earlier one.
- **The app appends ", 115 bpm" to the sound description** (observed 2026-11-13 on the Acme
  generation, as it did before).
- **Balance display lags.** Flow Music balance read 10,550 before and after the 2026-11-13
  generation (no deduction shown), and the earlier generation also showed no deduction; the balance
  was even up 25 from the previous reading (10,525 → 10,550). Same delayed-deduction pattern as
  Flow video credits.
- **Trim dialog resets Start/End** when the waveform finishes loading; fill only after End shows a
  real duration. End below Start once produced a corrupt "-1:-1" Start.
- **Remix > Variation generates immediately, 5 credits, no dialog.** The only menu action that
  spends without confirmation.
- **Same title for many songs** ("Untitled", "Minimalist Streetwear Ad") — always address songs by
  uuid.
- **Library clutter:** each stem split adds 4 "Stem" entries and each trim a new song.
- **Compose panel state resets** per session (Advanced/Instrumental switches reset on a fresh
  `/session`); the driver always sets them explicitly.
- **Hover is needed** to reveal row buttons in sessions; menus close on `Escape`, a second `Escape`
  closes submenus.
- **Screenshot on the second window sometimes times out** on "waiting for fonts"; use
  `Page.captureScreenshot` via a CDP session as fallback.
- **Do not click:** Upgrade, Buy Credits, Invite, Publish, Share link, Report, the Google One
  "Grant access" banner.
- **Limits (PLUS, live /pricing):** 10,000 monthly credits (~2000 songs), Daily top-up credits, 12
  concurrent generations. Free 2 / Starter 3,000 credits 8 concurrent / Member 30,000 16 concurrent.
- **Settings toggles (live):** "Moderate lyrics: Generate clean lyrics only" (Off), "Help improve
  Google Flow Music: Allow your content to be used to improve Google Flow Music" (On), "After Hours:
  allow the agent to suggest music edits and remixes while you are away; no credits" (On),
  "Visible watermarking" (Off — adds a visible AI mark to images/videos when On).

---

# PART C — The MCP layer (what the server itself adds)

## C.1 The 38 tools (cloud edition; 36 original + 2 new)

| Tool | Kind | What it does |
|---|---|---|
| `flow_connect` | queued | Verify the cloud browser is on Flow and signed in (returns the cloud context + a queued verification task). |
| `flow_disconnect` | local | Clear the cloud connection record. The cloud browser window stays open and signed in. |
| `flow_status` | queued | Report the cloud browser Flow tab state (URL, title, flowAccessible, loginRequired, accountVerified). |
| `flow_account_check` | queued | Verify the signed-in account is `you@example.com` (optionally also read the balance). |
| `flow_accounts` | local | Single account (Your Name, you@example.com); last-read balance, exhausted flags. `refresh_active=true` enqueues a balance-read task and returns the last-read balance with a note. |
| `flow_discover_ui` | queued | Record a page's interactive elements into `config/selectors.map.json`. Pages: main, project, image-generation, video-generation, characters, scenes, tools-gallery, grid-architect. |
| `flow_generate_image` | queued | Agent image generation (Nano Banana 2.1 / Pro / 2 Lite; ratios 16:9, 4:3, 1:1, 3:4, 9:16; quantity 1–4; up to 4 reference assets). |
| `flow_generate_video` | queued | Agent video generation (see A.13; duration sent in the prompt text). |
| `flow_video_options` | local | Read-only model cheat sheet (live models, retirements, lengths, capabilities, 720p costs). Free, no browser. |
| `flow_edit_video` | queued | Omni video-to-video edit (source file / media id / newest clip). |
| `flow_stitch_videos` | local | ffmpeg join (hard cuts or crossfade), optional re-frame, music, burned-in .srt. Free. |
| `flow_qc_report` | local | ffprobe/ffmpeg QC (codec, aspect, fps, size, duration, audio, black/frozen frames, silence, loudness −14 LUFS target, true peak) + JSON report + 6×4 contact sheet. Cannot see garment/print/logo/hand artifacts — a pass never means approved. |
| `flow_analyze_beats` | local | Tempo + beat times of a local audio/video file (ffmpeg + FFT; accurate within ~30 ms for steady electronic/pop; not for rubato). |
| `flow_beat_sync` | local | Cut clips to whole beats and lay music under them, loudness-normalised to −14 LUFS; optional logo end card; outputs a `.beatsync.json` sidecar. Free. |
| `flow_motion_overlay` | local | Motion graphics over a finished video (kinetic words, brand badge, line callouts, karaoke captions with the active word in orange, beat-pulsing dots, underline wipes, logo/end-card), rendered frame by frame in headless Chrome + ffmpeg; safe-zone audit (platform UI covers the top 14% and bottom 35%). Free. |
| `flow_music_generate` | queued | Flow Music track (compose or chat). |
| `flow_music_download` | queued | Download a song as WAV/MP3/M4A (free). |
| `flow_music_shorten` | local | Beat-aligned cut of a downloaded track (free). |
| `flow_music_songs` | queued | List the Flow Music library (id, title, length, date). |
| `flow_music_trim` | queued | In-app Trim (0 credits). |
| `flow_music_stems` | queued | Split into 4 stems, unzipped download (free). |
| `flow_save_frame` | split | ffmpeg frame extraction runs locally (free); only the upload half is queued (`flow_save_frame_upload`). |
| `flow_download_latest` | queued | Download the media open in the viewer, or the newest finished image/video (original / 1k / 2k / 4k; upscales may cost credits). |
| `flow_create_character` | queued | Create a character (from description or from a photo). |
| `flow_import_character` | queued | Create a character from a saved JSON file. |
| `flow_open_characters` | queued | Open the Characters view and list the characters. |
| `flow_create_scene` | queued | Create (and optionally name) an empty scene. |
| `flow_add_to_scene` | queued | Add a finished clip/image to a scene (free). |
| `flow_open_tools_gallery` | queued | Open the Tools page; list My Tools, Templates, Community tools. |
| `flow_use_grid_architect` | queued | Configure Grid Architect (never presses GENERATE). |
| `flow_use_tool` | queued | Open any Flow tool by name and fill its inputs (never runs it). |
| `flow_create_tool` | queued | Build a new Flow Tool from a description (no credits to build; ~1–2 min). |
| `flow_refine_tool` | queued | Ask a tool's applet agent for ONE change (sidebar "Ask applet agent to make changes"). |
| `flow_inspect_tool` | queued | Read a tool's source (Code tab) and statically scan it (read-only). |
| `flow_screenshot` | queued | Screenshot the current Flow page in the cloud browser. |
| `flow_queue_status` | local | Job queue + cloud task queue state. |
| `flow_cloud_complete` | local | Record a queued cloud task's execution result (writes `state/cloud-connection.json` on verified connect/account-check; updates `state/accounts.json` on a balance read). |
| `flow_cloud_result` | local | Return a queued cloud task with its stored result. |

## C.2 How the cloud edition works (from CLOUD-SETUP.md)

```
agent ──▶ MCP (stdio) ──▶ state/cloud-queue/<taskId>.json
  │                                        │  assignment: exact steps
  │   browser.browse in the signed-in      ▼
  │   cloud browser window            agent executes the steps
  │                                        │
  └─ flow_cloud_complete ◀── result ───────┘
```

- Task ids look like `cloud-<timestamp>-<rand4>`. Each task file:
  `{id, tool, args, status: 'queued'|'done'|'failed', created_at, needs_approval,
  spend_estimate_credits, assignment, result}`.
- Every assignment includes: the Flow URL/project to open, exact steps, what success looks like,
  what to report back (clip/media URL or id, credits before/after, errors), and the permission-card
  rule. Assignments start with "STEP 0 — VERIFY FIRST: check the account chip shows
  you@example.com" while the connection is unverified.
- `prepareCloudTask(tool, args, ctx)` validates args with the same rules as the original handlers
  and returns `{args, needs_approval, spend_estimate, assignment}`. It throws before anything is
  queued on invalid args.
- Spend blocks in assignments: `SPEND APPROVAL REQUIRED: this task would spend ~N credits. ...
  Do NOT execute it until Muse has approved this spend. If Muse has not approved, report the task
  as not run (status failed, error "spend not approved").` Tasks with no spend say `SPEND: this
  task spends no credits.`
- `flow_connect` returns the cloud context immediately:
  `{driver: 'cloud', expectedAccount: 'you@example.com', cloudBrowserWindow:
  'browser-task:00000000-0000-0000-0000-000000000000', account: 'you@example.com'}`.
- Config: `config/flow.config.json` — `driver: 'cloud'`, `cloudBrowserWindow`,
  `cloudProjectUrl: 'https://flow.google.com/project/00000000-0000-0000-0000-000000000000'`,
  `expectedAccount: 'you@example.com'`. No `chromeUserDataDir`, `cdpPort` or `headless` — there
  is no local Chrome.
- `state/accounts.json` — single Muse account, `last_balance: 1050`, `signed_in: false` (means "no
  local profile", **not** "signed out of Flow"), `cloud_verified: false` until a connect/account-check
  task is completed as verified.

## C.3 Known leftovers / dead code (from CLOUD-SETUP.md)

- `src/navigation/flow-ui.js:132` still has a stale error string mentioning the deleted
  `scripts/login-flow.mjs` (it can only fire from a live page, which never exists in the cloud
  edition).
- `src/accounts/rotation.js` is dead code (single-account rule lives in
  `src/accounts/cloud-accounts.js` now); its comment still mentions the deleted `runtime.js`.
- `DIMO-SETUP.md` was copied from the original server and documents the local-Chrome setup and
  the failed sign-in attempt; it is history, not instructions for the cloud edition.
- The original browser tool handlers under `src/tools/` are **not imported** by the cloud
  `src/index.js` and never execute there; they import the `connect.js` stub, so calling one would
  fail fast with the clear cloud-edition error instead of a confusing Playwright failure.

---

# PART D — Practice behaviours from the Acme builds (Nov 2026)

From `research/ad-overthinking-brief.md` and `research/mostly-unconscious-build-report.md`:

- **Every Overthinking clip:** the Flow agent failed once ("Something went wrong", free); direct
  generation used. All 4 clips passed QC first try. Total 28 cr (Omni 1.1, 7 cr each), exactly the
  one-take estimate. Inferred balance 734 (762 − 28); the live UI later read 762 (deduction
  delayed — see A.15).
- **MU Reel:** 9 clips × 12 cr = 108 cr. Clip B took 4 attempts on print scale (0.78 → 0.68 →
  0.59 → 0.51 PASS vs mockup 0.44); Clip D attempt 2 (0.63–0.69) was worse than attempt 1
  (0.57–0.61, used as best available, marginal). Clip A attempt 1 failed QC on the baked-in name
  labels; attempt 2 passed. Clip C passed with word-perfect dialogue.
- **MU music:** Flow Music track `060d2d13`, measured 120.08 BPM, cut to 19.987 s (10 bars / 40
  beats, source 4.028–24.015 s, skipping the ~3 s silent intro). First kick 0.018 s into the cut.
  In the mix the music is delayed 3480 ms so the first kick lands on picture beat b7 (3.498 s);
  cross-correlation of the final mix against the music file peaks at 3.483 s.
- **Overthinking v2 music:** new Flow Music track `4ec30149` (soft indie pop, 115 BPM request, F
  major; **120.00 BPM measured**, first beat 0.232 s, 61 s source, cut 10 bars from bar 1 →
  20.000 s, no stretch needed). Session
  `https://www.flowmusic.app/session/a103c27d-e27b-49f9-90e5-960bc7ff9491`. Cover art: alarm clock
  at 3 AM. Balance read 10,550 before and after (no deduction shown).
- **Standing rules that came out of this work:** never reuse a music track across Reels (fresh
  track per Reel); use Omni 1.1 Flash from now on (fewer credits, quality still very good);
  mockup rule (site mockups as the reference ingredient, print scale measured as % of garment
  width); QC loop (fix, re-QC, only then send); never use the line "your back saved me"; never put
  character names/ages in a Flow prompt; generate garments plain and add the logo locally.

---

# PART E — Gaps: what the code does NOT cover (for a live browser walkthrough)

Everything below is a control, panel, or flow that appears in the discovered UI dumps or is implied
by a route/label, but whose contents, options, or behaviour are **not** recorded anywhere in the
source. Do not assume any of it — a live walkthrough in the signed-in cloud browser must fill it in.

## E.1 Google Flow — unmapped controls

1. **Project "More options" menu** (`button[aria-label="More options for the project"]`, icon
   `more_vert`) — menu items unknown.
2. **Tile "More options" menu** (`button[aria-label="More options"]` on a tile) — only "Add to
   scene" is recorded; the other items (rename? duplicate? download? move? delete?) are unknown.
3. **Header Settings** (`button[aria-label="Settings"]`, icon `settings_2`) — view-settings
   contents unknown. (Distinct from Agent settings.)
4. **Product help** (`button[aria-label="Product help"]`, icon `help`) — contents unknown.
5. **Search** (`button[aria-label="Search"]` → `input[aria-label="Search"]`) — search behaviour,
   filters, and result layout unknown.
6. **Filtering and sorting options** — the filter categories are named (Type, Aspect ratio,
   Created, Duration, Resolution, Sort by Newest/Oldest) but the exact option values in each
   (e.g. which durations/resolutions) are not recorded.
7. **Agent panel** — the `Agent` tab/button, **Agent instructions**
   (`button[aria-label="Agent instructions"]`, icon `article_spark`), and **Open session history**
   (`button[aria-label="Open session history"]`, icon `menu`) contents are not recorded.
8. **Agent message feedback** — Good response / Bad response / Copy / Flag output exist as
   buttons but their behaviour (and whether Flag opens a dialog) is not recorded.
9. **"New collection"** (Add media menu item) — behaviour unknown; no MCP tool creates one.
10. **Character page** — the six archetype cards (The Eccentric / Professional / Wildcard /
    Familiar / Wicked / Fantastical), the **Format** button
    (`button[aria-label="Format"]`), and **"Add from project"** are discovered but not driven;
    their exact behaviour is unknown.
11. **Scene editor** — beyond "Add clip", the title input, "Select a clip to edit", "Toggle aspect
    ratio" and "Move to trash", the editor's timeline controls, clip picker contents, aspect-ratio
    options, and any in-scene generation controls are not mapped. (The code only creates an empty
    scene and adds clips to it.)
12. **Media viewer** — beyond Download / Move to trash / Settings trigger: any edit, extend,
    upscale, or "Save frame" placement details; the exact Download menu item texts for video
    (the code matches by quality substring and falls back to the first item).
13. **Trash page** (`/project/<uuid>/trash`) — restore / empty / delete-forever controls are not
    mapped at all.
14. **Tools gallery** — the Community tab is only listed (first 20 in one assignment); individual
    community tools, their cards, and the "Create tool" gallery button behaviour are not mapped.
    Tool pages: "Tool"/"Edit" tabs, "Done", "Apply to be featured", "Toggle tools", "Edit icon",
    "Debug Menu (Mock Error)", "Close assistant" are discovered labels with unknown behaviour.
15. **Grid Architect** — PROMPT WIZARD mode (textarea "Paste script..." + BREAKDOWN) is named in
    the selectors map but not driven by the MCP; the shot-size and angle selects in SEQUENCE mode
    are not enumerated (options unknown); the GENERATE button's behaviour/cost display is unknown
    (never pressed).
16. **Other tools** — only Grid Architect is mapped in code. Image Editor, Shot Explorer, and any
    other Template/Community tools have no recorded control lists (`flow_use_tool` fills inputs
    generically by label/placeholder/aria-label).
17. **Home page** — beyond "New project" and project cards: any other home controls (templates,
    recent, search, account menu items) are not mapped.
18. **Account dialog** — beyond email + `span.credits-count`: the dialog's other rows/links
    (plan details, manage, sign out?) are not recorded.
19. **The "settings popover" credit display for direct generation** — the Acme builds report
    that direct generation shows the cost in a settings popover, but the code has no selector for
    it (the MCP never does direct generation). Its exact label/selector is a gap.
20. **Agent-mode toggle itself** — the control that switches Agent mode on/off (needed for the
    direct-generation fallback) is not named anywhere in the code.
21. **Extend UI** — Omni Extend (+3–10 s) exists in the UI per the tool description, but no
    selector or flow for it is recorded.
22. **"New session" behaviour details** — what happens to the previous session's context, and the
    session-history panel contents, are not recorded.
23. **Error/empty states** — the agent's "Something went wrong" message has no recorded selector;
    the blank-editor/empty-project state seen 2026-11-12 has no recorded selector; no error-banner
    selectors are recorded for Flow (unlike Flow Music's `[data-sonner-toast]`/`[role=alert]`
    candidates).

## E.2 Flow Music — unmapped / unverified areas

1. **Search results layout** — `input[placeholder="Find songs, playlists, and people"]` results
    are not captured.
2. **Playlists / Projects / Spaces / Music videos creation** — the New dialogs are described
    (B.2) but creating one was never done; their full field lists and behaviours are unverified.
3. **Voice mode** (`button[aria-label="Voice mode"]`) — not exercised.
4. **Extend / Replace / Cover generation outcomes** — UI mapped only; no generation was run, so
    the result (whole clip vs only the new segment, region handling, Strength slider effect) is
    unverified.
5. **AI "Music video" template** — credit price and output unknown (not run).
6. **Spaces creation, Publish, batch Download zip** — not run.
7. **Error banners** — no error banner was ever triggered; `[data-sonner-toast]` and
    `[role=alert]` are candidates only.
8. **12-concurrent queue behaviour** — documented, never tested.
9. **Chat-route generation completion detection** — compose route tested; chat generation of two
    takes was only done once by the main agent.
10. **Tempo pinning via uploaded click track + Cover/Extend** — documented as possible, unverified.
11. **"Library" dropdown button** — not clickable by the probe (`button:text-is("Library")`
    timed out); purpose unknown.
12. **The diamond badge number** (sidebar, next to "Invite") — looks like a progress/points
    counter linking `/personalize`; unverified.
13. **Settings toggles' effects** — "Moderate lyrics", "Help improve Google Flow Music",
    "After Hours", "Visible watermarking" are listed as observed On/Off; their effects were not
    tested.

## E.3 MCP / process gaps (not UI, but a walkthrough should confirm)

1. **Direct generation flow** — the MCP has no tool for it; the exact steps (where Agent mode is
    toggled, which popover shows the cost, how duration/ratio are set in direct mode) are only in
    the Acme build reports as prose, not as selectors.
2. **The cloud browser's file-transfer upload route** — the working upload method in the cloud
    browser (route the granted file through file transfer onto the "Upload media" button) is
    described in prose only; no selector or step list exists in the MCP.
3. **Balance-read location** — the cloud assignment says "read the credit balance chip ('N Google
    Flow credits', in the account menu / header)" but the exact chip location varies (account menu
    vs header); the 2026-11-13 live read used the Account settings panel.
4. **Selector freshness** — the core map was made 2026-10-16; the prompt-box container changed
    2026-11-10 and retiring-model labels changed 2026-11-09. A walkthrough should re-verify every
    selector in Part A against the live UI and note any that moved.

---

*End of draft. Sources are listed at the top; every label/selector above is quoted from the code or
from the repo's own live-verified research docs, not invented. Gaps in Part E are the explicit
to-do list for a live browser walkthrough.*
