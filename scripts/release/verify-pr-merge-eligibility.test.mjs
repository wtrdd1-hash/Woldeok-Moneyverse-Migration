import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyPrMergeEligibility } from './verify-pr-merge-eligibility.mjs';

const valid = () => ({
  action: 'opened',
  pull_request: {
    number: 2030,
    draft: false,
    state: 'open',
    title: 'fix: verified backend change',
    labels: [],
    base: { ref: 'main' },
    head: { sha: 'a'.repeat(40) },
  },
});

test('accepts a ready unblocked main PR with a valid source SHA', () => {
  assert.deepEqual(verifyPrMergeEligibility(valid()), {
    number: 2030, headSha: 'a'.repeat(40), status: 'eligible',
  });
});

test('allows ready stacked PRs while preserving their metadata gate', () => {
  const event = valid();
  event.pull_request.base.ref = 'auto/parent-feature';
  assert.equal(verifyPrMergeEligibility(event).status, 'eligible');
});

test('does not mistake ordinary inventory holdings titles for HOLD', () => {
  const event = valid();
  event.pull_request.title = 'feat: show inventory holdings accurately';
  assert.equal(verifyPrMergeEligibility(event).status, 'eligible');
});

test('rejects draft, missing draft state and closed PRs', () => {
  for (const draft of [true, null, undefined]) {
    const event = valid();
    event.pull_request.draft = draft;
    assert.throws(() => verifyPrMergeEligibility(event), /draft|unknown/i);
  }
  const closed = valid();
  closed.pull_request.state = 'closed';
  assert.throws(() => verifyPrMergeEligibility(closed), /open/i);
});

test('rejects HOLD and do-not-merge labels, case insensitively', () => {
  for (const label of ['HOLD', 'release-hold', 'do-not-merge', 'blocked', 'WIP']) {
    const event = valid();
    event.pull_request.labels = [{ name: label }];
    assert.throws(() => verifyPrMergeEligibility(event), /hold|blocked|merge/i);
  }
});

test('rejects HOLD, DRAFT and WIP titles even without labels', () => {
  for (const title of [
    '[A][P1][DRAFT/HOLD] Owner-private receipt filter',
    'Draft: unresolved finance gate',
    'WIP: test candidate',
    '[DO NOT MERGE] security review',
  ]) {
    const event = valid();
    event.pull_request.title = title;
    assert.throws(() => verifyPrMergeEligibility(event), /hold|draft|merge|wip/i);
  }
});

test('fails closed on malformed PR metadata', () => {
  const cases = [
    {},
    { pull_request: {} },
    { pull_request: { ...valid().pull_request, base: { ref: '' } } },
    { pull_request: { ...valid().pull_request, head: { sha: 'invalid' } } },
    { pull_request: { ...valid().pull_request, labels: null } },
    { pull_request: { ...valid().pull_request, title: null } },
  ];
  for (const event of cases) assert.throws(() => verifyPrMergeEligibility(event));
});

test('CLI fails for a real-world draft/HOLD payload and passes a ready payload', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mv-pr-gate-'));
  const script = fileURLToPath(new URL('./verify-pr-merge-eligibility.mjs', import.meta.url));
  try {
    const eventPath = join(dir, 'event.json');
    const draft = valid();
    draft.pull_request.draft = true;
    draft.pull_request.title = '[DRAFT/HOLD] unverified';
    writeFileSync(eventPath, JSON.stringify(draft));
    const blocked = spawnSync(process.execPath, [script, eventPath], { encoding: 'utf8' });
    assert.equal(blocked.status, 1, blocked.stderr);
    assert.match(blocked.stderr, /BLOCKED/);
    writeFileSync(eventPath, JSON.stringify(valid()));
    const allowed = spawnSync(process.execPath, [script, eventPath], { encoding: 'utf8' });
    assert.equal(allowed.status, 0, allowed.stderr);
    assert.match(allowed.stdout, /eligible/);
    const fromEnvironment = spawnSync(process.execPath, [script], {
      encoding: 'utf8', env: { ...process.env, GITHUB_EVENT_PATH: eventPath },
    });
    assert.equal(fromEnvironment.status, 0, fromEnvironment.stderr);
    assert.match(fromEnvironment.stdout, /eligible/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('required CI policy rechecks PR metadata changes and runs admission before other gates', () => {
  const workflow = readFileSync(fileURLToPath(new URL('../../.github/workflows/ci.yml', import.meta.url)), 'utf8');
  assert.match(workflow, /pull_request:\s*\n\s*types:.*labeled.*unlabeled.*converted_to_draft.*ready_for_review/s);
  assert.match(workflow, /name: Reject draft and HOLD PRs before merge/);
  assert.match(workflow, /if: github\.event_name == 'pull_request'/);
  assert.match(workflow, /node scripts\/release\/verify-pr-merge-eligibility\.mjs/);
});
