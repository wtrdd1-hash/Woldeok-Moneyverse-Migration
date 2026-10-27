import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync, symlinkSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { cleanupQaScratch } from './qa-disk-cleanup.mjs';

const NOW = Date.parse('2026-10-27T06:00:00Z');
const OLD = new Date(NOW - 5 * 24 * 60 * 60 * 1000);
const NEW = new Date(NOW - 1 * 60 * 60 * 1000);

function fixture() {
  const temp = mkdtempSync(join(tmpdir(), 'qa-cleaner-unit-'));
  const root = join(temp, 'scratch');
  mkdirSync(root, { mode: 0o700 });
  writeFileSync(join(root, '.moneyverse-qa-disposable-v1'), 'moneyverse-qa-disposable-v1\n');
  return { temp, root, finish() { rmSync(temp, { recursive: true, force: true }); } };
}
function run(root, name, { age = OLD, completed = true } = {}) {
  const p = join(root, name);
  mkdirSync(p);
  writeFileSync(join(p, 'artifact.log'), 'reconstructible only');
  utimesSync(join(p, 'artifact.log'), age, age);
  if (completed) {
    writeFileSync(join(p, '.qa-complete'), 'complete\n');
    utimesSync(join(p, '.qa-complete'), age, age);
  }
  utimesSync(p, age, age);
  return p;
}

test('deletes only old completed QA runs, leaving fresh and incomplete runs', () => {
  const f = fixture();
  try {
    const old = run(f.root, 'run-20261020T010101Z-cleanup');
    const active = run(f.root, 'run-20261027T020101Z-active', { completed: false });
    const fresh = run(f.root, 'run-20261027T050000Z-fresh', { age: NEW });
    const res = cleanupQaScratch(f.root, { now: NOW });
    assert.equal(res.deleted, 1);
    assert.ok(res.bytes > 0);
    assert.ok(!existsSync(old));
    assert.ok(existsSync(active));
    assert.ok(existsSync(fresh));
  } finally { f.finish(); }
});

test('dry-run reports candidates without deleting', () => {
  const f = fixture();
  try {
    const p = run(f.root, 'run-20261020T010101Z-cleanup');
    const res = cleanupQaScratch(f.root, { now: NOW, dryRun: true });
    assert.equal(res.candidates, 1);
    assert.equal(res.deleted, 0);
    assert.ok(existsSync(p));
  } finally { f.finish(); }
});

test('rejects unmarked roots and symlink descendants', () => {
  const f = fixture();
  try {
    const p = run(f.root, 'run-20261020T010101Z-cleanup');
    symlinkSync('/etc/hosts', join(p, 'link'));
    utimesSync(p, OLD, OLD);
    assert.equal(cleanupQaScratch(f.root, { now: NOW }).deleted, 0);
    assert.ok(existsSync(p));
    writeFileSync(join(f.root, '.moneyverse-qa-disposable-v1'), 'wrong');
    assert.throws(() => cleanupQaScratch(f.root, { now: NOW }), /not isolated/);
  } finally { f.finish(); }
});

test('never deletes unmarked normal temp directories', () => {
  const f = fixture();
  try {
    const p = run(f.root, 'production-current', { completed: true });
    assert.equal(cleanupQaScratch(f.root, { now: NOW }).deleted, 0);
    assert.ok(existsSync(p));
  } finally { f.finish(); }
});
