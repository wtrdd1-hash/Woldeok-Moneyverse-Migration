import { describe, expect, it } from 'vitest';
import { stockHoldingsCsv } from './stock-holdings-csv';

const HOLDING = {
  stock_id: '22222222-2222-4222-8222-222222222222', symbol: 'MVX', name: '=HYPERLINK("bad")',
  quantity: '999999999999999999', average_cost: '999999999999999999999999999',
  market_value: '99999999999999999999999999999999999999', current_price: '42', halt_status: 'ACTIVE',
};

describe('current owner stock holdings CSV', () => {
  it('retains precise integer text, escapes formula cells and declares snapshot scope', () => {
    const csv = stockHoldingsCsv({ scope: 'current_holdings_only', holdings: [HOLDING] });
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain(HOLDING.market_value);
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('Current holdings only');
    expect(csv).toContain('\r\n');
  });
  it('rejects missing scope, malformed data, overflow and partial result', () => {
    for (const data of [null, {}, { scope: 'history', holdings: [HOLDING] },
      { scope: 'current_holdings_only', holdings: [{ ...HOLDING, current_price: 2 }] },
      { scope: 'current_holdings_only', holdings: Array(101).fill(HOLDING) }]) {
      expect(() => stockHoldingsCsv(data)).toThrow();
    }
  });
});
