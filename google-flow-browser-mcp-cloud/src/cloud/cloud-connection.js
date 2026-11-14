// Cloud edition: the verified-account record for the signed-in cloud browser.
// The original server proved identity by reading the account chip off a live local
// Chrome page. This edition has no local Chrome, so identity is proven by the
// agent in the cloud browser (flow_connect / flow_account_check tasks) and the
// result is recorded here. Browser tools may still enqueue while unverified;
// their assignments then start with "verify signed in as <active account> first".
import fs from 'node:fs';
import path from 'node:path';
import { getFlowHome } from '../utils/config.js';

const filePath = () => path.join(getFlowHome(), 'state', 'cloud-connection.json');

export function readCloudConnection() {
  try {
    const raw = JSON.parse(fs.readFileSync(filePath(), 'utf-8'));
    return {
      verified: raw.verified === true,
      account: typeof raw.account === 'string' ? raw.account : null,
      verified_at: raw.verified_at || null,
      method: raw.method || null,
      balance: typeof raw.balance === 'number' ? raw.balance : null,
    };
  } catch {
    return { verified: false, account: null, verified_at: null, method: null, balance: null };
  }
}

export function writeCloudConnection({ verified, account, method, balance } = {}) {
  const prev = readCloudConnection();
  const next = {
    verified: verified === true,
    account: account ?? prev.account,
    verified_at: verified === true ? new Date().toISOString() : prev.verified_at,
    method: method ?? prev.method,
    balance: typeof balance === 'number' ? balance : prev.balance,
    driver: 'cloud',
  };
  fs.mkdirSync(path.dirname(filePath()), { recursive: true });
  fs.writeFileSync(filePath(), JSON.stringify(next, null, 2));
  return next;
}

export function clearCloudConnection() {
  try { fs.rmSync(filePath(), { force: true }); } catch { /* already gone */ }
  return true;
}
