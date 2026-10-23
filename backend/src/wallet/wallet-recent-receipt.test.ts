import { describe, expect, it, vi } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const OTHER = '33333333-3333-4333-8333-333333333333';
const TX = '22222222-2222-4222-8222-222222222222';
const UNKNOWN = '44444444-4444-4444-8444-444444444444';
const HUGE = '90071992547409931234567890123456789012';

function fixture() {
  const recentTransactionsForUser = vi.fn(async (userId: string, _limit: number) => (
    userId === ACTOR ? [{
      transaction_id: TX,
      type: 'BANK_DEPOSIT',
      created_at: new Date('2026-10-23T17:00:00Z'),
      net_amount: '0',
      cash_delta: '-' + HUGE,
      bank_delta: HUGE,
    }] : []
  ));
  const balancesForUser = vi.fn(async () => []);
  const repository = {
    recentTransactionsForUser,
    balancesForUser,
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: TX }),
    claimDaily: async () => ({ transaction_id: TX, amount: '1', replayed: false }),
  } as WalletRepositoryLike;
  return { service: new WalletService(repository), recentTransactionsForUser, balancesForUser };
}

describe('private recent wallet receipt', () => {
  it('reads only the authenticated actor latest 50 and preserves exact signed WLD pocket amounts', async () => {
    const { service, recentTransactionsForUser, balancesForUser } = fixture();
    const receipt = await service.recentReceiptForUser(ACTOR, TX);
    expect(recentTransactionsForUser).toHaveBeenCalledWith(ACTOR, 50);
    expect(balancesForUser).not.toHaveBeenCalled();
    expect(receipt).toMatchObject({
      receiptVersion: 1, state: 'CONFIRMED', transactionId: TX, currency: 'WLD',
      netWalletDelta: '0', cashDelta: '-' + HUGE, bankDelta: HUGE,
      detailCompleteness: 'VERIFIED', occurredAt: '2026-10-23T17:00:00.000Z',
    });
  });

  it('does not distinguish another owner transaction from a missing reference', async () => {
    const { service, recentTransactionsForUser } = fixture();
    expect(await service.recentReceiptForUser(OTHER, TX)).toBeNull();
    expect(await service.recentReceiptForUser(ACTOR, UNKNOWN)).toBeNull();
    expect(recentTransactionsForUser).toHaveBeenCalledWith(OTHER, 50);
  });

  it('rejects malformed references before querying the ledger', async () => {
    const { service, recentTransactionsForUser } = fixture();
    await expect(service.recentReceiptForUser(ACTOR, 'not-a-uuid')).rejects.toThrow(/UUID/);
    expect(recentTransactionsForUser).not.toHaveBeenCalled();
  });

  it('never substitutes missing pocket projections with fabricated zeros', async () => {
    const { service } = fixture();
    service.repository.recentTransactionsForUser = async () => [{
      transaction_id: TX, type: 'UNKNOWN_SOURCE',
      created_at: new Date('2026-10-23T17:00:00Z'), net_amount: '15',
    }];
    const receipt = await service.recentReceiptForUser(ACTOR, TX);
    expect(receipt).toMatchObject({
      cashDelta: null, bankDelta: null, netWalletDelta: '15',
      detailCompleteness: 'PARTIAL', reason: '거래 사유 확인 필요',
    });
  });
});
