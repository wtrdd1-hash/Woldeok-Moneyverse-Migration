import { describe, expect, it, vi } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const USER = '11111111-1111-4111-8111-111111111111';
const TRANSACTION = '22222222-2222-4222-8222-222222222222';
const HUGE = '90071992547409931234567890123456789012';

function fixture(netAmount = HUGE) {
  const recentTransactionsForUser = vi.fn(async () => [{
    transaction_id: TRANSACTION,
    type: 'MINT_TO_USER',
    created_at: new Date('2026-10-24T00:00:00Z'),
    net_amount: netAmount,
    cash_delta: netAmount,
    bank_delta: '0',
  }]);
  const balancesForUser = vi.fn(async () => []);
  const repository = {
    recentTransactionsForUser,
    balancesForUser,
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: TRANSACTION }),
    claimDaily: async () => ({ transaction_id: TRANSACTION, amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
  return { service: new WalletService(repository, { clock: () => new Date('2026-10-24T01:00:00Z') }), recentTransactionsForUser, balancesForUser };
}

describe('verified owner-only recent ledger export', () => {
  it('reads exactly 50 owner ledger rows without balance query or client supplied actor', async () => {
    const { service, recentTransactionsForUser, balancesForUser } = fixture();
    const result = await service.exportRecent(USER);
    expect(recentTransactionsForUser).toHaveBeenCalledExactlyOnceWith(USER, 50);
    expect(balancesForUser).not.toHaveBeenCalled();
    expect(result).toEqual({
      currency: 'WLD',
      recentLimit: 50,
      generatedAt: '2026-10-24T01:00:00.000Z',
      transactions: [{
        transactionId: TRANSACTION, type: 'MINT_TO_USER', label: '보상 지급',
        netAmount: HUGE, cashDelta: HUGE, bankDelta: '0',
        direction: 'in', occurredAt: '2026-10-24T00:00:00.000Z',
      }],
    });
  });

  it('rejects an invalid actor before any PostgreSQL call', async () => {
    const { service, recentTransactionsForUser } = fixture();
    await expect(service.exportRecent('another-member')).rejects.toThrow(/UUID/);
    expect(recentTransactionsForUser).not.toHaveBeenCalled();
  });

  it('fails closed on noncanonical ledger amounts rather than rounding or writing zero', async () => {
    const { service } = fixture('9'.repeat(39));
    await expect(service.exportRecent(USER)).rejects.toThrow();
  });
});
