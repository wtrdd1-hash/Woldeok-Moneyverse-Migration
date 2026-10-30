import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { verifyIsolatedTestPublicEvidence } from './verify-isolated-test-public.mjs';

const sha = 'a'.repeat(40);

function valid() {
  return {
    expectedSha: sha,
    backendStatus: 200,
    backendVersion: { id: sha },
    frontendStatus: 200,
    frontendVersion: { id: sha },
    treasuryStatus: 503,
    treasuryCacheControl: 'private, no-store',
    treasuryBody: {
      ok: false,
      status: 'UNVERIFIED',
      code: 'PUBLIC_TREASURY_RECONCILIATION_PENDING',
      overview: { verified: false, totalBalanceWld: '—' },
      recentLedger: [],
    },
    rootStatus: 200,
    rootRobotsTag: 'noindex, nofollow',
  };
}

test('accepts a complete exact-SHA isolated Test public-edge snapshot', () => {
  assert.deepEqual(verifyIsolatedTestPublicEvidence(valid()), { ok: true, failures: [] });
});

test('rejects missing, stale or timestamp-only backend and frontend identity', () => {
  for (const key of ['backendVersion', 'frontendVersion']) {
    for (const value of [null, { id: 'b'.repeat(40) }, { id: '1793277134644' }]) {
      const snapshot = valid();
      snapshot[key] = value;
      assert.equal(verifyIsolatedTestPublicEvidence(snapshot).ok, false);
    }
  }
});

test('rejects a synthetic Treasury HTTP 200 and any disclosed ledger row', () => {
  const synthetic = valid();
  synthetic.treasuryStatus = 200;
  synthetic.treasuryBody.recentLedger = [{ id: 'disb-101' }];
  assert.ok(
    verifyIsolatedTestPublicEvidence(synthetic).failures.includes(
      'public_treasury_not_fail_closed',
    ),
  );
});

test('rejects invalid Treasury privacy and unverified-body invariants', () => {
  for (const mutate of [
    (s) => {
      s.treasuryCacheControl = 'public, max-age=60';
    },
    (s) => {
      s.treasuryBody.status = 'VERIFIED';
    },
    (s) => {
      s.treasuryBody.overview.totalBalanceWld = '1000';
    },
    (s) => {
      s.treasuryBody.overview.verified = true;
    },
    (s) => {
      s.treasuryBody.ok = true;
    },
    (s) => {
      s.treasuryBody.code = 'OK';
    },
    (s) => {
      s.treasuryBody = null;
    },
  ]) {
    const snapshot = valid();
    mutate(snapshot);
    assert.ok(
      verifyIsolatedTestPublicEvidence(snapshot).failures.includes(
        'public_treasury_not_fail_closed',
      ),
    );
  }
});

test('rejects missing noindex, non-200 origin, invalid expected SHA and incomplete evidence', () => {
  const snapshot = valid();
  snapshot.expectedSha = 'bad';
  snapshot.frontendStatus = 404;
  snapshot.backendStatus = 500;
  snapshot.rootStatus = 503;
  snapshot.rootRobotsTag = '';
  const failures = verifyIsolatedTestPublicEvidence(snapshot).failures;
  for (const code of [
    'invalid_expected_sha',
    'backend_version_unverified',
    'frontend_version_unverified',
    'test_root_indexable_or_unavailable',
  ]) {
    assert.ok(failures.includes(code), code);
  }
});

test('Production workflow checks independent Test frontend and Treasury before publishing images', () => {
  const source = readFileSync(
    new URL('../../.github/workflows/deploy.yml', import.meta.url),
    'utf8',
  );
  assert.match(source, /verify-isolated-test-public\.mjs/);
  assert.match(source, /Checkout exact candidate source for Test public-edge verification/);
  assert.match(source, /needs\.test-gate\.result == 'success'/);
});
