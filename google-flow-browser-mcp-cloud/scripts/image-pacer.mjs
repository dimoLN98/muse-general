#!/usr/bin/env node
/**
 * image-pacer.mjs — Flow Nano Banana image-generation log + light guard.
 *
 * REVISED 2026-11-13 (the user's correction): the first version was far too strict
 * (180 s minimum, 4/hour, 2 h cooldown). the user is right — that kills speed, and
 * other agents work much faster without ever hitting the flag, so raw speed is
 * NOT the whole story. The hard limits are REMOVED. This script now only:
 *  - logs every image generation (success/refused) for diagnosis, and
 *  - warns if generations are fired absurdly fast (same prompt re-submitted
 *    inside ~40 s is the one pattern every source agrees earns the warning;
 *    spread 3 attempts over ~3 min instead).
 *
 * The real investigation is in docs/flow-image-rate-limit.md — the likely
 * causes are the browser's automation signals / IP / account trust, not
 * speed alone. Do not re-add hard caps without the user's approval.
 *
 * Usage:
 *   node scripts/image-pacer.mjs check     # always exits 0 now; prints a warning if too fast
 *   node scripts/image-pacer.mjs record success|refused [note]
 *   node scripts/image-pacer.mjs status
 * State: state/image-pacer.json
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STATE = join(ROOT, "state", "image-pacer.json");

const TOO_FAST_S = 40; // re-submitting inside ~40 s is the documented tripwire

function load() {
  if (!existsSync(STATE)) return { attempts: [], consecutiveRefusals: 0 };
  try { return JSON.parse(readFileSync(STATE, "utf8")); } catch { return { attempts: [], consecutiveRefusals: 0 }; }
}
function save(s) {
  mkdirSync(dirname(STATE), { recursive: true });
  writeFileSync(STATE, JSON.stringify(s, null, 2) + "\n");
}
function check() {
  const s = load();
  const now = Date.now();
  const last = s.attempts[s.attempts.length - 1];
  if (last) {
    const gap = Math.round((now - last.ts) / 1000);
    if (gap < TOO_FAST_S) {
      console.log(`WARNING — only ${gap}s since the last image generation. Do NOT re-submit the same prompt this fast; spread attempts over ~3 min. (Advisory only — no block.)`);
      return 0;
    }
  }
  console.log("OK — go. (No hard limits. Keep a natural pace; never re-submit the same prompt inside ~40 s.)");
  return 0;
}
function record(outcome, note = "") {
  const s = load();
  s.attempts.push({ ts: Date.now(), outcome, note });
  if (outcome === "refused") s.consecutiveRefusals += 1;
  else if (outcome === "success") s.consecutiveRefusals = 0;
  s.attempts = s.attempts.slice(-200);
  save(s);
  console.log(`recorded ${outcome}. consecutive refusals: ${s.consecutiveRefusals}.`);
}

const [cmd, arg, ...rest] = process.argv.slice(2);
if (cmd === "check") process.exit(check());
if (cmd === "record") { record(arg === "refused" ? "refused" : "success", rest.join(" ")); process.exit(0); }
if (cmd === "status") {
  const s = load();
  console.log(JSON.stringify({ ...s, attempts: s.attempts.slice(-10) }, null, 2));
  process.exit(0);
}
console.log("usage: image-pacer.mjs check | record success|refused [note] | status");
process.exit(2);
