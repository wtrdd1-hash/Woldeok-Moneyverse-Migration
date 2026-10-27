import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const filter = fileURLToPath(new URL('./select-integration-prs.jq', import.meta.url));
const workflow = fileURLToPath(new URL('../../.github/workflows/auto-integrate-promote.yml', import.meta.url));
const pr = (ref, { draft = false, title = 'fix: verified change', labels = [], fork = false } = {}) => ({
  head: { ref, repo: { full_name: fork ? 'outsider/fork' : 'owner/repo' } },
  base: { repo: { full_name: 'owner/repo' } },
  draft, title, labels: labels.map((name) => ({ name })),
});
const select = (pages) => execFileSync('jq', ['-r', '-f', filter], {
  input: pages.map((page) => JSON.stringify(page)).join('\n'), encoding: 'utf8',
}).trim().split('\n').filter(Boolean);

test('270 allowlisted draft PRs and 15 non-allowlisted ready PRs cause zero per-branch candidates', () => {
  const drafts = Array.from({ length: 270 }, (_, i) => pr(`auto/work-in-progress-${i}`, { draft: true }));
  const ready = Array.from({ length: 15 }, (_, i) => pr(i < 13 ? `dependabot/upgrade-${i}` : `audit/report-${i}`));
  const all = [...drafts, ...ready];
  assert.deepEqual(select([all.slice(0, 100), all.slice(100, 200), all.slice(200)]), []);
});

test('only eligible same-repository, ready, unblocked PRs are selected', () => {
  assert.deepEqual(select([[
    pr('auto/verified-ready'), pr('fix/verified-ready'),
    pr('auto/draft', { draft: true }),
    pr('auto/hold', { labels: ['HOLD'] }),
    pr('auto/do-not-merge', { labels: ['Do-Not-Merge'] }),
    pr('auto/wip-title', { title: 'WIP: unfinished' }),
    pr('auto/draft-title', { title: 'Draft: incomplete' }),
    pr('auto/foreign', { fork: true }),
    pr('planning/hold'), pr('release/hold'), pr('main'),
  ]]), ['auto/verified-ready', 'fix/verified-ready']);
});

test('unknown draft state fails closed, and pagination includes later eligible ready heads', () => {
  const pages = [Array.from({ length: 100 }, (_, i) => pr(`auto/draft-${i}`, { draft: true })),
    [pr('auto/unknown', { draft: null }), pr('security/ready')]];
  assert.deepEqual(select(pages), ['security/ready']);
});

test('workflow fails closed on snapshot API errors and retains exact-head merge guard', () => {
  const source = readFileSync(workflow, 'utf8');
  assert.match(source, /if ! gh api --paginate/);
  assert.match(source, /select-integration-prs\.jq/);
  assert.match(source, /--match-head-commit "\$branch_sha"/);
  assert.match(source, /current_head.*branch_sha|branch_sha.*current_head/);
});


test('GitHub 403 snapshot failure exits BLOCKED before any branch REST or merge', () => {
  const repo = mkdtempSync(join(tmpdir(), 'mv-auto-integrate-403-'));
  try {
    execFileSync('git', ['init', '-q', repo]);
    const bin = join(repo, 'bin');
    mkdirSync(bin);
    const gh = join(bin, 'gh');
    writeFileSync(gh, '#!/bin/sh\necho "$*" >> "$GH_CALL_LOG"\necho "gh: API rate limit exceeded for installation (HTTP 403)" >&2\nexit 1\n');
    chmodSync(gh, 0o755);
    const lines = readFileSync(workflow, 'utf8').split('        run: |\n')[1].split('\n');
    const script = lines.map((line) => line.startsWith('          ') ? line.slice(10) : line).join('\n');
    const log = join(repo, 'gh-calls.log');
    const result = spawnSync('bash', ['-c', script], {
      cwd: repo, encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`,
        GH_CALL_LOG: log, REPO: 'owner/repo', GITHUB_REPOSITORY_OWNER: 'owner',
        GITHUB_STEP_SUMMARY: join(repo, 'summary') },
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /API rate limit exceeded/);
    assert.match(result.stdout, /BLOCKED: failed to enumerate all open PRs/);
    assert.equal(readFileSync(log, 'utf8').trim().split('\n').length, 1);
    assert.match(readFileSync(log, 'utf8'), /pulls\?state=open&base=main&per_page=100/);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});


test('ready PR must still be ready and same exact head immediately before merge', () => {
  const source = readFileSync(workflow, 'utf8');
  const mergeBlock = source.split('if [[ "$mergeable" == "true"')[1].split('gh pr merge')[0];
  assert.match(mergeBlock, /fresh_pr_json=/);
  assert.match(mergeBlock, /fresh_draft=/);
  assert.match(mergeBlock, /fresh_blocked_label=/);
  assert.match(mergeBlock, /fresh_title_blocked=/);
  assert.match(mergeBlock, /current_head.*branch_sha|branch_sha.*current_head/);
});
