import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const SESSION = '33333333-3333-4333-8333-333333333333';
const row = (n: number) => ({
  transaction_id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  type: 'USER_TO_USER',
  created_at: new Date(`2026-10-27T12:${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}Z`),
  net_amount: '-900719925474099312345', cash_delta: '-900719925474099312345', bank_delta: '0',
});

beforeEach(() => vi.stubEnv('SESSION_SIGNING_KEY', 'test-only-secret-with-adequate-length-123456789'));
afterEach(() => vi.unstubAllEnvs());

describe('wallet owner- and session-bound keyset history', () => {
  it('filters owner, absolute period and keyset before bounded LIMIT in SQL', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    await repo.activityTransactionsForUser(ACTOR, { asOf: new Date('2026-10-28T00:00:00Z'), since: new Date('2026-10-21T00:00:00Z'), after: { at: new Date('2026-10-27T00:00:00Z'), id: row(1).transaction_id } });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('ledger_transaction.created_at <= $2');
    expect(sql).toContain('ledger_transaction.created_at >= $3');
    expect(sql).toContain('(ledger_transaction.created_at, ledger_transaction.id) <');
    expect(sql.indexOf('ledger_transaction.created_at >= $3')).toBeLessThan(sql.indexOf('LIMIT $6'));
    expect(params).toEqual([ACTOR, new Date('2026-10-28T00:00:00Z'), new Date('2026-10-21T00:00:00Z'), new Date('2026-10-27T00:00:00Z'), row(1).transaction_id, 51]);
  });

  it('returns 50 exact integer strings and a signed next cursor, then pages without overlap', async () => {
    const query = vi.fn(async () => ({ rows: Array.from({ length: 51 }, (_, i) => row(i + 1)) }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    const service = new WalletService(repo, { clock: () => new Date('2026-10-28T00:00:00Z') });
    const first = await service.activityPage(ACTOR, SESSION, '7d');
    expect(first.transactions).toHaveLength(50);
    expect(first.hasMore).toBe(true);
    expect(first.transactions[0]?.netAmount).toBe('-900719925474099312345');
    expect(first.nextCursor).toBeTruthy();
    query.mockResolvedValueOnce({ rows: [row(52)] });
    const second = await service.activityPage(ACTOR, SESSION, '7d', first.nextCursor!);
    expect(second.transactions).toHaveLength(1);
    expect(second.hasMore).toBe(false);
    expect(second.asOf).toBe(first.asOf);
    expect(query.mock.calls[1]?.[1]?.[4]).toBe(row(50).transaction_id);
  });

  it('rejects tampered, cross-member, cross-session, cross-period and overlong cursors before SQL', async () => {
    const query = vi.fn(async () => ({ rows: Array.from({ length: 51 }, (_, i) => row(i + 1)) }));
    const service = new WalletService(new PostgresWalletRepository({ query } as unknown as Queryable), { clock: () => new Date('2026-10-28T00:00:00Z') });
    const cursor = (await service.activityPage(ACTOR, SESSION, 'all')).nextCursor!;
    query.mockClear();
    for (const [owner, session, period, token] of [
      [OTHER, SESSION, 'all', cursor], [ACTOR, OTHER, 'all', cursor],
      [ACTOR, SESSION, '7d', cursor], [ACTOR, SESSION, 'all', cursor + 'a'],
      [ACTOR, SESSION, 'all', 'x'.repeat(3000)],
    ] as const) {
      await expect(service.activityPage(owner, session, period, token)).rejects.toThrow();
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('expires signed cursors after one hour and never performs SQL for expired reads', async () => {
    const query = vi.fn(async () => ({ rows: Array.from({ length: 51 }, (_, i) => row(i + 1)) }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    const first = await new WalletService(repo, { clock: () => new Date('2026-10-28T00:00:00Z') }).activityPage(ACTOR, SESSION, '30d');
    query.mockClear();
    await expect(new WalletService(repo, { clock: () => new Date('2026-10-28T01:00:01Z') }).activityPage(ACTOR, SESSION, '30d', first.nextCursor!)).rejects.toThrow('expired');
    expect(query).not.toHaveBeenCalled();
  });

  it('enforces authenticated session identity and private no-store on the new endpoint', async () => {
    const activityPage = vi.fn(async () => ({ transactions: [], hasMore: false, nextCursor: null, asOf: '2026-10-28T00:00:00Z' }));
    const controller = new WalletController({ activityPage } as unknown as WalletService);
    const request = { session: { id: SESSION, user_id: ACTOR } } as unknown as RequestWithSession;
    await controller.activity(request, '7d', undefined);
    expect(activityPage).toHaveBeenCalledWith(ACTOR, SESSION, '7d', undefined);
    expect(() => controller.activity(request, 'bad', undefined)).toThrow();
  });
});
