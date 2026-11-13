---
name: google-flow
description: Use when creating or editing media in Google Flow.
version: 1.3.1
author: Muse
license: MIT
metadata:
  tags: [google-flow, video, image, veo, omni, nano-banana, reels, ads, mcp]
  related_skills: [native-mcp, flow-music, flow-self-improvement]
---

# Google Flow (flow.google.com) via the google-flow MCP server

## When to Use

Load this skill when the task involves any of:

* generating, editing, extending, stitching or exporting images and videos in Google Flow;
* driving the `google-flow` MCP server (its tools are `flow_*`);
* turning Flow output into ads, Instagram Reels, Shorts or social posts;
* building or running Flow tools/applets (Templates or Community);
* debugging the Flow UI, its selectors, or a failed Flow run.

Use this whenever a task involves generating, editing, extending, stitching or exporting images and
videos in Google Flow, driving the `google-flow` MCP server, building Flow tools/applets, or making ads,
Reels and social posts from Flow output.

The integration repo is the source of truth for selectors and live UI facts — read it before touching
the UI:

    google-flow-browser-mcp-cloud/
    ├── FLOW-UI-MAP.md      # verified UI facts, per-asset menus, routes, pitfalls
    └── config/selectors.map.json

Everything below is verified live unless marked otherwise.

## Standing rules

* **Keep the UI map alive (the user's standing instruction).** Flow's UI changes without notice. Whenever I notice a new/removed/moved button, menu, model, route, tab, or a whole redesign (selectors missing, labels renamed, an "absent" feature like Extend or Frames-to-Video suddenly appearing), I must, in the same task: (1) re-map the affected area live (`flow_discover_ui` / CDP reads, screenshots; no credit spend to explore), (2) update `FLOW-UI-MAP.md` and `config/selectors.map.json` in the integration repo, (3) patch this skill's "Verified UI facts", tool table and pitfalls (add the date; mark superseded claims instead of leaving them), and (4) fix the affected `flow_*` handlers if they broke. Treat a selector failure as a signal to re-map, not to retry. Don't wait to be asked, and tell the user briefly what changed.

* **Default video model: Omni 1.2 Flash (live since 2026-11-05; the menu selects it by default).**
  `Veo 3.1 - Quality` (≈100 credits) is refused by a cost rail unless `allow_expensive=true`.
  `Veo 3.1 - Fast` (20) and `Veo 3.1 - Quality` are **retired 2026-12-05**, together with
  `Omni 1.1 Flash`; `Veo 3.1 - Lite` (10 flat) is the only Veo to keep using, mostly as the cheap
  baseline or when a Veo look is wanted.
* **Credits are per second on Omni 1.2:** 720p 3/s up to 10s and 6/s for seconds 11-15 (4s = 12,
  10s = 30, 15s = 60); 360p 1/s (4s = 4). Edits bill the same way (3/s at 720p), so a 4s edit is 12,
  not the old flat 40. `flow_video_options` prints the live table — read it instead of guessing.
* **720p only (standing): never generate, draft or deliver at 360p** — low-quality video is rejected; the 360p prices below are reference facts only.
* **Default image model: Nano Banana 2.1** — never the Lite variant.
* **Ask before spending credits.** Images have been free/covered at this tier; video moves the balance.
  Reference: Omni 1.2 720p 3/s (12 per 4s clip), Omni 1.2 360p 1/s, Veo Lite 10 per clip.
* **`auto_confirm=false` is the only real spend guard.** Flow's permission card appears only sometimes.
* **Never click "Always approve"** — it rewrites the account setting to `Never`.
* Never click a rights/consent attestation for the user. The one exception, explicitly authorised:
  the video-upload "Rights to use this video" dialog is answered as "I agree, do not show again".

## Account rotation (optional, multi-account setups)

* Configure your accounts in `config/flow.config.json` (`accountRotation.accounts`: an email and a Chrome user-data dir each). The MCP supports several Google AI Pro accounts and rotates between them.
* Rule: stay on the active account until it can't cover the next generation, then move forward. **No monthly reset** (each account refills on its own billing date). After the last account the MCP wraps to the first account that shows credits again.
* Automatic: `flow_generate_video` / `flow_edit_video` with `auto_confirm=true` read the active balance first, switch when short, and retry once on the next account if Flow reports insufficient credits mid-request. Results carry `account` + `account_rotation` (balance before/after, switched_from); the sidecar gets the same. `flow_accounts` shows the state (`state/accounts.json` in the repo).
* `ACCOUNT_NOT_SIGNED_IN` → sign that account in. The rotator **stops at the first unsigned account and never skips to the next**, so every fallback has to be signed in for the accounts after it to be reachable. `ALL_ACCOUNTS_EXHAUSTED` → stop and alert the user.
* Check: `flow_accounts` (read-only). Projects and characters are per account: after a switch, re-create them there from local reference images.
* **Sign-in only works inside the dedicated profile.** Signing a Google account into any other Chrome writes THAT profile, while the MCP only launches its configured profile dirs; it would still read `ACCOUNT_NOT_SIGNED_IN`. Always sign in through the configured profile.
* **Copying a Chrome profile does not move a Google session.** A clone keeps the cookie rows and `account_info` but still reads signed out in Flow, so it is never a substitute for a sign-in; it also drags the source profile's history, extensions and prefs into the new profile. Repair a broken profile by re-creating its dir and signing in. Recipe + probe safety: `references/account-signin-and-profiles.md`.
* **CRITICAL — every Chrome launched on a rotation profile needs the user's session D-Bus.** Chrome 156 encrypts the Google cookies with os_crypt `portal` (XDG Desktop Portal Secret). Started from a shell whose `DBUS_SESSION_BUS_ADDRESS` is not `/run/user/<uid>/bus`, Chrome cannot decrypt them and **deletes them as corrupt**, silently signing that account out — a live account then reads as signed out. Pin `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus` and `XDG_RUNTIME_DIR=/run/user/$(id -u)` for every launch. Never hand-roll a probe that opens these profiles.
* **Verifying a sign-in, cheapest signal first:** read `Default/Preferences` → `account_info[0].email` plus the `Default/Cookies` rows (`SID` / `__Secure-1PSID` on `.google.com` and `.google.ca`) with sqlite on a COPY — no Chrome launch, nothing to break. Then run `flow_accounts` once to record the balance. The Flow app itself (`labs.google/fx/tools/flow` → PRO badge + project grid) is the only proof the session works; `flow.google.com/about` and `myaccount.google.com` → `/account/about` are what a decrypt-less Chrome shows and mean nothing on their own. Don't open a profile in a second Chrome while a sign-in window still holds it.
## Tool inventory

| Tool | What it does | Costs |
|---|---|---|
| `flow_connect` / `flow_disconnect` / `flow_status` / `flow_account_check` | Session on the ACTIVE rotation account (see Account rotation) | free |
| `flow_accounts` | Rotation state: active account, balances, exhausted flags; `refresh_active` re-reads the live balance | free |
| `flow_generate_image` | Image from text; `reference_images` attach as ingredients | usually free |
| `flow_generate_video` | Text or image → video, `auto_confirm`, `duration` 3-15s, downloads the clip | 12 credits (Omni 1.2, 4s @720p); 3/s |
| `flow_edit_video` | Video-to-video edit (Omni only), multi-turn on one clip, staged unless `auto_confirm` | 3 credits/s @720p (12 for 4s) |
| `flow_video_options` | Read-only cheat sheet: live models, retirement dates, allowed lengths, credit table | free |
| `flow_download_latest` | Newest finished image/clip through Flow's own Download menu | free |
| `flow_stitch_videos` | Join local clips into a longer video (cuts/crossfade, 9:16, music, .srt) | free, local |
| `flow_save_frame` | First/middle/last/timestamp frame of a clip; optionally upload to Flow | free |
| `flow_add_to_scene` | Put a finished clip into a Flow scene (tile → More options → Add to scene) | free |
| `flow_use_tool` | Open any gallery tool by name (Stringout Creator, Transition Machine, Video Resizer…) | free to open |
| `flow_create_tool` | Build a NEW Flow Tool from a prompt (waits ~1–2.5 min, optional rename, scans the generated code) | free (daily quota); never runs the tool |
| `flow_refine_tool` | One change via the Tool Builder sidebar; waits for the agent | free |
| `flow_inspect_tool` | Read a tool's source and flag network/eval/remote-script/external URLs | free, read-only |
| `flow_qc_report` | Local ffprobe/ffmpeg QC of a finished video: format, black/frozen/silence, loudness; JSON + contact sheet | free, local |
| `flow_analyze_beats` | Tempo + beat times of an audio/video file (local FFT, no Python); ≈28 ms on click tracks | free, local |
| `flow_beat_sync` | Cut clips to whole-beat lengths, lay music under them (ducking, -14 LUFS, optional logo end card on the beat grid) | free, local |
| `flow_discover_ui` | Read the live controls of whatever is open | free |

## Which tool for which job

* **Image** → `flow_generate_image` (Nano Banana 2.1); attach references for consistency.
* **Video from an image or product shot** → `flow_generate_video` with `reference_images`.
* **Change something that already exists** → `flow_edit_video` (Omni video-to-video), not a fresh generation.
* **A clip is too short** → first ask for the length you need in one generation: **Omni 1.2 Flash makes
  3–15s natively** (3–10s without a subscription), so a 12s or 15s spot no longer needs stitching.
  Past 15s use **Omni Extend** in the Flow UI (subscribers, +3–10s per extension, up to 3 image refs,
  web only — there is no MCP tool for it yet) or `flow_stitch_videos` locally (free, instant).
  The older "Extend is documented but absent" finding is superseded — Veo Extend was retired and only
  Omni clips extend now; see `FLOW-UI-MAP.md` §16.
* **Continue the same shot** → `flow_save_frame` on the last frame → upload → use as an ingredient →
  prompt "continue this shot …". This is the verified stand-in for frames-to-video.
* **Vertical for Reels/Shorts** → `flow_stitch_videos` with `aspect: '9:16'`, or the Video Resizer template.
* **Captions/typography** → CaptionCast / Type Overlays / SwissFlow Studio, opened with `flow_use_tool`.

## Creative verdicts (standing)

* **A pretty clip is not an ad.** Every ad needs a script (hook → message → CTA), someone speaking or VO about the brand/product, music, and on-screen brand cues (badge/logo early, product callouts, captions, end card). Silent "girl says one line" or "walking away" clips fail.
* Realism and resolution are good; story and script are the weak part.
* **Two realistic people talking + a motion graphic that animates the product + synced music is the quality bar.** Use Flow for two-person dialogue scenes and finish locally; see `docs/research/ad-script-and-motion-graphics.md`.

## Craft digest (long form in `references/`)

**Video prompt (six slots, one action, one camera move, one scene per clip):**

    [shot type] of [subject, 2-3 concrete attributes], [single action]. [setting, time, weather].
    [one camera move + lens]. [lighting: source, direction, quality].
    Audio: [ambience]; SFX: [...]; @Char says, "<=10 words". Video length: 8 seconds.

* Duration is set **by the prompt string** ("Video length: 12 seconds."), there is no UI control. Omni 1.2
  honours any whole second 3–15; Veo snaps to 4/6/8 and Omni 1.1 to 4/6/8/10. It is still a request, not a
  guarantee — ffprobe every clip.
* Audio is its own labelled sentence; dialogue in quotes, ≤~10 words; "No music" is valid.
* Positive framing ("empty road"), English, name the camera move. Avoid sky/water/crowds/hands/text in one frame.
* Refused? Rewrite (drop real names, dual-meaning words), never loop Retry.

**Image prompt (Nano Banana 2.1):** `[Subject] + [Action] + [Context] + [Composition] + [Style]`, strong verb first,
photographic terms, quote exact text + font + position. Edits: "Keep X identical. Change one thing. Do not change
anything else." Multi-ref: give each image a role.

**Consistency:** reference sheet (front / ¾ / profile) → ≤2 refs per character → identical identity wording in every
prompt → one project per sequence (`@` is project-scoped) → plain-background product refs → QC the *sequence*.
Voice refs need ingredient-based generations.

**Reels/Shorts/ads:** 9:16, motion in frame 1, hook works as a silent still, cut every 2–3s, <15s cold / ≤30s max,
text out of the bottom ~250px, captions mandatory (Flow won't burn them in), no own-music upload in Flow.
Structure `0–3 hook → 4–10 problem → 11–20 demo/proof → last 5–10 CTA` = 3–5 clips. **Test hooks as stills first,
render only winners.** Photoreal ads: assume a YouTube AI label; never strip SynthID.

**Edits (Omni only, 3 cr/s at 720p — 12 for a 4s clip):** one change + "Keep everything else the same."
Longer edit prompts change more. 1.2 supports multi-turn edits on clips up to 15s; each turn is billed,
so chain edits on ONE clip instead of regenerating it.

**Credit hygiene:** x1 outputs while iterating; quote model/length/count and ask first; re-read the balance before and
after paid runs; never loop Retry; don't pay to re-prove a settled gap. Account is PRO: 1080p upscale free, 4K
(Ultra-only) unavailable. Ultra's Veo discounts don't apply.

**Apparel (from the 2026-10 research):** reference-driven video only; pin clause ("keep cut, colour, print scale and position identical");
heavy-fleece words ("heavy, thick, structured, slow sway"); one orange gel as rim light instead of the word "orange"; flat-print back view
via route B (plain hoodie + composited art) for anything shoppers buy against; Veo Lite ≈ Fast at half the credits.

**Playbook advice that is overridden here:** Insert/Remove/camera controls (not in the toolbar),
Frames-to-Video as a reachable control, "draft images on Lite", "hero shot on Quality" (retiring),
"start on Lite so you can extend" (only Omni clips extend now). Live findings win; see `FLOW-UI-MAP.md` §16.

## Model gates that silently change what you can do

* Veo 3.1 **Quality** cannot use Ingredients or Extend; Veo 3.1 **Fast** cannot Extend; **only Omni edits
  video and only Omni clips extend**. Choosing a model can remove a feature mid-project — and Fast, Quality
  and Omni 1.1 all disappear on 2026-12-05.
* **Extend** is **Omni Extend** now: subscribers only, +3–10s at a time, up to 3 image references, web only,
  billed per second added (1/s at 360p, 3/s at 720p). Veo Extend was retired 2026-11-05; an extended clip still
  loses insert/remove/camera edits, so do object edits first. No MCP tool for it — it is a UI-only step.
* **Frames-to-Video** (start/end frame) is documented as `Video → Frames` + `+ Add start/end frame`
  (all Veo 3.1 variants and Omni; web only for Omni) but I have not located that control in this build —
  the prompt box, Agent settings, clip editor, `+` menu, sidebar and gallery were all checked.
* **Credits are charged per generation, not per request** (2 outputs = 2× the bill); failures are refunded;
  peak 2–5 PM UTC gives non-subscribers no video generation. Omni 1.2 bills per second instead
  (720p 3/s up to 10s, 6/s beyond; 360p 1/s), so quote length as well as count before asking.
* Uploads: **60s / 1 GB**, `.mov .mp4 .avi .wmv`; trim to ≤30s to use as a reference, edit window ≤15s
  on Omni 1.2 (≤10s on 1.1), and edits can be multi-turn on the same clip. Scenebuilder holds
  **one scene per project** and exports as a single file.
* SynthID is embedded in every output; a visible watermark is optional and mandatory only in India,
  South Korea and Vietnam. Canada has no extra restriction.

## Changing or adding a Flow video model (checklist)

Flow's model menu changes under us mid-project. A model bump is never a one-line edit: six places must
agree or bots keep calling the retired model.

1. **Re-map the live menu first** (free, read-only): Agent settings → `Video generation default`. The
   labels themselves carry retirement markers (`Veo 3.1 - Fast / Leaving Dec 5`). Trust the UI over
   memory, notes or last month's table.
2. **Verify prices against Google's Flow credit table** (`support.google.com/flow/answer/16526234`).
   Versions change the billing basis, not just the name — 1.2 moved video from per-clip to per-second.
3. **Edit `src/utils/video-models.js`** — one registry holding models, retirement dates, allowed
   lengths and credits. `generate-video.js`, `rotation.js`, `runtime.js`, `video-options.js` and the
   tool descriptions all derive from it; never hard-code a model string in a handler.
4. **Config:** `config/flow.config.json` + `flow.config.example.json` (`videoModels`,
   `videoDefaultModel`, `videoModelAliases`) and `config/selectors.map.json` (`videoModels`).
5. **Docs:** `FLOW-UI-MAP.md` (model row, clip lengths, credit table) and this skill. Rewrite the stale
   sentence in place and name what it replaces — never stack an "UPDATE: actually…" line underneath.
6. **Tests + reload:** `npm test` (cost and duration assertions encode the table), then restart the MCP
   server (see Pitfalls — source edits do not reach a running server).

### Reading the model menu for free when the MCP will not attach

If the agent's own Chrome already owns the CDP port, `flow_connect` refuses with `CDP_PORT_BUSY` instead of
attaching. You can still read the live UI read-only, spending nothing:

```js
const browser = await chromium.connectOverCDP('http://127.0.0.1:9334'); // repo node_modules/playwright
const page = browser.contexts()[0].pages().find((p) => p.url().includes('flow.google.com'));
// click the TUNE settings button, then dump the panel:
// find the leaf whose text is 'Video generation default' and walk ~8 parents up.
```

Ready-made: `node scripts/probe-flow-models.mjs [cdpPort]` (skill-local) prints the panel, the model items
with their selected state, and each clip tile's `model • resolution • duration` line.

* The Agent-settings panel is a side panel, **not** a `.cdk-overlay-pane` — an overlay-only dump reads it
  as empty and looks like "no model control".
* Model rows are `flow-menu-item`; the active one carries `.selected`. Labels include the `Leaving …` tag.
* Clip tiles print `model • resolution • duration` under the prompt (e.g. `Omni 1.2 Flash • 720p • 12s`) —
  the cheapest way to audit what a run actually produced.
* Agent settings still expose **no resolution and no duration control**; duration only travels in the
  prompt text, so a model's real length range is the thing to check, not a dropdown.

## Verified UI facts (2026-10-17, model menu re-mapped 2026-11-09)

* Project sidebar: All media · Videos · Characters · Scenes · Tools · Create tool · Trash. No `/scenes` route.
* Grid tiles: `flow-grid-tile-container`, `aria-label` = media name; hover → `Favorite`, `Reuse prompt`,
  `More options`.
* Tile More-options menu: Favorite · Reuse prompt · **Add to scene** · **Add to prompt** · Download · Copy ·
  Rename · Share · Publish to YouTube · Set project cover · Flag output · Move to trash.
* The clip editor IS the scene editor: `Save frame`, `Add clip`, `Done editing scene`,
  `Skip to previous/next clip`, box `Describe how to edit this video…`, model chip, `Start generation`.
* Tools gallery tabs: My Tools / Community / Templates (Image and Video categories).
* Uploads: header `+ → Upload` takes images and video
  (`.png/.jpg/.jpeg/.webp/.gif/.heif/.heic/.mp4/.m4v/.mov/.3gp/.avi`, no webm).
* Downloads: clips use the `Download media` menu (`270p GIF`, `720p Original`, `1080p Upscaled`,
  `4K Upscaled`); an image opened from the grid downloads from a plain `Download` control in a hover hotbar.
* Clips file under `outputs/videos`, stills under `outputs/images`.

* **2026-11-10 — the agent prompt box was rebuilt.** It is now an Angular **ProseMirror** editor inside
  `flow-creative-agent-prompt-box`; the old `.agent-panel-prompt-box` container is gone. An attached ingredient renders
  `flow-ingredient-chip` → `flow-image-ingredient-chip` → `button.chip-container[aria-label="Ingredient"]` →
  `img.chip-image[alt="Ingredient image"]`. Container-scoped chip selectors then match **nothing**, so every
  `reference_images` call failed with *"Could not attach <name> to the prompt"* **while the chip was visibly attached**
  (10 false failures before I checked the screenshot). Fixed in `src/navigation/flow-ui.js`
  (`INGREDIENT_CHIP`/`INGREDIENT_CHIP_ANY`, additive, legacy scopes kept) + `config/selectors.map.json`. **A chip
  selector failure is a re-map signal, never a retry signal.**
* **Agent settings moved too (same build):** the prompt-box settings control is now the chip
  `🍌 Nano Banana 2.1 crop_16_9 ×2`, and `button[aria-label="Settings"]` (the `tune` icon) is **hidden while the
  Agent/Manual toggle is off (manual mode)** — `applyAgentSettings()` therefore throws `agent settings (tune) button`
  in manual mode. Still unfixed: apply settings in Agent mode first, or click the chip. Watch the ratio silently
  staying at 16:9 and returning 1376×768 instead of the requested square.
* **A Flow *image edit* re-photographs, it does not retouch in place (measured 2026-11-10).** Asking for "remove the
  orange ink, keep framing/crop/scale/lighting identical" on a native crop returned a *wider, zoomed-out* view: print
  smaller and re-centred, folds re-rendered, a sleeve that was not in the frame, and an orange design element deleted.
  FFT cross-correlation of 4 candidates onto their own crop gave NCC 0.25-0.31 with 19-60 px offsets — **no pixel
  correspondence**, so a cloth/patch cut from a Flow edit can never be blended into the original frame. Use Flow image
  edits for whole new frames, never for pixel-local repairs of an existing one.
* **Per-account *Agent* quota is separate from credits.** "You've reached your Flow Agent quota limit … come back
  tomorrow" arrives with 201 credits still on the account. Manual prompting (click the `Agent` chip so `aria-pressed`
  goes false) generates fine on the same account, in ~7 s per pair: paste the prompt in `div.ProseMirror`, attach the
  ingredient, click `button[aria-label="Start generation"]`, then read the finished tiles' `img.thumbnail-image src`
  (signed `flow-content.google` URLs) and fetch them with `curl` — quicker than the Download menu, which sits behind a
  hover hotbar. Switching account = edit `state/accounts.json` `active_index` + a `history` entry, then kill the MCP
  server process and its owned Chrome so it relaunches on the new profile.

## Pitfalls

* **Retiring tiers render as two-line menu items** (`Veo 3.1 - Fast\nLeaving Dec 5`). Fixed in `flow-ui.js`
  `modelLabel()` on 2026-11-09 (first line, trailing "Leaving <date>" dropped), so `Veo 3.1 - Fast` / `Omni 1.1 Flash`
  still select until they disappear; verified live (Fast → Omni 1.2 → restored, 0 credits). A new model label still has
  to be added to `config/flow.config.json` `videoModels` AND `src/utils/video-models.js` (lengths + credits).
* **After editing the MCP source run `node --check` on every changed file and `npm run test:smoke`, not just
  `npm test`.** A quote typo in a tool description (`'Flow's …'`) passed all 83 unit tests but stopped the server from
  starting; every bot's `google-flow` MCP was down for ~15 min (9 Nov 2026) until the smoke test exposed it.
* **Reference-to-video (R2V) on Veo 3.1 - Lite is 8 s only.** Asking for 6 s with `reference_images` makes the agent
  reply with a question instead of a clip (`no_media_generated`, 0 credits); request 8 s or switch model.
* **Flow Music (`flowmusic.app`) shell selector changed (re-mapped 2026-11-02).** `gotoMusic()` waited for
  `a[href="/library/my-songs"]`; the redesigned sidebar no longer renders it, so every call died with
  `UNKNOWN_UI_CHANGE: Flow Music shell (sidebar) did not render` — which is easy to misread as "signed out".
  Live marker is `button[aria-label="New session"]`. Also dismiss Google's cookie banner first (`Agree` /
  `No thanks`) or it intercepts clicks. Check sign-in honestly before declaring a sign-out: load `/settings` and
  look for `<n> available` plus the account email.
* **Flow Music completion detection is unreliable.** A placeholder `Untitled` `/song/<uuid>` appears immediately and
  has no `NN%` node, so `listSongs()`+`generating()` can either call it finished early or never settle (a 300 s
  `GENERATION_TIMEOUT` after the song was in fact produced and billed). Working recipe: click `Generate`, poll until
  no `NN%` text remains, wait ~60 s, read the new song id, then `downloadTrack(format:'WAV')`. One compose song = 5 cr.
* **`flow_symbol`-style handlers that call `browser.close()` at the end kill the CDP-owned Chrome.** In one-shot
  scripts connected over `connectOverCDP`, close only *your* page/window, never the browser.
* **Permission-card deadlock (fixed 12 Nov 2026).** `flow_generate_video` with auto_confirm=true used to wait for the agent's `busy` (stop-button) state to clear before answering the permission card. Flow keeps the stop button visible while it waits for the card, so the card was never answered and Flow cancelled it ("no credits were spent") after ~22 s, and the MCP call timed out at 300 s. Fixed in `src/tools/generate-video.js`: a live unanswered card (Approve, never Always approve) is answered before the busy check. Verified: 12/12 clips approved and billed at 12 credits each. Diagnose with a read-only poll of `flow-permission-message` and the `stop` button every 2 s over CDP before touching selectors. A killed server strands its Chrome singletons; remove SingletonLock/Cookie/Socket before flow_connect.
* **`flow_connect` -> `CDP_PORT_BUSY`:** first check WHO holds it (`ss -ltnp | grep <port>`): if it is Chrome on `browser-profiles/google-flow*`, another Flow MCP client owns the browser — do not connect a second client, wait or work read-only (9 Nov 2026). Otherwise another Chrome (e.g. a different profile's browser) already holds the configured `cdpPort`. Do not kill it; set a free port in `config/flow.config.json` (gitignored) and reload the MCP (kill its `node .../start-stdio.mjs` processes; the next `flow_*` call respawns it with the new config). Identify the owner first with `curl localhost:<port>/json/version` and `ps` on `--remote-debugging-port=<port>`.
* **Flow can burn its own subtitles into dialogue clips** even with "clean frame, no subtitles" in the prompt (and a text-looking line in dialogue makes it likelier). Measure the subtitle windows (white-pixel threshold in a crop, 20 fps) and cover them with brand caption pills sized to the measured box and timed to those windows, or regenerate only if the clip is otherwise unusable.
* **Generated clips drift from the reference garment when the person turns** (front and back came out as different garments); prefer static back-facing or front-facing shots per clip, and reject clips where the hoodie changes. A clip may also come back flagged by the content filter in the agent reply yet still download; read the actual file, not the reply.
* **`flow_connect` can fail on this host** ("Owned Chrome CDP endpoint did not become ready in time") even though an identical manual launch is ready in ~1 s. Workaround that works: launch Chrome yourself with `setsid` and the profile that actually holds the session, plus `--profile-directory=Default --remote-debugging-port=9333`, then drive the `src/tools/*` handlers directly over CDP (check `Default/Cookies` for Google `SID`/`__Secure-1PSID` before trusting a profile). A stale `SingletonLock`/`SingletonCookie`/`SingletonSocket` in the profile makes a new launch exit instantly — delete them first. Killing Chrome: match `readlink -f /proc/PID/exe == /opt/google/chrome/chrome`; never `pgrep -f` on a pattern your own shell command line contains (it kills the shell).
* **Duration in the prompt string is a request, not a guarantee.** "Video length: 4 seconds." produced 4.01 s once and 10.0 s the next time (same settings), billing 15 credits instead of 7. Check `ffprobe` duration and the balance after EVERY paid clip; re-read the balance, never assume.
* **Nano Banana image output is 1024x1024, JPG, no alpha** — that is what the default `1K Original size` download returns. It is fine for review and social, but it is **not a print file**: a 12in/300 DPI print is 3600px, so it needs a 3.5x upscale, and transparency has to be reconstructed by hand. Before treating that as a ceiling, remember `flow_download_latest` also accepts `quality: 1k|2k|4k` and upscales may bill — ask the user before trying one. To reconstruct alpha for white/orange line art, ask for the art on a **flat pure-black field** and key luminance to alpha (`alpha = clip((lum-6)/(70-6), 0, 1)`); it genuinely works (corners come out alpha 0) but the soft bloom keys as a wide halo, so the same brief yielded 12.5% "ink" on one design against 35% on another. A print-bound file needs that halo thresholded afterwards.
* **`quantity` on image generation is a request, not a guarantee.** Asking for 2 returned 1 on every run in a session. Check `image_count` in the result and re-request rather than planning a set around a single call.
* **`flow_connect` fails with "Owned Chrome CDP endpoint did not become ready in time" — check `$TMPDIR` first.** Chrome builds its process-singleton socket at `$TMPDIR/com.google.Chrome.XXXXXX/SingletonSocket` and AF_UNIX paths cap at 108 bytes. the host launches this MCP with a long profile-scoped TMPDIR (observed: another profile's `cache/scratch`), so Chrome died instantly with `FATAL: Socket path too long` and the MCP reported a 10s CDP timeout instead (it only waits 40x250ms). Fix lives in `start-stdio.mjs`: pin `process.env.TMPDIR` to a short owned dir *before* `await import('./src/index.js')`. It must be set before the module graph loads, because **Playwright captures TMPDIR at import time** — setting it later in `ensureOwnTmpDir` fixes Chrome but leaves Playwright's dir behind.
* **Download `ENOENT ... playwright-artifacts-*` right after a paid generation** (the clip/image IS finished and paid — do NOT regenerate): the artifact dir sits under Playwright's import-time TMPDIR, so a scratch prune or a second client with the same TMPDIR deletes it. Same fix as above (short TMPDIR owned by THIS process). **Permanent since 3 Nov 2026:** `start-stdio.mjs` pins `/tmp/flow-mcp-<uid>-<pid>`, one artifacts dir per server, so a leaked sibling can no longer delete your download; servers spawned before that change still share `/tmp/flow-mcp-<uid>`, so check `ps -eo pid,args | grep start-stdio.mjs` before a paid clip and never run two Flow clients against one Chrome — a second client's `flow_connect` can relaunch the browser and kill the other driver mid-job (10 credits were lost that way). Recover for free with `flow_download_latest` once downloads work, in the same client that generated. Verify a fix by timing CDP readiness: a healthy launch is ready in ~0.4-2.5s.
* **A save that dies mid-download does NOT mean the generation failed — recover per tile (9 Nov 2026).** `flow_generate_image` gave `download.saveAs: ENOENT … copyfile /tmp/flow-mcp-1000-*/playwright-artifacts-*` intermittently on a server started that morning, and `flow_download_latest` failed the same way after succeeding once (1536x2752) — so a stale artifacts dir is not the only cause, and the images DO exist in the project. Recover for free by driving the grid over CDP: `map_tiles.mjs <project-url>` (tile index → media id; the newest tile is **not** index 0) then `dl_tile.mjs <project-url> <i> <out> <base>`. Two rules learned the hard way: batch **all** outstanding tiles of an item in ONE node invocation (one call per tile burned a worker's 90-iteration budget and finished 1.25 of 8 items), and never depend on the 2K upscale — take the 768x1376 original and resize to 1080x1920 locally (Lanczos, centre-crop 15 px).
* **Editing the MCP's source does not affect the running server.** the host spawns it once per session; `manage_connections action='enable'` reports status but does not reload it. To reload: kill the `node .../start-stdio.mjs` process and its owned Chrome (match `argv` on the flow profile + `comm == chrome`, never a bare `pgrep -f` — a loose pattern kills your own shell), then call any `flow_*` tool; the host respawns the server on the next call. After a kill, `flow_generate_image` opens a project only when `campaign` matches one it recorded — otherwise you get a NEW project and `flow_download_latest` finds nothing.
* **A bundled edge-tts can return HTTP 403** (old bundled version). A venv with `pip install edge-tts` (7.3.1) works: `edge-tts --voice en-US-AriaNeural --rate=-4% --text ... --write-media out.mp3`. Trim silence, speak sentences as separate files and place them on the beat grid yourself (Edge inserts ~1 s between sentences).
* **Call `flow_connect` first, even for the "local" tools.** `flow_stitch_videos` and `flow_save_frame` run on ffmpeg but
  the server still returns `BROWSER_NOT_CONNECTED` until a session exists. Three rejected calls in a row make the
  client pause the whole server for ~54s — connect once, then batch.
* **Read the credit balance without touching repo config:** `flow_discover_ui` rewrites `config/selectors.map.json`.
  Instead use `flow_accounts refresh_active=true` or `flow-accounts status`, or open the header chip
  `flow-header-user-icon [aria-label="Account details"]` and read `span.credits-count` ("<N> Google Flow credits").
  Escape does NOT close that panel: click the `.cdk-overlay-backdrop` corner (probe scripts belong in `cache/scratch/`).
* **Trash only what you created, and dry-run first:** scene = open the tile, `button[aria-label="Move to trash"]`;
  project = home card `delete` button → dialog → "Delete project" (permanent). Match the exact tile label / project id
  and abort unless exactly one matches. Always get the user's OK first.

* **Video uploads stall behind a one-time rights dialog.** `acceptUploadConsent()` answers it; without it
  the upload silently never completes and looks broken.
* **The confirmation card is `flow-permission-message` / `div[role="radio"]`, not buttons**, and it does
  not appear for every run. Guard spend with `auto_confirm=false` instead of relying on it.
* **Video tiles lazy-load `<video>`** — a missing element does not mean "still queued".
* An `/edit/<id>` viewer that gives no media kind must be classified by file extension.
* Queue waits ("high demand") of a minute or more are normal, not a hang.
* Kill only the real Chrome binary by argv[0] (`/opt/google/chrome/chrome`); a loose `pgrep` has killed
  the assistant's own shell before.
* Chrome needs `DISPLAY`, `XAUTHORITY` and `DBUS_SESSION_BUS_ADDRESS`; the MCP env sets all three.

## References

Skill-local digests (read these first; load with `skill_view(name='google-flow', file_path=...)`):

* `references/prompt-formulas.md` — video/image/edit prompt formulas, worked examples, ingredients and character consistency.
* `references/reels-and-ads.md` — vertical-video rules, hook archetypes, 15–30s structure, disclosure, what Flow does badly + workarounds, which post-generation features actually work in this build.
* `references/video-ad-craft.md` — advanced Omni/Veo craft for apparel: 12 rules, model choice, fabric/motion/lighting vocabulary, orange-gel trick, take budgets, two 15s starter ads.
* `references/apparel-images.md` — Nano Banana for clothing: the three print routes (reference / blank+composite / real sample), reference pack, back-view prompt, K1–K6 starter kit, real-vs-AI tiers.
* `references/flow-tools.md` — how Flow Tools (applets) work, how to build/test/version/vet one, eight tool candidates.
* `references/production-pipeline.md` — finishing stack, QC checklist, folder/naming, music licensing, Canada/Meta/TikTok rules, pipeline v1 and build order.
* `references/credit-hygiene.md` — allowance, per-generation cost table, standing spend rules, which model when.
* `references/account-signin-and-profiles.md` — where a sign-in must happen, launching the human-mode window (display +
  XAUTHORITY + session bus), the os_crypt cookie-wipe trap and its guard, how to prove an account works read-only.
* `references/practice-run-1-findings.md` — first real generations: per-shot results, measured lessons, bugs found, the brand accent colour.
* `references/music-and-beat-sync.md` — Flow Music (Lyria 3.5) workflow and rights, what it really returns vs the prompt, beat detection/sync method and measured accuracy, 8/10 s clips, a character, finished beat-synced drafts.

Sibling skills: `flow-music` (Lyria tracks, prompts, rights, sound identity), `commercial-music-sourcing` (Meta Sound Collection, TikTok CML, paid libraries), `flow-self-improvement` (retro after every Flow session). Also `flow_motion_overlay` draws motion graphics on finished clips.

Deep, cited notes live in the integration repo and are the place to look before a big campaign:

* `docs/research/flow-creative-playbook.md` — 538 lines, 210 citations: creative workflows, prompt
  formulas, ingredients/character consistency, Reels/Shorts/ad structures, what Flow does badly, spend hygiene.
* `docs/research/flow-official-facts.md` — 279 lines: model matrix, Extend/Frames/Scenebuilder rules,
  upload and download limits, the full credit table, content policy, and an uncertainty register for
  everything Google does not publish.
* `FLOW-UI-MAP.md` — the live UI reference (selectors, menus, verified vs documented).

## Verify before claiming success

* `outputs/` is gitignored: `git add` on it fails and aborts an `&&` chain before the commit, so commit docs/skills paths only and confirm with `git log -1`.
* A paid clip is accepted only after ffprobe duration, a Whisper transcript of the dialogue, a frame sheet, and a balance re-read (drop must equal the quoted price). Template: `docs/research/ad-script-and-motion-graphics.md`.
* Foreground shell commands over 600 s are auto-promoted to a background process with a completion notice; chain several clip generations that way and wait for the notice instead of re-running.

```
cd google-flow-browser-mcp-cloud
npm test
ffprobe -v error -show_entries format=duration -show_entries stream=width,height outputs/videos/<file>.mp4
```
