import { describe, expect, it } from 'vitest';
import { verifiedWalletOverview } from './wallet-overview-proof';

const UUID = '123e4567-e89b-42d3-a456-426614174000';
const TX = '123e4567-e89b-42d3-a456-426614174001';

const valid = {
  userId: UUID,
  balances: {
    currency: 'WLD',
    cash: { availableAmount: '900719925474099312345', updatedAt: '2026-11-02T00:00:00.000Z' },
    bank: { availableAmount: '55', updatedAt: '2026-11-02T00:00:00.000Z' },
    totalAvailableAmount: '900719925474099312400',
  },
  recentTransactions: [{
    transactionId: TX,
    type: 'TRANSFER', label: 'Transfer', netAmount: '-10',
    cashDelta: '-10', bankDelta: '0', direction: 'out', occurredAt: '2026-11-02T00:00:00.000Z',
  }],
  recentTransactionsHasMore: false,
};

describe('verifiedWalletOverview', () => {
  it('preserves exact canonical WLD amounts beyond Number safe range', () => {
    const parsed = verifiedWalletOverview(valid);
    expect(parsed?.balances.cash.availableAmount).toBe('900719925474099312345');
    expect(parsed?.balances.totalAvailableAmount).toBe('900719925474099312400');
  });

  it.each([
    null, {}, { ...valid, balances: null },
    { ...valid, balances: { ...valid.balances, cash: { ...valid.balances.cash, availableAmount: '' } } },
    { ...valid, balances: { ...valid.balances, cash: { ...valid.balances.cash, availableAmount: '01' } } },
    { ...valid, balances: { ...valid.balances, cash: { ...valid.balances.cash, availableAmount: '1.1' } } },
    { ...valid, balances: { ...valid.balances, cash: { ...valid.balances.cash, availableAmount: '9'.repeat(39) } } },
    { ...valid, balances: { ...valid.balances, totalAvailableAmount: '0' } },
    { ...valid, balances: { ...valid.balances, currency: 'USD' } },
    { ...valid, balances: { ...valid.balances, bank: { ...valid.balances.bank, updatedAt: '0' } } },
    { ...valid, userId: 'not-a-uuid' },
    { ...valid, recentTransactions: null },
    { ...valid, recentTransactions: [{ ...valid.recentTransactions[0], netAmount: '0' }] },
    { ...valid, recentTransactions: [{ ...valid.recentTransactions[0], cashDelta: undefined }] },
    { ...valid, recentTransactions: [{ ...valid.recentTransactions[0], direction: 'in' }] },
    { ...valid, recentTransactions: [{ ...valid.recentTransactions[0], occurredAt: 'invalid' }] },
    { ...valid, recentTransactions: [{ ...valid.recentTransactions[0], occurredAt: '0' }] },
    { ...valid, recentTransactions: [valid.recentTransactions[0], valid.recentTransactions[0]] },
    { ...valid, recentTransactionsHasMore: 'false' },
  ])('rejects an unverified wallet response instead of fabricating a balance: %#', (input) => {
    expect(verifiedWalletOverview(input)).toBeNull();
  });

  it('accepts verified zero and a legitimate empty history', () => {
    const parsed = verifiedWalletOverview({
      ...valid,
      balances: {
        ...valid.balances,
        cash: { ...valid.balances.cash, availableAmount: '0' },
        bank: { ...valid.balances.bank, availableAmount: '0' },
        totalAvailableAmount: '0',
      },
      recentTransactions: [],
    });
    expect(parsed?.balances.totalAvailableAmount).toBe('0');
    expect(parsed?.recentTransactions).toEqual([]);
  });
});
