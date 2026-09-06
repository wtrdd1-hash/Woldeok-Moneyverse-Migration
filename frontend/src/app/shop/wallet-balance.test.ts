import { describe, expect, it } from 'vitest';
import { cashBalanceFromWallet } from './wallet-balance';

describe('cashBalanceFromWallet', () => {
  it('reads the canonical ledger-backed cash balance', () => {
    expect(cashBalanceFromWallet({ balances: { cash: { availableAmount: '200' } } })).toBe('200');
  });

  it('does not mistake a missing response for a real balance', () => {
    expect(cashBalanceFromWallet(null)).toBe('0');
  });
});
