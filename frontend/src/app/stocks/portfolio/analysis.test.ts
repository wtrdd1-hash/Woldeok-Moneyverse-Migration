import { describe, expect, it } from 'vitest';
import { analyzePortfolio } from './analysis';

describe('analyzePortfolio', () => {
  it('keeps authoritative money math in bigint-safe integer strings', () => {
    const result = analyzePortfolio([
      {
        stock_id: 'a',
        symbol: 'AAA',
        name: 'Alpha',
        quantity: '9007199254740993',
        average_cost: '100',
        market_value: '990791918021509230',
        current_price: '110',
      },
    ]);

    expect(result.total_cost_basis).toBe('900719925474099300');
    expect(result.total_market_value).toBe('990791918021509230');
    expect(result.total_unrealized_gain_loss).toBe('90071992547409930');
    expect(result.holdings[0]?.allocation_bps).toBe('10000');
  });

  it('calculates allocation and gain/loss without floating point', () => {
    const result = analyzePortfolio([
      { stock_id: 'a', symbol: 'AAA', name: 'Alpha', quantity: '10', average_cost: '100', market_value: '1200', current_price: '120' },
      { stock_id: 'b', symbol: 'BBB', name: 'Beta', quantity: '5', average_cost: '200', market_value: '800', current_price: '160' },
    ]);

    expect(result.total_market_value).toBe('2000');
    expect(result.total_cost_basis).toBe('2000');
    expect(result.total_unrealized_gain_loss).toBe('0');
    expect(result.holdings.map((row) => [row.symbol, row.allocation_bps, row.unrealized_gain_loss])).toEqual([
      ['AAA', '6000', '200'],
      ['BBB', '4000', '-200'],
    ]);
  });

  it('handles an empty or zero-value portfolio', () => {
    expect(analyzePortfolio([])).toEqual({
      total_market_value: '0',
      total_cost_basis: '0',
      total_unrealized_gain_loss: '0',
      holdings: [],
    });
  });

  it('rejects malformed authoritative values', () => {
    expect(() => analyzePortfolio([
      { stock_id: 'a', symbol: 'AAA', name: 'Alpha', quantity: '1.5', average_cost: '100', market_value: '150', current_price: '100' },
    ])).toThrow('quantity');
  });
});
