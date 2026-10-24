import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowFile = new URL('../../.github/workflows/cleanup-merged-branches.yml', import.meta.url);

test('merged PR events cannot delete source refs without ancestry proof', async () => {
  const workflow = await readFile(workflowFile, 'utf8');
  assert.doesNotMatch(workflow, /^  pull_request:/m, 'merged PR event must not trigger a deletion job');
  assert.doesNotMatch(workflow, /^  delete-merged-pr-branch:/m, 'merged PR must not delete source branch directly');
});

test('scheduled pruning requires exact merged head, main ancestry, no open PR, and a lease', async () => {
  const workflow = await readFile(workflowFile, 'utf8');
  assert.match(workflow, /git for-each-ref --merged=/);
  assert.match(workflow, /git merge-base --is-ancestor/);
  assert.match(workflow, /\$1==b && \$2==s/);
  assert.match(workflow, /grep -Fxq .*open_heads/);
  assert.match(workflow, /pulls\?state=open&per_page=100/, 'open PRs targeting stacked branches must also be retained');
  assert.doesNotMatch(workflow, /pulls\?state=open&base=main/, 'base=main excludes stacked PRs');
  assert.match(workflow, /--force-with-lease=/);
  assert.doesNotMatch(workflow, /gh pr merge/);
});

test('squash merge retains unique source tip while direct merge permits ancestry proof', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mv-branch-cleanup-'));
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    git('init', '-q', '-b', 'main');
    git('config', 'user.name', 'Test');
    git('config', 'user.email', 'test@example.invalid');
    writeFileSync(join(dir, 'base.txt'), 'base\n');
    git('add', '.');
    git('commit', '-qm', 'base');
    git('switch', '-qc', 'squash-source');
    writeFileSync(join(dir, 'feature.txt'), 'unique source commit\n');
    git('add', '.');
    git('commit', '-qm', 'feature');
    const squashSourceSha = git('rev-parse', 'HEAD');
    git('switch', 'main');
    git('merge', '--squash', 'squash-source');
    git('commit', '-qm', 'squashed feature');
    const mainAfterSquash = git('rev-parse', 'HEAD');
    assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', squashSourceSha, mainAfterSquash], { cwd: dir }).status, 1);
    assert.doesNotMatch(git('for-each-ref', `--merged=${mainAfterSquash}`, '--format=%(refname:short)', 'refs/heads'), /^squash-source$/m);

    git('switch', '-qc', 'direct-source');
    writeFileSync(join(dir, 'direct.txt'), 'directly merged\n');
    git('add', '.');
    git('commit', '-qm', 'direct feature');
    const directSourceSha = git('rev-parse', 'HEAD');
    git('switch', 'main');
    git('merge', '--no-ff', '-m', 'merge direct source', 'direct-source');
    const mainAfterDirect = git('rev-parse', 'HEAD');
    assert.equal(spawnSync('git', ['merge-base', '--is-ancestor', directSourceSha, mainAfterDirect], { cwd: dir }).status, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
