import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyDiskLayout, summarizeFilesystem, validateCleanupCandidate } from './dual-disk-check.mjs';

test('computes usable disk occupancy using blocks actually available to unprivileged users', () => {
  const fs = summarizeFilesystem({ bsize: 4096, blocks: 100, bfree: 20, bavail: 10 });
  assert.equal(fs.totalBytes, 409600);
  assert.equal(fs.freeBytes, 40960);
  assert.equal(fs.usedBytes, 327680);
  assert.equal(fs.percentUsed, 89);
});

test('enforces separate root and data filesystems', () => {
  const r = classifyDiskLayout({ root: { deviceId: 1, percentUsed: 92 }, data: { deviceId: 2, percentUsed: 55 } });
  assert.equal(r.separateDisks, true);
  assert.equal(r.rootStatus, 'WARN');
  assert.equal(r.dataStatus, 'OK');
});

test('reports shared root and data device as BLOCKED', () => {
  const r = classifyDiskLayout({ root: { deviceId: 6, percentUsed: 70 }, data: { deviceId: 6, percentUsed: 70 } });
  assert.equal(r.separateDisks, false);
  assert.equal(r.storageLayoutStatus, 'BLOCKED');
});

test('rejects operation outside known historical task .next directory', () => {
  for (const p of ['/srv/moneyverse-data/postgres/.next', '/srv/moneyverse-data/backups/.next', '/srv/moneyverse-tasks/active/../frontend/.next', '/srv/moneyverse-tasks/foo/backend/node_modules', '/srv/moneyverse-tasks/foo/frontend/.next/../..']) {
    assert.equal(validateCleanupCandidate(p), false, p);
  }
});

test('allows only historical task frontend .next directories as optional manual cleanup candidates', () => {
  assert.equal(validateCleanupCandidate('/srv/moneyverse-tasks/old-checkout/frontend/.next'), true);
  assert.equal(validateCleanupCandidate('/srv/moneyverse-tasks/old-checkout/source/frontend/.next'), true);
});
