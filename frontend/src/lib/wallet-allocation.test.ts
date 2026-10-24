import { describe, expect, it } from 'vitest';
import { exactAssetShares } from './wallet-allocation';

describe('exact WLD allocation for member chart', () => {
  it('keeps 100-digit balances and finite percentages', () => {
    const huge = '9'.repeat(100);
    const result = exactAssetShares([huge, '1', '0', '0']);
    expect(result.totalAmount).toBe('1' + '0'.repeat(100));
    expect(result.shareBps).toEqual([9999, 0, 0, 0]);
  });

  it('handles zero wealth without inventing a balance', () => {
    expect(exactAssetShares(['0', '0'])).toEqual({ totalAmount: '0', shareBps: [0, 0] });
  });

  it('rejects negative and fractional values', () => {
    expect(() => exactAssetShares(['-1', '2'])).toThrow();
    expect(() => exactAssetShares(['1.5', '2'])).toThrow();
  });
});
