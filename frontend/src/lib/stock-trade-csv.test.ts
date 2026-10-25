import { describe, expect, it } from 'vitest';
import { stockTradeCsv } from './stock-trade-csv';

const trade = {
  trade_id: '11111111-1111-4111-8111-111111111111', symbol: 'WDX', side: 'buy',
  quantity: '9007199254740993', unit_price: '999999999999999999',
  gross_amount: '900719925474099399999999999', tax_amount: '120000000000000000',
  created_at: '2026-10-25T00:00:00.000Z',
};

describe('verified member stock trade CSV', () => {
  it('preserves huge integer strings exactly and exports only the bounded response', () => {
    const csv = stockTradeCsv([trade]);
    expect(csv).toContain('900719925474099399999999999');
    expect(csv).toContain('9007199254740993');
    expect(csv).toContain('999999999999999999');
    expect(csv).toMatch(/^\uFEFF/);
  });
  it('escapes formula injection, quotes and control characters from stock symbols', () => {
    const csv = stockTradeCsv([{ ...trade, symbol: '=HYPERLINK("bad")\r\nInjected' }]);
    expect(csv).toContain("'=HYPERLINK(");
    expect(csv).not.toContain('\r\nInjected');
    expect(csv).toContain('""bad""');
  });
  it('fails closed on noncanonical money or trade side', () => {
    expect(() => stockTradeCsv([{ ...trade, gross_amount: '1e9' }])).toThrow();
    expect(() => stockTradeCsv([{ ...trade, side: 'unknown' }])).toThrow();
  });
});
