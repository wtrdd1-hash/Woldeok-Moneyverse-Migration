import { describe, expect, it, vi } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import { PostgresWalletRepository } from './wallet.repository';

const OWNER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '33333333-3333-4333-8333-333333333333';
const TRANSACTION = '22222222-2222-4222-8222-222222222222';
const HUGE = '90071992547409931234567890123456789012';
const row = {
  transaction_id: TRANSACTION, type: 'BANK_DEPOSIT', created_at: new Date('2026-09-01T00:00:00Z'),
  net_amount: '0', cash_delta: '-' + HUGE, bank_delta: HUGE,
};

function fakeRepository(receipt: typeof row | null) {
  const transactionForUser = vi.fn(async (actor: string, reference: string) => actor === OWNER && reference === TRANSACTION ? receipt : null);
  const repo = {
    balancesForUser: async () => [], recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null, transfer: async () => ({ transactionId: TRANSACTION }),
    claimDaily: async () => ({ transaction_id: TRANSACTION, amount: '1', replayed: false }),
    transactionForUser,
  } as unknown as WalletRepositoryLike;
  return { wallet: new WalletService(repo), transactionForUser };
}

describe('historical wallet owner receipt', () => {
  it('returns a confirmed owner-only receipt for an older posted transaction with exact 38-digit pocket amounts', async () => {
    const { wallet, transactionForUser } = fakeRepository(row);
    const receipt = await wallet.historicalReceiptForUser(OWNER, TRANSACTION);
    expect(transactionForUser).toHaveBeenCalledWith(OWNER, TRANSACTION);
    expect(receipt).toMatchObject({
      transactionId: TRANSACTION, state: 'CONFIRMED', historyScope: 'ALL_POSTED',
      netWalletDelta: '0', cashDelta: '-' + HUGE, bankDelta: HUGE,
      detailCompleteness: 'VERIFIED',
    });
  });
  it('does not disclose foreign or nonexistent transactions', async () => {
    const { wallet } = fakeRepository(row);
    await expect(wallet.historicalReceiptForUser(FOREIGN, TRANSACTION)).resolves.toBeNull();
    await expect(wallet.historicalReceiptForUser(OWNER, '44444444-4444-4444-8444-444444444444')).resolves.toBeNull();
  });
  it('rejects malformed IDs before database access and rejects inconsistent signed deltas', async () => {
    const { wallet, transactionForUser } = fakeRepository(row);
    await expect(wallet.historicalReceiptForUser(OWNER, 'not-uuid')).rejects.toThrow(/UUID/);
    expect(transactionForUser).not.toHaveBeenCalled();
    const bad = fakeRepository({ ...row, net_amount: '1' });
    await expect(bad.wallet.historicalReceiptForUser(OWNER, TRANSACTION)).rejects.toThrow(/mismatch/);
  });
  it('rejects a repository row with a different transaction reference', async () => {
    const { wallet } = fakeRepository({ ...row, transaction_id: '55555555-5555-4555-8555-555555555555' });
    await expect(wallet.historicalReceiptForUser(OWNER, TRANSACTION)).rejects.toThrow(/reference mismatch/);
  });
  it('parameterizes a single owner-scoped PostgreSQL function call', async () => {
    const query = vi.fn(async () => ({ rows: [row], rowCount: 1 }));
    const repo = new PostgresWalletRepository({ query } as never);
    const result = await repo.transactionForUser(OWNER, TRANSACTION);
    expect(result).toMatchObject({ transaction_id: TRANSACTION });
    const [sql, args] = query.mock.calls[0]!;
    expect(sql).toContain('public.wallet_owner_transaction_receipt');
    expect(sql).not.toContain('ledger_postings');
    expect(args).toEqual([OWNER, TRANSACTION]);
  });
});
