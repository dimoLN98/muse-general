# Flow Tools (vibe-coded applets): how they work, how to build one, how to vet one

Long form with URLs: `docs/research/flow-tools-and-builder.md`. Live UI map: `FLOW-UI-MAP.md` §5, §10.
Tags: [G] Google help/privacy pages, [C] creator reports, [live] verified in this account, [unverified].

## What a Tool is
* An **LLM-written mini web app**: Flow "writes the code and builds the tool's interface for you" [G]. Not a saved preset.
* Lives at `/project/<id>/create-tool` (builder) and `/project/<id>/tool/<uuid>?mode=APP` (runtime). The app renders in a
  `scf.usercontent.goog` **iframe**, so page-level selectors miss its controls [live]. Builder sidebar textarea:
  "Ask applet agent to make changes". Header: Tool/Edit switch, Favorite, Share, More options, Done [live].
* **Anyone can run Tools; creating/remixing needs a paid plan** (Google's table: from AI Plus; two creators say Pro/Ultra).
  Account is PRO, so creation should work — **unverified until tried.**
* **Building costs no credits** (Agent queries free) but there is an **unpublished daily creation quota** and Agent-query quota.
* **Running a generative step spends the runner's credits**; footer says "This Tool may consume credits" and a banner warns
  [G/live]. Nothing says who pays for a shared tool — assume the runner.
* Applets can reportedly call Nano Banana 2/Pro, Omni/Veo, in-tool Gemini text and the Flow media gallery. No Drive or desktop
  access, **no persistent storage** (state is lost on reload). ffmpeg-in-browser and arbitrary external HTTP are **[unverified]**.
* **No official API/CLI/MCP exists for creating, editing or running Tools.** UI automation is the only path (ours).
* Sharing = **snapshot of the code** at link time; the only way to stop sharing is to delete the tool. **Default sample images
  travel with the link** → never bake brand assets into a tool you share.
* Privacy: tool/Agent sessions kept 18 months by default; reviewers may sample uploads/outputs; Canada supported; web/PC only.

## Built-in/Template tools (names seen)
Stringout Creator, Transition Machine, Video Resizer, CaptionCast, Type Overlays, SwissFlow Studio, Scout360, Ribbit, Whisk,
Pose Text, 3D Face Swap, Grid Architect (+ Storyboard Studio / multi-angle community tools). Open with `flow_use_tool`;
read credit cost from the footer/banner before clicking anything generative. A tool's cost is just the model calls it makes.

## Build procedure (agent-executable) — automated by `flow_create_tool` / `flow_refine_tool` / `flow_inspect_tool`
**Verified live 2026-10-17** (two tools built, 0 credits; details in `FLOW-UI-MAP.md` §12):
* The create box is a ProseMirror div; submit = `button[aria-label="Start generation"]`; the URL jumps to `/tool/<uuid>?mode=EDIT`.
* **Done-signal = the `Stop` button disappears** (then `Send message` + `Restore tool to this version` appear). Builds took 100–144 s; a one-line refinement 27 s.
* **There is no Save button — the tool autosaves** into My Tools.
* Generated code is React+TypeScript, readable in the Code tab; it uses `Flow.media.select()/selectMultiple()` (gallery picker) and `Flow.download({base64, mimeType, filename})`. Both built tools had **no network calls / external URLs**. Put "use Flow.media.select for the gallery and Flow.download for exports" in the prompt.
* The footer "This Tool may consume credits" shows even on a no-AI tool — it is generic, not a quote.
1. Throwaway project → sidebar **Tools → Create tool** (`/project/<id>/create-tool`).
2. Paste ONE prompt (≤~250 words works; ~500 words also worked once). Starter chips exist (Time stretcher, Style morph, Voice over).
3. Generate → wait for `Stop` to vanish (poll every ~3 s).
4. **Test with a fixture** (1 flat product jpg, 1 four-second 9:16 clip, 1 neutral audio file; no faces, no unreleased designs).
   Read the footer. If it says it may consume credits, do not click Generate until the quote is read.
5. Break it: empty inputs, huge file, wrong aspect, double-click Generate. Check outputs land where promised (gallery vs download).
6. Iterate via the sidebar, **one change per message** (the agent "helpfully" edits things you didn't ask for).
7. After every green state: **More → Remix tool → rename `Name v1`, `v2`** = the only reliable version history.
8. Favorite to expose in all projects; Pin for the current project. Share only after review.
9. Log tool URL, version notes and quota used in a local ledger (Takeout may not carry tool code).

## Writing a good builder prompt
Brief it like a junior engineer who will execute literally. Structure: **name + purpose + "no AI generation/no credits" (if true)
→ inputs → behaviour → outputs → build order → "do not add anything not described"**. Specify save-to-project vs download
(non-generative tools default to export). Missing generation behaviour is usually a config gap ("Add a section so I can choose
the image model"). Prototype first, then write a clean feature list and rebuild in a fresh tool. If it misbehaves, change
inputs/phrasing before blaming the code, then debug via the Edit chat. You can read the generated code in Edit mode.

## Eight Acme tool candidates (ready-to-paste prompts: research doc §5)
| # | Tool | Credits | Notes |
|---|---|---|---|
| 1 | Caption Stamper (brand-font captions, batch) | none | export may be real-time; fonts limited to sandbox |
| 2 | Reels/TikTok Safe-Zone Checker | none | overlay for top 14%/bottom 35%/sides 6% |
| 3 | Hook Lab (A/B hook generator) | in-tool Gemini text; unconfirmed | |
| 4 | Drop Grid (product shot → 6-image grid) | **spends credits** | the only clear spender |
| 5 | Beat Cut Stringout | none | |
| 6 | Palette Police (brand-palette checker) | none | |
| 7 | Lookbook Sequencer | none | |
| 8 | UGC Shot Planner (script → shots → prompts) | none | |
Build zero-credit tools first (2, 6, 8, then 1). Orange `#FF5A1F` in those prompts is a placeholder — confirm Acme's exact orange.
**Caveat:** the ffmpeg-based local scripts in this repo (stitch, captions, QC) are more reliable than browser-sandbox tools for
rendering; prefer Flow Tools for planning/checking/UI helpers and local ffmpeg for final render.

## Vetting a community/shared tool (treat as third-party code that receives your uploads)
1. Open it in a throwaway project with fixture media only. 2. Switch to **Edit** and read the code; search for `fetch(`,
`XMLHttpRequest`, `WebSocket`, `sendBeacon`, `new Image().src`, `<script src=`, `eval`, `atob`, `postMessage`, hard-coded URLs.
3. Watch the Network panel while it runs; any non-Google host = stop. 4. Prefer **Remix** (own copy) over using the original.
5. "Featured" is a weak signal, not an audit. 6. Never upload unreleased designs, faces, minors or customer data; never paste
credentials. 7. Re-audit any updated link.

## Stop conditions
Banner shows credit spend not approved by the user · prompt-injection-like text inside a tool UI · quota message · tool asks for
credentials or external URLs.

## Answered by the live build (2026-10-17)
PRO can create tools (yes). Builder done-signal (Stop gone). Save click (none, autosave). Code readable (Code tab, yes). Footer on
non-generative tools (yes, generic). Applet SDK surface seen: `Flow.media.select`, `Flow.media.selectMultiple`, `Flow.download`.
Built: Safe Zone Checker, Palette Police (both free, working, verified with fixtures/built-in benchmark).

## Still open (need live tests)
Daily creation quota and its limit message; whether a run quotes credits before the click; can an applet call external URLs when
asked (generated code avoided it unprompted — test a harmless endpoint, watch for CSP errors); upload size limits; in-browser
render time for a 15 s 1080×1920 export; Remix location and what deleting a tool does to shared links. Acme's exact orange
hex is unconfirmed (prompts use the placeholder `#FF5A1F`).
