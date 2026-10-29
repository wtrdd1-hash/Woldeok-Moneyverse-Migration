import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';
import { SupportController } from './support.controller';
import { SupportRepository } from './support.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

describe('member support bounded status summary', () => {
  it('queries the owner-only function and never reads the underlying table', async () => {
    const query = vi.fn(async () => ({ rows: [{
      open: 2, waiting_user: 1, resolved: 3, scanned: 6,
    }] }));
    const repo = new SupportRepository({ query } as unknown as Queryable);
    expect(await repo.myThreadSummary(ACTOR)).toEqual({
      open: 2, waitingUser: 1, resolved: 3, scanned: 6, mayBeIncomplete: false,
    });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.support_my_threads($1,100)');
    expect(sql).not.toMatch(/FROM\s+public\.support_threads\b/i);
    expect(params).toEqual([ACTOR]);
  });

  it('labels a 100-row sample as potentially incomplete', async () => {
    const query = vi.fn(async () => ({ rows: [{
      open: 50, waiting_user: 20, resolved: 30, scanned: 100,
    }] }));
    const repo = new SupportRepository({ query } as unknown as Queryable);
    expect((await repo.myThreadSummary(ACTOR)).mayBeIncomplete).toBe(true);
  });

  it('fails closed when the database response is missing or malformed', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new SupportRepository({ query } as unknown as Queryable);
    await expect(repo.myThreadSummary(ACTOR)).rejects.toThrow();
  });

  it('exposes only the authenticated owner summary from the guarded controller', async () => {
    const myThreadSummary = vi.fn(async () => ({
      open: 0, waitingUser: 0, resolved: 0, scanned: 0, mayBeIncomplete: false,
    }));
    const controller = new SupportController({ myThreadSummary } as unknown as SupportRepository);
    await expect(controller.summary(request)).resolves.toMatchObject({ open: 0, scanned: 0 });
    expect(myThreadSummary).toHaveBeenCalledWith(ACTOR);
  });
});
