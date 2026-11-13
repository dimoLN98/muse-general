import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('production launch scripts contain no real-profile reuse, arbitrary kill, or /tmp profile logic', () => {
  const text = ['scripts/start-browser.sh', 'scripts/start-mcp.sh', 'src/browser/connect.js', 'src/browser/launch-profile.js'].map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(text, /\.config\/google-chrome|Profile 3|fuser\s+-k|chrome-kiara-cdp|fs\.cpSync/);
});
