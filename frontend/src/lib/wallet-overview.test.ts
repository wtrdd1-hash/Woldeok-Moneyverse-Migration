import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readWalletOverview } from './wallet-overview';

/**
 * Production regression 2026-11-25 (digest 3319858667, frontend-errors.log):
 * every signed-in /wallet render threw "Cannot read properties of undefined
 * (reading 'cash')" because the Spring API answers `{ success, data: {...} }`
 * with its own field names while the page read the NestJS contract.
 */
const SPRING = {
  success: true,
  ok: true,
  data: {
    balanceWld: '1500',
    pendingBalanceWld: '1000',
    lockedBalanceWld: '500',
    currency: 'WLD',
    userId: '6f1c1d36-8d0a-4a39-9d65-1a2b3c4d5e6f',
    recentTransactions: [
      { id: 'p-1', amount: '300', direction: 'debit', created_at: '2026-11-24T10:00:00Z', tx_type: 'WORK_REWARD' },
      { id: 'p-2', amount: '120', direction: 'credit', created_at: '2026-11-24T09:00:00Z', tx_type: 'SHOP_PURCHASE' },
    ],
  },
};

describe('readWalletOverview', () => {
  it('reads the Spring envelope: total, cash and bank pockets from the ledger', () => {
    const o = readWalletOverview(SPRING)!;
    expect(o.userId).toBe(SPRING.data.userId);
    expect(o.balances.cash.availableAmount).toBe('1000');
    expect(o.balances.bank.availableAmount).toBe('500');
    expect(o.balances.totalAvailableAmount).toBe('1500');
    expect(o.balances.currency).toBe('WLD');
  });

  it('signs Spring postings like the ledger does: debit adds, credit subtracts', () => {
    const o = readWalletOverview(SPRING)!;
    expect(o.recentTransactions.map((t) => [t.netAmount, t.direction])).toEqual([
      ['300', 'in'],
      ['-120', 'out'],
    ]);
    expect(o.recentTransactions[0]!.occurredAt).toBe('2026-11-24T10:00:00Z');
    // Spring sends at most a page of postings: never claim the full ledger.
    expect(o.recentTransactionsHasMore).toBeUndefined();
  });

  it('accepts the canonical contract unchanged', () => {
    const canonical = {
      userId: 'u',
      balances: {
        currency: 'WLD',
        cash: { availableAmount: '7', updatedAt: '2026-11-24T00:00:00Z' },
        bank: { availableAmount: '3', updatedAt: '2026-11-24T00:00:00Z' },
        totalAvailableAmount: '10',
      },
      recentTransactions: [],
    };
    expect(readWalletOverview(canonical)).toEqual(canonical);
  });

  it.each([
    ['null', null],
    ['an error document', { status: 503, error: 'Service Unavailable' }],
    ['a non-integer amount', { ...SPRING, data: { ...SPRING.data, pendingBalanceWld: '10.5' } }],
    ['pockets that do not add up to the total', { ...SPRING, data: { ...SPRING.data, balanceWld: '9999' } }],
    ['a non-WLD currency', { ...SPRING, data: { ...SPRING.data, currency: 'KRW' } }],
    ['a canonical body missing the bank pocket', { userId: 'u', balances: { currency: 'WLD', cash: { availableAmount: '1' }, totalAvailableAmount: '1' }, recentTransactions: [] }],
  ])('returns null (never throws, never guesses) for %s', (_label, raw) => {
    expect(readWalletOverview(raw)).toBeNull();
  });

  it('pins the Spring field meaning to WalletService (pending = cash, locked = bank)', () => {
    const src = readFileSync(
      join(__dirname, '../../../spring-backend/src/main/java/com/moneyverse/api/domain/wallet/service/WalletService.java'),
      'utf8',
    );
    expect(src).toMatch(/new WalletOverview\(\s*total\.toPlainString\(\),\s*cashBalance\.toPlainString\(\),\s*bankBalance\.toPlainString\(\)/);
  });
});
