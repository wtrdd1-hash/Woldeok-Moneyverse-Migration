import { describe, expect, it } from 'vitest';
import { cashBalanceFromWallet } from './wallet-balance';

describe('cashBalanceFromWallet', () => {
  it('reads the canonical ledger-backed cash balance', () => {
    expect(cashBalanceFromWallet({ userId: 'u', balances: { currency: 'WLD', cash: { availableAmount: '200', updatedAt: '' }, bank: { availableAmount: '0', updatedAt: '' }, totalAvailableAmount: '200' }, recentTransactions: [] })).toBe('200');
  });

  it('reads the Spring envelope', () => {
    expect(cashBalanceFromWallet({ success: true, data: { balanceWld: '300', pendingBalanceWld: '200', lockedBalanceWld: '100', currency: 'WLD', userId: 'u', recentTransactions: [] } })).toBe('200');
  });

  it.each([
    ['a missing response', null],
    ['a Spring body that does not add up', { success: true, data: { balanceWld: '9', pendingBalanceWld: '200', lockedBalanceWld: '100', currency: 'WLD', userId: 'u' } }],
  ])('answers unknown (null), never 0, for %s (independent review 2026-11-25)', (_l, raw) => {
    expect(cashBalanceFromWallet(raw)).toBeNull();
  });
});
