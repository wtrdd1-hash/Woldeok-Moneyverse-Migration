import { describe, expect, it } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const TRANSACTION = '22222222-2222-4222-8222-222222222222';
const HUGE = '90071992547409931234567890123456789012';

function repositoryFor(cash: string, bank: string, net: string): WalletRepositoryLike {
  return {
    balancesForUser: async () => [
      { account_type: 'USER_CASH', available_amount: '10', updated_at: new Date('2026-10-21T00:00:00Z') },
      { account_type: 'USER_BANK', available_amount: '20', updated_at: new Date('2026-10-21T00:00:00Z') },
    ],
    recentTransactionsForUser: async () => [{
      transaction_id: TRANSACTION,
      type: 'BANK_DEPOSIT',
      created_at: new Date('2026-10-21T00:00:00Z'),
      net_amount: net,
      cash_delta: cash,
      bank_delta: bank,
    }],
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: TRANSACTION }),
    claimDaily: async () => ({ transaction_id: TRANSACTION, amount: '1', replayed: false }),
  } as WalletRepositoryLike;
}

describe('wallet owner pocket deltas', () => {
  it('shows a zero-net bank deposit as negative cash and positive bank', async () => {
    const wallet = await new WalletService(repositoryFor('-2500', '2500', '0')).overview(ACTOR);
    expect(wallet.recentTransactions[0]).toMatchObject({
      transactionId: TRANSACTION,
      cashDelta: '-2500',
      bankDelta: '2500',
      netAmount: '0',
      direction: 'neutral',
    });
  });

  it('preserves 38-digit WLD pocket amounts as exact signed strings', async () => {
    const wallet = await new WalletService(repositoryFor('-' + HUGE, HUGE, '0')).overview(ACTOR);
    expect(wallet.recentTransactions[0]?.cashDelta).toBe('-' + HUGE);
    expect(wallet.recentTransactions[0]?.bankDelta).toBe(HUGE);
  });

  it('refuses a transaction whose pocket deltas disagree with its net amount', async () => {
    await expect(new WalletService(repositoryFor('-10', '9', '0')).overview(ACTOR))
      .rejects.toThrow(/wallet pocket delta mismatch/i);
  });

  it('refuses a noncanonical pocket delta instead of rounding it', async () => {
    await expect(new WalletService(repositoryFor('-01', '1', '0')).overview(ACTOR))
      .rejects.toThrow(/canonical|integer|amount/i);
  });
});
