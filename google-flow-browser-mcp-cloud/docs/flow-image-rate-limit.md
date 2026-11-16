# Flow image rate limit — "We noticed some unusual activity"

## What it is
Google Flow's anti-abuse velocity flag on image generation. It is **not** a daily
cap, **not** the prompt, and **not** the ingredient. It is Google reacting to
burst traffic: too many generations fired too fast, with machine-like timing.

## How we proved it (2026-11-13)
- 6 successful Nano Banana 2.1 image generations in ~15 min (02:31-02:45 CST),
  then **8 consecutive failures** across every prompt and ingredient
  (backpack, Genes hoodie, MU on-model, OT hoodie, two-product), surviving
  2-6 min pauses and fresh task sessions. The app otherwise worked normally
  (uploads complete, prompts submit); only the generation itself was rejected.
- Nano Banana 2.1 + 2 Lite share a **400/day** pool. We were at 6. Not the cap.
- The failures got worse because we kept retrying: cover #7 was re-submitted
  3x in ~40 s, then #8/#9/#10 were fired immediately after. Independent
  Flow-automation guides call that exact pattern "the burst that earns the
  warning", and every refusal doubles the following delay (capped 8x).

## What Google says (official Flow help)
- "You're requesting generations too quickly": Flow rate-limits, particularly
  for zero-credit models. "After you've made a large number of generations
  in a day, the number of generations you can make within a minute will
  decrease."
- "Unusual Activity": "Retry after a couple of minutes. Disable VPNs or proxies."

## What independent Flow-automation guides say
- **flow-connector:** "Flow's anti-bot reacts to burst traffic... Re-submitting
  the same prompt three times in forty seconds is exactly the burst that earns
  the warning, so a refusal is terminal for that job. Do not resubmit it by
  hand either; move on, or slow down. Every refusal doubles your requested
  delay (capped at 8x), decaying on its own."
- **AutoFlow:** on the first refusal, wait 3 min, slow to 30-45 s between
  prompts; if it happens twice in a row, pause 10-15 min. Use Balanced/Slow
  speed, batches of 20-30 with a short break.
- **badcodetv:** a real page reload + retry after ~10 s can clear a TRANSIENT
  flag. No long back-off, no pause between clips — for a single transient hit.
- **3DMuscleComics (full lockout):** "You haven't done anything wrong — our
  method fires a lot of generations in a short window, and that's what trips
  it." Clearing cache does NOT fix it. The fix: change your public IP with a
  VPN (usually works immediately), come back to your normal IP after ~24 h
  (the flag ages out). Using Flow from two computers at once makes it more
  likely. Fallback: Higgsfield (paid, same Nano Banana models, different
  front end).
- **playwright-ai-bridge:** simulate human typing with a randomized 30-100 ms
  delay per character; instant fill is a machine signal.

## Contributing factors in our setup
1. **Burst velocity (main cause):** 6 generations in 15 min, batched 3 per
   browser task, no pauses, instant prompt paste + immediate submit.
2. **Rapid retries (aggravator):** 3 re-submits of the same prompt in ~40 s,
   then 3 more generations immediately.
3. **Machine-like timing:** the browser task pastes the whole prompt instantly
   and clicks Start generation at once. No human typing delay, no pause.
4. **Possible:** the cloud browser's automation signals (CDP-driven clicks,
   datacenter IP). We cannot verify or change the cloud browser's IP/flags
   from here; the velocity fix is what we control. If the flag persists past
   a long cooldown, the next step is a different public IP (VPN) — ask the user
   before using one, since Google's own help also lists VPNs as a cause.

## The fix (implemented 2026-11-13)
- **Pacer guard (REVISED, the user's correction):** the first version (180 s minimum,
  4/hour, 2 h cooldown) was too strict and killed speed — the user was right, other
  agents work much faster without hitting the flag, so raw speed is not the whole
  story. The hard limits are REMOVED. `scripts/image-pacer.mjs` now only logs
  attempts and warns if a re-submit comes inside ~40 s. Do not re-add hard caps
  without the user's approval.
- **Human-like timing in the MCP assignment:** `assignmentGenerateImage` in
  `src/cloud/cloud-queue.js` now instructs the browser task to paste the whole
  prompt at once (do NOT type it character by character — typing is very slow
  and Flow does not care; the user, 2026-11-13, watching the browser), then wait
  4 s (the user, 2026-11-13: 4 s is enough, not 10 s), pause a few seconds before
  clicking Start generation, leave a 10 s pause between generations (the user,
  2026-11-13: 10 s between each generation and the next — corrected from 20 s), never re-submit the
  same prompt inside ~40 s (spread 3 attempts over ~3 min), and on a refusal:
  STOP the batch, real page reload, then run a FRESH generation (paste the
  whole prompt, 4 s wait, attach the reference) — do NOT retry the failed
  tile, it fails instantly again (Mixer v2 scene 1, 2026-11-16: 2x "Retry"
  failed, a fresh generation after reload started immediately at 3% and
  finished in ~60 s). The flag sits on the tile/session, not the prompt.
  The 10-15 min wait is no longer needed when the fresh generation works.
- **UPDATE (2026-11-16, Mixer v2):** the fresh-generation-after-reload fix is
  proven. "Reuse prompt" on a flagged tile is DEAD — remove it from any
  instruction that still says it.
- **Model-switch pressure valve:** if Nano Banana 2.1 is flagged, Nano Banana Pro
  is a separate daily pool (100/day on Plus/Pro) and may still work — try it once
  before waiting out the flag. (2 Lite shares 2.1's 400/day pool, so it is not
  an alternative.)
- **Cooldown now:** the flag appeared 02:45 CST; last refusal 03:20 CST. Do not
  poke Flow images until the flag decays (try one generation after a real break,
  with the new timing). If a retry after the cooldown still fails, the next step
  is a different public IP (VPN, with the user's approval) or waiting ~24 h.
- **Video is unaffected** (separate meter, credits-based) — the flag is
  image-generation only. The 09:00 Overthinking Reel post (instagram-cli)
  is also unaffected.

## Diagnostic — the cloud browser is CLEAN (2026-11-13 03:25 CST)
the user challenged the "too fast" conclusion: other agents are faster and never hit
this. He was right to push — the browser check proves it:
- bot.sannysoft.com on the cloud browser: navigator.webdriver = false, NOT
  headless (all HEADCHR tests passed), Chrome 157 on Linux, plugins present,
  all fingerprint tests "ok". The page does NOT flag it as a bot. The only tell:
  WebGL renderer is SwiftShader (software rendering, no real GPU).
- Public IP: 204.191.248.243 — Canadian TELUS network (AS852, Edmonton/Burnaby
  BC). Not a cloud/datacenter IP.
- So the browser and the IP are NOT the cause. The refined root cause is the
  **burst on the 0-credit image model**: Google rate-limits zero-credit models
  much harder than paid ones, and our pattern (6 generations in ~15 min, instant
  paste + immediate submit, perfectly uniform timing, 3 re-submits in ~40 s)
  tripped the per-minute limit for that model. Video (paid credits) kept working
  in the same browser/session all day. Remaining secondary factors: the
  perfectly-uniform machine timing (no jitter), the rapid retries into refusals
  (each refusal extends the flag), and the account being brand-new
  (you@example.com, created for this project — new accounts are more
  sensitive). The local MCP Chrome is headless + proxy + remote-debugging
  (a textbook automation fingerprint, and Google already rejected its sign-in)
  — do NOT use it for Flow; the cloud browser is the clean one.

## The missing piece — the flag is ON THE ACCOUNT, and the account is COLD
  (the user's push, 2026-11-13 03:30 CST — he felt something was still missing.
  He was right. This is it.)
- "Unusual activity" is **a stronger stop on the account** (mansify/Prompt Batch:
  "Generations fail until it is lifted, and users report it can last much
  longer" than the lighter "requesting too quickly" message). TurboFlow's
  changelog is explicit: the fastest fix for it is **switching Google account
  in Flow** — i.e. the flag lives on the account, and a different account
  works immediately. It also hits people using Flow with no extension at all,
  so it is not caused by automation per se.
- **you@example.com is a brand-new, cold account** (created for this
  project, Nov 2026). A cold account that immediately does heavy volume
  (30+ video clips + 6 images in 2 days, sessions expiring 3x with iPhone
  approvals) is exactly what Google flags: "A cold account acting busy is an
  obvious flag" (bitbrowser). New accounts have a much lower velocity
  threshold than established ones — that is why the user's other agents, on
  established accounts, are faster without ever hitting it.
- **Multiple accounts in one browser** can also cause session conflicts
  (apipass): check the cloud browser is signed into only musedraft for Flow.
- Consequences: (1) the flag may last much longer than an hour — wait at least
  an hour after the last refusal before testing; (2) Nano Banana Pro is a
  separate pool but the flag is account-wide, so Pro may ALSO fail — test it
  once, do not assume it works; (3) the durable escape hatch is switching
  Flow to an established Google account (the user's main account) — needs the user's
  approval, and the PRO credits (762) live on musedraft, so it is a real
  trade-off; (4) a VPN IP change also works (TurboFlow), but Google also lists
  shared VPNs as a cause — only with the user's approval.
