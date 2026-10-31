import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const workspaces = ['backend', 'frontend', 'packages/contract', 'packages/database'];

function semverAtLeast(value, floor) {
  const match = /^(?:\^|~)?(\d+)\.(\d+)\.(\d+)$/.exec(value);
  assert.ok(match, 'Expected stable semver, received ' + value);
  const numbers = match.slice(1).map(Number);
  for (let i = 0; i < 3; i++) {
    if (numbers[i] !== floor[i]) return numbers[i] > floor[i];
  }
  return true;
}

test('all Vitest workspaces declare the patched 4.1.11 floor', () => {
  for (const workspace of workspaces) {
    const manifest = JSON.parse(readFileSync(resolve(root, workspace, 'package.json'), 'utf8'));
    assert.ok(semverAtLeast(manifest.devDependencies.vitest, [4, 1, 11]), workspace + ' Vitest must be >=4.1.11');
  }
});

test('the lockfile excludes vulnerable tinypool 1.x and Vitest 3.x', () => {
  const lock = readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8');
  assert.doesNotMatch(lock, /^  tinypool@1\./m, 'vulnerable tinypool 1.x must not remain');
  assert.doesNotMatch(lock, /^  vitest@3\./m, 'vulnerable Vitest 3.x must not remain');
  assert.match(lock, /^  vitest@4\.1\.11:/m, 'lockfile must contain patched Vitest 4.1.11');
});

test('Vite, fast-uri and brace-expansion lock entries meet patched floors', () => {
  const lock = readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8');
  const versions = (name) => [...lock.matchAll(new RegExp('^  ' + name + '@(\\d+\\.\\d+\\.\\d+):', 'gm'))].map((match) => match[1]);
  for (const [name, floor] of [
    ['vite', [7, 3, 7]],
    ['fast-uri', [3, 1, 9]],
  ]) {
    const found = versions(name);
    assert.ok(found.length > 0, name + ' must be locked');
    assert.ok(found.every((value) => semverAtLeast(value, floor)), name + ' must meet patched floor');
  }
  const brace = versions('brace-expansion');
  assert.ok(brace.length > 0, 'brace-expansion must be locked');
  assert.ok(brace.every((value) => {
    const major = Number(value.split('.')[0]);
    return major === 1 ? semverAtLeast(value, [1, 1, 20]) : major === 5 ? semverAtLeast(value, [5, 0, 11]) : true;
  }), 'brace-expansion 1.x and 5.x must meet patched floors');
});
