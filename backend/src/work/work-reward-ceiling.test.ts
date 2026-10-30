import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { WorkInputError, WorkRepository } from './work.repository';
import { WorkController } from './work.controller';

const ACTOR = '11111111-2222-4333-8444-555555555555';
const mockDb = () => {
  const query = vi.fn(async (_sql: string, _params?: readonly unknown[]) => ({ rows: [] }));
  return { query, repository: new WorkRepository({ query } as unknown as Queryable) };
};

describe('member work preview-reward ceiling', () => {
  it('uses member-scoped function and parameterized numeric ceiling without direct catalogue SELECT', async () => {
    const { query, repository } = mockDb();
    await repository.tasks(ACTOR, undefined, undefined, '9007199254740993');
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.work_task_board($1)');
    expect(sql).toMatch(/reward_preview\s*<=\s*\$3::numeric/);
    expect(params).toEqual([ACTOR, null, '9007199254740993']);
    expect(sql).not.toMatch(/FROM\s+public\.work_task_catalog/i);
  });

  it('combines reward floor, duration, and ceiling without rounding or reordering', async () => {
    const { query, repository } = mockDb();
    await repository.tasks(ACTOR, '100', 300, '9007199254740993');
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toMatch(/reward_preview\s*>=\s*\$2::numeric/);
    expect(sql).toMatch(/minimum_duration_seconds\s*<=\s*\$3::integer/);
    expect(sql).toMatch(/reward_preview\s*<=\s*\$4::numeric/);
    expect(params).toEqual([ACTOR, '100', 300, '9007199254740993']);
  });

  it.each(['-1', '01', '1.5', '1e3', ' 100', '100 ', '', '9999999999999999999', 'NaN', 'Infinity'])(
    'rejects malformed ceiling %s before querying',
    async (raw) => {
      const { query, repository } = mockDb();
      await expect(repository.tasks(ACTOR, undefined, undefined, raw)).rejects.toBeInstanceOf(
        WorkInputError,
      );
      expect(query).not.toHaveBeenCalled();
    },
  );

  it('rejects a contradictory range and duplicate query params', async () => {
    const { query, repository } = mockDb();
    await expect(repository.tasks(ACTOR, '101', undefined, '100')).rejects.toBeInstanceOf(
      WorkInputError,
    );
    await expect(
      repository.tasks(ACTOR, undefined, undefined, ['100', '200']),
    ).rejects.toBeInstanceOf(WorkInputError);
    expect(query).not.toHaveBeenCalled();
  });

  it('preserves existing unfiltered calls and accepts exact zero', async () => {
    const { query, repository } = mockDb();
    await repository.tasks(ACTOR);
    await repository.tasks(ACTOR, undefined, undefined, '0');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, null]);
    expect(query.mock.calls[1]?.[1]).toEqual([ACTOR, null, '0']);
  });

  it('maps invalid maxReward to HTTP 400 and passes only session actor to repository', async () => {
    const tasks = vi.fn(async () => []);
    const featureState = vi.fn(async () => 'enabled');
    const controller = new WorkController({ tasks, featureState } as unknown as WorkRepository);
    const request = { session: { user_id: ACTOR } };
    await expect(
      controller.tasks(request as Parameters<WorkController['tasks']>[0], undefined, undefined, [
        '100',
        '200',
      ]),
    ).rejects.toMatchObject({ status: 400 });
    await controller.tasks(request as Parameters<WorkController['tasks']>[0], '10', '300', '200');
    expect(tasks).toHaveBeenCalledWith(ACTOR, '10', 300, '200');
  });
});
