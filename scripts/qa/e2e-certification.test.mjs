import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessFullSiteAcceptance } from './e2e-certification.mjs';

test('route HTTP 200 counts alone never certify mobile, transaction or admin E2E functionality', () => {
  const report = assessFullSiteAcceptance({ httpRoutes: true });
  assert.equal(report.ok, false);
  assert.equal(report.status, 'BLOCKED_E2E_EVIDENCE_REQUIRED');
  assert.ok(report.missing.includes('authenticatedUiActions'));
  assert.ok(report.missing.includes('realViewportMeasurements'));
  assert.ok(report.missing.includes('ledgerReconciledTransactions'));
  assert.ok(report.missing.includes('adminAuthorizationFlows'));
});

test('functional acceptance is possible only with evidence for all six required categories', () => {
  const report = assessFullSiteAcceptance({
    httpRoutes: true,
    authenticatedUiActions: true,
    realViewportMeasurements: true,
    localizedContentChecks: true,
    ledgerReconciledTransactions: true,
    adminAuthorizationFlows: true,
    sessionContinuity: true,
  });
  assert.equal(report.ok, true);
  assert.deepEqual(report.missing, []);
});
