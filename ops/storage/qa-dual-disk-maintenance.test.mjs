import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, utimesSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { sweepRebuildableCaches } from './qa-dual-disk-maintenance.mjs';

const NOW = Date.parse('2026-11-01T05:00:00Z');
const OLD = new Date(NOW - 8 * 86400000);
const RECENT = new Date(NOW - 86400000);

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'qa-dual-safe-'));
  const os = join(root, 'os');
  const data = join(root, 'data');
  mkdirSync(os);
  mkdirSync(data);
  return { root, os, data, finish: () => rmSync(root, { recursive: true, force: true }) };
}

function cache(directory, age = OLD) {
  mkdirSync(directory, { recursive: true });
  const file = join(directory, 'regenerable.bin');
  writeFileSync(file, Buffer.alloc(1024, 9));
  utimesSync(file, age, age);
  utimesSync(directory, age, age);
  return directory;
}

test('reclaims old allowlisted rebuildable caches from both OS and data roots', () => {
  const f = fixture();
  try {
    const rootCache = cache(join(f.os, 'home', 'debian', '.cache', 'node-compile-cache'));
    const dataCache = cache(join(f.data, 'a0425-npm-cache'));
    const evidence = cache(join(f.data, 'qa-reports'));
    const result = sweepRebuildableCaches({ rootDisk: f.os, dataDisk: f.data, now: NOW });
    assert.equal(result.root.deleted, 1);
    assert.equal(result.data.deleted, 1);
    assert.ok(result.root.bytes > 0 && result.data.bytes > 0);
    assert.ok(!existsSync(rootCache));
    assert.ok(!existsSync(dataCache));
    assert.ok(existsSync(evidence));
  } finally { f.finish(); }
});

test('fresh or modified caches are skipped and dry-run never removes anything', () => {
  const f = fixture();
  try {
    const fresh = cache(join(f.data, 'a1225-npm-cache'), RECENT);
    const old = cache(join(f.data, 'a0425-npm-cache'));
    assert.equal(sweepRebuildableCaches({ rootDisk: f.os, dataDisk: f.data, now: NOW, dryRun: true }).data.eligible, 1);
    assert.ok(existsSync(old));
    assert.equal(sweepRebuildableCaches({ rootDisk: f.os, dataDisk: f.data, now: NOW }).data.deleted, 1);
    assert.ok(existsSync(fresh));
  } finally { f.finish(); }
});

test('symlink content is not traversed and protected directories are never deleted', () => {
  const f = fixture();
  try {
    const protectedDir = cache(join(f.data, 'backups'));
    const candidate = cache(join(f.data, 'a2225-npm-cache'));
    symlinkSync(protectedDir, join(candidate, 'out'));
    utimesSync(candidate, OLD, OLD);
    const result = sweepRebuildableCaches({ rootDisk: f.os, dataDisk: f.data, now: NOW });
    assert.equal(result.data.deleted, 0);
    assert.ok(existsSync(protectedDir));
    assert.ok(existsSync(candidate));
    assert.ok(result.data.skipped.some(x => x.includes('a2225-npm-cache')));
  } finally { f.finish(); }
});

test('a disk path supplied as a symlink is rejected', () => {
  const f = fixture();
  try {
    const link = join(f.root, 'linked-data');
    symlinkSync(f.data, link);
    assert.throws(() => sweepRebuildableCaches({ rootDisk: f.os, dataDisk: link, now: NOW }), /mount|symlink/i);
  } finally { f.finish(); }
});
