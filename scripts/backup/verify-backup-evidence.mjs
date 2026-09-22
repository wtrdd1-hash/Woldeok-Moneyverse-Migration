#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SHA256 = /^[0-9a-f]{64}$/;
const SAFE_ENV = /^(test|staging|recovery|isolated[-_]?restore)$/i;

export function validateEvidence(evidence, now = new Date()) {
  const errors = [];
  const requiredStrings = [
    'backupId',
    'createdAt',
    'sourceDatabase',
    'sourceEnvironment',
    'backupType',
    'backupSha256',
    'restoreTargetEnvironment',
    'restoreDrillAt',
    'migrationSetHash',
    'rollbackTarget',
    'operatorAuditId',
  ];
  for (const key of requiredStrings) {
    if (typeof evidence?.[key] !== 'string' || evidence[key].trim() === '') errors.push(`${key} is required`);
  }
  if (!['pg_dump_custom', 'physical_basebackup'].includes(evidence?.backupType)) {
    errors.push('backupType must be pg_dump_custom or physical_basebackup');
  }
  if (!SHA256.test(evidence?.backupSha256 ?? '')) errors.push('backupSha256 must be lowercase SHA-256');
  if (!SHA256.test(evidence?.migrationSetHash ?? '')) errors.push('migrationSetHash must be lowercase SHA-256');
  if (!SAFE_ENV.test(evidence?.restoreTargetEnvironment ?? '')) {
    errors.push('restoreTargetEnvironment must be an isolated non-production environment');
  }
  if (/prod/i.test(evidence?.restoreTargetEnvironment ?? '')) errors.push('production restore target is forbidden');
  const timestamps = {};
  for (const key of ['createdAt', 'restoreDrillAt']) {
    const parsed = Date.parse(evidence?.[key] ?? '');
    if (!Number.isFinite(parsed)) errors.push(`${key} must be an ISO-8601 timestamp`);
    else {
      timestamps[key] = parsed;
      if (parsed > now.getTime() + 300_000) errors.push(`${key} cannot be in the future`);
    }
  }
  if (Number.isFinite(timestamps.createdAt) && Number.isFinite(timestamps.restoreDrillAt) && timestamps.restoreDrillAt < timestamps.createdAt) {
    errors.push('restoreDrillAt cannot be earlier than createdAt');
  }
  if (evidence?.restoreDrillPassed !== true) errors.push('restoreDrillPassed must be true');
  if (evidence?.migrationParityPassed !== true) errors.push('migrationParityPassed must be true');
  if (evidence?.leastPrivilegeConnectionPassed !== true) errors.push('leastPrivilegeConnectionPassed must be true');
  if (evidence?.ledgerReconciliationPassed !== true) errors.push('ledgerReconciliationPassed must be true');
  if (evidence?.derivedBalanceReconciliationPassed !== true) errors.push('derivedBalanceReconciliationPassed must be true');
  if (evidence?.productionCredentialUsed !== false) errors.push('productionCredentialUsed must be false');
  if (evidence?.productionEndpointUsed !== false) errors.push('productionEndpointUsed must be false');
  if (evidence?.walRequired === true && evidence?.walCoveragePassed !== true) errors.push('walCoveragePassed must be true when WAL is required');
  if (typeof evidence?.rpoSeconds !== 'number' || evidence.rpoSeconds < 0) errors.push('rpoSeconds must be a non-negative number');
  if (typeof evidence?.rtoSeconds !== 'number' || evidence.rtoSeconds < 0) errors.push('rtoSeconds must be a non-negative number');
  return errors;
}

function sha256File(path) {
  const hash = createHash('sha256');
  hash.update(readFileSync(path));
  return hash.digest('hex');
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error) throw new Error(`${command} unavailable: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} verification failed: ${(result.stderr || result.stdout).trim()}`);
}

export function verifyBackupArtifact(evidence, backupPath) {
  const absolute = resolve(backupPath);
  const stats = statSync(absolute);
  if (evidence.backupType === 'pg_dump_custom') {
    if (!stats.isFile()) throw new Error('pg_dump custom backup must be a file');
    if (sha256File(absolute) !== evidence.backupSha256) throw new Error('backup SHA-256 does not match evidence');
    run('pg_restore', ['--list', absolute]);
    return;
  }
  if (!stats.isDirectory()) throw new Error('physical base backup must be a directory');
  run('pg_verifybackup', [absolute]);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) args[argv[i]] = argv[i + 1];
  return { evidence: args['--evidence'], backup: args['--backup'] };
}

function main() {
  const { evidence: evidencePath, backup } = parseArgs(process.argv.slice(2));
  if (!evidencePath || !backup) throw new Error('usage: verify-backup-evidence.mjs --evidence <json> --backup <path>');
  const evidence = JSON.parse(readFileSync(resolve(evidencePath), 'utf8'));
  const errors = validateEvidence(evidence);
  if (errors.length) throw new Error(`backup evidence rejected:\n- ${errors.join('\n- ')}`);
  verifyBackupArtifact(evidence, backup);
  process.stdout.write(JSON.stringify({ ok: true, backupId: evidence.backupId, backupType: evidence.backupType }) + '\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
}
