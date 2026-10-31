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

describe('exact WLD stock history gross minimum', () => {
  it('validates canonical large integer strings and includes only explicit filter', async () => {
    const { normalizeStockHistoryGrossFloor } = await import('./history-window');
    expect(normalizeStockHistoryGrossFloor('900719925474099312345')).toBe('900719925474099312345');
    expect(stockHistoryApiPath(200, '900719925474099312345')).toBe('/api/v1/stocks/history?limit=200&minGross=900719925474099312345');
    expect(stockHistoryApiPath(50)).toBe('/api/v1/stocks/history?limit=50');
  });
  it.each(['0', '01', '-1', '1.1', '1e3', '', ' '.repeat(3), ['1', '2'], '9'.repeat(31)])(
    'rejects malformed gross floor %s', async (raw) => {
      const { normalizeStockHistoryGrossFloor } = await import('./history-window');
      expect(normalizeStockHistoryGrossFloor(raw)).toBeNull();
    },
  );
});

describe('owner stock history response integrity in the default unfiltered view', () => {
  const trade = {
    trade_id: '11111111-1111-4111-8111-111111111111', symbol: 'MV', side: 'buy',
    quantity: '9007199254740993', unit_price: '2', gross_amount: '18014398509481986',
    tax_amount: '0', created_at: '2026-10-31T15:00:00.000Z',
  };
  it('accepts a bounded verified trade array without a gross filter', async () => {
    const { isVerifiedStockHistoryResponse } = await import('./history-window');
    expect(isVerifiedStockHistoryResponse({ trades: [trade] }, 50)).toBe(true);
    expect(isVerifiedStockHistoryResponse({ trades: [] }, 50)).toBe(true);
  });
  it.each([
    null, {}, { trades: null }, { trades: Array(51).fill(trade) },
    { trades: [{ ...trade, trade_id: 'bad' }] },
    { trades: [trade, trade] },
    { trades: [{ ...trade, quantity: 'NaN' }] },
    { trades: [{ ...trade, tax_amount: '-1' }] },
    { trades: [{ ...trade, gross_amount: '1e1000' }] },
    { trades: [{ ...trade, side: 'credit' }] },
    { trades: [{ ...trade, created_at: 'not-a-date' }] },
  ])('rejects unverified source payload %# before BigInt rendering', async (payload) => {
    const { isVerifiedStockHistoryResponse } = await import('./history-window');
    expect(isVerifiedStockHistoryResponse(payload, 50)).toBe(false);
  });
});
