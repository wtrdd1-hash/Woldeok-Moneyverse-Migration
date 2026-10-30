import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { verifyLedger } from './verify-full-route-qa-ledger.mjs';

const CANDIDATE_SHA = 'a'.repeat(40);
const OTHER_SHA = 'b'.repeat(40);

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
    runtimeVersion: CANDIDATE_SHA,
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
  return { schemaVersion: 1, candidateSha: CANDIDATE_SHA, inventorySha256: 'inventory-sha', entries };
}

test('accepts complete five-pass coverage with required admin and dynamic evidence', () => {
  const report = verifyLedger({ inventory, fixtures, ledger: completeLedger(), expectedSha: CANDIDATE_SHA });
  assert.equal(report.ok, true, report.issues.join('\n'));
  assert.equal(report.summary.routeCount, 3);
});

test('rejects missing route pass and missing dynamic scenario', () => {
  const ledger = completeLedger();
  ledger.entries = ledger.entries.filter((item) => !(item.route === '/' && item.passNumber === 5));
  ledger.entries = ledger.entries.filter((item) => item.dynamicScenario !== 'permission_denied');
  const report = verifyLedger({ inventory, fixtures, ledger, expectedSha: CANDIDATE_SHA });
  assert.equal(report.ok, false);
  assert.match(report.issues.join('\n'), /missing full-site pass 5/);
  assert.match(report.issues.join('\n'), /missing dynamic scenario permission_denied/);
});

test('rejects non-pass evidence without a defect identifier', () => {
  const ledger = completeLedger();
  ledger.entries[0] = { ...ledger.entries[0], result: 'BLOCKED' };
  const report = verifyLedger({ inventory, fixtures, ledger, expectedSha: CANDIDATE_SHA });
  assert.equal(report.ok, false);
  assert.match(report.issues.join('\n'), /requires defectId/);
});


test('rejects a self-declared candidate that differs from independently expected SHA', () => {
  const ledger = completeLedger();
  const report = verifyLedger({ inventory, fixtures, ledger, expectedSha: OTHER_SHA });
  assert.equal(report.ok, false);
  assert.match(report.issues.join('\n'), /candidate SHA mismatch/);
});

test('rejects mixed-runtime evidence even when five passes are otherwise complete', () => {
  const ledger = completeLedger();
  ledger.entries[0].runtimeVersion = OTHER_SHA;
  const report = verifyLedger({ inventory, fixtures, ledger, expectedSha: CANDIDATE_SHA });
  assert.equal(report.ok, false);
  assert.match(report.issues.join('\n'), /runtimeVersion.*candidate SHA/);
});

test('rejects missing external SHA and malformed candidate SHA rather than certifying evidence', () => {
  const ledger = completeLedger();
  const noExpected = verifyLedger({ inventory, fixtures, ledger });
  assert.equal(noExpected.ok, false);
  assert.match(noExpected.issues.join('\n'), /expected candidate SHA/);
  ledger.candidateSha = 'branch-name-not-a-commit';
  const invalid = verifyLedger({ inventory, fixtures, ledger, expectedSha: CANDIDATE_SHA });
  assert.equal(invalid.ok, false);
  assert.match(invalid.issues.join('\n'), /ledger candidateSha.*40/);
});


test('CLI binds synthetic QA ledger to externally supplied commit, never ledger self-report', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'mv-qa-ledger-test-'));
  try {
    const files = [inventory, fixtures, completeLedger()].map((value, index) => {
      const file = path.join(directory, `input-${index}.json`);
      writeFileSync(file, JSON.stringify(value));
      return file;
    });
    const args = [
      new URL('./verify-full-route-qa-ledger.mjs', import.meta.url).pathname,
      '--inventory', files[0], '--fixtures', files[1], '--ledger', files[2],
    ];
    const valid = spawnSync(process.execPath, [...args, '--expected-sha', CANDIDATE_SHA], { encoding: 'utf8' });
    assert.equal(valid.status, 0, valid.stderr);
    assert.equal(JSON.parse(valid.stdout).ok, true);
    const mismatch = spawnSync(process.execPath, [...args, '--expected-sha', OTHER_SHA], { encoding: 'utf8' });
    assert.equal(mismatch.status, 1);
    assert.match(mismatch.stdout, /candidate SHA mismatch/);
    const implicit = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.equal(implicit.status, 1);
    assert.match(implicit.stdout, /candidate SHA mismatch/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
