import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateEvidence, verifyBackupArtifact } from './verify-backup-evidence.mjs';

const now = new Date('2026-09-20T08:30:00Z');
const valid = {
  backupId: 'backup-20260920-001',
  createdAt: '2026-09-20T07:00:00Z',
  sourceDatabase: 'moneyverse',
  sourceEnvironment: 'production',
  backupType: 'pg_dump_custom',
  backupSha256: 'a'.repeat(64),
  restoreTargetEnvironment: 'isolated-restore',
  restoreDrillAt: '2026-09-20T08:00:00Z',
  restoreDrillPassed: true,
  migrationSetHash: 'b'.repeat(64),
  migrationParityPassed: true,
  leastPrivilegeConnectionPassed: true,
  ledgerReconciliationPassed: true,
  derivedBalanceReconciliationPassed: true,
  productionCredentialUsed: false,
  productionEndpointUsed: false,
  walRequired: false,
  rpoSeconds: 1800,
  rtoSeconds: 600,
  rollbackTarget: 'sha256:deadbeef',
  operatorAuditId: 'audit-123',
};

test('accepts complete isolated restore evidence', () => {
  assert.deepEqual(validateEvidence(valid, now), []);
});

test('rejects production restore target and missing reconciliation', () => {
  const errors = validateEvidence({ ...valid, restoreTargetEnvironment: 'production', ledgerReconciliationPassed: false }, now);
  assert.ok(errors.some((value) => value.includes('isolated non-production')));
  assert.ok(errors.some((value) => value.includes('production restore target')));
  assert.ok(errors.some((value) => value.includes('ledgerReconciliationPassed')));
});

test('requires WAL coverage when PITR evidence says WAL is required', () => {
  const errors = validateEvidence({ ...valid, walRequired: true, walCoveragePassed: false }, now);
  assert.ok(errors.some((value) => value.includes('walCoveragePassed')));
});

test('rejects production credentials/endpoints and malformed hashes', () => {
  const errors = validateEvidence({
    ...valid,
    productionCredentialUsed: true,
    productionEndpointUsed: true,
    backupSha256: 'not-a-hash',
    migrationSetHash: 'also-bad',
  }, now);
  assert.ok(errors.some((value) => value.includes('productionCredentialUsed')));
  assert.ok(errors.some((value) => value.includes('productionEndpointUsed')));
  assert.ok(errors.some((value) => value.includes('backupSha256')));
  assert.ok(errors.some((value) => value.includes('migrationSetHash')));
});

test('rejects restore evidence timestamped before the backup existed', () => {
  const errors = validateEvidence({ ...valid, restoreDrillAt: '2026-09-20T06:59:59Z' }, now);
  assert.ok(errors.some((value) => value.includes('restoreDrillAt cannot be earlier than createdAt')));
});

test('physical base backup rejects a file before invoking pg_verifybackup', () => {
  const directory = mkdtempSync(join(tmpdir(), 'moneyverse-backup-test-'));
  const file = join(directory, 'base.tar');
  writeFileSync(file, 'not-a-physical-backup');
  try {
    assert.throws(
      () => verifyBackupArtifact({ ...valid, backupType: 'physical_basebackup' }, file),
      /physical base backup must be a directory/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
