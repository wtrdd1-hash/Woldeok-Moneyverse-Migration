#!/usr/bin/env node
/**
 * v2026.11.01.1605 — Hourly QA two-physical-disk rebuildable-cache maintenance.
 * Keep persistent QA evidence, backups, releases, databases and worker worktrees.
 * English canonical. Operator notes: docs/worklog/2026-11-01-qa-dual-disk-v1605.md
 */
import {
  existsSync, lstatSync, readdirSync, rmSync, statSync, statfsSync,
} from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sweepTaskNextCaches } from './qa-task-next-cache.mjs';

const RETENTION_MS = 5 * 24 * 60 * 60 * 1000;
const MAX_TREE_BYTES = 2 * 1024 ** 3;
const MAX_TOTAL_BYTES = 6 * 1024 ** 3;
const MAX_TREE_ENTRIES = 80000;
const MAX_DELETIONS = 12;
const QA_DISKS = Object.freeze({ rootDisk: '/', dataDisk: '/srv/moneyverse-data' });

function disk(p) {
  const fs = statfsSync(p);
  const availableBytes = fs.bavail * fs.bsize;
  const used = fs.blocks - fs.bfree;
  const denom = used + fs.bavail;
  return {
    usedPct: denom ? Math.ceil(100 * used / denom) : 0,
    availableGiB: Number((availableBytes / 1024 ** 3).toFixed(2)),
    availableBytes,
  };
}

function noSymlinkSegments(path) {
  let current = resolve(path);
  while (true) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) return false;
    const parent = resolve(current, '..');
    if (parent === current) return true;
    current = parent;
  }
}

function roots(rootDisk, dataDisk) {
  // Only known regenerable caches; no broad find(/tmp), wildcard releases or worktree deletion.
  const root = [
    join(rootDisk, 'home/debian/.cache/node-compile-cache'),
    join(rootDisk, 'home/debian/.npm/_cacache'),
  ];
  const data = [
    join(dataDisk, 'node-compile-cache'),
    join(dataDisk, 'npm-cache'),
    join(dataDisk, 'npm-cache-a1525'),
  ];
  for (const name of readdirSync(dataDisk).sort()) {
    if (/^a[0-9]{4}-npm-cache$/.test(name)) data.push(join(dataDisk, name));
    // Task-local node compile caches: not task workspaces, DB, package sources, or reports.
    if (/^a[0-9]{4}-tmp$/.test(name)) data.push(join(dataDisk, name, 'node-compile-cache'));
  }
  return { root, data };
}

function scanOldCache(path, cutoff, targetDev) {
  const st = lstatSync(path);
  if (st.isSymbolicLink() || st.dev !== targetDev
      || st.uid !== process.getuid() || st.mtimeMs >= cutoff) return null;
  if (!(st.isFile() || st.isDirectory())) return null;
  const state = { bytes: st.isFile() ? st.size : 0, entries: 1 };
  const pending = st.isDirectory() ? [path] : [];
  while (pending.length) {
    const dir = pending.pop();
    for (const name of readdirSync(dir)) {
      const entry = join(dir, name);
      const s = lstatSync(entry);
      if (s.isSymbolicLink() || s.dev !== targetDev || s.uid !== process.getuid()
          || s.mtimeMs >= cutoff || !(s.isFile() || s.isDirectory())) return null;
      state.entries++;
      state.bytes += s.isFile() ? s.size : 0;
      if (state.bytes > MAX_TREE_BYTES || state.entries > MAX_TREE_ENTRIES) return null;
      if (s.isDirectory()) pending.push(entry);
    }
  }
  return state;
}

function cleanupDisk(paths, diskRoot, now, dryRun) {
  const cutoff = now - RETENTION_MS;
  const dev = statSync(diskRoot).dev;
  const result = { checked: 0, eligible: 0, deleted: 0, bytes: 0, skipped: [] };
  let plannedBytes = 0;
  for (const path of paths) {
    if (!existsSync(path)) continue;
    result.checked++;
    const relativePath = relative(diskRoot, path);
    if (relativePath.startsWith('..' + sep) || relativePath === '..'
        || relativePath === '' || !noSymlinkSegments(path)) {
      result.skipped.push(relativePath + ':unsafe-path');
      continue;
    }
    let info;
    try { info = scanOldCache(path, cutoff, dev); }
    catch {
      result.skipped.push(relativePath + ':concurrent-change');
      continue;
    }
    if (!info) {
      result.skipped.push(relativePath + ':fresh-or-protected');
      continue;
    }
    if (plannedBytes + info.bytes > MAX_TOTAL_BYTES || result.eligible >= MAX_DELETIONS) {
      result.skipped.push(relativePath + ':budget');
      continue;
    }
    result.eligible++;
    plannedBytes += info.bytes;
    if (!dryRun) {
      // Re-evaluate right before unlinking to reject modified or newly mounted paths.
      let recheck;
      try { recheck = scanOldCache(path, cutoff, dev); }
      catch { recheck = null; }
      if (!recheck || recheck.bytes !== info.bytes || !noSymlinkSegments(path)) {
        result.skipped.push(relativePath + ':concurrent-change');
        continue;
      }
      try {
        rmSync(path, { recursive: true, force: false });
        result.deleted++;
        result.bytes += info.bytes;
      } catch {
        result.skipped.push(relativePath + ':delete-error');
      }
    }
  }
  return result;
}

export function sweepRebuildableCaches({ rootDisk = QA_DISKS.rootDisk,
  dataDisk = QA_DISKS.dataDisk, now = Date.now(), dryRun = false } = {}) {
  for (const path of [rootDisk, dataDisk]) {
    if (!noSymlinkSegments(path) || !lstatSync(path).isDirectory()) {
      throw new Error('Invalid disk mount: symlink or non-directory');
    }
  }
  const paths = roots(rootDisk, dataDisk);
  return {
    root: cleanupDisk(paths.root, rootDisk, now, dryRun),
    data: cleanupDisk(paths.data, dataDisk, now, dryRun),
  };
}

function dockerBuildCachePrune() {
  const out = spawnSync('/usr/bin/docker', ['builder', 'prune', '--force',
    '--filter', 'until=168h'], { encoding: 'utf8', timeout: 30000, maxBuffer: 1024 ** 2 });
  const match = /Total reclaimed space:\s*([0-9.]+)\s*(B|KB|MB|GB|TB)/i.exec(out.stdout || '');
  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 };
  return {
    status: out.error ? 'error' : out.status === 0 ? 'ok' : 'error',
    exitCode: out.status,
    reclaimedBytes: match ? Math.round(Number(match[1]) * units[match[2].toUpperCase()]) : null,
    output: (out.stdout || '').slice(-350).trim(),
    error: (out.error?.message || out.stderr || '').slice(-350).trim(),
    // Docker reports its own reclaimed bytes in stdout; do not infer them from process exit code.
  };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.some(a => a !== '--dry-run')) throw new Error('Only --dry-run is supported');
  const dryRun = argv.includes('--dry-run');
  if (statSync('/').dev === statSync('/srv/moneyverse-data').dev) {
    throw new Error('Physical two-disk mount check failed; no cleanup attempted');
  }
  const before = { root: disk('/'), data: disk('/srv/moneyverse-data') };
  const cleanup = sweepRebuildableCaches({ dryRun });
  const taskCacheCleanup = sweepTaskNextCaches({ dryRun, usedPct: {
    root: before.root.usedPct, data: before.data.usedPct,
  } });
  const docker = dryRun ? { status: 'not_run_dry_run' } : dockerBuildCachePrune();
  const after = { root: disk('/'), data: disk('/srv/moneyverse-data') };
  const pressure = Object.entries(after).filter(([, d]) => d.usedPct >= 85)
    .map(([name]) => name);
  const diskDelta = Object.fromEntries(Object.keys(before).map(key => [key, {
    availableBytesDelta: after[key].availableBytes - before[key].availableBytes,
    // Busy host writes from other workers can offset reclaimed storage.
    cacheBytesDeleted: cleanup[key].bytes + taskCacheCleanup[key].bytes,
  }]));
  const reclaimed = cleanup.root.deleted + cleanup.data.deleted
    + taskCacheCleanup.root.deleted + taskCacheCleanup.data.deleted;
  const outcome = dryRun ? 'DRY_RUN' : reclaimed ? 'CACHE_ITEMS_REMOVED'
    : docker.reclaimedBytes > 0 ? 'DOCKER_BUILDER_CACHE_RECLAIMED'
      : 'NO_ELIGIBLE_CACHE_REMOVED';
  console.log(JSON.stringify({
    event: 'scheduled_qa_dual_disk_maintenance', version: 'v2026.11.03.1627',
    before, cleanup, taskCacheCleanup, docker, pressure, diskDelta, outcome, after,
  }));
  if (pressure.length) {
    console.error('[QA_DISK_PRESSURE] >=85%: ' + pressure.join(',')
      + '; protected persistent data is not deleted');
  }
  if (docker.status === 'error') process.exitCode = 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (err) {
    console.error('[QA_DUAL_DISK_MAINTENANCE_FAIL]', err.message);
    process.exitCode = 2;
  }
}
