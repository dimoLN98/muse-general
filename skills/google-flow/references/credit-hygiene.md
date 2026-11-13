# Credit & spend hygiene

Distilled from `docs/research/flow-creative-playbook.md` §8, `flow-official-facts.md` and Google's Flow credit
table. Account: first@example.com, tier **PRO**. Credit tables age fast — confirm with
`flow_video_options` or the live prompt-box settings before quoting a price.

## Allowance
* **50 credits/day** with or without a subscription; refresh triggers on the first generation of the day; no rollover.
* Pro adds **+1,000/month** (no rollover). Credits are shared across devices.
* Peak **2–5 PM UTC**: non-subscribers get no video generation (Pro unaffected).
* Flow has **no balance API** — read the badge in the profile menu / prompt box (UI scrape), or `flow_accounts
  refresh_active=true`.

## Cost per **generation** (2 outputs = 2× the bill; failures are refunded)

Omni 1.2 bills **per second**; Veo bills **per clip**.

| Operation | Credits |
|---|---|
| **Omni 1.2 Flash 720p** | **3/s up to 10s**; 11–15s bill 6/s per extra second → 4s **12**, 10s **30**, 15s **60** |
| **Omni 1.2 Flash 360p** | **1/s up to 10s**; 11–15s 2/s per extra second → 4s **4** |
| Omni 1.2 extend (+3–10s, subscribers) | 3/s at 720p, 1/s at 360p per second added |
| Omni 1.2 video-to-video edit | billed like a generation: **3/s at 720p**, 1/s at 360p |
| Omni 1.2 upscale 360p → 720p/1080p | **0** for 1–10s, +1/s beyond |
| Omni 1.2 upscale → 4K | 50 flat for 1–10s, +5/s beyond, **Ultra only** |
| Omni 1.1 Flash 720p *(retires 2026-12-05)* | 7 / 10 / 12 / 15 for 4 / 6 / 8 / 10 s |
| Veo 3.1 Lite (4/6/8 s) | **10** (Ultra 5) |
| Veo 3.1 Fast *(retires 2026-12-05)* | **20** (Ultra 10) |
| Veo 3.1 Quality (8 s) *(retires 2026-12-05)* | **100** (all tiers) |
| Images (Nano Banana) | Google publishes no price; observed free/covered at this tier |
| Agent queries / tools | currently 0 |

Conflicts to remember: older guides quote Omni 1.1 at 7 per 4s and edits at a flat 40 — those are **1.1**
numbers and die on 2026-12-05. On 1.2 the same 4s clip is 12 and a 4s edit is 12. Third-party wrappers price
their v2v path differently; the Flow UI is the reference.

## Standing rules (override the playbook where they differ)
1. **Ask the user before spending credits.** Quote the model, length, resolution and count first.
2. **Default models:** video **Omni 1.2 Flash** (720p); image **Nano Banana 2.1** (not Lite — the playbook's "draft on Lite"
   is *not* our default). **Never Veo 3.1 Quality by default** — it needs `allow_expensive=true` and an explicit OK, and it
   is retired 2026-12-05 anyway.
3. **`auto_confirm=false` is the only real spend guard.** The permission card appears only sometimes.
   **Never click "Always approve"** — it rewrites the account's confirm setting to Never. (Agent setting
   "Confirm before generating" should stay **Always**.)
4. **Outputs x1 while iterating.** x2 doubles the bill. Model, ratio and count live in Agent settings
   (Close = `button[aria-label="Back"]`); length lives only in the prompt text.
5. **Never loop Retry** — in-flight requests may still consume credits and retries compound rate limits.
6. **Stills first.** Build ad/hook matrices from images, then render only the winners to video.
7. **720p only — no 360p drafts (the user, 9 Nov 2026).** Save credits with fewer takes, shorter clips and edits instead of regenerating, never by dropping resolution.
8. **Budget per deliverable, not per clip.** A 15s 720p Omni 1.2 spot is 60 credits, so plan one
   generation per beat, not a spray: at 60/clip a 1,000-credit month is ~16 finished 15s clips.
9. **Don't pay to prove a documented-but-missing feature again.** Model menu, Extend and duration
   behaviour are settled in `FLOW-UI-MAP.md`; re-read it instead of spending.
10. **Check the prompt-box settings before every run** — Google changes models and prices without notice.
11. **Re-read the balance** before and after any paid run and report the delta.
12. Google Takeout archives prompts, models, characters, scenes and edit history if a backup is ever wanted.

## Which model when (adjusted for this account)
| Situation | Use |
|---|---|
| Any default video | Omni 1.2 Flash 720p, 3 cr/s — always 720p, no 360p (the user) |
| Must hold product/character identity | Omni 1.2 with ingredients (images, ≤3s motion clips, audio cues) |
| One continuous shot longer than 8s | Omni 1.2 — it is the only model past 10s (up to 15s) |
| Longer than 15s | Omni Extend in the UI (+3–10s, subscribers) or `flow_stitch_videos` locally (free) |
| Edit existing footage | Omni 1.2 v2v only, 3 cr/s; chain turns on one clip |
| Cheap flat-rate clip with a Veo look | Veo 3.1 Lite (10) — the only Veo still shipping |
| Stills, thumbnails, hook frames | Nano Banana 2.1 |
