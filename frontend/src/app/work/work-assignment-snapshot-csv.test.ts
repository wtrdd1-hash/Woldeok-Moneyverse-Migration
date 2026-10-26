import { describe, expect, it } from 'vitest';
import { workAssignmentSnapshotCsv } from './work-assignment-snapshot-csv';

const id = '22222222-2222-4222-8222-222222222222';
const taskId = '33333333-3333-4333-8333-333333333333';
const valid = {
  scope: 'recent_50_assignments_only',
  source: 'work_my_assignments',
  limit: 50,
  generatedAt: '2026-10-26T03:00:00.000Z',
  assignments: [{
    assignmentId: id, taskId, code: 'TASK_ONE', name: 'Safe example',
    jobType: 'developer', status: 'approved',
    assignedAt: '2026-10-26T02:00:00.000Z',
    expiresAt: '2026-10-26T04:00:00.000Z',
    rewardAmountWld: '9223372036854775807', experienceAmount: '500',
  }],
};

describe('work assignment history CSV', () => {
  it('exports bounded recent assignments and keeps WLD as exact decimal text', () => {
    const csv = workAssignmentSnapshotCsv(valid);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"9223372036854775807"');
    expect(csv).toContain('Recent 50 assignments only');
    expect(csv).not.toContain('user_id');
  });

  it('escapes formula injection, quotes and line controls', () => {
    const csv = workAssignmentSnapshotCsv({
      ...valid,
      assignments: [{ ...valid.assignments[0], name: '=\u202eHYPERLINK("x")\n' }],
    });
    expect(csv).toContain('"\u0027= HYPERLINK(""x"")"');
    expect(csv).not.toContain('\u202e');
  });

  it.each([
    null, {}, { ...valid, scope: 'full_history' },
    { ...valid, assignments: Array(51).fill(valid.assignments[0]) },
    { ...valid, assignments: [{ ...valid.assignments[0], rewardAmountWld: 1 }] },
    { ...valid, assignments: [{ ...valid.assignments[0], rewardAmountWld: '1e8' }] },
    { ...valid, assignments: [{ ...valid.assignments[0], status: 'unknown' }] },
  ])('fails closed on invalid data %j', (value) => {
    expect(() => workAssignmentSnapshotCsv(value)).toThrow();
  });
});
