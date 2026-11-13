---
name: commercial-music-sourcing
description: Use when picking licensed music for social ads.
version: 1.0.0
author: Muse
license: MIT
metadata:
  tags: [music, licensing, meta-sound-collection, tiktok-cml, ads]
  related_skills: [flow-music, google-flow]
---

# Commercial-safe music for social ads (Meta Sound Collection, TikTok CML, paid libraries)

## When to Use

* Choosing music for an organic or paid post on Instagram/Facebook/TikTok/YouTube, or recording licence evidence.
* Deciding between Meta Sound Collection, TikTok CML, own Flow Music tracks or paid libraries.

Research only so far (no login by the agent). Full cited guide: `integrations/google-flow-browser-mcp/docs/research/commercial-music-libraries.md` (380 lines, 70 sources). Terms change: re-read the cited page before a paid campaign.

## Bottom line
* **Meta Sound Collection** (`https://www.facebook.com/sound/collection`, terms `.../sound/collection/terms`, last modified 16 Mar 2022): free; Meta says usable "for commercial purposes like ads" **on Meta Company Products only** (IG, FB). NOT TikTok, YouTube or the website. Meta's help says to click **Download** on desktop and "use your own video creation software" -> download -> ffmpeg -> upload the finished MP4.
* Catalogue is **login-gated**; no API found. the user must browse/download manually; the agent must not automate a logged-in Facebook session.
* Catalogue size is stated as both "over 14,000" and "nearly 16,000" (Meta pages disagree). Filters: genre, mood, length, vocals (community adds tempo buckets). No BPM number: **measure it** with `flow_analyze_beats`.
* Meta's Music Guidelines: commercial use of music is prohibited without licences; pop/licensed library music is **not** allowed in Reels ads. Boosting an organic Reel counts as commercial use: use cleared audio from day one.
* Ads Manager "Add music" is documented only for single-image ads; for video ads bake the track in locally and switch **Advantage+ Music off**.
* **TikTok Commercial Music Library (CML):** free, covers organic business posts, ads and branded content on **TikTok only**; pick region Canada; Premium tracks may carry a fee; no download function documented (add sound in-app or Ads Manager Video Editor). Where web CML browsing lives now (TikTok One Creative Suite?) is unverified.
* **Own Flow Music original** (plan PLUS) is the simplest single master across platforms; keep the licence pack (see `flow-music` skill).
* Traps: Uppbeat Basic bans paid ads; FMA CC BY-NC bans advertising; CC-BY needs visible credit (impossible in ads); Pixabay tracks can still get Content ID claims; YouTube Audio Library promises safety on YouTube only; Epidemic/Artlist/Envato licences are plan/account-bound (Artlist needs Pro, not Social).

## Decision table
| Use | Safe source | Not safe |
|---|---|---|
| Organic IG/FB Reel | Sound Collection; own Flow Music; Epidemic/Artlist/Envato | Pop/trending on a brand account; CML |
| Paid Meta video ad | Sound Collection MP3 baked in; own Flow Music; paid-ads licence | Licensed/pop library; Uppbeat Basic; FMA NC |
| Paid Meta image/carousel | Ads Manager Add music (Sound Collection) | - |
| Organic TikTok (business) | CML in-app; own audio + Music Usage Confirmation | Sound Collection; trending sounds |
| TikTok ad / Spark Ad | CML via Ads Manager Video Editor; own/paid licence naming TikTok | Sound Collection; Uppbeat Basic |
| YouTube Short | Own Flow Music; paid libs; YouTube Audio Library (organic) | Sound Collection; CML |
| One master everywhere | Own Flow Music, or Epidemic Pro/Business / Artlist Pro / Envato | platform libraries |

## What to ask the user to do (manual, exact steps in the research doc section 8)
1. Log in with his own Facebook account (a Page + Business Suite is better), open `facebook.com/sound/collection`, accept terms.
2. Tell me: does it open, which filters, is BPM/duration shown, file type after Download.
3. Shortlist 10 instrumental medium-tempo tracks (>= 30 s, nothing that sounds like a famous song) plus 8-10 SFX (fabric, UI, whoosh); Download each; screenshot Information + the Terms page.
4. Save as `campaigns/_library/meta_sound_collection/music_metasc_<slug>.mp3` with `.screenshot_track.png` and a `shortlist.md`.
5. TikTok later: Business Account -> Add sound -> region Canada -> favourite 5-10; screenshot each.
6. Before the first ad: Advantage+ creative -> Music = off; screenshot.

## What the agent automates after that
BPM/first-beat/silence/LUFS via `flow_analyze_beats` + ffmpeg, bar-aligned trim, duck under VO, loudnorm -14 LUFS / -1 dBTP, mux and verify with ffprobe, write the `.licence.txt` (template in the research doc 7.1).

## Licence evidence (per track, folder `campaigns/{campaign}/04_audio/`)
`music_{source}_{id}.mp3`, `.licence.txt` (source, library_url, title, artist, track_id, retrieved_on, account_used, terms_url + last-modified, licence_scope, cleared_for / NOT, campaign, file_sha256), `.screenshot_track.png`, `.screenshot_terms.png`, final-mix hash + ffprobe of the exported ad.

## Open (unverified)
Bare personal Facebook can open Sound Collection with Download? Is Ads Manager music really absent for video ads in 2026? Meta Music Terms page failed to load. Current Epidemic/Artlist/Envato prices conflict. SOCAN/Re:Sound exposure not researched. Whether automating a logged-in Sound Collection download breaches Meta's Terms is unknown.
