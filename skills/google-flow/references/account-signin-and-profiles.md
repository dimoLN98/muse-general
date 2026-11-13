# Google Flow account sign-in, Chrome profiles and probe safety

Depth for the 3-account rotation (order, rule and cost table live in SKILL.md). Read this before opening any window or
running any status/probe on `~/.config/profiles/acme/browser-profiles/google-flow{,-2,-3}`.

## 1. Where a sign-in has to happen

* The MCP launches **only** the rotation profiles. Signing a Google account in anywhere else — a bot's Bot Desktop dock
  browser (`~/.config/profiles/<bot>/bot-desktop/browser-profile`), the user's own Chrome, a scratch profile — writes that
  other profile and changes nothing for `flow_*`; the tools still answer `ACCOUNT_NOT_SIGNED_IN`.
* Bots never type credentials. the user signs in once per profile, in a port-less human-mode window:
  `flow-accounts signin <n> --display :<N>` (it prints the equivalent `google-chrome --test-type --user-data-dir=…`
  command). No `--remote-debugging-port`: Google refuses sign-in in a port-enabled Chrome.
* One window at a time, and name the exact email in the request. Two identical Chrome windows get signed into the wrong
  account and the only symptom is "signed in as <other>, expected <account>" later.
* He closes the window when Flow has loaded; Chrome flushes cookies on normal close and on SIGTERM.

## 2. Launching that window from a the host shell

* Use `terminal(background=true)` for the browser. A foreground `timeout 30 …` kills Chrome when it expires (window
  vanishes mid sign-in), and the terminal tool refuses shell-level backgrounding (`&`, nohup, setsid, disown).
* Set the screen **and its own auth file**: `DISPLAY=:20 XAUTHORITY=~/.config/profiles/mark/bot-desktop/Xauthority`,
  `:21` → acme's Xauthority, `:0` → the user's session with `~/.Xauthority`. Wrong XAUTHORITY = Chrome exits silently.
* Set the session bus (see §3): `DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1000/bus XDG_RUNTIME_DIR=/run/user/1000`.
* Screens are first-come and disappear when that Bot Desktop closes: check `/tmp/.X11-unix` and `pgrep -ax Xvnc` before
  planning around a display. Verify what the user sees by capturing the screen (`DISPLAY=:N XAUTHORITY=… magick import
  -window root /tmp/x.png`) and looking at the image — not by assuming the page loaded.

## 3. The cookie-wipe trap (costs a sign-in every time)

Chrome here stores Google cookies with `os_crypt: portal` (XDG Desktop Portal Secret). A Chrome started on a profile from
a shell whose `DBUS_SESSION_BUS_ADDRESS` is a private/agent bus (gateway shells can carry `unix:path=/tmp/dbus-…`)
cannot decrypt those cookies and **deletes them as corrupt**: `SID`/`__Secure-1PSID` disappear from `Default/Cookies`
while the file stays ~30 KB, and the account is signed out of that profile.

Rules:

* Never launch Chrome on a rotation profile without the user bus.
* `scripts/flow-accounts.mjs` pins it at startup, counts Google cookie rows before/after every live probe and restores a
  snapshot if they hit zero. Keep that guard when editing the script.
* `status` probes a profile even when the cheap cookie hint is negative (the gate hid real state) and waits 45 s for the
  account chip.
* A profile held by another Chrome is skipped, not disturbed; don't attach a second Chrome to a profile that has one.
* Destructive verification is not free: each wipe costs the user a full sign-in, so verify read-only first (§4).

## 4. Proving an account works

1. Read-only, no Chrome: `Default/Preferences` → `account_info[0].email`, and `Default/Cookies` (copy the file plus
   `-wal` into a temp dir, open read-only with `node:sqlite`) → `SID` / `__Secure-1PSID` on `.google.com` and `.google.ca`.
2. One `flow-accounts status` run → `signed in : yes (live)` plus a balance for each account; that also persists
   `state/accounts.json` (active index, balances), which is what the rotator reads.
3. Optional end-to-end: the `flow_accounts` MCP tool should agree with the state file.

Never call an account usable from `account_info` alone, from a screenshot of the dock browser, or from a `/about` page.
`labs.google/fx/tools/flow` rendering the PRO badge and project grid is the real proof; a profile that keeps working
even with no `.google.com` cookie rows is holding the Flow session elsewhere (local storage) — unusual but observed, so
never "fix" it by clearing the profile.

## 5. Repairing a broken profile

Delete and re-create the profile dir (back the old one up under `~/.config/profiles/acme/cache/scratch/` first) and
sign in again. Do not clone a working profile: clones keep cookie rows but read signed out, and they carry the source
profile's history, extensions and preferences into a bot profile.
