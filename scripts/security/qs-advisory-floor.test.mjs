import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const minimum = [6, 16, 1];

function meetsFloor(value) {
  const match = /^(?:>=)?(\d+)\.(\d+)\.(\d+)$/.exec(value);
  assert.ok(match, `Expected a stable qs version or lower-bound override: ${value}`);
  const version = match.slice(1).map(Number);
  for (let i = 0; i < 3; i++) {
    if (version[i] > minimum[i]) return true;
    if (version[i] < minimum[i]) return false;
  }
  return true;
}

test('qs override meets GHSA-6pq8-jhm2-2vcw patched floor', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  assert.ok(meetsFloor(manifest.pnpm.overrides.qs), 'qs override must require >=6.16.1');
});

test('qs lockfile resolutions meet GHSA-6pq8-jhm2-2vcw patched floor', () => {
  const lock = readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8');
  const versions = [...lock.matchAll(/^  qs@(\d+\.\d+\.\d+):/gm)].map((m) => m[1]);
  assert.ok(versions.length > 0, 'lockfile must contain a qs resolution');
  for (const version of versions) assert.ok(meetsFloor(version), `vulnerable qs ${version} in lockfile`);
});
