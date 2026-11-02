#!/usr/bin/env node
/**
 * v2026.11.03.1627 — bounded cleanup of inactive, regenerable task-local Next.js caches.
 * Never remove workspaces, Git content, node_modules, QA evidence, DB/WAL, backups or releases.
 * Mounted disk budgets and same-filesystem checks are enforced independently.
 */
import {
  existsSync, lstatSync, readdirSync, readlinkSync, readFileSync,
  rmSync, statSync, statfsSync,
} from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const HOUR = 3600_000;
const AGE_NORMAL_MS = 120 * HOUR;
const AGE_PRESSURE_MS = 12 * HOUR;
const MAX_TREE_BYTES = 3 * 1024 ** 3;
const MAX_TREE_ENTRIES = 120000;
const CONFIG = {
  root: { maxDeletes: 8, maxBytes: 10 * 1024 ** 3, pressure: 85, layouts: [''] },
  data: { maxDeletes: 14, maxBytes: 16 * 1024 ** 3, pressure: 80,
    layouts: ['', 'repo', 'source', 'worktree', 'repair', 'diagnostic'] },
};
const SAFE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

function within(parent, child) {
  const rel = relative(parent, child);
  return rel !== '' && rel !== '..' && !rel.startsWith('..' + sep) && !rel.startsWith(sep);
}
function noSymlinkSegments(path) {
  let cursor = resolve(path);
  while (true) {
    if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink()) return false;
    const next = resolve(cursor, '..');
    if (next === cursor) return true;
    cursor = next;
  }
}
function scanOldCache(path, cutoff, device) {
  const pending = [path];
  let bytes = 0;
  let entries = 0;
  while (pending.length) {
    const target = pending.pop();
    const s = lstatSync(target);
    if (s.isSymbolicLink() || s.dev !== device || s.uid !== process.getuid()
      || s.mtimeMs >= cutoff || !(s.isDirectory() || s.isFile())) return null;
    bytes += s.blocks * 512;
    entries++;
    if (entries > MAX_TREE_ENTRIES || bytes > MAX_TREE_BYTES) return null;
    if (s.isDirectory()) {
      for (const name of readdirSync(target)) pending.push(join(target, name));
    }
  }
  return { bytes, entries };
}

/** Private process evidence is read locally and NEVER written to logs. */
export function runningWorkspacePaths() {
  const result = [];
  for (const pid of readdirSync('/proc')) {
    if (!/^\d+$/.test(pid)) continue;
    try {
      const cwd = readlinkSync('/proc/' + pid + '/cwd').replace(/ \(deleted\)$/, '');
      result.push(cwd);
    } catch { /* inaccessible exited or privileged process */ }
    try {
      const command = readFileSync('/proc/' + pid + '/cmdline', 'utf8');
      // Preserve an absolute-path argument if present; false positives are conservative.
      for (const item of command.split('\0')) if (item.startsWith('/')) result.push(item);
    } catch { /* same process race */ }
  }
  return result;
}
function isActive(workspace, activePaths) {
  return activePaths.some((path) =>
    path === workspace || path.startsWith(workspace + sep)
    || path.includes(workspace + sep));
}
function inspectDisk({
  diskPath, workspaceRoot, diskKey, now, usedPct, activePaths, dryRun,
}) {
  const config = CONFIG[diskKey];
  const out = { checked: 0, eligible: 0, deleted: 0, bytes: 0, skipped: [],
    retentionHours: usedPct >= config.pressure ? 12 : 120, pressure: usedPct >= config.pressure };
  if (!existsSync(workspaceRoot)) return out;
  if (!within(diskPath, workspaceRoot) || !noSymlinkSegments(workspaceRoot)
    || !lstatSync(workspaceRoot).isDirectory()) throw new Error('Unsafe workspaces root');
  const device = statSync(diskPath).dev;
  const cutoff = now - (out.pressure ? AGE_PRESSURE_MS : AGE_NORMAL_MS);
  const candidates = [];
  for (const item of readdirSync(workspaceRoot, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name))) {
    if (!item.isDirectory() || !SAFE_NAME.test(item.name)) continue;
    const owner = join(workspaceRoot, item.name);
    if (!noSymlinkSegments(owner) || !within(workspaceRoot, owner)) continue;
    for (const layout of config.layouts) {
      const candidate = join(owner, layout, 'frontend/.next/cache');
      if (!existsSync(candidate)) continue;
      out.checked++;
      if (!within(owner, candidate) || !noSymlinkSegments(candidate)) {
        out.skipped.push(item.name + ':unsafe-path');
        continue;
      }
      if (isActive(owner, activePaths)) {
        out.skipped.push(item.name + ':active-workspace');
        continue;
      }
      let info = null;
      try { info = scanOldCache(candidate, cutoff, device); } catch { /* concurrently modified */ }
      if (!info) {
        out.skipped.push(item.name + ':fresh-or-protected');
        continue;
      }
      candidates.push({ candidate, owner, info });
    }
  }
  candidates.sort((a, b) => a.candidate.localeCompare(b.candidate));
  let selectedBytes = 0;
  for (const entry of candidates) {
    const label = relative(workspaceRoot, entry.candidate);
    if (out.eligible >= config.maxDeletes ||
      selectedBytes + entry.info.bytes > config.maxBytes) {
      out.skipped.push(label + ':budget');
      continue;
    }
    out.eligible++;
    selectedBytes += entry.info.bytes;
    if (dryRun) continue;
    if (isActive(entry.owner, runningWorkspacePaths())) {
      out.skipped.push(label + ':became-active');
      continue;
    }
    let recheck = null;
    try {
      if (noSymlinkSegments(entry.candidate)) recheck = scanOldCache(entry.candidate, cutoff, device);
    } catch { /* concurrent mutation */ }
    if (!recheck || recheck.bytes !== entry.info.bytes ||
      recheck.entries !== entry.info.entries) {
      out.skipped.push(label + ':concurrent-change');
      continue;
    }
    try {
      rmSync(entry.candidate, { recursive: true, force: false });
      out.deleted++;
      out.bytes += entry.info.bytes;
    } catch {
      out.skipped.push(label + ':delete-failed');
    }
  }
  return out;
}

/** Includes an injectable synthetic mount view solely for safe unit tests. */
export function sweepTaskNextCaches({
  rootDisk = '/', dataDisk = '/srv/moneyverse-data',
  rootWorkspaces = join(rootDisk, 'home/debian/moneyverse-worktrees'),
  dataWorkspaces = join(dataDisk, 'tasks'),
  now = Date.now(), dryRun = false,
  usedPct = null, activeWorkspaces = null,
} = {}) {
  if (!noSymlinkSegments(rootDisk) || !noSymlinkSegments(dataDisk)
    || !lstatSync(rootDisk).isDirectory() || !lstatSync(dataDisk).isDirectory()) {
    throw new Error('Invalid mount point');
  }
  function pct(disk) {
    const s = statfsSync(disk);
    const used = s.blocks - s.bfree;
    return Math.ceil(100 * used / (used + s.bavail));
  }
  const usage = usedPct || { root: pct(rootDisk), data: pct(dataDisk) };
  const activePaths = activeWorkspaces ?? runningWorkspacePaths();
  return {
    root: inspectDisk({ diskPath: rootDisk, workspaceRoot: rootWorkspaces,
      diskKey: 'root', now, usedPct: usage.root, activePaths, dryRun }),
    data: inspectDisk({ diskPath: dataDisk, workspaceRoot: dataWorkspaces,
      diskKey: 'data', now, usedPct: usage.data, activePaths, dryRun }),
  };
}

function main() {
  if (process.argv.slice(2).some((arg) => arg !== '--dry-run'))
    throw new Error('Only --dry-run is available as a standalone command');
  if (statSync('/').dev === statSync('/srv/moneyverse-data').dev)
    throw new Error('Two separate filesystems required');
  const result = sweepTaskNextCaches({ dryRun: true });
  console.log(JSON.stringify({ event: 'qa_historical_next_cache_preview',
    version: 'v2026.11.03.1627', dryRun: true, result }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) {
    console.error('[QA_HISTORICAL_CACHE_FAIL]', e.message);
    process.exitCode = 2;
  }
}
