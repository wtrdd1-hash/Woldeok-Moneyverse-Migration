import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresWalletRepository, WalletInputError } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const TRANSACTION = '22222222-2222-4222-8222-222222222222';
const HUGE = '90071992547409931234567890123456789012';
const row = {
  transaction_id: TRANSACTION,
  type: 'BANK_DEPOSIT',
  created_at: new Date('2026-10-24T00:00:00Z'),
  net_amount: '0',
  cash_delta: `-${HUGE}`,
  bank_delta: HUGE,
};

describe('owner-only wallet pocket transaction history', () => {
  it('filters on the chosen pocket inside SQL BEFORE the row limit, preserving owner and precision', async () => {
    let sql = '';
    let parameters: readonly unknown[] = [];
    const pool = { query: async (text: string, values: readonly unknown[] = []) => {
      sql = text;
      parameters = values;
      return { rows: [row] };
    } } as Queryable;
    const result = await new PostgresWalletRepository(pool).pocketTransactionsForUser(ACTOR, 'cash', 50);
    expect(parameters).toEqual([ACTOR, 'cash', 50]);
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('USER_CASH');
    expect(sql).toContain('USER_BANK');
    expect(sql).toMatch(/cash_delta::numeric/);
    expect(sql).toMatch(/bank_delta::numeric/);
    expect(sql).toMatch(/WHERE[\s\S]*cash_delta::numeric[\s\S]*ORDER BY[\s\S]*LIMIT \$3/);
    expect(result[0]?.cash_delta).toBe(`-${HUGE}`);
  });

  it('rejects invalid pockets and out-of-range limits without a database query', async () => {
    let count = 0;
    const pool = { query: async () => { count += 1; return { rows: [] }; } } as Queryable;
    const repo = new PostgresWalletRepository(pool);
    for (const pocket of ['', 'all', 'CASH', ' cash', 'cash;DROP TABLE accounts']) {
      await expect(repo.pocketTransactionsForUser(ACTOR, pocket, 50)).rejects.toBeInstanceOf(WalletInputError);
    }
    await expect(repo.pocketTransactionsForUser(ACTOR, 'bank', 51)).rejects.toBeInstanceOf(WalletInputError);
    expect(count).toBe(0);
  });

  it('normalizes net-zero transfers without rounding 38-digit signed pocket deltas', async () => {
    const calls: unknown[][] = [];
    const repo = {
      balancesForUser: async () => [],
      recentTransactionsForUser: async () => [],
      pocketTransactionsForUser: async (...args: unknown[]) => { calls.push(args); return [row]; },
      activeRecipientById: async () => null,
      transfer: async () => ({ transactionId: TRANSACTION }),
      claimDaily: async () => ({ transactionId: TRANSACTION, amount: '1', replayed: false }),
    } as unknown as WalletRepositoryLike;
    const result = await new WalletService(repo).pocketTransactions(ACTOR, 'cash', 20);
    expect(calls).toEqual([[ACTOR, 'cash', 20]]);
    expect(result).toMatchObject({ pocket: 'cash', limit: 20 });
    expect(result.transactions[0]).toMatchObject({
      transactionId: TRANSACTION, netAmount: '0', cashDelta: `-${HUGE}`, bankDelta: HUGE, direction: 'neutral',
    });
  });
});
