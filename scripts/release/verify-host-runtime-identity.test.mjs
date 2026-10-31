import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { parseBuildId, verifyHostRuntimeIdentity, serviceForRelease, parseEnvironmentFileLocations, mergeServiceBuildIds } from './verify-host-runtime-identity.mjs';

const sha = 'a'.repeat(40);
const root = '/srv/moneyverse-data/releases/test-v123-aaaaaaaaaaaa';

function healthy() {
  return {
    expectedSha: sha,
    channel: 'test',
    releasePath: root,
    manifest: {
      schemaVersion: 1,
      channel: 'test',
      applicationSourceSha: sha,
      mutableGitCheckout: false,
    },
    backendReleaseSha: sha,
    frontendReleaseSha: sha,
    frontendBuildSha: sha,
    publicVersionSha: sha,
    publicFrontendVersionSha: sha,
    publicTreasury: {
      status: 503,
      cacheControl: 'private, no-store',
      body: {
        ok: false, status: 'UNVERIFIED',
        code: 'PUBLIC_TREASURY_RECONCILIATION_PENDING',
        overview: { verified: false, totalBalanceWld: '—' },
        recentLedger: [],
      },
    },
    backendCwd: path.join(root, 'backend'),
    frontendCwd: path.join(root, 'frontend'),
  };
}

test('accepts a complete consistent Test release only', () => {
  assert.deepEqual(verifyHostRuntimeIdentity(healthy()), { ok: true, failures: [] });
});

test('rejects a live Test with backend version spoofed by stale environment', () => {
  const state = healthy();
  state.backendReleaseSha = 'b'.repeat(40);
  state.publicVersionSha = 'b'.repeat(40);
  const verdict = verifyHostRuntimeIdentity(state);
  assert.equal(verdict.ok, false);
  assert.deepEqual(verdict.failures, ['backend_env_sha_mismatch', 'public_version_sha_mismatch']);
});

test('rejects a stale frontend environment and compiled frontend artifact independently', () => {
  const state = healthy();
  state.frontendReleaseSha = 'b'.repeat(40);
  state.frontendBuildSha = 'b'.repeat(40);
  const verdict = verifyHostRuntimeIdentity(state);
  assert.ok(verdict.failures.includes('frontend_env_sha_mismatch'));
  assert.ok(verdict.failures.includes('frontend_artifact_sha_mismatch'));
});

test('rejects missing or unverifiable manifest even when public version agrees', () => {
  const state = healthy();
  state.manifest = null;
  const verdict = verifyHostRuntimeIdentity(state);
  assert.ok(verdict.failures.includes('missing_or_invalid_release_manifest'));
  assert.ok(verdict.failures.includes('manifest_sha_mismatch'));
});

test('rejects a candidate compiled into an unapproved alternate service directory', () => {
  const state = healthy();
  state.backendCwd = '/srv/moneyverse-data/releases/other/backend';
  const verdict = verifyHostRuntimeIdentity(state);
  assert.ok(verdict.failures.includes('backend_process_directory_mismatch'));
});

test('rejects a frontend process serving an older worktree', () => {
  const state = healthy();
  state.frontendCwd = '/srv/moneyverse-data/releases/old/frontend';
  assert.ok(verifyHostRuntimeIdentity(state).failures.includes('frontend_process_directory_mismatch'));
});

test('rejects malformed channel, source SHA and manifest metadata', () => {
  const state = healthy();
  state.expectedSha = 'unknown';
  state.channel = 'other';
  state.manifest.mutableGitCheckout = true;
  const verdict = verifyHostRuntimeIdentity(state);
  assert.ok(verdict.failures.includes('invalid_expected_sha'));
  assert.ok(verdict.failures.includes('invalid_channel'));
  assert.ok(verdict.failures.includes('missing_or_invalid_release_manifest'));
});

test('reads one exact BUILD_ID but refuses missing and duplicated release identity keys', () => {
  assert.equal(parseBuildId('PORT=3100\nBUILD_ID=' + sha + '\n'), sha);
  assert.equal(parseBuildId('BUILD_ID="' + sha + '"\n'), sha);
  assert.equal(parseBuildId("BUILD_ID='" + sha + "'\n"), sha);
  assert.equal(parseBuildId('PORT=3100\n'), null);
  assert.equal(parseBuildId('BUILD_ID=' + sha + '\nBUILD_ID=' + sha + '\n'), null);
});


test('uses manifest version to select the active production generation, not stale fallback v600', () => {
  const release = { version: 'v2026.10.16.712' };
  assert.equal(serviceForRelease('prod', release, 'backend'), 'moneyverse-release-v712-backend.service');
  assert.equal(serviceForRelease('prod', release, 'frontend'), 'moneyverse-release-v712-frontend.service');
  assert.equal(serviceForRelease('test', release, 'backend'), 'test-main-backend.service');
  assert.throws(() => serviceForRelease('prod', {version: 'v712;unsafe'}, 'backend'));
  assert.throws(() => serviceForRelease('prod', {version: 'latest'}, 'frontend'));
});

test('finds the unique active stable production service by actual immutable process directory', () => {
  const root = '/srv/moneyverse-data/releases/prod-v2026.10.31.0950-761a55a094fb';
  const manifest = { version: 'v2026.10.31.0950' };
  const cwdFor = (unit) => {
    if (unit === 'moneyverse-live-prod-backend.service') return path.join(root, 'backend');
    if (unit === 'moneyverse-live-prod-frontend.service') return path.join(root, 'frontend');
    throw new Error('inactive service');
  };
  for (const role of ['backend', 'frontend']) {
    assert.equal(
      serviceForRelease('prod', manifest, role, { releasePath: root, cwdFor }),
      `moneyverse-live-prod-${role}.service`,
    );
  }
  assert.throws(() => serviceForRelease('prod', manifest, 'backend', {
    releasePath: root,
    cwdFor: () => '/srv/moneyverse-data/releases/unrelated/backend',
  }), /no exact active release service/);
  assert.throws(() => serviceForRelease('prod', manifest, 'frontend', {
    releasePath: root,
    cwdFor: () => path.join(root, 'frontend'),
  }), /ambiguous active release service/);
});

test('uses active service EnvironmentFiles and last-wins BUILD_ID but never duplicate or missing keys', () => {
  const entries = parseEnvironmentFileLocations('/a/base.env (ignore_errors=no) /b/release.env (ignore_errors=no)');
  assert.deepEqual(entries, [{file:'/a/base.env',optional:false},{file:'/b/release.env',optional:false}]);
  assert.deepEqual(parseEnvironmentFileLocations('/tmp/test.env (ignore_errors=yes)'),[{file:'/tmp/test.env',optional:true}]);
  assert.equal(mergeServiceBuildIds(['BUILD_ID=' + 'b'.repeat(40), 'BUILD_ID=' + sha]), sha);
  assert.equal(mergeServiceBuildIds(['PORT=3100', 'BUILD_ID=' + sha]), sha);
  assert.throws(() => mergeServiceBuildIds(['BUILD_ID=' + sha + '\nBUILD_ID=' + sha]));
  assert.throws(() => mergeServiceBuildIds(['PORT=3100']));
});


test('rejects a stale or timestamp-only public frontend even when backend identity agrees', () => {
  for (const frontendSha of ['b'.repeat(40), '1793277134644', null]) {
    const state = healthy();
    state.publicFrontendVersionSha = frontendSha;
    assert.ok(verifyHostRuntimeIdentity(state).failures.includes('public_frontend_sha_mismatch'));
  }
});

test('rejects a synthetic public Treasury 200 even when all source identities agree', () => {
  const state = healthy();
  state.publicTreasury.status = 200;
  state.publicTreasury.body = { ok: true, recentLedger: [{ id: 'disb-101' }] };
  assert.ok(verifyHostRuntimeIdentity(state).failures.includes('public_treasury_not_fail_closed'));
});

test('rejects unverifiable Treasury payloads and missing privacy cache controls', () => {
  for (const change of [
    (s) => { s.publicTreasury.cacheControl = 'public, max-age=300'; },
    (s) => { s.publicTreasury.body.recentLedger = [{ id: 'disb-101' }]; },
    (s) => { s.publicTreasury.body.overview.totalBalanceWld = '60,000,000'; },
    (s) => { s.publicTreasury.body.code = 'OK'; },
    (s) => { s.publicTreasury = null; },
  ]) {
    const state = healthy();
    change(state);
    assert.ok(verifyHostRuntimeIdentity(state).failures.includes('public_treasury_not_fail_closed'));
  }
});

test('production channel also requires independent frontend and Treasury evidence', () => {
  const state = healthy();
  state.channel = 'prod';
  state.manifest.channel = 'prod';
  assert.deepEqual(verifyHostRuntimeIdentity(state), { ok: true, failures: [] });
  state.publicFrontendVersionSha = '1793277134644';
  assert.ok(verifyHostRuntimeIdentity(state).failures.includes('public_frontend_sha_mismatch'));
});
