import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('wallet owner-scoped rolling ledger periods', () => {
  it('applies a bounded period in PostgreSQL before LIMIT, not after fetching 50 rows', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repository = new PostgresWalletRepository({ query } as unknown as Queryable);
    await repository.recentTransactionsForUser(ACTOR, 50, 7);
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toMatch(/ledger_transaction\.created_at\s*>=/);
    expect(sql.indexOf('ledger_transaction.created_at >=')).toBeLessThan(sql.indexOf('LIMIT $2'));
    expect(params).toEqual([ACTOR, 50, 7]);
  });

  it('rejects unbounded or malformed periods before any database query', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repository = new PostgresWalletRepository({ query } as unknown as Queryable);
    for (const days of [-1, 0, 31, 365, NaN, 1.5]) {
      await expect(repository.recentTransactionsForUser(ACTOR, 50, days)).rejects.toThrow();
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('passes a 30-day filter through service without changing WLD balances', async () => {
    const query = vi.fn(async () => []);
    const repository = {
      balancesForUser: async () => [
        { account_type: 'USER_CASH', available_amount: '900719925474099312345', updated_at: new Date('2026-10-27T00:00:00Z') },
        { account_type: 'USER_BANK', available_amount: '1', updated_at: new Date('2026-10-27T00:00:00Z') },
      ],
      recentTransactionsForUser: query,
      activeRecipientById: async () => null,
      transfer: async () => ({ transactionId: ACTOR }),
      claimDaily: async () => ({ transaction_id: ACTOR, amount: '1', replayed: false }),
      claimWork: async () => ({ transaction_id: ACTOR, amount: '1', replayed: false }),
      moveBankBalance: async () => ({ transaction_id: ACTOR }),
      borrow: async () => ({ loan_id: ACTOR }),
      repay: async () => ({ loan_id: ACTOR }),
    } as unknown as WalletRepositoryLike;
    const wallet = await new WalletService(repository).overview(ACTOR, { recentLimit: 50, periodDays: 30 });
    expect(query).toHaveBeenCalledWith(ACTOR, 50, 30);
    expect(wallet.balances.totalAvailableAmount).toBe('900719925474099312346');
  });
});
