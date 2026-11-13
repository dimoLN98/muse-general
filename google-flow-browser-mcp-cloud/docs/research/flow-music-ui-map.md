# Flow Music (flowmusic.app) UI map

Mapped live on 2026-10-17 in the signed-in Chrome (CDP 9333), account first@example.com, plan PLUS (Google AI Pro
benefit), model Lyria 3.5. Everything is tagged: **[live]** observed in this session, **[documented]** read on a Google/Flow
Music page, **[unverified]** inferred or not exercised. Driver code: `src/tools/flow-music.js` (every selector below is used
there). Scratch evidence (screenshots, downloaded WAV/MP3/M4A/zip/mp4, probe scripts):
`cache/scratch/music-map/` (probe scripts `p*.mjs`, `g*.mjs`, downloads in `dl/` and `live/out/`).

## 0. Verdict first: exact length and tempo

- **There is no real length, tempo, key or structure control.** [live] The compose panel's "Advanced" switch only exposes
  BPM, Length, Seed and Model; the UI turns BPM into the text `, <n> bpm` appended to the Sound prompt and Length into a
  `[End - m:ss]` line appended to the Lyrics. Lyria treats both as hints. [live, see §7 table]
- **Length field:** accepts 1:00 to 3:00 only (smaller values are clamped to 1:00, bigger to 3:00 on blur). Returned tracks
  overshoot: asked 1:00, got 62.5 s, 62.9 s, 66.4 s. Without it tracks were 1:56 to 3:00. Asking for 0:16 in the lyrics tag
  or prose returned 2:19. A natural end is always a fade tail (last 2-3 s below -60 dB). [live]
- **Tempo:** the model has a strong 120 BPM attractor. "120 bpm" gave 120.0 (text) or 123.8 (Advanced + Length), "140" gave
  143.8, "100" gave 105.4, but "90" gave 120.0 twice (Advanced field and plain text). First test by the main agent asked for
  120 and got 126 and 122. Tempo is steady inside a track (measured 120.03 over 138 s). [live, measured with beat-sync.js
  analyseTrack on the downloaded WAV]
- **So the method for an exact length is: generate anything, then cut.** Cutting is free:
  1. local and sample-exact: download WAV (0 credits), `shortenTrack()` = analyseTrack + ffmpeg cut of whole bars from the
     first kick (16.0 s at 120 BPM = 8 bars = 32 beats). [live: 15.996 s from a 138.7 s track, kick 11 ms after the cut]
  2. in-app: song menu > Remix > Trim, Start/End in 0.1 s steps, 0 credits, makes a new library song
     "<title> (trim a-b)". [live: 0:00.4-0:16.4 gave 16.000 s, 0:00.3-0:16.7 gave 16.405 s]
  3. by chat: "Trim the track to the first 16 seconds" makes Producer run the same trim tool (0 credits, 2-3 s). [live]
- To get a tempo other than 120 you must **measure** what came back and pick the nearest bar length; do not trust the
  request. Re-roll (5 credits) if the grid is off. A tempo-exact alternative would be uploading your own click/beat and
  using Remix Cover/Extend (Audio upload is live per the Updates dialog) [documented, unverified].

## A. Global shell

| Item | Selector / URL | Notes |
|---|---|---|
| Logo | `a[href="/"]` | Home feed (Explore: Songs/Playlists/Videos/Spaces, Featured, Grid/List toggle, starter cards) [live] |
| Search | `button[aria-label="Search"]` | Opens input `input[placeholder="Find songs, playlists, and people"]` [live] |
| Collapse sidebar | `button[aria-label="Close sidebar"]` | [live] |
| New session | `a[href="/session"]` | Fresh Producer chat + compose panel [live] |
| Songs | `a[href="/library/my-songs"]` | Library list, tabs "Library" / "Favorites" (`/library/favorites`) [live] |
| Playlists | `a[href="/library/playlists"]`, `/library/favorite-playlists`; expand: `button[aria-label="Expand Playlists"]` | "New playlist" dialog: Generate from prompt / Upload image / Name / Description (0/500) / Create [live] |
| Spaces | `a[href="/library/spaces"]`, `/library/plugins`, `/library/favorite-spaces` | "New space" starts a Producer session ("Let's create a space together") at `/session/<id>?t=true`; it is a vibe-coding tool for custom instruments/music apps [live+documented]. Costs 0 credits to open. |
| Music videos | `a[href="/library/videos"]` | "New music video" dialog: videos up to 2 min, pick song, subject image + style image; "Credits are required ... can be expensive" [live text] |
| Projects | `a[href="/projects"]`; `Expand Projects` | "New project" dialog: image, Prompt, Name, Description (0/250), Create [live] |
| Profile | `a[href="/<username>"]` (`/tonalflourish`) | Plays/likes/followers, tabs Songs/Playlists/Music Videos/Spaces; only published songs listed [live] |
| Turntable | `a[href="/turntable"]` | A/B preference voting game: "Vote for the sample that better matches the prompt. Rating boosts your personalization, improves our models, and earns you credits." Needs 10 s listening per side; intro dialog "Let's go". Not needed for production [live] |
| Session list | sidebar links `a[href^="/session/"]` | Titles like "Today at 11:35 PM" or first prompt [live] |
| Settings menu | `button[aria-label="Settings menu"]` (text "<user> / PLUS") | Items: Theme, Account settings (`/settings`), Customize Producer, **"N credits"** (`a[href="/settings"]`), Invite friends, Submit to Featured, Updates, Try Google Flow, Discord, Pricing, Learn more (Docs, Help, Discord, X, Instagram, Manage cookies, Report legal issue, Privacy policy, Terms of service, Privacy notice, Attributions), Log out. Never click Invite friends / Log out / Pricing [live] |
| Plan badge | text "PLUS" in the Settings button | [live] |
| Diamond badge | sidebar `button` with a diamond icon and a number (1, 2, 3), next to "Invite" | NOT the credit balance. The number rose 1 -> 3 as songs were made; looks like a progress/points counter linking `/personalize`. [unverified] |
| Invite | sidebar button "Invite" | do not click |
| Credit balance | Settings menu item "10480 credits"; `/settings` shows "N available" | The menu value is cached and lagged by one generation in tests; `/settings` is authoritative. `getCredits(page, {fresh:true})` reads `/settings` [live] |
| Player bar | bottom: `Play previous track`, `Play <title>`, `Play next track`, `Enable shuffle`, `Enable repeat`, `Open player queue`, `Adjust volume`, `Full screen` | Queue panel says "Queue is empty" until songs are queued [live] |

Routes seen [live]: `/`, `/session`, `/session/<uuid>`, `/session/<uuid>?t=true`, `/song/<uuid>`, `/library/my-songs`,
`/library/favorites`, `/library/playlists`, `/library/favorite-playlists`, `/library/spaces`, `/library/plugins`,
`/library/favorite-spaces`, `/library/videos`, `/library/favorite-videos`, `/projects`, `/turntable`, `/settings`, `/pricing`,
`/<username>`, `/privacy`, `/privacynotice`, `/terms` (redirects to policies.google.com/terms), `/docs` (redirects to
support.google.com/flow/answer/17083868), `/oss/attributions.txt`, `/docs/faq/availability` [documented link].

## B. Producer chat and compose panel

### B1. Chat composer (a session page)

| Control | Selector | Notes |
|---|---|---|
| Message box | `textarea[aria-label="Chat message"]` (placeholder "Ask Producer..." in a session, "Let's create..." on home) | [live] |
| Send | `button[aria-label="Send message"]` (disabled while empty) | While Producer works the send button becomes a square stop button (no aria-label) [live] |
| Add menu | `button[aria-label="Add audio or image"]` | Menu: **Live > Recording** ("Record audio into session"), **Upload > Audio** ("Use your music to create (max 40mb)"), **Upload > Image** ("Use image to inspire lyrics or cover art"). Hidden `input[type=file]`: audio accepts `audio/*` plus .mp3 .wav .m4a .aac .flac .ogg .opus .aiff .mp4 .mov .webm and ~40 more, single file; image `image/*`, single file [live] |
| Chat settings | `button[aria-label="Chat settings"]` | Menu: Customize Producer ("Progress, memories, and more"), Instrument ("Frontier music models": Lyria 3.5), Ghostwriter ("World class lyric writing": Standard), Producer ("Standard or fast thinking": Standard) [live] |
| Voice mode | `button[aria-label="Voice mode"]` | opens a voice conversation; not exercised [unverified] |
| Thoughts | text "Thoughts" (click) | Expands the Producer's tool log: `Created "<title>"`, `Applied audio effects`, `Saved lyrics`, the exact Sound/Lyrics sent, `Seed: 759816` [live] |
| Header icons | `Toggle compose panel`, `Toggle session songs`, `Share session` | Share session dialog: "Anyone with this link can see your username, messages, and any songs not set to Private" + Share link. Do not click Share link [live] |
| Suggestion chips | appear under Producer replies, e.g. "Add a heavy bassline", "Export this track now", "Extend the outro out", "Isolate the vocals", "Remix the beat", "Add dreamy synths" | Plain text buttons that send that sentence to Producer; contextual, not a fixed set [live] |

Producer can do edits by chat (all [live]): "Trim the latest 1:00 instrumental ... to exactly the first 0:16 seconds" ->
"Trimmed the track to the first 16 seconds", new song "<title> (0:00-0:16)", sub-label "Audio effects", 0 credits, 34 s total
including the model round trip. "Split the stems for ..." happens when you use Split stems from the menu. Documented
prompts: "Shorten the intro to 4 bars", "Add a bridge before the final chorus" [documented]. Producer prompts that
generate music cost 10 credits per prompt (2 takes) [live, from the Usage ledger: -10].

### B2. Compose panel (right column; open with `button[aria-label="Toggle compose panel"]`)

On a fresh `/session` the panel is closed. It is open when `textarea[aria-label="Sound description"]` is visible. On the
home page `Open compose panel` is covered by an overlay (click intercepted): always use a session page.

| Section | Control | Selector | Notes |
|---|---|---|---|
| Lyrics | text | `textarea[aria-label="Lyrics"]` | When Instrumental is on it shows the placeholder "Instrumental". Supports tags like `[Instrumental]`, `[End - 1:00]` [live] |
| Lyrics | Instrumental | `button[role=switch][aria-label="Toggle instrumental mode"]` | `aria-checked` true/false [live] |
| Sound | prompt | `textarea[aria-label="Sound description"]` (maxlength 3000) | Free text style prompt [live] |
| Sound | Advanced | `button[role=switch][aria-label="Toggle advanced sound mode"]` | Reveals "Dynamics" [live] |
| Dynamics | BPM | `label:text-is("BPM") ~ input` (maxlength 3, placeholder "Auto") | accepts 20, 120, 400, rejects letters; appended as `, <n> bpm` to Sound [live] |
| Dynamics | Length | `label:text-is("Length") ~ input` (placeholder "Auto") | m:ss. Normalises on blur: "30" -> 3:00 (seconds are NOT supported as plain numbers: "90"->3:00, "45"->3:00, "2"->2:00 minutes), "0:30"/"0:45"/"0:59" -> 1:00, "3:01" -> 3:00, "1:30" stays, "1:01" stays. Appended as `[End - m:ss]` to Lyrics [live] |
| Dynamics | Seed | `label:text-is("Seed") ~ div input` (placeholder "Auto") + a dice button | Fixed seed (Producer logs "Seed: 759816") [live] |
| Dynamics | Model | button with text "Lyria 3.5" (`aria-haspopup=menu`) | Items: **Lyria 3.5** "Top performing, flagship model", **Lyria 3 Pro** "Legacy model" [live] |
| Details | title | `textarea` under "Details" (`button[aria-label="Expand Details section"]`) | song title; also "Upload image" and "Prompt image" (cover art) [live] |
| Footer | Generate | `button:has-text("Generate")`; Ctrl+Enter shortcut (tooltip "Generate CtrlEnter") | trash icon button on the left clears the form [live] |

Does NOT exist [live]: key / scale field, time signature, vocal gender, exclude/negative styles, weirdness or creativity
sliders, structure editor, "make loop" mode. Key and structure can only be prose in the Sound prompt (hint only).

### B3. Generating and detecting completion

- Compose panel Generate: 1 song, 5 credits, 20-38 s. A row titled "Untitled" appears immediately with "Generating
  Untitled..." and a leaf text node `NN%` that climbs ~4 % per second; the URL changes `/session` -> `/session/<uuid>`;
  when the percentage node disappears the row shows the real link `a[href^="/song/<uuid>"]` and the title (compose panel
  generations keep the title "Untitled" unless Details > title is set). Detect completion as: new `/song/` id and no `NN%`
  node for 3 s. [live, 5 runs]
- Producer chat prompt: 2 takes "<title>" and "<title> (Take 2)", 10 credits, Producer messages stream in. [live, first test]
- Credits post a few seconds after the song appears (fresh balance read right at completion was stale by 5). [live]
- Errors: no error banner was ever triggered, so no verified selector. Candidates `[data-sonner-toast]`, `[role=alert]` are
  collected by the driver on timeout. [unverified]
- Concurrency limit is 12 on PLUS [documented, /pricing]. Never tested.

## C. Results, song menu, edit modes

Row selectors (session or library) [live]: container = nearest ancestor of `a[href="/song/<id>"]` that holds
`button[aria-label^="More options"]`; `button[aria-label="Play <title>"]`, `Like <title>`, `Dislike <title>`,
`Remix <title>` (opens the Remix menu), `Download video for <title>`, `Share link for <title>`,
`More options for <title>`, `div[aria-label="Open details for <title>"]`. In a session the per-song buttons appear on hover.

### C1. "..." menu (role=menu, items role=menuitem)

| Item | Submenu / action | Verified |
|---|---|---|
| Remix | **Start session** (opens `/session/<uuid>?t=true` with the song's Lyrics/Sound loaded into the compose panel, no charge), **Cover**, **Replace**, **Extend** (each opens an edit panel, see C2, nothing is generated until Generate), **Use prompt** (loads the song's prompt into the compose panel, no charge), **Variation** (**generates immediately, 5 credits, no dialog**: made "<title> (Remix)", 62.9 s, 123.8 BPM), **Trim** | [live] |
| Details | Privacy (Link only), Edit details (name, cover art, displayed lyrics [documented]), Go to session, Pin to profile | [live] |
| Download | **Download video**, **Get stems**, separator, **M4A**, **MP3**, **WAV** | [live] |
| Share... | Copy link, Share song via... | [live] never clicked |
| Add to... | Playlist, Queue | [live] |
| Split stems | direct action, see C3 | [live] |
| Report | Send app feedback, Report legal issue | do not click |
| Delete | direct action on the song (library bulk Delete asks "Delete N tracks? This action cannot be undone") | used only on own songs |

Open a submenu by hovering the parent item (`menuitem.hover()` then wait ~600 ms); `Escape` twice closes everything.

### C2. Edit panels (Remix > Cover / Replace / Extend), compose column in "edit mode"

Layout [live]: song name, timer `0:00 / 1:02`, `button[aria-label="Close edit mode"]`, mode dropdown (COVER / REPLACE /
EXTEND, switches mode), mini waveform with a draggable region, play button, `button` "SETTINGS" (popover), Instruction
textarea (`textarea[aria-label="Instruction"]` for Extend/Cover), "Edit Lyrics", collapsible "Source Lyrics", "Advanced"
(only Seed), "Details", Generate.

- **Extend** [live UI, generation not run]: the SETTINGS popover has "Extend from / Start time for the extension" and
  "Extend until / End time"; default region on a 1:02 clip was 0:32.5 to 1:32.5, label "Extend 0:32-1:32" (so a 60 s
  extension from the middle). Setting from = clip end and until = from + 16 s could append a short segment, but whether the
  result is only the new segment or the whole clip is [unverified] (no generation budget left).
- **Replace** [live UI]: region default 0:16.3-0:46.3 "Replace 0:16-0:46", `button[aria-label="Add region"]`, textarea
  "Describe the changes for all regions...". Regenerates only the region. [unverified outcome]
- **Cover** [live UI]: Instruction "Instruction for how to change the sound or lyrics", **Strength** slider "How much to modify
  the song" (More Similar <-> More Different). [unverified outcome]
- Documented behaviour: Cover transforms the style keeping structure; Replace/Extend edit a highlighted section;
  upload of your own audio (beats/instrumentals) can be remixed with these [documented, Updates dialog 2026-07-16].

### C2b. Trim dialog (the useful one)

`Remix > Trim` opens `[role=dialog]` "Trim Song - A new version will be saved to your library": play button, title,
`Copy playhead timestamp` / `Copy duration timestamp` buttons, **inputs[0] = Start**, **inputs[1] = End** (format m:ss or
m:ss.t), a **Loop** switch (preview loop), waveform with two handles, **Cancel** / **Trim**, `Close dialog`.
Pitfalls [live]: (1) the dialog resets Start/End to the full range when the waveform finishes loading, so wait until End
shows the real duration plus ~1 s before typing; (2) set End first then Start (an End below the current Start produced a corrupt "-1:-1" Start in one probe); (3) Tab or Enter commits a field. Trim completes in ~1 s and the new song
(`<title> (trim <start>-<end>)`, sub-label "Audio effects") appears in the session and library. 0 credits. Stems/segments:
tenths are honoured (0:00.4-0:16.4 -> 16.000 s measured, 48 kHz).

### C3. Split stems [live]

"..." > Split stems (not a submenu) posts the Producer message `Split the stems for "<title>" (clip id: <uuid>)`, shows
"Splitting stems..." and, after ~13 s (33 s end to end including download in the module test), a stems card: rows Drums,
Bass, Other, Vocals (each with M, S buttons and `button[aria-label="Options for <stem> track"]` menu: Details, Download stem,
Share..., Add to..., Report, Delete), waveform, Play, and a download icon whose **title** (not aria-label) is
`Download tracks (zip)`: `[title="Download tracks (zip)"]`. The zip holds 4 files `<title>_drums.m4a`, `_bass.m4a`,
`_other.m4a`, `_vocals.m4a`, AAC 48 kHz stereo, same duration as the song (16.000 s for a 16 s song, ~2.4 s download).
Each stem also becomes a library entry "<title> - drums" with label "Stem" (appears in Songs; clean up after use).
Cost: balance unchanged after both splits (10505 -> 10505 and 10480 -> 10480) [live]; the Usage ledger names one
"Stem Separation -5" entry but total spend matched 5 per generation exactly, so treat stems as 0-5 credits [unverified split].

### C4. Song page `/song/<uuid>` [live]

Cover art, author link, relative time, plays/likes counters, title (editable textbox for the owner), Play, Like, Dislike,
Remix (`button[aria-label="Remix"]`), Share (`button[aria-label="Share"]`), a "..." button without aria-label, **Publish**
(top right, never click), then SOUND (the exact prompt incl. appended `, 120 bpm`), Lyrics (e.g. `[Instrumental]` and
`[End - 1:00]`). There is no BPM / key / length / model readout on the page; the length is only in the player bar
(`0:00 ... 1:03`). Details submenu does not show BPM/key either.

## D. Library pages

- **Songs** `/library/my-songs`: rows with art, title, sub-line (prompt text, or "Audio effects" for trims, "Stem" for stems),
  duration at right, Like, Dislike, "..." and a checkbox `button[aria-label="Select song"]`. Selecting shows "N selected"
  with **Add to playlist**, **Delete**, **Download** (batch zip per documentation), `Clear selection`. The "Library" dropdown
  button was not clickable by the probe (`button:text-is("Library")` timed out). No sort control was found. [live]
- **Search** (`button[aria-label="Search"]`): input "Find songs, playlists, and people"; result layout not captured. [live partial]
- **Playlists / Projects / Spaces / Music videos**: all empty on this account; the New dialogs are described in A. Creating
  one was not needed and was not done. [live]
- **Music video** [live + documented]: the Download video menu item opens "Pick a template to create your video" with
  **Music video** (NEW, AI generated, needs credits: the New music video dialog says "Credits are required ... can be
  expensive. Upgrade to Member for a free video"; model per the Updates dialog: Gemini Omni Flash with lip sync), **Modern**,
  **Player**, **Simple**. Simple rendered and downloaded in 37-40 s, 0 credits, **720x1280 (9:16) H.264 24 fps + AAC 48 kHz**,
  duration = audio length + ~2.5 s (16.0 s audio -> 18.58 s file). The AI "Music video" template was not run.
  Settings > "Visible watermarking" (Off) adds a visible AI mark to images/videos.
- **Turntable**: see A.

## E. Download paths (all [live], measured with ffprobe)

| Option | How | Result | Time | Credits |
|---|---|---|---|---|
| WAV | row "..." > hover Download > click `WAV` | PCM s16le, **48 kHz stereo**, 1.536 Mb/s; 16.0 s = 3.7 MB, 2:30 = 30 MB. The file also carries an mjpeg cover-art stream: ffprobe lists 2 streams, strip with `-map 0:a -c copy` | 2.7-5.7 s | 0 |
| MP3 | same, `MP3` | MP3 **128 kbps** (not 320), 48 kHz stereo, + cover stream | ~2.8 s | 0 |
| M4A | same, `M4A` | AAC LC ~120 kbps, 48 kHz stereo, + cover stream | ~2.4 s | 0 |
| Get stems | "..." > Download > Get stems, or the stems card zip button | zip of 4 AAC m4a stems | ~2.4 s after split | see C3 |
| Download video | "..." > Download > Download video > template | mp4 720x1280 24 fps | 37-40 s | 0 for Simple |
| Batch | Songs library select > Download | zip of selected [documented] | not run | |

Playwright: arm `page.waitForEvent('download')` before the click, then `download.saveAs()`. The suggested filename keeps the
title with `:` replaced by `_`. The download does not open a new tab. No SynthID/watermark mention appeared in any dialog
(Google's pages say generated audio carries SynthID [documented elsewhere, unverified here]); an audible watermark was not
detected (not analysed).

## F. Limits and rules

- Plan PLUS (benefit of Google AI Pro): 10,000 monthly credits (~2000 songs), Daily top-up credits, **12 concurrent
  generations**; Free 2 / Starter 3,000 credits 8 concurrent / Member 30,000 16 concurrent [live, /pricing].
- Balance at start of my work 10520; end 10480. Usage ledger on `/settings` lists Subscription Top Up 10000, Bonus 500,
  Daily Free 30, and per-session debits. [live]
- Rules text: Google Terms of Service (`/terms`): "Some of our services allow you to generate original content. Google won't
  claim ownership over that content." Plans table lists "Publishing", "Stem downloads". Commercial use: Google AI Pro / Ultra
  include Flow Music Plus / Member benefits with commercial use rights [documented, third-party summary of Google pages];
  licence eligibility, third-party rights and lyric/likeness clearance remain the user's responsibility. Settings has
  "Moderate lyrics: Generate clean lyrics only" (Off), "Help improve Google Flow Music: Allow your content to be used to
  improve Google Flow Music" (On), "After Hours: allow the agent to suggest music edits and remixes while you are away; no credits" (On). [live]
- **Google One consent banner**: late in the session a dark top banner appeared: "Grant access to your Google One
  subscription to use your benefits. [Grant access]" (also `Agree | No thanks | Grant access` buttons on /settings). Plan
  badge still said PLUS and credits kept working, but it was NOT clicked (rule: no consent prompts). The user should decide
  whether to grant it; if benefits drop, the banner is the cause. [live]
- Age (18+) and region requirements [documented, support.google.com/flow/answer/17083868].

## G. Workflows (step by step)

1. **Open a private window**: `openMusicWindow(browser)` (Target.createTarget newWindow). Never use a flow.google.com tab.
2. **Generate one instrumental (5 credits)**: `/session` > open compose panel > Instrumental on > Advanced off (or on with
   BPM) > fill Sound > Generate > wait for new `/song/` id and no `NN%`.
3. **Download WAV**: row hover > "..." > Download > WAV (event armed first).
4. **Make it 16 s beat-aligned**: `shortenTrack({input, output, targetSec:16})` or `trimInApp(...)` then download.
5. **Stems / video**: `splitStems`, `downloadVideo(template:'Simple')`.
6. **Clean up**: Songs library > select > Delete > confirm "Delete N tracks?" (irreversible; only for own experiments).

## H. Measured generations (all instrumental, this account)

| # | Route and settings | Asked | Got length | Measured BPM | Credits |
|---|---|---|---|---|---|
| 0 | Producer chat (main agent) "30 s, 120 BPM" | 0:30 / 120 | 2:30, 2:57 (take 2) | 126 / 122 | 10 |
| 1 | compose, Advanced BPM 120 + Length 1:00 | 1:00 / 120 | 62.5 s | 123.7 | 5 |
| 2 | compose, Advanced off, Lyrics `[End - 0:20]` (a leftover `[End - 1:00]` also present) | 0:20 / 120 | 115.9 s | 123.8 | 5 |
| 3 | compose, Advanced BPM 100 + Length 1:00 | 1:00 / 100 | 66.4 s | 105.4 | 5 |
| 4 | compose, Advanced off, `[End - 0:16]` + timestamped prose + "total length 16 seconds" | 0:16 / 120 | 138.7 s | 120.03 | 5 |
| 5 | compose, Advanced BPM 90, no length | - / 90 | 162.7 s | 120.06 | 5 |
| 6 | compose, text "90 bpm", Advanced off | - / 90 | 179.6 s | 120.05 | 5 |
| 7 | module `generateTrack`, Advanced BPM 140, no length | - / 140 | 70.2 s | 143.8 | 5 |
| 8 | Remix > Variation of #1 | - | 62.9 s | 123.8 | 5 |

Tail check: #1, #3, #4, #8 end in digital silence below -60 dB for the last 2-3 s (a fade), none ends on a hit. Start: kicks
are present within the first 5-15 ms of every track I cut, no leading silence ("starts on beat 1" in the prompt may help,
unproven because there was no A/B). Producer Trim by chat and in-app Trim both gave exact lengths.

## I. Pitfalls

- `page.screenshot` on the second window sometimes times out on "waiting for fonts"; use `Page.captureScreenshot` via a CDP
  session as fallback.
- Hover is needed to reveal row buttons in sessions; menus close on `Escape`, a second `Escape` closes submenus.
- The same title appears for many songs ("Untitled", "Minimalist Streetwear Ad"); always address songs by uuid.
- A new song row is added at the bottom of the session list; `listSongs` returns DOM order, newest last.
- Remix > Variation, Cover/Replace/Extend Generate, New space/new session can start model work; only Variation does it
  with no confirmation.
- Leaving the compose panel state: Advanced/Instrumental switches are per session and reset on a fresh `/session`; the
  driver always sets them explicitly.
- Library stays cluttered: each stem split adds 4 "Stem" entries and each trim a new song.
- Do not click: Upgrade, Buy Credits, Invite, Publish, Share link, Report, the Google One "Grant access" banner.

## J. What was NOT verified (so nobody assumes)

- Result of Extend / Replace / Cover generations (UI mapped only; generation budget of 8 was used on the length/tempo study).
- Chat-route `generateTrack({via:'chat'})` completion detection (compose route and chat Trim/Split were tested; chat
  generation of two takes was only done once by the main agent).
- AI Music video template (credit price), Spaces creation, Playlists/Projects creation, Publish, batch Download zip, Voice mode.
- Error banners and the 12-concurrent queue behaviour.
- Whether uploading your own click track and using Cover/Extend can pin the tempo and length exactly.

## K. Driver functions (src/tools/flow-music.js) and live results

| Function | Purpose | Live result |
|---|---|---|
| `openMusicWindow(browser)` / `getMusicPage` | reuse or open an own window on flowmusic.app | OK, reused the open window; `closeMusicWindow` closes it |
| `gotoMusic(page, route)` | SPA navigation + sidebar wait + login-wall check | OK |
| `getCredits(page, {fresh})` | menu or `/settings` balance | 10485/10480 matched /settings |
| `listSongs(page)` | `[{index,id,title,href}]` | OK in session and library |
| `generateTrack(page, {...})` | compose route (chat route [unverified]) | OK 38 s, id returned, BPM 140 applied |
| `downloadTrack(page, {...})` | WAV/MP3/M4A + ffprobe | WAV 70.15 s 48 kHz; MP3 128 kbps 48 kHz |
| `trimInApp(page, {...})` | Remix > Trim | OK after fixing the load-reset race: 16.405 s for 0:00.3-0:16.7 |
| `splitStems(page, {...})` | stems zip + unzip | OK 4 m4a, 33 s |
| `downloadVideo(page, {...})` | Simple/Modern/Player mp4 | OK 720x1280, 39.6 s |
| Pure: `parseTime`, `formatTime`, `normalizeLength`, `buildMusicPrompt`, `planBeatAlignedTrim`, `buildTrimArgs`, `safeName` | no browser | asserted in scratch tests |
| Local: `probeAudio`, `trimTrack`, `shortenTrack` | ffprobe/ffmpeg + beat-sync | 138.7 s -> 15.996 s, kick at +11 ms, 48 kHz |
