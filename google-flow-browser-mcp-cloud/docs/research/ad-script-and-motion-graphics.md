# Making an AI-generated fashion ad read as an ad: story, script, voice, brand cues, motion graphics (Acme)

Researched 2026-10-16 for the user / Acme. Companion to `skills/media/google-flow/references/{reels-and-ads,video-ad-craft,production-pipeline}.md`; nothing from those is repeated here.

> **OMID'S VERDICT (2026-10-17): he does not like the videos in `Documents/Acme/99_Archive/legacy/Ad-Neuroscience_old_project`.** Treat that folder as a *technical* reference only (how an HTML timeline was rendered). It is NOT a creative or style example: do not reuse its look, pacing, copy, whip-pans or layout. Sections 2.4 and 6.4 and build-list item 6 below describe it and are kept only as a record of what exists. The motion overlay in this repo (`assets/motion/overlay.html`, tool `flow_motion_overlay`) is a fresh engine and does not depend on that folder.
Tags: **[G]** platform/government/Google primary source · **[C]** agency, vendor, blog or community · **[T]** tested here with ffmpeg 9.0.1 on lavfi sources or a copy of founder assets · **[L]** read from local files · **[unverified]** plausible, not confirmed. `[S#]` = source index at the bottom, which holds every URL. Where sources disagree it is stated (and collected in section 11).
Not run: Flow generations, HTML/Chromium rendering, browser tools. Nothing in `/home/you/Documents/Acme` was modified.

## 0. Top rules (read this if nothing else)
1. The drafts failed because nothing in them said "this is an Acme ad": no wordmark, no product claim, no sound identity, no ask. Viewers accept ads that are entertaining; System1/TikTok found "viewers expect ads to be ads" and that exceptional early branding cut negative sentiment 48% and attention decay 19% [C via trade press, S8].
2. Put a branded asset (wordmark, orange rule, sound sting, product) inside the first 2 s, but keep it subtle enough not to kill the hook [S8, S4 "branding in the first few seconds should be subtle and not compromise the hook"]. Hook says the joke; brand cue says whose joke.
3. Structure = hook (0-3 s) → body that proves/explains the joke on the product → CTA card. TikTok's own structure is hook / body / close [G, S4]; Google's is Attention, Branding, Connection, Direction [G, S1].
4. Say the brand name out loud as well as showing it: audio brand mentions strengthen on-screen branding, and a voice-over CTA makes the next step clear [G, S1].
5. Native structure, Acme-owned look. Cut and pace like a Reel (talking, text pops, beat cuts), but keep every graphic in black/white/one orange accent. Do not copy lo-fi UGC polish: Acme's brand is minimal.
6. Sound on and sound off both must work: captions or text carry the message [G, S3, S5]; sound-on is strongly recommended by Meta [G, S13].
7. The AI model never writes text. Every wordmark, caption, callout, price and CTA is composited afterwards (Veo also burns phantom subtitles onto dialogue clips, S17).
8. One joke, one print, one clip-beat per shot. Dialogue ≤10-12 words per clip, one beat each.
9. Pre-launch CTA = waitlist / follow, never "shop now"; no fake scarcity, no "was" price, no unverifiable claims [G, S29-S31].
10. Fix the founder film for paid use before reuse: its brand cue is a 24 px grey kicker inside Meta's unsafe top zone, the logo appears only at 24 s, and its end card says "Shop the drop" (section 2.4).

## 1. Why the drafts read as empty
| Draft symptom | Missing ad signal | Fix (section) |
|---|---|---|
| Girl says one line, no music | no sound identity, no brand, no ask | sting + music bed on beat grid, brand line in VO (5, 9) |
| Walks away showing back print | print is too small and brand is unnamed | composite print close-up + callout (7, 6.3) |
| No mention of product | nothing to buy or follow | name the hoodie/edition + CTA card (2, 8) |
| Looks like a brand film (realistic, quiet) | mode confusion | pick the UGC/community mode and hold it [C, S10] (3) |
AdLibrary's 2026 teardown frames fashion ads as four modes (editorial, product/SKU, lifestyle, community/UGC) and says mixing modes is what fails; streetwear/athleisure brands sit in community/UGC [C, S10]. Fear of God's mainline Meta ads show the opposite pole: studio, no hook headline, no CTA [C, S35]. That works for an established luxury label, not for a pre-launch brand that needs a follow or waitlist.

## 2. What makes a viewer recognise "an ad for Acme" in 1-3 s
### 2.1 Rules with timings (beat = 0.48 s at 125 BPM; times are suggestions built from the sources)
| When | Rule | Basis |
|---|---|---|
| Frame 1 (0.00) | Motion already present and one brand colour element on screen (orange rule/dot or Acme-black frame). Hook must read with sound off. | motion/pace/caption hook [G, S5]; frame-1 motion [L, reels-and-ads.md] |
| 0.0-2.0 s | A branded asset lands: wordmark pop, orange rule draw-on, sonic sting, or product. System1 measured logos/jingles/mascots in the first 2 s. | [C, S8] |
| ≤3 s | State the content proposition (what this is about: the "joke" and the product). | TikTok: "introduce your content proposition in the first 3 seconds for better recall and awareness" [G, S3] |
| ≤6 s | Hook complete. TikTok cites 90% of ad-recall impact and 80% of awareness inside 6 s (2020 data, TikTok-reported). | [G-self-reported, S4] |
| First spoken line | Either contains the joke or the brand; ≤10 words. Avoid opening on the product name alone (a UGC-script source says "never the product name" in the hook, S39, [C]); that conflicts with System1, so show the brand, say the joke. | S8, S39 |
| Mid (body) | Product on screen ≥50% of the body time, print readable. Branding becomes "additive" here. | [G, S4] |
| Last 1.9-3.8 s (1-2 bars) | CTA card: wordmark + one ask, spoken and written. TikTok reports CTA display cards: +45% recall, +30% conversion lift (TikTok data). | [G-self-reported, S7] |
| Whole ad | Text events synced to beats, ≤1 new text event per beat group. Never over Meta's unsafe zones (2.4). | S13, S24 |
Google's Shorts guidance says brand "organically", coordinate sight and sound, and keep the tone low-key rather than a sales pitch [G, S1, S2]. Google/Kantar report as much as +30% short-term sales likelihood and +17% long-term brand contribution for ads following the ABCDs (2021, YouTube, not Reels) [G, S1].

### 2.2 Native-looking ad vs brand film
| | Native-looking ad | Brand film |
|---|---|---|
| Looks like | made for the feed: person, talking, text, quick cuts | cinematic, quiet, slow reveal |
| Evidence | TikTok "go lo-fi", "feature people"; actions +3.3x vs non-TikTok-first (Kantar/TikTok 2022) [G-self-reported, S4]; Google: UGC-feel Shorts beat conventional-ad aesthetic [G, S2] | Motion: high-production "Hollywood" ads can lose to text/overlay/GIF ads; use for scaling proven concepts, not discovery [C, S9] |
| Risk for Acme | looks cheap against a minimalist brand | looks like nothing is for sale (your drafts) |
| Acme answer | native structure (hook, talk, text, beat cuts) + brand-owned graphics, palette, sound sting | reserve for a later hero asset |
Motion's 550k-ad analysis also warns: when every ad opens with the same bold claim it stops being bold and signals "this is an ad" [C, S9]. Rotate hooks (joke, question, visual gag, number counter), avoid "you NEED this".

### 2.3 Acme cue kit (use 3+ in every ad; all from the existing brand system)
1. Orange rule (4 px, 132 px wide) drawing on: the founder film's signature [L, film/index.html `.rule`].
2. Wordmark "acme" (white, lowercase) from `Logo/white_nbc.png` [L].
3. Mono kicker "ACME · NEUROSCIENCE" (IBM Plex Mono, tracked) [L].
4. The orange period/dot on headlines ("a spark.") and one orange accent word per frame [L].
5. Product pair (front with small chest wordmark + back print) from the cutouts [L, make_cutouts.py].
6. Sound sting (≤0.5 s, same pitch every ad) on the wordmark pop; TikTok describes a "recognizable sound palette" as a brand asset [G, S5]; System1 counts sonic assets among early branding assets [C, S8].
7. Spoken tag, same every time: "Acme. Neuroscience edition."

### 2.4 Audit of the existing founder film against these rules [L]
- Kicker `ACME · NEUROSCIENCE` is `top:118px`, 24 px mono, `#6f6f79` on `#050506`: computed contrast 4.10:1 (<4.5:1 WCAG for normal text [G, S28]), below the ~36 px minimum readable size [C, S24], and inside Meta's top 14% (0-269 px) exclusion [G, S13].
- `.foot` tag and `.ctaline` sit at `bottom:138px/132px`: inside Meta's bottom 35% (y>1248) [G, S13]. Text zone for Meta Reels ads = y 269-1248, x 65-1015 (math from S13).
- Wordmark appears only at 24 s (end card); first 24 s has no logo, no spoken brand, and `Shop the drop` implies purchasability before launch (section 8).
- Orange in the film is `#f7810f`; brand is `#FA7F14` (tiny drift; pick one in a shared token).
- Good and reusable: deterministic `window.seek(t)` timeline, whip-pan transitions, draw-on art docked onto the real print, the `kf()` keyframe helper, easing `cubic-bezier(.16,1,.3,1)`.

## 3. Story: what an Acme ad is about
Fashion first, meaning second: the viewer should see a good-looking black hoodie before they learn the print is a neuroscience joke. Shopify's streetwear guide says streetwear marketing "starts with cultural credibility" [C, S34]; DTC fashion guides say to sell identity, not garments [C, S10, S11].
Joke anatomy for the print line (editorial, structure per TikTok's "a-ha moment / problem-solution / journey" [G, S4] and Google's "humor, surprise, intrigue" [G, S1]):
1. **Recognition** (0-2 s): a phrase or situation every member of the major knows ("mind the gap").
2. **Twist** (2-6 s): the major's second meaning, said plainly by a person.
3. **Proof on product** (6-11 s): the line-art draws onto the real print.
4. **Brand + ask** (11-15 s).
Hook bank (witty, minimal; all need the user approval): "Mind the gap. The other one." · "Same thought. Two heads." · "Three out. Two in. Midterms." · "Your major has an inside joke. Wear it." · "Explain it to me. No, wear it." · "It's twenty nanometres wide." · "Neurons don't text. They fire." · "Not a graph. A mountain." (action-potential climber).
Copy library per print (hook / twist / spoken tag; all [proposal], keep them under 10 words):
| Print | Hook | Twist | Tag |
|---|---|---|---|
| 102 Mind the gap | "Mind the gap." | "The other gap. Twenty nanometres." | "Mind the gap." |
| 104 Fire together | "Same thought. Two heads." | "Neurons that fire together, wire together." | "Fire together." |
| 103 Node to node | "Signals don't walk. They hop." | "Node to node. Saltatory, technically." | "Node to node." |
| 101 Action potential | "Not a graph. A mountain." | "Minus seventy to plus forty. Worth the climb." | "Action potential." |
| 105 3 out 2 in | "Three out. Two in." | "Coffee out, sleep in. Also: sodium." | "Three out, two in." |
Candidate taglines to test (not claims): "Wear the inside joke." · "Your major, worn." · "The hoodie that gets the joke."
Canadian context where natural: snowy path to the lecture hall, dark 4 pm campus, LRT/subway platform, 8:30 a.m. lecture. No temperatures, no university names, no "Made in Canada".
Brand voice rules (editorial, from the cue kit and the sources above):
- Dry, short, lowercase on tags, uppercase on kinetic heads; one joke per ad; the print is the punchline, never a second gag.
- Fashion first: the first 2 s show the hoodie, light, fabric or a person wearing it; the science arrives second, as the twist.
- Say the major, not a university; say "hoodie" and "tee", not "merch drop vibes".
- Numbers only when true and visible on the print or in the tech pack (-70 mV, +40 mV, ~20 nm come from the founder's own film copy).
- No hype adjectives (premium, luxury, viral, must-have): Google says a subtle low-key tone beats a sales pitch for Shorts [G, S2], and fashion-copy guidance favours minimal, evocative lines over fabric spec lists [C, S11].
Script template (fill one per ad): `PRINT: ___ | JOKE (recognition → twist): ___ → ___ | WHO SPEAKS: character / TTS / the user | HOOK (≤10 words): ___ | TAG (spoken): "Acme. ___ edition." | CTA: waitlist / follow | AI CLIPS (≤4): ___ | MG: draw-on / counter / callout | AUDIO: BPM ___, sting, no-trending-music | CLAIMS TO CHECK: ___`.
Cringe filters: no "game-changer", no "drop everything", no fake shock face, no explaining the joke twice, one exclamation mark max per ad (zero is better), no emoji in the wordmark card. If a line sounds like an ad when read aloud, rewrite it (UGC script advice [C, S39]).

## 4. Script frameworks (15 s = 32 beats at 125 BPM = 15.36 s; 30 s = 64 beats = 30.72 s)
Legend: **AI** = Omni/Veo clip (needs ingredients for the hoodie) · **MG** = motion graphic (ffmpeg/ASS/HTML) · **REAL** = composite from the real packshot cutouts · **TTS** = separate voice-over (the user's own recorded voice also fits). Beat n = 0.48 n s. Cuts land on b4/b8/b12/b16/b20/b24/b28.
General five-beat skeleton cited by UGC-script writers: hook, problem, solution, proof, CTA [C, S39]; TikTok's three-step: relatable moment → product naturally → benefit/transformation [G, S5].

Beat grid for the editor (125 BPM; every cut, text event and SFX snaps to these):
| Beat | s | Typical event |
|---|---|---|
| b0 | 0.00 | frame-1 motion, kick, first text pop |
| b2 | 0.96 | second word pop / brand asset |
| b4 | 1.92 | first cut, bass in, bar 2 |
| b8 | 3.84 | second cut |
| b12 | 5.76 | cut into product proof, riser starts |
| b16 | 7.68 | hit/drop, callout lands |
| b20 | 9.60 | next beat of proof |
| b24 | 11.52 | brand block: pair card + spoken tag |
| b28 | 13.44 | end card in |
| b32 | 15.36 | final hit, then cut |
Checklist for a line the model delivers well: one speaker, one beat; ≤10-12 words; no contractions; no numbers that could be read two ways ("twenty nanometres", not "20nm"); no brand name unless tested; delivery cue before the line (low, dry, amused); eyeline stated; room tone stated; "no music" stated when you mean it [G, S15 and L, video-ad-craft rule 6].
Testing plan: TikTok suggests 3-5 creatives per ad group with big differences between them [G, S3]; Motion found low-effort high-volume testing finds winners and high-production should scale proven ones [C, S9]. For Acme: test hooks and tags on the same body plates (swap the first 1.9 s and the spoken tag), not whole new shoots [L, video-ad-craft: alt hooks from the same plates].
Platform notes: Reels ads = 9:16, sound "strongly recommended", captions "recommended", safe-zone 14/35/6% [G, S13]; TikTok = sound/music, 9:16, ≥720p, inside the UI safe zone, DIY look [G, S3]; YouTube Shorts = low-key, talk to camera, brand organically [G, S2].

### 4.1 Problem-agitate-solve (15 s) "The plain-black problem"
| t | Visual | VO / dialogue | On-screen | Sound |
|---|---|---|---|---|
| 0.0-1.9 | AI: student in a plain black hoodie, 8:30 lecture hall, slow push-in, looks at camera | she: "Plain black. Zero personality." | PLAIN BLACK. (pop b0, b2) | room tone, sting b0 |
| 1.9-5.8 | AI: she squints at a classmate's tee, sighs | (none) | "Your major has an inside joke." (b4) | beat enters b4 |
| 5.8-9.6 | REAL+MG: back print 102 fills frame, line-art draws on | TTS: "Wear it." | MIND THE GAP (orange GAP) | hit b12 |
| 9.6-13.4 | MG: front+back pair, lower-third | TTS: "Acme. Neuroscience edition." | acme · neuroscience edition | logo sting b24 |
| 13.4-15.4 | MG end card | TTS: "Join the waitlist." | WAITLIST · LINK IN BIO | final hit b32 |
### 4.2 Hook-demo-proof-CTA (15 s) "The print draws itself"
| t | Visual | VO | On-screen | Sound |
|---|---|---|---|---|
| 0.0-1.4 | MG: orange spark on black, ring pulse (film hook asset) | TTS: "Every thought starts as a spark." | EVERY THOUGHT STARTS AS A SPARK. | kick b0 |
| 1.4-7.7 | REAL+MG: print 104 draws on, signal travels neuron to neuron | none | FIRE TOGETHER · Hebbian plasticity | arp rises to b16 |
| 7.7-11.5 | AI: macro of hoodie fabric/drawstring, raking light + orange rim | none | OVERSIZED · [SPEC from tech pack] | hit b16 |
| 11.5-15.4 | MG: end card | TTS: "Acme. Join the waitlist." | wordmark + WAITLIST · LINK IN BIO | hit b32 |
Proof for fashion = fabric, construction, fit, real print, not claims. A GRWM/fit/styling format is the highest-performing fashion DTC video format in one 2026 guide [C, S11].
### 4.3 Inside joke / identity (15 s) "Mind the gap, the other one"
This is the format Acme sells; the longer production version is Concept A in section 9. Skeleton: recognition → twist → proof on print → brand + ask.
| t | Visual | VO / dialogue | On-screen | Sound |
|---|---|---|---|---|
| 0-1.9 | AI: platform edge, boots stop at the yellow strip | TTS PA: "Mind the gap." | MIND THE GAP (word pops b0, b1, b2) | chime, kick b0 |
| 1.9-5.8 | AI: student in the black hoodie turns to camera | she: "Every neuroscience student hears that differently." | captions in 1-3 word bursts | beat b4 |
| 5.8-11.5 | REAL+MG: print 102 draws on, orange vesicle dots pop | TTS: "About twenty nanometres." | SYNAPTIC CLEFT · ~20 NM | riser, hit b16 |
| 11.5-15.4 | MG: pair card + end card | TTS: "Acme. Neuroscience edition. Waitlist in bio." | WAITLIST · LINK IN BIO | sting b24, hit b32 |
### 4.4 Founder-voice monologue (30 s) "Why we print the joke"
Use the user's real recorded voice (or a real friend). Do not have an AI character claim to be the founder: AI personas giving experience testimonials are a compliance problem in Canada (Ad Standards Fall 2025 update on AI influencers [G, S32]) and IAB research finds Gen Z/Millennials feel less positive about AI-made ads for a second year [C, S42, search snippet]. Founder story ads work because "claims are replaced by human credibility"; keep lines short, conversational, CTA after the payoff [C, S38].
| t | Visual | VO (the user, ~2.3 words/s) | On-screen | Sound |
|---|---|---|---|---|
| 0-3.8 | AI: black hoodie on a hook, desk lamp, door closes | "Every major has a joke nobody else gets." | EVERY MAJOR HAS A JOKE. | room tone + sting |
| 3.8-9.6 | AI B-roll 2 shots: lecture-hall slides, margin doodles | "Mine was a diagram I stared at for four years." [FOUNDER FACT: confirm] | (captions only) | beat from b8 |
| 9.6-17.3 | REAL+MG: five prints cycle on beats (104,103,102,101,105) with film-style heads | "So I put it on a hoodie. Five of them." | FIRE TOGETHER / NODE TO NODE / MIND THE GAP / ACTION POTENTIAL / 3 OUT 2 IN | tick per print |
| 17.3-26.9 | AI: friends laugh at a print; REAL macro | "If you get it, you're in. If you don't, ask." | (captions) | music peak b40 |
| 26.9-30.7 | MG end card | "Acme. Neuroscience edition. Waitlist in bio." | WAITLIST · LINK IN BIO | final hit b64 |
### 4.5 List / POV (15 s) "POV: neuroscience major"
| t | Visual | VO | On-screen | Sound |
|---|---|---|---|---|
| 0-1.9 | AI: hoodie student tilts head to camera | none | POV: you're the only one who gets the hoodie | sting + kick |
| 1.9-3.8 | AI 1.9 s: smiles at a stranger's print-less hoodie | none | 1. explains it unprompted | snap b4 |
| 3.8-5.8 | AI: laughs at a lecture-slide pun | none | 2. laughs first | snap b8 |
| 5.8-7.7 | AI: stops mid-walk to look at a lamp post "gap" sign | none | 3. minds the gap, literally | snap b12 |
| 7.7-11.5 | REAL: back print 102 + callout | TTS: "Acme. For that." | MIND THE GAP | hit b16 |
| 11.5-15.4 | MG end card | TTS: "Follow for drop one." | FOLLOW · WAITLIST IN BIO | hit b32 |
### 4.6 Before / after (15 s) "Same hoodie. Now with a punchline."
| t | Visual | VO | On-screen | Sound |
|---|---|---|---|---|
| 0-3.8 | AI: plain black hoodie back, locked-off | none | BEFORE | kick b0 |
| 3.8-5.8 | hard cut on b8: same plate (same seed/ref) | none | AFTER (orange) | hit b8 |
| 5.8-11.5 | REAL+MG over the back plate: print draws on, orange signal fires | TTS: "Fire together." | FIRE TOGETHER | rising synth |
| 11.5-15.4 | MG pair + end card | TTS: "Acme. Waitlist in bio." | WAITLIST · LINK IN BIO | hit b32 |
(Print over AI footage is composited, not generated: section 7.)
### 4.7 Unboxing / GRWM / day-in-the-life (30 s) "8:30 lecture, minus 20 minutes"
| t | Visual | VO (TTS or the user) | On-screen | Sound |
|---|---|---|---|---|
| 0-3.8 | AI: alarm, dark room, hand on hoodie | "Eight-thirty lecture." | 8:30 · [CITY] | alarm into beat |
| 3.8-9.6 | AI: hoodie on, boots, mug; cuts on b8/b12 | "Boots. Coffee. The hoodie." | BOOTS. COFFEE. HOODIE. | beat |
| 9.6-17.3 | AI: snowy path (Canadian winter, dusk light) tracking | none | (captions only) | pad swell |
| 17.3-23.0 | REAL+MG: back print draws on; callout "3 OUT · 2 IN" | "The back says three out, two in." | NA+/K+ PUMP · 3 OUT · 2 IN | ticks |
| 23.0-26.9 | AI: she walks into lecture hall; hood down | none | none | hit b56 |
| 26.9-30.7 | MG end card | "Acme. Waitlist in bio." | WAITLIST · LINK IN BIO | hit b64 |
### 4.8 Product-detail macro with callouts (15 s)
| t | Visual | VO | On-screen | Sound |
|---|---|---|---|---|
| 0-1.9 | AI: macro rib cuff, raking light, orange rim | none | thin orange dot b0 | sting |
| 1.9-5.8 | AI: drawstring/hem macro; callout lines draw on b4, b8 | none | OVERSIZED FIT · HEAVYWEIGHT [only if spec confirmed] | tick b4, b8 |
| 5.8-11.5 | REAL: print crop zoom + callout "~20 NM" | TTS: "Mind the gap." | SYNAPTIC CLEFT · ~20 NM | hit b12 |
| 11.5-15.4 | MG pair + end card | TTS: "Acme. Waitlist in bio." | WAITLIST · LINK IN BIO | hit b32 |
### 4.9 Testimonial-style, pre-launch version "First look" (15 s)
No customers exist yet. Do not script an AI person saying they bought/wore it for weeks [G, S32]. Use a first-look reaction (honest, present-tense) or real waitlist/friend quotes once they exist.
| t | Visual | Dialogue | On-screen | Sound |
|---|---|---|---|---|
| 0-3.8 | AI: student holds phone with the design on screen, eyes widen | she: "Okay, that one's actually funny." | (captions) | sting |
| 3.8-9.6 | REAL+MG: print 103 draws on | she (off-screen): "Node to node. Please." | NODE TO NODE | hit b8 |
| 9.6-15.4 | MG pair + end card | TTS: "Acme. Neuroscience edition. Waitlist in bio." | WAITLIST · LINK IN BIO | hit b32 |

## 5. Voice
### 5.1 Who talks (pick one per ad)
| Mode | Use when | Risk |
|---|---|---|
| Character to camera (Omni native speech) | hook, reaction, joke line | drift of voice across clips; ≤10-12 words |
| Off-screen VO over B-roll (TTS or the user) | brand name, tag, CTA | must be mixed under music |
| Text-only + music | sound-off-first placements, premium look | no audio brand mention (weakens branding [G, S1]) |
TikTok data: voice-over ads +12% conversion rate; text boxes appear in 86% of ads and a 64% conversion lift is attributed to text [G-self-reported, S7]. Best default for Acme: character says the joke, TTS/the user says "Acme. Neuroscience edition." and the CTA.
### 5.2 Line budgets (speech ≈2.3-2.5 words/s [unverified general figure]; leave ~0.4 s lead-in and tail)
| Clip | Spoken | Words | Notes |
|---|---|---|---|
| 4 s | ≤2.8 s | ≤6 | one beat |
| 6 s | ≤4.5 s | ≤9 | one beat |
| 8 s | ≤6 s | ≤12 | one line + reaction, or two short lines |
| 10 s (Omni) | ≤7.5 s | ≤14 | one beat |
Read the line aloud at the intended pace; if it does not end with a beat of silence at each end of the clip, cut words [C, S18]. Too much text and the character speed-talks; too little and the model invents gibberish [C, S16].
### 5.3 Prompt syntax (sources conflict, so A/B once and standardise)
- Google Cloud best practice: avoid quotation marks; put the line after a colon after the speaker's action, to avoid rendered text [G, S15]; Replicate agrees (`A guy says: My name is Ben`) [C, S16].
- A 2026 Veo 3.1 guide says Google's guide uses quotes (`A woman says, "We have to leave now."`) [C, S18].
- Burned-in subtitles: Replicate says "(no subtitles)" helps; Versely says naming subtitles makes it worse and quotes/contractions trigger them (MIT Technology Review reported it July 2025, per Versely) [C, S16, S17]. Use colon form, no contractions, add "clean frame" instead of "no text" [also L, video-ad-craft rule 11].
Template: `She looks into the camera and says: I was just about to say that. Voice: low, amused, early twenties, Canadian-neutral accent. Audio: library room tone, no music, no on-screen text.` Repeat the same voice description and character wording in every clip; Google's page shows repeating character and voice descriptions (plus a seed) for voice consistency, and covers "Gemini Omni and Veo" together [G, S15] (assumption: Omni honours the same advice).
### 5.4 Brand name "Acme"
Not tested: no credits were spent, so the model's pronunciation is [unverified]. Plan: (1) keep the brand name out of in-clip dialogue and let TTS/the user say it; (2) if a character must say it, test three 4 s drafts: `Acme`, `ep-sih-lon`, `ep-sih-lon` plus accent cue; community advice is to respell phonetically (`Fofur` → `foh-fur`) [C, S19]; (3) avoid ALL-CAPS in the spoken line: one course notes acronyms come out letter by letter [C, snippet S20b]; ALL-CAPS brand names may behave the same [unverified]; (4) decide the house pronunciation (EP-sih-lon vs ep-SY-lon) once and use it everywhere. Open question for the user.
### 5.5 When to use separate TTS (recommended for the brand lines)
- Voice consistency across clips (each generation can sound different).
- Exact brand pronunciation and the same tag every ad.
- Dialogue-free clips are cheaper and avoid phantom subtitles.
| Option | Licence | Notes |
|---|---|---|
| the user's own voice | his | best: real founder, no AI-voice label; record 3 takes of each tag |
| ElevenLabs | free plan: no commercial licence (+attribution); paid plans include commercial licence, Beta services excluded [G, S21] | hold the plan receipt as licence evidence |
| OpenAI `gpt-4o-mini-tts` | API; usage policy requires a clear disclosure that the voice is AI-generated [G, S22] | how to disclose inside an ad is [unverified]; plan a caption line |
| Kokoro-82M (local) | Apache-2.0 [C, S23b] | check the voice pack licences |
| Piper (local) | GPL-3.0-or-later [C, S23b] | voices carry their own licences |
| the host `text_to_speech` tool | depends on the configured provider | read the provider terms; do not assume. Unofficial endpoints (e.g. Edge) are [unverified] for paid ads |
Mix: VO at the front, music ducked ≥6 dB under speech, sting dry; master with two-pass loudnorm after mixing (recipes in `production-pipeline.md`). Trending music is not allowed in ads; use licensed/library tracks [L, production-pipeline.md]. TikTok's Commercial Music Library is the pre-cleared option [G, S4].

## 6. Motion graphics
### 6.1 Numbers to use
| Item | Rule | Basis |
|---|---|---|
| Fonts | Space Grotesk (heads), IBM Plex Mono (kickers/tags); two fonts max, same pair every ad | [L] fonts/; [C, S23 "two fonts, two colours"] |
| Sizes at 1080×1920 | primary 60-72 px bold; support 40-48; captions 32-40; floor 36 | [C, S24] |
| Colours | white `#f4f4f6`, orange `#FA7F14` as accent word/rule/dot only, one accent per frame | brand + [C, S25] |
| Contrast | white on near-black 18.6:1; orange on near-black 7.6-8.1:1; **orange on white 2.59:1 (fails)**: on white backgrounds use orange only as a large shape/rule, text in black | computed here; WCAG 4.5:1 normal text [G, S28] |
| Text per card | 3-7 words hook; ≤2 lines; 1-3 words per burst for kinetic captions | [C, S23, S24, S25] |
| Hold time | ≥1.5 s per card; words ÷ 1.5 s (conservative); 4-6 cards in 15 s, 8-12 in 30 s | [C, S23, S24] |
| Reading rate | non-spoken text ≤3 words/s | TikTok's help page recommends "5-10 words per second" [G, S3], which conflicts with reading research quoted by S24 (~4 words/s); I follow the lower figure |
| New text event | at most one per beat group (0.96-1.92 s); never move camera and text together | [C, S23] |
| Word pop | 0.15-0.25 s | M3 short durations 50-200 ms, medium 250-400 ms [G-UI guidance adapted, S26]; film.js `pop` 0.30 s, `rise` 0.44-0.52 s [L] |
| Easing | enter = ease-out `cubic-bezier(.16,1,.3,1)` (film.js; M3 emphasized-decelerate is `.05,.7,.1,1` [S26]); exit = ease-in `cubic-bezier(.7,0,.84,0)` (film.js), faster than enter; no bounce | [L, S26] |
| Text lead | text lands 0.1-0.3 s before the spoken word, or on the beat | [C, S24] |
| Safe zone (Meta Reels ads) | no text/logos in top 14% (269 px), bottom 35% (672 px), 6% sides (65 px) | [G, S13] |
| Flashes | ≤3 flashes/s; a full-frame flash every beat at 125 BPM is 2.08/s, so avoid white flashes | [G, S28] |
| Meta copy limits | Reels primary text 40 chars, headline 55 chars | [G, S13] |
### 6.2 Caption styles trending now
Animated word-by-word captions are described as the default grammar of short-form [C, S25, S29b]; one vendor (OPUS research via KreateFlo, methodology not checked) says 78.6% of 13.5M clips use them versus 1.6% static [C, unverified]. Style: bold sans, 1-3 words per burst, white base with one highlight colour on payoff words, upper-middle of the lower safe area [C, S25]. 2026 type trends include quiet lowercase hooks next to heavy condensed captions [C, S30]. Acme version: Space Grotesk Bold uppercase for spoken captions, orange only on the payoff word ("GAP"), lowercase mono for tags. TikTok says text pop-ups and fast scene changes sustain engagement (Neuro-Insight, 2022) [G-self-reported, S4].
### 6.3 Recipes
**R1. Beat-synced word pop (ASS) [T].** One `Dialogue` per word, start = n × 0.48 s; the pop is `\t` scale 70→112→100% plus alpha. Orange via `\1c&H147FFA&` (ASS is BGR: `#FA7F14` → `&H147FFA&`).
```
Dialogue: 0,0:00:00.96,0:00:02.25,Pop,,0,0,0,,{\an5\pos(540,1000)\fscx70\fscy70\alpha&HFF&\1c&H147FFA&\t(0,90,\fscx112\fscy112\alpha&H00&)\t(90,200,\fscx100\fscy100)}GAP
ffmpeg -i in.mp4 -vf "ass=pop.ass:fontsdir=fonts" -c:v libx264 -pix_fmt yuv420p out.mp4
```
**Font pitfall [T]:** `SpaceGrotesk.ttf` is a variable font (wght 300-700, default Light). libass could not select weight 400 or 700 and silently fell back to Noto Sans (`fontselect: (Space Grotesk, 700) -> NotoSans-Bold`). Fix used here: instantiate a static bold (`uv pip install --target ./pylib fonttools`, `instancer.instantiateVariableFont(f, {"wght": 700}, updateFontNames=True)`), then libass chose `SpaceGrotesk-Bold`. Use the same static file for `drawtext fontfile=`. (`Bold=0` plus the name "Space Grotesk Light" also works for the Light cut.)
Generator [T] (the exact script used in the test; edit `words`, `bpm`, `style`):
```
bpm=124; beat=60/bpm; words=["mind","the","gap"]
def ts(t):
    cs=int(round(t*100)); h=cs//360000; m=(cs//6000)%60; s=(cs//100)%60; c=cs%100
    return f"{h}:{m:02d}:{s:02d}.{c:02d}"
# header: PlayResX 1080, PlayResY 1920, Style Pop = Space Grotesk 120 bold, white, outline 5, Alignment 5
ev=[]
for i,w in enumerate(words):
    s=i*beat; e=(i+1)*beat if i<len(words)-1 else len(words)*beat+0.8
    col=r"\1c&H147FFA&" if w=="gap" else ""
    ev.append(f"Dialogue: 0,{ts(s)},{ts(e)},Pop,,0,0,0,,{{\\an5\\pos(540,1000)\\fscx70\\fscy70\\alpha&HFF&{col}\\t(0,90,\\fscx112\\fscy112\\alpha&H00&)\\t(90,200,\\fscx100\\fscy100)}}{w.upper()}")
```
Result [T]: frames at 0.07 s were mid-pop (grey, small), then white "MIND", "THE", orange "GAP". Use the same grid with `bpm=125` (beat 0.48 s) for the ads; the test used 124 BPM (0.484 s) so both work.
**R2. Draw-on rule / callout line [T].** `drawbox` width does NOT animate with `t` (the expression is evaluated once: the box appeared full length at all times in my test). Use either:
```
# ASS: animated clip reveals a 520x4 orange rule at 1.92 s over 0.4 s
Dialogue: 0,0:00:01.92,0:00:05.00,Vec,,0,0,0,,{\pos(96,1180)\1c&H147FFA&\clip(96,1176,96,1184)\t(0,400,\clip(96,1176,616,1184))\p1}m 0 0 l 520 0 520 4 0 4{\p0}
# or ffmpeg: scale with eval=frame, then overlay
ffmpeg -f lavfi -i color=c=0x0b0b0c:s=1080x1920:r=30:d=4 -f lavfi -i color=c=0xFA7F14:s=520x4:r=30:d=4 -filter_complex "[1:v]scale=w='max(2,520*min(1,(t-1.0)/0.4))':h=4:eval=frame[l];[0:v][l]overlay=x=96:y=1180:eof_action=pass:enable='gte(t,1.0)'" -c:v libx264 -pix_fmt yuv420p o.mp4
```
Callout dot: `{\fscx0\fscy0\t(0,120,\fscx100\fscy100)\p1}m 0 0 l 18 0 18 18 0 18` [T]. Leader line = rule recipe, label = ASS text or `drawtext`.
**R3. Lower-third / label fade-slide [T].** `drawtext=fontfile=SpaceGrotesk-Bold.ttf:text='ACME':fontsize=84:fontcolor=white:x=96:y='1090+if(lt(t,1.92),30,30*pow(1-min(1,(t-1.92)/0.3),3))':alpha='if(lt(t,1.92),0,min(1,(t-1.92)/0.3))'` (rise 30 px with cubic ease-out over 0.3 s starting b4; mono sub-line fades 0.5 s later). Keep y inside 269-1248.
**R4. Counter/stat card [T].** `drawtext=...:text='%{eif\:trunc(min(max(t-0.5,0)/1.2,1)*20)\:d} NM':fontsize=140:box=1:boxcolor=black@0.6:boxborderw=24` ("0 → 20 NM", frame at 0.67 s read 2, 2.0 s read 20).
**R5. Beat pulse (zoom punch) [T syntax only; I only inspected frames for the counter overlay, not the pulse itself].** `scale=w='trunc(1080*(1+0.04*exp(-9*mod(t,0.4839)))/2)*2':h='trunc(1920*(1+0.04*exp(-9*mod(t,0.4839)))/2)*2':eval=frame,crop=1080:1920` (4% decaying pulse per beat). Restrict to MG plates, not AI faces (it softens them).
**R6. Animated logo stinger [T].** Render the stinger as an RGBA PNG sequence (or an alpha WebM) and `overlay` with `format=rgba,fade=t=in:st=0:d=0.2:alpha=1`; ffmpeg handled `-framerate 30 -start_number 0 -i f%03d.png` with `overlay=shortest=1`. Logo reveal = clip-path wipe left to right 0.76 s with `cubic-bezier(.16,1,.3,1)` as in film.js `.logo` [L].
**R7. Print draw-on (stroke-dash) [L pattern, not run here].** film.js arms each path with `pathLength=1`, `stroke-dasharray:1`, animates `stroke-dashoffset` 1→0 over 0.50 s, then a glow dot travels the same polyline (`signal()`) and the vector art fades into the real printed art (`T.dock`, `T.artFade`). Reusing it for an ad means copying `film/` into a new campaign folder and editing the copy.
**R8. Kinetic caption in HTML (pattern from film.js; untested here).**
```
.w{opacity:0;transform:translateY(24px) scale(.82);animation:pop .22s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--b)*.48s)}
@keyframes pop{to{opacity:1;transform:none}}   /* <span class="w" style="--b:4">MIND</span> */
```
For deterministic frames use film.js's approach: pause all animations and set `currentTime` from `window.seek(t)`, screenshot per frame.
**R9. Underline/progress wipe.** R2 with a 3-4 px bar; progress bar = same recipe stretched over the whole duration (the ASS clip version worked in the R2 test).
**R10. End card.** Black, wordmark reveal b28 (0.76 s), one line of CTA (mono, tracked, white; accent word orange), no price. Hold ≥1.9 s (1 bar) [editorial; no source gives a magic hold time].
### 6.4 HTML renderer: what exists [L]
- `film/index.html` + `film.js`: 1080×1920 stage, `#strip` of scenes with one camera whip-panning, CSS keyframes built by `kf()`; fonts from `../fonts/`; all timings are absolute seconds; `window.seek(t)` and `window.__ready`.
- `render-frames.js`: Playwright + `/usr/bin/google-chrome` headless; env `T0 T1 FPS(60) FORMAT(jpeg|png) DIR PREFIX SHARD_*`; screenshots one frame per `seek`, shardable. It would need a transparent page background and PNG output for alpha overlays (untested).
- `overlay.js`, `calib.js`, `stills.js`: alignment QA between vector art and print.
- Fonts: SpaceGrotesk.ttf (variable), IBMPlexMono Regular/SemiBold.
Preferred split: ASS/ffmpeg for captions, rules, counters (fast, deterministic, no browser); HTML for the draw-on line-art docked onto the print (already built).

## 7. Compositing the real product [L, T]
- Existing pipeline: `make_cutouts.py` flood-fills the light-grey studio sweep from the border, keeps near-black garment pixels, unmixes edge alpha against the sweep, crops to RGBA `cut_10x.png` and writes `cutouts.json` (`print` rect and `print_center` per design, e.g. 104: print `[797,371,344,246]` in a 1292×874 cut). Each cut shows the **front (small chest wordmark) and back (print) side by side**, so one asset serves "front AND back".
- [T] ffmpeg composite from a copy of the data: `[print crop] crop=344:246:797:371,scale=860:-1:flags=lanczos` placed as an inset with `fade=t=in:st=1.0:d=0.2:alpha=1` over the full pair. Works. The crop is only ~344 px wide so upscaling to 860 px is soft: re-export the print region from the vector master for close-ups.
- Do not paste a flat print onto moving AI cloth (it will not follow folds). Use composites for: product-pair cards, print close-ups on a neutral plate, before/after plates. Use AI footage for body, light, fabric weight, and keep the print on AI footage as generated from the reference (check QC, `production-pipeline.md`).
- Show size/fit with real facts only: add `[SIZE RANGE]`, `[MODEL HEIGHT/SIZE WORN]` from the tech pack; "oversized" is the design intent; never imply measurements the garment lacks.
- Callouts (thin line + dot + mono label) in the fine-line style: R2. Labels from the film's own science copy: "SYNAPTIC CLEFT · ~20 NM" (film says "about 20 nanometres"; textbooks give roughly 20-40 nm, [unverified here]), "-70 MV REST · +40 MV PEAK", "NA+/K+ ATPASE", "SALTATORY CONDUCTION".

## 8. CTA, offer, pre-launch rules
- CTA ladder now: follow → waitlist. Later: shop. TikTok: 80% of top-intent campaigns use a CTA prompt [G, S7]; Meta: add a clear CTA and reward attention with a payoff [G, S12]; Google: reinforce on-screen CTA with voice [G, S1]; Google Shorts: highest performers put CTA details in the hook [G, S2], so show the waitlist chip in the first 3 s too (small, inside safe zone).
- Motion found "offer only" hooks near the top for hit rate [C, S9]; pre-launch offer = early access, only if true and time-boxed truthfully.
- Avoid: countdown timers that reset, "limited time", "only N left" unless true (Competition Bureau lists these as fake urgency cues [G, S29]); regular/"was" prices that are not the genuine ordinary price [G, S29, S31]; drip pricing, i.e. a price not attainable due to mandatory fees (s.74.01(1.1)) [G, S40]; "shop" or "available now" before the store is open; claims about GSM, "ethically made", "Made in Canada", sustainability without evidence [L, production-pipeline.md]; AI-persona reviews [G, S32].
- Waitlist emails: CASL requires consent, sender identification and an unsubscribe mechanism for commercial electronic messages [G, S33]; counsel to check wording [unverified].
- Pinned comment options: "Which major should we do next? Waitlist link in bio." · "Yes, the gap is ~20 nm. Yes, it's on the back." · "Explain your major's inside joke below."
- Caption options (≤125 chars visible): "mind the gap. the other one. acme · neuroscience edition. waitlist in bio." · "fire together. acme · neuroscience edition. follow for drop one."
- On-screen CTA wording: "JOIN THE WAITLIST · LINK IN BIO" / "FOLLOW FOR DROP ONE". Meta Reels primary text 40 chars, headline 55 [G, S13]. Spark Ads/organic-first: TikTok recommends boosting organic or creator posts, which keep social proof [G, S5].
- Disclosure and labelling: keep AI labels as in `production-pipeline.md`.

## 9. AD BIBLE: three 15.36 s ads (125 BPM, beat = 0.48 s, 8 bars)
Sound: music = licensed library track at 125 BPM (kick on every beat; bass enters b4; drop b16; riser b12-b16), sting = 0.4 s two-note "ping" on every wordmark pop. All ads: one 9:16 master, 4:5 and 1:1 safe crop, captions burned inside y 269-1248.
### Concept A "MIND THE GAP" (inside joke / POV, character + PA + TTS)
| Time (beat) | Visual | VO / dialogue | On-screen text | Music / SFX | Purpose |
|---|---|---|---|---|---|
| 0.00-1.92 (b0-4) | AI A1: metro platform edge, yellow tactile strip, boots stop at the line, low camera, air-rush; orange rule draws on at y≈1100 | TTS PA voice on b0: "Mind the gap." | MIND (b0) THE (b1) GAP (b2, orange) | chime + kick b0, sting b2 | recognition + brand colour + brand text ≤2 s |
| 1.92-5.76 (b4-12) | AI A2: student in black hoodie, lecture hall, looks to camera, mid-reaction | she: "Every neuroscience student hears that differently." | caption bursts (1-3 words) | beat in b4 | the twist, say the major aloud |
| 5.76-9.60 (b12-20) | REAL+MG: back print 102 on neutral plate; line-art draws on b12-14; orange vesicle dots pop on b14,15,16; counter 0→20 NM b12-b16 | TTS (the user): "The gap is twenty nanometres." | SYNAPTIC CLEFT · ~20 NM | riser b12-16, hit b16, tick per dot | proof on the real print |
| 9.60-11.52 (b20-24) | AI A3: macro of rib cuff/drawstring, raking light + orange rim | none | OVERSIZED · FRONT + BACK (b22) | pad, tick b22 | product detail; claim only what spec supports |
| 11.52-13.44 (b24-28) | MG: front+back pair slides in; lower-third rule draws b24 | TTS: "Acme. Neuroscience edition." | acme · neuroscience edition | wordmark sting b24 | brand + product name spoken |
| 13.44-15.36 (b28-32) | MG end card: wordmark wipe b28, CTA line b29 | TTS: "Join the waitlist." | JOIN THE WAITLIST · LINK IN BIO | final hit b32, tail ≤0.3 s | CTA |
### Concept B "FIRE TOGETHER" (two single-person clips, shot/reverse-shot, no shared frame)
| Time (beat) | Visual | VO / dialogue | On-screen text | Music / SFX | Purpose |
|---|---|---|---|---|---|
| 0.00-0.96 (b0-2) | MG: orange spark + ring pulse on black (film hook asset), wordmark kicker small | none | FIRE (b0) TOGETHER (b1) | kick b0, rising synth | pattern interrupt, brand colour in frame 1 |
| 0.96-4.80 (b2-10) | AI B1: girl, library at night, half-laughs mid-sentence to camera-left | she: "Wait. I was about to say that." | captions | groove in b4 | humanise, set up the pair |
| 4.80-8.64 (b10-18) | AI B2: boy reverse angle, same lamp light | he: "We have been studying too long." (no contraction, per S17) | captions | cut on b10 | twist: shared thought |
| 8.64-11.52 (b18-24) | REAL+MG: back print 104 on plate; orange signal travels neuron to neuron over 1.9 s | none | NEURONS THAT FIRE TOGETHER · HEBBIAN PLASTICITY | drop b16-b18, tick on arrival b22 | the joke explained on the print |
| 11.52-13.44 (b24-28) | MG: pair card + lower-third | TTS: "Acme. Neuroscience edition." | acme · neuroscience edition | sting b24 | product + brand |
| 13.44-15.36 (b28-32) | MG end card | TTS: "Follow for drop one." | FOLLOW · WAITLIST IN BIO | hit b32 | CTA |
### Concept C "3 OUT, 2 IN: the midterms uniform" (deadpan VO + counters, Canadian winter)
| Time (beat) | Visual | VO / dialogue | On-screen text | Music / SFX | Purpose |
|---|---|---|---|---|---|
| 0.00-1.92 (b0-4) | AI C1: dawn snow, hooded student in black hoodie tracking toward lecture hall; MG counters: COFFEES OUT 3 (b0), HOURS IN 2 (b2) | TTS deadpan: "Midterm week. Three out. Two in." | 3 OUT · 2 IN (orange numerals) | kick b0, tick b0 & b2, sting b3 | hook + number gag + palette |
| 1.92-5.76 (b4-12) | AI C2/C3 (1.9 s each): crushed paper cup; face lit by laptop glow | none | "3 coffees out." (b4) "2 hours in." (b8) | tick b4, b8 | beat-cut humour, product-free atmosphere |
| 5.76-9.60 (b12-20) | REAL+MG: print 105; three orange ions out, two in, on b14,15,16 / b17,18 | TTS: "Your neurons run on it." | NA+/K+ PUMP · 3 OUT · 2 IN | riser, hit b16 | the print is the joke |
| 9.60-11.52 (b20-24) | AI C4: hoodie front 3/4, hood up, push-in; orange underline wipe under "UNIFORM" | none | THE MIDTERMS UNIFORM | tick b20 | product on body |
| 11.52-13.44 (b24-28) | MG pair + lower-third | TTS: "Acme. Neuroscience edition." | acme · neuroscience edition | sting b24 | brand spoken |
| 13.44-15.36 (b28-32) | MG end card | TTS: "Join the waitlist." | JOIN THE WAITLIST · LINK IN BIO | hit b32 | CTA |
Credits: AI clips are 3-5 per ad (see `video-ad-craft.md` budgets); all graphics are free renders.
### QC checklist: would a stranger know brand, product, next step?
| Test | Pass if a stranger (3 viewers, ad muted, then with sound) says |
|---|---|
| 0-3 s | "Acme" (or "that orange-and-black brand") is readable or audible; frame 1 already moving; the idea of the joke is clear without sound |
| 10 s | knows the product is a hoodie/tee with a printed neuroscience joke; has seen the real print ≥2 s; has seen/heard the name twice |
| End | can state the action ("join the waitlist / follow") and where (link in bio) |
Also: text inside y 269-1248 and x 65-1015; caption contrast ≥4.5:1; no text smaller than 36 px; ≤1 new text event per beat group; no flash >3/s; no claims, prices, "was" prices, scarcity or fake testimonials; AI label set; music licence stored; audio loudness per `production-pipeline.md`; wordmark spelled "acme"; print/logo not warped in AI frames; stranger test notes saved with the export.

### 9.4 AI clip prompts (summaries; attach the real packshot and one adult model sheet as ingredients, end every prompt with the pin clause "Keep the hoodie cut, colour, print scale and position identical to the reference." [L, video-ad-craft rule 2])
All: open with the camera, one move, "in a single unbroken scene, no scene cuts" [L]; casting "22-year-old adult" [L]; heavy-fleece weight words; one named light source; dialogue by colon, no quotes, no contractions; "clean frame" not "no text".
| Clip | Prompt summary |
|---|---|
| A1 platform | Low static camera at a metro platform edge. Black boots stop behind the yellow tactile strip as a train rushes past, wind lifts the hem of a heavy black hoodie. Cold fluorescent light. Audio: air-rush, echo, no music, no dialogue (PA voice added in post). |
| A2 lecture | Medium shot, slow push-in. A 22-year-old woman in a heavy black oversized hoodie sits in a tiered lecture hall, looks into the camera, half-smiles and says: Every neuroscience student hears that differently. Voice: low, amused, dry. Audio: room murmur, no music. |
| A3 macro | Macro slide along a rib cuff and drawstring of heavy black fleece, raking hard side light, one saturated orange gel grazing the fabric from camera-right, visible weave. Audio: cloth rustle, no music. |
| B1 library | Handheld micro-jitter close-up. A 22-year-old woman, library at night, green desk-lamp light, half-laughs mid-sentence looking just left of camera and says: Wait. I was about to say that. Audio: room tone, no music. |
| B2 reverse | Mirrored framing, eyeline just right of camera, same lamp. A 22-year-old man says: We have been studying too long. Same grade, same room tone. |
| C1 snow | Low tracking camera beside a hooded student in a heavy black hoodie walking through dawn snow toward a lecture hall, clear foot plants, breath visible, overcast daylight. Audio: crunching snow, wind, no music, no dialogue. |
| C2/C3 | Macro of a crushed paper coffee cup on a library desk (hand enters); 4 s close-up of a face lit by laptop glow, eyes tired but amused. Product-free, can be Veo Lite [L]. |
| C4 front | Slow push-in on a 3/4 view of the hooded black hoodie front, small chest wordmark readable, overcast light with an orange rim from the side. |
Casting/age: keep "adult, 22 years old" explicit; "university student" alone can trip the child-safety filter [L, video-ad-craft].

### 9.5 Handoff: what is AI and what is rendered locally
| Concept | AI clips (Flow) | Local renders |
|---|---|---|
| A | A1, A2, A3 (about 11 s of footage; A2 has dialogue) | word pops, rule, counter, print draw-on (HTML), pair card, end card, PA/VO TTS |
| B | B1, B2 (dialogue) | spark hook, print draw-on 104, pair card, end card, TTS tags |
| C | C1, C2, C3, C4 (no dialogue) | counters, print 105 ions, underline wipe, pair card, end card, TTS |
Rule of thumb from the sources: AI carries humanity, fabric and light; local graphics carry brand, product truth, text and CTA. Keep AI shots ≤2-4 s where possible so each can be cut on a beat and a bad take costs little [L, reels-and-ads.md].

## 10. Reference brand behaviours (secondary sources, [C]; shown for pattern, not verified first-hand)
| Brand | Pattern | Takeaway for Acme |
|---|---|---|
| Gymshark | community/creator content, UGC-heavy testing [S10 summary; snippet-level sources] | people wearing it > studio |
| Alo Yoga | "ads that don't feel like ads", creator-led, consistent muted visual grammar, risk of aesthetic sameness [S36] | stay consistent, vary hooks |
| Represent | limited drops, email/SMS to the community first then paid [S37] | waitlist before paid |
| Culture Kings | ads as cultural announcements, event-led content [S38] | drops as events later |
| Fear of God | mainline: no hook, no CTA, studio; sale ads add a headline [S35] | not a model for pre-launch |
| Clothing brands on TikTok (Oct 2026 weekly) | serialised launches, close macro on zipper/embroidery, creator try-on with code [S39] | serialise: one print per post |

## 11. Source conflicts and open questions
1. Dialogue syntax: colon/no quotes [S15, S16] vs quotes [S18]; "no subtitles" helps [S16] vs hurts [S17]. Run one A/B.
2. On-screen text rate: "5-10 words per second" [S3] vs ~3-4 words/s reading speed [S23, S24]. Use ≤3.
3. Hook content: UGC scripts say do not name the product in the hook [S39]; System1/Google say brand early [S8, S1]. Use brand assets, not a pitch.
4. Lo-fi native look [S4] vs Acme's minimal brand [L]. Use native structure, branded look.
5. Meta Reels recommended 1440×2560 [S13] vs 1080×1920 in `production-pipeline.md`: same ratio; check before paid.
6. Open: house pronunciation of "Acme"; does Omni honour phonetic spelling; real spec values (GSM, sizes) for callouts; founder facts for the monologue; whether a waitlist offer (early access) will really exist; which TTS provider the host has configured and its licence; "Shop the drop" in the founder film; Quebec French variants.
7. Stats marked self-reported (TikTok, Google/Kantar, System1 via press) are not independent; 2020-2022 TikTok figures are old.

## 11b. What to build next (agent tasks, in order)
1. `caption-ass`: words + beat grid + brand style → `.ass` (R1 generator, static Space Grotesk Bold file, safe-zone positions).
2. `endcard`: wordmark wipe + CTA line + final hit (R10), parameterised by CTA text and duration.
3. `stinger`: RGBA wordmark reveal + 0.4 s sting audio, same every ad (R6).
4. `callout`: thin line + dot + mono label from a JSON (anchor px, label, beat) (R2).
5. `safezone-overlay.png`: transparent mask of 14/35/6% zones to test every export [G, S13].
6. ~~Copy `film/` to a campaign folder~~ SUPERSEDED: the user dislikes that film; use `flow_motion_overlay` (new engine) instead.
7. A/B voice tests: one 4 s Omni draft each for `Acme` / `ep-sih-lon` (the user approves any credit use).

## 12. Sources (all opened or searched 2026-10-16)
S1 https://support.google.com/google-ads/answer/14783551?hl=en · S2 https://business.google.com/us/think/search-and-video/short-form-video-advertising-tips/ · S3 https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en · S4 https://ads.tiktok.com/business/library/Creative_Codes_ENG.pdf · S5 https://ads.tiktok.com/business/en/guides/what-is-ad-creative-guide · S7 https://ads.tiktok.com/business/creativecenter/quicktok/online/tiktok_creative_accelerator/pc/en · S8 https://www.chiefmarketer.com/system1-tiktok-study-branding-elements-and-creator-led-content-improve-short-form-video-ads/ · S9 https://motionapp.com/library/talk/we-analyzed-500k-in-meta-ads-to-find-hooks-formats-that-always-win/ · S10 https://adlibrary.com/posts/best-fashion-ads-2026 · S11 https://mhigrowthengine.com/blog/dtc-fashion-ad-creative-guide/ · S12 https://www.facebook.com/business/learn/lessons/create-fb-ig-reels/ · S13 https://www.facebook.com/business/ads-guide/update/video/facebook-facebook-reels · S15 https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice · S16 https://replicate.com/blog/using-and-prompting-veo-3 · S17 https://www.versely.studio/blog/veo-burned-in-subtitles-you-never-asked-for · S18 https://prompt-architects.com/blog/101-veo-dialogue-prompts · S19 https://github.com/newnameklabs/veo-3-prompting-guide/blob/main/README.md · S20b https://kursvideoai.pl/en/kurs-prompt-engineering-video/ (search snippet only) · S21 https://help.elevenlabs.io/hc/en-us/articles/13313564601361-Can-I-publish-the-content-I-generate-on-the-platform · S22 https://developers.openai.com/api/docs/guides/text-to-speech · S23 https://www.versely.studio/blog/text-overlays-typography-on-video · S23b https://www.promptquorum.com/power-local-llm/piper-vs-kokoro-tts (Kokoro/Piper licences, search snippet) · S24 https://www.rocketshiphq.com/text-overlays-video-ads-mobile/ · S25 https://kreateflo.com/blog/can-word-by-word-caption-animation-keep-viewers-hooked · S26 https://m3.material.io/styles/motion/easing-and-duration/tokens-specs · S28 https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html and https://www.w3.org/WAI/WCAG22/Understanding/three-flashes-or-below-threshold.html (search snippets) · S29 https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/fake-sales-and-discounts · S29b https://rendercomp.com/blog/tiktok-style-captions-remotion-whisper/ (search snippet) · S30 https://memefont.org/blog/best-viral-text-fonts-tiktok-instagram-reels-2026 (search snippet) · S40 https://laws-lois.justice.gc.ca/eng/acts/C-34/section-74.01.html (drip pricing, s.74.01(1.1)) · S31 https://competition-bureau.canada.ca/en/how-we-foster-competition/education-and-outreach/ordinary-price-claims · S32 https://adstandards.ca/wp-content/uploads/Ad-Standards-Influencer-Marketing-Disclosure-Guidelines-2025-10-08.pdf (AI-influencer note: https://www.legal500.com/intelligence/canada/media-telecoms-it-entertainment/canada's-updated-influencer-marketing-disclosure-guidelines-navigating-ai-affiliate-marketing-child-audiences-and-more) · S33 https://crtc.gc.ca/eng/internet/anti/reg.htm · S34 https://www.shopify.com/enterprise/blog/how-retailers-use-streetwear-brands-to-reach-todays-consumers · S35 https://motionapp.com/library/fear-of-god · S36 https://www.influencers-time.com/how-alo-yogas-tiktok-creator-strategy-preps-it-for-ipo/ · S37 https://adlibrary.com/brands/represent-clothing · S38 https://adlibrary.com/brands/culture-kings (founder story: https://www.gethookd.ai/learn/founder-story-ads-examples-how-to-create-them/) · S39 https://www.ugcvid.io/ugc-ad-scripts and https://lightreel.ai/blogs/clothing-brands-on-tiktok · S42 https://www.iab.com/insights/the-ai-gap-widens/ (search snippet: Gen Z/Millennials less positive on AI ads).
Local [L]: `/home/you/Documents/Acme/99_Archive/legacy/Ad-Neuroscience_old_project/{film/index.html,film/film.js,render-frames.js,overlay.js,make_cutouts.py,cutouts.json,fonts/}`; skill refs `reels-and-ads.md`, `video-ad-craft.md`, `production-pipeline.md`.
Tests [T] ran in `cache/scratch/mg/` (ffmpeg 9.0.1 with libass/freetype/harfbuzz) and were cleaned up afterwards.
