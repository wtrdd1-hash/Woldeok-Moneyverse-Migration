import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { toWorkAssignmentSnapshot } from './work-assignment-snapshot';
import { WorkController } from './work.controller';
import type { WorkRepository } from './work.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';
const id = '22222222-2222-4222-8222-222222222222';
const taskId = '33333333-3333-4333-8333-333333333333';
const at = new Date('2026-10-26T03:00:00.000Z');
const item = {
  assignment_id: id,
  task_id: taskId,
  code: 'TASK_ONE',
  name: 'Safe example',
  job_type: 'developer',
  status: 'approved',
  assigned_at: at,
  expires_at: new Date('2026-10-26T04:00:00.000Z'),
  reward_amount: '9223372036854775807',
  experience_amount: '500',
};
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('private recent work assignment snapshot', () => {
  it('projects only 50 owner records and preserves bigint strings', () => {
    const snapshot = toWorkAssignmentSnapshot([item], at);
    expect(snapshot).toMatchObject({
      scope: 'recent_50_assignments_only',
      source: 'work_my_assignments',
      limit: 50,
      generatedAt: at.toISOString(),
      assignments: [{
        assignmentId: id,
        taskId,
        rewardAmountWld: '9223372036854775807',
        experienceAmount: '500',
      }],
    });
    expect(snapshot.assignments[0]).not.toHaveProperty('user_id');
  });

  it.each([
    null, {}, [null], [item, null], Array(51).fill(item),
    [{ ...item, reward_amount: 9007199254740992 }],
    [{ ...item, reward_amount: '-1' }],
    [{ ...item, experience_amount: '1e9' }],
    [{ ...item, assignment_id: 'invalid' }],
    [{ ...item, status: 'paid' }],
    [{ ...item, assigned_at: '2026-10-26' }],
    [{ ...item, name: 42 }],
  ])('fails closed on invalid or truncated source data %j', (data) => {
    expect(() => toWorkAssignmentSnapshot(data, at)).toThrow(ServiceUnavailableException);
  });

  it('uses only the authenticated session actor, not request parameters', async () => {
    const assignments = vi.fn().mockResolvedValue([item]);
    const controller = new WorkController({ assignments } as unknown as WorkRepository);
    const result = await controller.assignmentSnapshot(request);
    expect(assignments).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result).toMatchObject({ scope: 'recent_50_assignments_only' });
  });

  it('does not invent success if the database fails', async () => {
    const controller = new WorkController({
      assignments: vi.fn().mockRejectedValue(new Error('DB down')),
    } as unknown as WorkRepository);
    await expect(controller.assignmentSnapshot(request)).rejects.toThrow('DB down');
  });
});
