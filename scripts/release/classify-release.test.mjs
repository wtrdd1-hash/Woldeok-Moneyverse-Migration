import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { CLASSIFIER_VERSION, buildReleaseInput, classifyPaths } from './classify-release.mjs';

test('classifier version is explicit', () => {
  assert.equal(CLASSIFIER_VERSION, 'release-path-v2');
});

test('Production release evidence verifier requires the current classifier version', async () => {
  const deploy = await readFile(new URL('../../.github/workflows/deploy.yml', import.meta.url), 'utf8');
  assert.match(deploy, new RegExp(`classifierVersion == \"${CLASSIFIER_VERSION}\"`));
  assert.doesNotMatch(deploy, /classifierVersion == \"release-path-v1\"/);
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

test('backend API audit tooling is release control plane', () => {
  assert.equal(
    classifyPaths(['scripts/audit-backend-api-completeness.mjs']),
    'CONTROL_PLANE_ONLY',
  );
  assert.equal(
    classifyPaths(['scripts/audit-backend-api-completeness.mjs', 'backend/src/app.module.ts']),
    'MIXED',
  );
});

test('application paths are runtime relevant even with documentation', () => {
  assert.equal(
    classifyPaths(['backend/src/app.module.ts', 'docs/UPDATE_LOG.md']),
    'RUNTIME_RELEVANT',
  );
});

test('root markdown documents are classified as documentation only', () => {
  assert.equal(
    classifyPaths(['PROJECT_MEMORY.md', 'walkthrough.md', 'implementation_plan.md']),
    'DOCS_ONLY',
  );
});

test('staging and promotion scripts are release control plane', () => {
  assert.equal(
    classifyPaths(['promote_v406.sh', 'stage_v406.sh', 'scripts/qa-live-ai-news.ts']),
    'CONTROL_PLANE_ONLY',
  );
});

test('application plus release-control changes are mixed', () => {
  assert.equal(
    classifyPaths(['frontend/src/app/page.tsx', '.github/workflows/test-candidate.yml']),
    'MIXED',
  );
  assert.equal(
    classifyPaths([
      'PROJECT_MEMORY.md',
      'frontend/src/app/stocks/market-sentiment-gauge.test.ts',
      'promote_v406.sh',
    ]),
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


test('a branch created at the identical main SHA is an attested no-change event, not a failed release', () => {
  const repo = mkdtempSync(join(tmpdir(), 'moneyverse-classify-noop-'));
  try {
    const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
    git('init', '-q');
    git('-c', 'user.name=CI', '-c', 'user.email=ci@example.test', 'commit', '-q', '--allow-empty', '-m', 'base');
    const head = git('rev-parse', 'HEAD');
    const classified = buildReleaseInput({ repo, base: head, head });
    assert.equal(classified.classification, 'NO_CHANGES');
    assert.deepEqual(classified.changedPaths, []);
    assert.equal(classified.repositoryHeadSha, head);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

test('no-change inputs never enable release build or Production promotion', async () => {
  const ci = await readFile(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const candidate = await readFile(new URL('../../.github/workflows/test-candidate.yml', import.meta.url), 'utf8');
  assert.match(ci, /NO_CHANGES/);
  assert.match(candidate, /NO_CHANGES/);
  const build = candidate.split('\n  build:')[1].split('\n  non-runtime-summary:')[0];
  assert.doesNotMatch(build, /NO_CHANGES/);
  const dispatch = candidate.split('\n  dispatch-production-gate:')[1];
  assert.doesNotMatch(dispatch, /NO_CHANGES/);
});


test('automated integration only enumerates open PR branches, not every branch', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/auto-integrate-promote.yml', import.meta.url), 'utf8');
  assert.match(workflow, /pulls\?state=open&base=main&per_page=100/);
  assert.doesNotMatch(workflow, /branches\?per_page=100/);
});

test('merged branch cleanup batches PR evidence and uses local ancestry', async () => {
  const workflow = await readFile(new URL('../../.github/workflows/cleanup-merged-branches.yml', import.meta.url), 'utf8');
  assert.match(workflow, /git for-each-ref --format/);
  assert.match(workflow, /pulls\?state=closed&base=main&per_page=100/);
  assert.doesNotMatch(workflow, /\bgit\s+push\b|--force-with-lease/);
  assert.match(workflow, /Read-only merged branch retention inventory/);
});


function withDocumentFixture(run) {
  const repo = mkdtempSync(join(tmpdir(), 'moneyverse-doc-payload-'));
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
  const commit = (message) => {
    git('add', '-A');
    git('-c', 'user.name=CI', '-c', 'user.email=ci@example.test', 'commit', '-q', '-m', message);
    return git('rev-parse', 'HEAD');
  };
  try {
    git('init', '-q');
    mkdirSync(join(repo, 'docs'), { recursive: true });
    writeFileSync(join(repo, 'docs', 'guide.md'), '# Safe guide\n');
    const base = commit('base docs');
    run({ repo, git, commit, base });
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
}

test('executable and contract-like documentation paths fail closed', () => {
  for (const path of [
    'docs/embedded-script.sh',
    'docs/embedded-script.mjs',
    'docs/embedded-script.py',
    'docs/arbitrary-payload.json',
    'docs/unsafe.html',
    'docs/guide.md\nbackend/src/unsafe.ts',
  ]) {
    assert.equal(classifyPaths([path]), 'UNKNOWN', path);
  }
  assert.equal(classifyPaths(['docs/guide.md', 'docs/images/safe.png']), 'DOCS_ONLY');
  assert.equal(classifyPaths(['docs/embedded-script.sh', 'backend/src/app.module.ts']), 'UNKNOWN');
});

test('only the generated mobile API JSON contract enters the runtime lane, never docs-only', () => {
  assert.equal(classifyPaths(['docs/mobile-api-contract.json']), 'RUNTIME_RELEVANT');
  assert.equal(classifyPaths(['docs/mobile-api-contract.json', 'backend/src/shop/shop.controller.ts']), 'RUNTIME_RELEVANT');
  assert.equal(classifyPaths(['docs/unknown.json']), 'UNKNOWN');
  withDocumentFixture(({ repo, commit, base }) => {
    const path = join(repo, 'docs', 'mobile-api-contract.json');
    writeFileSync(path, '{\"schemaVersion\":1}\n');
    const head = commit('add generated contract');
    const input = buildReleaseInput({ repo, base, head });
    assert.equal(input.classification, 'RUNTIME_RELEVANT');
    assert.equal(input.applicationSourceSha, head);
    chmodSync(path, 0o755);
    const executable = commit('make generated contract executable');
    assert.equal(buildReleaseInput({ repo, base: head, head: executable }).classification, 'UNKNOWN');
  });
});

test('executable documentation mode cannot bypass release classification', () => {
  withDocumentFixture(({ repo, commit, base }) => {
    chmodSync(join(repo, 'docs', 'guide.md'), 0o755);
    const head = commit('mark docs guide executable');
    const evidence = buildReleaseInput({ repo, base, head });
    assert.deepEqual(evidence.changedPaths, ['docs/guide.md']);
    assert.equal(evidence.classification, 'UNKNOWN');
  });
});

test('documentation symlink additions and deletions fail closed at both revisions', () => {
  withDocumentFixture(({ repo, commit, base }) => {
    symlinkSync('../outside-secret', join(repo, 'docs', 'reference.md'));
    const linked = commit('add docs symlink');
    assert.equal(buildReleaseInput({ repo, base, head: linked }).classification, 'UNKNOWN');
    unlinkSync(join(repo, 'docs', 'reference.md'));
    const deleted = commit('delete docs symlink');
    assert.equal(buildReleaseInput({ repo, base: linked, head: deleted }).classification, 'UNKNOWN');
  });
});

test('ordinary documentation changes remain docs-only, including deletions', () => {
  withDocumentFixture(({ repo, commit, base }) => {
    writeFileSync(join(repo, 'docs', 'guide.md'), '# Updated safe guide\n');
    const head = commit('update docs');
    assert.equal(buildReleaseInput({ repo, base, head }).classification, 'DOCS_ONLY');
    unlinkSync(join(repo, 'docs', 'guide.md'));
    const deleted = commit('delete safe docs');
    assert.equal(buildReleaseInput({ repo, base: head, head: deleted }).classification, 'DOCS_ONLY');
  });
});


test('NUL-delimited Git diff preserves hostile filenames rather than splitting them into safe paths', () => {
  withDocumentFixture(({ repo, commit, base }) => {
    writeFileSync(join(repo, 'docs', 'safe.md\nREADME.md'), '# Noncanonical path\n');
    const head = commit('add hostile filename');
    const evidence = buildReleaseInput({ repo, base, head });
    assert.deepEqual(evidence.changedPaths, ['docs/safe.md\nREADME.md']);
    assert.equal(evidence.classification, 'UNKNOWN');
  });
});
