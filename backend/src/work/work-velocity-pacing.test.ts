import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import * as dbModule from '../core/db';
import { WorkRepository } from './work.repository';

describe('Work Monetary Velocity & Reward Pacing Engine', () => {
  const mockPool = {} as Queryable;
  const repository = new WorkRepository(mockPool);
  const testUserId = '11111111-2222-3333-4444-555555555555';

  it('computes monetary velocity and pacing attributes for fresh tasks', async () => {
    const mockTasks = [
      {
        task_id: '77777777-0101-4000-8000-000000000001',
        code: 'dev_refactor',
        name: '코드 리팩터링 및 성능 튜닝',
        description: '리팩터링 수행',
        job_type: 'developer',
        difficulty: 2,
        base_reward: '200',
        base_experience: '50',
        minimum_duration_seconds: 60,
        daily_limit: 5,
        taken_today: 0,
        reward_preview: '220',
        experience_preview: '55',
        recommended: true,
      },
    ];

    vi.spyOn(dbModule, 'queryRows').mockResolvedValueOnce(mockTasks);

    const result = await repository.tasks(testUserId);
    expect(result).toHaveLength(1);
    const task = result[0];

    expect(task.policy_version).toBe('v2026.09.23.401');
    expect(task.settlement_mode).toBe('ACTIVE');
    expect(task.expected_work_seconds).toBe(60);
    expect(typeof task.eligible_submit_at).toBe('string');
    expect(task.repeat_factor).toBe('1.0000');
    expect(task.issuance_factor).toBe('1.0000');
    expect(task.net_reward).toBe('220');
    expect(task.reason_codes).toEqual(['OPTIMAL_REWARD', 'CAREER_AFFINITY_BONUS']);
  });

  it('applies repeat decay to repeated tasks and sets REPEAT_DECAY_APPLIED reason code', async () => {
    const mockTasks = [
      {
        task_id: '77777777-0101-4000-8000-000000000001',
        code: 'dev_refactor',
        name: '코드 리팩터링 및 성능 튜닝',
        description: '리팩터링 수행',
        job_type: 'developer',
        difficulty: 2,
        base_reward: '200',
        base_experience: '50',
        minimum_duration_seconds: 60,
        daily_limit: 5,
        taken_today: 2, // 2 completed today -> 1.0 - 0.30 = 0.70 repeat factor
        reward_preview: '200',
        experience_preview: '50',
        recommended: false,
      },
    ];

    vi.spyOn(dbModule, 'queryRows').mockResolvedValueOnce(mockTasks);

    const result = await repository.tasks(testUserId);
    expect(result).toHaveLength(1);
    const task = result[0];

    expect(task.repeat_factor).toBe('0.7000');
    expect(task.net_reward).toBe('140'); // 200 * 0.7 = 140
    expect(task.reason_codes).toEqual(['REPEAT_DECAY_APPLIED']);
  });
});
