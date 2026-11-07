import { describe, expect, it } from 'vitest';
import { marketDayChange, parsePublicMarket } from './stock-market-evidence';

const base = {
  id: '123e4567-e89b-42d3-a456-426614174000',
  symbol: 'CHIPS', name: 'Chips', description: 'Virtual company',
  current_price: '1000000000000000000000000000001',
  day_open_price: '1000000000000000000000000000000',
  day_high_price: '1000000000000000000000000000001',
  day_low_price: '1000000000000000000000000000000',
  shares_outstanding: '100', shares_available: '50', halt_status: 'ACTIVE',
};

describe('public virtual market source truth', () => {
  it('distinguishes a verified empty market from missing/malformed evidence', () => {
    expect(parsePublicMarket({ stocks: [] })).toEqual([]);
    for (const invalid of [null, undefined, {}, { stocks: null }, { stocks: 'no' }, { stocks: [null] }, { stocks: [1] }]) {
      expect(parsePublicMarket(invalid)).toBeNull();
    }
  });

  it('preserves exact integer WLD and verified halt state', () => {
    expect(parsePublicMarket({ stocks: [base] })).toEqual([base]);
    expect(parsePublicMarket({ stocks: [{ ...base, halt_status: 'HALTED_SETTLED' }] })?.[0]?.halt_status).toBe('HALTED_SETTLED');
  });

  it('rejects unsafe or inconsistent rows instead of partially rendering a market', () => {
    for (const patch of [
      { current_price: '1e9' }, { current_price: 'NaN' }, { current_price: 100 },
      { current_price: '-1' }, { day_open_price: '0' }, { shares_available: '-2' },
      { day_low_price: '9999999999999999999999999999999' },
      { shares_available: '101' }, { symbol: '../../admin' }, { id: 'forged' }, { name: '' },
      { halt_status: 'UNKNOWN' }, { description: 9 },
    ]) expect(parsePublicMarket({ stocks: [{ ...base, ...patch }] })).toBeNull();
  });

  it('rejects duplicate IDs, duplicate symbols and oversized snapshots', () => {
    expect(parsePublicMarket({ stocks: [base, { ...base, id: '123e4567-e89b-42d3-a456-426614174001' }] })).toBeNull();
    expect(parsePublicMarket({ stocks: [base, { ...base, symbol: 'OTHER' }] })).toBeNull();
    expect(parsePublicMarket({ stocks: Array.from({ length: 101 }, (_, i) => ({ ...base, id: `123e4567-e89b-42d3-a456-${String(i).padStart(12, '0')}` })) })).toBeNull();
  });

  it('calculates one-decimal price movement with BigInt, never rounded JS Numbers', () => {
    expect(marketDayChange('150', '100')).toBe('+50.0%');
    expect(marketDayChange('50', '100')).toBe('−50.0%');
    expect(marketDayChange('100', '100')).toBe('0.0%');
    expect(marketDayChange('1000000000000000000000000000001', '1000000000000000000000000000000')).toBe('+<0.1%');
    expect(marketDayChange('999999999999999999999999999999', '1000000000000000000000000000000')).toBe('−<0.1%');
  });
});
