import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  mkdtempSync, mkdirSync, writeFileSync, utimesSync, existsSync,
  rmSync, symlinkSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sweepTaskNextCaches } from './qa-task-next-cache.mjs';

const NOW = Date.parse('2026-11-03T00:00:00Z');
const AGE_2_DAYS = new Date(NOW - 48 * 3600_000);
const AGE_8_DAYS = new Date(NOW - 8 * 86400_000);
const AGE_1_HOUR = new Date(NOW - 3600_000);

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'mv-next-cache-qa-'));
  const rootDisk = join(dir, 'root');
  const dataDisk = join(dir, 'data');
  const rootWorkspaces = join(rootDisk, 'home/debian/moneyverse-worktrees');
  const dataWorkspaces = join(dataDisk, 'tasks');
  mkdirSync(rootWorkspaces, { recursive: true });
  mkdirSync(dataWorkspaces, { recursive: true });
  return {
    dir, rootDisk, dataDisk, rootWorkspaces, dataWorkspaces,
    opts: { rootDisk, dataDisk, rootWorkspaces, dataWorkspaces, now: NOW, activeWorkspaces: [] },
    finish: () => rmSync(dir, { recursive: true, force: true }),
  };
}
function cache(workspace, nested = '', age = AGE_2_DAYS) {
  const path = join(workspace, nested, 'frontend/.next/cache');
  mkdirSync(path, { recursive: true });
  const f = join(path, 'compiler.pack');
  writeFileSync(f, Buffer.alloc(1024));
  utimesSync(f, age, age);
  utimesSync(path, age, age);
  return path;
}

test('pressure on both disks removes only old allowlisted task-local Next caches', () => {
  const f = fixture();
  try {
    const rootTask = join(f.rootWorkspaces, 'task-r');
    const dataTask = join(f.dataWorkspaces, 'task-d');
    const one = cache(rootTask);
    const two = cache(dataTask, 'repo');
    const protectedFile = join(dataTask, 'repo/.git/config');
    mkdirSync(join(dataTask, 'repo/.git'), { recursive: true });
    writeFileSync(protectedFile, 'preserve');
    const unrelated = cache(join(f.dataWorkspaces, 'untracked-other'), 'other');
    const out = sweepTaskNextCaches({ ...f.opts, usedPct: { root: 96, data: 90 } });
    assert.equal(out.root.deleted, 1);
    assert.equal(out.data.deleted, 1);
    assert.ok(!existsSync(one) && !existsSync(two));
    assert.ok(existsSync(protectedFile) && existsSync(unrelated));
  } finally { f.finish(); }
});

test('dry-run does not delete; normal headroom keeps young cache, but ages out 5-day cache', () => {
  const f = fixture();
  try {
    const recent = cache(join(f.rootWorkspaces, 'a'), '', AGE_2_DAYS);
    const old = cache(join(f.dataWorkspaces, 'b'), 'source', AGE_8_DAYS);
    const dry = sweepTaskNextCaches({ ...f.opts, usedPct: { root: 60, data: 60 }, dryRun: true });
    assert.equal(dry.root.eligible, 0);
    assert.equal(dry.data.eligible, 1);
    assert.ok(existsSync(old));
    const out = sweepTaskNextCaches({ ...f.opts, usedPct: { root: 60, data: 60 } });
    assert.equal(out.root.deleted, 0);
    assert.equal(out.data.deleted, 1);
    assert.ok(existsSync(recent));
  } finally { f.finish(); }
});

test('active workspace, recent writes, symlink descendants, symlink roots are protected', () => {
  const f = fixture();
  try {
    const active = cache(join(f.dataWorkspaces, 'active'), 'repo');
    const fresh = cache(join(f.dataWorkspaces, 'fresh'), 'repair', AGE_1_HOUR);
    const linked = cache(join(f.rootWorkspaces, 'linked'), '', AGE_8_DAYS);
    symlinkSync('/etc/hosts', join(linked, 'unsafe'));
    utimesSync(linked, AGE_8_DAYS, AGE_8_DAYS);
    const symlinkOutside = cache(join(f.dataWorkspaces, 'outside'), 'source');
    const malicious = join(f.dataWorkspaces, 'symlinked');
    symlinkSync(join(f.dataWorkspaces, 'outside'), malicious);
    const out = sweepTaskNextCaches({
      ...f.opts,
      usedPct: { root: 90, data: 90 },
      activeWorkspaces: [join(f.dataWorkspaces, 'active')],
    });
    assert.equal(out.root.deleted, 0);
    assert.equal(out.data.deleted, 1); // Only the separately owned `outside` cache.
    assert.ok(existsSync(active) && existsSync(fresh) && existsSync(linked));
    assert.ok(!existsSync(symlinkOutside) && existsSync(malicious));
  } finally { f.finish(); }
});

test('caps cleanup per disk at 14 data-cache directories and only checks approved layouts', () => {
  const f = fixture();
  try {
    for (let i = 0; i < 17; i++) cache(join(f.dataWorkspaces, 'job-' + String(i).padStart(2, '0')), 'diagnostic', AGE_8_DAYS);
    const out = sweepTaskNextCaches({ ...f.opts, usedPct: { root: 90, data: 90 } });
    assert.equal(out.data.deleted, 14);
    assert.equal(out.data.eligible, 14);
    assert.ok(out.data.skipped.some((s) => s.endsWith(':budget')));
  } finally { f.finish(); }
});
