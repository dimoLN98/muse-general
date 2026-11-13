# Video ad craft (Omni 1.2 Flash / Veo 3.1 Lite) for apparel — distilled

Long form with URLs: `docs/research/flow-video-ad-craft.md` (§ numbers below). Tags: [G] Google, [C] community/vendor,
[live] verified in this account. **Live findings and the user's standing rules win** (duration via prompt string, Omni 1.2
default at 3 cr/s, Omni Extend only in the UI, Quality only on explicit OK and it retires 2026-12-05).

**Cost figures below were computed on Omni 1.1 per-clip prices.** On Omni 1.2 they no longer hold: 720p is 3 credits
per second (4s = 12, 15s = 60) and 360p is 1/s, so recompute from length × 3 (720p only — the user rejects 360p drafts; ignore any "draft at 360p" idea below) and upscale the
keeper (free ≤10s). Veo 3.1 Lite is still a flat 10.

## The rules that matter most
1. **Open with the camera, one move, then "in a single unbroken scene, no scene cuts."** Omni cuts between angles by
   default; one clause stops it [G]. Want planned cuts? Use timecodes: `[0-3s] … [3-6s] …` (§2.5).
2. **Garment = reference-driven, never text-only.** Text-only invents a lookalike (prints drift, pockets/back logos vanish).
   Attach a real packshot as an ingredient and end with a **pin clause**: "Keep the hoodie cut, colour, print scale and
   position identical to the reference." [C]
3. **The video model never draws the logo, print, captions or CTA.** Composite them from the vector master afterwards;
   Google's own Omni model card says perfectly accurate text "remains a challenge" [G]. For the "subtle science motif"
   prefer simple geometric symbols over letters.
4. **Weight is the realism tell for streetwear.** Heavy fleece: "heavy, thick, structured, slow sway, creases at the
   elbows, visible weave". Avoid "flowing", "smooth", "silky", "pristine". Tee: "soft, supple, rhythmic bounce". [C]
5. **Light is the price tag.** One named source + direction + quality ("hard side light for texture", "overcast daylight",
   "raking light to reveal the weave"). Don't stack "premium cinematic viral". [C]
6. **Audio is direction.** Say "no music" / "no dialogue" when you mean it, or the model scores it itself. [G]
7. **Veo 3.1 Lite ≈ Fast in Google's own eval at half the credits** (Lite won 54.6% T2V, 47.2% I2V). Default Veo = **Lite
   (10 cr)**, not Fast (20). [G model card]
8. **Veo Quality (100 cr) has no ingredients** → with Frames unreachable it is text-only and will invent the product. Use it
   only for product-free atmosphere shots, and only with the user's explicit OK.
9. **Budget 3–5 takes per keeper (easy), 5–10 (hands, garment fidelity, dialogue).** No Flow-specific keeper-rate data exists.
10. **First frame already moving; payoff inside 1 s.** 7–15 s is the paid fashion sweet spot; 30 s rarely wins [C, agency].
11. **Dialogue syntax is disputed** (Google Cloud: colon, no quotes; others use quotes). A/B once on a cheap draft, then
    standardise. Prefer a positive "clean frame, no text" over "no X" (Google disagrees with itself here too).
12. **Never reword a blocked prompt more than twice**; change one risk factor at a time.

## Model choice for Acme
| Need | Use |
|---|---|
| Hook / camera / light tests | test hooks as stills first (free), then Omni 1.2 720p (3 cr/s); no 360p (the user) |
| Real hoodie + a person | Omni 1.2 with reference ingredients; Veo Lite 8 s with ingredients if a flat 10 cr clip is enough |
| Talking UGC line | Omni 1.2 (native lip-sync and multi-speaker; ≤10 words per line) |
| 10–15 s uninterrupted beat | Omni 1.2 only — the only model past 10 s, and it does 15 s in one generation |
| Longer than 15 s | Omni Extend in the UI (+3–10 s, subscribers) then `flow_stitch_videos` |
| Product-free atmosphere | Veo Lite (10); Quality only with the user's OK, and it disappears 2026-12-05 |
| Fix one thing in a good clip | an Omni edit on the same clip (3 cr/s, so 12 for 4 s) vs a re-render at 12/short clip —edit first, it keeps identity |

## Motion / realism
* Walking: "clear foot plants each step, no sliding, visible weight shift, walks three steps then stops". One action per clip.
* Don't ask for tossed objects, fine hand work, mirrors, two people sharing frame, or 360° orbits (use ≤90°).
* Safe camera set: static, slow push-in, slow orbit ≤90°, low tracking, handheld micro-jitter, top-down, macro slide.
* Lens → feel: 16 mm expands, 35 mm natural, 50 mm intimate, 85 mm compresses. Keep print large in frame (small objects get soft).
* Expensive vocabulary (stack ≤3): "large-format sensor, anamorphic lens character, controlled highlight roll-off, rich
  blacks, subtle halation", "35 mm film grain", "slightly crushed blacks, clean highlights", "slight film grain; not overly denoised".
* **Kill the AI look:** matte skin, overcast neutral light (not honeyed golden), handheld micro-jitter, one imperfect beat
  ("camera bumps", "she half-laughs"), textures made *necessary* (raking light + close surface). Generate 2–3, pick the most natural.
* **Black/white + orange:** prompt the **light source**, not the colour: "a single saturated orange gel as rim light grazing
  the floor", one orange source per frame. Never hex/"brand orange" — grade the exact orange in post.
* Lighting setups: clean cyc ("seamless white cyclorama, soft overhead key, gentle rim separating black fabric from the wall");
  texture ("hard side light"); overcast unglamorous; street dusk ("cool blue ambient with warm orange sodium streetlamps").

## Pacing & structure
Cut every 2–3 s; top ⅙ and bottom ¼ clear for platform UI; hook must read silent; alt hooks cut from the same plates (one
agency reports a 40–70% hook spread on identical footage); loop-friendly endings; captions at the edit stage.

## Failure/credit wasters (§8)
Rewording refusals in a loop; re-rolling video for a bad hand (fix the still instead); asking Quality for product shots;
x2/x4 outputs while iterating; re-generating a whole clip when a 3 cr/s edit would fix it; letting the model burn text.
Moderation: realistic people and brand/celebrity names trigger refusals; "university student"/early-20s casting may trip
the child-safety filter (undocumented) — cast "adult, 22-year-old" explicitly.

## Acme starter: two 15 s ads (all 9:16; refs = Nano Banana stills of the real packshots + one adult model sheet)
| Ad | Shots (use-length) | Models | One pass | With retakes |
|---|---|---|---|---|
| A "REVEAL" (no dialogue, sound-off safe) | A1 orange-rim sweep on black fleece (3 s) · A2 hoodie reveal on cyc, push-in (5 s) · A3 dusk street walk, low tracking (3 s) · A4 folded hoodie+tee on plinth, CTA plate (4 s) | Omni ×3, Veo Lite ×1 | 34 cr | ≈129 cr |
| B "CAMPUS UGC" | B1 library selfie line (3 s) · B2 campus walk, handheld (5 s) · B3 colourway smash-cut black hoodie → white tee → black tee w/ orange detail (4 s) · B4 CTA line to camera (3 s) | Omni ×4 | 34 cr | ≈163 cr |
Total ≈292 cr (≈29% of Pro's monthly 1,000); drafting at 360p + free upscale would be ≈169 cr **only if** upscaled 360p
holds for lip-sync and print detail (unverified). Full recipes R1–R15 and per-take kill criteria: research doc §4 and §9.
Kill-criteria per take: print/closures identical to ref? cloth has weight? no burned captions? no unwanted music? hands/face
stable at frame 1/mid/last? no cut where "single scene" was required? text-free frame?

## Open questions needing a live test (don't assume)
Reference-image cap per Omni generation; whether the UI accepts tag syntax like `<IMAGE_REF_N>`; how good 360p→1080p
upscale really is for lip-sync and print detail; colon vs quotes dialogue; whether Omni reference *videos* are exposed in
the Flow UI.
