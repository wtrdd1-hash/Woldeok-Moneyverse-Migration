import { describe, expect, it, vi } from 'vitest';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
describe('composed owner-scoped wallet filters', () => {
  it('combines category, cutoff and direction in SQL before LIMIT with bound owner', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query } as never);
    const since = new Date('2026-10-17T00:00:00Z');
    await repo.recentTransactionsForUser(OWNER, 50, { direction: 'out', category: 'bank', since });
    const [sql, args] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('ledger_transaction.type = ANY(');
    expect(sql).toContain('ledger_transaction.created_at >=');
    expect(sql).toContain('net_amount::numeric < 0');
    expect(sql.indexOf('ledger_transaction.type = ANY')).toBeLessThan(sql.indexOf('LIMIT $2'));
    expect(args[0]).toBe(OWNER);
    expect(args[1]).toBe(50);
    expect(args).toContain('out');
    expect(args).toContain(since);
    expect(args.some((item) => Array.isArray(item) && item.includes('BANK_DEPOSIT'))).toBe(true);
  });
  it('rejects invalid period before reading balances and preserves integer-string precision', async () => {
    const recent = vi.fn(async () => []);
    const balances = vi.fn(async () => [
      { account_type: 'USER_CASH', available_amount: '9007199254740993123456789', updated_at: new Date('2026-10-24T00:00:00Z') },
      { account_type: 'USER_BANK', available_amount: '1', updated_at: new Date('2026-10-24T00:00:00Z') },
    ]);
    const repo = { balancesForUser: balances, recentTransactionsForUser: recent,
      activeRecipientById: async () => null, transfer: async () => ({ transactionId: OWNER }),
      claimDaily: async () => ({ transaction_id: OWNER, amount: '1', replayed: false }),
    } as unknown as WalletRepositoryLike;
    const service = new WalletService(repo, { clock: () => new Date('2026-10-24T00:00:00Z') });
    await expect(service.overview(OWNER, { direction: 'in', category: 'bank', period: 'bad' as never })).rejects.toThrow(/period/);
    expect(recent).not.toHaveBeenCalled();
    expect(balances).not.toHaveBeenCalled();
    const result = await service.overview(OWNER, { direction: 'in', category: 'bank', period: '7d' });
    expect(recent).toHaveBeenCalledWith(OWNER, 10, { direction: 'in', category: 'bank', since: new Date('2026-10-17T00:00:00Z') });
    expect(result.balances.totalAvailableAmount).toBe('9007199254740993123456790');
  });
});
