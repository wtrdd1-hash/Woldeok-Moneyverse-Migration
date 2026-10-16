#!/usr/bin/env node
/**
 * Read-only dual-disk and root-pressure check for the Debian/systemd Moneyverse host.
 * Never deletes, moves, restarts, migrates or modifies any filesystem content.
 *
 * Usage: node ops/storage/dual-disk-check.mjs [--json] [--strict]
 * A strict failure exit code indicates space/layout pressure; it never authorizes
 * bypassing economy/DB/UI gates or an automatic production promotion.
 */
import { statSync, statfsSync } from 'node:fs';
import { resolve, posix } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULTS = Object.freeze({
  root: '/',
  data: '/srv/moneyverse-data',
  rootWarnPercent: 85,
  dataWarnPercent: 80,
});

export function summarizeFilesystem({ bsize, blocks, bfree, bavail }) {
  if (![bsize, blocks, bfree, bavail].every((n) => Number.isFinite(n) && n >= 0)
      || bsize === 0 || blocks === 0 || bfree > blocks || bavail > bfree) {
    throw new Error('invalid filesystem stats');
  }
  const totalBytes = blocks * bsize;
  const freeBytes = bavail * bsize;
  const usedBytes = (blocks - bfree) * bsize;
  const percentUsed = Math.ceil(usedBytes / (usedBytes + freeBytes) * 100);
  return { totalBytes, freeBytes, usedBytes, percentUsed };
}

export function classifyDiskLayout({ root, data }, thresholds = DEFAULTS) {
  if (!root || !data || !Number.isFinite(root.percentUsed) || !Number.isFinite(data.percentUsed)) {
    throw new Error('both root and data filesystems must be measurable');
  }
  const separateDisks = root.deviceId !== data.deviceId;
  return {
    separateDisks,
    storageLayoutStatus: separateDisks ? 'OK' : 'BLOCKED',
    rootStatus: root.percentUsed >= thresholds.rootWarnPercent ? 'WARN' : 'OK',
    dataStatus: data.percentUsed >= thresholds.dataWarnPercent ? 'WARN' : 'OK',
    root,
    data,
  };
}

/**
 * Only helps an operator inspect historical Next build output candidates.
 * This check is NOT permission to delete; the CLI has no delete operation.
 * A candidate still needs a process/worktree/reference and age review.
 */
export function validateCleanupCandidate(candidate) {
  if (typeof candidate !== 'string' || !candidate.startsWith('/')
    || candidate !== posix.normalize(candidate)) return false;
  const p = candidate.split('/').filter(Boolean);
  return p.length >= 5 && p.length <= 6
    && p[0] === 'srv' && p[1] === 'moneyverse-tasks'
    && /^[a-zA-Z0-9][\w.-]*$/.test(p[2]) && p[2] !== '.'
    && p[p.length - 2] === 'frontend'
    && p[p.length - 1] === '.next'
    && (p.length === 5 || p[3] === 'source' || p[3] === 'repo'
      || p[3] === 'test-source' || p[3] === 'test-source-8cc33a12');
}

export function readDiskLayout(rootPath = DEFAULTS.root, dataPath = DEFAULTS.data) {
  function read(mountPath) {
    const fs = summarizeFilesystem(statfsSync(mountPath));
    return { mountPath, deviceId: statSync(mountPath).dev, ...fs };
  }
  return classifyDiskLayout({ root: read(rootPath), data: read(dataPath) });
}

function formatGiB(bytes) {
  return (bytes / 1024 ** 3).toFixed(1);
}

function main() {
  const args = new Set(process.argv.slice(2));
  if ([...args].some((arg) => !['--json', '--strict'].includes(arg))) {
    console.error('usage: node ops/storage/dual-disk-check.mjs [--json] [--strict]');
    process.exitCode = 2;
    return;
  }
  try {
    const result = readDiskLayout();
    if (args.has('--json')) console.log(JSON.stringify(result, null, 2));
    else for (const [label, disk] of [['system root', result.root], ['moneyverse data', result.data]]) {
      console.log(`${label}: ${disk.percentUsed}% used, ${formatGiB(disk.freeBytes)} GiB available [${label === 'system root' ? result.rootStatus : result.dataStatus}]`);
    }
    if (!args.has('--json')) console.log(`distinct mounted filesystems: ${result.storageLayoutStatus}`);
    if (args.has('--strict') && (result.storageLayoutStatus !== 'OK'
      || result.rootStatus !== 'OK' || result.dataStatus !== 'OK')) process.exitCode = 2;
  } catch (error) {
    console.error(`Dual-disk preflight blocked: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 2;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
