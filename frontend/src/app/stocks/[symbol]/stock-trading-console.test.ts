import { describe, expect, it } from 'vitest';
import { computeOrderbook } from './stock-orderbook';

describe('computeOrderbook', () => {
  it('generates exactly 5 asks and 5 bids when depth is 5', () => {
    const data = computeOrderbook('10000', 5);
    expect(data.asks).toHaveLength(5);
    expect(data.bids).toHaveLength(5);
    expect(data.asks.map((a) => a.step)).toEqual([5, 4, 3, 2, 1]);
    expect(data.bids.map((b) => b.step)).toEqual([1, 2, 3, 4, 5]);
  });

  it('generates exactly 10 asks and 10 bids when depth is 10', () => {
    const data = computeOrderbook('10000', 10);
    expect(data.asks).toHaveLength(10);
    expect(data.bids).toHaveLength(10);
    expect(data.asks[0]?.step).toBe(10);
    expect(data.asks[9]?.step).toBe(1);
    expect(data.bids[0]?.step).toBe(1);
    expect(data.bids[9]?.step).toBe(10);
  });

  it('calculates asks above current price and bids below current price', () => {
    const currentPrice = '50000';
    const data = computeOrderbook(currentPrice, 5);
    const priceNum = 50000;

    // Asks: step 1 is +0.5% (50250), step 5 is +2.5% (51250)
    for (const ask of data.asks) {
      expect(Number.parseInt(ask.price, 10)).toBeGreaterThan(priceNum);
    }
    // Bids: step 1 is -0.5% (49750), step 5 is -2.5% (48750)
    for (const bid of data.bids) {
      expect(Number.parseInt(bid.price, 10)).toBeLessThan(priceNum);
    }

    // Best ask is the lowest ask (step 1, last element in asks array)
    expect(data.bestAsk).toBe(50250);
    // Best bid is the highest bid (step 1, first element in bids array)
    expect(data.bestBid).toBe(49750);

    // Spread = 50250 - 49750 = 500
    expect(data.spread).toBe(500);
    // Spread Bps = (500 / 50000) * 100 = 1.00%
    expect(data.spreadBps).toBe('1.00');
  });

  it('handles comma-formatted price strings cleanly', () => {
    const data = computeOrderbook('1,234,567', 5);
    expect(data.asks).toHaveLength(5);
    expect(data.bids).toHaveLength(5);
    expect(Number.parseInt(data.asks[0]?.price ?? '0', 10)).toBeGreaterThan(1234567);
  });

  it('prevents bid price from dropping below 1 WLD', () => {
    const data = computeOrderbook('1', 10);
    for (const bid of data.bids) {
      expect(Number.parseInt(bid.price, 10)).toBeGreaterThanOrEqual(1);
    }
  });

  it('handles empty or zero price string safely with fallback', () => {
    const data = computeOrderbook('', 5);
    expect(data.asks).toHaveLength(5);
    expect(data.bids).toHaveLength(5);
    expect(data.spreadBps).toBeDefined();
  });
});
