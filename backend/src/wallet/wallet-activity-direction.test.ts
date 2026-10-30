import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const SESSION = '33333333-3333-4333-8333-333333333333';
const now = new Date('2026-10-28T00:00:00.000Z');
const row = (n: number) => ({
  transaction_id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  type: 'USER_TO_USER', created_at: new Date(now.getTime() - n * 1000),
  net_amount: '-900719925474099312345', cash_delta: '-900719925474099312345', bank_delta: '0',
});
beforeEach(() => vi.stubEnv('SESSION_SIGNING_KEY', 'direction-test-secret-adequate-length-123456789'));
afterEach(() => vi.unstubAllEnvs());

describe('wallet owner activity direction filter', () => {
  it('filters signed net owner posting deltas before bounded lookahead', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    await repo.activityTransactionsForUser(ACTOR, { asOf: now, since: null, direction: 'out' });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('HAVING');
    expect(sql.indexOf('HAVING')).toBeLessThan(sql.indexOf('LIMIT $7'));
    expect(sql).toContain("WHEN 'neutral' THEN 0");
    expect(params).toEqual([ACTOR, now, null, null, null, 'out', 51]);
  });

  it('binds each signed page cursor to direction, owner and session without another SQL query', async () => {
    const query = vi.fn(async () => ({ rows: Array.from({ length: 51 }, (_, i) => row(i + 1)) }));
    const service = new WalletService(new PostgresWalletRepository({ query } as unknown as Queryable), { clock: () => now });
    const first = await service.activityPage(ACTOR, SESSION, 'all', undefined, 'out');
    expect(first.hasMore).toBe(true);
    expect(first.transactions[0]?.netAmount).toBe('-900719925474099312345');
    expect(query.mock.calls[0]?.[1]?.[5]).toBe('out');
    query.mockClear();
    await expect(service.activityPage(ACTOR, SESSION, 'all', first.nextCursor!, 'in')).rejects.toThrow();
    await expect(service.activityPage(ACTOR, SESSION, 'all', first.nextCursor!, 'all')).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
    query.mockResolvedValueOnce({ rows: [row(52)] });
    const next = await service.activityPage(ACTOR, SESSION, 'all', first.nextCursor!, 'out');
    expect(next.transactions).toHaveLength(1);
    expect(query.mock.calls[0]?.[1]?.[5]).toBe('out');
  });

  it('rejects invalid or duplicated direction values before a service call', () => {
    const activityPage = vi.fn();
    const controller = new WalletController({ activityPage } as unknown as WalletService);
    const request = { session: { id: SESSION, user_id: ACTOR } } as unknown as RequestWithSession;
    expect(() => controller.activity(request, 'all', undefined, 'in&limit=5000')).toThrow();
    expect(() => controller.activity(request, 'all', undefined, ['in', 'out'] as unknown as string)).toThrow();
    expect(activityPage).not.toHaveBeenCalled();
    controller.activity(request, '7d', undefined, 'neutral');
    expect(activityPage).toHaveBeenCalledWith(ACTOR, SESSION, '7d', undefined, 'neutral');
  });
});
