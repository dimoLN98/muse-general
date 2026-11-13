# Acme ad sound design, music-to-picture editing and AI dialogue-scene craft (Oct 2026)

Scope: what is NEW on top of `flow-music-craft.md` (Lyria prompts, length/BPM drift, beat grid, licence), `skills/media/flow-music/SKILL.md`,
`flow-video-ad-craft.md` and `flow-creative-playbook.md` (Veo/Omni prompt grammar, colon-vs-quotes, <=10-word lines, voice description pasted unchanged,
safe camera moves, lighting table, print fidelity rules). I do not repeat those. Pipeline assumed: 138 BPM D-minor bed cut to 9 bars (`outputs/music/EPS_bed_acme_cut36b.wav`, 15.652 s),
30 fps picture (the existing `ad02_render_v2.mp4` is 30 fps), 48 kHz audio, no Flow credits spent for this doc.

Tags: **[M]** = measured by me in this session with ffmpeg (commands below, files in `cache/scratch/sfx/` and the kit folder) · **[G]** official/standards body ·
**[C]** community/vendor/agency (unverified) · **[I]** my inference · **UNVERIFIED** = not executed/tested.

---

## 0. Ten numbers to remember

1. Whole bars at 138 BPM: beat 0.4348 s, bar 1.7391 s, **9 bars = 15.652 s**. At 30 fps one beat = 13.043 frames, a bar = 52.17 frames. [M]
2. Cut **picture 1 frame (33 ms) before the beat; hits ON the beat; whoosh peak ~2 frames before the beat.** ITU-R BT.1359 says sound early by more than ~45 ms or late by more than ~125 ms is detectable. [G]
3. Never accumulate per-beat rounding: 30 fps drifts 1.4 frames over 32 beats, 24 fps drifts 13.9 frames, 25 fps 4.2 frames. Compute every cut from absolute time (`beat_cutlist.py`). [M]
4. Deliver **-14 LUFS integrated; true peak -2 dBTP (not -1)**: after a native-AAC 192k re-encode a -1.9/-2.0 dBTP WAV came back at **-1.4 / -0.8 dBTP**, a -1.0 dBTP file at -0.4, and 96k pushed it to **+1.0**. [M]
5. While someone speaks, bed ~**10-12 LU under the voice**. Measured in the test mix: voice -12.7 LUFS vs bed -23.7 LUFS (11 LU); in a phone band (150 Hz-9 kHz, mono) voice -16.2 vs bed -31.5 (15 LU). [M]
6. `sidechaincompress` on Acme's voice level averages **5-9 dB** of duck over a 3.5 s phrase, whatever you push (ratio max 20); get the rest from a static -3 dB on the bed. [M]
7. Silence hook = **one beat (13 frames at 138/30)** with music+SFX out, room tone left in, riser still running, impact on the downbeat. Safe <1 s, ceiling ~2 s. [C]+[M]
8. Voice chain gains verified on pink noise: **-7.0 dB @60 Hz, -2.8 @100, -2.6 @280, +0.2 @1 k, +2.7 @3.2 k**. [M]
9. Sonic logo 1-3 s, **3-6 pitched events**, resolves, one deliberate anomaly. [C] SoundOut
10. 9:16 safe box that satisfies Reels + TikTok + Shorts: **x120-780, y288-1248 of 1080x1920 (660x960)**; the existing selfie clip B1a puts the face over y~260-800 and the chest logo at x~690-830, y~1200: no free caption lane. [C]+[M]

---

## 1. Sound design for short ads

### 1.1 What makes an ad sound expensive: the layer stack

Four jobs (voice, music, SFX, ambience); the common cheap mix is voice + too-loud music and nothing else; adding SFX and ambience "is the difference between a slideshow and a scene" [C] https://www.versely.studio/blog/sound-design-in-ads
Acme's version, in the order they are placed:

| Layer | What goes here | Level target (vs voice = 0) | Acme source |
|---|---|---|---|
| Voice | dialogue, tag line | 0 | Veo/Omni native speech (~-21 to -23 LUFS raw [M]); TTS Aria (-18.5 to -20.8 LUFS raw [M]) |
| Bed | 138 BPM D minor | -12 to -18 dB, -20 in CTA [C] Versely; our measured result 11 LU while speaking | Flow Music cut to bars |
| SFX | riser, impact, whoosh, tick, glitch, swish | momentary -6 to -10 dB, **one accent per cut max** [C] Versely | `outputs/audio/sfx-kit/` (section 1.6) |
| Foley | fabric, footsteps, page turns | under the AI clip's own foley | prompt "Audio: ... " in Flow (playbook 5.4) + `swish_fabric.wav` |
| Room tone | continuous floor under all cuts | -20 to -25 dB under voice [C] Versely; kit file at +6 dB lands ~-41 dBFS RMS [M] | `room_tone_4s_loop.wav` |

How "expensive" is built (all [C] unless marked):
* **Pre-lap and anticipation**: a riser that ENDS on the downbeat, then an impact that STARTS on it. Riser lengths 1-4 bars; put the loudest instant of a reversed/swept sound on the downbeat https://reverseaudioapp.com/blog/how-to-make-a-riser ; remove something 1-2 bars before the new section and hit the first beat https://veena.studio/blog/transitions-and-fills
* **Hits carry weight, whooshes carry motion, ticks carry text**: impact on the reveal and the logo, whoosh on camera/scene changes, tick when a caption word lands.
* **Continuous floor**: Veo/Omni native audio "arrives inconsistent clip to clip" and a bed that changes character at each join is a tell in chained clips; a continuous room tone of our own across all cuts hides the joins https://www.versely.studio/blog/silence-as-an-edit-beat-in-short-form
* **Restraint**: dense/lush sound design does not predict recall of a sonic logo; it plays through a phone speaker in a noisy room https://soundout.com/learn/what-is-a-sonic-logo . For the ad: the hit count budget is one accent per cut, one glitch per ad, one sub drop on reveal and one on logo.
* Turn Veo's own music OFF in every clip prompt ("no music", already in video-ad-craft rule 6) so the bed is the only music.

### 1.2 Sound logo and stings

* Length 1-3 s (<1 s too little to remember; >3 s behaves like brand music) [C] https://soundout.com/learn/what-is-a-sonic-logo
* Anatomy of ones people can reproduce: **3-6 pitched events** (working-memory span), **resolves** (arrives, doesn't fade), singable intervals, **one deliberate anomaly** (a timbre/interval slightly unexpected) that makes it ownable. Same source.
* Design for the worst listener: phone speaker, noisy room. Test the logo through the phone-band filter in 1.5 before approving it.
* Acme recipe [I]: motif of 3-4 notes in D minor (the existing `sting_ping/thud/tick.wav` are 0.55/0.35/0.12 s, not a motif yet) + `impact_sub_drop_138.wav` on the downbeat + the spoken tag "Acme." (EP-suh-lon, TTS or human) 40 ms after the hit (that is how the test mix places it). Anomaly candidate: the pitch-stepped glitch stab (`glitch.wav`) as the "tail" 1 beat later. Human layer (own fabric/zipper recording) for authorship: see `flow-music-craft.md` 7.6 and the skill's brand-sound references.
* Put the logo hit on the SAME bar-line relation in every ad (bar 9 downbeat of a 9-bar ad) so it becomes a learnable cue.

### 1.3 Cutting to the beat

**Cut on the beat or before?** Sound registers faster than picture, so a cut exactly on the transient reads slightly late; land the cut **a frame or two before** the beat https://zellahq.com/blog/how-to-sync-video-cuts-to-the-beat-of-a-song/ [C].
The standards agree in direction: ITU-R BT.1359 detectability about **+45 ms (audio early) to -125 ms (audio late)**, acceptability +90/-185 ms https://nab.org/xert/scitech/2009/TVTechCheck/TV100509.asp [G]; EBU R37 end-to-end +40/-60 ms (audio before/after video) https://en.wikipedia.org/wiki/Audio-to-video_synchronization [G, secondary]. At 30 fps one frame = 33.3 ms, two = 66.7 ms.
Rules derived [I]:
* Picture cut 1 frame before the beat (audio then lags picture 33 ms: inside the tolerance).
* Impact/tick placed **on the beat** (never earlier than 1 frame = 33 ms: sound-early is the sensitive side).
* Whoosh **peak** 1-3 frames before the beat (it announces the cut; the kit's `whoosh_fast_0p5.wav` peaks at 0.185 s so start it at `beat - 2 frames - 0.185 s`).
* Riser ends exactly on the beat. Music dropout (1.4) ends exactly on the beat.
* For dialogue, cut on words/blinks, not on beats: "cut the talking on the words, cut the montage on the beat, and let the transition be the moment the music comes up" (Zella). A blink marks the end of a thought (Murch, cited https://flashboards.yaroflasher.com/learn/editing/editing-dialogue-scenes/).

**Frame-exact grid.** [M] `beat_cutlist.py` (in the kit folder) uses absolute time, `frame = round(t0 + n*beat) * fps` minus lead frames. Output for 138 BPM, 30 fps, first kick at 0.000 s, lead 1:
```
first cut (bar 2)      beat  4  audio  1.739s  grid frame  52.17 -> picture cut frame  51 (1.700s)
reveal impact (bar 6)  beat 20  audio  8.696s  grid frame 260.87 -> picture cut frame 260 (8.667s)
print cut (bar 7)      beat 24  audio 10.435s  grid frame 313.04 -> picture cut frame 312 (10.400s)
print cut 2 (bar 8)    beat 28  audio 12.174s  grid frame 365.22 -> picture cut frame 364 (12.133s)
logo (bar 9)           beat 32  audio 13.913s  grid frame 417.39 -> picture cut frame 416 (13.867s)
```
Frames per beat: 24 fps 10.435 (accumulated rounding drifts 13.9 frames in 32 beats), 25 fps 10.87 (-4.2), **30 fps 13.043 (+1.4)**, 60 fps 26.087 (+2.8). Stay at 30 fps (the render already is). Measure the real first-kick time of every new bed (`flow_music_shorten` already reports it) and pass it as `t0`.
First onsets measured in the current bed with a <120 Hz envelope: 0.02, 0.45, 0.89 s... (a kick every ~0.435-0.44 s, consistent with 138 BPM). I did not do a full beat-grid fit; the earlier pipeline measurement stands. [M, partial]

**Cut speed by tempo (138 BPM; 30 fps).**

| Shot length | Time | Frames | Use |
|---|---|---|---|
| 1 beat | 0.435 s | 13 | print flashes, logo flicker (use on bars 8-9 only; below ~0.4 s a viewer cannot read a new face) |
| 2 beats | 0.870 s | 26 | reveal montage, product detail cuts |
| 1 bar (4 beats) | 1.739 s | 52 | default montage shot; hat-rate/snare cuts |
| 2 bars | 3.478 s | 104 | dialogue line, hero shot |
| 4 bars | 6.957 s | 209 | one held dialogue scene |
Match the cut layer to the drum layer: kick = slow, one cut per bar or two; snare = classic montage pulse; hats = rapid, 4-8 cuts per bar (Zella). Agency median for short-form is **2.1 cuts per 10 s** (Media Strategy Lab, own data; vendor) https://mediastrategylab.com/tools/lufs-loudness-reference , so the plan below (dialogue 4 cuts in 8.7 s, then 1 cut per bar, then faster) is already above the median: do not add more.

**J/L cuts for dialogue.** Overlap 6-12 frames (0.2-0.4 s) for a quick hand-off inside a conversation, 0.5-2 s for a normal split; under ~4 frames it just reads as a soft cut; end the overlap before the viewer starts looking for the talker https://valmera.io/glossary/j-cut-and-l-cut [C]. In an ad: start the second speaker's voice 6-8 frames before the picture cut (J), keep the first speaker's last word under the next shot (L) only if the first shot's audio has the handle (needs 8+ frames of tail in the clip).

### 1.4 Silence and the drop as a hook

* Muted autoplay: never open on deliberate silence. First 0.5 s of silence reads as "dead Reel" https://cutscore.io/blog/loudness-for-instagram-reels [C]; Versely says the same about the very top https://www.versely.studio/blog/silence-as-an-edit-beat-in-short-form . Open on dialogue + room tone.
* Use silence as the **pre-reveal beat**: cut music and SFX one beat before the moment, leave ambience running, hold **12-25 frames (15 default)**, bring the bed back over 4-8 frames or let the impact do it. Silence < 1 s is the safe range, ~2 s the ceiling, and **"silence is not zero"**: true digital silence reads as dropout. Same Versely page [C]. Put it against the caption track too: hold/blank the caption at the same moment so the sound-off viewer gets the pause.
* Acme implementation (executed [M]): 1 beat = 13 frames before the reveal downbeat (8.261-8.696 s): `volume='1-clip((t-8.261)/0.02,0,1)*(1-clip((t-8.696)/0.003,0,1))':eval=frame` on the bed (20 ms fade-out, hard return under the impact). Bed RMS in that window measured -38 dB vs -21 dB in the reveal. The 1-bar riser keeps running through it; room tone stays.
* Don't stack: one silence per ad. Reveal only.

### 1.5 Mixing dialogue + music + SFX for phone speakers

**What the phone does.** Mono-ish, almost no bass, small attention window https://onloopin.com/blog/mastering-for-instagram-and-reels [C]; "high-pass 80-120 Hz for phones, dialog mono-centred and bright in 2-5 kHz, compress dialog 2:1-4:1" https://speakers.cloud/vertical-video-sound-design-making-dialog-and-sfx-pop-on-pho [C]. Test every mix through this phone-band simulation:
```
ffmpeg -i mix.wav -af "highpass=f=150,lowpass=f=9000,pan=mono|c0=0.5*c0+0.5*c1" phone_sim.wav     # [M] used for the 15 LU check
```
It is a crude simulation (no speaker resonance), not a replacement for a real phone at 50 % volume.

**Loudness.** Integrated **-14 LUFS**, true peak ceiling: -1 dBTP is the usual number (Instagram/TikTok publish none; Meta Reels use adaptive loudness management) https://cutscore.io/blog/loudness-for-instagram-reels https://mediastrategylab.com/tools/lufs-loudness-reference [C]. **New, measured: use -2 dBTP.** `loudnorm`'s TP target is met in the WAV, then the AAC encode overshoots:

| Source WAV (-14.2/-14.3 LUFS) | AAC 192k | AAC 128k | AAC 96k |
|---|---|---|---|
| TP -1.0 dBTP | -0.4 | -0.5 | **+0.4** |
| TP -2.0 dBTP (-1.9 in the kit run) | -0.8 (kit run: -1.4) | -0.6 | **+1.0** |
(native ffmpeg `aac`; the platforms' own encoders will differ, so measure after YOUR last encode and upload AAC >= 192k yourself.) [M] Integrated loudness did not move (-14.1 -> -14.3 LUFS).
Platform audio stats: **93 % of TikTok users spend time with sound on; music is in 63 % of TikTok ads; 71 % have text overlays** https://ads.tiktok.com/business/creativecenter/quicktok/online/Power_Creative_Elements/pc/en [G]. Meta's Reels ads page claims 2x higher delivery for 9:16 ads with audio and safe-zone messages (search-snippet only, page not retrievable) https://www.facebook.com/business/ads/facebook-instagram-reels-ads ; Meta's lessons page recommends layering music, voiceover and SFX in sync plus text overlays https://www.facebook.com/business/learn/lessons/create-fb-ig-reels/ [G, snippet].

**Voice chain (EQ + dynamics).** Sources: HPF 70-90 Hz -> cut 200-400 Hz mud -> presence 2-5 kHz +1.5 to +4 dB -> 6-8 kHz sibilance control -> 3-4 dB compression https://audiogearhub.com/mix-audio-for-social-media/ , https://speakers.cloud/... [C]. Acme chain, gains verified on pink noise [M]:
```
highpass=f=90, equalizer=f=280:t=q:w=1.0:g=-3, equalizer=f=3200:t=q:w=0.9:g=3, deesser=i=0.3,
acompressor=threshold=-22dB:ratio=3:attack=15:release=120:makeup=3
measured EQ-only gain on pink noise (before compressor): 60 Hz -7.0 dB | 100 Hz -2.8 | 280 Hz -2.6 | 1 kHz +0.2 | 3.2 kHz +2.7 | 8 kHz +0.6
```
On the real TTS line (`vo_tag_v1.mp3`) the chain took integrated loudness -19.5 -> -16.0 LUFS (makeup + presence). Voice goes to the centre (mono -> `pan=stereo|c0=c0|c1=c0`).
Bring every voice source to one level first: Veo clips B1a/B1b measure -23.2 / -21.3 LUFS and TTS -18.5 to -20.8 LUFS [M]; match them (per-clip `loudnorm` or gain) BEFORE the duck, or the duck will react differently per line. Different voices for the two characters are already provided by the model; do not EQ the characters to sound alike.

**Ducking.** Source ranges conflict: 6 LU (https://mediastrategylab.com/tools/lufs-loudness-reference), 6-12 dB (CapCut https://www.capcut.com/create/audio-ducking-for-clear-dialogue-in-video), -12 to -18 dB static (Versely), 15-25 dB total reduction with 10-30 ms attack (https://reelmind.ai/blogs/best-decibel-to-set-for-background-music-in-voiceover), ratio 4:1-8:1, attack 1-10 ms (https://infinitecreation.io/tutorial-ducking-music) [all C]. Measured with `sidechaincompress` (bed first input, voice second; tutorial for the wiring https://dankdev.com/Blog/ffmpeg-duck-music-under-voice [C]) on the Acme bed + TTS voice, averaged over a 3.5 s phrase [M]:

| Settings (attack 10-20 ms, release 300-400 ms) | Average duck during speech | After speech (0.6-1.6 s) |
|---|---|---|
| threshold 0.02, ratio 6 | 4.9 dB | 0 dB (recovered) |
| threshold 0.01, ratio 20 | 5.9 | 0 |
| **threshold 0.004, ratio 20, attack 10, release 350** | **7.6** | 0 |
| threshold 0.002, ratio 20 | 8.4 | 0 |
| same + sidechain key boosted +12 dB | 9.1 | 0 |
Takeaway: depth saturates at ~8-9 dB average because the filter's ratio caps at 20 and the voice's level is finite; so **static bed -3 dB + duck (threshold 0.004, ratio 20) gave the 11 LU voice/bed gap** (stems: voice -12.7, bed -23.7 LUFS over the dialogue window; SFX bus -52 LUFS there because no SFX are placed in it). If you need deeper, lower the bed's static gain, do not chase the compressor.

**SFX level.** Kit files are peak-normalised (risers -2, whooshes -3, hits -1.5, tick/glitch -4, swish -6 dBFS) so they are LOUD; in the test mix they ran at: riser -10/-9 dB, sub-drop impact -4/-3, short hit -9, whoosh -9, glitch -10, swish -12, tick -12, room tone +6 dB (all relative to file level) [M]. Result integrated -14.18 LUFS before loudnorm, +0.13 dBTP before limiting, so the limiter has to work: keep an eye on the hit-vs-voice ratio, not only the final number.

**Final pass (executed [M]):** two-pass `loudnorm=I=-14:TP=-2:LRA=11` with measured values and `linear=true`, then `alimiter=limit=0.794:level=disabled` (-2 dB) -> **-14.2 LUFS, -1.9 dBTP, LRA 3.4 LU**. The full script is `outputs/audio/sfx-kit/example_mix_138bpm.py`.

**Mono and phase.** Voice is mono-centred; keep whooshes decorrelated but check `pan=mono|c0=0.5*c0+0.5*c1` that nothing disappears [UNVERIFIED for the kit whooshes; the room tone has independent L/R noise on purpose].

### 1.6 The local SFX kit (built and measured)

Environment [M]: `sox` is NOT installed, no numpy; ffmpeg 9.0.1 + stdlib Python only. Everything is synthesised with ffmpeg filters (`anoisesrc`, `aevalsrc`, `asendcmd`+`bandpass`, `acrusher`, `amultiply`, `asoftclip`...), so it is original (no sample licences). Build: `python3 outputs/audio/sfx-kit/build_sfx_kit.py`. 48 kHz stereo pcm_s24le, 138 BPM-locked names where relevant. Table from the README (durations by ffprobe):

| File | s | What |
|---|---|---|
| `riser_1bar_138.wav` | 1.739 | noise sweep 300 Hz -> 9 kHz + D3 -> D5 chirp; ENDS on the beat |
| `riser_2bar_138.wav` | 3.478 | same, 2 bars (250 Hz -> 10 kHz) |
| `downlifter_1bar_138.wav` | 1.739 | falling pink-noise sweep 7 kHz -> 250 Hz |
| `whoosh_fast_0p5.wav` | 0.500 | peak at 0.185 s, pans L -> R |
| `whoosh_slow_1p2.wav` | 1.200 | heavy, peak 0.54 s, pans R -> L |
| `impact_sub_drop_138.wav` | 2.400 | 110 -> 36.7 Hz (D1) sub + 90->260 Hz thump + 1.2-7 kHz crack + brown tail, tanh-saturated |
| `impact_hit_short.wav` | 0.600 | per-cut accent |
| `tick.wav` | 0.080 | 2.4 kHz click |
| `glitch.wav` | 0.400 | D-minor semitone walk, 40 Hz gate, 6-bit crush, R channel +7 ms |
| `swish_paper.wav` | 0.450 | 1.8-9 kHz noise x flutter |
| `swish_fabric.wav` | 0.600 | 250 Hz-3.5 kHz, soft attack |
| `room_tone_4s_loop.wav` | 4.000 | brown <400 Hz + pink hiss, -47 dBFS RMS, seamless |

**Core recipes (these are the commands/filters actually executed):**
```bash
# RISER (1 bar = 4*60/138 = 1.7391 s). asendcmd rewrites the bandpass centre every 10-20 ms, volume ramps t^2.2, last sample = loudest
asendcmd=f=cmds.txt,bandpass@sw=f=300:width_type=q:w=1.2,volume='pow(t/1.7391,2.2)':eval=frame
#   cmds.txt lines:  "<t> bandpass@sw frequency <300*(9000/300)^(t/T)>;"   (python generated, 20 ms steps)
# + tonal chirp (exponential sweep D3->D5, phase = 2*pi*f0*T/ln(r)*(r^(t/T)-1)), mixed 0.28 under the noise:
aevalsrc='0.28*pow(t/T,1.6)*sin(2*PI*146.83*T/log(4)*(pow(4,t/T)-1))|...(+0.6 rad on R)':s=48000
# WHOOSH: bell envelope sin(pi*x^k)^2 (k=ln0.5/ln(peak_pos)) drives bandpass centre AND volume; pan by aeval:
aeval='val(0)*cos(PI/2*t/T)*1.4|val(1)*sin(PI/2*t/T)*1.4':c=stereo        # L->R
# IMPACT: sub  0.55*exp(-t/0.7)*sin(2*pi*(36.71*t+(110-36.71)*0.12*(1-exp(-t/0.12))))   (pitch drop 110 -> 36.7 Hz, tau 0.12 s)
#         thump 1.0*exp(-t/0.11)*sin(2*pi*(90*t+170*0.05*(1-exp(-t/0.05))))             (90 -> 260 Hz: what a phone plays)
#         crack white noise highpass 1.2k lowpass 7k * exp(-t/0.035)
#         tail  brown noise lowpass 1.8k * -22 dB * exp(-t/0.75)  ->  amix normalize=0, asoftclip=type=tanh:param=2.2
# TICK:  0.9*exp(-t/0.012)*sin(2*pi*2400*t) + highpass 3k noise * exp(-t/0.003)
# GLITCH: sin(2*pi*293.66*2^(mod(floor(t*33)*7,12)/12)*t) * lt(mod(t*40,1),0.55) * exp(-t/0.3), acrusher=bits=6:mix=1, +7 ms R delay
# SWISH: band-limited noise  x  min(1, (1-d)+d*|lowpassed noise|)  [amultiply]  x  attack/decay envelope
# ROOM TONE LOOP: brown+pink; seam = acrossfade(last 1 s -> first 1 s) placed at file start so wrap-around is continuous
```
**Verification [M]:**
* Riser (noise layer, first test render): spectrogram viewed; band RMS above 6 kHz rises -76 -> -51 -> -33 -> -19 dB across four time slices while the <800 Hz band stays under -43 dB: a true rising sweep. The kit riser adds the tonal chirp on top (its 2-bar spectrogram shows the chirp line rising).
* Whoosh/glitch/swish/impact/2-bar riser spectrograms viewed: whoosh rises and falls (bell), glitch shows 12+ gated pitch-stepped bursts, impact shows the transient + a sustained low band.
* **Impact caveat measured:** `impact_sub_drop_138` RMS -12.1 dB total vs **-21.1 dB above 150 Hz** (9 dB under, i.e. most energy is sub that a phone cannot play); `impact_hit_short` -9.6 vs -14.7 (5 dB under). So **use `impact_hit_short` for cuts and layer it with the sub-drop on reveal/logo**; never rely on the sub-drop alone for a phone-only impact.
* Room tone loop seam: max sample-to-sample step at the wrap point 2,381,312 vs 2,323,200 elsewhere (int32 scale): no click. (My first version used a Haas delay and had an 8.6x step at the seam: fixed by independent L/R noise.)
* Whole-kit levels/durations: `kit_manifest.json` and README in the kit folder.
Not executed: sox-based recipes (sox not installed) = UNVERIFIED; they are omitted.

### 1.7 Sound-off captions strategy

* Reels play with sound by default and Meta's own advice is to use audio, but people also watch muted in public; design for both: legible muted, rewarding with sound https://www.brandrocket.net/resources/your-video-ad-has-to-work-with-the-sound-off-then-it-has-to-work-better-with-it [C], https://www.versely.studio/blog/sound-design-in-ads [C]. TikTok: 93 % sound-on (above) [G]. "85 % of Reels are watched without sound at least once" circulates widely but is a social-post/secondary stat: treat as [C, weak].
* Captions are a second rhythm track: **pop the key word on the beat** with the tick (`tick.wav` at the same absolute time) and **blank/hold the caption at the audio drop** (1.4) so muted viewers get the pause.
* Two-speaker dialogue: white captions, speaker change = position change (not a name tag); payoff word orange (existing karaoke recipe R1 in `ad-script-and-motion-graphics.md`; ASS orange `&H147FFA&`). Max 6 words per card, one card per line (<=1.7 s at the pace of a 2-bar line).
* Safe zones on 1080x1920 (px): Meta Reels ads top 269, bottom 672, sides 65 [G, published by Meta for ads]; TikTok in-feed top 240, bottom 660, left 120, right 300 (measured off TikTok's templates) [C]; Shorts top 288, bottom 672, left 48, right 192 [G]; **universal: x120-780, y288-1248, 660x960, NOT centred (sits 90 px left of centre)** https://shotcraft.video/reference/platform-safe-zones/ https://www.mellow.world/hub/tools/reels-safe-zone . The caption lane must be planned inside that box and away from faces and the garment (section 2.7).

### 1.8 The 15.652 s Acme timeline (dialogue -> reveal -> logo), executed as a test mix [M]

Matches the user's favourite shape (two people in a library, then the back-print reveal) and `docs/ads/01-fire-together-script.md` retimed from 125 BPM/15.36 s to 138 BPM/9 bars.

| Bars | Time (s) | Frames @30 | Picture | Audio |
|---|---|---|---|---|
| 1-2 | 0.000-3.478 | 0-104 | Woman line 1 (OTS or single), eyes at upper third | voice + room tone + bed (-3 dB, ducked ~8 dB); bed enters under the first word |
| 3-5 | 3.478-8.696 | 104-261 | Man's reply (J-cut: his voice 6-8 frames early), then a 1 s listening hold | voice 2; **riser_1bar at 6.957** (end = 8.696); bed dropout **8.261-8.696** |
| 6 | 8.696-10.435 | 261-313 | **Cut at frame 260** to the reveal (hoodie back print motion-graphic) | `impact_sub_drop` at 8.696 + bed returns; swish_fabric at 9.57 |
| 7 | 10.435-12.174 | 313-365 | cut at frame 312 | `impact_hit_short` on 10.435, whoosh peak at 10.435-0.067 s; glitch at 11.304 (print flash) |
| 8 | 12.174-13.913 | 365-417 | cut at frame 364: front/back pair, orange rule | hit + whoosh again; ticks at 12.609/13.043/13.478 (captions); second riser to the logo |
| 9 | 13.913-15.652 | 417-470 | cut at frame 416: wordmark/end card | `impact_sub_drop` + tag "Acme." at 13.953 + bed tail (15.652 end, ends on the bed's last hit) |
Measured: -14.2 LUFS, -1.9 dBTP, LRA 3.4 LU after loudnorm; 15.652 s; stems voice/music/sfx/room measured separately. The test voice was the existing TTS lines (edge-tts was returning HTTP 403 today, see Issues), not real two-person dialogue.
Dialogue-to-bar fit [I]: a Veo clip's first line rarely starts at frame 0 and rarely ends where a bar ends. Trim 3-8 frames of head and tail (the 1-2 frame cut-early rule) and use J-cuts to land line 2's first word within a beat of a bar line; do NOT warp the bed (always cut whole bars locally per the flow-music skill).

---

## 2. Dialogue-scene craft for AI video (Veo 3.x / Omni / Kling / Sora style)

Already covered elsewhere: prompt grammar, colon vs quotes (A/B at 360p), <=10 words/line, voice description pasted unchanged, ingredient-only voice references, phantom subtitles, "no music", camera-move safe set, lighting table, hoodie weight words, print by composite. New material below.

### 2.1 One shot or shot/reverse-shot?

* Two people speaking in ONE generation adds three problems at once: **attribution** (which mouth gets the voice), **turn-taking** (they talk over each other or one freezes), **voice separation** (two similar voices read as one person) https://www.veo3ai.io/blog/veo-3-two-character-dialogue-guide-2026 [C]. For an 8 s two-shot the same source budgets 2-4 short lines total.
* "Use one primary speaker per shot. Multi-person speech increases attribution and timing complexity"; separate shots are "usually safer for an exchange" https://magichour.ai/blog/how-to-prompt-for-speaking-in-veo-3 [C]. Shot-reverse-shot = generate each line as its own clip, **keep the character and setting blocks byte-for-byte identical**, cut in the editor: "each clip only ever had one mouth to sync" (veo3ai).
* **Acme decision [I]:** per-line clips (4 s each, one visible speaker, matches `docs/ads/01` Chloe/Ethan plan and the 4 s Omni cost) because the edit then controls timing against the bar grid, and a failed mouth costs ~7 cr instead of the whole scene. Use a single two-shot only for a silent establishing/reaction beat or when both must be in frame for the joke (then max 2 short lines, <= 8 s, A speaks, B reacts silently).
* If the voice drifts between clips, the usual production fix is a locked voice per character (voice changer on the exported dialogue track) https://www.veo3ai.io/blog/veo-3-two-character-dialogue-guide-2026 [C]; UNVERIFIED here and Google restricts editing people's speech in Omni (existing video-ad-craft 3.2).

### 2.2 "Who speaks when" prompt template (per clip)

Seven-line structure from the Kling-style multi-character guide, adapted https://www.veo3gen.app/blog/kling-30-style-multi-character-dialogue-prompts-in-veo3gen-a-clear-who-speaks-wh [C]: SCENE / CAMERA-COVERAGE / CHARACTER A (name + visual ID + voice) / CHARACTER B / BLOCKING (incl. what the LISTENER does) / DIALOGUE (one line per turn, name-prefixed, no pronouns) / CONTINUITY NOTES. Fixes in that source: swapped speaker -> replace pronouns with names; flat delivery -> "low, clipped, restrained"; missing reactions -> add listener action "listens, swallows"; drift -> continuity line. One variable per re-run.
Google's own phrasing pattern is attribution then speech: `A woman says, ...` and sound is its own section ("Audio: ...") https://deepmind.google/models/veo/prompt-guide/ [G]; Google's Cloud guide's colon-no-quotes rule stays the default (video-ad-craft 2.4, A/B pending).
**Clip prompt skeleton (Acme, UNVERIFIED: no credits spent). Names are from `docs/ads/01`; swap freely:**
```
Camera: eye-level over-the-shoulder, handheld with subtle micro-jitter, 50 mm, shallow depth of field. The near shoulder (Ethan's black hoodie) is soft in the
foreground-left; the far face (Chloe) is sharp and looks just left of the lens toward his shoulder, never into the camera. In a single unbroken scene.
Scene: university library at night, rows of shelves out of focus, one green banker's lamp as the key light, a single warm orange practical far behind her, hushed room tone.
Chloe: 22-year-old woman, blonde, hair tucked behind one ear, plain black hoodie, matte skin with visible pores, natural flyaway hairs. Voice: quiet, amused, close-mic'd library whisper-speech.
Ethan: 22-year-old tall man, short brown hair, plain black hoodie, listening, still.
Blocking: Chloe leans in over an open book, one hand resting flat on the page; Ethan stays still, only his eyes move.
Dialogue: Chloe: Wait. I was about to say that.   [delivery: half-laughs mid-sentence, then a short pause]
Continuity: keep the hoodie cut, colour and chest wordmark position identical to the reference; no text on the shelves; hands stay on the table.
Audio: soft room tone, a page turning once, no music. A clean frame with no text.
```
Reverse clip: same blocks, swap near/far, Ethan speaks, Chloe's shoulder soft in the foreground **on the same side of the 180-degree line** (2.4).

### 2.3 Pacing of lines (natural, and music-friendly)

* One sentence per clip, paced for **3-6 s of speaking**, clean audio instruction https://skywork.ai/blog/ai-video/how-to-prompt-lip-synced-dialogue-google-veo-3 [C, snippet]; under 8 s per clip, one line at a time https://eastondev.com/blog/en/posts/ai/20251207-veo3-audio-generation-guide/ [C, snippet]. Existing docs say <=10 words. Acme: **<=6 words in a 4 s clip, finished by ~2.8 s, then a held reaction** (docs/ads/01).
* Real conversation breathes: a beat of silence before a hard line, a quick overlap when eager; a metronome pace reads artificial however good the lip-sync (veo3ai). Write the pause into the prompt ("a short pause, then", "cutting in fast").
* **Bar-lengths [I]:** at 138 BPM a bar = 1.739 s. A 6-word line at a calm pace runs ~2-2.5 s: give line 1 two bars (3.478 s) including the lead-in; reply = one to two bars; reaction hold = the last half-bar before the riser. Do not time words to beats: only start/end of lines to bar lines, and let the J-cut fix the rest.
* Whisper register: a library justifies low voices, which also keeps the voice mix from being shouty against the bed.

### 2.4 Camera, eyelines, coverage

* Handheld + eye-level + shallow DoF read as real; one primary move; vague camera cues yield near-static (video-ad-craft 5.2). 35 mm natural, 50 mm intimate, 85 mm compresses [C, same doc]. For dialogue use **50 mm eye-level OTS**; 16 mm in a library = distorted faces in a 9:16 close-up [I].
* **OTS grammar:** camera beside one body looking past a soft near shoulder at the far face; the far person looks toward that shoulder, never into the lens; the 180-degree line is the axis between the two bodies; the reverse swaps who is near but stays on the same side so screen direction does not flip; match shoulder size, head size and eyeline on the reverse https://melies.co/cinematic-techniques/framing/over-the-shoulder-frame [C]. Prompt wording from that page: "near shoulder soft in foreground, the far face sharp, looking toward the near shoulder, 180-line held."
* Practical for Acme [I]: Chloe's clip looks **just left of the lens**, Ethan's reverse looks **just right of the lens** (that is already the eyeline note in `docs/ads/01`). In a cut, show Ethan's soft shoulder/hoodie on the OPPOSITE edge from Chloe's.
* Do not cut to whoever speaks on every line (ping-pong); the reaction often matters more, so hold on the listener while the line continues (L-cut) https://flashboards.yaroflasher.com/learn/editing/editing-dialogue-scenes/ [C]. In 15 s: line 1 on speaker, reply starts under her reaction (J-cut), final 1 s on the listener.
* Don't use the selfie/arm-length framing for dialogue clips with overlays (see 2.7: the existing B1a is exactly that).

### 2.5 AI tells and how to avoid them (new items only)

| Tell | Cause | Fix | Source |
|---|---|---|---|
| Waxy/plastic skin | generic "beautiful woman" prompts -> smooth symmetric average | write a character profile: age, 3-4 fixed face anchors, hair behaviour, skin "visible pores, subtle blemishes, uneven tone", wear on clothes; **fix the still first**: "if the skin looks waxy in the static image no prompt fixes it in generation" | https://scriptlyai.app/blog/make-realistic-ai-character , https://hailuoai.video/pages/knowledge/mastering-skin-tones-cinematic-ai-video [C] |
| Over-smiling / uncanny expression | extreme or contradictory expression cues melt the face mesh | neutral reference frame; **one primary emotion + one secondary micro-expression** ("subtle smile with a slight squint, steady gaze"); never stack contradictory cues | https://hailuoai.video/pages/knowledge/micro-expressions-realistic-human-ai-video [C] |
| Mouth glitches / teeth | covered/turned/tiny mouth, fast speech, long lines | one visible speaker; mouth facing camera 3/4 or better, not tiny in frame; short line; name delivery separately; transcribe the output and compare to the intended words | https://magichour.ai/blog/how-to-prompt-for-speaking-in-veo-3 [C] |
| Floaty hands | fine manipulation and re-grips | keep hands resting (flat on a book, on a table, in a pocket), one simple action, do not ask for clasps or two people touching; describe the exact hand action if needed | https://www.elser.ai/blog/why-ai-video-generators-mess-up-hands-and-faces , video-ad-craft 5.1 [C] |
| Identity drift between clips | no anchor | reference images (up to 3 for a person/character/product on Veo 3.1 API), identical blocks, continuity notes | https://magichour.ai/blog/how-to-prompt-for-speaking-in-veo-3 , https://www.veo3gen.app/blog/kling-30-style-multi-character-dialogue-prompts-in-veo3gen-a-clear-who-speaks-wh [C] |
| Direct-to-lens gaze in an OTS | eyeline unspecified | state "looking toward the near shoulder, never into the camera" | melies.co |
| Same-person-twice (similar voices) | two similar voice descriptions | write two clearly different voices (pitch, pace, texture) | veo3ai |
| Perfect symmetry / smooth motion | model default | ask for one imperfect beat ("half-laughs", "camera bumps"), 2-3 takes and choose; first generation is rarely final; Veo yields near-identical results for the same prompt, so change the seed for glitches, change the prompt for variety | https://replicate.com/blog/using-and-prompting-veo-3 [C]; video-ad-craft 5.5 |
**Dialogue QA before accepting a take (all [C] magichour):** transcribe and diff the words; confirm the right face speaks and no extra voice appears; watch lips/teeth/jaw/eyes/hands at full size; listen on headphones AND a phone speaker for clipping, abrupt ambience, masked speech.
Library-specific [I]: rows of book spines produce garbled micro-text and repeating patterns: keep shelves out of focus (shallow DoF), no signage in the prompt, no readable book titles; and keep the one orange practical small and distant so the frame stays black/white/orange.

### 2.6 Wardrobe consistency and keeping the black hoodie + print readable

* **Dark on dark disappears**: an object is seen by a brightness step across its boundary; a black garment against a dark background has none, and front light cannot fix it because the silhouette is exactly where light grazes least. The fix is separation by **rim/edge light** or by a lighter background https://www.style3d.ai/blog/black-background-photo-editing-dark-garments/ [C]. For the library: put the man's black hoodie against pale wood shelves, a lit window or a warm wall (value step), add "a thin rim of warm window light separating the black fabric from the background" (video-ad-craft 5.4 has the e-com/cyc version).
* Keep the chest wordmark large and flat to camera: objects under ~5 % of frame get soft (video-ad-craft 5.1). Avoid straps, hair, arms or a hand crossing the print; hood down; no backpack. **The back print must NOT appear in the dialogue scene** (or only as a deliberate silhouette from behind) so the later motion-graphic reveal is the first time the viewer reads it.
* In the existing B1a clip the front wordmark is readable (left chest, ~140 px wide at 1080 width); but it sits at x~690-830, y~1200: at the corner of the universal safe box (2.7). Reposition in the prompt: wordmark on the wearer's left chest, subject framed so the chest is at y 900-1100.
* Keep one wardrobe block verbatim in every prompt + the same hoodie reference image attached (cut, colour, print scale, position; docs/ads/01 pin clause). Veo gives near-identical outfits for near-identical prompts (Replicate [C]), which is useful: don't re-word the wardrobe line between clips.
* Real print, real artwork: composite the reveal from the packshot (existing rule); the model never draws the print.

### 2.7 Framing so overlays never land on faces or the garment

Measured on the real B1a clip (720x1280 selfie, scaled to 1080x1920 with the universal box x120-780 / y288-1248 drawn with `drawbox`) [M]:
```
ffmpeg -ss 2.2 -i B1a_dialogue_colon_v1.mp4 -frames:v 1 -vf "scale=1080:1920,drawbox=x=120:y=288:w=660:h=960:color=lime@0.9:t=5,drawbox=x=65:y=269:w=950:h=979:color=yellow@0.9:t=3" safe_b1a.png
```
Result: face spans about y 260-800 (upper lane, i.e. exactly where a top caption would go), the hoodie fills the lower half, and the chest wordmark at about x 690-830, y 1200 touches the bottom-right corner of the green box and falls inside TikTok's 300 px right rail (x>780). So in this framing a caption has no free zone, and the UI will cover the logo on TikTok. Fix in the prompt:
* **Medium shot, not selfie**: "waist-up, camera 1.5 m away, subject slightly left of centre, 20-25 % empty headroom above the head, eyes at the upper third (about y 640 of 1920)". Headroom above the head (y 288-560) becomes caption lane A. A second lane B is the negative space on the side opposite the subject (blurred shelves) between y 700-1100.
* Compose into the 660x960 box: face centre ~x 450, not 540 (TikTok right rail). Keep chest wordmark inside y 700-1150 and x < 760.
* Bottom 35 % (y>1248) is platform UI: let hands, hem and desk live there, never text or print.
* In OTS dialogue the near shoulder (soft, dark) fills one edge: put the caption lane on the far/open side, never on the near hoodie shoulder.
* Pre-flight (free): contact sheet of the clip at 1 fps with the box drawn; reject takes where eyes/mouth/print cross a caption lane. Do this at 360p drafts before spending quality credits (video-ad-craft 3.6).
* After the composite: re-run the same `drawbox` on the final render's frames at each caption start time to confirm.

### 2.8 Acme library scene: three-shot plan (UNVERIFIED, needs credits and the user's OK)

| Shot | Bars/time | Content | Notes |
|---|---|---|---|
| L1 | bars 1-2, 0-3.478 s | OTS (Ethan near, soft; Chloe far, sharp): Chloe line | <=6 words, finishes by ~2.8 s; trim 3-6 frames head |
| L2 | bars 3-4, 3.478-6.957 s | reverse OTS (Chloe near, Ethan far): Ethan's reply | his voice starts 6-8 frames before the cut (J-cut); line <= 6 words |
| L3 | bar 5, 6.957-8.696 | listening reaction (single, 50 mm) or slow 3 % punch-in on L2's tail | riser starts at 6.957, music dropout 8.261 |
Then reveal at 8.696 (section 1.8). Cost framing: ~7 cr per Omni 4 s with ingredients (docs/ads/01 plan); budget 4-5 takes for dialogue clips (video-ad-craft 7.7).

---

## 3. Acme sound + edit checklist (15 items)

1. **Grid first.** Measure the bed's BPM and first kick; cut whole bars (9 bars = 15.652 s @138); keep the raw file; render at 30 fps; run `beat_cutlist.py <bpm> 30 <t0> 1`.
2. **Never accumulate frame rounding**: every cut and SFX time from absolute beat time.
3. **Picture cut 1 frame before the beat; impacts and ticks on the beat; whoosh peak ~2 frames before; riser ends exactly on the beat.** (ITU +45/-125 ms window.)
4. **Dialogue is cut on words/blinks, montage on the beat**; J-cut the reply 6-8 frames, hold the last second on the listener.
5. **Open at full speed with voice + room tone, never silence or a music fade-in.**
6. **One silence only**: 1 beat (13 frames) before the reveal; music+SFX out, room tone and riser in, impact on the downbeat; hold the caption the same moment.
7. **Layer stack**: voice > bed > SFX > foley > continuous room tone (own file across all joins); Veo's music OFF in every clip.
8. **One accent per cut**, one glitch per ad, sub-drop only on reveal and logo; always layer `impact_hit_short` under the sub-drop (phone caveat).
9. **Normalise all voice sources to one level before ducking** (Veo -21/-23, TTS -19 LUFS raw), then the voice chain: HPF 90, -3 dB @280, +3 dB @3.2 kHz, de-ess, compress 3:1.
10. **Bed -3 dB static + sidechain (threshold 0.004, ratio 20, attack 10, release 350)**; target 10-12 LU voice over bed while speaking; check in the phone-band simulation.
11. **Master -14 LUFS / -2 dBTP**, two-pass loudnorm + limiter, then measure again AFTER the final AAC >=192k encode (overshoot 0.5-1.4 dB at 192k, +3 dB at 96k).
12. **Dual-track design**: legible muted (captions on the beat, one card per line) and rewarding with sound; blank the caption at the audio drop.
13. **Frame for overlays**: medium shot, 20-25 % headroom, eyes upper third, subject left of centre, wordmark y 700-1150 / x<760, nothing important below y 1248 or right of x 780; verify with the `drawbox` contact sheet before spending quality credits.
14. **Dialogue clips**: one visible speaker, <=6 words, byte-identical character/wardrobe blocks, eyeline toward the near shoulder, same 180-line side on the reverse; transcribe + watch mouth/hands full-size + listen on a phone before accepting a take; 4-5 takes budget.
15. **Hoodie readability**: black hoodie against a lighter/rim-lit background, chest wordmark large and unobstructed, no back print in the scene (reveal stays fresh), real artwork composited; test the sound logo and the whole mix through the phone-band filter and a real phone at 50 % volume.

---

## Issues found while testing (for the owner)

* **edge-tts returned HTTP 403** (`wss://speech.platform.bing.com/...`, Sec-MS-GEC token) on 2026-10-17 when I tried three new lines; the pipeline's TTS step will fail until the package is updated/the service accepts the request again. I used the existing `vo_*.mp3` files for all measurements and did not touch the shared venv. (Check `edge-tts` version and update in the venv that owns it.)
* `sox` is not installed and numpy is missing in the default python: the kit needs only ffmpeg/ffprobe + stdlib.
* `sidechaincompress` caps at ratio 20; depth saturates at ~8-9 dB average with the TTS level; plan on static bed gain (section 1.5).
* ffmpeg native AAC overshoots true peak by 0.5-1.4 dB at 192k (up to +3 dB at 96k): deliver at -2 dBTP.
* Not executed / UNVERIFIED: any Veo/Omni prompt in section 2 (no credits), locked-voice voice-changer step, Meta's lessons-page quotes (snippet only), real-phone playback, mono-fold of the whooshes, a full kick-grid fit of the bed.

## Sources (opened or returned by search; tag = reliability)

Sound/edit: https://www.versely.studio/blog/sound-design-in-ads · https://www.versely.studio/blog/silence-as-an-edit-beat-in-short-form · https://zellahq.com/blog/how-to-sync-video-cuts-to-the-beat-of-a-song/ · https://www.toolsforfilm.com/blog/bpm-and-picture-editors-guide · https://sonilo.com/sound-effects/how-to-sync-sound-effects-to-video · https://reverseaudioapp.com/blog/how-to-make-a-riser · https://veena.studio/blog/transitions-and-fills · https://valmera.io/glossary/j-cut-and-l-cut · https://flashboards.yaroflasher.com/learn/editing/editing-dialogue-scenes/ · https://soundout.com/learn/what-is-a-sonic-logo · https://cutscore.io/blog/loudness-for-instagram-reels · https://mediastrategylab.com/tools/lufs-loudness-reference · https://onloopin.com/blog/mastering-for-instagram-and-reels · https://speakers.cloud/vertical-video-sound-design-making-dialog-and-sfx-pop-on-pho · https://audiogearhub.com/mix-audio-for-social-media/ · https://dankdev.com/Blog/ffmpeg-duck-music-under-voice · https://www.capcut.com/create/audio-ducking-for-clear-dialogue-in-video · https://reelmind.ai/blogs/best-decibel-to-set-for-background-music-in-voiceover · https://infinitecreation.io/tutorial-ducking-music · https://ads.tiktok.com/business/creativecenter/quicktok/online/Power_Creative_Elements/pc/en [G] · https://www.facebook.com/business/ads/facebook-instagram-reels-ads [G, snippet] · https://www.facebook.com/business/learn/lessons/create-fb-ig-reels/ [G, snippet] · https://shotcraft.video/reference/platform-safe-zones/ · https://www.mellow.world/hub/tools/reels-safe-zone · https://nab.org/xert/scitech/2009/TVTechCheck/TV100509.asp (ITU-R BT.1359 numbers) · https://tech.ebu.ch/docs/r/r037.pdf · https://www.brandrocket.net/resources/your-video-ad-has-to-work-with-the-sound-off-then-it-has-to-work-better-with-it

Dialogue/AI: https://www.veo3ai.io/blog/veo-3-two-character-dialogue-guide-2026 · https://magichour.ai/blog/how-to-prompt-for-speaking-in-veo-3 · https://www.veo3gen.app/blog/kling-30-style-multi-character-dialogue-prompts-in-veo3gen-a-clear-who-speaks-wh · https://skywork.ai/blog/ai-video/how-to-prompt-lip-synced-dialogue-google-veo-3 (snippet) · https://eastondev.com/blog/en/posts/ai/20251207-veo3-audio-generation-guide/ (snippet) · https://deepmind.google/models/veo/prompt-guide/ [G] · https://replicate.com/blog/using-and-prompting-veo-3 · https://melies.co/cinematic-techniques/framing/over-the-shoulder-frame · https://hailuoai.video/pages/knowledge/micro-expressions-realistic-human-ai-video · https://hailuoai.video/pages/knowledge/mastering-skin-tones-cinematic-ai-video (snippet) · https://scriptlyai.app/blog/make-realistic-ai-character · https://www.elser.ai/blog/why-ai-video-generators-mess-up-hands-and-faces · https://www.style3d.ai/blog/black-background-photo-editing-dark-garments/

## Files produced

* This doc.
* `outputs/audio/sfx-kit/`: 12 WAVs (above), `README.md`, `kit_manifest.json`, `build_sfx_kit.py`, `beat_cutlist.py`, `example_mix_138bpm.py`.
* Scratch test files (not part of the repo deliverable): `cache/scratch/sfx/` (spectrogram PNGs, mix_final.wav, stems, AAC encodes, safe_b1a.png).
