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

test('rejects non-admin-only required check enforcement', () => {
  assert.throws(
    () => verifyMainRequiredChecks({ protection: {
      required_status_checks: { enforcement_level: 'non_admins', contexts: ['classify', 'policy', 'runtime-check'] },
      enforce_admins: { enabled: false },
    } }),
    /admin/,
  );
});

test('rejects admin bypass even when required checks exist', () => {
  const payload = { required_status_checks: {
    strict: true, contexts: ['classify', 'policy', 'runtime-check'],
  }, enforce_admins: { enabled: false } };
  assert.throws(() => verifyMainRequiredChecks(payload), /admin|bypass/i);
});

test('rejects non-strict checks and missing runtime-check', () => {
  const base = { required_status_checks: {
    strict: true, contexts: ['classify', 'policy', 'runtime-check'],
  }, enforce_admins: { enabled: true } };
  assert.throws(() => verifyMainRequiredChecks({
    ...base, required_status_checks: { ...base.required_status_checks, strict: false },
  }), /strict/i);
  assert.throws(() => verifyMainRequiredChecks({
    ...base, required_status_checks: { ...base.required_status_checks, contexts: ['classify', 'policy'] },
  }), /runtime-check/i);
});

test('accepts strict main protection enforced for administrators with all critical checks', () => {
  const payload = { required_status_checks: {
    strict: true, contexts: ['classify', 'policy', 'runtime-check'],
  }, enforce_admins: { enabled: true } };
  assert.deepEqual(verifyMainRequiredChecks(payload), {
    enforceAdmins: true, strict: true, requiredChecks: ['classify', 'policy', 'runtime-check'],
  });
});
