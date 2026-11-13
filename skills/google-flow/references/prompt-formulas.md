# Prompt formulas (video, image, edits) and character consistency

Distilled from `docs/research/flow-creative-playbook.md` §2, §3, §4, §7.1 (cites live there).
Tags: **[G]** = Google-published, **[C]** = community-reported, **[live]** = verified in this account.

## 1. Video prompts (Omni 1.2 Flash default; Veo 3.1 Lite)

### Google's five-part formula [G]
`[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]`

> Medium shot, a tired corporate worker, rubbing his temples in exhaustion, in front of a bulky 1980s
> computer in a cluttered office late at night. Lit by harsh fluorescent overhead lights and the green glow
> of the monochrome monitor. Retro aesthetic, shot as if on 1980s color film, slightly grainy.

### Six-slot operating version (automation-friendly)
```
[shot type] of [subject, 2-3 concrete attributes], [single action]
[setting: place, time of day, weather]
[one camera move + lens feel]
[lighting: source, direction, quality]
Audio: [ambience]; SFX: [effects]; [Character] says, "[short line]"
Video length: 8 seconds.        <- [live] duration is set by this string
```
Each slot is a variable you can permute for A/B variants.

### Rules that hold across models
* **One action, one camera move, one scene per clip.** Multiple moves in 8s is the commonest cause of mush [C].
* **Name the camera move**, or you get static / subtle handheld [C].
* **Audio is its own labelled sentence** (`Audio:`, `SFX:`, `Ambience:`); dialogue in quotation marks; "No music" is a valid instruction [G/C].
* **Dialogue ≤ ~10 words per clip** — longer lines drift out of sync [C].
* **Positive framing** ("empty road", not "no cars") [G].
* **English prompts** [C].
* **Weak spots: sky, water, crowds, hands, text.** Avoid having all five in frame when reliability matters [C].
* **Duration:** [live] append `Video length: N seconds.` — "8 seconds" gave 8.000s/192 frames, "4 seconds" 4.010s. No UI control exists. Omni documents 4/6/8/10s; Veo 4/6/8s. (10s via prompt string is not yet verified live.)
* **Content-filter refusals:** rewrite, don't retry. Drop real people's names and dual-meaning words; describe the visual, not the intent. Escalation: rephrase → regenerate → new project. Do not loop Retry.

### Worked examples
**Product hero, 9:16, 8s**
```
Macro product shot, a matte-black stainless steel water bottle with fine brushed texture, standing on wet
black slate. Single hard spotlight from camera right rakes across the metal; deep falloff into black; slow
90-degree orbit keeps the label facing camera. 85mm look, shallow depth of field.
Audio: low room tone, a single water droplet impact. No dialogue. Video length: 8 seconds.
```
**UGC testimonial, 9:16 (with a saved character)**
```
Medium close-up of @Maya, a woman in her 30s with short curly hair in a mustard sweater, mid-sentence
looking at camera, leaning slightly toward the lens at a kitchen counter. Morning window light from frame
left, soft shadows. Handheld, slight drift. Audio: quiet kitchen ambience; @Maya says, "I stopped buying
three of these."
```
**B-roll** — `Wide establishing shot, an empty fogged-in coastal road at dawn. Slow crane-down from high angle
to eye level, 24mm, deep focus. Grey diffuse light, mist catching a distant headlight glow. Audio: distant
surf, wind through grass. No music.`

**"Viral physics" shot** [C]: state the fixed camera position first → subject geometry → **step-by-step physics
beats** ("hits the first stair and bounces…") → realism anchors ("realistic gravity") → platform framing.
Enumerating impact beats constrains the model; the motion must start in the first second.

## 2. Image prompts (Nano Banana 2.1 — default; never Lite unless the user says so)

Google's formula [G]: `[Subject] + [Action] + [Location/context] + [Composition] + [Style]`. Start with a strong verb;
use photographic terms (low angle, f/1.8, golden-hour backlight); iterate conversationally.

| Job | Template |
|---|---|
| Photoreal / editorial | `A photorealistic [shot type] of [subject] in [setting], [light], shot from [angle] with [lens].` |
| Product packshot [C] | `[Product + 2-3 material details] on [named surface], against [named backdrop]. Lighting: [one named source, direction, quality]. [Camera angle]. [One finishing note].` |
| Text-in-image [G] | Quote every word, name the font style and position, add "no additional text" for clean layouts. |
| Edit [C] | `Using the provided image: keep [face / product shape / label text] identical. Change [one thing]. Do not change anything else.` |
| Multi-reference [G] | Give each reference a role: "Image A for pose, Image B for style, Image C for background." |

Packshot discipline [C]: subtle **contact shadow** (stops the pasted-on look); **identical surface/backdrop wording**
across a catalog set; 85–100mm for close packshots, 35mm for lifestyle, don't mix in one set; start from a real
white-background photo of the actual product; before approving check label legibility, shadow direction vs light,
scale, props not overpowering. Lighting phrases that read reliably: three-point softbox, single hard spotlight,
soft window light from one side, golden-hour backlight, overcast daylight.

Aspect ratios [live]: 16:9, 4:3, 1:1, 3:4, 9:16, count x1–x4. Images generate ~1K; raise resolution only for print.
Flow's image surface also has lasso-select and draw-on-image edits [G] (not mapped in this build).

## 3. Ingredients, characters, consistency

| System | What | Limits |
|---|---|---|
| Ingredients / references | Images (Omni also video, voices) attached to a prompt; `@name` searches project assets | Veo: 8s clips only; **Veo 3.1 Quality cannot use ingredients** |
| Characters | Saved bundle (face, clothing, voice), called with `@Name` | ≥1 image, 1–2 reference images; header `+ → Create character` [live] |
| Avatar (`@me`) | Your verified likeness + voice | Not EEA/UK/CH; Canada fine; not shareable |

Google's ingredient rules [G]: subject/product refs on a **plain or segmented background**; location/style refs have
**no extra subjects**; the text prompt must **complement, not contradict** the images; keep a **consistent look
across all ingredient images**.

Techniques that move the needle [C]:
1. **Reference sheet**: one image with the subject at front / three-quarter / profile. Bake in concrete specifics
   (skin tone, hair texture, build) — you inherit them in every scene.
2. Stress-test the character: change angle, lighting, outfit.
3. **Two references max** per character (second = another angle).
4. **Copy-paste identical identity wording** into every prompt of the sequence.
5. **Keep everything for a sequence in one project** — `@` mentions resolve project-scoped.
6. **Voice references only attach to ingredient-based generations**; a frames-only shot errors. If dialogue continuity
   matters, build on Ingredients.
7. Agent standing instructions + a reference image act as a project-wide "show bible" [G/C].
8. Consistency is *improved, not guaranteed* — QC at the **sequence** level, not the clip level.

**Continuing the same shot** [live substitute for Frames-to-Video, whose entry point isn't reachable here]:
`flow_save_frame` (last frame) → upload → attach as ingredient → prompt "continue this shot …".
`Jump To` is **[unverified]** in the current product.

## 4. Editing prompts (Omni only, `flow_edit_video`; Omni 1.2 bills 3 credits/s at 720p — 12 for a 4 s clip)

Single change + **"Keep everything else the same."** Longer edit prompts change more of the clip — the most common
way to ruin a good take. Archetypes [G]: Restyle ("Make this video anime"), Add ("Put a fashionable hat on this
person"), Remove ("Make the phone invisible. Keep everything else the same."), Relight, Re-shoot ("Change the camera
angle to over his shoulder"). Edit window ≤10s, ≤3 conversational turns, originals are kept in History.
