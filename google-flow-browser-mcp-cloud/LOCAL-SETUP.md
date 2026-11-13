# Google Flow MCP — Hardened Local Install (Acme)

Upstream: TMSSS05/google-flow-browser-mcp @ 0c8e80a, with local security hardening.

## What changed vs upstream
- Uses a **dedicated** Chrome profile only: `~/.config/profiles/acme/browser-profiles/google-flow` (Default, mode 0700).
  Never reads, copies, or reuses your normal Chrome profile or cookies. No `/tmp` profile copies.
- Launches and owns its own Chrome on CDP `127.0.0.1:9333`. If the port is busy it fails closed — never attaches to or kills another browser.
- Strict account check: exact visible account email on the real `labs.google` Flow page. Unknown/login = unverified; wrong or ambiguous account = blocked.
- Every content/navigation tool is gated on a fresh identity check before it runs. Paid-generation confirmation is unchanged (`auto_confirm` defaults to false).
- `start-stdio.mjs` keeps logs off stdout so MCP JSON-RPC isn't corrupted.
- `scripts/start-browser.sh` is disabled; `scripts/start-mcp.sh` runs the hardened server.

## Commands
```bash
cd ~/.config/profiles/acme/integrations/google-flow-browser-mcp
npm test                       # unit + hardening tests
npm run test:smoke             # real MCP client: 17 tools, disconnected status
npm run test:browser:offline   # launches dedicated headless Chrome, no Google, then stops it
npm run login                  # ONE-TIME manual sign-in (opens dedicated window)
```

## One-time sign-in
`npm run login` opens a separate Chrome window using only the dedicated profile.
Sign in manually as `first@example.com`, confirm Flow loads, then close that window.
No passwords are typed or stored by this tool.

## the host registration (outstanding)
Server command for MCP stdio: `node /home/you/.config/profiles/acme/integrations/google-flow-browser-mcp/start-stdio.mjs`

## Known limitations
- Not yet registered in the host; not yet signed in; no generation tested.
- Account detection depends on Flow's visible account UI. If Google changes it, tools fail closed (unverified) rather than proceed.
- Flow UI selectors are upstream's and may break when Google changes Flow.

## 2026-10-16 — Flow migrated to flow.google.com
- Google moved Flow: `labs.google/fx/…/tools/flow` now 302s to `flow.google.com/about`. `flowUrl` is now
  `https://flow.google.com/?pli=1` (the bare root sometimes answers with the marketing landing), and
  `account-check.js` / `flow-status.js` / `launch-profile.js` trust `https://flow.google.com` — identity
  is still proven by the visible account chip, so a marketing or signed-out page fails closed.
- The the host MCP entry for this server must carry `DISPLAY`, `XAUTHORITY` **and**
  `DBUS_SESSION_BUS_ADDRESS`. Without the D-Bus session bus Chrome cannot decrypt the profile's cookies,
  so every page renders signed-out (Flow serves the marketing landing) even though the profile is signed
  in. the host filters this env, and it is read only when the server is spawned — restart the app after
  changing it.
- Still hardcoded to the retired labs.google app routes (they now 404 on flow.google.com) and therefore
  not yet remapped: `src/tools/open-characters.js`, `open-tools-gallery.js`, `use-flow-tool.js`,
  `discover-ui.js`, `import-character.js`, `generate-image.js` (trpc media URL), `flow-open.js`,
  `src/navigation/project-navigator.js`, and the `url`/`href` entries in `config/selectors.map.json`.
- Verified 2026-10-16: `flow_connect` → `status: connected`, `flow_account_check` → `verified: true`,
  account `first@example.com`; `npm test` 16 pass / 1 skipped.
