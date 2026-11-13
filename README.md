# muse-general — Google Flow toolkit for any business

A general-purpose toolkit for making images and videos with **Google Flow**
(flow.google.com) through an agent. No brand is baked in: it works for any
business, any product, any topic. Clone it, configure your own Flow account,
and your agent can generate, edit and finish Flow content right away — without
building the whole workflow from scratch.

## What's inside

| Path | What it is |
|---|---|
| `google-flow-browser-mcp-cloud/` | The MCP server that drives Google Flow in a browser: image and video generation, edits, scenes, characters, Flow Tools, music, stitching, QC. Direct mode only (no Flow Agent). |
| `skills/google-flow/` | The skill that teaches your agent to use Flow well: prompt formulas, model choice, credit hygiene, the live UI facts, pitfalls. |
| `skills/flow-music/` | Flow Music (Lyria): prompts, rights, beat sync, post-download checks. |
| `skills/commercial-music-sourcing/` | Commercial-safe music for social ads (Meta Sound Collection, TikTok CML, paid libraries). |
| `skills/flow-self-improvement/` | The retro loop: after every Flow session, review what was slow and what the prompts taught you, and update the skills so the next session is better. |
| `research/flow-ui-map.md` | The live map of Flow's UI: menus, selectors, routes, pitfalls. |
| `research/flow-ui-map-from-code.md` | The same map, generated from the MCP source. |
| `research/flow-best-practices.md` | Verified Flow best practices: prompt craft, models, credits, consistency. |

## Setup

1. **Clone this repo** and install the MCP dependencies:
   ```bash
   cd google-flow-browser-mcp-cloud
   npm install
   ```
2. **Configure your Flow account.** Copy the example config and fill in your
   own values — your Google account email, your cloud browser window, and
   your Flow project URL:
   ```bash
   cp config/flow.config.example.json config/flow.config.json
   # edit config/flow.config.json: expectedAccount, cloudBrowserWindow, cloudProjectUrl
   ```
   Never commit your real config. The example file is the template.
3. **Sign in to Google Flow** in the browser your agent will drive, and open
   (or create) your Flow project.
4. **Verify the MCP works:**
   ```bash
   npm test
   ```
   The smoke test starts the server over stdio and drives it as a real MCP
   client. It spends no credits and needs no sign-in. On a fresh install the
   two account-state checks are skipped until the first `flow_connect` /
   balance read seeds the state — that is expected.
5. **Load the skills** into your agent (`google-flow`, `flow-music`,
   `flow-self-improvement`, `commercial-music-sourcing`) and point it at the
   MCP server. The skill files tell the agent how to work with Flow; the MCP
   server does the driving.

## How it works

- **Direct mode only.** The Flow Agent is unreliable, so the MCP generates in
  direct mode: the agent sets the model, ratio, duration and the exact prompt,
  then starts the generation. This is faster and more predictable.
- **Credits are guarded.** `auto_confirm=false` is the only real spend guard:
  it prepares a generation without spending. A confirmed generation needs an
  explicit approval.
- **The UI map is kept alive.** Flow's UI changes without notice. Whenever a
  button, menu, model or route moves, the map (`FLOW-UI-MAP.md` and
  `config/selectors.map.json`) is re-mapped live and the skill is updated in
  the same task. Treat a selector failure as a signal to re-map, not to retry.
- **After every session, run the retro.** `flow-self-improvement` reviews the
  clicks and the prompts, and promotes the proven lessons into the skills.
  The toolkit gets better every time it is used.

## Models and costs (verified live)

- Video: Omni 1.1 / 1.2 Flash (720p, per second), Veo 3.1 Lite / Fast /
  Quality. `flow_video_options` prints the live table — read it instead of
  guessing. Model menus change; check the UI map when a model disappears.
- Image: Nano Banana 2.1 (free at most tiers), 2K Upscaled downloads are
  sharper than 1K Originals.

## Contributing

Found a UI change, a better prompt pattern, or a faster route through the
Flow UI? Update `FLOW-UI-MAP.md`, the affected skill, and the MCP handlers in
the same change, and note the date. The map and the skills are the source of
truth — keep them in sync with the live product.
