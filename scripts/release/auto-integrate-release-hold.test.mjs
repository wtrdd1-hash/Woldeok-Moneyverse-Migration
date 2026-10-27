import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workflow = fileURLToPath(new URL('../../.github/workflows/auto-integrate-promote.yml', import.meta.url));
const SHA = 'a'.repeat(40);

// Exercise the real workflow shell, not a rewritten approximation. The fake gh
// serves a ready PR with successful candidate CI; no real remote is contacted.
test('ready PR with build-only candidate success cannot merge, delete, or promote', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mv-release-hold-'));
  try {
    execFileSync('git', ['init', '-q', dir]);
    mkdirSync(join(dir, 'scripts', 'release'), { recursive: true });
    copyFileSync(fileURLToPath(new URL('./select-integration-prs.jq', import.meta.url)), join(dir, 'scripts', 'release', 'select-integration-prs.jq'));
    const bin = join(dir, 'bin');
    mkdirSync(bin);
    const gh = join(bin, 'gh');
    writeFileSync(gh, `#!/bin/sh
printf '%s\\n' "$*" >> "$GH_CALL_LOG"
case "$*" in
  *'--paginate'*'pulls?state=open'*) printf '%s\\n' '[{"number":12,"draft":false,"title":"fix: ready","labels":[],"head":{"ref":"fix/ready","sha":"${SHA}","repo":{"full_name":"owner/repo"}},"base":{"repo":{"full_name":"owner/repo"}}}]' ;;
  *'/branches/fix%2Fready'*) echo '${SHA}' ;;
  *'/compare/main...fix%2Fready'*) echo '{"ahead_by":1}' ;;
  *'/pulls/12'*) echo '{"number":12,"state":"open","draft":false,"title":"fix: ready","labels":[],"head":{"sha":"${SHA}"},"mergeable":true,"mergeable_state":"clean"}' ;;
  *'/pulls'*'--jq'*) echo 12 ;;
  *'/actions/workflows/test-candidate.yml/runs'*) echo 1001 ;;
  *'/branches/main'*) echo '${SHA}' ;;
  *) echo '{}' ;;
esac
exit 0
`);
    chmodSync(gh, 0o755);
    const source = readFileSync(workflow, 'utf8');
    const lines = source.split('        run: |\n')[1].split('\n');
    const script = lines.map((line) => line.startsWith('          ') ? line.slice(10) : line).join('\n');
    const calls = join(dir, 'gh-calls.log');
    const result = spawnSync('bash', ['-c', script], {
      cwd: dir, encoding: 'utf8', timeout: 15_000,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`,
        GH_CALL_LOG: calls, REPO: 'owner/repo', GITHUB_REPOSITORY_OWNER: 'owner',
        GITHUB_STEP_SUMMARY: join(dir, 'summary') },
    });
    assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
    const log = readFileSync(calls, 'utf8');
    assert.match(result.stdout, /BLOCKED: independent isolated-Test and finance\/auth\/DB\/security attestation unavailable/);
    assert.doesNotMatch(log, /pr merge|--method DELETE|workflow run.*promote=true/);
    assert.doesNotMatch(log, /workflow run test-candidate/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('automatic integration workflow never requests Production promotion', () => {
  const source = readFileSync(workflow, 'utf8');
  assert.doesNotMatch(source, /gh workflow run test-candidate\.yml[^\n]*-f promote=true/);
});