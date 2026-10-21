import { describe, it, expect } from 'vitest';
import { generateDeterministicStockNews } from './stock-news-deterministic.engine';

describe('stock-news-deterministic.engine', () => {
  it('returns empty array when no stocks provided', () => {
    expect(generateDeterministicStockNews({})).toEqual([]);
    expect(generateDeterministicStockNews({ stocks: [] })).toEqual([]);
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
    expect(proposals.length).toBeLessThanOrEqual(2);

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
