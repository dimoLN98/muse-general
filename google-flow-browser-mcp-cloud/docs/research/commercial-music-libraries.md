# Commercial-safe music for paid social ads — Meta Sound Collection first (Acme, Oct 2026)

Scope: which music an AI/ffmpeg pipeline may put under **paid** Meta (Instagram/Facebook) and TikTok ads for a Canadian streetwear brand, how to get the audio into `campaigns/{campaign}/04_audio/`, and what evidence to keep. Builds on `flow-production-pipeline.md` §1.6, §3, §4 (not repeated: "trending/licensed music is not allowed in ads" and the Flow Music/AI Pro licence note). Written 2026-10-16.

Method and limits: web research only (search + page extraction). **No login, no account, no downloads, no browser.** The extractor is a logged-out fetcher, so anything behind a Facebook/TikTok/YouTube login is described from help pages and third-party walkthroughs, not seen first-hand. Not legal advice.

Tags: **[G]** official platform/vendor page read or quoted from a primary-page snippet · **[C]** community / third-party / vendor-marketing · **[unverified]** no source found or sources conflict unresolved.

---

## 0. Bottom line (read this if nothing else)

1. **Meta Sound Collection is the only free, Meta-run library Meta itself says can be used "for commercial purposes like ads"** [G](https://www.facebook.com/business/help/402084904469945). Its licence is **Meta-products only** [G](https://www.facebook.com/sound/collection/terms). Same file on TikTok/YouTube/website = not covered.
2. **Downloading is officially supported**: desktop Sound Collection has a **Download** button and Meta's own page tells you to "use your own video creation software to add the music" [G](https://www.facebook.com/business/help/880459498798521). So "download → ffmpeg → upload finished MP4" is the documented route, not a hack.
3. **Ads Manager's built-in "Add music" does NOT work for video ads per Meta's help page** — it lists only *Single Image* ads on IG Reels/Stories/Feed [G](https://www.facebook.com/business/help/759279452000505). For Acme's video ads, bake the Sound Collection track into the MP4 yourself.
4. **No Sound Collection API found** anywhere (Meta developer docs, help pages, search) → the catalogue must be browsed/downloaded by a human (the user) with a logged-in desktop session. **[unverified]** that no private endpoint exists; do not scrape.
5. **TikTok CML is a separate, TikTok-only licence** [G](https://www.tiktok.com/legal/page/global/commercial-music-library-user-terms/en). Do not reuse CML tracks on Meta. No documented download button; use CML *inside TikTok / TikTok Ads Manager's video editor*. For a single cross-platform master, use a **paid third-party licence that names paid social** (Epidemic Pro/Business, Artlist Pro, Envato) or **Acme's own Flow Music original** (already cleared in §1.6 of the pipeline doc).
6. **Traps worth remembering:** Uppbeat Basic licence bans paid ads (cl. 4.3); Free Music Archive "NC" tracks ban advertising; Incompetech/CC-BY needs a visible credit (impossible inside an ad); Pixabay tracks can still get Content ID claims; Envato/Epidemic/Artlist licences are **account/subscription-bound**; YouTube Audio Library gives only a YouTube-side guarantee.

---

## 1. Meta Sound Collection — what it is

### 1.1 Name, URLs, where it lives

| Surface | URL / path | Notes |
|---|---|---|
| Public landing + terms | `https://www.facebook.com/sound/collection` (landing text: "Thousands of high-quality audio tracks and sound effects from all over the world. Free to use in any videos you create and share on Facebook and Instagram.") | [G](https://www.facebook.com/sound/collection). Logged-out extractor saw only this blurb, **not the track list** → the catalogue itself is login-gated or JS-rendered. |
| Terms | `https://www.facebook.com/sound/collection/terms` ("Last Modified: March 16, 2022") | [G](https://www.facebook.com/sound/collection/terms) — loaded OK logged-out. |
| Meta Business Suite | *All tools → Sound Collection* | Meta confirms Creator Studio tools moved to Business Suite incl. "Access rights-cleared music or sound effects … in **Sound Collection**" [G](https://www.facebook.com/business/help/825637908842087). Walkthroughs: [C](https://www.youtube.com/watch?v=CIHHarB9D6c), [C](https://www.youtube.com/watch?v=p5rnVE0gBt4). |
| In-app (Instagram) | Reels camera → **Audio**; Stories → **Music** sticker | [G](https://www.facebook.com/business/help/402084904469945) — only usable in-app, no file. |
| In-app (Facebook) | audio picker when uploading a reel (Sound Collection items are labelled **"Royalty-free"**) | [G](https://www.facebook.com/business/help/880459498798521) |
| Ads Manager | *Ad creative → Add music → Select music* (Creative Editor) or Advantage+ creative → Music toggle | [G](https://www.facebook.com/business/help/759279452000505) — **image ads only** (see §3). |
| Instagram "Professional dashboard" / Creator Marketplace | **No Sound Collection page found** on either. | [unverified] — don't assume it exists there. |
| Not real | `business.facebook.com/help/sound-library`, "tens of thousands of tracks", "Theme"/"Instrument" filters | Claimed by one vendor blog [C](https://shuttergen.com/resources/meta-music-library); contradicts Meta's own "over 14,000"/"nearly 16,000" and Meta's filter list (§4). **Treat as unreliable.** |

### 1.2 Contents and size

- Music **and** sound effects ("songs and sounds") [G](https://www.facebook.com/business/help/402084904469945).
- Size, **two Meta pages disagree**: "over 14,000 songs and sounds" (Instagram/Business help) [G](https://www.facebook.com/business/help/402084904469945) vs "nearly 16,000 original, high-quality songs or sound effects" (Facebook reels help) [G](https://www.facebook.com/business/help/880459498798521). Older third-party count: 8,959 tracks + 1,741 SFX, undated [C](https://storrito.com/resources/facebook-sound-collection/). Use "~14–16k, music + SFX".
- Cost: free [G](https://www.facebook.com/sound/collection).

### 1.3 Which uses are cleared (quotes)

| Question | Answer | Source |
|---|---|---|
| Commercial / ads? | "The content in Sound Collection can be used for commercial purposes like ads." | [G](https://www.facebook.com/business/help/402084904469945) |
| Licence text | "Meta hereby grants you a non-exclusive, royalty-free license to use the SC Audio Content for commercial or non-commercial purposes in content you create, upload, and distribute on the Meta Company Products (including through links to the Meta Company Products embedded in third party sites) **only**. You may not perform, distribute, make available or otherwise use the SC Audio Content separately from the Meta Company Products." | [G](https://www.facebook.com/sound/collection/terms) |
| Outside Meta | "Meta reserves all rights and remedies for use of any SC Audio Content by you outside of the uses permitted above without Meta's express prior written consent." | [G](https://www.facebook.com/sound/collection/terms) |
| Organic Reels / Stories | "safe to use in Reels and Instagram Stories" | [G](https://www.facebook.com/business/help/402084904469945) |
| Paid Reels ads | "Your Instagram Reels cannot use licensed music. Instead, use original audio or royalty-free music, such as what's available in Sound Collection." | [G](https://www.facebook.com/help/instagram/546362593027755), [G](https://www.facebook.com/business/help/4023434621109377) |
| Ads Manager music | "The music currently consists of royalty-free audio from the Meta Sound Collection." | [G](https://www.facebook.com/business/help/759279452000505) |
| Monetisation / claims on FB | "When you use audio from Sound Collection, your reel will not be demonetized or muted due to a copyright violation." | [G](https://www.facebook.com/business/help/880459498798521) |
| Branded content / partnership ads | Partnership-ad music: Sound Collection + original audio allowed; copyrighted music only if the advertiser holds the rights. | [C](https://blog.adnabu.com/facebook-ads/meta-partnership-ads/), [C](https://sonilo.com/ai-music/royalty-free-music-for-instagram-reels) — Meta's own partnership-ads page not retrieved → **[unverified]** as Meta wording. |
| Territory | The Terms contain **no territory carve-out**; Music Guidelines say any music "may not be available in all countries" [G](https://m.facebook.com/legal/music_guidelines). Nothing Canada-specific found. | [G] + **[unverified]** for Canada. |
| Platforms outside Meta | Not covered (terms: "only" Meta Company Products). TikTok, YouTube, website, TV, trade-show loops = outside. | [G](https://www.facebook.com/sound/collection/terms); consistent [C](https://audiodrome.net/for-creators/meta-sound-collection/), [C](https://www.instagram.com/p/Dbv5doTmEEG/) |
| Attribution | Terms require none. The desktop page has an **Information** button that gives "song and sound attribution links" [G](https://www.facebook.com/business/help/880459498798521) — optional for ads; harmless to log. | [G] |
| Edit / trim / mix / re-upload | Terms allow use "in content you create, upload, and distribute" on Meta; Meta tells you to add downloaded audio in your own video software [G](https://www.facebook.com/business/help/880459498798521). Terms don't prohibit trimming/mixing; they prohibit *standalone* distribution (i.e. don't publish the audio as a track, a loop, a bed for sale). | [G] — my reading of the clause, **[unverified]** by counsel. |
| Meta's own trimming | "Selected music will be trimmed across eligible placements." | [G snippet](https://www.facebook.com/business/ads/facebook-instagram-reels-ads) |

**Conflict to flag:** two vendor pages say "not every Sound Collection track is cleared for ads" / "check each track" [C](https://audiodrome.net/for-creators/meta-sound-collection/), [C](https://splendid-learning.de/en/blog/wie-du-lizenzfreie-musik-f%C3%BCr-social-media-verwendest). Meta's terms and help pages carry **no per-track exclusion**, and the FB help says *all* Sound Collection audio is labelled "Royalty-free". Resolution: follow Meta, but still screenshot each track's page (it is cheap) and prefer tracks that show the "Royalty-free" label.

### 1.4 Downloading and Content-ID/claims risk

- **Download is allowed**: desktop *Tracks* and *Sound effects* tabs, "Click **Download** to download a track" [G](https://www.facebook.com/business/help/880459498798521). File format: MP3 per walkthroughs [C](https://shuttergen.com/resources/meta-music-library); [C](https://github.com/fiehrfly/muses/blob/main/sources/instagram-meta-sound.md) — not stated by Meta → check on first download (`ffprobe`).
- **Login needed:** Meta calls it "public-facing" but the logged-out fetch saw no catalogue; community says a Facebook login is enough (no ad account, no linked IG) [C](https://techfizzer.com/facebook-sound-collection-get-copyright-free-music/), [C](https://github.com/fiehrfly/muses/blob/main/sources/instagram-meta-sound.md); Meta's FB help scopes the "find it" lines to "a creator with a Page or a profile in professional mode" [G](https://www.facebook.com/business/help/880459498798521). → **[unverified]** whether a bare Facebook profile (no Page) sees the desktop page; the user should test.
- **Claims on Meta:** Meta says no demonetise/mute on FB reels [G]. Meta's *Rights Manager* matches audio on FB+IG [C](https://www.makeinfluence.com/en/academy/copyright-claimed-background-music-in-sponsored-influencer-content); I found **no documented case** of a Sound Collection track being claimed on Meta → residual risk low but not zero **[unverified]**.
- **Claims off Meta:** the licence doesn't cover YouTube; any YouTube Content ID claim on a re-upload would be a licence-scope problem, not a false claim. Don't cross-post Sound Collection audio.
- **Music Guidelines (applies to everything you post/promote):** "Use of music for commercial or non-personal purposes in particular is prohibited unless you have obtained appropriate licenses"; "If you post content that contains music owned by someone else, your content may be reviewed by the applicable rights owner and your content may be blocked, muted or removed"; "The greater the density of music in content, the more likely it may be limited"; "Shorter clips of music are recommended" [G](https://m.facebook.com/legal/music_guidelines) (effective March 26, 2024). Acme's 15–30 s ads with a bed under footage are the safe end of that.

### 1.5 Pages I could not load (be honest)

| Page | Result |
|---|---|
| `facebook.com/legal/sound_collection_terms`, `/legal/music_terms` | extractor error / empty. The working terms URL is `/sound/collection/terms`. "Music Terms" content therefore **not read** (Music Guidelines was). |
| `facebook.com/formedia/blog/updates-and-guidelines-for-including-music-in-video` (linked from Music Guidelines) | returned generic Meta about page. |
| `facebook.com/creators/discover/introducing-sound-collection` | returned blog index only. |
| `facebook.com/blog/introducing-new-facebook-creator-studio` | 404. |
| `support.tiktok.com/.../commercial-use-of-music-on-tiktok` (direct) | rate-limited; used search-result text of that page instead (§5). |
| Actual Sound Collection catalogue (tracks, BPM, titles) | login-gated; **no first-hand listing seen**. |

---

## 2. How a person actually gets to it (and to files)

### 2.1 Step by step

**A. Without an ad account (cheapest, enough for the download route)**
1. Log in to a normal Facebook account on **desktop** (Meta/community say mobile can't download: "must access from desktop" [C](https://www.instagram.com/popular/meta-sound-library/)).
2. Open `https://www.facebook.com/sound/collection` (or Business Suite → *All tools* → search "Sound" → *Sound Collection*, and accept the terms prompt [C](https://www.youtube.com/watch?v=CIHHarB9D6c)).
3. *Tracks* tab or *Sound effects* tab → search/filter → ▶ preview → **Download** → **Information** for attribution links [G](https://www.facebook.com/business/help/880459498798521).
4. Save the MP3 + a screenshot of the track row/Information panel + the terms page (see §7 checklist).

**B. With a Meta Business account / Page / ad account**
- Same desktop page, plus Business Suite navigation; plus in-product use: FB reel upload in Business Suite desktop shows Sound Collection items as options [G](https://www.facebook.com/business/help/880459498798521); Ads Manager "Add music" (image ads, §3) [G](https://www.facebook.com/business/help/759279452000505).
- **Instagram:** needs an Instagram account (switch to Professional) to use the Reels *Audio* picker — and note Meta may hide the licensed (pop) library from business accounts but keeps Sound Collection available: "If your account does not have access to the licensed music library, then you may be able to use Meta's Sound Collection" [G](https://www.facebook.com/business/help/402084904469945).

### 2.2 Routes for an automated agent

| Route | Gets files locally? | Works for video ads? | Agent-automatable today? | Verdict |
|---|---|---|---|---|
| **R1. Human downloads MP3s once into a folder** (§8) | **Yes** | Yes (baked in) | Agent then does 100% of editing | **Recommended** |
| R2. Agent drives a logged-in desktop Chrome to click Download | Yes | Yes | Technically possible; **no API**, UI can change; automating a logged-in Facebook session may breach Meta Terms **[unverified]**; this research did not do it | Not now. Revisit only with the user's explicit OK + a dedicated Business profile |
| R3. Upload silent video, choose music **inside Ads Manager** | **No** | **Not documented for video** (image only) | No | Fallback for *image* ads only |
| R4. Pick audio in Instagram/Facebook Reels editor (mobile) | No | n/a — in-app only | No | Organic only; fine for quick posts, loses control of mix |
| R5. Meta Advantage+ "Add music (AI)" | No | Image/carousel only | Toggle in UI | Not for our video ads; see below |

**Compare "download-then-composite" vs "silent video + pick in platform":**

| | Download then composite (ffmpeg) | Upload silent + choose in platform |
|---|---|---|
| Meta documents it | Yes, step 5 of [G](https://www.facebook.com/business/help/880459498798521) | Ads Manager music = **Single Image** ads only [G](https://www.facebook.com/business/help/759279452000505) |
| Control (ducking under VO/SFX, beat-aligned cuts, loudness −14 LUFS per pipeline §2.5–2.6) | Full | None / "trimmed" by Meta; up to 5 songs, Meta picks one at delivery [G] |
| Reproducible/archivable (hash + licence file) | Yes | No file exists locally; only a screenshot |
| Cross-placement consistency | Same audio everywhere | Music can differ per placement |
| Risk | Must keep licence evidence; Meta-only scope | Advantage+ may add/swap music without you asking [C](https://www.foximusic.com/blog/music-for-ads-on-instagram-safe-sources/) |

**Advantage+ "Add music" gotcha:** Meta says the enhancement "includes both AI-generated music and music that is not AI-generated"; with *automatic*, Meta chooses either; non-AI music goes to FB Feed/Reels, IG Feed/Stories/Reels "for single image and carousel ads"; AI music to Facebook Reels single-image ads [G](https://www.facebook.com/business/help/297506218282224). Video ads with our own mix: **turn the Music enhancement off** (one vendor says Advantage+ can add music even when your upload has audio [C](https://www.foximusic.com/blog/music-for-ads-on-instagram-safe-sources/); not confirmed by Meta for video).

**Conflict:** one how-to says Ads Manager's video editor ("Edit Video") offers Sound Collection for video ads [C](https://www.breakthirty.com/blog/how-to-add-music-in-meta-ads-manager); Meta's help lists image formats only. Meta's page wins; the user can check the live UI when the ad account exists.

---

## 3. Meta music in ads — summary rules for Acme

- Organic Reel from Acme's IG: Sound Collection or our own licensed/original audio. Never the pop/"trending" library on a business-flavoured account [G](https://www.facebook.com/business/help/402084904469945).
- **Boosting or turning an organic Reel into an ad is commercial use**; a pop track used organically can be muted/stripped at that step [C](https://www.makeinfluence.com/en/academy/copyright-claimed-background-music-in-sponsored-influencer-content), [C](https://www.foximusic.com/blog/music-for-ads-on-instagram-safe-sources/). Plan organic *and* paid posts with the **same cleared audio** from day one.
- Ads Manager "Add music" is unavailable for ads built on **existing posts** or **Creative Hub** posts [G](https://www.facebook.com/business/help/759279452000505).
- Music Guidelines make *you* "solely responsible for the content you post or promote" [G](https://m.facebook.com/legal/music_guidelines).

---

## 4. Catalogue characteristics useful for fashion/streetwear ads

Only what sources show (I could not open the catalogue).

| Facet | Evidence |
|---|---|
| Tabs | **Tracks** (music) and **Sound effects** [G](https://www.facebook.com/business/help/880459498798521) |
| Search | keyword; "Filter by genre, mood, length, vocals and more"; roll over artist name to follow/learn more [G](https://www.facebook.com/business/help/880459498798521) |
| Extra facets (older/community) | genre, mood, duration, vocals, **tempo** (slow/medium/fast style buckets); sort by popularity or recently added [C](https://techfizzer.com/facebook-sound-collection-get-copyright-free-music/) (2023); table columns **name, artist, genre, tempo, length** [C](https://www.youtube.com/watch?v=9DlFUU9Zxdg) |
| BPM | Facet is a **tempo bucket**, not a BPM number, in the sources → agent must measure BPM itself (§9). **[unverified]** whether numeric BPM is shown. |
| Genres seen | Electronic, Pop, Hip hop, Cinematic, Latin, Indian, African, Chill, Energetic [C](https://techfizzer.com/facebook-sound-collection-get-copyright-free-music/); folk, classical, blues, holiday, Middle Eastern, Latin [C](https://storrito.com/resources/facebook-sound-collection/) |
| Moods seen | scary, dreamy, bright, groovy, happy, romantic [C](https://storrito.com/resources/facebook-sound-collection/); "Confident" (+ Rock genre, medium tempo, male vocals example) [C](https://killthedj.com/meta-sound-collection/), [C](https://www.youtube.com/watch?v=9DlFUU9Zxdg) |
| SFX categories | UI, Industry, Machinery, Tools and Offices, Water and Underwater, Footsteps, Alarms/Bells/Sirens, **Fabrics**; SFX length "0 to 30+ sec" [C](https://storrito.com/resources/facebook-sound-collection/), [C](https://techfizzer.com/facebook-sound-collection-get-copyright-free-music/) — "Fabrics"/foley is handy for hoodie-movement shots. |
| Typical music length | "music … 2+ mins" in 2023 listing [C](https://techfizzer.com/facebook-sound-collection-get-copyright-free-music/) → plan to **trim and fade** 15–30 s from longer tracks. |
| Example titles/artists | **None verifiable** — no source I could read lists specific titles/artists. Don't invent; the user's first shortlist produces them. |
| Quality caveat | Library is non-exclusive: every advertiser can pick the same track [C](https://www.soundstripe.com/blogs/royalty-free-music-for-instagram-ads). For a minimalist black/white + orange brand, prefer *less-used* instrumental/ambient/hip-hop-instrumental/electronic tracks and keep a rotation log. |

Suggested search recipe for streetwear (my inference, test it): genre *Hip hop* / *Electronic*, mood *Confident*/*Groovy*, vocals *instrumental*, tempo *medium*, plus SFX *Fabrics*, *UI*, *Footsteps*.

---

## 5. TikTok — Commercial Music Library (CML)

### 5.1 Access
- Needs a **TikTok Business Account** for the in-app default: "If you use a Business Account, … when you click on **Add Sound**, you will only see sounds from the Commercial Music Library ("Commercial Sounds")"; a personal account can reach it via *Sounds → Commercial Sounds* [G](https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library) (last updated July 2026).
- Desktop version: **TikTok Creative Center** (CML web version) with filters "region, usable placements, themes, genre, mood, and duration"; "only 10,000 songs can be displayed at a time" [G](https://ads.tiktok.com/business/en-US/blog/audio-library-royalty-free-music), [G](https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library).
- **Fresh change (Oct 2026):** the old Creative Center music URL now serves "TikTok One Creative Suite / Symphony" content — I fetched `ads.tiktok.com/business/creativecenter/music/pc/en` and got the Symphony page [G](https://ads.tiktok.com/business/creativecenter/music/pc/en); a third party reports the redirect on 13 Oct 2026 and says only app/Ads Manager remain [C](https://luminaclippers.com/blog/tiktok-commercial-music-library). → web CML browsing may have moved/vanished; **[unverified]** where it lives now.
- Size: "1 million songs" (help, July 2026 / July 2025) [G](https://ads.tiktok.com/resources/help/article/commercial-music-library?lang=en); older TikTok blog "600,000 tracks" [G](https://ads.tiktok.com/business/en-US/blog/audio-library-royalty-free-music); SMB playbook "640k+ commercially licensed music & sounds" [G](https://ads.tiktok.com/business/library/Global_SMB_Creative_Playbook.pdf); MENA one-pager "Over 150,000" [G](https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf). TikTok's own pages disagree; newest = 1 M.

### 5.2 What's cleared
- Businesses "cannot use the general music library for commercial usage"; use CML for "Organic content … Video ads … Branded content" [G](https://ads.tiktok.com/resources/help/article/commercial-music-library?lang=en). "Once the Commercial Sounds have been selected, you can use them for organic or paid content" [G](https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library).
- **TikTok only:** "You may only post or share videos that include Commercial Sounds within TikTok … Commercial Uses outside of TikTok are not permitted … These types of outside uses include … posting videos on third party digital platforms." [G](https://www.tiktok.com/legal/page/global/commercial-music-library-user-terms/en). Also "free and licensed for use on TikTok only" [G](https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf).
- **Usable Placements:** via the web portal each track lists platforms; "any platform not designated … should be considered **not** permitted" [G](https://www.tiktok.com/legal/page/global/commercial-music-library-user-terms/en). (One vendor claim that some tracks list Reels/Shorts [C](https://luminaclippers.com/blog/tiktok-commercial-music-library) — only believe it if the portal shows it; the web portal is possibly gone, above.)
- **Premium tracks** "may be subject to an additional fee … displayed at the time you purchase the applicable ad inventory" [G] same terms.
- **Rights loss:** TikTok may take down/mute videos if it loses a track's rights, "no liability" [G] same terms.
- **Data sharing:** using Commercial Sounds lets TikTok report views, likes, account name, campaign names, targeting data to rights holders [G] same terms.
- **Indemnity:** you cover claims from unauthorised use [G] same terms.
- **Spark Ads/boosting:** CML is for "Video ads, Branded content"; a boosted organic post becomes an ad, so recheck the track [C](https://syncvaluations.com/commercial-use-of-music-on-social-media). Spark Ads help [G](https://ads.tiktok.com/resources/help/article/spark-ads?lang=en) says nothing about music rights.

### 5.3 Downloading
- **No download function documented** in TikTok's help/blog. "There is no downloadable list of TikTok commercial sounds; the list is the library itself" [C](https://luminaclippers.com/blog/tiktok-commercial-music-library). A "download or sharing function is not a blanket licence" [C](https://www.digitalapplied.com/blog/social-video-music-rights-platform-comparison). → **Agent can't get CML files**; design TikTok edits as *clean mix without music* + add the CML sound in-app/Ads Manager.
- **TikTok Ads Manager Video Editor / Symphony** let you add music in-browser "from the TikTok Commercial Music Library" after uploading your video, then export to Ads Manager or download [G](https://ads.tiktok.com/business/en-US/blog/introducing-tiktok-video-editor-easily-create-native-video-ads-in-your-browser), [G](https://ads.tiktok.com/business/en-US/blog/symphony-creative-studio). Downloading a Symphony export that contains CML music and posting it on Instagram is a "third party digital platform" use → not allowed.
- **Own/outside music on a business account:** allowed, but content-disclosure on ⇒ you must accept the **Music Usage Confirmation** ("no copyright-protected music … or you've obtained and paid for all necessary licenses") [G via search text](https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/commercial-use-of-music-on-tiktok). TikTok's "Owned Sound" upload also prompts a licence confirmation [G](https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf). Third-party summaries: licence must name TikTok/social, MUC is self-attestation [C](https://www.soundstripe.com/blogs/how-to-add-your-own-music-to-tiktok).
- Smart+ "Music Autofix" detects music blockers and swaps in CML tracks (App campaigns) [G](https://ads.tiktok.com/business/en-US/blog/smart-plus-ai-performance-solution).

### 5.4 CML vs Creative Center "Commercial Sounds" vs other Creative Center tabs
| Term | What it is |
|---|---|
| **CML** | The library (the catalogue + terms). |
| **"Commercial Sounds"** | TikTok's in-app label for CML items; also the term used in the terms for tracks "selected from the CML" [G](https://www.tiktok.com/legal/page/global/commercial-music-library-user-terms/en). |
| **Creative Center (web)** | "desktop version of the CML" [G](https://ads.tiktok.com/business/en-US/blog/audio-library-royalty-free-music); different from Creative Center's *trending songs* list (which carries a business-use filter per a guide [C](https://www.stackmatix.com/blog/tiktok-creative-center-guide)). Trending ≠ cleared unless it shows as commercial. |
| **General Music Library** | personal-use only; "not available for use by any brand or business" [G](https://ads.tiktok.com/business/en-US/blog/audio-library-royalty-free-music). |
| **Original sounds** | "not cleared for commercial use" [G](https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf). |

---

## 6. Other commercial-safe sources an agent could use

Legend — **Ads on Meta/TikTok?** = allowed by the licence text I could read. "Agent download" = can the file be fetched without a human login/UI.

| Source | Licence (one line) | Meta/TikTok **paid** ads? | Attribution | Price | Agent download | Traps |
|---|---|---|---|---|---|---|
| **YouTube Audio Library** | "royalty-free production music and sound effects … copyright-safe"; won't be claimed via Content ID; CC-BY tracks need a description credit [G](https://support.google.com/youtube/answer/3376882?hl=en) | **Not promised.** YouTube "can't give legal guidance, including … music … off the platform" [G](https://support.google.com/youtube/answer/3376882?hl=en). Sources split: terms "don't limit use to YouTube" but promise nothing elsewhere [C](https://www.foximusic.com/blog/youtube-ads-music-guide-glossary-advertisers/), [C](https://sonilo.com/blog/comparisons/youtube-audio-library-alternatives-2026). The pipeline doc's earlier "YouTube-only" line is a [C] reading → **conflict; treat as avoid for ads.** | none for "Attribution not required"; CC-BY needs credit (impossible inside an ad) | free | Needs Google login in YouTube Studio; MP3 download button (human) | Content-ID guarantee is YouTube-only; no certificate to show Meta/TikTok |
| **Pixabay Music** | Pixabay Content License: free, no attribution, modify allowed; no standalone resale; no misleading use [G](https://pixabay.com/service/license-summary/) | Commercial use yes; no per-platform exclusion in summary. Reliability caveat below. | not required | free | **Music is not in Pixabay's API** (docs: "royalty-free images and videos") [G](https://pixabay.com/api/docs/) → human download | **Content ID:** "some contributors … register their music in Content ID" so legal use can be claimed; use shield/"Download Certificate" tracks to help disputes [G](https://pixabay.com/service/faq/). Claims are YouTube-side but matter if you ever make a YouTube version |
| **Free Music Archive** | Per-track Creative Commons; "FMA cannot license original work to you for commercial … use" [G](https://freemusicarchive.org/License_Guide) | Only **CC0 / CC BY (/SA)** tracks. **CC BY-NC bans "advertising, or promoting a product"** [G](https://freemusicarchive.org/License_Guide) | CC BY needs title/artist/source/licence credit [G](https://freemusicarchive.org/faq/) — hard to show in an ad | free | Download on site; licence filter exists [G](https://freemusicarchive.org/faq/) | Per-track; NC and ND variants (ND blocks adaptation/mixing) |
| **Uppbeat** | Free plan: 3 free downloads, credit code per video; paid plans differ [C](https://sonilo.com/blog/comparisons/best-royalty-free-music-sites-2026) | **Basic Licence (Free/Essentials/Creator): "The Permitted Media may not be distributed via paid advertisements."** [G](https://uppbeat.io/uppbeat-basic-license) cl. 4.3. Business ($34.99/mo, yearly, "Company, client and commercial projects") [G](https://uppbeat.io/pricing); a blog says Pro adds paid ads [C](https://uppbeat.io/blog/royalty-free-and-copyright-free-music/copyright-safe-music-for-shorts-reels-and-tiktok-how-to-post-without-claims-or-mutes) while the pricing page doesn't say → **read Pro licence before use** | free tier: credit required | Free→$34.99/mo | account + UI download | **Free/low tiers ≠ ads.** One download covers one video [C](https://uppbeat.io/blog/royalty-free-and-copyright-free-music/copyright-safe-music-for-shorts-reels-and-tiktok-how-to-post-without-claims-or-mutes) |
| **Epidemic Sound** | Subscription; music "cleared upfront" for business [G](https://www.epidemicsound.com/our-plans/business-plan/) | Yes on **Pro** or Enterprise ("Can I use Epidemic Sound for ads? Yes … if you choose a Pro or Enterprise plan") [G](https://www.epidemicsound.com/pricing/?plans=businesses); **Business** plan covers "paid ads … online campaign" and requires brand revenue under $10M; excludes OOH/livestream/radio [G](https://www.epidemicsound.com/our-plans/business-plan/). Creator plan: no ads [C](https://aimusicdaily.com/artlist-vs-epidemic-sound) | none | Business Plus "from $100/mo billed annually" [G]; vendor blog: Pro $16.99/mo yearly, Business $30 [C vendor](https://www.epidemicsound.com/blog/artlist-vs-epidemic-sound/) — **price sources conflict**, check checkout; USD | login; plugins; no public API found | **Account-bound** ("once published, the license stays with it"; new projects need active plan). Channel safelisting per platform. Read the Pro licence for "TikTok*" footnote |
| **Artlist** | Social vs Pro licences | **Social: no paid ads/client work** [C](https://www.cchound.com/artlist/artlist-subscription-plans-and-pricing/). **Pro/Max: paid ads covered** [G](https://artlist.io/page/pricing/voiceover) ("Pro license covers: … Client work, Paid ads") | none | Music & SFX Social ~$9.99/mo yr; Music Pro ~$16.58 [C](https://www.cchound.com/artlist/artlist-subscription-plans-and-pricing/) vs ~$24.92 [C](https://aimusicdaily.com/artlist-vs-epidemic-sound) — conflict; check | login; UI | Buy **Pro**, not Social. "Projects published during subscription are covered" [G](https://artlist.io/page/pricing/max) |
| **Envato (Elements)** | Commercial licence per download, one end-product per licence | **Yes:** covers paid advertising on Meta, TikTok, etc.; "One license covers one piece of ad creative" [G](https://elements.envato.com/learn/envato-social-media-license) | none | subscription (price not retrieved) **[unverified]** | login; per-project licence certificate download | Must **disable remix/stitch** or keep the account private so audio can't be extracted [G](https://elements.envato.com/learn/envato-social-media-license), [G](https://help.elements.envato.com/hc/en-us/articles/360000629346-Envato-Elements-License-FAQ). Not for livestream/TV/standalone track. **Per-project licence = new licence per distinct ad concept** |
| **Mixkit (Envato free)** | "Stock Music Free License": commercial and non-commercial; allowed "Social Media video posts", "Online marketing ads"; not CD/DVD/TV/radio/games; no remix-as-music-track, no claiming, **no registering on rights-management services** [G](https://mixkit.co/license/) | **Yes (online ads)** | not stated in licence summary | free | Site download; login need **[unverified]**; no API found | Small catalogue; "If you receive a claim, … forward to team@mixkit.co" [G]; non-exclusive → same tracks everywhere |
| **Incompetech (Kevin MacLeod)** | CC BY 4.0 for the free tier; Standard Licence for no-credit use [G](https://incompetech.com/music/royalty-free/faq.html) | Allowed commercially but **credit must be visible**; for TV/radio-type ads "purchase a Standard License" [G] | **Required** (Title / Kevin MacLeod (incompetech.com) / CC BY 4.0 / link) | free; Standard Licence price **[unverified]** | direct site download, no login seen | Cannot place a credit inside a paid ad → **buy Standard Licence or skip**. Very well-known catalogue = recognisable; "All of this music is copyrighted" [G] |
| **Own AI music (Flow Music)** | Cleared per Google AI plan (see pipeline §1.6) | **Yes if** plan benefit confirmed; Meta: "original audio" is the allowed alternative [G](https://www.facebook.com/help/instagram/546362593027755); TikTok: "Owned Sound" with licence confirmation [G](https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf) | none | included in Google plan | **Yes, downloads mp3/wav/stems** (pipeline §1.6) | Best portable option for a single master across Meta+TikTok+YouTube; keep plan-page screenshot |

Notes on agents: **Mixkit and Incompetech** are the only rows where a direct file URL fetch looks plausible without a login (unconfirmed — I did not download). Every paid library requires an account and ToS-compliant manual download.

---

## 7. Decision table — Acme

| Use | Safe sound source | Not safe | Notes |
|---|---|---|---|
| **Organic Reel (IG/FB)** | Sound Collection (download or in-app), own Flow Music original, Epidemic/Artlist/Envato per licence | Pop/trending library on a brand account; CML tracks (TikTok-only) | Same audio you'll later boost. |
| **Paid Meta ad (Reels/Stories/Feed video)** | **Sound Collection MP3 baked in by ffmpeg** (Meta-only scope) or own Flow Music or paid-ads licence (Epidemic Pro/Business, Artlist Pro, Envato) | Licensed/pop library [G](https://www.facebook.com/help/instagram/546362593027755); Uppbeat Basic; Artlist Social; FMA NC; YouTube Audio Library (no promise) | Turn Advantage+ **Music** off on video ads. |
| **Paid Meta ad (single image / carousel)** | Ads Manager **Add music** (Sound Collection) or Advantage+ music [G](https://www.facebook.com/business/help/759279452000505) | — | AI music option exists [G](https://www.facebook.com/business/help/297506218282224); decide whether you want AI-generated ad music. |
| **Organic TikTok (business account)** | **CML** in-app, or own audio + Music Usage Confirmation | Sound Collection MP3 (Meta-only); trending/original sounds | Business account sees only CML [G](https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library). |
| **TikTok ad / Spark Ad** | **CML** (check Premium fee, region) via TikTok Ads Manager Video Editor; or own/Epidemic-Pro-type licence naming TikTok | Sound Collection; Uppbeat Basic | Re-check track when sparking an organic post. |
| **YouTube Short** | Own Flow Music; Epidemic/Artlist/Envato; YouTube Audio Library (organic) | Sound Collection; CML | Only matters if Acme posts to YouTube. |
| **One master for all platforms** | Own Flow Music original, or Artlist Pro / Epidemic Pro-Business / Envato | Platform libraries (each Meta-only / TikTok-only) | Simplest evidence story. |

Canada note: nothing found that is Canada-specific for Sound Collection. TikTok CML requires choosing the **region where the campaign runs** [G](https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library) → pick Canada. Canadian performing-rights collection (SOCAN etc.) not researched **[unverified]**; Envato says you "are responsible for obtaining any public performance licenses" per local PRO rules [G](https://help.elements.envato.com/hc/en-us/articles/51202345702425-Envato-Enterprise-Terms-of-Service) whereas Epidemic says "No PRO claims" [G](https://www.epidemicsound.com/our-plans/business-plan/) — vendor claims differ; ask counsel if budget is large.

### 7.1 Licence-evidence checklist (per track, per campaign)

Folder: `campaigns/{campaign}/04_audio/`
- `music_{source}_{id}.mp3` — the file used (never ship the original untouched if a library forbids standalone redistribution; keep in the campaign folder only).
- `music_{source}_{id}.licence.txt` — plain-text record (template below).
- `music_{source}_{id}.screenshot_track.png` — track row/Information panel showing title, artist, "Royalty-free" label, duration, library name.
- `music_{source}_{id}.screenshot_terms.png` (or `.pdf`) — Sound Collection Terms page with visible "Last Modified" (currently March 16, 2022 [G](https://www.facebook.com/sound/collection/terms)); for paid libraries, the plan page + licence certificate (Envato/Artlist/Epidemic).
- For TikTok CML: screenshot of the sound in Business account/Ads Manager with region = Canada and any Premium flag.
- For Flow Music: screenshot of plan/benefit page and song page (pipeline §1.6).
- Final-mix hash + `ffprobe` of the **exported ad** to prove which audio is in it.

`music_{source}_{id}.licence.txt` template:
```
source:            meta_sound_collection | tiktok_cml | flow_music | epidemic | artlist | envato | mixkit | ...
library_url:       https://www.facebook.com/sound/collection
track_title:       
artist:            
track_id_or_url:   (from track page / Information link)
retrieved_on:      YYYY-MM-DD   by: <person/agent>
account_used:      (FB profile / Business account / plan name)
terms_url:         https://www.facebook.com/sound/collection/terms
terms_last_modified: March 16, 2022   (read on retrieval date)
licence_scope:     commercial incl. ads, Meta Company Products only
cleared_for:       IG Reels / IG Stories / FB Reels / Meta ads   NOT: TikTok, YouTube, web
campaign:          {campaign}   ads: {ad_ids once live}
file_sha256:       
screenshots:       <filenames>
notes:             Advantage+ Music toggle OFF; no AI-music enhancement
```
Also keep one **register** `campaigns/_music_register.csv` (source, id, campaigns used, last used date) to avoid reusing the same famous tracks across ads and to find everything quickly if Meta mutes a track.

---

## 8. What to ask the user to do manually

**Prerequisites:** a Facebook login (personal is enough per community reports; a Facebook Page + Business Suite is better and needed for ads anyway). Use *the user's own* account; the agent must not log in.

1. **Create/confirm Meta side** (one-time): Facebook account → create the **Acme Facebook Page** → open Meta Business Suite (`business.facebook.com`). Later: connect an Instagram Professional account and create an ad account.
2. **Open Sound Collection on desktop:** `https://www.facebook.com/sound/collection` (or Business Suite → *All tools* → "Sound Collection"). Accept the terms prompt if shown.
3. **Test and tell me:** (a) can you open the page with just the personal login, (b) which filters you see (genre/mood/length/vocals/tempo?), (c) does the track row show tempo/BPM and duration, (d) file type after download.
4. **Shortlist 10 tracks** for Acme (instrumental, medium tempo, hip-hop/electronic/ambient; length ≥ 30 s; avoid anything that sounds like a famous song). Click **Download** on each. Also grab 8–10 SFX: *Fabrics*, *UI*, *Footsteps*, *Whoosh/Transition* if present.
5. For **each** track: click **Information**, screenshot it together with the row. Save one screenshot of the **Terms** page.
6. Save files to `campaigns/_library/meta_sound_collection/` named `music_metasc_{trackname-slug}.mp3`, screenshots next to it as `.screenshot_track.png`. Drop the list of titles/artists/tempos you see into a `shortlist.md` (copy-paste is fine).
7. **TikTok (later, when the business account exists):** create/switch to a TikTok **Business Account**, open *Add sound* (it shows only Commercial Sounds), set region **Canada** where asked, favourite 5–10 sounds; screenshot each. Tell me the exact titles; I'll write the edit with the music slot empty and you add the sound in-app / Ads Manager Video Editor. No downloads exist.
8. **Optional:** if budget allows one cross-platform licence, trial **Epidemic Sound Pro/Business** or **Artlist Pro** (both have free trials/plans [G](https://www.epidemicsound.com/our-plans/business-plan/)); download licence certificates.
9. **Before the first ad:** in Ads Manager, on each video ad, check *Advantage+ creative → Music* is **off**; screenshot the toggle.

---

## 9. What the agent can automate afterwards

Given MP3s in a folder (tools per pipeline §2.5–2.6; not repeated):
- **Probe & catalogue:** `ffprobe` duration/format; compute SHA-256; write the `.licence.txt` (fields from the screenshots the user supplies) and `_music_register.csv`.
- **Tempo & beat detection** (librosa/aubio or ffmpeg-based) to fill BPM/beat grid since Meta only shows tempo buckets (§4); choose cut points on beats.
- **Trim to length** (15/20/30 s) at a bar boundary; fade-in/out; loop only if the licence allows it (Sound Collection: not prohibited **[unverified]**).
- **Ducking** under dialogue/SFX (sidechain compress), **loudness normalisation**, true-peak limiting, stereo/mono check.
- **Mux & verify:** produce the MP4 with audio, then re-probe the **exported** file; compare against the register; refuse to export if the track's `cleared_for` doesn't include the destination platform (enforce "Meta-only" vs "TikTok-only" in code).
- **Clean master without music** for TikTok so the CML sound can be added in-app.
- **Variant control:** rotate tracks per ad set; flag overuse.
- **Not automatable today:** getting files out of Sound Collection (no API), CML files (no download), any paid-library download (login), and Advantage+ toggles.

---

## 10. Open questions

1. Does a bare Facebook profile (no Page) open the Sound Collection desktop page and show Download? (the user test.)
2. Does the catalogue show numeric BPM and typical duration for Acme-style tracks? What file type/bitrate is delivered?
3. Is music in Ads Manager's video editor really unavailable for video ads in 2026? (Meta help lists image only; one blog disagrees.)
4. Meta's own partnership-ads/branded-content music wording was not retrieved; Meta "Music Terms" page not read.
5. Where does TikTok's CML browse on web now that the Creative Center music URL serves the "TikTok One Creative Suite" page? Does Ads Manager still show "Usable Placements"?
6. Do any CML tracks list Instagram/YouTube under Usable Placements? Do Canadian-region tracks differ?
7. Epidemic Pro/Business and Artlist Pro current USD prices and whether a CAD price exists (sources disagree: §6).
8. Canadian performing-rights (SOCAN/Re:Sound) exposure for ads using library music — not researched.
9. Whether Meta ever mutes/claims Sound Collection tracks in ads (none documented).
10. Whether automating a logged-in Sound Collection download would breach Meta Terms.

---

## 11. Source index (distinct URLs read or seen as primary snippets)

**[G] Meta**
- https://www.facebook.com/business/help/402084904469945
- https://www.facebook.com/business/help/759279452000505
- https://www.facebook.com/business/help/880459498798521
- https://www.facebook.com/business/help/297506218282224
- https://www.facebook.com/business/help/825637908842087
- https://www.facebook.com/business/help/4023434621109377
- https://www.facebook.com/help/instagram/546362593027755
- https://www.facebook.com/business/ads/facebook-instagram-reels-ads
- https://www.facebook.com/sound/collection
- https://www.facebook.com/sound/collection/terms
- https://m.facebook.com/legal/music_guidelines

**[G] TikTok**
- https://ads.tiktok.com/resources/help/article/how-to-use-the-commercial-music-library
- https://ads.tiktok.com/resources/help/article/commercial-music-library?lang=en
- https://www.tiktok.com/legal/page/global/commercial-music-library-user-terms/en
- https://ads.tiktok.com/business/en-US/blog/audio-library-royalty-free-music
- https://ads.tiktok.com/business/library/TikTok_Music_Legality.pdf
- https://ads.tiktok.com/business/library/Global_SMB_Creative_Playbook.pdf
- https://ads.tiktok.com/business/en-US/blog/introducing-tiktok-video-editor-easily-create-native-video-ads-in-your-browser
- https://ads.tiktok.com/business/en-US/blog/symphony-creative-studio
- https://ads.tiktok.com/business/en-US/blog/smart-plus-ai-performance-solution
- https://ads.tiktok.com/resources/help/article/spark-ads?lang=en
- https://ads.tiktok.com/business/creativecenter/music/pc/en
- https://support.tiktok.com/en/business-and-creator/creator-and-business-accounts/commercial-use-of-music-on-tiktok (search text only)

**[G] other vendors**
- https://support.google.com/youtube/answer/3376882?hl=en
- https://pixabay.com/service/license-summary/
- https://pixabay.com/service/faq/
- https://pixabay.com/api/docs/
- https://mixkit.co/license/
- https://incompetech.com/music/royalty-free/faq.html
- https://freemusicarchive.org/License_Guide
- https://freemusicarchive.org/faq/
- https://uppbeat.io/uppbeat-basic-license
- https://uppbeat.io/pricing
- https://www.epidemicsound.com/pricing/?plans=businesses
- https://www.epidemicsound.com/our-plans/business-plan/
- https://artlist.io/page/pricing/voiceover
- https://artlist.io/page/pricing/max
- https://elements.envato.com/learn/envato-social-media-license
- https://help.elements.envato.com/hc/en-us/articles/360000629346-Envato-Elements-License-FAQ
- https://help.elements.envato.com/hc/en-us/articles/51202345702425-Envato-Enterprise-Terms-of-Service

**[C] community / third party**
- https://www.epidemicsound.com/blog/artlist-vs-epidemic-sound/ (vendor blog)
- https://uppbeat.io/blog/royalty-free-and-copyright-free-music/copyright-safe-music-for-shorts-reels-and-tiktok-how-to-post-without-claims-or-mutes (vendor blog)
- https://www.soundstripe.com/blogs/royalty-free-music-for-instagram-ads
- https://www.soundstripe.com/blogs/how-to-add-your-own-music-to-tiktok
- https://audiodrome.net/for-creators/meta-sound-collection/
- https://techfizzer.com/facebook-sound-collection-get-copyright-free-music/
- https://storrito.com/resources/facebook-sound-collection/
- https://killthedj.com/meta-sound-collection/
- https://github.com/fiehrfly/muses/blob/main/sources/instagram-meta-sound.md
- https://shuttergen.com/resources/meta-music-library
- https://www.youtube.com/watch?v=p5rnVE0gBt4
- https://www.youtube.com/watch?v=9DlFUU9Zxdg
- https://www.youtube.com/watch?v=CIHHarB9D6c
- https://www.instagram.com/p/Dbv5doTmEEG/
- https://www.instagram.com/popular/meta-sound-library/
- https://splendid-learning.de/en/blog/wie-du-lizenzfreie-musik-f%C3%BCr-social-media-verwendest
- https://blog.adnabu.com/facebook-ads/meta-partnership-ads/
- https://sonilo.com/ai-music/royalty-free-music-for-instagram-reels
- https://sonilo.com/blog/comparisons/best-royalty-free-music-sites-2026
- https://sonilo.com/blog/comparisons/youtube-audio-library-alternatives-2026
- https://www.foximusic.com/blog/music-for-ads-on-instagram-safe-sources/
- https://www.foximusic.com/blog/youtube-ads-music-guide-glossary-advertisers/
- https://www.makeinfluence.com/en/academy/copyright-claimed-background-music-in-sponsored-influencer-content
- https://www.breakthirty.com/blog/how-to-add-music-in-meta-ads-manager
- https://luminaclippers.com/blog/tiktok-commercial-music-library
- https://www.digitalapplied.com/blog/social-video-music-rights-platform-comparison
- https://syncvaluations.com/commercial-use-of-music-on-social-media
- https://www.stackmatix.com/blog/tiktok-creative-center-guide
- https://www.cchound.com/artlist/artlist-subscription-plans-and-pricing/
- https://aimusicdaily.com/artlist-vs-epidemic-sound
