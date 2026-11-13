# Image craft with Nano Banana (2.1 / Pro) in Google Flow — apparel e-commerce & social, for Acme

**Written:** 2026-10-16 · **Scope:** turning Acme's flat designs into believable product + social imagery (hoodies/tees, **back print = hero**, small chest logo), inside Flow's image mode, web research only (nothing was generated in Flow, no logins, no credits spent).
**Builds on, does not repeat:** `flow-creative-playbook.md` §3–4 (Google's image formula, basic packshot template, reference sheets) and `flow-official-facts.md` (model matrix, credits, watermark).

**Tags.** **[G]** = Google first-party (Flow help, blog.google, ai.google.dev, Merchant Center). **[P]** = other primary policy/regulator source (Meta, TikTok, Competition Bureau, Ad Standards, IAB Canada). **[C]** = community/vendor/blog/Reddit — reported behaviour, not guaranteed. **[unverified]** = could not confirm, or my own inference. **[live]** = already live-verified by the Acme team (given in the brief). Where sources disagree I say so in §12.

---

## 0. The 12 rules (read this if nothing else)

1. **Don't let the model invent the print.** For anything a customer will buy against, the print must come from *your art file*, either (a) supplied as a reference and checked, or (b) **composited afterwards onto a generated blank garment**. Google itself lists "small text, fine details, accurate spellings" as current limits ([G] [Nano Banana Pro tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)).
2. **Use Nano Banana 2.1 or Pro for anything with references — not 2 Lite.** Google's API docs say Lite is "not optimized for multiple reference inputs or multi-turn sequential editing" ([G] [Gemini image docs](https://ai.google.dev/gemini-api/docs/image-generation)). Flow's no-charge default is Lite ([G] via `flow-official-facts.md` §1b), so *change the picker* before every apparel run.
3. **Describe each reference by what it shows, not "image 1 / image 2".** Flow ingredient ordering is not documented; a Reddit user reports "image1/image2" labels cause confusion ([C] [r/nanobanana](https://www.reddit.com/r/nanobanana/comments/1p58vvo/what_am_i_doing_wrong_on_nano_banana/)). Google's own advice is to "clearly define the role of each" reference ([G] [tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)).
4. **Positive framing + explicit keep-list.** Google: describe what you want ("empty street"), not what you don't; for edits "be explicit about what to keep exactly the same" ([G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)).
5. **One variable per round.** Change background *or* wardrobe *or* pose, never all three ([C] [nanobananao failures guide](https://nanobananao.com/blog/nano-banana-common-failures-fixes/); [C] [nanobanana-ai.us](https://nanobanana-ai.us/en/tutorials/character-consistency/)).
6. **Lock a "shoot bible" paragraph** (model, lens, light, backdrop, grade) and paste it verbatim into every prompt; only the pose/scene sentence changes ([C] [nanobananao batch workflow](https://nanobananao.com/blog/nano-banana-pro-social-media-brand-batch-workflow/)).
7. **Brand colour: a hex code is a request, not a guarantee.** Add a swatch reference and composite anything that must match to the pixel ([C] [Novoads](https://novoads.ai/en/blog/ai-image-brand-colors-hex-codes)). Google's Nano Banana guides do not document hex input ([C] same source).
8. **Never generate typography you can't afford to be wrong.** Short strings OK on Pro/2.1; real wordmarks, URLs, price, and the chest logo get composited ([G] limits above; [C] [nanobananao](https://nanobananao.com/blog/nano-banana-common-failures-fixes/)).
9. **Generate 3:4 (or 9:16), not 1:1, for Instagram.** 3:4 matches IG's native 3:4 photo support and the 3:4 profile grid; see §8 for the 3:4-vs-4:5 disagreement.
10. **Keep file metadata.** Google Merchant requires AI images to carry IPTC `TrainedAlgorithmicMedia` and says not to remove it ([G] [Merchant Center](https://support.google.com/merchants/answer/14743464?hl=en)). Screenshots and some "export for web" paths strip it.
11. **Product-page truth rule.** The image a customer buys on must show the real product. Canada's Competition Act judges the "general impression" of an ad, not just the literal words ([P] [Competition Bureau](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/additional-information-about-competition-act)). §9–10.
12. **Pre-launch caveat:** until real samples exist, AI on-model images are *concept/mood*, not proof the product looks that way. Order samples early; re-shoot the hero on a real body when you can (§10).

---

## 1. Flow mechanics that matter for apparel (beyond the playbook)

| Capability | What the docs say | Tag |
|---|---|---|
| Image prompt box | Model name → **Image** → pick aspect ratio, number of outputs, model; add prompt; add ingredients | [G] [Create & edit images](https://support.google.com/flow/answer/16729550?hl=en) |
| Select & edit part of an image | Open image → **Select** (left rail) → mark the area → describe the change in the prompt box → Generate. "You can use the Nano Banana model to make iterative edits" | [G] same page |
| Draw on an image | **Draw** (left rail); **Text** adds text, **Rectangle** draws a box — i.e. you can annotate "put the logo here / this box is the hood" | [G] same page |
| Crop | Click image → **Crop** (left) → choose crop → Crop | [G] same page |
| Non-destructive history | "When you edit an image… you don't lose the original." Versions + prompts live in the **History** panel; hover a version → **Save to Project** before re-using it as a reference | [G] same page |
| Reuse an output as a reference | Hover image → **More → Add to Prompt** | [G] same page |
| Characters in images | Type `@Name` in the image prompt box; describe how the character is used | [G] same page |
| Agent for batches | Turn on **Agent**; e.g. "Give me 20 variations of this image with different lighting"; the Agent "routes your request to the best image model" | [G] same page |
| Flow-in-image model picker default | Help text says Flow defaults to **Nano Banana Pro**; models page says the no-charge default is **2 Lite**; live-verified default is **2.1** | [G]/[live] — pick explicitly |

**Implications.**
- *Agent routes the model for you* → for fidelity-critical garment work, use the standard prompt box with an explicit model; use Agent for lighting/colour/background variant sweeps once a locked base image exists. (Inference from "routes to the best image model" — [unverified].)
- *Draw → Rectangle* is the closest thing Flow documents to a placement guide. Draw a box on a blank-hoodie back view where the print should sit, then prompt "place the line-art from the reference inside the drawn box" — I found no write-up testing this, so treat as an experiment ([unverified]).
- *Reference capacity.* Nano Banana 2.1 supports "up to 14 reference images (character consistency for up to 4 characters and object fidelity for up to 10 objects)" ([G] [model page](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1)). Pro: "up to 14… varies by surface" ([G] [tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)). Flow's own per-prompt cap for *image* ingredients is not documented — [unverified]; test with 3–4 and don't assume 14.
- **Seeds:** I found no documented seed control in Flow help or the Gemini image docs ([unverified]). Consistency comes from references + a repeated text block, not seeds (§5).
- **Models differ in what they promise** ([G] [API model list](https://ai.google.dev/gemini-api/docs/image-generation)): 2.1 = "primary high-efficiency workhorse", improved "text rendering, multi-turn consistency"; Pro = "highest level of world knowledge… accurate brand consistency, and precision creative control". Practical split: **draft on 2.1, promote winners (hero back view, ad) to Pro** — the same draft-then-promote idea the playbook cites from [C] sources.

---

## 2. Flat design → realistic on-model photo (front **and** back)

### 2.1 Three ways to get the print onto a body, ranked by fidelity

| Route | How | Print fidelity | Realism | Use for |
|---|---|---|---|---|
| **A. Reference-edit** | Give the model (1) garment mockup/flat with print, (2) a model/pose reference; prompt "put this garment on this person" | Medium. Small logos/line-art can warp; "logo appears to be about 90% accurate, other text is distorted" ([C] [r/nanobanana](https://www.reddit.com/r/nanobanana/comments/1p10qfq/how_to_edit_products_with_text/)) | High | Mood, social, concept |
| **B. Blank + composite** (recommended for the back hero) | Generate the on-model photo of a **plain** black hoodie, then place your exact print file in an editor with warp + multiply/screen + subtle displacement | **Exact** | Medium-high (needs a decent warp) | PDP/ads where the print must be right |
| **C. Real sample** | Photograph the actual printed hoodie on a real person | Exact | Real | PDP hero, trust shots |

Why B works: Google's own docs concede small-text/fine-detail limits ([G] [tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)); Reddit practitioners say logos on products warp "below a certain resolution" and suggest "zoom the image in and combine them" ([C] [r/nanobanana](https://www.reddit.com/r/nanobanana/comments/1phsrmb/text_distortion_issues_product_labels/)); OpenAI-oriented brand-colour guidance says regions that must be identical "are composited, not prompted" — Novoads applies that to Nano Banana workflows ([C] [Novoads](https://novoads.ai/en/blog/ai-image-brand-colors-hex-codes)).
The blank-garment prompt tip: add "plain garment with no prints, labels or lettering" or the model will invent graphics on hoodies ([C] [BananaBanana lookbook guide](https://bananabanana.pro/prompts/fashion-lookbook)).

Google *does* advertise route A: "Seamlessly drape patterns, logos, and artwork onto 3D objects and surfaces—from apparel to packaging—while preserving natural lighting and texture" ([G] [tips #7](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)). Line-art with fine strokes is the stress case — test A first on a bold design, B for the fine ones.

### 2.2 Reference pack to prepare (once per design)
1. **Back flat mockup** (Printify/Printful or your own render): hoodie back, print placed correctly, plain light-grey/white background — Google: subject/product refs "on a plain or segmented background" ([G] [create videos help, ingredients section](https://support.google.com/flow/answer/16353334?hl=en)).
2. **Front flat mockup** with the small upper-left chest logo.
3. **Print art alone** on flat white (or black) background, high-res, for macro shots and for compositing.
4. **Blank hoodie photo/render** (no print) in each colourway — the cut/colour truth, ideally the real Lane Seven blank.
5. **Model sheet** (front / ¾ / **back** / profile, neutral light) — §5.
6. **Palette swatch plate** (flat blocks: your black, off-white, accent orange) — §6.

### 2.3 Back-view prompt skeleton (route A)
```
Create a photorealistic [3:4] fashion photograph of the person from the model reference,
seen from directly behind, wearing the oversized black hoodie shown in the back-view mockup.
The back graphic is an exact copy of the artwork in the print reference: [one-line description of the art],
[size: about 28 cm wide], centred between the shoulder blades, [colour: white line-art].
Keep the hoodie cut, colour, print scale and print position identical to the mockup. [fit sentence] [light sentence] [camera sentence]
```
Why: roles are stated in plain words (G tip), the print is described in concrete attributes (position, size, colour) instead of only "keep identical" — a vendor troubleshooting note reports absolute phrases like "pixel-perfect restore" make the model "redraw it", and recommends concrete colour/position/preserve-item descriptions plus 1–3 retries ([C] [apiyi print-distortion FAQ](https://docs.apiyi.com/en/faq/nano-banana-pro-print-distortion); its "5–15% of samples wander" figure is that vendor's own claim, [unverified]). Other guides *do* recommend "preserve… keep label legible; no warped logo" ([C] [nanobananao](https://nanobananao.com/blog/nano-banana-common-failures-fixes/)). I'd use both: concrete attributes + one short "keep identical" clause, and generate x4 (images are effectively free [live]) and pick.

### 2.4 Oversized fit, drape and wrinkles — wording that carries weight
Sources agree fabric words and physical specifics matter more than adjectives: "fabric words carry more than they look — linen, ribbed cotton, satin… each drape and catch light differently" ([C] [BananaBanana](https://bananabanana.pro/prompts/fashion-lookbook)); Google says define materiality ("navy blue tweed", not "jacket") ([G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)); a try-on guide uses "Realistic fabric drape and wrinkles. Match lighting between person and garment" ([C] [NanoBananaTool](https://nanobananatool.com/blog/nano-banana-2-virtual-try-on)). Printful notes ghost-mannequin shots exist to show "fit and drape" ([C/vendor] [Printful](https://www.printful.com/blog/clothing-photography)).
**Fit vocabulary to try** (my synthesis, not tested in Flow — [unverified]): *heavyweight brushed-back cotton fleece; boxy oversized silhouette; dropped shoulder seam sitting below the shoulder point; sleeves long enough to cover the knuckles with a soft stack at the wrist; hem falling to mid-hip over the waistband; soft natural creases at the elbows and a gentle fold across the lower back; ribbed cuffs and hem; kangaroo pocket; hood resting flat on the upper back (down) / structured hood (up).*
Back-print note: a hood-down hoodie bunches fabric at the upper back and can bury the top of the print — say "hood down and tucked forward so the full back graphic is visible", or use a tee/crewneck for the hero.

### 2.5 Failure modes and fixes
| Failure | Likely cause | Fix |
|---|---|---|
| **Garbled / wrong letters** | Baked-in long copy; small type | Keep text to 3–6 words or none; composite real type ([C] [nanobananao](https://nanobananao.com/blog/nano-banana-common-failures-fixes/); [G] limits) |
| **Logo/print redrawn, warped, simplified** | Unlocked mark; tiny scale; weak reference | Bigger/cleaner reference on plain bg; concrete placement words; Select the print region and re-run with the art as reference; or route B ([C] nanobananao; [C] apiyi) |
| **Print colour shifts** (white → cream, orange → red) | Colour drift under lighting | Neutral light wording, swatch plate ref, local edit "change only the print colour to match the print reference" (§6) |
| **Print appears on the front / sleeves / wrong place** | Model "completes" the garment | State what the *other* surfaces look like ("front is plain black except a tiny logo upper-left chest"); for back views keep the front out of frame |
| **Hoodie looks fitted, not oversized** | Default fashion-model bias | Fit vocabulary above; ask for ¾ length shot so cuff/hem proportions are visible |
| **Extra/malformed fingers** | Hands remain a weak spot in 2026 output; fix by "generating multiple variants and selecting" ([C] [PodVector](https://podvector.ai/articles/ai-analytics/ai-overview/the-pod-sellers-guide-to-ai-for-ecommerce-photos)) | Pose hands in pockets / hidden / cropped; x4 outputs; Select the hand → "natural hand, five fingers" |
| **Floating garment / cut-out look** | Unmatched light, no shadow | Name key-light direction and "realistic contact shadows" ([C] nanobananao) |
| **Plastic skin / "AI face"** | Over-smoothing | "natural skin texture, no beauty retouching" ([C] BananaBanana) |
| **Edits go global** (whole image changes) | No lock | "Change only X; keep everything else identical" ([G] Cloud guide); prefer **Select** tool ([G] Flow help) |
| **Drift after many edits** | Stacked re-renders | Return to the best **History** version, Save to Project, branch from it ([G] Flow help); do not stack five edits on a drifted face ([C] nanobanana-ai.us) |
| **Blend/lighting artifacts** | Complex compositing | Google lists "advanced editing… blending or lighting changes can sometimes produce unnatural artifacts" ([G] tips) — simplify the scene |

---

## 3. Copy-ready prompt templates (15)

Conventions: `[BRACKETS]` are variables; **Refs** = what to attach as ingredients (name them by content in the prompt); sizes in Flow's ratios [live]. Every prompt starts with a strong verb (Google: "start a prompt with a strong verb that tells the model the primary operation" — [G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)). Paste your **SHOOT BIBLE** (§5.3) after the first sentence of any on-model prompt.

### T1 — Ghost-mannequin front hero (from flat mockup)
**Refs:** front flat mockup. **Ratio:** 3:4 (or 1:1 for catalogs). **Model:** 2.1 → Pro.
```
Transform the supplied front-view hoodie mockup into a professional ghost-mannequin product photograph: the garment appears naturally worn and volumetric, as if on an invisible mannequin, with the hood opening and cuffs showing believable depth. Keep the exact cut, colour, seams, drawstrings and the small chest logo [upper-left, N cm wide] from the mockup unchanged. Pure white seamless background, soft overhead softbox plus fill, subtle contact shadow under the hem, centred, product fills ~85% of the frame height.
```
**Why:** adapts a community prompt that asks the model to "preserve the exact identity of the original product" and show the garment "inflated with air on an invisible mannequin" ([C] [Vidzy](https://getvidzy.com/prompt-library/product-flat-lay-to-ghost-mannequin/)); the 85% fill is an Amazon main-image rule quoted by Printful ([C] [Printful](https://www.printful.com/blog/clothing-photography)); contact shadow is a realism cue ([C] playbook §3.3).
**Check:** chest logo shape (composite the real logo if even slightly off).

### T2 — Overhead flat-lay (back print visible)
**Refs:** back flat mockup. **Ratio:** 3:4.
```
Create a top-down flat-lay photograph of the hoodie from the back-view mockup laid face-down so the back graphic is fully visible, sleeves relaxed at the sides, on a [matte mid-grey concrete] surface. Soft even daylight from the top-left, gentle natural wrinkles, no props except one [folded white tee] at the edge. The back graphic is an exact copy of the print reference, same size and position as in the mockup.
```
**Why:** flat-lay is the fastest, most consistent look for a collection ([C] Printful above); naming surface + one light direction is the E-com pattern in the playbook; props limited to one so print stays hero.

### T3 — On-model **back** hero, studio cyc wall (the money shot)
**Refs:** model sheet (back), back mockup, print art. **Ratio:** 3:4.
```
Create a photorealistic full-length fashion photograph of the model from the model reference, seen from directly behind, standing relaxed with arms by their sides, wearing the oversized black hoodie from the back-view mockup, hood down. The back graphic is an exact copy of the print reference: [art description], [28 cm wide], centred between the shoulder blades. Seamless off-white cyclorama wall and floor, large softbox from front-left with a bounce card, soft contact shadow, true-to-colour neutral white balance, 85mm lens at f/5.6, eye-level camera. [Fit sentence from §2.4.]
```
**Why:** Google's template (subject + action + location + composition + style) with roles stated; the cyc/softbox/lens pattern mirrors a tested studio-editorial prompt ("seamless warm sand studio backdrop, large softbox front left with a bounce card… 85mm at f/4" — [C] [BananaBanana](https://bananabanana.pro/prompts/fashion-lookbook)); neutral white balance protects blacks and whites.
**Route B variant:** replace the hoodie description with "plain black oversized hoodie with no print, labels or lettering" and composite the art afterwards.

### T4 — On-model **front** ¾, chest logo, studio
**Refs:** model sheet (front), front mockup. **Ratio:** 3:4.
```
Create a photorealistic three-quarter-length photograph of the model from the model reference facing camera at a slight angle, wearing the oversized black hoodie from the front mockup, hands in the kangaroo pocket. The small [white] Acme logo sits upper-left chest exactly as in the mockup; the rest of the front is plain black. Seamless [black / off-white] backdrop, single large softbox from front-right, soft shadows, 85mm f/4, calm expression, natural skin texture.
```
**Why:** hands hidden removes the #1 failure; "rest of the front is plain" prevents invented graphics ([C] BananaBanana). Logo is the likely failure → composite if needed (§7).

### T5 — Street editorial (night / overcast), model walking away
**Refs:** model sheet, back mockup. **Ratio:** 3:4 or 9:16.
```
Create a candid street-style photograph, shot from behind at eye level, of the model from the reference walking away along a [wet grey campus walkway] at dusk, wearing the oversized black hoodie from the back mockup with its back graphic clearly visible and unchanged. Overcast cool ambient light, a single warm [accent-orange] practical light far down the path as the only colour, blurred pedestrians, 35mm lens at f/2, mid-stride, subtle film grain, muted desaturated palette.
```
**Why:** streetwear lookbook prompts in the wild use 35mm candid eye-level + rim/neon colour accents ([C] [nanobananaimages](https://www.nanobananaimages.com/blog/nano-banana-fashion-photography-prompts)); restricting colour to one orange practical enforces the "restrained accent" brief; back-to-camera is the cheapest way to show the hero print *and* hide face/hand issues.

### T6 — Campus / library / lab lifestyle (major-themed)
**Refs:** model sheet, back mockup. **Ratio:** 3:4 / 9:16. Vary location only:
- **Neuroscience:** quiet teaching-lab corridor, glass wall with blurred brain-slice posters (no legible text), cool fluorescent mixed with window light.
- **CS:** late-night library carrels, laptop glow, dark window reflections.
- **Chemistry:** bright lab bench with out-of-focus glassware (never in the model's hands).
```
Create a photorealistic lifestyle photograph of the model from the reference sitting [turned slightly away from camera at a long library desk], laptop open, wearing the oversized black hoodie from the back mockup so the back graphic is visible over the chair, [location sentence]. Natural mixed light from tall windows camera-left, shallow depth of field, 50mm f/2, documentary feel, relaxed posture, no readable text anywhere in the scene.
```
**Why:** "describe a real moment, not a photoshoot" ([C] [AdLibrary](https://adlibrary.com/guides/ai-prompting-guide-ugc-content-creators)); "no readable text anywhere" stops gibberish signage; major-theme lives in *props and place*, while the print stays the real art. Because the line-art is major-specific, make each major's post use *that* major's mockup.

### T7 — Detail macro: print + stitching + fabric
**Refs:** print art, back mockup (crop). **Ratio:** 3:4 / 1:1.
```
Create a macro close-up photograph of the back graphic on the black hoodie, shot at a slight angle, showing the white line-art printed crisply on heavyweight brushed cotton fleece, visible fabric knit texture, a soft fold across the print, and the stitched [shoulder seam] in the upper corner. 100mm macro lens, f/4, shallow depth of field with the focus plane on the print, single hard raking light from the left, neutral colour.
```
**Why:** Google tells you to specify "a macro lens" for intricate detail and name materials ([G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)); raking light reveals texture. **Honesty flag:** a macro of an AI print is the shot most likely to mislead on print quality (ink feel, cracking, fabric weight) — use a real macro of a real sample for the PDP; AI macro for social only.

### T8 — Colourway variants (edit, not regenerate)
**Refs:** the approved base image (saved to project). **Ratio:** same as base.
```
Edit the supplied photograph: change only the hoodie colour from black to [heather grey], and invert the back graphic from white to black so it stays legible. Keep the model, pose, framing, lighting, background and the print's shape, size and position exactly the same.
```
**Why:** Google's edit rule (what changes / what stays) ([G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)); use **Select** on the garment to constrain it ([G] Flow help). Check the colour against the real blank — never ship an AI colourway the blank doesn't come in.

### T9 — Size / fit comparison (illustrative only)
**Refs:** model sheet A (shorter), model sheet B (taller), front mockup. **Ratio:** 3:4.
```
Create a photorealistic full-length photograph of two models standing side by side against a seamless off-white wall, both wearing the same oversized black hoodie from the front mockup in different sizes: the shorter model in [S] with sleeves reaching the knuckles, the taller model in [XL] with sleeves ending at the wrist. Identical neutral lighting, 50mm lens, eye-level, hands in pockets.
```
**Why / warning:** fit is where AI is least trustworthy — Reddit POD sellers say for apparel "the fit is often inaccurate" ([C] [r/printondemand](https://www.reddit.com/r/printondemand/comments/1ksy1yz/ai_mockups/) — snippet only). Use for *social* ("how it sits"), never as a size chart. Real size info must come from garment measurements/real fit photos (§10).

### T10 — Carousel set (6–9 frames that read as one shoot)
See §5.4 for the shot list. Template for each frame:
```
[SHOOT BIBLE]. Create frame [N] of a [N-frame] campaign set: [shot type sentence]. Same model, same backdrop, same lighting and colour grade as the reference frame. Aspect 3:4.
```
**Why:** the batch approach "brand kit + templated prompts" with only a topic sentence swapped ([C] [nanobananao](https://nanobananao.com/blog/nano-banana-pro-social-media-brand-batch-workflow/)); attaching the *approved frame 1* as a style/identity anchor is Google's multi-image role pattern ([G] tips).

### T11 — Story / Reel cover frame (9:16)
**Refs:** approved hero image. **Ratio:** 9:16.
```
Recompose the supplied photograph as a 9:16 vertical cover frame: keep the model, hoodie and back graphic exactly as is, extend the [off-white cyclorama] above and below, and place the subject in the central 3:4 area of the frame with empty clean wall in the top 15% and bottom 20% for title text added later. No text in the image.
```
**Why:** Reels covers are 1080×1920 but appear **1013×1350 on the grid**, and in-feed view crops to 4:5 — "keep any in-video text within that ratio" ([C] [Planoly](https://www.planoly.com/blog/guide-to-instagrams-new-vertical-grid)). Composing for the crop before generating beats cropping after ([C] [Lovart](https://www.lovart.ai/blog/nano-banana-pro-free-tips), same idea). Add the title in an editor (§7).

### T12 — Ad creative with copy space (paid, later)
**Refs:** approved hero or back-view image, swatch plate. **Ratio:** 3:4 (feed) and 9:16 (stories).
```
Create a minimalist advertising photograph: the model from the reference from behind in the oversized black hoodie (back graphic unchanged) on the left third of the frame, a large clean empty area of seamless off-white wall on the right two-thirds reserved for headline text, one small [accent-orange] circle-shaped light gel spill on the wall as the only colour, soft front-left softbox, 85mm. No text in the image.
```
**Why:** Google endorses "leave negative space" thinking for text zones; community guides say "leave negative space for real typography later" ([C] [nanobananao](https://nanobananao.com/blog/nano-banana-common-failures-fixes/)). Meta ads policy: AI-created ad images are labelled "AI info" (§9), so budget for that.

### T13 — UGC-style "student wearing it" (phone-photo look)
**Refs:** model sheet (or a *different* character), back mockup. **Ratio:** 3:4 / 9:16.
```
Create a casual iPhone-style photo of a university student taking a mirror selfie in a [dorm hallway], wearing the oversized black hoodie from the back mockup but turned so the back graphic shows in the mirror, phone held at chest height hiding the face edge, overhead fluorescent light, slight motion softness, a bit of clutter, natural unretouched skin and hair, no filters.
```
**Why:** UGC works when prompts "fight AI's tendency to produce perfect images" with imperfection and a concrete moment ([C] [AdLibrary](https://adlibrary.com/guides/ai-prompting-guide-ugc-content-creators)); mirror selfie framing is a popular r/nanobanana2ai recipe ([C] [Reddit](https://www.reddit.com/r/nanobanana2ai/comments/1rhzigy/how_to_create_viral_ai_ugc_mirror_selfies_with/)). **Policy flag:** a realistic AI "student" styled as a real customer is the highest authenticity risk — never present as a real customer review/testimonial (Ad Standards: AI-generated influencers still need disclosure and must not give testimonials on what they can't experience — [P] [Ad Standards](https://adstandards.ca/wp-content/uploads/Ad-Standards-Influencer-Marketing-Disclosure-Guidelines-2025-10-08.pdf)). Prefer real student volunteers for UGC.

### T14 — Quote / minimal-typography post (no garment)
**Ratio:** 3:4. **Model:** Pro (text).
```
Create a minimalist typographic poster: solid matte black background, the exact words "[SHORT QUOTE ≤6 WORDS]" in white lowercase geometric sans-serif centred with generous margins, a single thin [accent-orange] horizontal rule below the text, no other elements, no texture.
```
**Why:** Google: quote exact text, name the font style, say where it goes ([G] [tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)); Cloud guide: "text-first hack" — draft the wording in conversation first, then request the image ([G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)). Better: generate the empty background and set type in Figma/Canva/Photoshop with Acme's real font (§7).

### T15 — Hybrid: keep the real photo, change only the scene
**Refs:** a **real** photo of the printed sample on a real person. **Ratio:** same.
```
Edit the supplied photograph: replace only the background with [a softly out-of-focus university library corridor at dusk] and adjust the light on the person to match it. Keep the person, the hoodie, the print, pose and framing pixel-for-pixel as they are.
```
**Why:** this is the "real product against an AI background" pattern the EU guidance treats as lower-risk than a generated hero ([C] [Craftshift summary](https://craftshift.com/disclose-ai-generated-product-images-shopify-2026/)); TikTok's ad policy treats "removing or modifying backgrounds" as an *insignificant* AI edit ([P] [TikTok ads policy](https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-misleading-and-false-content)). Best authenticity/effort trade-off once samples exist.

---

## 4. Lighting, lens and backdrop vocabulary that reads reliably
- **Lighting recipes:** "three-point softbox setup" (even product), "chiaroscuro with harsh high contrast" (drama), "golden hour backlighting" ([G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)); key light "45 degrees above and to the left", fill "25% intensity", rim light for subject/background separation, "neutral white balance at 5600K" ([C] [aifreeapi lighting guide](https://www.aifreeapi.com/en/posts/nano-banana-2-lighting-guide)).
- **Camera:** Google says name hardware ("Fujifilm" for colour science, "disposable camera" for flash), lens ("low-angle, f/1.8", "macro lens"), and grade ("1980s colour film", "muted teal") ([G] Cloud guide). For catalogues keep **one focal length per set** — 85mm for portraits/packshots, 35mm for environmental ([C] playbook §3.3 citing nanobananao).
- **Backdrops:** name it once and never reword ("seamless off-white cyclorama wall and floor") — re-wording drifts a series ([C] [nanobananao](https://nanobananao.com/blog/nano-banana-pro-social-media-brand-batch-workflow/)).

---

## 5. One model, one shoot, one grid

### 5.1 Build the model once
1. **Generate the model on a plain blank black tee/hoodie (no print)**, neutral light, front view — the identity anchor. Google's recipe for consistency: clear references, a distinct name per character; "once you define Maya using a reference image, future prompts can refer to her by name" — repeating the full description "can encourage the model to reinterpret them" ([C] [nenobanana summary of Google guidance](https://www.nenobanana.com/blogs/character-consistency-in-nano-banana)).
2. **Turn it into a sheet** — front, ¾, side, **back** — in one plain-background lineup with consistent scale and lighting ([C] [Krea](https://www.krea.ai/blog/30-best-nano-banana-prompts-to-copy-paste-in-2026)):
```
Using the uploaded reference image, create a clean model sheet of [the same person] on a plain warm-grey background wearing a plain black oversized t-shirt with no print. Preserve face shape, eye shape, hairstyle, skin tone, body proportions. Show front view, three-quarter view, side view and back view in a neat lineup with consistent scale and lighting, as a production reference sheet.
```
3. **Save it as a Flow Character** (`@Name`; at least one image, 1–2 allowed — [G] [Flow help](https://support.google.com/flow/answer/16935308)) and also keep the sheet as an ingredient. Characters can be called in image prompts via `@` ([G] [Create & edit images](https://support.google.com/flow/answer/16729550?hl=en)).
4. **Stress-test** with a changed angle, a changed light, a changed outfit before trusting it (playbook §4.2 [C]).

### 5.2 Consistency rules that keep working
- Reference quality beats reference quantity ("fewer high-quality references work better than a large collection of inconsistent images" — [C] [nenobanana](https://www.nenobanana.com/blogs/character-consistency-in-nano-banana)).
- Escalate in controlled steps: same look/new background → new pose → new camera distance → new outfit ([C] [nanobanana-ai.us](https://nanobanana-ai.us/en/tutorials/character-consistency/)).
- Iterate **from the best result**, using the strongest previous frame as the next reference ([C] [nanobananapro.cloud](https://nanobananapro.cloud/guides/character-consistency)).
- Name skin tone with depth + undertone ("medium warm, olive undertones") rather than a group label ([C] [TopFreePrompts](https://topfreeprompts.com/prompts-for/nano-banana-image-prompts)).
- If the face drifts, fix it before stacking scene changes ([C] nanobanana-ai.us).
- Multi-subject: Nano Banana 2.1 supports character consistency for up to 4 characters ([G] [model page](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1)); Pro "up to 5 people" is cited secondhand ([C] nenobanana). For a two-model shoot, supply two clean sheets and refer to each by name.

### 5.3 Shoot bible (paste into every on-model prompt)
```
SHOOT BIBLE — Acme S/S campaign: model [Name] (see model reference: [skin tone + undertone, hair texture/length, build]); 85mm lens at f/5.6 unless stated; seamless off-white cyclorama or [named location]; large softbox front-left with bounce, neutral 5600K white balance; true matte black cotton fleece (not charcoal), off-white not pure white; natural skin texture; restrained palette: black, off-white, and at most one small [accent-orange] element; muted, slightly desaturated grade; no text in the scene.
```
Why: it freezes the five things community guides say drift — palette, lens, light, backdrop, grade ([C] [nanobananao](https://nanobananao.com/blog/nano-banana-pro-social-media-brand-batch-workflow/); [C] [RunDiffusion](https://www.rundiffusion.com/nano-banana-2-consistent-character-images): "Keep lighting direction and quality similar across related shots").

### 5.4 A 9-frame grid that reads as one campaign
| # | Frame | Template | Ratio |
|---|---|---|---|
| 1 | Back hero on cyc (anchor) | T3 | 3:4 |
| 2 | Macro of print | T7 | 3:4 |
| 3 | Front ¾ with chest logo | T4 | 3:4 |
| 4 | Campus/lab lifestyle | T6 | 3:4 |
| 5 | Typographic quote card | T14 | 3:4 |
| 6 | Walking away, street dusk | T5 | 3:4 |
| 7 | Ghost-mannequin front | T1 | 3:4 |
| 8 | Colourway edit of frame 1 | T8 | 3:4 |
| 9 | Orange-accent ad frame | T12 | 3:4 |
Layout logic (my suggestion, [unverified]): alternate photo / graphic / detail so tiles don't read as nine near-identical posts; keep the orange accent to ≤1 element per tile. Remember IG's grid previews at 3:4 (1013×1350) whatever you upload ([C] [Planoly](https://www.planoly.com/blog/guide-to-instagrams-new-vertical-grid)), so a 3:4 asset shows uncropped.

### 5.5 Casting, diversity and representation
- **Be specific and honest.** Models skew to defaults unless told; one AI-ethics commentator says AI "may reinforce Eurocentric beauty ideals, such as light skin, straight hair and thinness" ([C] [ABC News](https://www.abc.net.au/news/2025-07-29/vogue-ai-model-controversy/105580372)). Specify depth + undertone, hair texture, body type, age 18–25 and cast several models in the sheet stage.
- **Reputational risk is real.** Levi's AI-diversity pilot drew "artificial diversity" criticism and a walk-back; Guess's Vogue AI model drew boycott calls over small-print disclosure ([C] [TechCrunch](https://techcrunch.com/2025/08/03/the-uproar-over-vogues-ai-generated-ad-isnt-just-about-fashion/); [C] [CNN](https://www.cnn.com/2025/07/31/style/vogue-ai-models-guess-campaign); [C] [Vogue](https://www.vogue.com/article/ai-models-are-here-can-they-actually-improve-fashion-representation): "Brands have a duty to be transparent when an image of a human is generated by AI").
- **Recommendation (mine):** don't use AI to *substitute* diversity for a student audience that notices; use AI people for mood/story, label them, and put **real students** (paid or credited) in UGC and in the hero real-sample shoot. Don't generate a likeness of a real, identifiable person; Flow blocks "prominent people" ([G] `flow-official-facts.md` §5).

---

## 6. Brand colour: black/white + a restrained orange

**What's documented.** Google's Nano Banana guides do not document hex input; they document references, descriptive colour language and targeted edits ([C] [Novoads review of Google's guides, Sept 2026](https://novoads.ai/en/blog/ai-image-brand-colors-hex-codes); [C] [Prompt Architects](https://prompt-architects.com/blog/563-colour-and-palette-prompting-getting-exact-colours): "Neither OpenAI's nor Google's current image-prompting guides mention hex codes"). Some community guides nonetheless claim Pro "accepts explicit color values" with examples like "precisely #1B2A4A" ([C] [Lovart](https://www.lovart.ai/blog/nano-banana-pro-free-tips)). **Disagreement** — treat hex as a nudge you must measure, not a spec.

**Workflow that survives both views** ([C] adapted from Novoads' 5 steps):
1. **Split exact zones from steered zones.** Exact: logo, any flat orange panel, text band. Steered: garment, set, light.
2. **Name the colour *and* the hex together:** "matte deep black (#0B0B0B)", "off-white (#F2F0EA)", "restrained signal orange (#[YOUR_HEX])" — colour-word + hex is the pattern vendors' own examples use.
3. **Add a swatch plate reference** (flat blocks of your three colours) and say what it's for: "the swatch image is the colour reference for the hoodie, the wall and the orange accent" (role-definition per Google).
4. **Tell it about the shadow side:** "keep the hoodie true black on both the lit and the shadow side" (Novoads' prompt shape).
5. **Fix drift with a regional edit**, not a re-roll: Select the area → "change only the [accent] to match the swatch" ([G] Flow Select tool; Novoads Step 4).
6. **Composite exact zones** and **eyedropper-check** the exported PNG (sample ~5 points per zone) — Novoads' acceptance test. Don't judge colour on a phone ([C] same).

**Black and white.**
- Models drift blacks to charcoal/blue and whites to cream. Counter with *neutral white balance at 5600K*, "true matte black… not charcoal", "off-white wall" ([C] aifreeapi lighting guide for the Kelvin wording; my phrasing for the rest — [unverified]).
- If a series looks warm/cool inconsistent, ask for a single grade line ("muted, slightly desaturated, neutral black point") in the shoot bible and fix stragglers by editing the shot to match the anchor.

**The orange accent.**
- Decide *where* orange lives and keep it to one: a gel spill on the wall, a rim light, a tiny sticker/tag, a stitch, a graphic rule. "Restrained" = ≤1 element per frame (my rule, [unverified]).
- **Lighting-gel wording** (untested in Flow — [unverified]; Google does endorse specifying light colour/grade terms: "golden hour backlighting", "cinematic colour grading with muted teal tones" — [G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)): "a single orange gel (#[HEX]) on the rim light from behind camera-left, key light stays neutral white", or "a soft orange gel spill on the wall behind the model".
- Warm-light vocabulary: warm light 2700–3500K gives orange/yellow; "golden hour backlighting with warm orange sun creating rim light" ([C] aifreeapi) — but real golden-hour orange tints the *whole* scene, so use gels/practicals when you want the garment to stay neutral.
- Brand-critical orange (logo tick, button, ad panel) = composite from the brand file.

---

## 7. Text and logo rendering

**What the vendors claim.** 2.1: "Enhanced text rendering and infographic layout accuracy" ([G] [model page](https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1)); Pro/2: "sharp, legible text" in 10+ languages ([G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)). Community tests call Pro "the industry's best text renderer" ([C] [Kittl review](https://www.kittl.com/blogs/kittl-review-nano-banana-pro/)). **What Google itself still warns:** "Rendering small text, fine details, and producing accurate spellings may not work perfectly" ([G] [tips](https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/)). Real-world: logos/packaging text "appear warped, blurry, or slightly distorted, even when I begin with a high-resolution source image" ([C] [r/nanobanana](https://www.reddit.com/r/nanobanana/comments/1nd6lq3/how_do_you_keep_textlogos_consistent_on_products/ndfmgzy/)).

**Rules for Acme.**
1. **Big, short, in-image text only on Pro:** ≤6 words, quoted exactly, font described (e.g. "lowercase geometric sans-serif, white") ([G] tips; [C] nanobananao "keep 3–6 word titles").
2. **Chest logo:** composite from the vector file; if you must keep the AI render, run Select on the logo area at a higher zoom with the logo as a reference, then compare against the original ("zoom in and combine them" — [C] Reddit above).
3. **Never let scenes contain legible text** unless you wrote it ("no readable text anywhere", "no signage") ([C] BananaBanana prompts).
4. **Typography posts:** generate the empty background ("leave clean negative space"), then set type externally with the exact brand font so spelling, kerning and colour are exact ([C] nanobananao: "Leave negative space for real typography later"; Novoads Step 5 "composite… text bands").
5. **Wordmark/logo design with AI** (if ever): silhouette-first — describe shape and composition before colour/style; "no text" so you add it later ([C] [Morphed](https://morphed.app/blog/nano-banana-prompts-for-logos)).
6. **Draft wording in chat first** (Cloud guide "text-first hack") when you do want in-image text ([G] Cloud guide).
7. **Minimal-typography post recipe:** ≤6 words · one weight · lots of margin · one accent element · export at 3:4 · check spelling letter by letter on the full-res file.

---

## 8. Editing, iterating, upscaling, aspect ratios, export

### 8.1 Iteration loop
1. **x4 at 1K-ish while exploring** on 2.1 (images effectively free [live]).
2. Pick one; **Save to Project**; branch edits from it ([G] Flow help).
3. **Global changes** (light, grade, background): conversational prompt with an explicit keep-list ([G] Cloud guide: "Be explicit about what to keep exactly the same").
4. **Local changes** (hand, logo, a wrinkle): **Select** + short delta prompt ([G] Flow help). A Gemini-forum user complains the Flow assistant "over-engineers" inpainting prompts — keep deltas short and literal ([C] [Gemini help thread](https://support.google.com/gemini/thread/459412730/g-flow-assistant-over-engineers-prompts-during-inpainting-image-editing-vs-concise-delta-prompts?hl=en)).
5. **Stop at ~3 edits per image;** if it still drifts, go back to History and re-prompt. Google warns about artifacts from complex edits ([G] tips).
6. **Promote** the final to **Pro** (re-run the prompt with the winner as reference) for hero/ad assets ([C] playbook §3.1).
7. **Vary lighting/colour in bulk** with Agent only after the base is locked ([G] Flow help).

### 8.2 Resolution
- Gemini API sizes for Nano Banana 2.1: 1K / 2K / 4K; for 3:4 → **896×1200 / 1792×2400 / 3584×4800**; 9:16 → 768×1376 / 1536×2752 / 3072×5504; 1:1 → 1024 / 2048 / 4096 ([G] [Gemini image docs](https://ai.google.dev/gemini-api/docs/image-generation)). Flow's exact export pixels may differ — [unverified]; read the downloaded file size.
- **Arithmetic (mine):** a 1080-wide Instagram 3:4 post (1080×1440) is **upscaled ~20%** from a 1K render (896 wide) — use 2K for anything you publish. Playbook says 2K upscale is available on any plan, 4K on paid via third-party documentation ([C] playbook §3.3) — confirm in the live UI.
- Don't use "upscale" prompts to repair a bad print — models can *add* plausible fabric texture rather than restore ([C] [GodOfPrompt](https://godofprompt.ai/blog/upscale-images-to-4k-with-nano-banana/)) which for a logo means a different logo.

### 8.3 Aspect ratios for Instagram when Flow offers 16:9 · 4:3 · 1:1 · 3:4 · 9:16 [live]
| Target | Flow ratio | Note |
|---|---|---|
| Feed portrait | **3:4** | IG added native 3:4 photo support in 2025 ([C] [The Verge](https://www.theverge.com/news/676549/instagram-3-4-aspect-ratio-photos-phones-square-rectangle)); profile grid previews at 3:4 (1013×1350) ([C] [Planoly](https://www.planoly.com/blog/guide-to-instagrams-new-vertical-grid)) |
| Feed 4:5 (if you prefer) | 3:4 + crop | Crop in Flow's **Crop** tool ([G]); 3:4→4:5 trims ≈6% of height (my arithmetic) |
| Stories / Reels / covers | **9:16** | Cover shows at 1013×1350 on grid, 1080×1350 in the Reels feed — keep key content in the middle ([C] Planoly) |
| Shops / Meta catalog | **1:1** | Catalog images display square, min 500×500, 1024×1024 recommended ([P] [Meta](https://www.facebook.com/business/help/686259348512056)) |
| Merchant Center | 1:1 or 3:4 | Min 500×500 from Jan 31 2027; no promo text/watermarks/borders ([G] [Product data spec](https://support.google.com/merchants/answer/7052112/product-data-specification)) |
| TikTok photo/cover | 9:16 | Standard vertical |

**Disagreement:** Influencer Marketing Hub says 3:4 (1080×1440) is "our preferred starting point" ([C] [IMH](https://influencermarketinghub.com/instagram-image-sizes/)); Planoly, Linearity and others still recommend **4:5** (1080×1350) because IG crops a 4:5 to 3:4 on the grid anyway ([C] Planoly; [C] [Linearity](https://www.linearity.io/blog/instagram-size-guide/)). Neither is Instagram's own documentation. **My call: 3:4** (what Flow gives natively, no crop, grid-true), and keep faces/print out of the outer 5%.

### 8.4 Export checks (before anything is published)
- [ ] Zoom 200% on the print edge, chest logo, any text: no warping, spelling OK.
- [ ] Hands, drawstrings, seams, hood — no melted geometry.
- [ ] Eyedropper the black, off-white, orange against the swatch plate (§6).
- [ ] Print scale/position matches the mockup (overlay at 50% opacity in an editor).
- [ ] No stray text in the scene; no third-party logos or lookalike trademarks.
- [ ] Metadata: inspect the file (exiftool/c2patool) for IPTC `DigitalSourceType` / Content Credentials. Google says Nano Banana API/Vertex outputs include C2PA + SynthID ([G] [Cloud guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)); Flow says all outputs carry invisible SynthID ([G] `flow-official-facts.md` §7). Whether Flow *downloads* embed C2PA/IPTC is **[unverified]** — test one file.
- [ ] Export PNG/JPEG straight from Flow (not a screenshot) to avoid stripping provenance (Merchant: "Don't remove embedded metadata" — [G] [Merchant](https://support.google.com/merchants/answer/14743464?hl=en)).
- [ ] Label per §9; keep an internal log of which images are AI / composite / real.

---

## 9. Policy and authenticity (as of mid-Oct 2026)

*I am not a lawyer; this is research, not legal advice. Re-verify before paid launch.*

### 9.1 Platform rules
| Platform | What the primary source says | Implication for Acme |
|---|---|---|
| **Google Merchant Center** | "All images created using generative AI must contain meta data indicating that the image was AI-generated" (IPTC `TrainedAlgorithmicMedia`); "Don't remove embedded metadata"; AI images allowed in `image_link`, `additional_image_link`, `lifestyle_image_link` ([G] [AI-generated content](https://support.google.com/merchants/answer/14743464?hl=en)). Image must "accurately display the product"; no promo text, watermarks or borders ([G] [Product data spec](https://support.google.com/merchants/answer/7052112/product-data-specification)). Misrepresentation: offers that "represent you or your products in a way that isn't accurate, realistic, and truthful" ([G] [Misrepresentation](https://support.google.com/merchants/answer/6150127?hl=en)) | Keep IPTC; main image = true product. AI lifestyle OK in lifestyle slot |
| **Meta catalogs (Shops/Instagram)** | "Images must accurately represent the specific product for sale"; main image should show the entire product; white backdrop recommended; no overlay text/watermarks ([P] [Meta](https://www.facebook.com/business/help/686259348512056)) | Same: true product, clean main image |
| **Meta ads** | Ad images created or significantly edited with Meta's gen-AI features, **or created/edited with third-party AI tools**, get an "AI info" label (in "About this ad", sometimes beside "Sponsored"); minor edits like resizing/colour correction don't ([P] [Meta Help](https://www.meta.com/help/artificial-intelligence/355108217670024/)) | Expect the label on any Flow-made ad image; plan creative accordingly |
| **Meta organic (IG)** | Label may be **required** for photorealistic *video* or realistic audio; "this requirement does not apply to images" but images may still be labelled if signals show AI; creators can self-label; penalties for unlabeled content when required ([P] [Meta Help](https://www.meta.com/help/artificial-intelligence/1783222608822690/)) | AI still images not mandatory to label *by this page*, but may be auto-labelled; Reels with realistic AI people/video → label |
| **TikTok organic** | Creators required to label realistic AIGC; labels via creator toggle or auto-label from C2PA; auto labels can't be removed ([P] [TikTok Help](https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content)) | Toggle AIGC on posts with realistic AI people/scenes |
| **TikTok ads** | AIGC (completely AI-generated or significantly modified) must carry the AIGC label or own disclaimer; "removing or modifying backgrounds" is *insignificant*; undisclosed AIGC → ad "rejected or restricted" ([P] [TikTok ads policy](https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-misleading-and-false-content); [P] [advertiser toggle](https://ads.tiktok.com/business/en-US/blog/enhancing-privacy-control-advertisers-users)) | Use the Ads Manager AIGC toggle for AI-generated people |
| **TikTok Shop sellers** | "AI-generated content is allowed, but you must be transparent and accurate. Do not use AI to mislead… about products" ([P, search-snippet only] [TikTok Seller US](https://seller-us.tiktok.com/university/essay?knowledge_id=491489038501663&lang=en)) | Same truth rule |
| **Shopify** | Shopify's own guide: make sure the generated image "accurately matches your product so you're not misleading your audience"; upload a reference shot ([C/vendor] [Shopify blog](https://www.shopify.com/blog/ai-image-generator)) — I found no Shopify rule requiring a label | Reference-locked images only |

### 9.2 Canada
- **Competition Act:** representations "false or misleading in a material respect" are caught; courts consider "the general impression it conveys, as well as its literal meaning"; material = could influence a purchase ([P] [Competition Bureau](https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/false-or-misleading-representations-and-deceptive-marketing-practices)). A Torys note applies this to photo manipulation, with corporate penalties up to the greater of $10M and 3× the benefit ([C/law-firm] [Torys](https://www.torys.com/en/our-latest-thinking/publications/2024/09/the-legal-implications-of-photo-manipulation-in-canadian-advertising)). The Bureau told ISED (Sept 23, 2026) there is "no 'AI exception' to the law"; no new AI label statute exists yet — consultation closed Sept 23 ([C/law-firm] [BLG, Oct 15 2026](https://www.blg.com/en/insights/2026/10/ai-transparency-the-competition-bureau-weighs-in)).
- **Disclaimers are weak medicine:** the Bureau's digest says the potential to mislead "increases significantly when a disclaimer is used to restrict, contradict or somehow negate the message" ([P] [Digest vol. 1](https://competition-bureau.canada.ca/en/deceptive-marketing-practices-digest-volume-1)); Ad Standards (Oct 2025): AI images that show product "benefits/attributes" should be disclosed (e.g. `#MadeWithAI`), must "remain truthful as to the benefits, results and attributes", and "a disclaimer cannot correct a misleading impression" ([P] [Ad Standards guidelines](https://adstandards.ca/wp-content/uploads/Ad-Standards-Influencer-Marketing-Disclosure-Guidelines-2025-10-08.pdf)). Those guidelines target influencer marketing; applying them to a brand's own posts is by analogy — [unverified].
- **IAB Canada / IAB framework (Jan 2026, voluntary):** consumer-facing disclosure when AI materially shapes content in a way that could mislead about authenticity or identity — including synthetic humans/images made entirely with AI; not for routine production edits; pair a visible label with C2PA metadata ([P] [IAB framework PDF](https://iabcanada.com/wp-content/uploads/2026/01/IAB_AI_Transparency_and_Disclosure_Framerwork_January_2026.pdf); [C] [Hologram summary](https://hologram.ca/en/radar/ai-disclosure-not-the-advertiser-alone/)).
- **If you ship to the US/EU:** a legal-blog summary says NY's synthetic-performer ad disclosure law took effect June 9, 2026 (unclear for stills), California SB 942 and EU AI Act Art. 50 transparency rules apply from Aug 2, 2026, and EU guidance (20 July 2026) treats a generated image of a product that misleads about the real product as a deepfake needing disclosure while "a real product against an AI-generated background" is not ([C] [Craftshift](https://craftshift.com/disclose-ai-generated-product-images-shopify-2026/)). Secondary source — verify before relying.

### 9.3 Recommended mix of real and AI imagery for Acme (my recommendation, built on the above)
| Tier | Where | Source of the garment pixels | AI allowed? | Label |
|---|---|---|---|---|
| **1. Truth tier** | PDP gallery, Merchant/Meta catalog, size/fit, materials, print close-ups | Real printed sample, or exact print file composited on a **true-to-blank** render | AI only for background/lighting (T15) or clearly labelled renders | Caption "Photographed sample" vs "Product render" |
| **2. Campaign tier** | Organic IG/TikTok feed, Reels covers, Stories | Reference-locked AI with the real art (T3–T6) | Yes, with realistic AI people labelled | Toggle AIGC on TikTok; consider a short line "AI-generated imagery" in caption for realistic people; keep metadata for Meta's auto-label |
| **3. Mood tier** | Quote cards, graphics, textures, backgrounds, abstract lab imagery | Not a product claim | Yes | None required beyond platform tools |
| **4. Paid tier** | Meta/TikTok ads | Prefer real sample photo + AI background; AI-people ads only with label | Yes, expect "AI info"/AIGC labels | Use Ads Manager toggle |

Rules that make it safe in practice:
1. **Never** use AI to show fit/size, fabric weight, ink/print feel, or colour you haven't verified against the blank — those are the claims customers buy on (Competition Act "general impression").
2. **Order samples before launch** (even 2 hoodies + 2 tees in each colourway). Shoot a one-hour real set (phone + window light is fine), put one real back-view and one real macro in every PDP, and use those as ground truth to calibrate AI colour/drape.
3. **Pre-launch pre-sale:** if you take pre-orders before samples exist, say "concept renders" next to those images and swap them for real photos as soon as available.
4. **Real people in UGC**; AI "students" are for aesthetic/mood content, not testimonials (Ad Standards, T13).
5. **Keep a provenance log** per asset: real / AI / composite; prompt; refs; date. Cheap, and useful if a platform or customer asks.
6. **Don't strip metadata** (Merchant) and do not remove SynthID/C2PA (Flow says leave SynthID alone — [G] playbook §0).
7. Re-check Meta/TikTok/Merchant pages before paid launch — these changed several times in 2025–26 ([C] [PodVector](https://podvector.ai/articles/ai-analytics/ai-overview/the-pod-sellers-guide-to-ai-for-ecommerce-photos)).

---

## 10. Acme image starter kit (6 prompts, ready to use)

**Before any of them:** set the Flow model to **Nano Banana 2.1** (not Lite), ratio **3:4** (9:16 only where stated), outputs **x4**, and attach the listed ingredients. Prepare the files in §2.2. Replace `[...]`. Run in this order; each unlocks the next.

### K1 — Model sheet on a blank tee (identity anchor)
**Refs:** none (generate), or one reference photo of a consenting real person if you want a specific look. **Output:** save as Character `@[Name]`.
```
Create a clean model sheet of a [22-year-old man / woman, medium warm skin with olive undertone, short textured black hair, athletic-slim build] on a plain warm-grey seamless background, wearing a plain black oversized t-shirt with no print, labels or lettering. Show front view, three-quarter view, side view and back view in one neat lineup with identical scale and lighting: large softbox from front-left, neutral white balance, 85mm, natural skin texture, calm neutral expression.
```
**Why:** consistency starts with a clear anchor and a four-angle sheet that includes the **back** ([C] [Krea](https://www.krea.ai/blog/30-best-nano-banana-prompts-to-copy-paste-in-2026); [C] RunDiffusion front/side/back workflow). Make one man, one woman, ideally 2 casts each.

### K2 — Ghost-mannequin front hero (catalog)
**Refs:** *front flat mockup of the black hoodie with the chest logo.* → **T1** verbatim, 3:4 then crop/1:1 for catalogs. **Check:** logo; if off, composite the real logo.

### K3 — On-model BACK hero, studio cyc (the key image)
**Refs:** *model sheet (back view)*, *back flat mockup (print placed)*, *print art on plain background*.
```
Create a photorealistic full-length fashion photograph of the model from the model sheet, seen from directly behind, standing relaxed with arms by their sides, wearing the oversized black hoodie from the back-view mockup, hood down and tucked forward so the whole back is visible. The back graphic is an exact copy of the artwork in the print reference: [one-line description, e.g. "fine white line-art of a neuron, 28 cm wide"], centred between the shoulder blades, same size and position as in the mockup. Seamless off-white cyclorama wall and floor, large softbox front-left with a bounce card, soft contact shadow, true matte black fleece (not charcoal), neutral 5600K white balance, 85mm at f/5.6, eye-level. Boxy oversized fit, dropped shoulders, sleeves covering the knuckles, soft natural creases across the lower back.
```
**Why:** every element is traceable to a source in §2–§6. **Run x4; pick; then Pro promote.** If print fails 2 rounds, switch to route B (blank hoodie + composite).

### K4 — Campus lab lifestyle (Neuroscience), back to camera
**Refs:** *model sheet*, *back flat mockup (Neuroscience design)*, *K3 winner* (as style/light anchor).
```
Create a photorealistic lifestyle photograph, shot from behind at eye level, of the model from the sheet walking away down a quiet teaching-lab corridor with glass walls, wearing the oversized black hoodie from the back mockup with its back graphic visible and unchanged. Cool fluorescent light mixed with soft window light, one small orange safety-sign-coloured accent far down the corridor as the only colour, shallow depth of field, 35mm at f/2, mid-stride, documentary feel. No readable text anywhere in the scene.
```
**Why:** T5/T6 pattern; back-to-camera hides faces/hands and showcases the print; orange accent limited to one background element ([C] §6).

### K5 — Macro of the print and stitching
**Refs:** *print art*, *back flat mockup*. → **T7** verbatim, 3:4. **Label as AI render** on social; do not use as the PDP macro.

### K6 — Orange-accent ad frame with copy space (feed + story)
**Refs:** *K3 winner*, *swatch plate*.
```
Create a minimalist advertising photograph: the model from the reference seen from behind in the oversized black hoodie (back graphic unchanged) in the left third of the frame, a large clean area of seamless off-white wall on the right two-thirds left empty for headline text, one soft orange gel spill (colour #[YOUR_HEX], matching the swatch reference) on the wall as the only colour accent, large softbox front-left, 85mm. No text in the image.
```
Then run the same prompt with **9:16** for Stories and add copy in an editor. **Why:** T12 + §6 + §7. Expect Meta's "AI info" label if used as an ad ([P] Meta).

**Not in the kit (do manually):** the real-sample photo set (§9.3), the typographic quote card (T14 — set type externally), and the colourway edits (T8 — only for colours the blank actually comes in).

---

## 11. Quick prompt-writing cheat sheet
1. Verb first ("Create…", "Edit the supplied photograph…", "Transform…").
2. Role of every reference in plain words.
3. Subject + action + place + composition + style ([G] Cloud formula) → then camera, light, grade.
4. Material and fit words, not adjectives.
5. Print: description + size + position + "exact copy of the print reference".
6. Keep-list for edits; positive framing.
7. Text: quoted, ≤6 words, font style, location — or none.
8. Colour: name + hex + swatch ref + shadow-side line.
9. One variable per round; branch from History.
10. Check at 200% and with an eyedropper.

---

## 12. Where sources disagree
- **Hex codes:** Lovart says Pro "accepts explicit colour values" ([C]); Novoads and Prompt Architects say Google's guides don't document hex and exactness isn't promised ([C]). → measure and composite.
- **"Keep identical" phrasing:** many guides use "preserve exactly / zero alterations" ([C] Vidzy, nanobananao); apiyi's FAQ says absolute phrases like "pixel-perfect restore" make the model redraw ([C]). → concrete attributes + one short keep clause + retry.
- **3:4 vs 4:5 on Instagram:** IMH prefers 3:4; Planoly/Linearity prefer 4:5; Instagram's grid shows 3:4 either way (see §8.3).
- **Default model in Flow:** Flow help says Pro; models page says 2 Lite is the free default; team live-check says 2.1 ([G]/[live], playbook §0).
- **Meta ad rejection:** one e-commerce blog says undisclosed AI ads are "an active reason for ad rejection" ([C] [Common Thread](https://commonthreadco.com/blogs/coachs-corner/meta-ai-ad-labels-mandatory-disclosure-ecommerce-2026)); Meta's help page describes automatic "AI info" labelling and says nothing about rejection ([P]). → treat the blog claim as [unverified].
- **Whether AI product-only images need a label:** a legal blog says no for NY/CA, yes in the EU if misleading about the product ([C] Craftshift); TikTok/Meta rules above are about AI-generated content generally. → label people; keep product honest.
- **Which model for text:** Google says Pro and 2 "excel" at text; the same Google post says small text/spelling is imperfect. Both true; short big text OK, fine print no.

## 13. Open questions (need a live Flow test, not more research)
1. How many **image ingredients** can a Flow image prompt take, and in what order are they passed? (Not documented.)
2. Does Flow's **Draw → Rectangle** box act as a placement constraint for adding a print?
3. Does a downloaded Flow image contain **C2PA/IPTC `TrainedAlgorithmicMedia`** metadata (needed for Merchant)?
4. Flow's real **export pixel sizes** for 3:4 at 1K/2K, and whether 2K upscale is free on the current plan.
5. Does **Agent** pick Pro or 2.1 for apparel edits, and does it preserve references as well as the manual prompt box?
6. Can the exact **orange hex** be held across 9 frames with a swatch plate alone, or must it always be composited?
7. How does 2.1 handle **fine white line-art on black fleece** at back-print scale (route A vs B)?
8. Which Canadian lawyer-approved **caption wording** do you want for AI-generated people (Competition Act + Ad Standards)?

---

## 14. Source index (all URLs used above)

**Google first-party [G]**
- https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/
- https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana
- https://ai.google.dev/gemini-api/docs/image-generation
- https://ai.google.dev/gemini-api/docs/models/gemini-nano-banana-2.1
- https://support.google.com/flow/answer/16729550?hl=en
- https://support.google.com/flow/answer/16353334?hl=en
- https://support.google.com/flow/answer/16935308
- https://support.google.com/merchants/answer/14743464?hl=en
- https://support.google.com/merchants/answer/7052112/product-data-specification
- https://support.google.com/merchants/answer/6150127?hl=en

**Platform / regulator primary [P]**
- https://www.meta.com/help/artificial-intelligence/355108217670024/
- https://www.meta.com/help/artificial-intelligence/1783222608822690/
- https://www.facebook.com/business/help/686259348512056
- https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content
- https://ads.tiktok.com/resources/help/article/tiktok-ads-policy-misleading-and-false-content
- https://ads.tiktok.com/business/en-US/blog/enhancing-privacy-control-advertisers-users
- https://seller-us.tiktok.com/university/essay?knowledge_id=491489038501663&lang=en (search-snippet only)
- https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/additional-information-about-competition-act
- https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/false-or-misleading-representations-and-deceptive-marketing-practices
- https://competition-bureau.canada.ca/en/deceptive-marketing-practices-digest-volume-1
- https://adstandards.ca/wp-content/uploads/Ad-Standards-Influencer-Marketing-Disclosure-Guidelines-2025-10-08.pdf
- https://iabcanada.com/wp-content/uploads/2026/01/IAB_AI_Transparency_and_Disclosure_Framerwork_January_2026.pdf

**Law-firm / news / community [C]**
- https://www.blg.com/en/insights/2026/10/ai-transparency-the-competition-bureau-weighs-in
- https://www.torys.com/en/our-latest-thinking/publications/2024/09/the-legal-implications-of-photo-manipulation-in-canadian-advertising
- https://hologram.ca/en/radar/ai-disclosure-not-the-advertiser-alone/
- https://craftshift.com/disclose-ai-generated-product-images-shopify-2026/
- https://commonthreadco.com/blogs/coachs-corner/meta-ai-ad-labels-mandatory-disclosure-ecommerce-2026
- https://www.shopify.com/blog/ai-image-generator
- https://podvector.ai/articles/ai-analytics/ai-overview/the-pod-sellers-guide-to-ai-for-ecommerce-photos
- https://www.printful.com/blog/clothing-photography
- https://novoads.ai/en/blog/ai-image-brand-colors-hex-codes
- https://prompt-architects.com/blog/563-colour-and-palette-prompting-getting-exact-colours
- https://www.lovart.ai/blog/nano-banana-pro-free-tips
- https://www.aifreeapi.com/en/posts/nano-banana-2-lighting-guide
- https://morphed.app/blog/nano-banana-prompts-for-logos
- https://www.kittl.com/blogs/kittl-review-nano-banana-pro/
- https://nanobananao.com/blog/nano-banana-common-failures-fixes/
- https://nanobananao.com/blog/nano-banana-pro-social-media-brand-batch-workflow/
- https://docs.apiyi.com/en/faq/nano-banana-pro-print-distortion
- https://bananabanana.pro/prompts/fashion-lookbook
- https://www.nanobananaimages.com/blog/nano-banana-fashion-photography-prompts
- https://getvidzy.com/prompt-library/product-flat-lay-to-ghost-mannequin/
- https://nanobananatool.com/blog/nano-banana-2-virtual-try-on
- https://www.nenobanana.com/blogs/character-consistency-in-nano-banana
- https://nanobanana-ai.us/en/tutorials/character-consistency/
- https://nanobananapro.cloud/guides/character-consistency
- https://www.rundiffusion.com/nano-banana-2-consistent-character-images
- https://www.krea.ai/blog/30-best-nano-banana-prompts-to-copy-paste-in-2026
- https://topfreeprompts.com/prompts-for/nano-banana-image-prompts
- https://adlibrary.com/guides/ai-prompting-guide-ugc-content-creators
- https://godofprompt.ai/blog/upscale-images-to-4k-with-nano-banana/
- https://www.theverge.com/news/676549/instagram-3-4-aspect-ratio-photos-phones-square-rectangle
- https://www.planoly.com/blog/guide-to-instagrams-new-vertical-grid
- https://influencermarketinghub.com/instagram-image-sizes/
- https://www.linearity.io/blog/instagram-size-guide/
- https://techcrunch.com/2025/08/03/the-uproar-over-vogues-ai-generated-ad-isnt-just-about-fashion/
- https://www.cnn.com/2025/07/31/style/vogue-ai-models-guess-campaign
- https://www.vogue.com/article/ai-models-are-here-can-they-actually-improve-fashion-representation
- https://www.abc.net.au/news/2025-07-29/vogue-ai-model-controversy/105580372
- https://www.reddit.com/r/nanobanana/comments/1p10qfq/how_to_edit_products_with_text/
- https://www.reddit.com/r/nanobanana/comments/1nd6lq3/how_do_you_keep_textlogos_consistent_on_products/ndfmgzy/
- https://www.reddit.com/r/nanobanana/comments/1phsrmb/text_distortion_issues_product_labels/
- https://www.reddit.com/r/nanobanana/comments/1p58vvo/what_am_i_doing_wrong_on_nano_banana/
- https://www.reddit.com/r/printondemand/comments/1ksy1yz/ai_mockups/
- https://www.reddit.com/r/nanobanana2ai/comments/1rhzigy/how_to_create_viral_ai_ugc_mirror_selfies_with/
- https://support.google.com/gemini/thread/459412730/g-flow-assistant-over-engineers-prompts-during-inpainting-image-editing-vs-concise-delta-prompts?hl=en

**Method notes.** Reddit/TikTok-seller/YouTube pages mostly returned only snippets through the extractor, so Reddit claims are limited to what the snippets state. No YouTube transcript was retrievable (the one T-shirt mockup video I found returned no text), so no claim here rests on video. Nothing was run against Flow or Google services.
