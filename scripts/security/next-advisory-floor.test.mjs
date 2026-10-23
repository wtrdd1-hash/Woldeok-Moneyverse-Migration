import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const baselineRef = process.env.NEXT_SECURITY_TEST_BASELINE_REF;

function manifest(file) {
  const source = baselineRef
    ? execFileSync('git', ['show', `${baselineRef}:${file}`], { cwd: root, encoding: 'utf8' })
    : readFileSync(resolve(root, file), 'utf8');
  return JSON.parse(source);
}

function version(specifier) {
  const match = /^(?:\^|~)?(\d+)\.(\d+)\.(\d+)$/.exec(specifier);
  assert.ok(match, `Next.js dependency must use an explicit stable version: ${specifier}`);
  return match.slice(1).map(Number);
}

test('Next.js runtime excludes vulnerable 16.4.0 and earlier', () => {
  const [major, minor, patch] = version(manifest('frontend/package.json').dependencies.next);
  assert.ok(major > 16 || (major === 16 && (minor > 4 || (minor === 4 && patch >= 1))),
    'Next.js must be >=16.4.1 for the 2026 security advisory floor');
});

test('Next.js ESLint dependencies match the runtime release', () => {
  const runtime = version(manifest('frontend/package.json').dependencies.next).join('.');
  const rootManifest = manifest('package.json');
  for (const name of ['@next/eslint-plugin-next', 'eslint-config-next']) {
    assert.equal(version(rootManifest.devDependencies[name]).join('.'), runtime, `${name} must match Next.js`);
  }
});
