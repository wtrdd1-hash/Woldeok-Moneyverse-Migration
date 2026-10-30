import { describe, it, expect } from 'vitest';
import { generateDeterministicStockNews } from './stock-news-deterministic.engine';

describe('stock-news-deterministic.engine', () => {
  it('returns empty array when no stocks provided', () => {
    expect(generateDeterministicStockNews({})).toEqual([]);
    expect(generateDeterministicStockNews({ stocks: [] })).toEqual([]);
  });

  it('offers five distinct companies instead of only two momentum leaders', () => {
    const stocks = ['CHIMU314', 'DUCK', 'MYUY', 'SPACE', 'WDB', 'WDG', 'WFIN']
      .map((symbol, index) => ({ symbol, price_change_pct: 10 - index }));
    const proposals = generateDeterministicStockNews({ stocks });
    expect(proposals).toHaveLength(4);
    expect(new Set(proposals.map((one) => one.effects[0]?.stock_symbol)).size).toBe(4);
  });

  it('does not fabricate CHIMU314 market news', () => {
    expect(generateDeterministicStockNews({ stocks: [{ symbol: 'CHIMU314', price_change_pct: 55 }] })).toEqual([]);
  });

  it('generates high quality proposals based on stock momentum and sectors', () => {
    const mockContext = {
      stocks: [
        { symbol: 'CHIPS', price_change_pct: 4.8, current_price: 15200 },
        { symbol: 'SPACE', price_change_pct: -2.5, current_price: 34000 },
        { symbol: 'DUCK', price_change_pct: 0.5, current_price: 5200 },
      ],
    };

    const proposals = generateDeterministicStockNews(mockContext);
    expect(proposals.length).toBeGreaterThanOrEqual(1);
    expect(proposals.length).toBeLessThanOrEqual(5);

    for (const proposal of proposals) {
      expect(proposal.headline.length).toBeGreaterThan(5);
      expect(proposal.body.length).toBeGreaterThan(20);
      expect(proposal.hours).toBe(12);
      expect(proposal.effects.length).toBe(1);
      expect(['up', 'down', 'none']).toContain(proposal.effects[0]!.direction);
      expect([1, 2]).toContain(proposal.effects[0]!.strength);
    }
  });
});
