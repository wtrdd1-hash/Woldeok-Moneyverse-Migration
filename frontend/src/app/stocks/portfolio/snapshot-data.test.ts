import { describe, expect, it } from 'vitest';
import { analyzePortfolio } from './analysis';
import { portfolioValuationData } from './snapshot-data';

describe('portfolioValuationData', () => {
  it('uses only authenticated holdings valuation, not transaction or burn guesses', () => {
    const analysis = analyzePortfolio([
      { stock_id: 'a', symbol: 'AAA', name: 'Alpha', quantity: '10', average_cost: '100', market_value: '1200', current_price: '120' },
      { stock_id: 'b', symbol: 'BBB', name: 'Beta', quantity: '5', average_cost: '200', market_value: '800', current_price: '160' },
    ]);
    const snapshot = portfolioValuationData(analysis, '2026-10-25T02:50:00.000Z');
    expect(snapshot).toEqual({
      asOfLabel: '2026-10-25T02:50:00.000Z',
      marketValueWld: '2,000',
      unrealizedGainWld: '0',
      unrealizedReturnPct: '0%',
      largestHoldingSymbol: 'AAA',
      largestHoldingReturnPct: '+20%',
      holdingCount: 2,
    });
    for (const forbidden of ['tradeCount', 'realizedGainWld', 'feeBurnContributionWld', 'weekNumber', 'diversificationScore']) {
      expect(Object.keys(snapshot)).not.toContain(forbidden);
    }
  });

  it('handles empty holdings without inventing a ticker or trade receipt', () => {
    const snapshot = portfolioValuationData(analyzePortfolio([]), 'now');
    expect(snapshot.largestHoldingSymbol).toBe('—');
    expect(snapshot.holdingCount).toBe(0);
    expect(snapshot.marketValueWld).toBe('0');
  });
});
