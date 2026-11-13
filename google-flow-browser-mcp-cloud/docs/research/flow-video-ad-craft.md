# Flow Video Ad Craft — Veo 3.1 (Lite/Fast/Quality) + Gemini Omni 1.1 Flash for Acme

**Written:** 2026-10-16 (web research only; nothing generated in Flow, no credits spent, no login).
**Audience:** Acme's agent driving Flow through the browser MCP, making Reels/TikTok/paid ads for an oversized-hoodie/tee streetwear brand (black/white + restrained orange, subtle science symbols).
**Builds on (not repeated here):** `flow-creative-playbook.md`, `flow-official-facts.md`.

## How to read this
- **[G]** = published by Google (Google blog, support.google.com/flow, ai.google.dev, docs.cloud.google.com, deepmind.google) or by the platform that owns the rule (TikTok Ads). **[C]** = community / vendor / blog / Reddit — reported behaviour, often marketing-adjacent. **[unverified]** = could not confirm. **[inference]** = my reasoning from sourced facts.
- Where sources disagree the disagreement is stated, not averaged. Source age is flagged when older than ~6 months (before ~April 2026).
- **Live-verified facts that WIN over everything below** (from the task brief): Extend does not exist in the shipped UI; the Frames-to-Video entry point is unreachable (substitute = save-frame → upload → use as ingredient); clip length is set by the prompt string ("Video length: 8 seconds."); default video model is Omni 1.1 Flash (4s 720p ≈ 7 cr); Veo Quality = 100 cr and never default; account is PRO (no 4K).
- **Consequence for this doc:** every technique below that Google/third parties describe as "first/last frame" or "extend" is rewritten for ingredients/reference images, timecoded cuts, or Omni video edits. Anything that still needs a Frames control is marked **[needs Frames — blocked]**.
- Third-party hosts (fal, Runware, Atlas Cloud) expose **API** parameters. Flow's UI may not expose the same tags, counts or sampling controls. Treat API-only syntax as [unverified in Flow] until tried at 360p (4–5 cr).

---

## 0. The 14 rules that matter most
1. **Open with the camera, one move only, then say "in a single unbroken scene."** Omni cuts by default; the fix is one clause. [G] https://ai.google.dev/gemini-api/docs/omni (Single scene) · [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/prompting
2. **Garment = image-to-video / ingredient from a real packshot, never text-only.** Text-only invents a garment: "prints drift, logos smear." [C] https://www.wearview.co/blog/best-ai-video-generator-for-clothing-brands · https://morphed.app/blog/ai-video-generator-for-fashion
3. **The video model never draws the logo, captions or CTA.** Composite them. Even Google's model card admits "rendering perfectly accurate text remains a challenge." [G] https://deepmind.google/models/model-cards/gemini-omni-flash/ · [C] https://hermoso.ai/blog/why-ai-ads-look-fake/
4. **Weight is the realism tell for streetwear.** Say "heavy / thick / structured / slow sway", never "flowing" for a fleece hoodie. [C, vendor] https://hailuoai.video/pages/knowledge/realistic-hoodie-motion-ai-video-fashion-guide
5. **Light is the price tag.** One named source, direction and quality ("hard side light for texture", "overcast", "single orange gel as rim"). Avoid stacks like "premium cinematic viral." [C] https://oakgen.ai/blog/ai-product-video-prompt-guide
6. **Write audio as direction, and say "no music" / "no dialogue" when you mean it.** Silence about sound gets you the model's own score. [G] https://ai.google.dev/gemini-api/docs/omni (Prompting the audio) · [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/prompting
7. **Veo 3.1 Lite ≈ Fast in Google's own eval at half the credits** (Lite won 54.6% T2V / 47.2% I2V vs Fast). Default Veo = Lite. [G] https://deepmind.google/models/model-cards/veo-3-1-lite/
8. **Quality (100 cr) has no ingredients** → with Frames unreachable it is text-only → it will invent your product. Use it only for product-free atmosphere shots. [G] https://support.google.com/flow/answer/16352836?hl=en · [inference]
9. **Budget 3–5 takes per keeper for easy shots, 5–10 for hands/garment fidelity/dialogue; 25 at broadcast level.** [C] https://www.screenweaver.ai/blog/produce-ad-with-ai-workflow · https://dev.to/heojunfoi/what-one-usable-ai-video-clip-actually-costs-in-2026-8-tools-real-math-175f
10. **First second must already be moving and must pay off inside 1s.** [C] https://tools.scult.in/prompts/veo/veo-short-form-hook-vertical · https://www.landing.partners/blog/meta-reels-ads-fashion-brands-short-form-video-2026
11. **7–15s is the paid fashion sweet spot; 30s rarely wins.** [C, agency across 40+ fashion clients] https://www.landing.partners/blog/meta-reels-ads-fashion-brands-short-form-video-2026
12. **Dialogue: colon, no quotes (Google's Cloud rule) — but A/B it once at 360p because sources disagree** (§2.4). [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice
13. **Disclose.** Meta labels AI ads automatically in many paths; TikTok Ads has an AIGC toggle; YouTube auto-labels. [C/G] §7.6
14. **Never reword a blocked prompt more than twice.** Change one risk factor at a time (§8.2).

---

## 1. Model personalities (what each is actually for)

### 1.1 Side-by-side
| | **Omni 1.1 Flash** | **Veo 3.1 Lite** | **Veo 3.1 Fast** | **Veo 3.1 Quality** |
|---|---|---|---|---|
| Flow credits (non-Ultra) | 7/10/12/15 (4/6/8/10s, 720p); 4/5/6/7 at 360p | 10 | 20 | 100 (8s only) |
| Lengths | 4/6/8/10s | 4/6/8s | 4/6/8s per Google | 8s per credits table |
| Ingredients/refs | Yes | Yes, 8s only | Yes, 8s only | **No** |
| Edits an existing video | **Yes (only model)** | No | No | No |
| Strength per sources | Iteration, edits, references, dialogue, 10s, cheap 360p | Cheap blocking tests, equals Fast per Google eval | Social-length variations | Reviewed hero shot |
| Weakness per sources | "Reads more like a draft", wobbles on complex multi-object motion, drifts across edits | No 10s | 2× Lite | 5× Fast; cannot use product refs |
Sources: Flow limits/credits [G] https://support.google.com/flow/answer/16352836?hl=en · https://support.google.com/flow/answer/16526234?hl=en. Strength/weakness column [C]: https://www.hitpaw.com/ai-model-tips/gemini-omni-flash-vs-veo-3-1.html · https://higgsfield.ai/blog/gemini-omni-flash-vfx-video-editing · https://www.veo3gen.app/blog/veo-31-in-flow-model-modes-lite-vs-fast-vs-quality-the-practical-picker-for-crea

### 1.2 Where sources disagree
- **Which looks better.** HitPaw and Higgsfield (both vendors) say Veo is more cinematic/steadier in complex motion and Omni is the iteration model ("Omni to develop the shot, Veo for the locked render"). A Reddit r/VEO3 poster (~4 months old, single opinion, no method) says even Veo Fast beats Omni on realism: "too AI-ish". Another thread, same sub, is split. Google does not publish a head-to-head. **[C, conflicting] treat as "test on your shot".** https://www.hitpaw.com/ai-model-tips/gemini-omni-flash-vs-veo-3-1.html · https://www.reddit.com/r/VEO3/comments/1tqkrav/is_omni_flash_video_quality_worst_than_veo_31_fast/ · https://www.reddit.com/r/VEO3/comments/1tsvy6u/which_one_do_you_guys_think_is_better/
- **Veo Fast 10s?** veo3.dev says Flow lists Fast at 10s; Google's models page lists Veo 3.1 at 4/6/8 only. Google wins; **10s = Omni only.** https://veo3.dev/blog/veo-3-1-lite-vs-fast-vs-quality vs https://support.google.com/flow/answer/16352836?hl=en
- **Omni reference counts.** Runware: up to 7 images + 3 videos. Morphic: 10 images + 3 clips. Google API docs: video refs max 3 clips × 3s, audio in a video ref ignored; image count not stated in the sections I read. Flow's UI limit = [unverified], check the picker. https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/reference-driven-video · https://morphic.com/resources/how-to/gemini-omni-flash-1-1-guide · https://ai.google.dev/gemini-api/docs/omni
- **Quality tier on API vs Flow naming.** Flow's "Quality" ≈ API "Standard" (`veo-3.1-generate-preview`); API features ≠ Flow features. [C] https://veo3.dev/blog/veo-3-1-lite-vs-fast-vs-quality

### 1.3 Decision rules for Acme
| Shot need | Model | Why |
|---|---|---|
| Hook ideas, camera tests, colour/light tests | **Omni 360p (4–7 cr)** | Google: 360p is "up to 60% faster and at a third of the cost"; Pro can upscale 360p→720p for 0 cr [G] https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/ · https://support.google.com/flow/answer/16352836?hl=en |
| Anything with the real hoodie + a person | **Omni 720p with reference ingredients** or **Veo Lite 8s with ingredients** | both accept refs; Lite is 10 cr flat for 8s |
| Talking UGC line | **Omni** | native lip-synced speech; a spoken line is first-class in Google's prompt guide [G] https://ai.google.dev/gemini-api/docs/omni |
| 10s uninterrupted beat | **Omni** only | Veo ≤ 8s |
| Product-free atmosphere (fabric-less macro, street, fog, concrete) | **Veo Quality once** after it works on Lite | no refs needed; fidelity is the only remaining risk [C] https://veo3.dev/blog/veo-3-1-lite-vs-fast-vs-quality |
| Fix one thing in a good clip | **Omni edit** (Google lists 40 cr) | but see price conflict §3.7 |
| Many colourways of one motion | usually **regenerate with a new ref (7–12 cr)** not edit (40 cr) | [inference] from Google's edit price; fal pitches 1 gen + N edits [C] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1 |

---

## 2. Prompt grammar that carries into every recipe

### 2.1 Omni 1.1 Flash — five elements, sound included
Order: **shot framing + motion → style → lighting → location → action**, 3–4 sentences, then audio. "Every element names a decision a director would still have to make… Don't describe what the model already knows (wet asphalt reflects)." [C, Runware's docs for Google's model] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/prompting
Google's own components list starts from the subject, because specificity prevents generic output; its examples use named moves like dolly zoom, snap zoom, whip pan, 360° orbit. [G, as relayed by fal] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1 · https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/

### 2.2 Veo 3.1 — cinematography first
Google Cloud: anatomy = subject, action, scene, camera angle/movement, lens, lighting, mood, style, temporal, audio, cinematic terms. "Some advanced camera lenses are not officially supported — results may vary." [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide
Single-scene rule: chaining A-then-B-then-C in one short prompt "often leads to muddled or incomplete videos." [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice

### 2.3 Image-to-video / ingredient prompts: motion only
Google: the source image already holds subject, scene and style; **do not re-describe it**; prompt camera motion, subject animation or environmental animation; call the person "the subject/the woman/she". Camera motion alone is "the simplest and most reliable" way to add dynamism. [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice
Reference mode adds a **pin clause** at the end: name the wardrobe/finish/label/palette that must not change; reference by position ("the hoodie from the first reference image"); portrait refs should be waist-up on a neutral background. [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/reference-driven-video
Don't mix reference mode with frames or a source video — they are exclusive modes in the API. [C] same page. In Flow terms: run the reference pass first, then edit.

### 2.4 Quotes vs colon, "no X" vs positive — the live disagreements
| Question | Position A | Position B | Recommendation |
|---|---|---|---|
| Dialogue punctuation | Google Cloud: use a colon, **avoid quotation marks** so the model doesn't render the words as on-screen text. [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice | Runware and fal examples for Omni use quoted lines with correct lip-sync. [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/prompting · https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1 | Default `She says: Midterms week, this is the uniform` (no quotes). If speech doesn't trigger, retry with quotes. Field test sided with colon [C] https://github.com/raphaelbgr/ai-video-prompting/blob/main/skills/veo-flow-prompting/SKILL.md |
| Negatives | Google Cloud Veo guide: avoid "no/don't", describe the unwanted thing as plain nouns. [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide | Google's Omni doc: simple negatives ("No dialogue", "No embellishments") are fine. [G] https://ai.google.dev/gemini-api/docs/omni. Vendor guides: end every prompt with "No subtitles, no captions, no on-screen text, clean frame." [C] https://prompt-helper.com/blog/veo-negative-prompts-troubleshooting/ | Omni: use short "no X". Veo: write the clean frame positively ("a clean frame with no subtitles") — compromise that satisfies both. |
| Seed/temperature | Google Cloud suggests "same seed" for consistency. [G] best-practice URL above | Google's Omni API doc says temperature/top_p/negative prompts/system instructions are **not supported**; Runware exposes temperature. [G] https://ai.google.dev/gemini-api/docs/omni vs [C] Runware | Flow's UI shows neither → ignore. |

### 2.5 Timecoded multi-shot (Omni) — your intentional cut tool
Google documents natural language ("After 3 seconds…", "Every 2s cut to a new frame") and a `[0-3s] … [3-6s] …` timecode syntax; with references: `[0-3s] A studio fashion sequence. Starting with woman <IMAGE_REF_0>, she is holding <IMAGE_REF_1>`. [G] https://ai.google.dev/gemini-api/docs/omni (Timing events; Using tags). Whether Flow's `@` ingredient mentions map onto `<IMAGE_REF_N>` is **[unverified in Flow]**; use `@name` per Flow help and describe roles in words.
Observed behaviour: a 10s Omni clip asked for "one free throw" came back as multiple angles "like a sports replay". [C, Oct 2026 free-account test] https://aialleyway.com/gemini-omni/ — so *unplanned* cuts are the default; either exploit them with timecodes or suppress with the single-scene clause.

---

## 3. Omni 1.1 Flash specifics

### 3.1 Single scene vs deliberate cuts
- Suppress: "in a single unbroken scene", "in a single continuous shot", "no scene cuts". [G] https://ai.google.dev/gemini-api/docs/omni
- Don't mix grammars: a cutting prompt describes beats; a single-scene prompt describes one continuous move. [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/prompting
- Exploit: a 6–10s ad can contain 2–3 planned cuts via timecodes (recipes R6, R11).

### 3.2 Audio and dialogue
- Default = model scores it itself, often with music; "include calm background music" / "high energy techno beat" are valid; so is "no music". [G] https://ai.google.dev/gemini-api/docs/omni
- Name each foley element and each ambience layer; Runware shows "sharp individual clack of each keypress" style. [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/prompting
- Keep dialogue to one line (≤ ~10 words). A 10s clip with a camera move should "cut words before cutting the shot." [C] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1
- Voice consistency across clips: paste the *entire* voice description unchanged into each prompt ("crisp and clear, with a thoughtful tone…"). [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice
- Voice refs only attach to ingredient-based generations (Flow rule from the playbook; keep). Google restricts editing people's *speech* for now. [G] https://deepmind.google/models/model-cards/gemini-omni-flash/
- Native speech for on-camera mouths; TTS only over shots with no visible mouth (dubbed-lip tell). [C] https://hermoso.ai/blog/why-ai-ads-look-fake/

### 3.3 Reference images and reference videos
- Image refs serve three jobs: identity, product, style. Product is "the strictest": shape, finish and label must survive. Style: name the ingredients (palette, outline weight, grain), not "in the style of the reference." [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/reference-driven-video
- **Reference video** = identity *and motion signature*, max 3 clips × 3s, audio ignored. Use case for you: feed a 3s keeper of the walk or dolly you liked as `VIDEO_REF` to reproduce that camera speed and height on a new shot: "Match the camera to the dolly move in <VIDEO_REF_0>, same speed, same height off the floor." [G] limits https://ai.google.dev/gemini-api/docs/omni · [C] example https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1. Availability in Flow's UI = [unverified].
- Google says video refs "work best with likenesses" and multi-video reasoning is unsupported. [G] https://ai.google.dev/gemini-api/docs/omni (Limitations)
- Reference-driven characters held face/hat/coat in a free-account Flow test; a single image reference kept a balloon's colour/shape in a new angle. [C] https://aialleyway.com/gemini-omni/

### 3.4 Video-to-video edit prompts
- **Rule:** one change + "Keep everything else the same." Long edit prompts change more. [G] https://ai.google.dev/gemini-api/docs/omni (Prompts for editing)
- Pattern with preservation: "Put the bag on a pale limestone block and warm the background to a soft sand tone. Keep the bag itself, the key light, the shadow direction and the camera move exactly as they are." [C] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1
- Strongest on single-element changes; multi-element interaction edits are weak. [C] https://higgsfield.ai/blog/gemini-omni-flash-vfx-video-editing
- Flow allows up to 3 conversational turns before context is lost (Google). A third-party tester measured 4 solid turns and drift by turn 5. [G] https://support.google.com/flow/answer/16935718?hl=en · [C] https://promptslove.com/blog/gemini-omni-1-1-flash-review/
- Edits are *new generations* (a free-account test turned a 4s clip into an 8s edit). [C] https://aialleyway.com/gemini-omni/

### 3.5 10-second clips
Only Omni makes them. Use them for (a) one uninterrupted orbit/tracking move or (b) a timecoded 3-beat mini-sequence. Costs 15 cr at 720p, 7 at 360p. Sports-footwear example from fal: 9:16, 8s, "cut as one unbroken take… the camera stays locked to the runner for the whole take." [C] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1

### 3.6 360p drafts
Draft at 360p, promote only winners. Google: 360p "up to 60% faster and at a third of the cost" (API); Flow's table: 4/5/6/7 cr vs 7/10/12/15. Pro can upscale 360p→720p free. [G] links in §1.3. Real-world note: a 360p vertical clip looked "softer than the 720p clips" and lighting/stone texture still held. [C] https://aialleyway.com/gemini-omni/ Unknown: whether upscaled-360p ≈ native-720p for faces/lip-sync — **test once on Acme's hero shot before committing the whole pipeline to upscales.**

### 3.7 The edit-price conflict
Google credits page: edits "40 credits for all users". Useapi (third-party API wrapper): 20 at 720p / 10 at 360p. A free-account Flow test on 2026-10-06 was quoted **and charged 10 cr** by the agent for a 360p edit. [G] https://support.google.com/flow/answer/16526234?hl=en · [C] https://aialleyway.com/gemini-omni/ · see `flow-official-facts.md`. **Budget 40, accept whatever the card says, and read the card before approving.**

### 3.8 Omni as a copilot (agent-friendly)
Google recommends asking Gemini to act as "expert prompter" (give it the packshot, ask for a comprehensive prompt) *before*, and to evaluate the finished clip "against company or brand guidelines" *after*. This is directly usable by Acme's agent as a QC pass on each keeper. [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice

---

## 4. Apparel shot recipes (15, copy-ready)
Conventions: replace `[HOODIE REF]` with the Flow ingredient name (`@name`). Never put "Acme" or any brand/designer name in a prompt; say "unbranded" or describe the print. Set 9:16 and length in the UI/prompt string; **do not also write "vertical 9:16" in the text** (can double-apply) [C] https://github.com/raphaelbgr/ai-video-prompting/blob/main/skills/veo-flow-prompting/SKILL.md. Cast as "a woman/man in their early twenties" (adult). The recipes are my composition from the cited vocab; each "Why" names the sourced principle.

**R1 — Hoodie reveal on a white cyc (Omni 720p, 6s, ~10 cr)**
```
A slow push-in at chest height, in a single unbroken scene with no cuts. Minimalist fashion-campaign
cinematography, restrained and high-contrast, 50mm lens, shallow depth of field. A seamless white
cyclorama studio lit by one soft overhead key and a single saturated orange gel strip light grazing the
floor behind the subject. A woman in her early twenties faces camera in the oversized heavyweight black
hoodie from @hoodie-ref, hood up, and lowers the hood with both hands in one slow motion, the thick
fleece folding and settling on her shoulders. Keep the silhouette, ribbed cuffs and drawcords identical
to the reference. The audio is quiet studio room tone and the soft brush of fleece, no music, no
dialogue. A clean frame with no text.
```
Why: camera-first + single-scene clause + pin clause + named audio (§2.1/2.3). Gel as a *named light source* instead of "brand orange" (Kinovela warns colour adjectives bias the whole frame; grade exact hex in post) [C] https://kinovela.com/insights/ai-video-brand-consistency

**R2 — Fabric weight and drape (Veo Lite 8s with ingredient, 10 cr)**
```
Medium shot, static tripod. A man in his early twenties stands on pale concrete in the oversized
heavyweight black hoodie from the reference image, 400gsm fleece. He turns slowly 180 degrees away from
camera, the thick fabric swaying with inertia and resisting the change of direction, creases forming at
the elbows and the hem settling a beat after he stops. Raking side light reveals the fleece nap. Slight
film grain, natural contrast. Audio: low room tone, soft fabric movement. A clean frame with no text or logos.
```
Why: GSM/inertia vocabulary — heavy fleece "does not flutter, it sways"; use slower camera for heavier cloth [C, vendor] https://hailuoai.video/pages/knowledge/realistic-hoodie-motion-ai-video-fashion-guide; "visible weave, creases form at elbows, drapes with natural stiffness" + raking light to make texture necessary [C] https://www.veo3gen.app/blog/why-your-ai-video-looks-too-smooth-2026-a-troubleshooting-guide-to-fix-plastic-s

**R3 — Macro on print or embroidery, light-sweep reveal (Omni 720p, 4s, 7 cr)**
```
An extreme macro lateral slide, left to right, slow and steady, in a single unbroken scene. High-end
apparel commercial cinematography, rich blacks, controlled highlight roll-off. A hard raking light from
camera right slowly rolls across the black-on-black embroidered geometric symbol on the chest of the
hoodie from the reference, every thread ridge catching the light in turn, shallow depth of field with the
background falling to black. Keep the symbol's shape and placement identical to the reference. Audio: a
faint thread-tight rasp and room tone, no music, no dialogue. No text in frame.
```
Why: Pixloop's fashion-film prompt lets a tone-on-tone logo "appear only as the light rolls across it"; "rich blacks, subtle halation, controlled highlight roll-off" [C] https://www.pixloop.ai/prompts/video-2066012290508341356. Prefer a *simple geometric* symbol (hexagon, wave, orbit) over letters: letters/small text are what melt [C] https://kinovela.com/insights/ai-video-brand-consistency; apparel macro of logos is flagged as risky when the model can't hold text [C] https://oakgen.ai/blog/ai-product-video-prompt-guide. Generation order: 2 takes, then move to composite if the symbol drifts.

**R4 — Walking street shot, dusk (Omni 720p, 6s, 10 cr)**
```
A low tracking shot walking backward ahead of the subject at knee height, subtle handheld micro-jitter,
in a single unbroken scene. Street-style fashion cinematography, 35mm, shallow depth of field. A woman in
her early twenties in the oversized black hoodie from the reference and wide-leg pants walks toward camera
down a quiet city street at dusk, clear foot plants on each step with visible weight shift, the heavy
hoodie swaying a beat behind her stride. Cool blue ambient light with warm orange sodium streetlamps
glowing behind her. Audio: her footsteps on pavement, distant traffic, a faint breeze, no music, no
dialogue. A clean frame with no text.
```
Why: "low tracking shot… at knee height" is Runware's sportswear opener; "foot plants each step; no sliding; visible weight shift" and "single action beat" fix floaty walking [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/prompting · https://www.veo3gen.app/blog/why-your-ai-video-looks-too-smooth-2026-a-troubleshooting-guide-to-fix-plastic-s. Straight-ahead walk, no turns/poses reduces bent-limb artifacts [C] https://usepromptup.com/prompts/video-fashion-runway/

**R5 — Editorial lookbook, selective-colour orbit (Veo Lite or Fast 8s with ingredient, 10–20 cr)**
```
Medium shot, slow 90-degree orbit around the subject, locked height. A model in the oversized black hoodie
from the reference stands in a white fog-filled studio with high-key lighting and almost no shadows.
Colours muted to near-monochrome, with a single orange accent: a small orange tag at the hem and a thin
orange gel glow on the floor edge. Minimal, graphic, editorial. Subtle film grain. Audio: low airy room
tone, no music. A clean frame with no text.
```
Why: 8frame's tested prompt "model in an oversized coat… colours muted to near-monochrome except the coat which is saturated red" held selective colour first time; swap red for your orange accent [C] https://www.8frame.co/blog/veo-3-prompt-guide. Use a 90° arc, not 360°: full orbits trigger face/garment morphing [C] https://prompt-helper.com/blog/veo-negative-prompts-troubleshooting/

**R6 — Flat-lay → worn (Omni 720p, 8s timecoded, 12 cr) — substitute for blocked Frames**
```
[0-3s] Top-down static shot of the black oversized hoodie from the reference laid flat on pale concrete,
two hands smooth the fleece once and lift it out of frame.
[3-8s] Hard cut to a slow push-in on a woman in her early twenties wearing the same hoodie in the same
soft overcast light, hood down, looking just past the camera.
Keep the hoodie's shape, colour and ribbed cuffs identical in both shots. Audio: fabric rustle, then room
tone, no music, no dialogue. A clean frame with no text.
```
Why: Omni's timecode syntax is the sanctioned way to script cuts [G] https://ai.google.dev/gemini-api/docs/omni. A true flat-lay→body *morph* via first/last frame is [needs Frames — blocked]; third parties say hiding the change under motion blur/spin/hand-over-lens transitions is more reliable than a visible morph [C] https://www.veo3gen.app/blog/veo-31-firstlast-frame-2026-a-creators-guide-to-seamless-transitions-outfit-chan. Stills of the flat lay come from Nano Banana (or your real photo) and go in as ingredient.

**R7 — Hood-and-cuff micro-gesture (Omni 720p, 4s, 7 cr)**
```
A medium close-up, locked-off, in a single unbroken scene. A man in his early twenties in the black
oversized hoodie from the reference pulls the hood up with one hand, then pushes one sleeve back once to
show the ribbed cuff. Soft window light from frame left, natural skin texture with visible pores, no beauty
filter. Audio: soft fabric sound, quiet room tone, no music, no dialogue.
```
Why: one hand, one beat; fine manipulation (clasps, re-grips) and two people in frame remain unreliable [C] https://designerbox.ai/blog/ai-video-hands-and-faces/. "Natural skin texture, visible pores, remove 'flawless/perfect skin'" [C] https://www.veo3gen.app/blog/why-your-ai-video-looks-too-smooth-2026-a-troubleshooting-guide-to-fix-plastic-s

**R8 — Mirror fit-check, UGC (Omni 720p, 6s, 10 cr) — higher risk**
```
A vertical phone video in a bathroom or dorm mirror, handheld with the small drift of a real arm, in a
single unbroken scene. A university-age woman holds the phone in her right hand, visible with her forearm
in the reflection, wearing the oversized black hoodie from the reference; she tilts to show the fit,
tugs the hem once, and half-laughs at her own reflection. Warm bulb light above the mirror mixed with cold
daylight from a window. Real phone-camera texture, slight motion softness, no beauty filter. Audio: room
tone, a tap running in another room, no music, no dialogue. No captions.
```
Why: fal's UGC pattern (phone visible in reflection, "no portrait-mode edge", handheld because "a locked-off frame reads as a tripod, and a tripod reads as an ad") [C] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1. Risk: mirrors mean reflected text/prints must stay correct → keep the hoodie print out of view or plain; expect 6+ takes [inference].

**R9 — Quiet hero on a stool, negative space for text (Omni 720p, 6s, 10 cr)**
```
A static locked-off medium-wide shot in a single unbroken scene. A woman in her early twenties sits on a
plain wooden stool against a seamless light-grey wall in the oversized black hoodie from the reference,
looking into the lens, a faint breath and one slow blink, the hood's edge shifting slightly. The upper
third of the frame is empty wall. Soft overcast-style window light from the left, no rim light, no bloom.
Audio: very quiet room tone, no music, no dialogue.
```
Why: "static shot, camera completely still" must be stated or it defaults to near-static *with drift* [C] https://github.com/raphaelbgr/ai-video-prompting/blob/main/skills/veo-flow-prompting/SKILL.md; empty top 1/6 and bottom 1/4 for platform UI/captions [C] https://tools.scult.in/prompts/veo/veo-short-form-hook-vertical

**R10 — Orange-gel rim, black-on-black (Omni 720p, 4s, 7 cr)**
```
A slow push-in, in a single unbroken scene. Low-key product cinematography, deep blacks. A black
oversized hoodie hangs on a matte black wall-mounted rail in a dark studio; a single saturated orange gel
light sweeps slowly from left to right across the fabric as a thin rim, separating the folds from the
background, the rest of the frame falling to black. Fabric texture visible in the lit edge only. Audio: a
low sub-bass tone as the light crosses, room tone, no dialogue.
```
Why: rim/hair-light role for gels and "gels are placed on key, fill or rim" [C] https://shotkit.com/color-gel/; "soft high-side key, controlled negative fill to preserve black fabric depth, gentle rim highlights separating the hoodie from the background" [C] https://www.pixloop.ai/prompts/video-2066012290508341356. Lighting words that map to real production beat vague mood words [C] https://oakgen.ai/blog/ai-product-video-prompt-guide

**R11 — Outfit smash-cut trio (Omni 720p, 6s, 10 cr)**
```
A locked-off medium shot, one person sitting in the same position against a plain white wall, with sharp
jump cuts every two seconds. [0-2s] a woman in her early twenties wears the oversized black hoodie from
@hoodie-ref. [2-4s] the same pose, now wearing the white oversized tee from @tee-ref. [4-6s] the same
pose, now wearing the black tee with a small orange detail from @tee2-ref. Background, lighting and framing
stay identical. Audio: a soft whoosh on each cut, no music, no dialogue. A clean frame with no text.
```
Why: Google Cloud's own jump-cut example ("same position but wearing different outfits, with sharp jump cuts… background static") + "Every 2s cut to a new frame" [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide · https://ai.google.dev/gemini-api/docs/omni. Three refs in one generation is the main risk (blending) → refs by position and role [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/reference-driven-video

**R12 — Campus UGC talking line (Omni 720p, 6s, 10 cr)**
```
A handheld selfie-style shot with the small drift of a real arm, in a single unbroken scene. A
university-age man in the oversized black hoodie from the reference sits in a library carrel, looks
into the lens and says: Midterms week. This is the uniform. Overcast daylight from a window, matte skin
with natural texture, no beauty filter, no rim light. His lips stay in sync with every word. Audio: his
close, slightly boxy voice, faint page turning, no music. No captions.
```
Why: Google Cloud dialogue form (colon) [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice; "matte skin, neutral light, phone-camera capture", cool neutral light instead of the honeyed AI grade [C] https://hermoso.ai/blog/why-ai-ads-look-fake/; direct-to-camera specific statements beat generic product shots by 30–50% on thumb-stop (agency claim) [C] https://www.landing.partners/blog/meta-reels-ads-fashion-brands-short-form-video-2026. "Midterms week" chosen for the university audience.

**R13 — CTA end plate (Veo Lite 8s with ingredient, 10 cr)**
```
Static tripod, slow rise from shelf height. A folded black hoodie on top of a folded white tee sits on a
raw concrete plinth against a flat warm-grey wall, hard key light from upper left casting a crisp shadow to
the right, one orange gel glow on the wall far behind. The lower third of the frame is plain concrete.
Fabric textures sharp, clean and minimal. Audio: quiet room tone, no music. A clean frame with no text.
```
Why: the plinth/hard-key/"flat warm grey" pattern is fal's tested product frame [C] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1; leave real estate for the composited logo + CTA (§6) [C] https://hermoso.ai/blog/why-ai-ads-look-fake/

**R14 — Whip-pan hook, payoff in the first second (Omni 720p, 4s, 7 cr)**
```
A fast whip pan from an empty concrete stairwell landing on a woman in the oversized black hoodie from the
reference already mid-stride toward camera, arriving at a medium shot within the first second, in a single
unbroken scene. Hard overhead light, high contrast. Audio: a sharp whoosh at the exact moment of the whip pan, then
footsteps echoing on concrete, no music.
```
Why: "state 'within the first second' explicitly, not 'quickly'"; tie the sound to the visual beat by timing [C] https://tools.scult.in/prompts/veo/veo-short-form-hook-vertical; whip pan is a documented Omni example move [G] https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/. Note: Creatide (citing unnamed "Flow help guidance") lists "crash zoom"-type verbs as filter-prone; "whip pan" is Google's own example, so prefer it [C, weak] https://creatide.ai/blog/veo-content-violation-why-flow-rejects-prompts-and-wastes-credits

**R15 — Omni edit one-liners (each ≈ 40 cr per Google; confirm the card)**
```
Change the lighting to a single orange gel rim light from behind. Keep everything else the same.
Make the background a plain pale concrete wall. Keep the person, the hoodie and the camera move the same.
Regrade to a muted, slightly desaturated film look with fine grain. Keep faces, wardrobe and motion unchanged.
Make the phone in her hand invisible. Keep everything else the same.
Remove any text or logo on the shirt. Keep everything else the same.
```
Why: Google's own edit examples ("Change the lighting to be more dramatic", "Make the phone invisible. Keep everything else the same.") [G] https://ai.google.dev/gemini-api/docs/omni. Era regrade example "faded Eastmancolor… visible gate weave" [C] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1

---

## 5. Motion, physics, and the "not AI" look

### 5.1 Fabric / hair / walking
| Problem | Prompt move | Source |
|---|---|---|
| Hoodie moves like silk | Heavy-cloth words: "heavy, thick, structured, slow sway"; slower camera for heavier fabric; mid-weight tee: "soft, supple, rhythmic bounce" | [C] https://hailuoai.video/pages/knowledge/realistic-hoodie-motion-ai-video-fashion-guide |
| Gel-like fabric/hair | Material-first: "visible weave, seam stitching visible; creases at elbows; fabric drapes with natural stiffness"; hair: "individual strands, slight flyaways, hair lags during head turn then settles"; **avoid** "smooth clothing, pristine outfit, silky hair" | [C] https://www.veo3gen.app/blog/why-your-ai-video-looks-too-smooth-2026-a-troubleshooting-guide-to-fix-plastic-s |
| Floaty walking | "clear foot plants each step; no sliding; visible weight shift; natural acceleration and deceleration; single beat: walk three steps → stop" | same |
| Sliding limbs | "simple straight-ahead walk, no turns or poses"; keep clip short, one action | [C] https://usepromptup.com/prompts/video-fashion-runway/ |
| Tossed/dropped items | Don't. Ballistic motion is where physics break; hold, turn, set down instead | [C] https://hermoso.ai/blog/why-ai-ads-look-fake/ |
| Hands/faces | Fix the *still* first (image edit is cheaper than re-rolling video); don't ask for re-grips, clasps, two people sharing frame | [C] https://designerbox.ai/blog/ai-video-hands-and-faces/ |
| Face morph in orbit | Shorter arc (90° not 360°) + "keep facial features consistent" | [C] https://prompt-helper.com/blog/veo-negative-prompts-troubleshooting/ |
| Fabric "melts" | Reported ~occasionally in motion; objects <5% of frame get soft/abstract → keep print large in frame | [C] https://pxz.ai/blog/veo-3-1-review |

### 5.2 Camera moves that survive
- Safe set: static, slow push-in, slow orbit (≤90°), low tracking, handheld micro-jitter, top-down, macro slide. Risky: fast zoom, impossible indoor drone, chaotic handheld, multiple cuts, "make it cinematic" with no shot description. [C] https://oakgen.ai/blog/ai-product-video-prompt-guide
- "Camera motion alone is the simplest and most reliable"; one primary move per shot; add "subtle handheld micro-jitter" for human cues. [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice · [C] https://www.veo3gen.app/blog/why-your-ai-video-looks-too-smooth-2026-a-troubleshooting-guide-to-fix-plastic-s
- Lens → feel: 16mm expands space, 35mm natural, 50mm intimate, 85mm compresses; vague camera cues → near-static. [C] https://github.com/raphaelbgr/ai-video-prompting/blob/main/skills/veo-flow-prompting/SKILL.md
- Shutter language (Veo): "1/48 shutter equivalent, 24fps" film motion blur; "1/250" crisp product; "60fps, slow to 40% in post" for a memory-like look. [C] https://www.8frame.co/blog/veo-3-prompt-guide

### 5.3 Film stock, grain, lens, grade vocabulary (reads as expensive)
| Vocabulary | Effect | Source |
|---|---|---|
| "large-format sensor, anamorphic lens character, controlled highlight roll-off, rich blacks, subtle halation, crisp fabric detail" | high-end fashion-film feel | [C] https://www.pixloop.ai/prompts/video-2066012290508341356 |
| "35mm film grain", "anamorphic flare", "desaturated teal grade, slightly crushed blacks, clean highlights"; "16mm with visible grain, warm overexposed highlights" | stock/grade shorthand Veo reads | [C] https://www.atlabs.ai/blog/google-veo-3.1-prompting-guide-how-to-get-cinematic-4k-video-on-the-first-try |
| "Pushed-grain 16mm… faded colours, green fluorescent cast"; "colours muted to near-monochrome except one saturated accent" | tested clean on Veo 3.1 | [C] https://www.8frame.co/blog/veo-3-prompt-guide |
| "Film noir shot on 35mm", "a worn-out VHS tape", "Rembrandt lighting", "low-key", "volumetric lighting", "backlighting", "shallow DOF/bokeh" | Google's own style/light vocabulary | [G] https://deepmind.google/models/veo/prompt-guide/ · https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide |
| "faded Eastmancolor, magenta-shifted highlights, visible gate weave" | era regrade by edit | [C] https://fal.ai/learn/tools/how-to-use-gemini-omni-flash-1-1 |
| "slight film grain; not overly denoised" | counters over-clean surfaces | [C] https://www.veo3gen.app/blog/why-your-ai-video-looks-too-smooth-2026-a-troubleshooting-guide-to-fix-plastic-s |
Caution: Google says some advanced lens effects are "not officially supported". Stack ≤3 stock/grade terms per prompt. [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide

### 5.4 Lighting setups for black/white + orange
| Setup | Prompt words |
|---|---|
| Clean e-com/cyc | "seamless white cyclorama, soft overhead key, controlled negative fill, gentle rim separating black fabric from the wall" [C] https://www.pixloop.ai/prompts/video-2066012290508341356 |
| Texture-forward | "hard side light for texture" / "raking light to reveal weave" [C] https://oakgen.ai/blog/ai-product-video-prompt-guide · https://www.veo3gen.app/blog/why-your-ai-video-looks-too-smooth-2026-a-troubleshooting-guide-to-fix-plastic-s |
| Orange accent (gel) | "a single saturated orange gel as rim / strip light grazing the floor / far-wall glow." Gels filter white light and are placed on key, fill or rim; keep orange to one source so the frame stays black-and-white. [C] https://shotkit.com/color-gel/ |
| Overcast "unglamorous" | "overcast daylight, even, slightly cool white balance" — avoids the honeyed golden grade that reads "AI ad" [C] https://hermoso.ai/blog/why-ai-ads-look-fake/ |
| Street dusk | "cool blue ambient with warm orange sodium streetlamps" (practical orange without a gel) — my composition, based on Google's neon/artificial-light vocabulary [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide |
Exact orange: don't describe a hex/Pantone; Kinovela's point is models return "recognizably in the family and measurably wrong" and tint the whole frame. Prompt the *light source*, then correct the brand orange in the grade. [C] https://kinovela.com/insights/ai-video-brand-consistency

### 5.5 Killing the "AI look" (ordered by payoff)
1. Real packshot as reference; 2. matte skin/neutral light/phone-camera capture for UGC; 3. composite text; 4. micro-gestures and **one** imperfect beat ("camera bumps" or "she half-laughs"); 5. no ballistic physics; 6. cool neutral light. [C] https://hermoso.ai/blog/why-ai-ads-look-fake/ — the tell that gives away "1 in 3–4 generations" is smooth motion/perfect symmetry; generate 2–3 and pick the most natural. [C] https://pxz.ai/blog/veo-3-1-review
Make textures *necessary* to the shot (raking light + a close surface) or the model delivers clean surfaces. [C] https://www.veo3gen.app/blog/why-your-ai-video-looks-too-smooth-2026-a-troubleshooting-guide-to-fix-plastic-s

---

## 6. Brand / logo / print fidelity

### 6.1 Control map (decide before any prompt)
Sort every brand element into **generated / composited / shot practically**:
| Element | Owner |
|---|---|
| Atmosphere, light, camera move, performance energy | generated |
| Wordmark, logo, captions, CTA, end card, price/offer | **composited** (master vector, licensed type) |
| Exact orange | **graded** in post |
| Hoodie shape/colour/print | reference-anchored; QC every take; **fallback = real photo/CG hero composited** |
| Voice of a named person | generated natively; no TTS over visible mouths |
Source: [C] https://kinovela.com/insights/ai-video-brand-consistency · https://hermoso.ai/blog/why-ai-ads-look-fake/

### 6.2 Rules that follow
- **Logos are never generated, always composited from the vector.** A model's near-miss is a mark you don't own. [C] https://kinovela.com/insights/ai-video-brand-consistency. The reported Coca-Cola 2025 AI holiday spot also had its logo composited by hand "because generated text still comes out wrong." [C, secondhand via ScreenWeaver] https://www.screenweaver.ai/blog/produce-ad-with-ai-workflow
- **Anchor to a real packshot**: the model "invents a plausible-looking cousin" without one. Plain/segmented background on refs is Google's own advice (playbook §4.2). [C] https://hermoso.ai/blog/why-ai-ads-look-fake/
- **Pin clause + 'no text'**: "Keep the symbol's shape/placement identical to the reference… A clean frame with no text or logos." Reference mid-shot portraits (waist-up, neutral background) lock identity best; full-body/group/busy backgrounds dilute it. [C] https://runware.ai/docs/models/google-gemini-omni-flash-1-1/guides/reference-driven-video
- **Keep print large and facing camera; avoid shots where the chest print turns away or becomes <~5% of frame.** [inference from] https://pxz.ai/blog/veo-3-1-review
- **Hero-asset hybrid**: generate environment + motion, bring in the real photographed product tracked into the plate for any shot that must sell a detail. [C] https://kinovela.com/insights/ai-video-brand-consistency
- **Omni can render text**; Google's guide says it "will render in a way that is correct and readable" and shows word-by-word kinetic text; but the model card says perfectly accurate text "remains a challenge", a tester found long/dense or CJK text fails. Use model-rendered text only for throwaway scratch cuts, not final CTAs. [G] https://ai.google.dev/gemini-api/docs/omni · https://deepmind.google/models/model-cards/gemini-omni-flash/ · [C] https://promptslove.com/blog/gemini-omni-1-1-flash-review/ — **Google disagrees with itself here; trust the model card.**
- **Burned-in junk captions**: Veo can burn garbled subtitles in even when told not to; end each prompt with a clean-frame sentence; "describe the clean frame you want" [C] https://github.com/raphaelbgr/ai-video-prompting/blob/main/skills/veo-flow-prompting/SKILL.md · https://www.versely.studio/blog/veo-burned-in-subtitles-you-never-asked-for (title seen in search, not opened).
- **Honest-product evidence from a real thread** (older, ~12 months, r/Automate): commenters caught an AI clothing video that dropped a back logo, invented side pockets and "creased in impossible ways"; one said customers in Europe could return products for false advertising. Keep the AI video faithful to the SKU or label it as mood content. [C] https://www.reddit.com/r/Automate/comments/1odjmdr/i_built_an_ai_automation_that_converts_static/
- **Frame-by-frame QC list for garments**: print alignment, colour, closures, hems; regenerate misses. [C] https://morphed.app/blog/ai-video-generator-for-fashion

### 6.3 Compositing workflow (outside Flow)
Clean plate → track/lock the logo layer in the editor → add captions at WCAG-style contrast (4.5:1; scrim behind burned-in captions) → exact-orange grade pass (≈15–20 min/shot is the cited allowance) → export H.264/AAC MP4. [C] https://kinovela.com/insights/ai-video-brand-consistency. Flow's Scenebuilder cannot do any of this (playbook §1.4); use CapCut/Resolve/Premiere.

---

## 7. Pacing, structure, sound, loops, testing

### 7.1 Length and shape (fashion)
- 7s: product self-explanatory, hook + CTA only (cold prospecting). 15s: workhorse (hook → outfit context → styling detail → CTA). 30s: rarely beats 15s in paid fashion; padding. "Shoot for 15, cut ruthlessly to 7." [C, agency] https://www.landing.partners/blog/meta-reels-ads-fashion-brands-short-form-video-2026
- Hook completion ≥ 60% for a distribution boost; < 50% suppresses; cold thumb-stop 25–40%. [C, agency's own client benchmarks — vendor-reported, not Meta-published] same URL
- Don't open with logo or music fade-in; start at full speed; CTA explicit, visual, and spoken. same URL

### 7.2 Hook formulas that map onto Flow
| Formula (agency) | Flow implementation |
|---|---|
| Instant outfit reveal — "start mid-transition" | R14 whip-pan; R11 smash cut |
| Direct-to-camera specific statement | R12 (≤10 words, Omni native speech) |
| Problem-first | UGC line: "I can't find a hoodie that actually fits" + R7 |
| Before/during transition | R6 flat-lay→worn (crisp cut, not crossfade) |
| Social proof | text overlay composited in post, over R9 plate |
Source: https://www.landing.partners/blog/meta-reels-ads-fashion-brands-short-form-video-2026. Test hooks first (3–5 hooks, same middle/CTA), then visual format, then CTA; 15–20% of budget on testing. same URL. Variant volume: brands with 15+ active variants reported 20–35% lower CPMs than 3–5 (agency claim). https://www.landing.partners/blog/ai-creative-meta-ads-fashion-brands-2026 — and a 40–70% spread between best and worst *hook* on identical footage → **cut alternate openings from the same plates.**

### 7.3 UGC vs cinematic
- Cold audiences: UGC from micro-creators beat studio-branded in most fashion subcategories, by 25–40% cost-per-purchase in that agency's accounts; retargeting prefers polished branded. [C, vendor] https://www.landing.partners/blog/meta-reels-ads-fashion-brands-short-form-video-2026
- AI-specific: the same agency says full AI fashion imagery is "still inconsistent" for ads (fabric, fit), best used for **variants, hooks, backgrounds, not hero brand-defining content**. [C] https://www.landing.partners/blog/ai-creative-meta-ads-fashion-brands-2026. For Acme (pre-launch, no real UGC yet) → use cinematic plates for brand + Omni UGC-style hooks for testing, and **replace with real student UGC as soon as it exists** [inference].

### 7.4 Sound design
- Generate *foley/ambience* in Flow (fabric rustle, footsteps, room tone, single whoosh on cuts) and lay licensed or platform music in the editor; Flow has no audio upload (playbook §5.4).
- "One SFX timed to the change moment" is the reliable transition cue; avoid multi-speaker or complex music direction. [C] https://www.veo3gen.app/blog/veo-31-firstlast-frame-2026-a-creators-guide-to-seamless-transitions-outfit-chan
- Flow has a project toggle **Return silent videos** (all generations silent); the vendor skill's silent-clip recipe = no speech cues at all + positive ambience + "silent"; never mention a mouth in a silent clip. [C] https://github.com/raphaelbgr/ai-video-prompting/blob/main/skills/veo-flow-prompting/SKILL.md
- Trending-audio mechanics on Instagram/TikTok: **no source gathered → [unverified]**; treat as an editor-side decision.

### 7.5 Loops and endings
- API-level looping = same image as first *and* last frame (`<FIRST_FRAME>@Image1 <LAST_FRAME>@Image1`). [G] https://ai.google.dev/gemini-api/docs/omni → **[needs Frames — blocked]** in the live UI.
- Substitutes: (1) end every ad on a **static plate that matches the opening composition** (R13 ↔ R3/R10) and loop at the editor level with a 2-frame match cut; (2) end on a hard cut to the logo card; (3) clip the first 0.5s of the hook as the last 0.5s (editor trick). [inference]

### 7.6 Disclosure
- **Meta ads:** Meta's generative ad features (background generation, image generation, add-animation) stamp "AI info" with no advertiser toggle; third-party files can also trigger it via C2PA content credentials; resize/colour-correct don't. [C, secondhand of Meta's help page] https://www.versely.studio/blog/meta-ads-ai-info-label-is-automatic-in-ads-manager (links Meta help https://www.facebook.com/business/help/1010479435004531 — not opened by me). FTC paid-partnership disclosure is a separate duty. same URL
- **TikTok Ads:** toggle "This ad contains AI-generated content" for fully AI or significantly AI-modified content; resets on duplication; Spark Ads follow community guidelines instead. [G] https://ads.tiktok.com/resources/help/article/add-disclaimers-to-ads?lang=en
- **YouTube/Shorts:** see playbook §5.6.
- Flow's invisible SynthID stays on; don't strip. (playbook §0)

### 7.7 Takes per keeper (budget)
| Evidence | Number | Source |
|---|---|---|
| Kalshi NBA-Finals ad on Veo 3 (June 2025, ~16 months old) | 300–400 generations → 15 usable clips ≈ **25 takes/kept shot** (broadcast bar); ~2,000 USD | [C secondhand] https://www.screenweaver.ai/blog/produce-ad-with-ai-workflow (cites NPR) |
| Same source's narrative-short average | 2.4 takes/kept shot; "two or three shots… eat half" the takes | same |
| Veo 3.1 hands-on reviewer (147 videos) | ~1 in 3–4 gens has "AI look"; 5-shot character sequence needed 8 gens; they generate 2–3 versions and pick | [C] https://pxz.ai/blog/veo-3-1-review |
| Flowjam | ~3 attempts per usable shot | [C] https://www.flowjam.com/blog/google-veo-3-review-2026 |
| Illustrative | talking head ≈ 2 takes, liquid/hands ≈ 10; cost/usable = unit cost × takes/keeper | [C] https://dev.to/heojunfoi/what-one-usable-ai-video-clip-actually-costs-in-2026-8-tools-real-math-175f |
| Rejected-but-successful gens are billed everywhere; only failed/blocked gens refund | [C] same dev.to page; Google credits page for Flow [G] https://support.google.com/flow/answer/16526234?hl=en |
**Working budget for Acme [my assumption, to be replaced by the ledger]:** macro/texture 3 · walking/street 4 · garment-with-ref hero 5 · dialogue 4–5 · multi-ref smash cut 6 · mirror/hands 8.

---

## 8. Failure modes, moderation, and credit wasters

### 8.1 Failure table
| Symptom | Likely cause | Fix | Source |
|---|---|---|---|
| Omni returns 3 angles when you wanted 1 | default narrative cutting | "in a single unbroken scene… no scene cuts" | [G] https://ai.google.dev/gemini-api/docs/omni |
| Unwanted music / invented voiceover | model scores itself | "no music, no dialogue" + name the ambience | [G] same |
| Subtitles burned in | speech cues / quotation marks | colon-form dialogue; clean-frame sentence; silent recipe | [G] best-practice URL; [C] prompt-helper |
| Garment re-invented | text-only or weak ref | ref packshot, pin clause, reject any take with changed print/closures | [C] §6 |
| Print/logo melts | model painting small text | composite; larger print; geometric symbol | [C] kinovela |
| First clips great then decay (multi-clip project) | repeated drift; 10s first clip good, later worse (r/generativeAI) | shorter clips, self-contained prompts, character/ref sheet, don't rely on cross-clip memory | [C] https://www.reddit.com/r/generativeAI/comments/1wki8ty/does_anyone_have_a_cheat_code_for_google_flow/ ; https://github.com/raphaelbgr/ai-video-prompting/blob/main/skills/veo-flow-prompting/SKILL.md |
| Cannot get edit to run | clip's chip says Veo Lite; agent blank replies | create/edit with Omni explicitly; name "Use Omni 1.1 Flash video editing…" | [C] https://aialleyway.com/gemini-omni/ |
| Weightless hoodie | no GSM/inertia words | §5.1 | [C] hailuo |
| Mirror/hands mess | physics/reflection | avoid or budget 6–8 takes | [C] designerbox |
| Dialogue drift | too long | ≤ 10 words, 1 line | [C] fal; playbook §5.4 |
| Multi-edit decay | >3–4 turns | stop; regenerate from refs | [G] edit help; [C] promptslove |
| Pre-existing image of a person trips filter | image-conditioned analysis | audit the upload first | [C] https://creatide.ai/blog/veo-content-violation-why-flow-rejects-prompts-and-wastes-credits |

### 8.2 Moderation / refusal triggers relevant to fashion
- **Official categories** (Google Cloud): Child, Celebrity/prominent person, Sexual, Violence, Hate, Dangerous content, Other, Prohibited — each with support codes; consumer Flow shows a generic message. [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/responsible-ai-and-usage-guidelines. Flow-level: no prominent people anywhere; no editing uploaded videos of identifiable minors. [G] playbook/facts files.
- **Student-age cast:** the Child category rejects content depicting children by default. *Say "adult / in their early twenties" every time; avoid "kid, teen, schoolboy"; "student" alone is fine but pair with "university-age adult".* [G for the category; the "student" advice is inference]
- **Community findings (single vendor, treat as heuristics, [C]):** the classifier is described as scoring *combinations* (private setting + body-proximate camera + minimal-coverage words), not just single words; neutral language ("summer outfit", "athletic wear", "dressed for the beach") and public/visible-equipment settings are safer; use camera language about *movement* ("pulls back to reveal") not *proximity* ("tight close-up of her torso"). Image uploads are screened before the prompt. https://blog.picassoia.com/why-veo-3-1-keeps-getting-flagged-for-adult-prompts · https://creatide.ai/blog/veo-content-violation-why-flow-rejects-prompts-and-wastes-credits
- **Acme implications:** oversized clothing + wide framing + public/studio settings are low-risk. Avoid slow zoom on torso/legs, mirror + bedroom + warm intimate light combos, swim/underwear/"sheer", tight macro on chest/hips; macro the *fabric on a rail or flat*, not on a body (R3, R10).
- **Non-fashion trigger worth knowing:** news-broadcast framing (anchor/newsroom set) triggers a "NPOV" block regardless of content; prominent-name dialogue triggers the celebrity filter. [C, one team's API inspection] https://github.com/raphaelbgr/ai-video-prompting/blob/main/skills/veo-flow-prompting/SKILL.md
- **Ladder:** rephrase once → remove the camera-proximity term → remove clothing specifics → change setting; one factor per try; never loop-retry. Blocked/failed gens refund per Google; "filtered but charged" has been observed once in the UI by one team ([C] raphaelbgr skill above) → check the balance badge after every blocked run.

### 8.3 Things that waste credits
1. Quality (100 cr) before the shot works on Lite/Omni 360p. [C] https://veo3.dev/blog/veo-3-1-lite-vs-fast-vs-quality
2. Switching model mid-pipeline (Quality drops ingredients; Veo can't edit). [G] models help
3. Edit for something a re-render with a different ref would fix at ¼ the price (§1.3).
4. Prompts with 2+ beats or 2+ camera moves. [G] best-practice URL
5. Re-describing the reference in the prompt. [G] best-practice URL
6. 2 outputs per request while iterating (doubles bill). [G] credits help
7. 10-second ambitions that need dialogue + move + cut. [C] fal
8. Not stating audio exclusions → music baked into every plate you wanted to score in post.
9. Approving the edit card without reading its price (§3.7).
10. Fixing a bad hand/face by re-rolling the video instead of fixing the still. [C] designerbox

---

## 9. Acme starter shot list — two 15-second ads (9:16)
Assumptions: Pro account; refs prepared first as Nano Banana stills of the **real hoodie/tee packshots** and one adult model reference sheet (mid-shot, neutral background); Omni 720p unless noted; costs from Google's table (Omni 4s 7 · 6s 10 · 8s 12 · 10s 15; 360p 4/5/6/7; Veo Lite 10 non-Ultra). Take counts are my §7.7 assumptions. Logo/CTA/captions/music added in the editor, exact-orange graded in post.

### Ad A — "REVEAL" (cinematic, no dialogue; final 15s = 3 + 5 + 3 + 4)
| # | Shot | Model | Clip len | Prompt basis | 1× cost | Assumed takes | Expected |
|---|---|---|---|---|---|---|---|
| A1 | Hook: orange-rim light sweep on black fleece / tone-on-tone symbol (use 3s) | Omni 720p | 4s | R10 (swap rail for chest close-up via R3) | 7 | 3 | 21 |
| A2 | Hoodie reveal: cyc wall, hood lowered, push-in (use 5s) | Omni 720p + hoodie & model refs | 6s | R1 | 10 | 5 | 50 |
| A3 | Street walk, dusk, low tracking toward camera (use 3s) | Omni 720p + refs | 4s | R4 (cut to 4s; "walks four steps") | 7 | 4 | 28 |
| A4 | CTA plate: folded hoodie + tee on plinth; text/logo composited (use 4s) | Veo Lite + ingredients | 8s | R13 | 10 | 3 | 30 |
| | | | | **Ad A** | **34** | | **129** |

### Ad B — "CAMPUS UGC" (talking hook + proof; final 15s = 3 + 5 + 4 + 3)
| # | Shot | Model | Clip len | Prompt basis | 1× cost | Assumed takes | Expected |
|---|---|---|---|---|---|---|---|
| B1 | Hook: library selfie line "Midterms week. This is the uniform." (use 3s) | Omni 720p + refs | 4s | R12 trimmed to 4s | 7 | 5 | 35 |
| B2 | Campus walk, handheld, hoodie sway; ambient only (use 5s) | Omni 720p + refs | 6s | R4 variant: quad/steps, overcast | 10 | 4 | 40 |
| B3 | Colourway smash cut: black hoodie → white tee → black tee w/ orange detail (use 4s) | Omni 720p + 3 refs | 6s | R11 | 10 | 6 | 60 |
| B4 | CTA line to camera: "Drop's coming. Get on the list." (use 3s) | Omni 720p | 4s | R12 variant | 7 | 4 | 28 |
| | | | | **Ad B** | **34** | | **163** |

**Totals:** one-pass 68 cr; **expected ≈ 292 cr** (~29% of Pro's 1,000 monthly, before daily 50s and any 40-cr edit). Cheaper path: draft every Omni shot at 360p (A1 4, A2 5, A3 4, B1 4, B2 5, B3 5, B4 4 = 31 per round), spend the same takes at 360p → ≈ 139 cr for Omni shots + 30 for A4 = **≈ 169 cr**, then free 360p→720p upscale on keepers (Pro). **Condition:** verify once that an upscaled 360p keeper is acceptable for lip-sync and print detail (§3.6); otherwise re-render only the winners at 720p (+58 cr for one pass of the seven Omni shots). [my arithmetic from Google's per-generation table, https://support.google.com/flow/answer/16526234?hl=en]

**Edit/cut notes:** cut every 2–3s (cuts at 3/5/3/4 already satisfy this); first frame in motion; keep top ⅙/bottom ¼ clear of key content for platform UI; add captions at the edit stage (Ad B has speech; Ad A is sound-off safe). [C] https://tools.scult.in/prompts/veo/veo-short-form-hook-vertical · playbook §5.1.
**Variants to cut for free from these plates:** swap hook order (B3 first), alternate CTA text, 7s cut (A1+A2 or B1+B4), 9:16 only (Flow is 16:9/9:16).
**Kill criteria per take (agent checklist):** print/closures identical to ref? · cloth has weight? · no burned captions? · no unwanted music? · hands/face stable across frames 1/mid/last? · no cut where "single scene" was required? · text-free frame? Use a Gemini pass as a second pair of eyes on borderline takes [G] https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice

---

## 10. Source ledger (confidence)
**Google-published [G]** — ai.google.dev Omni docs (very high value; API, so UI-mapping caveats); blog.google Omni 1.1 dev post; docs.cloud.google.com video prompt guide, best-practice, responsible-AI; deepmind.google Omni model card (27 Aug 2026), Veo 3.1 Lite model card (Apr 2026), Veo prompt guide (Veo-3-era, older); support.google.com/flow models/credits/edit pages; TikTok Ads disclaimer page (platform rule).
**Community/vendor [C]** — Runware & fal docs (third-party hosts of Google's model; good prompt patterns, API features); raphaelbgr/ai-video-prompting (one team's field notes, Aug 2026); Hermoso, Kinovela, Veo3Gen, Hailuo, Pixloop, 8frame, Atlabs, Oakgen, Designerbox, Nereo, Morphed, WearView, HitPaw, Higgsfield, Morphic, Promptslove, AI Alleyway (hands-on Flow tests, Oct 2026), Landing Partners (agency), ScreenWeaver, pxz, Flowjam, dev.to, Picassoia, Creatide, Versely, Shotkit, Reddit r/VEO3, r/Automate (older), r/generativeAI.
**Not obtainable:** YouTube tutorial transcripts (page fetch returned only chrome/metadata, so no YouTube content is used); Reddit bodies were mostly truncated; X/Twitter creator threads were not retrievable via search.

## 11. Open questions (could not resolve from the web)
1. Does Flow's UI accept `<IMAGE_REF_N>`/`<FIRST_FRAME>` style tags, and how many reference images/videos does it allow per Omni generation (7? 10? Google's pages don't say)?
2. Is a 360p→720p upscaled clip visually equal to native 720p for faces, lip-sync and small print?
3. True price of an Omni edit in Flow (Google 40 vs observed 10 at 360p vs API-wrapper 20/10).
4. Does Veo 3.1 Fast really offer 10s in Flow (veo3.dev) or only 4/6/8 (Google)?
5. Is there a documented keeper rate for Flow specifically? (Only generic Veo/Kling numbers found.)
6. Does Flow's UI expose reference *videos* (3 × 3s) for Omni, and does the motion-reference trick (§3.3) work there?
7. Quotes vs colon for dialogue in Flow's Omni specifically — needs a 360p A/B (≈ 8–10 cr).
8. Instagram/TikTok trending-audio and music-licence mechanics for AI-made ads (no source gathered).
9. Whether 18–22-year-old "university student" cast language trips Flow's Child filter (not documented).
10. Whether tone-on-tone/dimensional embroidery on black reads at 720p without tripping fabric melting — needs one macro test (R3).
