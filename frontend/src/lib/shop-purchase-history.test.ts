import { describe, expect, it } from 'vitest';
import { parseShopPurchaseHistory } from './shop-purchase-history';
const receipt = {
  purchaseId: '00000000-0000-4000-8000-000000000001',
  itemName: 'Blue Gloves',
  amount: '9007199254740993',
  purchasedAt: '2026-10-30T00:00:00.000Z',
};
describe('owner-private displayed shop receipt totals', () => {
  it('accepts exact integer strings beyond JS safe integer', () => {
    expect(
      parseShopPurchaseHistory({
        purchases: [
          receipt,
          { ...receipt, purchaseId: '00000000-0000-4000-8000-000000000002', amount: '40' },
        ],
        summary: { count: 2, totalSpent: '9007199254741033', scope: 'displayed' },
      })?.summary.totalSpent,
    ).toBe('9007199254741033');
  });
  it('rejects forged sums, fractional/rounded/negative amounts and false empty success', () => {
    for (const value of [
      {
        purchases: [receipt],
        summary: { count: 1, totalSpent: '9007199254740992', scope: 'displayed' },
      },
      {
        purchases: [{ ...receipt, amount: Number('9007199254740993') }],
        summary: { count: 1, totalSpent: '9007199254740993', scope: 'displayed' },
      },
      {
        purchases: [{ ...receipt, amount: '-1' }],
        summary: { count: 1, totalSpent: '-1', scope: 'displayed' },
      },
      { purchases: [], summary: { count: 1, totalSpent: '0', scope: 'displayed' } },
      { purchases: [], summary: { count: 0, totalSpent: '0', scope: 'lifetime' } },
      { purchases: [] },
    ])
      expect(parseShopPurchaseHistory(value)).toBeNull();
  });
});
