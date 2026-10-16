#!/usr/bin/env node
// Read-only QA; provider metadata cannot prove ad removal or successful voice playback.
import { spawnSync } from 'node:child_process';

const categories = ['sponsor', 'music_offtopic', 'selfpromo', 'intro', 'outro'];
const args = process.argv.slice(2);
const offline = args.includes('--offline');
let videoId = '09R8_2nJtjg';
const optionIndex = args.indexOf('--video-id');
if (optionIndex !== -1) videoId = args[optionIndex + 1] ?? '';
const allowedArgs = args.filter((arg, i) => arg === '--offline' || arg === '--video-id' || i === optionIndex + 1);
if (allowedArgs.length !== args.length || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
  console.error('Invalid video ID or unknown argument. Expected an 11-character video ID.');
  process.exitCode = 2;
} else {
  const checks = [];
  if (offline) {
    checks.push({ name: 'SponsorBlock provider', status: 'SKIP', detail: 'offline mode' });
    checks.push({ name: 'Bot daemon', status: 'SKIP', detail: 'offline mode' });
  } else {
    try {
      const url = new URL('https://sponsor.ajay.app/api/skipSegments');
      url.searchParams.set('videoID', videoId);
      url.searchParams.set('categories', JSON.stringify(categories));
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.status === 404) {
        checks.push({ name: 'SponsorBlock provider', status: 'SKIP', detail: 'no community segment record' });
      } else if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      } else {
        const bytes = await res.text();
        if (bytes.length > 262144) throw new Error('provider payload too large');
        const data = JSON.parse(bytes);
        if (!Array.isArray(data)) throw new Error('invalid provider response');
        const accepted = data.filter((entry) =>
          entry?.actionType === 'skip' &&
          categories.includes(entry.category) &&
          Array.isArray(entry.segment) &&
          entry.segment.length === 2 &&
          entry.segment.every((num) => typeof num === 'number' && Number.isFinite(num)) &&
          entry.segment[0] >= 0 &&
          entry.segment[1] > entry.segment[0]);
        checks.push({
          name: 'SponsorBlock provider',
          status: accepted.length ? 'PASS' : 'SKIP',
          detail: accepted.length + ' eligible community segment(s); live playback not measured',
        });
      }
    } catch (error) {
      checks.push({ name: 'SponsorBlock provider', status: 'FAIL', detail: error.message });
    }
    const daemon = spawnSync('systemctl', ['is-active', 'moneyverse-discord-bot.service'], {
      encoding: 'utf8', timeout: 4000, maxBuffer: 4096,
    });
    const active = daemon.status === 0 && daemon.stdout.trim() === 'active';
    checks.push({
      name: 'Bot daemon', status: active ? 'PASS' : 'FAIL',
      detail: daemon.error?.message ?? (daemon.stdout?.trim() || 'unknown'),
    });
  }

  console.log('Discord Music QA Report');
  for (const check of checks) console.log('[' + check.status + '] ' + check.name + ': ' + check.detail);
  console.log('[NOT VERIFIED] Ad removal, actual audio segment slicing and voice playback need an independent live test.');
  process.exitCode = checks.some((c) => c.status === 'FAIL')
    ? 1 : checks.some((c) => c.status === 'SKIP') ? 2 : 0;
}
