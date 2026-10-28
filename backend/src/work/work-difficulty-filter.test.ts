import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import { WorkController } from './work.controller';
import type { Queryable } from '../core/db';
import { parseWorkDifficulty, WorkInputError, WorkRepository } from './work.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';

function fakePool() {
  const query = vi.fn(async () => ({ rows: [] }));
  return { query, pool: { query } as unknown as Queryable };
}

describe('canonical work task difficulty', () => {
  it.each([1, 2, 3, 4, 5])('accepts level %i', (level) => {
    expect(parseWorkDifficulty(String(level))).toBe(level);
  });

  it('preserves the unfiltered default', () => {
    expect(parseWorkDifficulty(undefined)).toBeNull();
    expect(parseWorkDifficulty('')).toBeNull();
  });

  it.each(['0', '6', '01', '2.0', ' 2', '2 ', '2&x=3', 'NaN', ['2'], 2, {}])(
    'rejects noncanonical input %j before DB access', (value) => {
      expect(() => parseWorkDifficulty(value)).toThrow(WorkInputError);
    },
  );

  it('filters inside the owner-scoped DB function result with a bound value', async () => {
    const { query, pool } = fakePool();
    await new WorkRepository(pool).tasks(ACTOR, 3);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, values] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('FROM public.work_task_board($1) AS task');
    expect(sql).toContain('WHERE task.difficulty = $2::smallint');
    expect(values).toEqual([ACTOR, 3]);
    expect(sql).not.toMatch(/FROM\s+public\.work_task_catalog\b/i);
  });

  it('keeps the original unfiltered SQL parameters', async () => {
    const { query, pool } = fakePool();
    await new WorkRepository(pool).tasks(ACTOR);
    const [sql, values] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).not.toContain('WHERE task.difficulty');
    expect(values).toEqual([ACTOR]);
  });

  it.each([0, 6, 1.5, Number.NaN])('rejects invalid direct repository value %s', async (value) => {
    const { query, pool } = fakePool();
    await expect(new WorkRepository(pool).tasks(ACTOR, value)).rejects.toThrow(WorkInputError);
    expect(query).not.toHaveBeenCalled();
  });
});


describe('authenticated work task query controller', () => {
  const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

  it('rejects malformed filters before touching the repository', async () => {
    const repository = { featureState: vi.fn(), tasks: vi.fn() };
    const controller = new WorkController(repository as unknown as WorkRepository);
    await expect(controller.tasks(request, ['1', '2'])).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.featureState).not.toHaveBeenCalled();
    expect(repository.tasks).not.toHaveBeenCalled();
  });

  it('binds the authenticated actor, not any supplied user identifier', async () => {
    const repository = { featureState: vi.fn(async () => 'enabled'), tasks: vi.fn(async () => []) };
    const controller = new WorkController(repository as unknown as WorkRepository);
    expect(await controller.tasks(request, '4')).toEqual({ featureState: 'enabled', tasks: [] });
    expect(repository.tasks).toHaveBeenCalledWith(ACTOR, 4);
  });
});
