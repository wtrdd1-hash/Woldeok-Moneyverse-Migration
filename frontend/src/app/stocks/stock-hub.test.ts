import { describe, expect, it } from 'vitest';
import { findHoldingForStock, findStockBySymbol, normalizeStockSymbol } from './stock-hub';

const stock = {
  id: 'stock-1',
  symbol: 'WDX',
  name: 'Woldeok X',
  description: '',
  current_price: '1200',
  day_open_price: '1000',
  day_high_price: '1250',
  day_low_price: '980',
  shares_outstanding: '10000',
  shares_available: '7500',
};

describe('stock detail hub helpers', () => {
  it('normalizes safe stock symbols and rejects route garbage', () => {
    expect(normalizeStockSymbol(' wdx ')).toBe('WDX');
    expect(normalizeStockSymbol('../wdx')).toBeNull();
    expect(normalizeStockSymbol('')).toBeNull();
  });

  it('finds a stock case-insensitively', () => {
    expect(findStockBySymbol([stock], 'wdx')).toEqual(stock);
    expect(findStockBySymbol([stock], 'missing')).toBeNull();
  });

  it('returns only the holding for the selected stock', () => {
    const holding = {
      stock_id: 'stock-1',
      quantity: '3',
      average_cost: '900',
      market_value: '3600',
      current_price: '1200',
    };
    expect(findHoldingForStock([holding], 'stock-1')).toEqual(holding);
    expect(findHoldingForStock([holding], 'stock-2')).toBeNull();
  });
});
