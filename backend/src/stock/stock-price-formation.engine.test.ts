import { describe, expect, it } from 'vitest';
import {
  calculateNextStockPrice,
  DEFAULT_PRICE_ENGINE_CONFIG,
} from './stock-price-formation.engine';

describe('StockPriceFormationEngine', () => {
  it('should calculate deterministic price adjustment under normal market forces', () => {
    const result = calculateNextStockPrice({
      symbol: 'WDX_TECH',
      basePrice: 10000,
      fundamentalAnchorReturn: 0.02, // +2%
      orderFlowPressure: 0.01, // +1%
      liquiditySpreadImpact: -0.005, // -0.5%
      momentumContribution: 0.01, // +1%
      sectorFactorContribution: 0.015, // +1.5%
      eventShockContribution: 0,
      volatilityRegime: 1.0,
      manipulationIntegrityPenalty: 0,
    });

    // Gross: (0.02 + 0.01 - 0.005 + 0.01 + 0.015) = 0.05 (5%)
    expect(result.rawReturnPct).toBeCloseTo(5.0, 1);
    expect(result.newPrice).toBe(10500);
    expect(result.delta).toBe(500);
    expect(result.isCircuitBreakerTriggered).toBe(false);
    expect(result.isMinPriceClamped).toBe(false);
  });

  it('should trigger circuit breaker and clamp return to ±15% when extreme shocks occur', () => {
    const extremeShock = calculateNextStockPrice({
      symbol: 'WDX_BIO',
      basePrice: 50000,
      fundamentalAnchorReturn: 0.05,
      orderFlowPressure: 0.08,
      sectorFactorContribution: 0.05,
      eventShockContribution: 0.10, // Massive event shock
      volatilityRegime: 1.8, // High volatility regime
    });

    expect(extremeShock.isCircuitBreakerTriggered).toBe(true);
    // Should be clamped to maxTickReturnBps (15%)
    expect(extremeShock.returnPct).toBeCloseTo(15.0, 0);
    expect(extremeShock.newPrice).toBe(57500);
  });

  it('should deduct manipulation penalty to suppress artificial pump-and-dump', () => {
    const manipulated = calculateNextStockPrice({
      symbol: 'WDX_SPEC',
      basePrice: 20000,
      orderFlowPressure: 0.06, // Sudden order surge
      manipulationIntegrityPenalty: 0.10, // 10% penalty detected by Market Integrity Agent
    });

    expect(manipulated.isIntegrityPenalized).toBe(true);
    expect(manipulated.rawReturnPct).toBeLessThan(0);
    expect(manipulated.newPrice).toBeLessThan(20000);
  });

  it('should clamp price to minPriceWdx (1 WDX) and never allow zero or negative prices', () => {
    const pennyStockCrash = calculateNextStockPrice({
      symbol: 'WDX_PENNY',
      basePrice: 2,
      fundamentalAnchorReturn: -0.05,
      eventShockContribution: -0.10,
      volatilityRegime: 2.0,
    });

    expect(pennyStockCrash.newPrice).toBeGreaterThanOrEqual(DEFAULT_PRICE_ENGINE_CONFIG.minPriceWdx);
    expect(pennyStockCrash.newPrice).toBe(1);
  });
});
