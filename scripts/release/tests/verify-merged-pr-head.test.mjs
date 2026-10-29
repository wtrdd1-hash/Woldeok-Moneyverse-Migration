import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('scripts/release/verify-merged-pr-head.sh');
const workflow = resolve('.github/workflows/cleanup-merged-branches.yml');

function git(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, `git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
}

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'mv-merged-head-'));
  try {
    const remote = join(root, 'origin.git');
    const local = join(root, 'local');
    git(root, 'init', '--bare', '-q', remote);
    git(root, 'clone', '-q', remote, local);
    git(local, 'config', 'user.email', 'test@example.invalid');
    git(local, 'config', 'user.name', 'Gate Test');
    writeFileSync(join(local, 'content.txt'), 'baseline\n');
    git(local, 'add', '.');
    git(local, 'commit', '-qm', 'baseline');
    git(local, 'branch', '-M', 'main');
    git(local, 'push', '-q', 'origin', 'main');
    git(local, 'switch', '-qc', 'auto/test-feature');
    writeFileSync(join(local, 'content.txt'), 'feature\n');
    git(local, 'add', '.');
    git(local, 'commit', '-qm', 'feature');
    const head = git(local, 'rev-parse', 'HEAD');
    git(local, 'push', '-q', 'origin', 'auto/test-feature');
    git(local, 'switch', '-q', 'main');
    run({ local, head, remote });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function verify(local, branch, head, main) {
  return spawnSync('bash', [script, branch, head, main], { cwd: local, encoding: 'utf8' });
}

test('exact merged head ancestor is allowed without mutating its remote ref', () => fixture(({ local, head }) => {
  git(local, 'merge', '-q', '--ff-only', 'auto/test-feature');
  git(local, 'push', '-q', 'origin', 'main');
  const main = git(local, 'rev-parse', 'main');
  const result = verify(local, 'auto/test-feature', head, main);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(local, 'ls-remote', 'origin', 'refs/heads/auto/test-feature').split('\t')[0], head);
}));

test('squash merged PR head is blocked because exact commit is not main ancestor', () => fixture(({ local, head }) => {
  git(local, 'merge', '-q', '--squash', 'auto/test-feature');
  git(local, 'commit', '-qm', 'squash feature');
  git(local, 'push', '-q', 'origin', 'main');
  const result = verify(local, 'auto/test-feature', head, git(local, 'rev-parse', 'main'));
  assert.equal(result.status, 2, result.stdout + result.stderr);
  assert.match(result.stderr, /BLOCKED.*not an ancestor/);
}));

test('head moved after merged event is blocked and retained', () => fixture(({ local, head }) => {
  git(local, 'merge', '-q', '--ff-only', 'auto/test-feature');
  git(local, 'push', '-q', 'origin', 'main');
  git(local, 'switch', '-q', 'auto/test-feature');
  writeFileSync(join(local, 'other.txt'), 'new unique work\n');
  git(local, 'add', '.');
  git(local, 'commit', '-qm', 'new work');
  git(local, 'push', '-q', 'origin', 'auto/test-feature');
  const result = verify(local, 'auto/test-feature', head, git(local, 'rev-parse', 'main'));
  assert.equal(result.status, 2);
  assert.match(result.stderr, /BLOCKED.*head changed/);
}));

test('stale main SHA and invalid branch are blocked', () => fixture(({ local, head }) => {
  git(local, 'merge', '-q', '--ff-only', 'auto/test-feature');
  git(local, 'push', '-q', 'origin', 'main');
  assert.equal(verify(local, 'auto/test-feature', head, 'a'.repeat(40)).status, 2);
  assert.equal(verify(local, 'main', head, git(local, 'rev-parse', 'main')).status, 2);
  assert.equal(verify(local, 'auto/../unsafe', head, git(local, 'rev-parse', 'main')).status, 2);
}));

test('cleanup workflow calls gate before destructive push', () => {
  const source = readFileSync(workflow, 'utf8');
  const job = source.split('prune-contained-branches:')[0];
  const guard = job.indexOf('scripts/release/verify-merged-pr-head.sh');
  const deletion = job.indexOf('git push --force-with-lease');
  assert.ok(guard > 0 && deletion > guard, 'exact-head gate must precede first deletion');
});
