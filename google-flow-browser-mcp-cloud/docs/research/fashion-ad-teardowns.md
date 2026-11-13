# Fashion / streetwear short-video ads: teardown + standards (for Acme)

Research date: 17 Oct 2026. Scope: vertical 9:16 ads and ad-style posts for Instagram Reels and TikTok, 8-20 s.
Prepared for the Acme "Neuroscience edition" ad (library dialogue -> back-print reveal -> front+back -> end card).

## 0. How to read this doc (method, limits, honesty notes)

- **Citations**: every claim carries a source id `[S#]`. Full URLs are in the Sources table at the end. Ad rows link to the Motion page they came from.
- **28 ad-level teardowns** (Section 2A) come from Motion's public "Inspo Library" pages, which list *live Meta ads* per brand with a second-by-second storyline [S18]. **Motion's breakdowns are AI-generated descriptions, not brand-confirmed. They contain no performance data** (no CTR/ROAS/hook rate). The only popularity proxies are "ACTIVE" status and the number of variants Motion grouped together. So "high-performing" is **UNVERIFIED** for every ad-level row. They are real, current (Spring/Summer 2026 collections) ads that big brands are running at volume, not ads proven to be winners.
- Motion's storyline lines are *not* true cut counts (a line can contain several cuts). Treat "segments" as a lower bound on cuts.
- **11 campaign/post-level cases** (Section 2B) come from trade press, brand pages and the Lightreel weekly report [S13]. Lightreel is a vendor report of its own observations (3-10 Oct 2026); I could not independently confirm its engagement claims.
- **Not reachable / not used**: Meta Ad Library (not queried; JS app, no ad IDs captured), TikTok Creative Center "Top Ads" dashboard (TikTok returned HTTP 403 to the browser; only TikTok's text pages seen via search/extract snippets are cited and marked "snippet"). Kith and Stussy: only brand-strategy writing found, **no specific short-video ad verified, so neither is counted**. Audio is rarely described by Motion; where unknown it says "not stated".
- Three Motion entries were mis-filed under another brand's page (Rhone page showed an AYR ad, Aritzia page showed an Athleta ad, Gymshark page showed a Joja Activewear ad). I **excluded** those from the 28.

---

## 1. Headline findings (read this if nothing else)

1. Streetwear/graphic-apparel ads at volume are **fast product montages**: ~1-2 s per beat, cuts on the beat, back-of-garment graphics shown repeatedly, almost no talking. Represent, Cold Culture, Culture Kings, Aerie montage ads [S18].
2. The **dialogue/talk format is a distinct, working lane** but it is built on creators, not synthetic actors: Aerie and Alo "yapper" hauls cut every 2-3 s on the speaker's words; Cotopaxi skit/POV; Princess Polly "Hotline"; Reformation's self-aware ad [S18][S13]. Acme's two-person library scene sits in this lane.
3. **Hook = something is already happening in frame 0** (action, a person addressing you, a pattern-break, an audience receipt), with text for context. TikTok's own guidance: proposition within 3 s, hook within 6 s, captions on [S5][S7].
4. **Brand/product lands early (≈20-30% of runtime), end card repeats rather than introduces** [S11]. For 15 s that is ~3-4.5 s.
5. **AI-looking is mostly texture, lighting, oversaturation, and rendered text/logos**; the fixes are editorial (cut fast, small faces, composite real text/product, desaturate) [S14][S15]. Ads that do not read as AI can match or beat human ads; ads that *do* read as AI cost you [S14][S15][S17].
6. **Meta Reels ads cannot use licensed music** (use original audio or Meta's Sound Collection) [S1].

---

## 2A. Ad-level teardowns (28, live Meta ads per Motion; all `VIDEO`, all labelled ACTIVE when indexed)

Source for every row: `https://motionapp.com/library/<slug>` [S18]. "Var." = number of near-duplicate variants Motion grouped (popularity proxy only). "Seg." = storyline lines (lower bound on cuts). Dur. = last timestamp in the storyline. "Why it works" is **my read of the described structure**, not measured.

| # | Brand / slug / ad idx | Format (Motion tag) | Dur. | Seg. | Var. | Hook (first 1-2 s) | Product display | Text / CTA | Audio (per Motion) | Why it works / note |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Represent `represent-clo` #0 | Try-On montage | 19 s | 9 | 4 | Model in full outfit, then zoom to "Viper" tee graphic (0-3 s) | Studio, alternating full-body + macro detail; hoodie **back graphic shown 3-5 s**; ~2 s/shot | End text "Represent / Shop Spring Summer '26 Online Now" (15-19 s) | Not stated | Pure product proof; back print is a recurring beat. Text CTA only at end. |
| 2 | Represent `represent-clo` #1 | Try-On montage | 21 s | 10 | 7 | Model stands in plain white space in outfit 1 | White backdrop, centre-framed; **model turns his back to camera to reveal logo on tee (3-5 s), hoodie (7-9 s), another outfit (16-17 s)** | End: logo on back + "Discover the collection" (17-21 s) | Cuts synced to music | Closest structural analogue to Acme's back-print reveal; the "turn around" beat is repeated 3x. |
| 3 | Represent `represent-clo` #7 | Try-On | 9 s | 5 | 7 | Blue tee on model + static pack-shot with name/colour/"Available Now" (0-1 s) | Model + still of the same item beside it, new item every ~2 s | On-screen product name, colour, "Available Now" | No specific sync | Catalog-with-energy; availability messaging as CTA. |
| 4 | Gymshark `gymshark` #6 | Try-On | 11 s | 4 | 3 | Hand crumples paper as a woman in pink walks to camera (0-1 s) | Two women, matching pink sets, dance then pose side by side from several angles | None stated | Upbeat music; cuts on beat | Pattern-break sound/visual first, then colour-coherent product. |
| 5 | Gymshark `gymshark` #10 | Montage | 19 s | 2 | 5 | Woman poses in gym to show outfit (0-3 s) | Same woman performing exercises (3-19 s) | None stated | Cuts timed to music | Product shown in use; low text. |
| 6 | Cold Culture `cold-culture` #8 | Montage (Try-On style) | 10 s | 8 | 5 | Model pushes through a **red plastic sheet** (0-1 s) | One shot per item (cap, star-print pants, jacket zip, logo close-ups); ~1 s/shot; ends lifting jacket to show underwear logo | None stated | Fast pace, cuts timed to beats | Bold colour set + physical action as hook; ~1 cut/s. |
| 7 | Cold Culture `cold-culture` #10 | Montage | 10 s | 11 | 6 | Back of a graphic tee while walking in an urban setting (0-1 s) | Mix of selfie-style, flat-lay and wall shots; **back "COLD" graphic repeated at 6-7 s and 9-10 s** | None stated | "Catchy music"; cuts on beat | DIY/UGC feel; back print is the thumbnail. |
| 8 | Cold Culture `cold-culture` #14 | Spokesperson (UGC) | 11 s | 4 | 5 | Person faces camera (0-2 s) | Static; walks away and turns to show the garment | None stated | Not stated | Zero-edit UGC; works as test variant. |
| 9 | Cold Culture `cold-culture` #19 | Montage (UGC) | 6 s | 3 | 3 | Model holds a stack of graphic tees (0-2 s) | Front and back of each tee shown, ~2 s each | None stated | Cuts timed to music, slow | Shortest "front + back" template. |
| 10 | Culture Kings `culture-kings` #4 | Montage | 5 s | 5 | 3 | Rack of tees, spinning (0-1 s) | Rack spins 3x, ends on one plain tee | "Shop now" button/text at 4-5 s | ~120 BPM, cuts on beat | Offer/volume lane, not brand-building. |
| 11 | Culture Kings `culture-kings` #5 | Montage | 5 s | 3 | 3 | Close-up rack of tees (0-2 s) | Rapid cuts between designs | "3 shirts for $120" deal, "Shop now" at 4-5 s | Cuts on beat | Offer-led, the "price & promotion" hook type TikTok lists for apparel [S8] (exact second the price appears: not stated). |
| 12 | Culture Kings `culture-kings` #11 | Cinematic B-roll | 23 s | 1 | 1 | Single slow pan across black New Era caps | 23 s one move | None | No sync | **Cautionary**: one slow take, 1 variant, no hook or CTA. |
| 13 | Aerie `aerie` #0 | Try-On montage | 13 s | 6 | 7 | Woman leaning on stacked towels with a drink (0-3 s) | Matching-colour sets, tropical setting; close-up of pant detailing | CTA "Shop now at Aerie" | Music timed to cuts | Setting = the pitch (summer vacation). |
| 14 | Aerie `aerie` #1 | "Yapper" creator haul | 64 s | 11 | 5 | Creator says it's finally spring and she picked up new things (0-3 s) | Held-up/worn items one by one; back of tee shown | Spoken CTA "You guys have to head to Aerie" | Creator voice; cuts every ~2-3 s aligned to her words | Talking format; cut rate set by speech. Too long for the 8-20 s window. |
| 15 | Aerie `aerie` #16 | Montage | 15 s | 13 | 8 | Woman on a ledge in a dress (0-1 s) | ~1 s/shot; vacation settings | Playful text puns ("Dive In!", "Have a shell of a good time!"); "Shop now at Aerie" at 11-12 s, brand name at 13-15 s | Upbeat music, cuts on beat | Caption copy carries personality; CTA is last 4 s. |
| 16 | Alo Yoga `alo-yoga` #1 | "Yapper" haul | 54 s | 5 | 6 | Influencer shows an Alo shopping bag and announces a haul (0-4 s) | Colour-themed (Paradise Pink) items held and worn | Spoken "Let me know what was your favorite" | Music; cuts timed to track | Colour drop as the story. Long; needs cut-down. |
| 17 | Alo Yoga `alo-yoga` #3 | Cinematic B-roll | 14 s | 8 | 6 | Woman in matching pink set walks down stone steps (0-2 s) | Lifestyle at a coastal setting; ties sweatshirt, sits on rocks | None stated | Not stated | Mood piece; product is incidental. |
| 18 | Alo Yoga `alo-yoga` #5 | Try-On | 13 s | 5 | 8 | Woman walks down outdoor steps in head-to-toe pink with a **text overlay explaining why** (0-2 s) | Outfit change every ~2-3 s, one colour motif | On-screen reason-why text | Upbeat; cuts on beats | A single colour as the visual device. |
| 19 | Cotopaxi `cotopaxi` #0 | POV/UGC testimonial | 45 s | 9 | 5 | Couple packing for a ski trip to Japan, joke about cat (0-2 s) | Packing demo, features spoken | None stated | Voice; cuts timed to words | Human story + humour. Too long. |
| 20 | Cotopaxi `cotopaxi` #5 | Cinematic B-roll / dance | 30 s | 7 | 5 | Close-up of luggage logo (0-1 s), then airport + llama | Surreal sets (orange backdrop, blizzard, purple street), product in motion | None stated | Opens with airport-announcement-style audio; rest not stated | Logo at 0-1 s is unusual (cf. Sutra on unknown-brand logos [S11]). |
| 21 | Cotopaxi `cotopaxi` #11 | Cinematic B-roll | 15 s | 4 | 4 | Overhead airport; board reads "Flight SK84 to Zootopia"; llama (0-3 s) | Same woman and case across stylised sets | None stated | Upbeat high BPM; cuts on beat | Absurd visual pattern-break; 15 s. |
| 22 | Aritzia `aritzia` #18 | Cinematic B-roll | 12 s | 1 | 5 | Model walks a city street in the Super Puff | One walking take, colourways change | Text "The Super Puff. You look cool. And warm." | Not stated | Single-line claim; product = hero. |
| 23 | Rhone `rhone` #5 | Montage (narrative) | 14 s | 9 | 3 | Man walks city street holding coffee + newspaper (0-1 s) | Commuter collection in a "commute" story; red hand signal | Brand "RHONE" on screen at 2-3 s; end text "Commuter. Engineered for all of it. Client on the way." (9-13 s) | Cuts timed to music | Brand appears at ~14-21% of runtime; mini-story. |
| 24 | SKIMS `skims` #0 | Mirror-selfie | 6 s | 3 | 3 | Overhead flat-lay of the set on a bed (0-1 s) | Flat-lay, then mirror selfie wearing it | SKIMS logo on black (5-6 s) | Cuts timed to background music | 6 s: product -> person -> logo. |
| 25 | SKIMS `skims` #11 | Creator/emotional | 30 s | 4 | 3 | Mother hugs child in matching pyjamas (0 s) | Surprise gift of matching set | None stated | Voiceover; cuts timed to it | Emotion-first; long. |
| 26 | SKIMS `skims` #15 | Split-screen demo | 11 s | 2 | 6 | Split screen with "BEFORE"/"AFTER" labels (0-8 s) | Static comparison, no cuts | Logo + product name at 8-11 s | Not stated | Demonstrates the benefit; one visual idea. |
| 27 | Princess Polly `princess-polly` #11 | Creator code ad | 55 s | 7 | 4 | Creator asks "are you ready for spring?" (0-5 s) | Four outfits modelled | Spoken: go to the site, use code "LYLA" | Creator voice | Direct address + discount code. Too long. |
| 28 | Princess Polly `princess-polly` #15 | Mirror-selfie haul | 19 s | 4 | 6 | Full-body mirror selfie in wide-leg jeans + tan jacket (0-3 s) | Phone-in-mirror poses, outfits repeated | None stated | Cuts loosely on the beat | Basic handheld production; plain by design. |

Descriptive stats from the 28 (my arithmetic on the table above): median duration 14 s; 16 of 28 sit in 8-20 s; within those 16, the median is ~2.4 s per storyline segment. Montage-type ads (rows 1-2, 6-7, 15, 23) run roughly 0.9-2.2 s per segment, i.e. they cut every ~1-2 s. Rows with 1-2 segments (5, 12, 22, 26) are single-idea shots.

## 2B. Campaign/post-level cases (11; not Meta ad-library rows)

| # | Brand / piece | Format | What is documented | Takeaway | Src |
|---|---|---|---|---|---|
| 29 | Fear of God Essentials, Fall 2025 short film by Hype Williams | Cinematic short film, 90s music-video look | Soundtrack: Ruff Ryders "Down Bottom" (Swizz Beatz); cast of five models; film length and cut pacing **UNVERIFIED** | Streetwear leader sells a **world and sound**, not specs | [S21] |
| 30 | Carhartt WIP SS26 by Hugo Campan | Atmospheric campaign film + stills | Hook is mood: "strained pupils encountering the day's first light", guitar into drone; length **UNVERIFIED** | Restraint, texture, no hard sell | [S22] |
| 31 | Pangaia Fall 2025 "PANGAIA: REIMAGINED" | Triptych campaign, three stylists reinterpret the tracksuit | Product is the single hero piece, restyled 3 ways | One garment, repeated; "same product, three looks" | [S23] |
| 32 | Reformation x Alexa Chung | Scripted parody of Meta/TikTok ad conventions | Narrator talks about "the first three seconds", Chung interrupts, addresses viewer, then collab reveal | Self-aware interruption hook | [S13] |
| 33 | Free People restock Reel | Social proof | Opens with a restock request; screen fills with customer comments, then reveals the bag | "Visible audience receipt" instead of "run, don't walk" | [S13] |
| 34 | Princess Polly "Hotline" | Repeatable interview series | Clothing visible but content = dating stories; opens on the most dramatic fragment; ends promising next episode | Cold-open confession + series | [S13] |
| 35 | Aritzia "Super Puffin" | Animated character | Jacket shape = character; short comic scenes | Product as character | [S13] |
| 36 | Rhone "A Love Letter to NYC" | 30 s hero film (rom-com) + social cuts | Real-life couple as actors; in-house; "intentionally does not include scenes of fitness" | Narrative with real people; not a performance ad | [S20] |
| 37 | SKIMS x Nike store visit (TikTok) | Longer personality-led | Celebrity shopping, sizing, colours | Access/personality | [S13] |
| 38 | Abercrombie NFL measuring-tape game | Creator/athlete game | Players' reactions lead; clothes appear in fitting-room | Game with an activity | [S13] |
| 39 | Abercrombie TikTok creator programme (agency IF7) | Creator-led | Creative started from "the creator, the trend, or the A&F product"; creators keep their own voice | Creator-voice > brand-voice | [S19] |

Brand-level context (not ads): Gymshark leans on UGC/athlete content and hundreds of active Meta ads [S30]; Motion tags its Meta library "Headline 18%, Montage 18%, UGC Selfie 7%" [S18]. Cold Culture's sponsored content volume is concentrated on TikTok (97.6% video in Modash's dataset) [S24]. Aritzia's reach is mostly customer-made content around named products [S26]. adlibrary's framework says streetwear/athleisure wins in **Community/UGC mode** and that *mode mixing* (e.g. glossy campaign visuals where the audience expects lo-fi) hurts [S25].

---

## 3. Distilled standards

### 3.1 Hook patterns that work in apparel
Source taxonomies:
- **TikTok fashion hook types**: pain-point hacks/tips, price/promotion, audience group, unbox/comparison/question, listicle, review/testimonial, product features. Price/promo in first 3 s; target audience within 3-6 s; theme within 3-6 s [S8].
- **Observed Oct 2026 hook formats** (Lightreel): cold-open confession, visible audience receipt, relatable identity statement ("basic is the new cool-girl chic"), open question ("would you wear this?"), transformation promise ("one base, four looks"), self-aware interruption. Specific > generic ("you need this for fall") [S13].
- **From the 28 ads**: physical pattern-break (red plastic sheet, crumpled paper, surreal airport board) [rows 4, 6, 21]; back-of-garment graphic first (rows 7, 2); "creator announces haul" (rows 14, 16, 27); on-screen reason text over outfit (row 18); flat-lay -> wear (row 24).
- TikTok general: introduce the content proposition in first 3 s, prioritise the hook in first 6 s; skip long intros or logo animations; "show the product in use within the first two seconds" [S5][S6].
- Vendor-quoted benchmarks (secondary, **UNVERIFIED primary**): hook rate (3-second views / impressions) "solid" 25-30% on Meta, elite 40%+; TikTok 30-35% baseline [S28].

### 3.2 Shot length and cuts per 15 s
- Short-ad corpus (Sutra Haus, 48 ads, own measurement): median mean shot length **0.83 s**; product-led films 0.13-0.35 s; their own ceiling 2.5 s for a picture beat, 3.0 s for a text card; **12-15 cuts in a 15-s film**, offered as a sanity check, not a rule (they retired it as a target). If frame 0 already contains an event, the first cut can wait up to ~2.5 s [S11]. Sutra Haus is a studio, not an independent study; treat as one practitioner's data.
- Independent-ish contrast (FYPNow, TikTok organic catalog): median video 29 s, 5 scenes, 6.5 s average shot; "no clean 'more cuts is better' line" - single-take and 11+ scene videos both beat the middle on engagement/saves [S12]. This is organic, general-niche TikTok, not ads.
- Practitioner CPS guidance: 0.5-0.8 cuts/s for TikTok and Reels [S27a] (vendor blog, **UNVERIFIED**). It matches the montage rows above (~1-2 s/segment ≈ 0.5-1 cut/s).
- **Dialogue changes the maths**: Sutra says the split is "whether anybody is talking" and that this "sets the cut rate" (it does not give a number for talking films) [S11]; Motion shows Aerie's talking ad at ~2-3 s per cut aligned to dialogue (row 14).
- Any film over ~10 s needs a **second hook / re-hook around the midpoint**, by a different mechanism than the first [S11].

### 3.3 How long to show the product
- Brand/product first appears at a median **22% of runtime** (68 competitor transcripts); Sutra's default window is 20-30% (3.6-5.4 s of 18 s); end card is "a repeat, not an introduction" [S11].
- TikTok: product in use within 2 s [S6]. TikTok fashion playbook: "Introduce the product and call out its selling points & design details"; end with CTA + logo [S8].
- From streetwear montages, each garment/graphic gets ~1-2 s, **hero graphic repeated**: Represent shows the back print 3x in 21 s; Cold Culture ~3 times in 10 s (rows 2, 7).
- A recommended text hold: ≥ max(1.2 s, 0.35 s/word) at full opacity, cap height ≥ 5% of frame height (Sutra's house spec) [S11].

### 3.4 Captions / on-screen text
- Meta: captions "optional, but recommended"; sound "optional, but strongly recommended" [S1]. TikTok: use captions/text overlays for context; TikTok recommends "5-10 words per second" of text [S5] (note: that is TikTok's wording; Sutra's dwell floor of 0.35 s/word ≈ 3 words/s is far slower [S11]. Treat 5-10 as a ceiling, not a target, **UNVERIFIED as readable pace**).
- TikTok's 2021 coded sample of ~4,000 ads (US/CA/UK): text boxes in 86%, text overlays 71%, branding in caption 76% [S9] (data is 2021; page published Nov 2022).
- Style seen in ads: short punchy copy over footage (Aerie puns, row 15), "reason-why" line on frame 0 (row 18), end-frame product name/colour/availability (row 3), claim line (row 22).
- Contrast spec used by one studio: 4.5:1 at delivery width, 3:1 at 360 px (W3C-derived) [S11].

### 3.5 Sound on vs sound off
- TikTok: 93% of users spend time with sound on; music in 63% of sampled ads, voiceover 39%, TTS 20%; "93% of top-performing videos use audio" [S9] (2021 data) and TikTok says to design so the story lands even with sound off [S7].
- Kantar: in its (undated) article, ~85% of Facebook viewing is sound-off; TikTok is "a sound on platform" [S10]. Instagram Reels split: one vendor claims 70-80% of Reels users have audio on [S27b]; another says sound-off is the default [S27c]. **Instagram Reels sound-on share = UNVERIFIED**.
- Practical: caption everything, but put audio at frame 0 (Sutra: first sound 0.018 s median in 48 films, no exception in 133 films across three studies - their own data) [S11].
- **Meta rule**: Reels ads should not contain licensed music; use original audio or Meta Sound Collection [S1]. TikTok's equivalent music-licensing rule for ads: **UNVERIFIED** (not fetched).
- FYPNow: original vs licensed audio performs identically on engagement (organic, general) [S12].

### 3.6 Length
- Meta: Reels ads technically 0 s - 15 min; minimum width 250 px (<30 s) [S1]. Practitioner guidance clusters on 15-30 s, with 6-15 s for cold prospecting (vendor blogs, **UNVERIFIED**) [S27a,d].
- TikTok: ad durations 5-60 s with "recommend 9-15 s" for TopView/reservation in-feed [S4]; the small-business guide says 21-34 s "performs best" and "deliver value or emotion within 10 to 20 seconds" [S6][S7]. These TikTok statements conflict by format; for a 15 s Acme cut both are satisfied (9-15 s recommendation; inside the 10-20 s value window).

### 3.7 Technical specs and safe zones (current)

| Item | Meta (Instagram + Facebook Reels, Stories) | TikTok (In-Feed / Spark) |
|---|---|---|
| Ratio | 9:16 [S1] | 9:16 vertical recommended, ≥ 540×960 px [S3] |
| Recommended resolution | 1440×2560 [S1] (1080×1920 accepted as practical floor [S27e]) | Export 1080×1920 (practitioner; TikTok minimum is 540×960) [S3][S27f] |
| Format / size | MP4/MOV, H.264, AAC ≥128 kbps stereo, max 4 GB [S1] | .mp4/.mov/.mpeg/.3gp/.avi, ≤ 500 MB, bitrate ≥ 516 kbps [S3] |
| Duration | 0 s-15 min [S1] | Non-Spark up to 10 min [S3]; 5-60 s, recommended 9-15 s for TopView/reservation [S4] |
| Safe zone (of 1080×1920) | Keep clear: **top 14% (269 px), bottom 35% (672 px), sides 6% (65 px)** [S1][S2] | **top 12.5% (240 px), bottom 34.375% (660 px), sides 11.11% (120 px)**, measured from TikTok's April 2025 in-feed template; older figures (254/707/122/242) are retired [S2] |
| Reels ads with disclaimers | Bottom **40%** (768 px) clear [S2] | n/a |
| Caption limit | Instagram Reels primary text 44 chars [S1] | Ad caption: white, uncustomisable, no links/@/hashtags [S3] |
| Not allowed | Licensed music, face/camera effects, GIFs, product tags [S1] | n/a |

**Combined safe box for one master file (1080×1920)**: x from 120 to 960 (840 px wide), y from 269 to 1248 (979 px tall). That is the intersection of the Meta and TikTok figures (arithmetic mine). Put the slogan, signal arrow, CTA and any captions inside it. Both platforms also have a right-edge action rail that reaches above the caption band [S2], so keep key text left-of-centre-biased and off the far right.

### 3.8 What separates a polished brand ad from an AI-looking one
Evidence base: a Frontiers in AI 2025 study (104 people spotting AI images) as summarised by aitachyon, plus Columbia's "AI in disguise" paper [S14][S15]. aitachyon is a vendor blog; its numbers are **secondary** and the Taboola 500M-impression field-study figures there are not independently verified by me [S14].
- Biggest tells: over-smoothed skin / sheen (most-cited cue); inconsistent light and shadow; oversaturated colour (Columbia: "intense color saturation... signals AI generation"); geometry/text distortions, flicker in hair, fabric, hands; a vague "too perfect" feeling [S14][S15].
- Fixes: add pore/texture language, specify light, grade towards neutral, **composite real captions, logo, price and product layers - never let the model render logo or product text**, vary presenters, blend a real anchor, cut to B-roll every 1-2 s, shrink the synthetic human ~40% and let them look away so lip-sync is not the focal point, add deliberate imperfection [S14].
- Sutra Haus's own note: "Pace is the mechanism. Fast cuts hold attention and deny the eye time to find flaws"; generated shots need an arc; two seconds is "long enough to inspect a frame" [S11].
- Outcome evidence: Columbia found AI-generated display ads beat human ones on CTR only when they did not look like AI [S15]. A Swedish thesis found AI video ads raised perceived uncanniness and worsened responses vs human-made [S17]. A phys.org summary reports brands (H&M, Guess) facing backlash for AI "ambassadors" and a trend toward promoting "human-made" [S16]. The Verge: consumers are becoming suspicious of anything "slightly off" [S31]. Claims of Kantar/NielsenIQ numbers inside [S14] (41% bothered, EEG memory) are **UNVERIFIED** here.
- Polished human-made references share: one colour world held across the ad (Alo pink, Cold Culture red, Cotopaxi orange), a single visual device, text kept to a line or two, and an end frame with name/logo (rows 18, 6, 20, 22) [S18].

---

## 4. What this means for Acme (10 concrete rules)

(Recommendations are my inference from the sources above, each tied to evidence.)

1. **Open on an event, not on the library.** Frame 0 should already be mid-line: e.g. Ethan mid-sentence, Chloe reacting, with a 4-7-word caption hook in the safe box ("Neurons that fire together…"). Evidence: hook in first 1-3 s with captions [S5][S7]; first cut can wait ~2.5 s only if frame 0 contains an event [S11]. Add a hoodie sleeve/shoulder in shot 1 (product in use ≤ 2 s [S6]).
2. **Brand + product on screen by 3-4.5 s (20-30% of 15 s); hero reveal no later than ~8 s.** The back-print reveal is the payoff and the thumbnail; Represent shows the turn-to-back reveal at 3-5 s and again at 7-9 s [row 2][S18], Sutra puts brand at 20-30% [S11]. If the current draft reveals the print after ~9-10 s, move it earlier or tease the print at 4 s (partial, over-shoulder) and hero it at ~8 s (re-hook at midpoint [S11]).
3. **Hold the back print ≥ 2.5-3 s with the slogan as a separate text card.** A five-word lockup needs ≥ 1.75 s (0.35 s/word) [S11]; keep print static enough to read; run the orange signal as one clean 1-1.5 s travel between neurons.
4. **Composite, never generate, the print, the signal, the slogan, the logo and the garment.** Use real product photography/mock-ups or the real artwork file as layers; the model "has never seen your SKU" [S14]. This also avoids showing a garment that is not the real product on a pre-launch brand (consumer-trust risk; backlash evidence [S16]).
5. **Cut the AI humans fast and small.** ≤ 2.5 s per generated picture shot [S11]; every 1-2 s alternate Chloe/Ethan with insert B-roll (book spine, pen, hoodie cuff, fabric, a hand) [S14]; frame the people ~40% smaller than a close-up and let them look away at times so mouths are not the focus [S14]. Avoid long two-shots with lip-sync.
6. **Make the dialogue short and caption it.** Dialogue ads cut at about 2-3 s per beat on the speaker's words (Aerie row 14) [S18]; cap at 2-3 lines total; burned-in captions inside the safe box; assume Instagram may be sound-off [S1][S10] and TikTok sound-on [S9].
7. **Audio plan**: sound at frame 0 [S11]. For Meta use original audio / Meta Sound Collection (no licensed track) [S1]; for TikTok confirm commercial-music rights before use (**UNVERIFIED**). Duck the music under the dialogue, bring it back on the reveal [S11].
8. **Design to the combined safe box**: x 120-960, y 269-1248 on a 1080×1920 master (export 1440×2560 for Meta if the source allows) [S1][S2][S3]. Keep the CTA/slogan/end card out of the bottom 35% so the platform CTA button does not cover them.
9. **Keep orange as the only accent and grade the rest down.** Oversaturation reads as AI [S15][S14]; add film grain/slight imperfection. Use orange only on the signal and one end-card detail, and keep the rest of the frame in black/white/grey, same one-colour-world logic as Alo pink / Cold Culture red / Cotopaxi orange (rows 18, 6, 20) [S18].
10. **Ship a system, not one file**: a 15 s master + a 9-10 s cutdown (TikTok recommends 9-15 s for reservation ads [S4]) + 3-5 alternative hooks for the first 2 s (hook is the test variable) [S28][S19]; vary the front-and-back pair order and the end-card line (2 s max, repeat of the brand, not first mention) [S11]. Add a plain UGC-style fallback (front/back turn, mirror or wall shot, 6-11 s, cf. rows 8-9, 28) as a no-AI control to benchmark the AI cut against. Check Meta/TikTok AI-content labelling requirements before posting (**UNVERIFIED**, not researched here).

Suggested 15 s skeleton (my inference, to test, not a measured template):
`0-1.5 s` mid-line hook + caption, hoodie visible → `1.5-4.5 s` two quick cuts of exchange; wordmark appears ~3-4 s → `4.5-8 s` the "fire together / wire together" line with 2-3 cutaways (book, hoodie fabric); → `~8 s` re-hook: turn to camera-away, back print hero → `8-11.5 s` print held, orange signal travels, slogan card → `11.5-13.5 s` front+back pair → `13.5-15 s` end card (logo, line, handle). Total ≈ 10-14 cuts [S11].

---

## 5. Gaps / UNVERIFIED list

- Performance of any ad in 2A (no CTR/hook-rate/ROAS available). Motion text is AI-generated.
- Meta Ad Library and TikTok Creative Center Top Ads were not used (see Section 0). No direct video playback verification of any ad; all descriptions are from the cited text.
- Kith, Stussy: no specific short-video ad verified; adlibrary says Stüssy has "almost no traditional paid advertising" (search snippet only) [S32].
- Fear of God / Carhartt / Pangaia film lengths and cut counts.
- Instagram Reels sound-on percentage; TikTok music-licensing rules for ads; AI-labelling requirements on either platform.
- Hook-rate benchmarks [S28]; CPS recommendation [S27a]; Kantar/NielsenIQ stats quoted inside [S14].
- Kantar's 85% sound-off figure is from an undated article that predates Reels; TikTok's creative-element percentages are from 2021 data [S9][S10].
- The TikTok safe-zone percentages are measured by Solid Labs from TikTok's own template, not published as a table by TikTok [S2]; Meta's 14/35/6 are Meta's own sentence [S1].

## Sources

| ID | URL | Notes |
|---|---|---|
| S1 | https://www.facebook.com/business/ads-guide/update/video/instagram-reels | Meta Ads Guide, Instagram Reels (fetched in browser, 17 Oct 2026) |
| S2 | https://www.solidlabs.com/social-safe-zones | Safe-zone numbers w/ Meta quote + TikTok template measurement |
| S3 | https://ads.tiktok.com/resources/help/article/tiktok-auction-in-feed-ads?redirected=1 | TikTok Auction In-Feed specs, "Last updated: June 2026" |
| S4 | https://ads.tiktok.com/resources/help/article/tiktok-reservation-topview?lang=en ; https://ads.tiktok.com/resources/help/article/tiktok-reservation-in-feed-ads-reach-frequency?lang=en | Search snippets only ("5-60s, recommend 9-15s") |
| S5 | https://ads.tiktok.com/resources/help/article/creative-best-practices?lang=en | Search snippet: hook in 6 s, proposition in 3 s, 5-10 words/s |
| S6 | https://ads.tiktok.com/business/en/guides/video-advertising-guide | Search snippet: product in use within 2 s; 21-34 s best |
| S7 | https://ads.tiktok.com/business/en-SG/guides/what-is-ad-creative-guide | Search snippet: captions for sound-off, 10-20 s value |
| S8 | https://ads.tiktok.com/creative/blog/Fashion_2024 ; https://ads.tiktok.com/business/creativecenter/quicktok/online/creative-tips-fashion-apparel/pc/en | Search snippets: fashion hook types, price in first 3 s |
| S9 | https://ads.tiktok.com/business/creativecenter/quicktok/online/Power_Creative_Elements/pc/en | Fetched; 2021 data, published Nov 2022 |
| S10 | https://www.kantar.com/uki/inspiration/advertising-media/can-anybody-hear-me-the-power-of-music-in-advertising | Fetched; undated |
| S11 | https://sutrahaus.com/blog/how-a-15-second-ad-is-built/ | Fetched; studio's own corpus (published 1 Sep 2026) |
| S12 | https://fypnow.com/research/tiktok-video-anatomy | Fetched; organic TikTok catalog, 4 Aug 2026 |
| S13 | https://lightreel.ai/blogs/clothing-brands-on-tiktok | Fetched; vendor weekly report, observed 3-10 Oct 2026 |
| S14 | https://aitachyon.com/blog/ai-ads-that-dont-look-ai | Fetched; vendor blog summarising studies |
| S15 | https://www.columbia.edu/~on2110/Papers/AI_in_disguise.pdf | Search snippet only (PDF not rendered) |
| S16 | https://phys.org/news/2025-11-backlash-ai-imagery-ads-begun.html | Search snippet |
| S17 | https://www.diva-portal.org/smash/get/diva2:2068878/FULLTEXT01.pdf | Search snippet (thesis) |
| S18 | https://motionapp.com/library/represent-clo ; /gymshark ; /cold-culture ; /culture-kings ; /aerie ; /alo-yoga ; /cotopaxi ; /aritzia ; /rhone ; /skims ; /princess-polly (all under https://motionapp.com/library/) | Fetched in browser 17 Oct 2026; AI-generated ad analyses; "refreshed 4 months ago" |
| S19 | https://shortyawards.com/16th/abercrombie-fitch-tiktok | Fetched; agency (IF7) award entry |
| S20 | https://www.marketingdive.com/news/rhone-cmo-on-marketing-at-an-inflection-point-for-the-apparel-brand/827382/ | Fetched; 11 Aug 2026 |
| S21 | https://fearofgod.com/en-sx/pages/fear-of-god-presents-a-film-by-hype-williams | Fetched via extractor |
| S22 | https://us.carhartt-wip.com/en-us/journal/spring-summer-2026-by-hugo-campan | Fetched via extractor |
| S23 | https://www.designscene.net/2025/09/pangaia-reimagined-fall-2025.html | Fetched via extractor |
| S24 | https://www.modash.io/breakdowns/cold-culture-influencer-marketing-strategy | Fetched; 13 May 2026 |
| S25 | https://adlibrary.com/posts/best-fashion-ads-2026 | Fetched (truncated by extractor); 16 May 2026; vendor framework |
| S26 | https://www.kuipra.ca/blog/aritzia-social-strategy-teardown/ | Fetched (truncated); 28 Jul 2026 |
| S27a | https://benly.ai/learn/ad-creative/ad-pacing-cuts-per-second | Search snippet; vendor |
| S27b | https://benly.ai/learn/meta-ads/meta-ads-reels-ads-guide | Search snippet; vendor (70-80% audio on) |
| S27c | https://keepersdigital.com/en-us/resources/paid-social/meta-reels-ads-guide/ | Search snippet; vendor (sound-off default) |
| S27d | https://www.stackmatix.com/blog/meta-video-ads | Search snippet; vendor (6-15 s prospecting) |
| S27e | https://adplay.ai/blog/meta-ad-safe-zones | Search snippet; vendor |
| S27f | https://www.clickanalytic.com/blog/tiktok-aspect-ratio-complete-guide/ | Search snippet; vendor |
| S28 | https://segwise.ai/blog/anatomy-top-performing-video-ad-frame-by-frame.md | Search snippet; cites Vaizle benchmarks |
| S30 | https://www.thedigitalchapter.com/p/how-gymshark-built-a-700m-brand-with-meta-ads | Search snippet; newsletter |
| S31 | https://www.theverge.com/report/866775/ai-generated-ads-slop-human-creativity | Search snippet |
| S32 | https://adlibrary.com/brands/stussy | Search snippet |
