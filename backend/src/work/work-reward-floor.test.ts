import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { WorkInputError, WorkRepository } from './work.repository';
import { WorkController } from './work.controller';

const ACTOR = '11111111-2222-4333-8444-555555555555';
const mockDb = () => {
  const query = vi.fn(async (_sql: string, _params?: readonly unknown[]) => ({ rows: [] }));
  return { query, repository: new WorkRepository({ query } as unknown as Queryable) };
};

describe('member work minimum reward filter', () => {
  it('uses only actor-scoped work_task_board and a parameterized numeric floor', async () => {
    const { query, repository } = mockDb();
    await repository.tasks(ACTOR, '9007199254740993');
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.work_task_board($1)');
    expect(sql).toMatch(/reward_preview\s*>=\s*\$2::numeric/);
    expect(params).toEqual([ACTOR, '9007199254740993']);
    expect(sql).not.toMatch(/FROM\s+public\.work_task_catalog/i);
  });

  it.each(['-1', '1.5', '1e3', '01', ' 20', '9999999999999999999', 'NaN'])('rejects invalid floor %s before querying', async (value) => {
    const { query, repository } = mockDb();
    await expect(repository.tasks(ACTOR, value)).rejects.toBeInstanceOf(WorkInputError);
    expect(query).not.toHaveBeenCalled();
  });

  it('keeps the existing unfiltered board and permits zero', async () => {
    const { query, repository } = mockDb();
    await repository.tasks(ACTOR);
    await repository.tasks(ACTOR, '0');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, null]);
    expect(query.mock.calls[1]?.[1]).toEqual([ACTOR, '0']);
  });

  it('maps malformed member query input to HTTP 400 rather than an internal error', async () => {
    const { repository } = mockDb();
    const controller = new WorkController({
      tasks: repository.tasks.bind(repository),
      featureState: async () => 'enabled',
    } as unknown as WorkRepository);
    const request = { session: { user_id: ACTOR } };
    await expect(controller.tasks(request as Parameters<WorkController['tasks']>[0], '1e3')).rejects.toMatchObject({ status: 400 });
  });

  it('passes only the authenticated session actor and query floor to repository', async () => {
    const tasks = vi.fn(async () => []);
    const featureState = vi.fn(async () => 'enabled');
    const controller = new WorkController({ tasks, featureState } as unknown as WorkRepository);
    const request = { session: { user_id: ACTOR } };
    await controller.tasks(request as Parameters<WorkController['tasks']>[0], '100');
    expect(tasks).toHaveBeenCalledWith(ACTOR, '100');
  });
});
