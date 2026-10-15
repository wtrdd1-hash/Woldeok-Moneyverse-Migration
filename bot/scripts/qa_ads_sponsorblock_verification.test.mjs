import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./qa_ads_sponsorblock_verification.mjs', import.meta.url));
const invoke = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', timeout: 4000 });

test('QA entrypoint has valid ESM syntax', () => {
  const result = spawnSync(process.execPath, ['--check', script], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});

test('offline diagnostics cannot be misreported as SponsorBlock or ad bypass success', () => {
  const result = invoke('--offline');
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stdout, /SKIP/);
  assert.match(result.stdout, /NOT VERIFIED/);
  assert.doesNotMatch(result.stdout, /100% Bypassed|100% sliced|Direct googlevideo stream has 0/);
});

test('invalid video IDs fail closed before invoking services or network', () => {
  const result = invoke('--video-id', '../../something');
  assert.equal(result.status, 2, result.stderr);
  assert.match(result.stderr, /Invalid video ID/);
});

test('QA source neither trusts machine-specific yt-dlp paths nor claims proof of bypass', () => {
  const source = readFileSync(script, 'utf8');
  assert.doesNotMatch(source, /\/home\/debian\/Woldeok-Moneyverse-Migration/);
  assert.doesNotMatch(source, /100% Bypassed|100% sliced out/);
  assert.doesNotMatch(source, /--download|ffmpeg\s+-i\s+-/);
});
