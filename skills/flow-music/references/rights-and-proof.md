# Rights, SynthID, claims, licence pack
_Source: `integrations/google-flow-browser-mcp/docs/research/flow-music-craft.md` (cited; tags [G] Google, [C] community, [M] measured by us, [unverified])._

## 7. Commercial use, SynthID, claims, proof

### 7.1 What Google actually says
- Google One help (AI Plus): "Google AI Plus members get the benefits of Google Flow Music's Starter plan: 3,000 monthly credits (~600 songs) ... 8 concurrent generations. All core features. **Commercial use rights.**" [G] https://support.google.com/googleone/answer/16882689?hl=en
- Google One help (AI Pro): "Members of Google AI Pro get the benefits of Google Flow Music's Plus plan: 10,000 monthly credits ... 12 concurrent generations. All core features. **Commercial use rights.**" [G] https://support.google.com/googleone?p=g1_aip_flow&hl=en-HN
- Google One help (AI Ultra): Member plan, same "Commercial use rights" line, plus Member badge/discord/events/early access [G] https://support.google.com/googleone/answer/16286513?hl=en
- Flow Music pricing page lists Free / Starter / Plus / Member with credits, concurrency and "All core features" but **no "commercial use" line and no licence text** [G] https://www.flowmusic.app/pricing ; independent reviewers noticed the same gap [C] https://toolsfine.com/best-ai-tools/google-flow-music , https://useaiforx.com/tool/google-flow-music/ .
- Terms: Flow Music's Terms link resolves to Google Terms of Service (https://policies.google.com/terms) [G], which say: "Some of our services allow you to generate original content. Google won't claim ownership over that content." and "Your content remains yours" [G]. The Believe/Flow Music post repeats "Google doesn't claim ownership of the original content generated with Flow Music" [G] https://blog.google/innovation-and-ai/models-and-research/google-labs/believe-flow-music-partnership/ .
- The same Google Terms prohibit "misleading others into thinking that generative AI content was created by a human" and "using AI-generated content from our services to develop machine learning models" [G] https://policies.google.com/terms?hl=en-US .
- Non-ownership is not a licence or a guarantee of release-clearance [C] https://aialleyway.com/google-flow-music/ , https://www.itechguides.com/music-generator-producerai-joins-google-labs-then-becomes-flow-music-what-changed/ .
- The Gemini API's separate terms add: "You acknowledge that Google may generate the same or similar content for others and that we reserve all rights to do so." [G, API terms - may not govern Flow Music] https://ai.google.dev/gemini-api/terms . **Flag**: if the same applies to Flow Music, your sonic logo is not exclusive.

### 7.2 Per-plan matrix (as far as public sources go)
| Plan | Commercial rights | Source |
|---|---|---|
| Free | **Not stated** anywhere official I found. Treat as non-commercial draft only [unverified] | pricing page silent [G] |
| Starter (= Google AI Plus) | "Commercial use rights" | [G] Google One AI Plus page |
| Plus (= Google AI Pro, the user's mapping) | "Commercial use rights" | [G] Google One AI Pro page |
| Member (= Google AI Ultra) | "Commercial use rights" | [G] Google One AI Ultra page |
| Standalone paid Flow Music subscription (not via Google One) | Not stated on the pricing page; Google One pages describe the *bundle* | [unverified] |
Open wording gaps: the scope of "Commercial use rights" (paid ads? sync? exclusivity? territory? duration? trademark of sonic logo?) and whether rights attach at generation time or at download time, and whether tracks made while on Free and later re-downloaded on a paid plan are covered. **Ask Google support in writing** and keep the reply.

### 7.3 SynthID
- "All of our tracks are imperceptibly watermarked with SynthID technology, allowing you to detect whether music has been created or edited using AI." [G] https://deepmind.google/models/lyria/ ; API doc: all generated audio includes it [G] https://ai.google.dev/gemini-api/docs/music-generation .
- Robustness claims (survives MP3, pitch shift) come from an SEO article, not Google [C] https://www.techtimes.com/articles/322113/20260729/googles-lyria-35-sharpens-vocals-lyrics-while-rivals-fight-court.htm . Assume the watermark persists after your edit and platforms may auto-label.

### 7.4 Content ID / false claims on YouTube, Instagram, TikTok
- YouTube auto-detects AI content (YouTube GenAI tools, C2PA metadata, internal systems) and AI-music may show a player label; disclosure "won't limit a video's audience or impact its eligibility to earn money" [G] https://support.google.com/youtube/answer/14328491?hl=en . The help excerpt I fetched also lists "Creates music that's the main focus of the video" among examples; the heading above that list was cut off, so read the page before relying on it [unverified].
- Content ID claim scenarios (a distributor-registered AI track matching your upload; false cross-claims between similar AI tracks) are discussed by a vendor blog with unclear rigor [C] https://undetectr.com/blog/ai-music-youtube-copyright-claims . Real mitigation: do NOT register your Flow Music beds with Content ID/distributors; keep a dispute pack (7.7).
- Meta: music guidelines state "Use of music for commercial or non-personal purposes in particular is prohibited unless you have obtained appropriate licenses" and unauthorised content may be "blocked, muted or removed" [G-platform] https://www.facebook.com/legal/music_guidelines . Business accounts are limited to Sound Collection or music you license; Reels ads cannot use licensed library music, original audio is allowed [C] https://sonilo.com/ai-music/royalty-free-music-for-instagram-reels , https://hellothematic.com/music-rules-tiktok-instagram-youtube/ . Fact to verify in Ads Manager: that a self-uploaded licensed track passes Meta's audio matching.
- TikTok: "Businesses cannot use the general music library for commercial usage" - use the CML for organic, ads and branded content; "If you choose to use original sound from other users or other licensed sounds ... consult your legal team to ensure you have obtained a proper license" [G-platform] https://ads.tiktok.com/help/article/commercial-music-library . Our Flow Music track in a TikTok ad would be uploaded as video audio (your own original audio), not selected from CML [unverified fit].
- Instagram reportedly scans AI audio for matches against existing works, so a track that resembles a known song can still be flagged [C] https://www.foximusic.com/blog/instagram-reels-music-copyright-legal-guide/ . Mitigate: avoid named-artist prompts, avoid "sounds like" requests, check candidates by ear.

### 7.5 Disclosure and AI labels
- TikTok: AIGC label ("Disclosed by creator as AI-generated"); disclosure "especially important" with synthetic faces/voices or realistic content; platform may auto-label from technical metadata; creators cannot remove an auto-label [G-platform] https://seller-us.tiktok.com/university/essay?knowledge_id=491489038501663&lang=en .
- Branded TikTok posts: also use the commercial-content toggle [C] https://www.auditsocials.com/blog/tiktok-commercial-content-disclosure-2026-branded-content-toggle-ai-labels-hashtags .
- Google's own Terms ban misleading people that AI content is human-made [G] (above). If a sung AI vocal appears, disclose; instrumental beds are lower risk but still carry SynthID [unverified risk grading].

### 7.6 Ownership / copyright caveat for a sonic logo
- US Copyright Office (Jan 2025): "prompts alone do not provide sufficient human control to make users of an AI system the authors of the output"; protection exists for human-authored elements and creative selection/arrangement/modification [G-gov] https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf . Canada is Acme's home jurisdiction; I did not research Canadian law [unverified].
- Practical consequence: AI-only beds may not be protectable or exclusive. For the sonic logo, add human authorship (own recorded sample, a re-played/edited melody, a documented edit decision list) and ask an IP lawyer about sound-mark registration.
- Litigation noise: a March 2026 proposed class action by indie musicians alleges Lyria 3 was trained on copyrighted recordings; Google moved to dismiss in June 2026 [C] https://www.musicbusinessworldwide.com/watch-out-suno-google-has-upgraded-lyria/ . Google's training statement is quoted in section 2. Risk is unresolved; mention to anyone signing sponsor/agency contracts.

### 7.7 Proof to keep (per released track) - the "licence pack"
1. Screenshot of Flow Music **Account settings -> Subscription** showing Plus/Starter and a screenshot of the Google One page stating "Commercial use rights" (page URL + date).
2. The exact prompt(s), the chat transcript or session URL, take ID, timestamp, Lyria model shown in Settings.
3. The original downloaded WAV + SHA256, plus the edited master and an EDL (which seconds were used).
4. Rights-holder email from Google support if you ask scope questions.
5. Publishing info: not registered in Content ID; AI disclosure toggle used where realistic.
