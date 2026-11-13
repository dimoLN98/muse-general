# Apparel imagery with Nano Banana in Flow — distilled

Long form with URLs: `docs/research/flow-image-apparel-craft.md`. Tags: [G] Google, [C] community, [live] verified here.

## Route B compositing that actually looks printed (measured, 2026-10-17)

* **Blur radius must be ~1/5 of the artwork's stroke width, never scaled blindly with the upscale factor.**
  Compositing at 3x, a 5.5-unit stroke on a 1000-unit grid lands at ~5 px, while a "soft edge" blur of
  `2.4*k` = 7.2 px is WIDER than the stroke: it bleached pure white to ~130/255 and turned `#F7820F` into
  brown. Fine line-art and small caps die first. Use `blur = max(0.6, 0.35*k)`.
* **A blank-garment plate is ~1 MP whatever the ratio** (Flow 16:9 = 1376x768). Upscale 3x before compositing
  so the *vector* art stays crisp and legible; expect the garment itself to stay soft at full zoom.
* **Make the ink follow the cloth or it reads as a sticker.** Multiply ink brightness by the garment's own
  luminance (shade the print 10-20% in folds) and modulate ink *alpha* with two octaves of band-limited
  noise (fine = weave, coarse ~3x = black knit showing through white ink). A high-pass of an already-upscaled
  plate carries no texture — generate the grain instead.
* **Place the print by homography, not by a rectangle.** Map the art onto a 4-corner quad so the print tapers
  with the garment. Then QC placement **analytically against the measured silhouette** (threshold the CLEAN
  plate for the garment, compare quad bounds to shoulder line / hem / side seams) — do not try to detect ink
  inside the finished mockup, background and shadow masks will fool you.
* **Normalise artwork scale across a range:** each print file should have its *longest* side at a fixed % of a
  square canvas, or the same quad makes some designs look tiny and others huge.
* **Wearer's left chest = the viewer's RIGHT side of a front view.** Verify the sign numerically (logo centre x
  vs garment centreline), not by eye — vision reviewers get this backwards.
* **Placement numbers that worked** on a 1376x768 side-by-side plate (front left, back right, garments at
  x 65-622 and 752-1310, hem y~690, shoulder line y~150): back quad `[[896,272],[1166,272],[1184,588],[878,588]]`
  = 55% of garment width, 122 px clear of the shoulders and 103 px clear of the hem; chest logo quad 76x59 px
  at `[[394,192],[470,192],[470,251],[394,251]]` = ~3.2 in wide, clear of the drawstrings.

## The rules
1. **Never let the model invent the print.** Anything a customer buys against gets its print from the art file: either a
   reference the model copies (route A, checked) or composited onto a generated blank garment (route B).
2. **Use Nano Banana 2.1 (or Pro) for anything with references — not 2 Lite.** Google: Lite is "not optimized for multiple
   reference inputs or multi-turn editing". Flow's *no-charge default is Lite*, so set the picker to 2.1 **before every
   apparel run**. Promote winners to Pro for fine detail.
3. **Describe each reference by what it shows** ("the back-view mockup", "the model sheet"), not "image 1/2" — ingredient
   ordering is undocumented and numbered labels confuse it.
4. **Positive framing + explicit keep-list.** "Keep the hoodie cut, colour, print scale and position identical." Prefer concrete
   attributes (position, size, colour) plus one short keep clause; absolutes like "pixel-perfect restore" make it redraw.
5. **One variable per round** (background *or* wardrobe *or* pose).
6. **Shoot bible:** one fixed paragraph (model, lens, light, backdrop, grade, palette) pasted verbatim into every on-model
   prompt; only the pose/scene sentence changes.
7. **Brand colour:** a hex is a request, not a guarantee. Colour name + hex + a swatch-plate reference + "true black on lit and
   shadow side"; fix drift with a regional edit; composite anything that must match exactly; eyedropper the export. One
   orange element per frame (gel spill, rim light or tag).
8. **Text/logos:** ≤6 words in-image, on Pro/2.1. The chest logo, wordmarks, URLs, prices are composited with the brand font.
   Scenes get "no readable text anywhere". Quote posts: generate the empty background, set type externally.
9. **Instagram: generate 3:4** (grid-true, no crop); sources split 3:4 vs 4:5. 1K is ~20% upscaled at 1080 wide → **2K for
   published posts**. 9:16 for covers/Stories, 1:1 for catalogs. Flow offers 16:9, 4:3, 1:1, 3:4, 9:16 [live].
10. **Keep file metadata.** Google Merchant requires IPTC `TrainedAlgorithmicMedia` on AI images; screenshots/"export for
    web" can strip it. Whether Flow downloads carry C2PA/IPTC is **unverified** — check one file with exiftool.
11. **Product-page truth rule.** The image a customer buys on must show the real product (Competition Act "general impression").
12. **Pre-launch:** AI on-model images are concept/mood until real samples exist. Order samples early.

## Three routes for the back print (Acme's hero)
| Route | How | Fidelity | Use |
|---|---|---|---|
| A reference-edit | garment mockup + model ref → "put this garment on this person" | medium (fine line-art can warp) | social, mood |
| **B blank + composite** | on-model photo of a **plain** hoodie ("plain garment with no prints, labels or lettering"), then warp/multiply the exact print in an editor | **exact** | PDP, ads |
| C real sample | photograph the real printed hoodie | exact | PDP hero, trust |
Test A on a bold design first; fine-stroke line-art (Acme's style) is the stress case → expect B. If the print fails 2 rounds, switch to B.

## Reference pack per design (prepare once)
1 back flat mockup (print placed, plain bg) · 2 front flat mockup with upper-left chest logo · 3 print art alone on flat
white/black · 4 blank hoodie render/photo per colourway (ideally the real Lane Seven blank) · 5 model sheet (front, ¾,
**back**, profile, neutral light) saved as an `@Character` · 6 palette swatch plate (black, off-white, orange).

## Back-view skeleton (route A)
```
Create a photorealistic [3:4] fashion photograph of the person from the model reference, seen from directly behind,
wearing the oversized black hoodie shown in the back-view mockup. The back graphic is an exact copy of the artwork in
the print reference: [one-line art description, size ~28 cm wide], centred between the shoulder blades, [colour].
Keep the hoodie cut, colour, print scale and print position identical to the mockup. [fit] [light] [camera]
```
Fit wording that carries weight: "boxy oversized fit, dropped shoulders, sleeves covering the knuckles, soft natural creases
across the lower back, true matte black fleece (not charcoal)". Generate **x4** (images are effectively free here) and pick.

## Template menu (full prompts: research doc §3 T1–T15, §10 K1–K6)
T1 ghost-mannequin front hero · T2 overhead flat-lay · **T3 on-model BACK hero, cyc wall** · T4 front ¾ with chest logo ·
T5 street editorial · T6 campus/library/lab lifestyle · T7 detail macro (print + stitching) · T8 colourway variants (edit, only
for colours the blank exists in) · T9 fit comparison (illustrative only) · T10 6–9 frame carousel · T11 Reel cover (9:16) ·
T12 ad frame with copy space · T13 UGC "student wearing it" · T14 quote post (no garment) · T15 keep the real photo, change only the scene.

**Starter kit order (each unlocks the next):** K1 model sheet on blank tee → K2 ghost-mannequin front hero → **K3 on-model BACK
hero** → K4 Neuroscience lab corridor back-to-camera (one orange accent far down the corridor) → K5 macro of print/stitching
(label as AI render; not the PDP macro) → K6 orange-gel ad frame with copy space, then 9:16 variant. Settings: Nano Banana 2.1,
3:4, x4, references attached.

## One model, one shoot, one grid
Build the model once as a four-angle sheet incl. back; save as `@Character`; paste the shoot bible every time; same backdrop,
lens and grade across a 9-frame grid; vary pose/scene only. Casting: say adult ages explicitly.

## Editing in Flow
Select tool (local fixes), Draw (Text and Rectangle), Crop, History panel with Save to Project, Agent batch variations [G].
Whether a drawn box constrains print placement is an untested experiment.

## Real vs AI mix (recommendation from the research; confirm with the user before publishing anything)
| Tier | Where | Garment pixels | Label |
|---|---|---|---|
| Truth | PDP gallery, catalogs, fit/fabric/print close-ups | real sample or exact print on a true-to-blank render | "Photographed sample" vs "Product render" |
| Campaign | organic IG/TikTok, covers | reference-locked AI with the real art | disclose AI people; keep metadata |
| Mood | quote cards, textures, backgrounds | none (no product claim) | none required |
| Paid | Meta/TikTok ads | prefer real photo + AI background | use the Ads Manager AI toggle |
Rules: never use AI to show fit/size, fabric weight, ink feel or unverified colour; real students for testimonials/UGC;
pre-sale before samples → "concept renders"; keep a provenance log per asset (real/AI/composite, prompt, refs, date); never strip
SynthID/C2PA/IPTC; re-read Meta/TikTok/Merchant policy pages before paid launch.

## Open questions (live Flow tests, not more research)
Image ingredient cap and order; does Draw→Rectangle constrain placement; does Agent keep references as well as the prompt box;
Flow export pixel sizes at 3:4 1K/2K; swatch plate vs hex for a 9-frame set; whether 2.1 renders fine white line-art on black
fleece at back-print scale well enough for route A.
