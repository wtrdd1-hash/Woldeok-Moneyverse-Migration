import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

function makeSource(root) {
  const source = path.join(root, 'source');
  mkdirSync(path.join(source, 'backend', 'dist'), { recursive: true });
  mkdirSync(path.join(source, 'frontend', '.next'), { recursive: true });
  writeFileSync(path.join(source, 'backend', 'dist', 'main.js'), 'console.log("ok");\n');
  writeFileSync(path.join(source, 'frontend', '.next', 'BUILD_ID'), 'candidate-build\n');
  git(source, 'init');
  git(source, 'config', 'user.email', 'ci@example.invalid');
  git(source, 'config', 'user.name', 'CI');
  git(source, 'add', '.');
  git(source, 'commit', '-m', 'candidate');
  return { source, sha: git(source, 'rev-parse', 'HEAD') };
}

test('stages a new exact-SHA host release without Git metadata and refuses overwrite', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'moneyverse-host-release-'));
  const releaseRoot = path.join(root, 'releases');
  const { source, sha } = makeSource(root);

  const target = execFileSync(
    'bash',
    ['ops/release/stage-host-release.sh', 'test', 'v543', sha, source, releaseRoot],
    { cwd: process.cwd(), encoding: 'utf8' },
  ).trim();

  assert.equal(target, path.join(releaseRoot, `test-v543-${sha.slice(0, 12)}`));
  assert.equal(existsSync(path.join(target, '.git')), false);

  const manifest = JSON.parse(readFileSync(path.join(target, '.moneyverse-release.json'), 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.channel, 'test');
  assert.equal(manifest.version, 'v543');
  assert.equal(manifest.applicationSourceSha, sha);
  assert.equal(manifest.mutableGitCheckout, false);

  const duplicate = spawnSync(
    'bash',
    ['ops/release/stage-host-release.sh', 'test', 'v543', sha, source, releaseRoot],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /will not be overwritten/);
});

test('rejects a source tree whose HEAD does not match the approved SHA', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'moneyverse-host-release-sha-'));
  const releaseRoot = path.join(root, 'releases');
  const { source } = makeSource(root);
  const wrongSha = '0'.repeat(40);

  const result = spawnSync(
    'bash',
    ['ops/release/stage-host-release.sh', 'prod', 'v543', wrongSha, source, releaseRoot],
    { cwd: process.cwd(), encoding: 'utf8' },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /source HEAD mismatch/);
});
