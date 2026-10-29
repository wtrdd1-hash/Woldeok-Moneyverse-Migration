import { describe, expect, it } from 'vitest';
import { normalizeStockHistoryWindow, stockHistoryApiPath } from './history-window';

describe('member stock history recent window', () => {
  it('defaults to 50 and accepts only the advertised bounded windows', () => {
    expect(normalizeStockHistoryWindow(undefined)).toBe(50);
    expect(normalizeStockHistoryWindow('50')).toBe(50);
    expect(normalizeStockHistoryWindow('100')).toBe(100);
    expect(normalizeStockHistoryWindow('200')).toBe(200);
  });
  it.each(['500', '100.0', '0100', '1e2', '', ['100', '200'], null, 200])(
    'normalizes invalid URL input %s to the safe default', (input) => {
      expect(normalizeStockHistoryWindow(input)).toBe(50);
    },
  );
  it('uses the server-side query rather than slicing a 50-row response in the browser', () => {
    expect(stockHistoryApiPath(50)).toBe('/api/v1/stocks/history?limit=50');
    expect(stockHistoryApiPath(200)).toBe('/api/v1/stocks/history?limit=200');
  });
});
