import { describe, it, expect } from 'vitest';
import {
  simulateQuantStrategy,
  calculateGridLevels,
  INITIAL_QUANT_PRESETS,
} from './quant-studio';

describe('Quant Studio Contract Logic', () => {
  it('has default quant presets', () => {
    expect(INITIAL_QUANT_PRESETS.length).toBeGreaterThanOrEqual(3);
    const dca = INITIAL_QUANT_PRESETS.find((p) => p.strategyType === 'DCA');
    expect(dca).toBeDefined();
    expect(dca?.symbol).toBe('CHIPS');
  });

  it('generates uniform grid levels correctly', () => {
    const levels = calculateGridLevels(1000, 2000, 5);
    expect(levels).toEqual([1000, 1250, 1500, 1750, 2000]);
  });

  it('runs DCA strategy backtest simulation smoothly', () => {
    const prices = [50000, 48000, 46000, 49000, 52000, 55000, 53000, 58000];
    const result = simulateQuantStrategy('DCA', 100000, 10.0, 5.0, prices);

    expect(result.strategyType).toBe('DCA');
    expect(typeof result.totalReturnPct).toBe('number');
    expect(typeof result.winRatePct).toBe('number');
    expect(result.finalCapitalWld).toBeGreaterThan(0);
  });

  it('handles empty or single-element price arrays gracefully', () => {
    const result = simulateQuantStrategy('GRID', 100000, 2.0, 5.0, [50000]);
    expect(result.totalTrades).toBe(0);
    expect(result.finalCapitalWld).toBe(100000);
  });
});
