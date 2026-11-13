// Drive the flow MCP handlers over the already-running Flow Chrome (CDP 9334).
// usage: node flow_driver.mjs <image|video|accounts|status> <args.json>
import fs from 'node:fs';
import { chromium } from 'playwright';
import { setBrowser, setContext, setPage, setConnected } from './src/browser/connect.js';
import { handleGenerateImage } from './src/tools/generate-image.js';
import { handleGenerateVideo } from './src/tools/generate-video.js';
import { handleDownloadLatest } from './src/tools/download-latest.js';

const cmd = process.argv[2];
const argFile = process.argv[3];
const args = argFile && fs.existsSync(argFile) ? JSON.parse(fs.readFileSync(argFile, 'utf8')) : {};

const browser = await chromium.connectOverCDP('http://127.0.0.1:9334');
const ctx = browser.contexts()[0];
const pages = ctx.pages();
const pg = pages.find((p) => p.url().includes('flow.google.com')) || pages[0];
setBrowser(browser); setContext(ctx); setPage(pg); setConnected(true);
console.log('attached to', pg.url());

try {
  let res;
  if (cmd === 'image') res = await handleGenerateImage(args);
  else if (cmd === 'video') res = await handleGenerateVideo(args);
  else throw new Error('unknown cmd ' + cmd);
  console.log(JSON.stringify(res, null, 2));
} catch (e) {
  console.error('ERROR', e && e.message ? e.message : e);
  process.exitCode = 1;
}
process.exit(process.exitCode || 0);
