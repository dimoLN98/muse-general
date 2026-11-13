import { chromium } from 'playwright';
import { readFlowCredits } from './src/accounts/flow-balance.js';
const b = await chromium.connectOverCDP('http://127.0.0.1:9334');
let p=null; for (const c of b.contexts()) for (const q of c.pages()) if (q.url().includes('flow.google.com')) p=q;
console.log('BALANCE', await readFlowCredits(p));
process.exit(0);
