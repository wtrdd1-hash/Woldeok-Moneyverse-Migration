import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPrRetention } from './audit-pr-retention.mjs';

const sha = (digit) => digit.repeat(40);
const pr = (number, headSha, state = 'OPEN', mergedAt = null) => ({
  number, headRefName: `auto/feature-${number}`, headRefOid: headSha,
  state, mergedAt,
});
const args = ({ baseline, current, ancestry = [], mainSha = sha('f') }) =>
  ({ baseline, current, ancestry, mainSha });

test('exact open draft PR with matching branch SHA is retained', () => {
  const p = pr(1, sha('a'));
  const report = auditPrRetention(args({ baseline: [p], current: [p],
    ancestry: [{ sha: sha('a'), branch: p.headRefName, behind_by: 3 }] }));
  assert.equal(report.status, 'PASS');
  assert.equal(report.unsafe.length, 0);
});

test('unmerged closed non-ancestor PR is BLOCKED and retains exact recovery pointer', () => {
  const p = pr(2, sha('b'));
  const report = auditPrRetention(args({ baseline: [p], current: [{ ...p, state: 'CLOSED' }],
    ancestry: [{ sha: sha('b'), branch: p.headRefName, behind_by: 2 }] }));
  assert.equal(report.status, 'BLOCKED');
  assert.deepEqual(report.unsafe[0], { number: 2, branch: p.headRefName, sha: sha('b'), reason: 'UNMERGED_CLOSED_NONANCESTOR' });
});

test('closed unmerged ancestor still requires verified replacement evidence', () => {
  const p = pr(3, sha('c'));
  const report = auditPrRetention(args({ baseline: [p], current: [{ ...p, state: 'CLOSED' }],
    ancestry: [{ sha: sha('c'), branch: p.headRefName, behind_by: 0 }] }));
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.unsafe[0].reason, 'UNMERGED_CLOSED_UNVERIFIED');
});

test('merged PR may close, but head mutation while open is blocked', () => {
  const p = pr(4, sha('d'));
  const q = pr(5, sha('e'));
  const report = auditPrRetention(args({ baseline: [p, q], current: [
    { ...p, state: 'MERGED', mergedAt: '2026-10-29T00:00:00Z' },
    { ...q, headRefOid: sha('a') },
  ], ancestry: [{ sha: sha('d'), branch: p.headRefName, behind_by: 0 }] }));
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.unsafe.length, 1);
  assert.equal(report.unsafe[0].reason, 'HEAD_CHANGED');
});

test('missing current PR or ancestry evidence fails closed', () => {
  const p = pr(6, sha('a'));
  const report = auditPrRetention(args({ baseline: [p], current: [] }));
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.unsafe[0].reason, 'MISSING_PR_SNAPSHOT');
  const missing = auditPrRetention(args({ baseline: [p], current: [{ ...p, state: 'CLOSED' }] }));
  assert.equal(missing.unsafe[0].reason, 'UNMERGED_CLOSED_UNKNOWN_ANCESTRY');
});

test('mass closure regression: 104 unmerged non-ancestor PRs cannot pass', () => {
  const baseline = Array.from({ length: 104 }, (_, i) => pr(i + 1, String(i + 1).padStart(40, '0')));
  const current = baseline.map((p) => ({ ...p, state: 'CLOSED' }));
  const ancestry = baseline.map((p) => ({ sha: p.headRefOid, branch: p.headRefName, behind_by: 1 }));
  const report = auditPrRetention(args({ baseline, current, ancestry }));
  assert.equal(report.status, 'BLOCKED');
  assert.equal(report.unsafe.length, 104);
  assert.equal(report.safe.length, 0);
});

test('invalid or duplicate PR evidence is rejected rather than accepted as empty', () => {
  const p = pr(1, sha('a'));
  assert.throws(() => auditPrRetention(args({ baseline: [p, p], current: [p] })), /duplicate/i);
  assert.throws(() => auditPrRetention(args({ baseline: [], current: null })), /array/i);
});

test('merged flag alone does not prove exact head ancestry or patch equivalence', () => {
  const p = pr(7, sha('d'));
  const merged = { ...p, state: 'MERGED', mergedAt: '2026-10-29T00:00:00Z' };
  const missing = auditPrRetention(args({ baseline: [p], current: [merged] }));
  assert.equal(missing.status, 'BLOCKED');
  assert.equal(missing.unsafe[0].reason, 'MERGED_HEAD_NOT_VERIFIED');
  const diverged = auditPrRetention(args({ baseline: [p], current: [merged],
    ancestry: [{ sha: p.headRefOid, branch: p.headRefName, behind_by: 2 }] }));
  assert.equal(diverged.status, 'BLOCKED');
});

test('empty baseline cannot authorize cleanup', () => {
  assert.throws(() => auditPrRetention(args({ baseline: [], current: [] })), /empty baseline/i);
});
