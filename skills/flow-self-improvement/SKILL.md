---
name: flow-self-improvement
description: Improve how you work with Google Flow after every session — prompt writing, model choice, results, feedback, and above all click efficiency. Speed comes from fewer clicks, not faster typing. Run it AFTER a Flow session is finished and the results are sent to the user, then update the Flow skills with what you learned so the next session is better.
version: 1.4.1
author: Muse
license: MIT
metadata:
  tags: [google-flow, self-improvement, speed, workflow]
  related_skills: [google-flow, flow-music]
---

# Flow self-improvement — get better every time you use Flow

The standing instruction: after every session you work with Google
Flow, go back and look at how you behaved with it. What buttons did you press —
could it have been done faster? How optimal was the prompt you wrote? With the
model you chose and the prompt you wrote, what result did you get? Learn from
the feedback the model gives you through its outputs, and improve the prompt
you write for it. Maybe you need to explain more to it. Maybe you need to
attach more references so it gives you a better result. You have to figure
those things out yourself.

## The loop (this is the whole skill)

1. **Work the Flow session** (video/image generation, covers, a Reel).
2. **Send the results to the user and finish the work.** Do not do the retro
   during the work — it would slow down the delivery.
3. **Then run this skill** (the retro below).
4. **Identify the improvement points** — in the buttons you pressed AND in
   the prompts you wrote.
5. **Update the Flow skills** with the proven lessons (google-flow,
   flow-music, google-flow, or this
   skill itself). The log is the scratchpad; the skills are where the lesson
   lives, so the next session actually uses it.
6. **Next session, work better.** Read the log before you start.

## The retro (after delivery, 2-5 minutes)

Write it in the log (your Flow work log).
Two parts — clicks AND prompts.

### Part 1 — Buttons and clicks: could it have been faster?

1. **What was slow?** Name the step that took the longest (a wait, a retry,
   a re-do, a page load).
2. **Which clicks were wasted?** List every click that changed nothing,
   repeated something, or opened a page you did not need. Count them.
3. **What shortcut exists?** For each wasted click, name the shorter path (a
   direct URL, a pill, a menu, a keyboard action, a batch, a local script, an
   asset that was already there).
4. **The 3-click test:** if reaching a control took more than 3 clicks, there
   is probably a direct route. Find it before you do the same path again.

### Part 2 — Prompt optimality: model + prompt → result

For each generation, record three things: the model you chose, the prompt you
wrote (a one-line summary is enough), and the result you got. Then ask:

1. **Was the prompt optimal?** Did the model do what you asked, or did it
   drift? What exactly drifted, and which words in the prompt failed to hold
   it?
2. **What did the output teach me?** The model's output IS its feedback on
   your prompt. Read it as feedback:
   - Print drifted or rescaled → the prompt under-constrained the print
     (add frame-relative size wording, a static camera, an on-model mockup).
   - Scene is wrong or generic → the scene description was weak (name the
     place, the light, the objects, the mood — one concrete detail beats three
     adjectives).
   - Text garbled or misspelled → you asked the model to do something it
     cannot do (never ask it to render text; generate the scene plain and add
     text locally).
   - Wrong product or colour → the reference was missing, wrong, or not
     attached (attach the real site mockup; verify the ingredient chip before
     sending).
   - Face or person changed between shots → the prompt depended on face
     consistency, which Flow is weak at (do not build a Reel that needs an
     identical face across shots).
3. **Did I need to explain more — or less?** Maybe the model needed more
   explanation (a detail you left out). Maybe the prompt was too long and the
   model dropped the middle of it (one shot, one action, one camera move per
   clip; keep it tight). Say which one it was.
4. **Did I need more references?** Maybe one more attached reference would
   have fixed it — a second angle of the mockup, the real logo instead of a
   description, a colour swatch. Or maybe a reference you attached confused
   it (too many ingredients, or a reference that did not match the scene).
   Say which one it was.
5. **Was the model the right choice?** Omni 1.1 Flash vs Omni 1.2 vs Nano
   Banana 2.1 vs Pro vs Lite — did the cheaper model do the job, or did the
   result show you needed the stronger one? (Omni 1.1 is the default for
   video; Nano Banana 2.1 is the default for images; Pro is the pressure
   valve, not the default.)

If a lesson is proven (used successfully twice, or it clearly saves time or
fixes a failure), promote it from the log into the relevant skill — and into
the MCP code if it is a behaviour, not just a note.

## Click-efficiency rules (proven so far)

These are the shortcuts that already work. Do not go back to the long way.

### 1. Direct mode, never the Agent (biggest saver)
The Agent path per generation: open Agent settings, set model/ratio, type
prompt, click SEND, wait for the permission card, click Approve, wait — and
often "Something went wrong", then retry the whole thing (5x on one clip, 3x
on the first cover test). Direct mode: Settings pill, set model/ratio/duration,
paste the prompt, click Start generation. No permission card, no Approve click,
no rewrite, no Agent failures. Standing rule since 2026-11-13: never use the
Agent, video or images. (Implemented in the cloud MCP:
`directImageModeBlock`, direct-first video, direct-retry batch.)

### 2. Batch a whole Reel in one browser task
`flow_generate_batch` makes all 4 clips in ONE browser task, in order, each
downloaded. The old way — one task per clip — paid a project-open, a settings
round and a report for every clip. One round-trip instead of four.

### 3. "Reuse prompt" on a failed tile (1 click, not 5)
A failed tile keeps its prompt AND its ingredients. Click "Reuse prompt" and
it retries with everything attached. The alternative — re-typing the prompt
and re-attaching every ingredient — is 5+ clicks and a re-type. Never rebuild
a failed generation by hand. (A prompt that failed for "unusual activity" is
not a bad prompt. Do not rewrite it — retry it later via "Reuse prompt", or
switch model to Pro.)

### 4. Ingredients come from the asset list, not a re-upload
Mockups already uploaded to the project stay in the asset list. Pick them by
name (search box, 2 clicks). Re-uploading costs a file chooser, an upload and
a transcode wait. The OT cover test (2026-11-13) attached both ingredients
from the asset list and uploaded nothing.

### 5. Navigate straight to the project URL
Go directly to `https://flow.google.com/project/<id>`. Never go Flow home →
project list → click the project (2-3 extra clicks and page loads).

### 6. Download from the tile menu, not the editor
Hover the tile → "Download" submenu → quality. That is shorter than opening
the tile in the editor (`/edit/<id>`, a page load) and using More options →
Download media. Keep the browser window wide: in a narrow window the toolbar
Download button hides, which forces the longer editor route (OT cover test,
2026-11-13).

### 7. The Settings trigger pill is the whole control panel
One click opens the quick-settings popover with model, ratio, resolution,
length and count in one place. Never navigate to a separate settings page.
Length slider = duration − 3. Set it once; do not fiddle with it after.

### 8. Replace a prompt with select-all + paste
Click the prompt box, select all, paste the new prompt. Never delete it
character by character, and never click around the box first.

### 9. Sticky menus: click a harmless item, do not reload
Flow menus are sticky — Escape does not reliably close them. A stuck menu is
closed by clicking a harmless menu item (e.g. "Product help"), not by
reloading the page (a full reload costs far more than one click).

### 10. The "Upload" button trap
Plain clicks on Flow's "Upload" / "Upload media" buttons NEVER surface a file
picker. The working route is to route the granted file through the browser's
file transfer onto the ingredients panel's "Upload media" button. Knowing this
saves many wasted clicks — do not keep clicking Upload hoping it works.

### 11. Generate the scene, add text locally
Never ask the model to render text (it garbles it) and never regenerate
because the text came out wrong. Generate the scene plain, then add all
typography in one local PIL run — one script adds the label and logo to 10
covers at once. Same for video: Flow never writes a brand wordmark — the end card
and all text are built locally.

### 12. Flow Music: generate once, measure, cut locally
The BPM has a ~120 attractor, so the requested BPM is rarely hit. Do not
regenerate to chase a BPM. Generate once, download the WAV, measure the real
BPM, cut locally to whole bars. One generation beats three.

### 13. QC the tile before you download it
View the tile in the editor first and download only the winner. Do not
download every attempt and sort them out afterwards.

### 14. Queue first, then run (MCP loop)
Queue all MCP tasks with `mcp-call.mjs` (fast, local), then run them in one
browser task. Do not alternate queue → browser → queue → browser.

### 15. When the model is blocked, build locally — do not keep retrying
When Nano Banana hit the "unusual activity" flag, covers 7-10 were rebuilt in
PIL from the real site mockups (print pixel-exact by construction) instead of
retrying Flow. Every refusal makes the flag last longer; a local build costs
nothing and ships.

### 16. Decide the colour BEFORE downloading the mockup
The contrast rule already tells you which colour to use (light product on a
dark scene, dark product on a light scene). Decide it first, then download
only that one mockup. Downloading both colourways "just in case" is a wasted
download. (Stay Aromatic practice cover, 2026-11-13: downloaded Black and
Heather Grey, used only Heather Grey.)

### 17. Prefer an on-model mockup for "person wearing" covers
When the composition is a person seen from behind wearing the product, use the
on-model mockup (not the flat) as the reference. The model copies the person
from the reference — same hair, same build, a more consistent and natural
result. A flat leaves the person entirely to the model. A flat is fine for
flat-lay covers. (Stay Aromatic practice cover, 2026-11-13: the on-model
reference's curly reddish hair carried into the generated image.)

### 18. Tile Download submenu first — the editor route depends on window width
The tile's own "Download" submenu does not depend on the toolbar being
visible. The editor route (open the tile, Download media) needs a wide window
— in a narrow window the toolbar button hides and you are forced into More
options → Download media. The browser window kept coming up narrow (500x874)
on two consecutive covers, so "keep the window wide" is not an actionable
rule. Try the tile menu first; the editor is the fallback. (Implemented in
the MCP's `downloadBlock`, cloud-queue.js.)

### 19. No automated print measurement on dark-background images
Thresholding dark pixels to find the garment edge fails when the background
is dark too (the lab, the dorm at night). Do not write a measurement script
for those — use the visual zoom crop: crop the print region, view it enlarged
next to the mockup, and compare the print width as a share of the garment
width by eye. And do the measurement — do not skip it because the script
failed. (Stay Aromatic practice cover, 2026-11-13: the script failed twice
and the step was skipped; the visual check passed, but the step was skipped.)

### 20. Go straight to the collection products.json for a design's mockup
To find a design's handle and image URLs, fetch
`https://your-store.com/collections/<collection>/products.json?limit=250` and
filter by title. Do not grep the site map first — you already know the
collection URL pattern. (Stay Aromatic practice cover, 2026-11-13: an extra
site-map grep bought nothing.)

### 21. Paste the whole prompt at once — NEVER type it character by character
Flow does not care whether you type word by word or paste the whole prompt at
once. Typing a 100-word prompt character by character takes minutes and buys
nothing. Paste the whole prompt at once, then wait 4 s, then click Start
generation. The 4 s wait is the human-like part — the typing is not. (the user,
2026-11-13, watching the browser live: "Google Flow doesn't care if you type
word by word or send the whole prompt at once — send the whole prompt at
once, no need to type. Typing slows you down a lot.") The MCP now says
"paste" everywhere — if any instruction still says "type the prompt", fix it
to "paste". The flag was about instant paste + IMMEDIATE submit, not about
pasting itself; the 4 s wait after the paste is what keeps it human-like.

### 22. After a generation, STOP — do not switch the mode back to Video
When an image is generated and downloaded, the task is done. Do NOT open the
quick-settings popover and switch the mode back to Video (or restore any
settings) before finishing. That switch is wasted work: it only makes sense
if the SAME task's next step is a video generation, and then the next step
sets its own mode anyway. (the user, 2026-11-13, watching the browser live: "when
you generate an image, at the end you go and set the model to Video and then
finish — what extra work is this? When your image is generated, you don't
need to go set the model to Video and then finish the task.") Implemented in
the MCP's `downloadBlock` ("After the download, STOP…") and the dead
`restoreSettingsBlock` function was removed.

### 23. Click briskly between ordinary UI clicks — 30-50% faster
The gaps between one button click and the next are sometimes very long, and
even humans do not click that slowly. As soon as a popover, menu or button
appears, click it right away — do not wait extra seconds between ordinary
clicks. Make the gaps 30-50% shorter. (the user, 2026-11-13, watching the browser
live.) The ONLY deliberate pauses are the two that protect against the image
rate flag: (1) the 4 s wait after pasting the prompt, before Start
generation; (2) the 10 s pause between separate generations. Everything
else — settings popover, model picker, ratio, ingredient attach, download
menu — gets clicked as soon as it is visible. Waiting for a page or a tile to
finish rendering is not a pause to cut; waiting idly between two ready buttons
is. Implemented in the MCP as `clickPaceBlock()` (in the image, video and
batch assignments). Note the limit honestly: the MCP instruction is the lever
I have — the browser planner has its own step latency (observe, decide, act)
that I do not directly control, so the instruction sets the pace, it does not
guarantee it.

## Prompt-writing lessons (seeded)

- Google's formula: `[Cinematography] + [Subject] + [Action] + [Context] +
  [Style & Ambiance]`. One shot, one action, one camera move per clip.
- Print scale is stated in frame-relative words, not garment-relative ones:
  "the text line only about 15 to 20 percent of the frame width" beats "one
  third of the back width". Add a static camera and an on-model mockup
  ingredient for back-print shots. That recipe passed after Flow's floor of
  ~0.42-0.50 of back width.
- Audio goes on separate lines: `Dialogue:`, `SFX:`, `Ambient noise:`.
  Dialogue in colon form.
- Never put character names or ages in a prompt — Flow bakes them in as
  on-screen name labels. Describe people by appearance only.
- Never ask Flow/the LLM to write text — not a brand wordmark, not a headline, not
  a caption. Attach the real logo as a reference ingredient instead (dark logo
  on light garments, light logo on dark garments). Generate garments plain.
- For images: say "keep the garment and its print exactly as shown, do not
  redraw, change, re-spell or restyle the artwork or any text on them" and
  "no text, no words, no letters, no logos anywhere except the prints
  already on the products".
- A prompt that failed for "unusual activity" is not a bad prompt. Do not
  rewrite it — retry it later via "Reuse prompt", or switch model (Pro).

## Results and feedback lessons (seeded)

- QC everything yourself BEFORE sending anything to the user; if you find an
  error, fix it first, QC again, loop until it passes — only then send it.
  (The standing QC process.)
- The user's feedback is the spec: a fresh story every time, never repeat a
  rejected line, the print must match the real product photo in scale and
  placement (measure it, do not eyeball it).
- The mockup rule: for any video/photo of a product, first go to
  your store, download that design's product photos, use them as the
  reference ingredient, and verify the generated print against the mockup.
- A browser-task QC observation can be WRONG — verify mockups and clips
  yourself. Automated PIL print measurement is unreliable on video frames;
  measure from viewed frames with a print zoom crop.
- Credit deductions can lag — plan on the deducted number, not the displayed
  one. The popover footer "Generating will use N credits" is the cost
  contract; read it before sending.
- Human-like timing matters on the 0-credit image model: paste the whole
  prompt at once, then wait 4 s (do NOT type it character by character —
  typing is very slow and Flow does not care; the user, 2026-11-13), pause before
  Start, 10 s between generations, never re-submit the same prompt inside
  ~40 s. On a refusal: stop, reload, wait 10-15 min, retry ONCE via "Reuse
  prompt". Never retry into refusals — every refusal doubles the following
  delay. Full diagnosis:
  `google-flow-browser-mcp-cloud/docs/flow-image-rate-limit.md`.

## How to spot a wasted click — and a weak prompt (the habit)

After a session, replay it click by click and generation by generation, and
ask: Did this click change anything? Could I have skipped it? Was there a
shorter path I already knew? Did this prompt say what I meant, or did the
model have to guess? What did the output show me about what the model
understood — and what it missed? If a click changed nothing, it was wasted.
If a prompt left the model guessing, it was weak. Write both down. The goal
is not to click faster and not to write longer prompts. The goal is to need
fewer clicks to reach the same result, and to write the prompt the model
actually needs — no more, no less.
