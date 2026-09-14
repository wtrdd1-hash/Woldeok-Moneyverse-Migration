import { describe, expect, it } from 'vitest';
import { resolveInitialAlertStockId } from './alert-deeplink';

const stocks = [
  { id: 'stock-1', symbol: 'WLDX', name: 'Woldeok X' },
  { id: 'stock-2', symbol: 'MNYV', name: 'Moneyverse' },
] as const;

describe('resolveInitialAlertStockId', () => {
  it('resolves a stock symbol case-insensitively', () => {
    expect(resolveInitialAlertStockId(stocks, ' wldx ')).toBe('stock-1');
  });

  it('uses the first value for repeated stock parameters', () => {
    expect(resolveInitialAlertStockId(stocks, ['MNYV', 'WLDX'])).toBe('stock-2');
  });

  it('ignores missing and unknown symbols', () => {
    expect(resolveInitialAlertStockId(stocks, undefined)).toBeUndefined();
    expect(resolveInitialAlertStockId(stocks, 'UNKNOWN')).toBeUndefined();
  });
});
