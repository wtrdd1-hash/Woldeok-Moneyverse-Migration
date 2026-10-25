import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { verifyLedger } from './verify-full-route-qa-ledger.mjs';

const fixtures = {
  schemaVersion: 1,
  fixtures: [
    { id: 'qa_guest_v1', roles: ['guest'] },
    { id: 'qa_admin_v1', roles: ['administrator'] },
  ],
};

const inventory = {
  schemaVersion: 1,
  repositoryHead: 'a'.repeat(40),
  inventorySha256: 'inventory-sha',
  pages: [
    { route: '/', routeKind: 'static', administrator: false },
    { route: '/admin', routeKind: 'static', administrator: true },
    { route: '/items/[id]', routeKind: 'dynamic', administrator: false },
  ],
};

inventory.inventorySha256 = createHash('sha256').update(JSON.stringify(inventory.pages)).digest('hex');

function entry(route, passNumber, overrides = {}) {
  return {
    route,
    fixtureId: 'qa_guest_v1',
    passNumber,
    result: 'PASS',
    evidenceUri: `artifacts/${route.replaceAll('/', '_')}-${passNumber}.png`,
    executedAt: '2026-09-26T00:00:00.000Z',
    runtimeVersion: 'a'.repeat(40),
    apiVersion: 'v1',
    ...overrides,
  };
}

function completeLedger() {
  const entries = [];
  for (let passNumber = 1; passNumber <= 5; passNumber += 1) {
    entries.push(entry('/', passNumber));
    entries.push(entry('/admin', passNumber, { fixtureId: 'qa_admin_v1' }));
    entries.push(entry('/items/[id]', passNumber));
  }
  entries.push(entry('/items/[id]', 1, { dynamicScenario: 'valid' }));
  entries.push(entry('/items/[id]', 2, { dynamicScenario: 'not_found' }));
  entries.push(entry('/items/[id]', 3, { dynamicScenario: 'permission_denied' }));
  return { schemaVersion: 1, candidateSha: 'a'.repeat(40), inventorySha256: inventory.inventorySha256, entries };
}

test('accepts complete five-pass coverage with required admin and dynamic evidence', () => {
  const report = verifyLedger({ inventory, fixtures, ledger: completeLedger() });
  assert.equal(report.ok, true, report.issues.join('\n'));
  assert.equal(report.summary.routeCount, 3);
});

test('rejects missing route pass and missing dynamic scenario', () => {
  const ledger = completeLedger();
  ledger.entries = ledger.entries.filter((item) => !(item.route === '/' && item.passNumber === 5));
  ledger.entries = ledger.entries.filter((item) => item.dynamicScenario !== 'permission_denied');
  const report = verifyLedger({ inventory, fixtures, ledger });
  assert.equal(report.ok, false);
  assert.match(report.issues.join('\n'), /missing full-site pass 5/);
  assert.match(report.issues.join('\n'), /missing dynamic scenario permission_denied/);
});

test('rejects non-pass evidence without a defect identifier', () => {
  const ledger = completeLedger();
  ledger.entries[0] = { ...ledger.entries[0], result: 'BLOCKED' };
  const report = verifyLedger({ inventory, fixtures, ledger });
  assert.equal(report.ok, false);
  assert.match(report.issues.join('\n'), /requires defectId/);
});

test('rejects stale route inventory content even when ledger repeats its claimed hash', () => {
  const changed = structuredClone(inventory);
  changed.pages[0].route = '/tampered';
  const report = verifyLedger({ inventory: changed, fixtures, ledger: completeLedger() });
  assert.equal(report.ok, false);
  assert.match(report.issues.join('\n'), /inventory content hash mismatch/);
});

test('rejects a candidate SHA mismatch and an unverified deployed runtime', () => {
  const ledger = completeLedger();
  ledger.candidateSha = 'b'.repeat(40);
  ledger.entries[0].runtimeVersion = 'c'.repeat(40);
  const staleInventory = { ...inventory, repositoryHead: 'd'.repeat(40) };
  const report = verifyLedger({ inventory: staleInventory, fixtures, ledger, expectedCandidateSha: 'a'.repeat(40) });
  assert.equal(report.ok, false);
  assert.match(report.issues.join('\n'), /candidate SHA mismatch/);
  assert.match(report.issues.join('\n'), /runtime SHA mismatch/);
  assert.match(report.issues.join('\n'), /inventory repository SHA mismatch/);
});

test('CLI refuses absent real evidence inputs with actionable usage', async () => {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(process.execPath, ['scripts/qa/verify-full-route-qa-ledger.mjs', '--fixtures', 'scripts/qa/fixtures/full-route-fixtures.v1.json'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /--inventory.*--ledger.*--candidate-sha/s);
});

test('package QA command fails closed without independently collected E2E artifacts', async () => {
  const { spawnSync } = await import('node:child_process');
  const result = spawnSync(process.execPath, ['scripts/qa/check-full-route-qa-ledger.mjs'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /BLOCKED: missing independently collected route QA evidence/);
});

test('accepts exact SHA evidence when all route runtime receipts match', () => {
  const report = verifyLedger({ inventory, fixtures, ledger: completeLedger(), expectedCandidateSha: 'a'.repeat(40) });
  assert.equal(report.ok, true, report.issues.join('\n'));
});
