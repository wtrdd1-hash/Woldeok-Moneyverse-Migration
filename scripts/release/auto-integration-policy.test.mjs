import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { assessReleaseEvidence } from './auto-integration-policy.mjs';

const SHA = 'a'.repeat(40);
const MAIN = 'b'.repeat(40);
const MIGRATION = 'c'.repeat(64);

function passingEvidence() {
  return {
    currentMainSha: MAIN,
    expectedMigrationSetHash: MIGRATION,
    pr: { headSha: SHA, baseSha: MAIN, draft: false, hold: false, approved: true },
    candidate: { headSha: SHA, conclusion: 'success', migrationSetHash: MIGRATION },
    ci: { headSha: SHA, conclusion: 'success' },
    test: {
      headSha: SHA, migrationSetHash: MIGRATION, deploymentState: 'success',
      runtimeSha: SHA, backendApiDb: 'pass', authenticatedFinanceE2e: 'pass',
      postgresAcl: 'pass', backupRestore: 'pass',
      independentlyVerifiedSignedAttestation: true,
    },
    security: { headSha: SHA, audit: 'pass' },
  };
}

test('build success with pending Test is not merge authorization', () => {
  const input = passingEvidence();
  input.test.deploymentState = 'pending';
  const result = assessReleaseEvidence(input);
  assert.equal(result.manualReviewReady, false);
  assert.equal(result.automationMayMerge, false);
  assert.match(result.blockers.join(' '), /Test deployment/);
});

test('failed authenticated finance E2E blocks eligibility', () => {
  const input = passingEvidence();
  input.test.authenticatedFinanceE2e = 'fail';
  const result = assessReleaseEvidence(input);
  assert.equal(result.manualReviewReady, false);
  assert.match(result.blockers.join(' '), /finance E2E/);
});

test('stale candidate head or changed main blocks eligibility', () => {
  const input = passingEvidence();
  input.candidate.headSha = 'd'.repeat(40);
  input.currentMainSha = 'e'.repeat(40);
  const result = assessReleaseEvidence(input);
  assert.equal(result.manualReviewReady, false);
  assert.match(result.blockers.join(' '), /candidate SHA/);
  assert.match(result.blockers.join(' '), /main SHA/);
});

test('even complete synthetic evidence requires independent human merge and Production approval', () => {
  const result = assessReleaseEvidence(passingEvidence());
  assert.equal(result.manualReviewReady, true);
  assert.equal(result.automationMayMerge, false);
  assert.equal(result.automationMayPromote, false);
});

test('workflow is read-only: no automatic merge, branch deletion, reconciliation or promotion', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/auto-integrate-promote.yml', import.meta.url), 'utf8');
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /pull-requests: read/);
  assert.doesNotMatch(workflow, /(?:contents|pull-requests|actions): write/);
  assert.doesNotMatch(workflow, /gh pr merge|git push|git merge|git reset --hard|gh workflow run|--method (?:DELETE|PATCH|POST)|--delete-branch/);
});
