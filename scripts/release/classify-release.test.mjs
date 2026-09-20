import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { CLASSIFIER_VERSION, classifyPaths } from './classify-release.mjs';

test('classifier version is explicit', () => {
  assert.equal(CLASSIFIER_VERSION, 'release-path-v1');
});

test('documentation-only paths do not enter a runtime lane', () => {
  assert.equal(classifyPaths(['docs/planning/PROJECT_PLAN.md', 'README.md']), 'DOCS_ONLY');
});

test('control-plane-only paths do not pretend to be application runtime', () => {
  assert.equal(
    classifyPaths(['.github/workflows/deploy.yml', 'scripts/release/classify-release.mjs']),
    'CONTROL_PLANE_ONLY',
  );
});

test('backup and restore tooling is release control plane', () => {
  assert.equal(classifyPaths(['scripts/backup/verify-backup-evidence.mjs']), 'CONTROL_PLANE_ONLY');
  assert.equal(
    classifyPaths(['scripts/backup/verify-backup-evidence.mjs', 'package.json']),
    'MIXED',
  );
});

test('application paths are runtime relevant even with documentation', () => {
  assert.equal(
    classifyPaths(['backend/src/app.module.ts', 'docs/UPDATE_LOG.md']),
    'RUNTIME_RELEVANT',
  );
});

test('application plus release-control changes are mixed', () => {
  assert.equal(
    classifyPaths(['frontend/src/app/page.tsx', '.github/workflows/test-candidate.yml']),
    'MIXED',
  );
});

test('unclassified paths fail closed', () => {
  assert.equal(classifyPaths(['unexpected-root-config.toml']), 'UNKNOWN');
  assert.equal(classifyPaths([]), 'UNKNOWN');
  assert.equal(classifyPaths(['../outside']), 'UNKNOWN');
});

test('CI keeps package/database work behind runtime classification', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
  assert.match(workflow, /workflow_call:[\s\S]*classification:/);
  assert.match(workflow, /runtime-check:[\s\S]*needs\.classify\.outputs\.classification == 'RUNTIME_RELEVANT'/);
  assert.match(workflow, /runtime-check:[\s\S]*needs\.classify\.outputs\.classification == 'MIXED'/);
  const policy = workflow.slice(workflow.indexOf('  policy:'), workflow.indexOf('  runtime-check:'));
  assert.doesNotMatch(policy, /pnpm install|postgres:|ci-apply\.sh/);
});

test('candidate workflow publishes identity and digest evidence', async () => {
  const workflow = await readFile(
    new URL('../../.github/workflows/test-candidate.yml', import.meta.url),
    'utf8',
  );
  for (const needle of [
    'release-input.json',
    'candidate-manifest.json',
    'application_source_sha',
    'backendDigest',
    'frontendDigest',
    'migrationSetHash',
  ]) {
    assert.match(workflow, new RegExp(needle));
  }
  assert.match(workflow, /classification: \$\{\{ needs\.release-input\.outputs\.classification \}\}/);
});

test('production workflow consumes candidate evidence and polls application identity', async () => {
  const workflow = await readFile(
    new URL('../../.github/workflows/deploy.yml', import.meta.url),
    'utf8',
  );
  assert.match(workflow, /candidate_run_id/);
  assert.match(workflow, /candidate-manifest/);
  assert.match(workflow, /APPLICATION_SOURCE_SHA/);
  assert.doesNotMatch(workflow, /RELEASE_SHA: \$\{\{ steps\.release\.outputs\.sha \}\}/);
});
