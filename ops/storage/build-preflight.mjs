#!/usr/bin/env node
/**
 * Read-only preflight for expensive Moneyverse builds on the Debian miniPC.
 * No cleanup, force flag, migration, service restart or deployment occurs here.
 * CI/non-miniPC runners without the dedicated data mount are not host-gated.
 */
import { existsSync, statSync } from 'node:fs';
import { hostname } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readDiskLayout } from './dual-disk-check.mjs';

const GiB = 1024 ** 3;
export const BUILD_LIMITS = Object.freeze({
  rootWarnPercent: 85,
  rootCriticalPercent: 90,
  minRootFreeBytes: 2 * GiB,
  minDataFreeBytes: 8 * GiB,
});

export function evaluateBuildPreflight(layout, workspaceDeviceId, limits = BUILD_LIMITS) {
  const blockers = [];
  const warnings = [];
  const root = layout?.root;
  const data = layout?.data;
  if (!root || !data || !Number.isInteger(root.deviceId) || !Number.isInteger(data.deviceId)
    || !Number.isInteger(workspaceDeviceId)
    || ![root.percentUsed, data.percentUsed, root.freeBytes, data.freeBytes].every(
      value => Number.isFinite(value) && value >= 0
    ) || root.percentUsed > 100 || data.percentUsed > 100) {
    return { ok: false, status: 'BLOCKED_BUILD_CAPACITY', blockers: ['unverified_disk_measurements'], warnings };
  }
  if (layout.separateDisks !== true || root.deviceId === data.deviceId) blockers.push('data_volume_not_separate');
  if (root.percentUsed >= limits.rootCriticalPercent) blockers.push('root_critical_occupancy');
  else if (root.percentUsed >= limits.rootWarnPercent) warnings.push('root_capacity_warning');
  if (root.freeBytes < limits.minRootFreeBytes) blockers.push('root_insufficient_free_bytes');
  if (data.freeBytes < limits.minDataFreeBytes) blockers.push('data_insufficient_free_bytes');
  if (workspaceDeviceId !== data.deviceId) blockers.push('build_workspace_not_on_data_volume');
  return {
    ok: blockers.length === 0,
    status: blockers.length === 0 ? 'READY_FOR_BUILD' : 'BLOCKED_BUILD_CAPACITY',
    blockers,
    warnings,
  };
}

export function requiresDataMount(hostName, explicitlyRequired) {
  return explicitlyRequired || hostName.toLowerCase() === 'debian13';
}

function main() {
  const dataMount = '/srv/moneyverse-data';
  if (!existsSync(dataMount)) {
    if (requiresDataMount(hostname(), process.env.MONEYVERSE_REQUIRE_HOST_PREFLIGHT === '1')) {
      console.error('BLOCKED_BUILD_CAPACITY: required data volume missing');
      process.exitCode = 2;
      return;
    }
    console.log('SKIPPED_NON_MINIPC: dedicated data volume absent; no miniPC capacity claim');
    return;
  }
  try {
    const layout = readDiskLayout('/', dataMount);
    const verdict = evaluateBuildPreflight(layout, statSync(process.cwd()).dev);
    console.log(`${verdict.status}: root=${layout.root.percentUsed}% data=${layout.data.percentUsed}% `
      + `rootFreeGiB=${(layout.root.freeBytes / GiB).toFixed(2)} `
      + `dataFreeGiB=${(layout.data.freeBytes / GiB).toFixed(2)} `
      + `blockers=${verdict.blockers.join(',') || 'none'} warnings=${verdict.warnings.join(',') || 'none'}`);
    if (!verdict.ok) process.exitCode = 2;
  } catch (error) {
    console.error(`BLOCKED_BUILD_CAPACITY: unable to measure disks (${error instanceof Error ? error.message : String(error)})`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
