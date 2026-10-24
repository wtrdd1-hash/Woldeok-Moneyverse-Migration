import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const lock = readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8');

test('all resolved Zod 4 versions, including transitive toolchain dependencies, meet the patched advisory floor', () => {
  const versions = [...lock.matchAll(/^  zod@(\d+)\.(\d+)\.(\d+):/gm)];
  assert.ok(versions.length > 0, 'the lockfile must contain resolved Zod packages');
  for (const [, major, minor, patch] of versions) {
    const version = [Number(major), Number(minor), Number(patch)];
    if (version[0] !== 4) continue;
    assert.ok(
      version[1] > 6 || (version[1] === 6 && version[2] >= 6),
      `Zod ${version.join('.')} must be upgraded to >=4.6.6`,
    );
  }
});
