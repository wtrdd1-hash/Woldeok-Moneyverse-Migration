import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyMainRequiredChecks } from './verify-main-required-checks.mjs';

test('rejects disabled required-status-check enforcement', () => {
  assert.throws(
    () => verifyMainRequiredChecks({ protection: { required_status_checks: { enforcement_level: 'off', contexts: [], checks: [] } } }),
    /disabled or empty/,
  );
});

test('rejects enabled enforcement with no required checks', () => {
  assert.throws(
    () => verifyMainRequiredChecks({ protection: { required_status_checks: { enforcement_level: 'non_admins', contexts: [], checks: [] } } }),
    /disabled or empty/,
  );
});

test('accepts enforced required checks', () => {
  assert.deepEqual(
    verifyMainRequiredChecks({ protection: { required_status_checks: { enforcement_level: 'everyone', contexts: ['Build Test Candidate'], checks: [] } } }),
    { enforcement: 'everyone', requiredCheckCount: 1 },
  );
});
