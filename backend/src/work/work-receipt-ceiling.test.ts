import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { WorkInputError, WorkRepository } from './work.repository';
import { WorkController } from './work.controller';

const ACTOR = '11111111-2222-4333-8444-555555555555';
const setup = () => {
  const query = vi.fn(async (_sql: string, _params?: readonly unknown[]) => ({ rows: [] }));
  return { query, repo: new WorkRepository({ query } as unknown as Queryable) };
};
describe('owner work receipt maximum reward', () => {
  it('filters inside owner-scoped SQL after the authoritative recent-20 window', async () => {
    const { query, repo } = setup();
    await repo.receipts(ACTOR, '9007199254740993');
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.work_my_receipts($1)');
    expect(sql).toMatch(/receipt.reward_amount\s*<=\s*\$2::numeric/);
    expect(params).toEqual([ACTOR, '9007199254740993']);
    expect(sql).not.toMatch(/FROM\s+public\.work_reward_receipts\b/i);
  });
  it.each(['-1','01','1e3','1.0',' 1','9999999999999999999',''])('rejects invalid %s', async (value) => {
    const { query, repo } = setup();
    expect(() => repo.receipts(ACTOR, value)).toThrow(WorkInputError);
    expect(query).not.toHaveBeenCalled();
  });
  it('preserves unfiltered receipts and accepts zero', async () => {
    const { query, repo } = setup();
    await repo.receipts(ACTOR);
    await repo.receipts(ACTOR, '0');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, null]);
    expect(query.mock.calls[1]?.[1]).toEqual([ACTOR, '0']);
  });
  it('binds the authenticated actor and returns 400 for invalid values', async () => {
    const { query, repo } = setup();
    const controller = new WorkController(repo);
    const request = { session: { user_id: ACTOR } };
    await controller.receipts(request as Parameters<WorkController['receipts']>[0], '123');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, '123']);
    await expect(controller.receipts(request as Parameters<WorkController['receipts']>[0], '1e3')).rejects.toMatchObject({ status: 400 });
  });
});
