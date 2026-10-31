import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { WorkInputError, WorkRepository } from './work.repository';
import { WorkController } from './work.controller';

const ACTOR = '11111111-2222-4333-8444-555555555555';
const make = () => {
  const query = vi.fn(async (_sql: string, _params?: readonly unknown[]) => ({ rows: [] }));
  return { query, repository: new WorkRepository({ query } as unknown as Queryable) };
};

describe('member work minimum preview EXP', () => {
  it('filters the actor-scoped work board with exact numeric EXP, not a table grant', async () => {
    const { query, repository } = make();
    await repository.tasks(ACTOR, undefined, undefined, undefined, '9007199254740993');
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.work_task_board($1)');
    expect(sql).toMatch(/public\.work_experience_preview\(\$1,\s*task\.task_id\)\s*>=\s*\$3::numeric/);
    expect(params).toEqual([ACTOR, null, '9007199254740993']);
    expect(sql).not.toMatch(/FROM\s+public\.work_task_catalog/i);
  });

  it('combines duration, reward ceiling and EXP floor without rounding', async () => {
    const { query, repository } = make();
    await repository.tasks(ACTOR, '100', 300, '1000', '9007199254740993');
    const [sql, params] = query.mock.calls[0]!;
    expect(params).toEqual([ACTOR, '100', 300, '1000', '9007199254740993']);
    expect(sql).toMatch(/work_experience_preview\(\$1,\s*task\.task_id\)\s*>=\s*\$5::numeric/);
  });

  it.each(['', '-1', '01', '1.0', '1e2', ' 1', '1 ', '9999999999999999999', 'Infinity', ['1', '2'], 10])(
    'rejects invalid minimum EXP %s before SQL', async (raw) => {
      const { query, repository } = make();
      await expect(repository.tasks(ACTOR, undefined, undefined, undefined, raw)).rejects.toBeInstanceOf(WorkInputError);
      expect(query).not.toHaveBeenCalled();
    },
  );

  it('keeps legacy default and accepts exact zero', async () => {
    const { query, repository } = make();
    await repository.tasks(ACTOR);
    await repository.tasks(ACTOR, undefined, undefined, undefined, '0');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, null]);
    expect(query.mock.calls[1]?.[1]).toEqual([ACTOR, null, '0']);
  });

  it('preserves exact 0/1 WLD ceilings alongside the EXP filter', async () => {
    const tasks = vi.fn(async () => []);
    const featureState = vi.fn(async () => 'enabled');
    const controller = new WorkController({ tasks, featureState } as unknown as WorkRepository);
    const req = { session: { user_id: ACTOR } } as Parameters<WorkController['tasks']>[0];
    await controller.tasks(req, undefined, undefined, '1', undefined, '50');
    await controller.tasks(req, undefined, undefined, '0', undefined, '50');
    expect(tasks).toHaveBeenNthCalledWith(1, ACTOR, undefined, undefined, '1', '50');
    expect(tasks).toHaveBeenNthCalledWith(2, ACTOR, undefined, undefined, '0', '50');
  });

  it('maps invalid query to 400, and passes only authenticated actor', async () => {
    const tasks = vi.fn(async () => []);
    const featureState = vi.fn(async () => 'enabled');
    const controller = new WorkController({ tasks, featureState } as unknown as WorkRepository);
    const req = { session: { user_id: ACTOR } } as Parameters<WorkController['tasks']>[0];
    await expect(controller.tasks(req, undefined, undefined, undefined, undefined, ['10', '20'])).rejects.toMatchObject({ status: 400 });
    await controller.tasks(req, undefined, '300', '1000', undefined, '50');
    expect(tasks).toHaveBeenCalledWith(ACTOR, undefined, 300, '1000', '50');
  });
});
