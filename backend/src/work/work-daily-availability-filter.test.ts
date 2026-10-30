import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { WorkController } from './work.controller';
import { parseWorkTaskAvailableOnly, WorkInputError, WorkRepository } from './work.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('work task daily availability filter', () => {
  it('accepts only the explicit opt-in and rejects arrays, booleans, and spoofed values', () => {
    expect(parseWorkTaskAvailableOnly(undefined)).toBe(false);
    expect(parseWorkTaskAvailableOnly('1')).toBe(true);
    for (const value of ['0', 'true', '', '01', ['1', '1'], 1, true, null]) {
      expect(() => parseWorkTaskAvailableOnly(value)).toThrow(WorkInputError);
    }
  });

  it('uses the authenticated actor and combines reward, duration, and availability', async () => {
    const tasks = vi.fn(async () => []);
    const controller = new WorkController({
      featureState: async () => 'enabled',
      tasks,
    } as unknown as WorkRepository);
    expect(await controller.tasks(request, '9007199254740993', '300', undefined, '1')).toEqual({
      featureState: 'enabled',
      tasks: [],
    });
    expect(tasks).toHaveBeenCalledWith(actor, '9007199254740993', 300, undefined, '1');
    await expect(
      controller.tasks(request, undefined, undefined, undefined, ['1', '1']),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tasks).toHaveBeenCalledTimes(1);
  });

  it('filters in PostgreSQL using owner-scoped board and includes unlimited tasks', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new WorkRepository({ query } as never);
    await repo.tasks(actor, '9007199254740993', 600, undefined, true);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('public.work_task_board($1)');
    expect(sql).toContain('task.reward_preview >= $2::numeric');
    expect(sql).toContain('task.minimum_duration_seconds <= $3::integer');
    expect(sql).toContain('(task.daily_limit <= 0 OR task.taken_today < task.daily_limit)');
    expect(params).toEqual([actor, '9007199254740993', 600]);
  });
});
