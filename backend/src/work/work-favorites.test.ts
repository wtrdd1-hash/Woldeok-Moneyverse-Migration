import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { WorkRepository, WorkInputError } from './work.repository';
import { WorkController } from './work.controller';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const TASK = '00000000-0000-4000-8000-000000000002';

describe('member work favorites', () => {
  it('defaults to a disabled feature until explicit release approval', async () => {
    const previous = process.env.WORK_FAVORITES_ENABLED;
    delete process.env.WORK_FAVORITES_ENABLED;
    try {
      const controller = new WorkController(null);
      await expect(controller.favorites({} as never)).rejects.toThrow('work favorites are not enabled');
    } finally {
      if (previous === undefined) delete process.env.WORK_FAVORITES_ENABLED;
      else process.env.WORK_FAVORITES_ENABLED = previous;
    }
  });

  it('reads owner-scoped favorites through a definer function, never the table', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ task_id: TASK }] });
    const repository = new WorkRepository({ query } as unknown as Queryable);
    expect(await repository.favorites(ACTOR)).toEqual([TASK]);
    expect(query.mock.calls[0]?.[0]).toContain('public.work_favorites_list');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR]);
  });

  it('sets an explicit state and returns the authoritative saved receipt', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ saved: true, replayed: false }] });
    const repository = new WorkRepository({ query } as unknown as Queryable);
    expect(await repository.setFavorite(ACTOR, TASK, true)).toEqual({ saved: true, replayed: false });
    expect(query.mock.calls[0]?.[0]).toContain('public.work_favorite_set');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, TASK, true]);
  });

  it('rejects invalid task IDs before calling the database', async () => {
    const query = vi.fn();
    const repository = new WorkRepository({ query } as unknown as Queryable);
    await expect(repository.setFavorite(ACTOR, 'invalid', true)).rejects.toBeInstanceOf(WorkInputError);
    expect(query).not.toHaveBeenCalled();
  });
});
