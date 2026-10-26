import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const root = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const lock = readFileSync(new URL('../../pnpm-lock.yaml', import.meta.url), 'utf8');
const overrides = root.pnpm?.overrides ?? {};
const parse = (s) => String(s).match(/\d+\.\d+\.\d+/)?.[0] ?? '';
const cmp = (a, b) => {
  const x = a.split('.').map(Number), y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};
for (const [name, floor] of [['body-parser', '2.4.0'], ['multer', '2.5.0']]) {
  test(`${name} override and resolved dependency must meet patched advisory floor ${floor}`, () => {
    assert.ok(cmp(parse(overrides[name]), floor) >= 0, `${name} override is below ${floor}`);
    const matches = [...lock.matchAll(new RegExp(`^  ${name}@(\\d+\\.\\d+\\.\\d+):`, 'gm'))].map((m) => m[1]);
    assert.ok(matches.length, `no ${name} package found in lockfile`);
    for (const version of matches) assert.ok(cmp(version, floor) >= 0, `${name}@${version} below ${floor}`);
  });
}
