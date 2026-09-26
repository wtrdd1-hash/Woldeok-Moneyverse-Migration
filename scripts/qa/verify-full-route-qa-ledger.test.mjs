import test from 'node:test';
import assert from 'node:assert/strict';
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
  inventorySha256: 'inventory-sha',
  pages: [
    { route: '/', routeKind: 'static', administrator: false },
    { route: '/admin', routeKind: 'static', administrator: true },
    { route: '/items/[id]', routeKind: 'dynamic', administrator: false },
  ],
};

function entry(route, passNumber, overrides = {}) {
  return {
    route,
    fixtureId: 'qa_guest_v1',
    passNumber,
    result: 'PASS',
    evidenceUri: `artifacts/${route.replaceAll('/', '_')}-${passNumber}.png`,
    executedAt: '2026-09-26T00:00:00.000Z',
    runtimeVersion: 'candidate-sha',
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
  return { schemaVersion: 1, candidateSha: 'candidate-sha', inventorySha256: 'inventory-sha', entries };
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
