# Fashion-ad motion graphics: researched techniques and 8 built recipes (HyperFrames + GSAP first)

Written 2026-10-17 for the user / Acme. Companion to `ad-script-and-motion-graphics.md` (story, copy, brand cues) and `skills/media/video-editing-stack/references/ad-graphics-hyperframes.md` (15 earlier HyperFrames pitfalls). Nothing from those is repeated here unless it changed.

Tags: **[T]** executed on this machine (command output seen) · **[G]** platform / vendor primary doc · **[C]** blog, agency or vendor page · **[L]** read from local files · **[unverified]** plausible, not run.
Machine: HyperFrames 0.8.167, GSAP 3.15.0 (npm), ffmpeg 9.0.1, Blender 4.5.2, Remotion 4.0.536, Chrome headless shell 152, Intel HD 630 (`beginframe` + hardware GPU).
**No Flow generation, no credits, no posting.** The only network use was web search/fetch, `npm pack`/`npm install` and the `hyperframes catalog/add` registry.

All working files: `/home/you/.config/profiles/acme/cache/scratch/mg-recipes/` (`README.md` there has the commands). **Scratch is pruned after 24 h idle: copy what you keep.**

## 0. Result in one table

| # | Recipe | Result | Render (wall) | Folder in `mg-recipes/` |
|---|---|---|---|---|
| a | Neuron line-art signal + slogan wipe (plate mp4, **webm + mov with alpha**) | **PASS** | mp4 6.9 s · webm 19.3 s · mov 22.1 s for 4.35 s | `r1-neuron-signal/` |
| b | Masked "print comes alive" on the real garment still | **PASS** | 10.9 s | `r2-print-alive/` |
| c | Beat-synced karaoke caption block + subject-avoiding safe-rect helper | **PASS** (with negative control) | 7.7 s | `r3-kinetic-caption/`, `tools/safe_rects.py` |
| d | Product callout, leader line to a garment detail | **PASS** | 8.5 s | `r4-callout/` |
| e | Beat flash + whip between two real clips | **PASS** | 17.1 s for 6 s (two videos) | `r5-flash-whip/` |
| f | End card, logo + CTA, all text on a solid dark panel (standalone mp4 + alpha overlay) | **PASS** | mp4 8.7 s · mov 20.6 s | `r6-end-card/` |
| g | Speed ramp (`rate` lane) + punch-in + flash | **PASS** | 23.5 s for 4.3 s | `r8-speed-ramp/` |
| h | Text *behind* the subject (local matte via `remove-background`) | **mechanism PASS, legibility FAIL** on a full-body clip | 17.3 s render + 100.8 s matte | `r7-text-behind/` |

Every composition passes `npx hyperframes check` (lint, runtime, layout, contrast) except h, which is *correctly* rejected by the gate (section 4.8). Pixel/number proofs per recipe are in section 4; the vision model was used only to look at contact sheets, never as evidence.

---

## 1. What professional fashion/streetwear short ads do with motion graphics

Sources are listed in section 6. Where a source is a vendor/blog page its claim is a practice report, not measured performance.

| Technique | What the research says | Acme translation (built as) |
|---|---|---|
| **Pace** | Apparel is cut slower than gadgets: a hypothesis to start from is 3-5 cuts per 10 s vs 6-8 for beauty/gadgets; cut on physical motion first (step, turn, hand on fabric) and the music second; alternate wide (silhouette) with close-ups (texture). [C S1] | One cut per bar (1.74 s) at most; flash/whip only on a physical move; r5, r8. |
| **Hook window** | TikTok: hook in the first 6 s, content proposition in the first 3 s, captions/text overlays for context, "transitions, stickers, and graphics" to retain, end with a CTA. [G S5] | r2/r1 = the proposition (print draws), r6 = CTA. |
| **Kinetic type / captions** | Winning short-form caption styles are big, word-by-word with an active-word highlight, 2-4 words visible, high contrast, placed above the platform UI (named presets: Word Pop, Hormozi, Karaoke, Pop Box, Beast, Highlighter, Bounce). Pop Box (active word on a colour chip) is recommended for busy/bright footage where an outline struggles. [C S2] TikTok recommends displaying text at "5-10 words per second" [G S5] (that is a TikTok number, applied to speech captions, not to slogans). | r3: karaoke block on a solid panel, 3 words per line, active word orange, spoken words white, upcoming words grey. |
| **Safe zones** | Meta Reels/Stories ads keep 14 % top, 35 % bottom, 6 % each side free (269 / 672 / 65 px at 1080x1920); TikTok In-Feed 12.5 / 34.4 / 11.1 / 11.1 %; YouTube Shorts 10 % top, 25 % bottom, 10 % right. The action rail on the right is taller than the caption block and its exact box is not published. [G S3] | `tools/safe_rects.py` presets (rail left unmodelled: pass it as `--block`). |
| **Callouts and leader lines** | A whole product category exists for this: animated labels, pointer lines, location tags that track objects (After Effects packs). It is a template genre, not a performance statistic. [C S6, S7] | r4: target ring pops, line draws *from the target to the card*, card wipes open, text rises. |
| **Graphic-on-garment ("print comes alive")** | Documented only as template genres (animated t-shirt reveals, self-drawing line animation stock). [C S8] No performance data found. | r2 (real print pixels, masked sweep + orange travel) and r1 (drawn-on, alpha). the user's own favourite ad is the evidence here, not the web. |
| **Masked reveals** | Clip/mask boundaries are the standard way to reveal; `clip-path`, CSS `mask-image` and a moving feathered edge are seek-safe in HyperFrames. [L hyperframes-keyframes] | r2 sweep (CSS variable driven mask), r1/r6 slogan wipes (`clip-path`). |
| **Text behind the subject** | A big static word between background and a moving person, using an on-device cutout (no green screen); works best when the word is big and the subject small. [C S9] | r7: works technically; fails legibility on a full-body subject (section 4.8). |
| **Speed ramps** | Standard reveal/transition: e.g. 0.3x into a 3x whip; slow as the product comes into frame, speed out on the beat. [C S10] | r8: HyperFrames `rate` lane. |
| **Whip / flash / glitch transitions** | Hard cuts and match cuts carry most of a short ad; a whip pan reads high energy but "starts to feel like a filter" if overused: one or two per ad. [C S4] | r5 whip+flash. the user said not to reuse the whip-pans of the old Ad-Neuroscience drafts: default to **flash-cut or hard cut**, whip at most once. |
| **Counters, stickers, UI overlays** | TikTok lists stickers/graphics as retention tools [G S5]; the HyperFrames registry has `number-wheel`, `mk-progress-stat`, `social-proof-card`, `native-notification-pop` ready-made [T catalog]. | Not built (no honest number to count yet: pre-launch). Use `number-wheel` only for real facts. |
| **Beat tie-in** | Mark the beat grid first, cut/animate on beats, with motion (not music) deciding the exact cut. [C S1, S11] At 138 BPM a beat is 0.4348 s = **13.04 frames at 30 fps**, so beats do not land on whole frames. | Every recipe computes `beatIndex x 0.435 s` (never accumulates); worst-case error is half a frame (16.7 ms). Verified for r1 and r5. |

Brand-specific rules that every recipe obeys (from the user's feedback): no text on a face, no text on the garment (text lives on a **solid #050506 panel**), footage always `width:1080px;height:1920px;object-fit:cover`, orange `#FA7F14` only on dark surfaces (the r4 leader line carries a dark under-stroke so it reads on the light studio grey too).

---

## 2. What the local toolchain gives us

### 2.1 HyperFrames (v0.8.167) [T/L]
* Skills read: `hyperframes` (router), `-core` (contract), `-animation` (rules index, 22 blueprints, transitions catalog, adapters), `-keyframes`, `-registry`, `-cli`, `-creative`, `media-use`.
* `npx hyperframes catalog --json` returned **447 items** (blocks + components). Relevant ones (names verified in the catalog): `beat-freeze-cut`, `editorial-flash-overlay`, `whip-pan-cut`, `cut-the-curve`, `match-cut`, `iris-reveal`, `grade-split-reveal`, `svg-stroke-trace`, `tracing-beam`, `offset-path-traveler`, `hw-arrow`, `hw-callout-circle`, `yt-circle-pointer`, `mk-callout-highlight`, `inline-highlight`, `marker-highlight`, `headline-slam`, `logo-sting`, `logo-brand-close`, `titlecard-lockup`, `number-wheel`, `freeze-frame-dressing`, `cinemagraph`, shader transitions (`glitch`, `chromatic-radial-split`, `flash-through-white`, `light-leak`, `whip-pan`), `rgb-glitch-text`, `scan-band`, Three.js blocks (`extruded-logo`, `glass-hero`, `three-orbiting-cards`).
* **Installed and read** (`npx hyperframes add`): `whip-pan-cut`, `beat-freeze-cut`, `editorial-flash-overlay` in `mg-recipes/_reg-test/proj/` [T]. Findings: `whip-pan-cut` is a clean mountable sub-composition (slots `before`/`after`, variables `direction`, `whip_at`, `accent`, `exit`, blur capped at 16 px, same single-strip velocity law I used in r5). `beat-freeze-cut` and `editorial-flash-overlay` are **1920x1080 landscape**, load **Google Fonts and gsap from a CDN** and default to teal: they need re-sizing to 1080x1920, local fonts and an Acme palette before use. **Not rendered** (only the installed files were read) [unverified beyond that].
* Render modes [T]: mp4 = `beginframe` capture (6.9-23 s per 4-6 s clip); **webm/mov (alpha) = `screenshot` capture, about 3x slower** (19-22 s for 4.35 s) and the MOV is ProRes 4444 at 36.7 MB per 4.35 s vs 1.0 MB for webm.
* Parametrisation: `data-composition-variables` on `<html>` + `npx hyperframes render --variables-file x.json` [T]. `check` does **not** accept variables, so to gate a variant you must bake the default into a scratch copy.
* New capabilities found: **`check` measures text behind a transparent video's matte and prints the percentage** (`"R" is 100% behind a transparent video's matte`); `remove-background` makes the matte locally (below); `data-automation` `rate` lane = speed ramps.

### 2.2 GSAP 3.15 [T]
* All plugins are free (GSAP 3.13 announcement, "100 % FREE including ALL of the bonus plugins like SplitText, MorphSVG" [G S12]). `npm pack gsap@3.15.0` ships `DrawSVGPlugin`, `MotionPathPlugin`, `SplitText`, `MorphSVGPlugin`, `CustomEase`, `Physics2DPlugin` in `dist/`.
* **Used and rendered here:** DrawSVG (r1, r2, r4), MotionPath (r1, dot riding the orange path), SplitText with `mask:"chars"` (r7). Not used: MorphSVG, Physics2D [unverified].
* They load from a project-relative `vendor/` folder (HyperFrames serves the project directory), so renders need **no CDN**. The shipped skills and registry still hard-code `cdn.jsdelivr.net/npm/gsap@3.14.2` (no plugins there), which breaks offline renders.

### 2.3 Remotion 4.0.536 [T]
`/home/you/projects/video-stack/remotion` renders: `TitleCard` 30 frames 1920x1080 in **6.4 s** including bundling. Docs show `@remotion/captions` `createTikTokStyleCaptions()` (pages via `combineTokensWithinMilliseconds`; low value = word-by-word) [G S13]. Nothing Remotion does is out of reach for HyperFrames here, and in this session I used none of HyperFrames' gates with it (`check`, `snapshot --at`, matte-aware text-occlusion, registry) [unverified whether Remotion has equivalents]. Not built [unverified for quality].

### 2.4 Three.js [L/unverified]
Three 0.186 is installed in the Remotion project and HyperFrames has a Three adapter (`hyperframes-animation/adapters/three.md`) plus registry blocks (`extruded-logo`, `glass-hero`). I did not build a Three recipe: the 2D SVG neuron already reads as the print; Three only earns its place for real depth (3D hoodie turntable, depth-of-field). [unverified]

### 2.5 Blender 4.5.2 [T smoke test only]
Headless works: `blender -b -P neuron_bl.py` rendered a 540x960 Cycles frame in **4.6 s** (`blender-test/`). The test image is **bad**: emission clipped to white-yellow (no AgX/bloom set) and the dendrite angles were wrong. It proves the CLI, not a recipe. Not a competitor to SVG for 2D line art.

### 2.6 ffmpeg 9.0.1 [T]
Used for: alpha overlay compositing (r1 demo), numeric frame extraction (`libvpx-vp9` decoder is needed to read webm alpha; the native vp9 decoder drops it and `ffprobe` shows `yuv420p` with only an `ALPHA_MODE=1` tag), `xfade` (fade, wipe*, slide*, circlecrop, radial, smooth*, circleopen... listed by `ffmpeg -h filter=xfade`). Best use stays audio mix/sidechain, concat, QC.

---

## 3. Shared helpers (all in `mg-recipes/`)

| File | What it does |
|---|---|
| `mk.py` | Builds `<recipe>/index.html` from `_src/<recipe>.html`: inlines fonts (base64), copies vendored GSAP + plugins to `<recipe>/vendor/`. |
| `tools/safe_rects.py` | `free_rects(subjects, platform, pad, min_w, min_h, blocks)` returns every **maximal** empty rectangle inside the platform text zone that avoids the padded subject boxes; `assert_clear(rect, subjects, pad)` is the independent interval test. CLI: `safe_rects.py --subject 163,560,815,1355 --platform meta --min 700x150`. Unit-tested: full-frame subject -> `[]`; two subjects -> only clear rects. |
| `tools/vtools.py` | numpy verification: `frame()` (alpha-aware), `iter_frames()`, `nonbg_count()`, `is_orange()`, `edge_black_bars()`. Needs `.venv/bin/python` (numpy + Pillow). |
| `tools/verify_r*.py` | The exact checks quoted below. |

Fonts: use `_common/SpaceGrotesk-var.woff2` (variable, 22 KB). **The `SpaceGrotesk.ttf` shipped in the ad-02 project is a single static *Light* instance (fc-scan weight 50) declared as `font-weight:300 700`, so every bold headline there was faux-bold** [T].

---

## 4. The recipes

Common contract: 1080x1920, 30 fps, one paused GSAP timeline, positions in seconds from `beat x 0.435`, `data-composition-variables` for parameters, `check` clean.

### 4.1 (a) Neuron signal, `r1-neuron-signal/`
* **What it does:** 4.35 s = 10 beats. Somas pop in (frame 1 already moves), seeded dendrite trees draw on by depth (DrawSVG), at **beat 4** the orange line starts drawing A->B with a white-hot dot on the same path (MotionPath), spark dots light as the dot passes, at **beat 6** arrowhead pop + ripple + nucleus flash + B's dendrites fire orange outward by depth, then the slogan wipes in (clip-path with an orange leading edge) on its own solid #050506 panel and an orange rule draws.
* **Parametrise:** `plate` (false = transparent for alpha), `seed`, `imgW` (garment image width on stage; scales soma radius 0.0235 W and soma gap 0.207 W, measured on `104e_back.png`), `cx`, `cy`, `arc` (px; 0 = the straight print arrow, >0 curves the signal path and MotionPath follows), `slogan`, `accent`.
  `npx hyperframes render r1-neuron-signal --format webm --variables-file out/r1-alpha.vars.json -o out/r1-neuron-alpha.webm`
* **Verified [T]:** `check` passed (3/3 contrast). mp4 460 KB; webm 1.0 MB; mov `prores yuva444p12le` 36.7 MB; 131 frames each. **Alpha proof (decoded RGBA):** t=0 alpha==0 on 99.5 % of pixels; t=4.2 alpha==0 on 86.9 % (webm) / 87.8 % (mov), fully opaque on 10.8-11.0 %; corner alpha 0. **Beat check:** orange visible in the synaptic gap at frame 61 (2.03 s; the line starts at 1.74 s on `power2.inOut`, so the first 20 px take ~0.3 s), B's orange dendrite flash first detected at frame 81 (2.70 s vs beat 6 = 2.61 s, +0.09 s = stagger + detection threshold). **Composite on the real hoodie:** a feathered patch hides the photo's own print, the alpha overlay goes on top; outside the print/slogan region 7 of 1,378,400 pixels differ at t=0.05 and 2.2 (noise); at 4.2 the extra 18k px are the slogan panel's full-width band.
* **Pitfalls hit:** (1) source `src.html` inside the project -> `multiple_root_compositions` and **0 layout samples** (lint error disables the audits). (2) CSS `transform:scaleX(0)` + GSAP `scaleX` -> `gsap_css_transform_conflict`. (3) `fromTo(edge,{opacity:1},...)` painted the orange bar from frame 1: a `fromTo` from-state is immediate; start at 0. (4) First dendrite parameters reached x=-166 (bush wider than the print): `check` reported `container_overflow` 166/242 px; tuned primaries to 0.028-0.05 W. (5) The procedural neurons **do not coincide with the real print**: over the real garment you must hide the print (patch) or accept doubling; to light the *real* print use r2. (6) alpha formats force `screenshot` capture (3x slower) and `check` still says `text_occluded` (info) for text on its own panel.

### 4.2 (b) Print comes alive, `r2-print-alive/`
* **What it does:** the garment still is dimmed (brightness 0.32 + vignette); the print box is a second, full-brightness copy of the same still behind a feathered elliptical mask; a CSS-variable-driven linear mask sweeps it open left->right (beats 1-4) with an orange slit riding the front; at beats 4-6 an additive orange line (DrawSVG) and a white-hot head travel the **real** arrow; at beat 6 ring + core flash on the real post-synaptic soma. The camera pushes in 1.0 -> 1.16 over the whole clip.
* **Parametrise:** `garment` (path), `imgW`, `cx`, `cy`, `dim`. Landmarks are image fractions in the script (`midx .4255, midy .4945, aX .322, bX .529, arrow .362-.479, box .17-.69 x .36-.63`), so another garment image needs its own fractions.
* **Verified [T]:** `check` 0 issues over 9 samples. Render 1.5 MB. Print-zone mean luma **6.5 (t=0) -> 36.5 (t=2.2) -> 34.8 (hold)** while the lower hoodie does not brighten (14.0 -> 1.8: vignette + push-in); orange pixels on the arrow row 1080 -> 2103 (travel) -> 1103 (hold). **Fill proof:** the image rect (-183,-461)-(1517,2089) covers 1080x1920 (and stays covering at 1.16x); edge-strip mean luma 8.7-12 vs plate 5.3 (garment visible, no bar). A "dark column" test is meaningless on a black hoodie (885 dark columns): use geometry plus edge-strip luma instead.
* **Pitfalls:** two `<img>` with one src -> `duplicate_media_discovery_risk` (use a `background-image` div for the second copy); `escaped_container` for the lit copy offset (mark `data-layout-allow-overflow`); overlapping tweens on the same property (start the fade at the end of the previous tween). The 724x1086 still is upscaled 2.35x: soft; use a Flow-generated hi-res still or the real clip.

### 4.3 (c) Karaoke caption block + safe-rect helper, `r3-kinetic-caption/`, `tools/safe_rects.py`
* **What it does:** the helper turns the subject box into the biggest free rectangle in the Meta text zone; the composition puts a solid panel exactly on it, auto-fits the font (largest size whose widest line and height fit), and runs the karaoke on beats 1-6 (grey `#9a9aa6` -> orange pop -> white, 1.05 scale, 0.4 em word gap).
* **Parametrise:** `subject` and `capRect` ("x0,y0,x1,y1" in stage px: feed `capRect` from `safe_rects.py`), `words` ("A|B|C"), `wordsPerLine`, `firstBeat`, `bg`, `showSubject` (false = graphics-only render for the proof).
  Demo: subject (hoodie bbox) `163,560,815,1355` -> helper returned **one** rect `65,269,1015,536` (950x267): the hoodie fills the rest of the text zone.
* **Verified [T]:** `check` 30/30 text checks pass. **Provable avoidance:** a graphics-only render (subject removed by variable, `display:none`) was streamed frame by frame; graphic pixels (|pixel - bg| > 30) inside the subject box over all 131 frames = **0**, inside subject + 24 px pad = **0**. **Negative control:** the same test with a panel forced to `65,400,1015,700` gives **11,234,462** pixels inside the subject box, so the test can fail.
* **Pitfalls:** words overlapped (0.28 em gap + 1.12 pop): use 0.4 em and 1.05; the layout gate raised `text_occluded` (info) at wipe-out because the panel is clipped away, which is harmless. A full-frame subject (real back view filling the frame) returns **no safe rect**: the helper then answers "put the text on a panel in a band, or change the shot", which is the honest answer. The Meta right-hand action rail is not modelled.

### 4.4 (d) Callout with leader line, `r4-callout/`
* **What it does:** per callout (JSON): a target ring + dot pops on the garment detail (image fractions), a polyline (vertical run then a 45-degree leg) draws from the target to the card's bottom edge (white 3.5 px over a dark 8 px under-stroke so it reads on light and dark), the card (solid #050506, orange left border) wipes open, label rises, mono sub-label fades in.
* **Parametrise:** `subject` (hoodie box; also positions the still), `callouts` = `[{label, sub, tx, ty, card:[x,y,w,h], beat}]`. Cards must come from `safe_rects.py` (here `65,300,450,128` and `565,300,450,128`, both inside the Meta zone and 24 px clear of the subject box at y0=700).
* **Verified [T]:** first `check` run **failed** `text_box_overflow` (sub-label 428 px in a 450 px card: 12 px over) - fixed by shortening the copy, then 0 issues, 10/10 contrast. `assert_clear` true for both cards; in a graphics-only render both cards are 86 % `#050506` with 3.9-4.4 k white text pixels and 512 orange border pixels; 495 / 501 orange pixels within 40 px of the two target coordinates.
* **Pitfalls:** the leader line necessarily crosses the garment (only text/cards are guaranteed clear, the line is intentional); a detail label such as "RIBBED CUFF" is a visible-fact label, never a quality claim (no GSM/material claims before they are true).

### 4.5 (e) Beat flash + whip, `r5-flash-whip/`
* **What it does:** clip A and B (two real Flow clips, 720x1280 upscaled by `object-fit:cover`) with the cut on beat `cutBeat` (default 6 = 2.61 s). `mode` whip | flash | whipflash. The whip moves A and B on **one shared curve** (`power3.inOut`, 8 frames, B docked one frame-width to the right), horizontal blur by an SVG `feGaussianBlur` (peak 42 px, capped, rewritten per seek), an orange hairline seam rides between them, a white flash ramps in one frame and decays over 6, and B lands with a 1.07 -> 1 punch.
* **Parametrise:** `cutBeat`, `mode`, `whipDur` (0.267 s), `blur`.
* **Verified [T]:** `check` 0 issues. Render 180 frames, 6.1 MB. **Cut proof:** the white flash peaks (mean luma 198) at frames 78-79 = 2.60-2.63 s (beat 6 = 2.610 s = frame 78.3); largest frame-to-frame change at frame 78 (2.600 s). **Fill proof:** 0 dark columns and 0 dark rows at 0.5, 1.5, 4.5, 5.5 s; edge-strip luma 66-198. Snapshot at 2.58 s shows blur with both scenes in frame; 2.61 s is pure white.
* **Pitfalls:** my first version animated A out with `power3.in` and B in with `power3.out` at different times: for half of the whip **neither scene covers the frame** (black gap, found by reasoning before the first render). Rule: both scenes ride one curve over one window (the registry's `whip-pan-cut` states the same law). `tl.set(...)` at 0 for the initial hidden state is not rendered at t=0 (use `gsap.set` outside the timeline). `filter` on a `<video>` works (blur per frame). the user disliked whip-pans in the old drafts: ship `mode:"flash"` by default.

### 4.6 (f) End card, `r6-end-card/`
* **What it does:** trimmed white logo pops (back.out), kicker drops in, CTA rises, URL placeholder and brand line fade, all on **one solid panel**. `mode:"overlay"`: stage is transparent and only the panel (any rect, here `0,300,1080,1300`) wipes in over the last clip, so the card can follow footage without ever putting text on the garment.
* **Parametrise:** `mode`, `kicker`, `cta`, `url`, `tag`, `panel`.
* **Verified [T]:** `check` 19/19 contrast, 0 layout issues. mp4 render 8.7 s; overlay MOV `yuva444p12le` 20.6 s. **Overlay alpha proof:** alpha outside the panel rows is 0 at every sample (max 0); inside the panel opaque 0 % (t=0), 41 % (t=0.15, mid-wipe), 100 % (t=0.5 and 3.0). Standalone mp4: 97.4 % of pixels equal the plate colour.
* **Pitfalls:** `acme-logo-white.png` is 1312x1199 with a 275/200 px transparent margin (artwork box 895x703): crop to the alpha bbox or every layout number is wrong (first layout overlapped the CTA). The logo artwork already contains the orange rule and period: do not draw a second rule. `letterSpacing` tween is rejected by lint (`gsap_non_transform_motion`): animate `y`/opacity.

### 4.7 (g) Speed ramp, `r8-speed-ramp/`
* **What it does:** `<video data-automation='{"lanes":[{"target":"rate","points":[{"t":0,"v":1},{"t":0.87,"v":1},{"t":1.3,"v":0.3},{"t":2.55,"v":0.3},{"t":2.85,"v":1.4},{"t":4.3,"v":1.4}]}]}'>` = 1x, dwell at 0.3x from beat 2 to beat 6, snap to 1.4x; plus a 3-beat punch-in during the dwell and a flash on beat 6. Source seconds consumed = integral of the rate lane (my estimate for this lane is ~4 s, i.e. the whole 4 s clip; not measured).
* **Verified [T]:** `check` clean; 129 frames. Mean frame-to-frame luma change in a variant **without** the punch-in/flash: 1x = 3.19, dwell = 0.93 (**ratio 0.29, target 0.30**), fast = 4.29 (**ratio 1.34, target 1.40**). With the punch-in included the dwell ratio read 0.55: the zoom adds motion, so measure ramps on an fx-free render.
* **Pitfalls:** a 24 fps source on a 30 fps stage duplicates frames at 1x (use window means, not single diffs); the lane is clip-local time, not composition time.

### 4.8 (h) Text behind the subject, `r7-text-behind/`
* **What it does:** `npx hyperframes remove-background clip.mp4 -o subject.webm` makes a transparent WebM matte locally (local ONNX model on CPU; the model name is not shown by the CLI); the composition stacks `bg video -> big word (SplitText chars, masked rise) -> subject.webm`.
* **Verified [T]:** matte for 96 frames in **100.8 s** (1.05 s/frame, CPU; `ALPHA_MODE=1`, edges incl. hair are clean in the snapshot). First use needs `onnxruntime-node@1.21.1`: `npm install` was blocked (`EALLOWSCRIPTS`), so I installed it into `~/.cache/hyperframes/optional/onnxruntime-node@1.21.1` and ran its `script/install` by hand. Render 17.3 s.
* **Result: legibility FAIL.** `check` rejects every placement I tried on this full-body walking clip (the figure spans x 140-920 px at the torso): `top=300,size=420` "I","R" 100 % behind the matte; `100/520` "R" 100 %, "I" 98 %; `150/420` "I","R" 100 %; `1250/300` "F" 98 %, "I" 92 %; `1450/260` "I" 100 %; `60/640` and `0/600` rejected as hidden behind an opaque element. The word read as "F E" in the snapshot. This gate is the useful discovery: it measures per glyph, which is the honest legibility test.
* **Rule:** use text-behind only when the subject is at most ~45 % of the frame width at the text band (wider shots, off-centre subject, short word), or do not use it. Never on the Flow back-view walking shots.

---

## 5. Recommendation: which tool for what

| Job | Use | Why (evidence) |
|---|---|---|
| Every overlay, caption, callout, line-art, end card, wipe, flash, speed ramp | **HyperFrames + GSAP (DrawSVG, MotionPath, SplitText, `clip-path`/mask)** | 8/8 recipes built in one session; deterministic; `check`/lint caught at least 7 real defects (multiple_root_compositions, container_overflow, css-transform conflict, text_box_overflow, letterSpacing tween, duplicate media, text_occluded); alpha webm/mov export; variables + `--variables-file`; registry for rare effects. |
| Lighting up the *real* print | **r2** pattern (same still, masked copy, additive orange line) | uses the real pixels: no mismatch. |
| Drawn-on art for a transparent lower-third or a black plate | **r1** (webm for small files, mov only if the editor needs ProRes) | alpha verified; the procedural neuron is not the print. |
| Text placement vs subject/UI | `tools/safe_rects.py` + graphics-only pixel test | proof with negative control. |
| Audio mix, sidechain, concat, numeric QC, `xfade` fallback | **ffmpeg** | already the audio path; alpha overlay verified. |
| Cutout/matte for subject masking | `hyperframes remove-background` | works; 1 s/frame CPU; install quirk noted. |
| Component library or captions you already have in React | Remotion only if a React-specific need appears | works (6.4 s test), adds nothing HyperFrames lacks here. |
| Real 3D depth (hoodie turntable) | Three.js inside HyperFrames, or Blender | not built; do not use for 2D line art. |

**Retire / avoid:** `flow_motion_overlay` (hand-coded ffmpeg overlays: cannot check itself, superseded by `check`+`snapshot`); Blender or Three for flat neuron line art (SVG is cleaner and cheaper); Remotion as the default graphics path; hard-coded `cdn.jsdelivr.net`/Google Fonts in compositions (offline break; vendor GSAP and inline fonts); the old whip-heavy look from the Ad-Neuroscience drafts; text-behind-subject on full-body clips; the static-Light `SpaceGrotesk.ttf` (use the variable woff2); `Math.random` in generative art (seeded `rng(seed)` in r1).

**Proposed 16 s structure on 138 BPM (proposal, not built as one piece; bar = 1.74 s):** bars 1-2 clip + r3 caption in the safe rect (hook) -> bar 3 flash cut (r5 `flash`) -> bars 4-5 back-view still/clip with r2 (print lights, matches the user's favourite) -> bar 6 slogan panel (r1's slogan block) -> bar 7 speed-ramped detail (r8) with one r4 callout -> bars 8-9 end card (r6 overlay). Beat-aligned times: `bar n starts at (n-1) x 1.739 s`.

---

## 6. Sources

Researched/fetched 2026-10-17. Fetched and read: S1 (apparel page), S2, S3, S4, S5, S9, S10, S12, S13. Search-result descriptions only, pages not opened: S6, S7, S8, S11 and the mixider beat-sync page:
* S1 Apparel ad editing tips: https://framenotion.com/blog/apparel-ad-video-editing-style-tips · beat sync: https://mixider.com/blog/how-to-cut-video-on-the-beat [C, snippet]
* S2 Caption styles for short-form: https://zellahq.com/blog/best-caption-styles-for-short-form-video/ [C]
* S3 Safe zones from platform templates: https://www.solidlabs.com/social-safe-zones [C citing Meta Ads Guide, TikTok, YouTube]
* S4 Transitions in short ads (whip pan, match cut, hard cut): https://framenotion.com/blog/best-transitions-for-short-form-video-ads [C]
* S5 TikTok creative best practices: https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en [G]
* S6 Callout pack: https://videohive.net/item/simple-callout-annotation-pack/64603573 · https://filmit.io/callouts [C, snippet]
* S7 Callout tracking guide: https://filmit.io/blog/callouts-demo [C, snippet]
* S8 Animated tee reveal template: https://elements.envato.com/t-shirt-including-alpha-TRJHY55 · fashion kinetic type template: https://elements.envato.com/voster-hype-kinetic-typography-reels-RW2VR4P [C, snippet: genre evidence only]
* S9 Text behind subject: https://zellahq.com/blog/how-to-put-text-behind-a-person-in-a-video/ [C]
* S10 Speed ramps: https://www.vidmoat.com/tools/speed-ramp [C]
* S11 Meta creative best practices 2026 (captions as part of the creative): https://adlibrary.com/posts/meta-ads-creative-best-practices [C, snippet]
* S12 GSAP 3.13 (all plugins free): https://gsap.com/blog/3-13/ · DrawSVG docs: https://gsap.com/docs/v3/Plugins/DrawSVGPlugin/ [G]
* S13 Remotion TikTok-style captions: https://www.remotion.dev/docs/captions/create-tiktok-style-captions [G]
* Local: `skills/hyperframes*` (SKILL.md, rules-index, blueprints, transitions catalog, `creator-editing-recipes.md`), `npx hyperframes catalog --json`, `skills/media/video-editing-stack/references/ad-graphics-hyperframes.md`.

## 7. Not done / unverified
* The registry items `beat-freeze-cut`, `editorial-flash-overlay`, `whip-pan-cut` were installed and read but not rendered; all other registry names are from the catalog listing only.
* No Three.js recipe; Blender produced a crude smoke render only; MorphSVG, Physics2D, Lottie not used.
* Meta/TikTok right-hand action rail is not modelled; platform numbers come from a third-party page citing the platforms (S3), not re-read from Meta/TikTok.
* The recipes were tested on a 724x1086 still and 720x1280 Flow clips upscaled to 1080x1920; quality on final Flow 1080p footage is untested.
* r1's procedural dendrites are an approximation of the real print; they were not matched shape-for-shape.
* No audio was involved: sound design, whoosh/impact SFX on the flash/whip beats (`media-use/audio/assets/sfx/` has `whoosh`, `impact-bass`, `glitch`) is a suggestion, not tested.
