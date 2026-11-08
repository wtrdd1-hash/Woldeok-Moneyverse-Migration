import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { assessReleaseRetention } from './check-release-retention.mjs';

test('retention preflight protects current, previous and live generations', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mv-retention-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const current = path.join(root, 'prod-current');
  const previous = path.join(root, 'prod-previous');
  const old = path.join(root, 'prod-old');
  for (const dir of [current, previous, old]) fs.mkdirSync(dir);
  const pointers = { current, previous };
  const check = (candidate, liveCwds = [path.join(current, 'backend')]) =>
    assessReleaseRetention({ root, candidate, pointers, liveCwds });
  assert.equal(check(current).safeToConsiderDeletion, false);
  assert.equal(check(previous).safeToConsiderDeletion, false);
  assert.equal(check(old, [path.join(old, 'backend')]).safeToConsiderDeletion, false);
  assert.equal(check(old, ['unreadable (deleted)']).safeToConsiderDeletion, false);
  assert.equal(check(old, []).safeToConsiderDeletion, false);
  assert.equal(check(old).safeToConsiderDeletion, true);
  assert.equal(check(path.dirname(root)).safeToConsiderDeletion, false);
  assert.equal(assessReleaseRetention({ root, candidate: old, pointers: { current, previous: path.join(root, 'missing') }, liveCwds: [current] }).safeToConsiderDeletion, false);
  const alias = path.join(root, 'prod-alias');
  fs.symlinkSync(old, alias);
  assert.equal(check(alias).safeToConsiderDeletion, false);
});
