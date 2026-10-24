import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const minimum = [4, 6, 6];

function stableVersion(value) {
  const match = /^(?:\^|~)?(\d+)\.(\d+)\.(\d+)$/.exec(value);
  assert.ok(match, `Expected a stable semver, received: ${value}`);
  return match.slice(1).map(Number);
}

function meetsFloor(value) {
  const version = stableVersion(value);
  return version[0] > minimum[0] ||
    (version[0] === minimum[0] && (version[1] > minimum[1] ||
      (version[1] === minimum[1] && version[2] >= minimum[2])));
}

test('backend Zod dependency declares GHSA-mrhx-c7xc-m3w5 patched floor', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'backend/package.json'), 'utf8'));
  assert.ok(meetsFloor(manifest.dependencies.zod), 'backend must require Zod >=4.6.6');
});

test('backend lockfile pins Zod at GHSA-mrhx-c7xc-m3w5 patched floor', () => {
  const lock = readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8');
  const backendImporter = lock.split('\n  backend:\n')[1]?.split(/\n  (?=\S)/)[0];
  assert.ok(backendImporter, 'backend importer must exist');
  const zod = backendImporter.match(/^      zod:\n        specifier: (\S+)\n        version: (\S+)/m);
  assert.ok(zod, 'backend zod lockfile entry must exist');
  assert.ok(meetsFloor(zod[2]), 'backend lockfile must resolve Zod >=4.6.6');
});
