import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { WalletController } from './wallet.controller';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';

function repositoryWithSpy() {
  const cutoffCalls: Array<{ userId: string; limit: number; since?: Date }> = [];
  const repo = {
    balancesForUser: async () => [
      { account_type: 'USER_CASH', available_amount: '9007199254740993123456789012', updated_at: new Date('2026-10-24T00:00:00Z') },
      { account_type: 'USER_BANK', available_amount: '1', updated_at: new Date('2026-10-24T00:00:00Z') },
    ],
    recentTransactionsForUser: async (userId: string, limit: number, since?: Date) => {
      cutoffCalls.push({ userId, limit, since });
      return [];
    },
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: OWNER }),
    claimDaily: async () => ({ transactionId: OWNER, amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
  return { repo, cutoffCalls };
}

describe('owner-scoped wallet period filter', () => {
  it('computes a fixed rolling 7-day UTC cutoff without changing 38-digit balances', async () => {
    const { repo, cutoffCalls } = repositoryWithSpy();
    const wallet = new WalletService(repo, { clock: () => new Date('2026-10-24T00:00:00.000Z') });
    const result = await wallet.overview(OWNER, { recentLimit: 50, period: '7d' });
    expect(cutoffCalls).toEqual([{ userId: OWNER, limit: 50, since: new Date('2026-10-17T00:00:00.000Z') }]);
    expect(result.balances.totalAvailableAmount).toBe('9007199254740993123456789013');
  });

  it.each([['30d', '2026-09-24T00:00:00.000Z'], ['90d', '2026-07-26T00:00:00.000Z']])(
    'applies %s before the query limit', async (period, expected) => {
      const { repo, cutoffCalls } = repositoryWithSpy();
      await new WalletService(repo, { clock: () => new Date('2026-10-24T00:00:00Z') })
        .overview(OTHER, { recentLimit: 50, period });
      expect(cutoffCalls[0]).toEqual({ userId: OTHER, limit: 50, since: new Date(expected) });
    },
  );

  it('keeps the unfiltered overview backwards compatible and rejects invalid periods', async () => {
    const { repo, cutoffCalls } = repositoryWithSpy();
    const service = new WalletService(repo, { clock: () => new Date('2026-10-24T00:00:00Z') });
    await service.overview(OWNER);
    expect(cutoffCalls[0]).toEqual({ userId: OWNER, limit: 10, since: undefined });
    await expect(service.overview(OWNER, { period: '365d' })).rejects.toThrow(/period/i);
    await expect(service.overview(OWNER, { period: '7d;DROP TABLE users' })).rejects.toThrow(/period/i);
    expect(cutoffCalls).toHaveLength(1);
  });

  it('passes only the session actor and validated period through the controller', async () => {
    const overview = vi.fn(async () => ({ ok: true }));
    const controller = new WalletController({ overview } as unknown as WalletService);
    const request = { session: { user_id: OWNER } } as unknown as RequestWithSession;
    await controller.overview(request, '50', '30d');
    expect(overview).toHaveBeenCalledWith(OWNER, { recentLimit: 50, period: '30d' });
    expect(() => controller.overview(request, '50', 'wrong')).toThrow(/period/i);
  });

  it('parameterizes the owner and cutoff in SQL before LIMIT without new table privileges', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repository = new PostgresWalletRepository({ query } as unknown as Queryable);
    const since = new Date('2026-10-17T00:00:00.000Z');
    await repository.recentTransactionsForUser(OWNER, 50, since);
    const [sql, values] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toMatch(/account\.owner_user_id = \$1/);
    expect(sql).toMatch(/ledger_transaction\.created_at >= \$3::timestamptz/);
    expect(sql.indexOf('created_at >= $3')).toBeLessThan(sql.indexOf('LIMIT $2'));
    expect(values).toEqual([OWNER, 50, since]);
  });
});
