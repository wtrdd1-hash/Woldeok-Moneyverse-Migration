import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { WorkController } from './work.controller';
import { WorkInputError, WorkRepository } from './work.repository';

const ACTOR = '11111111-2222-4333-8444-555555555555';

function queryFixture() {
  const query = vi.fn(async (_sql: string, _values?: readonly unknown[]) => ({ rows: [] }));
  return { query, repository: new WorkRepository({ query } as unknown as Queryable) };
}

describe('recommended-only member task board', () => {
  it('keeps the default response unfiltered and constrains explicit recommendations inside the actor-scoped SQL function', async () => {
    const { query, repository } = queryFixture();
    await repository.tasks(ACTOR);
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('public.work_task_board($1)'), [ACTOR, false]);
    await repository.tasks(ACTOR, 'true');
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('task.recommended'), [ACTOR, true]);
    expect(query.mock.lastCall?.[0]).toContain('$2::boolean');
    await repository.tasks(ACTOR, 'false');
    expect(query.mock.lastCall?.[1]).toEqual([ACTOR, false]);
  });

  it.each(['TRUE', '1', 'yes', '', ['true', 'false'], {}, null])(
    'rejects invalid or ambiguous query values without executing SQL: %j', async (value) => {
      const { query, repository } = queryFixture();
      await expect(repository.tasks(ACTOR, value)).rejects.toBeInstanceOf(WorkInputError);
      expect(query).not.toHaveBeenCalled();
    },
  );

  it('passes the exact member and query to the repository through the guarded controller', async () => {
    const tasks = vi.fn(async () => []);
    const controller = new WorkController({
      tasks,
      featureState: async () => 'enabled',
    } as unknown as WorkRepository);
    const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
    await expect(controller.tasks(request, 'true')).resolves.toEqual({ featureState: 'enabled', tasks: [] });
    expect(tasks).toHaveBeenCalledWith(ACTOR, 'true');
    const real = new WorkRepository({ query: vi.fn() } as unknown as Queryable);
    const rejecting = new WorkController({
      tasks: (actor: string, value: unknown) => real.tasks(actor, value),
      featureState: async () => 'enabled',
    } as unknown as WorkRepository);
    await expect(rejecting.tasks(request, 'invalid')).rejects.toBeInstanceOf(BadRequestException);
  });
});
