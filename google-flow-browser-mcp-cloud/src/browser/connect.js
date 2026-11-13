// Cloud edition stub: there is NO local Chrome in this edition, so there is no
// CDP connection, no Playwright page, and nothing to launch. Browser work runs
// in the already-signed-in cloud browser via the disk task queue
// (src/cloud/cloud-queue.js). Any code that still asks for a live page gets a
// clear error pointing at the queue instead of a confusing Playwright failure.
import { FlowError, ErrorCodes } from '../utils/errors.js';

const CLOUD_ERROR = 'Cloud edition: no local Chrome. Browser work runs in the signed-in cloud browser via the task queue — enqueue it with flow_* tools and execute the assignment there; do not call getPage()/launchOwnedBrowser().';

export function getPage() {
  throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, CLOUD_ERROR);
}

export function getBrowser() { return null; }
export function getContext() { return null; }
export function getOwnedProcess() { return null; }
export function isBrowserConnected() { return false; }
export function setPage() { throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, CLOUD_ERROR); }
export function setContext() { throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, CLOUD_ERROR); }
export function setBrowser() { throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, CLOUD_ERROR); }
export function setConnected() { /* no local connection to track */ }

export async function launchOwnedBrowser() {
  throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, CLOUD_ERROR);
}
export const connectToBrowser = launchOwnedBrowser;
export const launchChromeDirect = launchOwnedBrowser;

export async function closeBrowser() {
  // Nothing local to close. The cloud browser window stays open by design.
  return { status: 'no_local_browser', cloud_browser_window: 'left open' };
}

// Kept so old helpers that import these names still load; they are never used
// in the cloud edition (no local Chrome to proxy or prune).
export const LOCAL_PROXY_URL = null;
export function buildChromeArgs() { throw new FlowError(ErrorCodes.BROWSER_NOT_CONNECTED, CLOUD_ERROR); }
export async function ensureLocalProxy() { return false; }
export function pruneBrowserMetrics() { return 0; }
export async function assertPortAvailable() { return true; }
export function ensureOwnTmpDir() { return null; }
