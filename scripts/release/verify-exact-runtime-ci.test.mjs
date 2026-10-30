import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { verifyExactRuntimeCi } from './verify-exact-runtime-ci.mjs';

const SHA = 'a'.repeat(40);
const run = { id: 501, name: 'CI', head_sha: SHA, head_branch: 'main', event: 'push', status: 'completed', conclusion: 'success' };
const job = { id: 700, run_id: 501, head_sha: SHA, name: 'runtime-check', status: 'completed', conclusion: 'success' };
const evidence = (runs = [run], jobs = [job]) => ({ sha: SHA, runId: 501, runs: { workflow_runs: runs }, jobs: { total_count: jobs.length, jobs } });

test('accepts only completed exact-main push CI and its successful runtime-check job', () => {
  assert.deepEqual(verifyExactRuntimeCi(evidence()), { sha: SHA, runId: 501, jobId: 700 });
});

test('rejects a skipped runtime-check even when the overall CI run says success', () => {
  assert.throws(() => verifyExactRuntimeCi(evidence([run], [{ ...job, conclusion: 'skipped' }])), /runtime-check.*SUCCESS/);
});

test('rejects a failed or incomplete runtime-check', () => {
  for (const patch of [{ conclusion: 'failure' }, { status: 'in_progress', conclusion: null }]) {
    assert.throws(() => verifyExactRuntimeCi(evidence([run], [{ ...job, ...patch }])), /runtime-check.*SUCCESS/);
  }
});

test('rejects a stale, branch, or PR CI run', () => {
  for (const patch of [{ head_sha: 'b'.repeat(40) }, { head_branch: 'fix/something' }, { event: 'pull_request' }]) {
    assert.throws(() => verifyExactRuntimeCi(evidence([{ ...run, ...patch }])), /exact main push CI/);
  }
});

test('rejects a newer failing run even if an older run for the same SHA succeeded', () => {
  assert.throws(() => verifyExactRuntimeCi(evidence([run, { ...run, id: 502, conclusion: 'failure' }])), /latest exact main push CI/);
});

test('rejects mismatched job identity, incomplete job pagination and invalid SHA', () => {
  assert.throws(() => verifyExactRuntimeCi(evidence([run], [{ ...job, run_id: 999 }])), /runtime-check.*SUCCESS/);
  assert.throws(() => verifyExactRuntimeCi(evidence([run], [{ ...job, head_sha: 'b'.repeat(40) }])), /runtime-check.*SUCCESS/);
  assert.throws(() => verifyExactRuntimeCi({ ...evidence(), jobs: { total_count: 2, jobs: [job] } }), /incomplete/);
  assert.throws(() => verifyExactRuntimeCi({ ...evidence(), sha: 'bad' }), /40-character/);
});

test('Production workflow requires exact CI before candidate manifest and Test gate', () => {
  const source = readFileSync(fileURLToPath(new URL('../../.github/workflows/deploy.yml', import.meta.url)), 'utf8');
  const guard = source.indexOf('Require exact main push CI runtime-check SUCCESS');
  assert.ok(guard > source.indexOf('Resolve attested candidate workflow run'), 'missing exact CI gate');
  assert.ok(guard < source.indexOf('Download immutable release input'), 'CI gate must precede candidate artifacts');
  assert.match(source.slice(guard, source.indexOf('Download immutable release input')), /verify-exact-runtime-ci\.mjs/);
  assert.match(source.slice(guard, source.indexOf('Download immutable release input')), /branches\/main/);
});


test('rechecks current main after Test polling and before Production registry access', () => {
  const source = readFileSync(fileURLToPath(new URL('../../.github/workflows/deploy.yml', import.meta.url)), 'utf8');
  const testGate = source.slice(source.indexOf('  test-gate:'), source.indexOf('  build:', source.indexOf('  test-gate:')));
  const beforeAttestation = testGate.indexOf('Reconfirm exact main SHA before Test attestation');
  assert.ok(beforeAttestation > testGate.indexOf('Wait for attested application source'));
  assert.ok(beforeAttestation < testGate.indexOf('Mark isolated-Test deployment attested'));
  const build = source.slice(source.indexOf('  build:', source.indexOf('  test-gate:')));
  const beforeRegistry = build.indexOf('Reconfirm current main before Production registry access');
  assert.ok(beforeRegistry > 0);
  assert.ok(beforeRegistry < build.indexOf('Log in to GHCR after classification'));
});

test('actual release shell rejects skipped CI and accepts an exact successful runtime job', async () => {
  const { chmodSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } = await import('node:fs');
  const { spawnSync } = await import('node:child_process');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const workflow = readFileSync(fileURLToPath(new URL('../../.github/workflows/deploy.yml', import.meta.url)), 'utf8');
  const section = workflow.split('      - name: Require exact main push CI runtime-check SUCCESS\n')[1]
    .split('      - name: Download immutable release input')[0];
  const script = section.split('        run: |\n')[1].split('\n')
    .map((line) => line.startsWith('          ') ? line.slice(10) : line).join('\n');
  const dir = mkdtempSync(join(tmpdir(), 'mv-exact-ci-gate-'));
  try {
    mkdirSync(join(dir, 'bin'));
    const gh = join(dir, 'bin', 'gh');
    writeFileSync(gh, `#!/bin/sh
case "$*" in
  *'/branches/main'*) echo "$EXPECTED_HEAD_SHA" ;;
  *'/actions/workflows/ci.yml/runs?'*) cat "$FIXTURE_RUNS" ;;
  *'/actions/runs/501/jobs?'*) cat "$FIXTURE_JOBS" ;;
  *) exit 2 ;;
esac
`);
    chmodSync(gh, 0o755);
    const runsFile = join(dir, 'runs.json');
    const jobsFile = join(dir, 'jobs.json');
    writeFileSync(runsFile, JSON.stringify(evidence().runs));
    const env = { ...process.env, PATH: `${join(dir, 'bin')}:${process.env.PATH}`,
      GITHUB_REPOSITORY: 'owner/repo', EXPECTED_HEAD_SHA: SHA,
      FIXTURE_RUNS: runsFile, FIXTURE_JOBS: jobsFile };
    for (const [conclusion, expected] of [['skipped', 1], ['success', 0]]) {
      writeFileSync(jobsFile, JSON.stringify(evidence([run], [{ ...job, conclusion }]).jobs));
      const result = spawnSync('bash', ['-c', script], {
        cwd: fileURLToPath(new URL('../../', import.meta.url)), encoding: 'utf8', timeout: 15_000, env,
      });
      assert.equal(result.status, expected, `${conclusion}: ${result.stderr}\n${result.stdout}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});