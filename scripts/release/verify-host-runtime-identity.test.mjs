import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { parseBuildId, verifyHostRuntimeIdentity } from './verify-host-runtime-identity.mjs';

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
  assert.equal(parseBuildId("BUILD_ID='" + sha + "'\n"), sha);
  assert.equal(parseBuildId('BUILD_ID="' + sha + '"\n'), sha);
  assert.equal(parseBuildId("BUILD_ID='" + sha + "'\\n"), sha);
  assert.equal(parseBuildId('PORT=3100\n'), null);
  assert.equal(parseBuildId('BUILD_ID=' + sha + '\nBUILD_ID=' + sha + '\n'), null);
});
