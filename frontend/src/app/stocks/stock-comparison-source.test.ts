import { describe, expect, it } from 'vitest';
import { parseComparableStockMarket } from './stock-comparison-source';

const row = {
  id: '00000000-0000-4000-8000-000000000001',
  symbol: 'WLD', name: 'Woldeok Virtual', current_price: '9007199254740993',
  day_open_price: '9007199254740992', day_high_price: '9007199254741000',
  day_low_price: '9007199254740900', shares_available: '0',
};
const second = { ...row, id: '00000000-0000-4000-8000-000000000002', symbol: 'ABC' };

describe('stock comparison server source contract', () => {
  it('preserves exact integer WLD and a verified empty market', () => {
    expect(parseComparableStockMarket({ stocks: [row, second] })).toEqual([row, second]);
    expect(parseComparableStockMarket({ stocks: [] })).toEqual([]);
  });

  it.each([
    null, {}, { stocks: null }, { stocks: {} }, { stocks: [row, null] },
    { stocks: [{ ...row, current_price: '1.2' }] },
    { stocks: [{ ...row, current_price: 123 }] },
    { stocks: [{ ...row, current_price: 'Infinity' }] },
    { stocks: [{ ...row, day_open_price: '-1' }] },
    { stocks: [{ ...row, shares_available: '-10' }] },
    { stocks: [{ ...row, day_high_price: '10', day_low_price: '11' }] },
    { stocks: [{ ...row, symbol: '' }] },
    { stocks: [{ ...row, id: 'not-a-uuid' }] },
    { stocks: [row, { ...second, symbol: 'wld' }] },
    { stocks: [row, { ...second, id: row.id }] },
    { stocks: [{ ...row, current_price: '999999999999999999999999999' }] },
    { stocks: Array.from({ length: 101 }, (_, i) => ({ ...row, id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}` })) },
  ])('rejects malformed or contradictory market evidence as unavailable (%#)', (response) => {
    expect(parseComparableStockMarket(response)).toBeNull();
  });
});
