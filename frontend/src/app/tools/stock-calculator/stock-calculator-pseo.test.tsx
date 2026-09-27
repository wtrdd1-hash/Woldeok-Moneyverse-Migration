import { describe, it, expect } from 'vitest';
import { getPseoStockPreset, ALL_PSEO_POPULAR_SLUGS, POPULAR_STOCKS_DATASET } from '@/config/pseo-stocks.config';

describe('pSEO Stocks & Scenarios Engine', () => {
  it('should parse known stock ticker and scenario correctly', () => {
    const samsungMinus20 = getPseoStockPreset('samsung-minus-20');
    expect(samsungMinus20).not.toBeNull();
    expect(samsungMinus20?.title).toContain('삼성전자(SAMSUNG)');
    expect(samsungMinus20?.title).toContain('-20%');
    expect(samsungMinus20?.calculatedResult.primaryValue).toContain('원');
    expect(samsungMinus20?.faqs.length).toBeGreaterThanOrEqual(4);
    expect(samsungMinus20?.howToSteps.length).toBe(3);
  });

  it('should parse US stock ticker (NVDA) correctly with dollar symbol', () => {
    const nvdaMinus30 = getPseoStockPreset('nvda-minus-30');
    expect(nvdaMinus30).not.toBeNull();
    expect(nvdaMinus30?.title).toContain('엔비디아(NVDA)');
    expect(nvdaMinus30?.calculatedResult.primaryValue).toContain('$');
    expect(nvdaMinus30?.badge).toBe('NASDAQ 실전 물타기 pSEO');
  });

  it('should generate dynamic preset for unknown ticker with fallback', () => {
    const customStock = getPseoStockPreset('customcorp-minus-50');
    expect(customStock).not.toBeNull();
    expect(customStock?.title).toContain('CUSTOMCORP');
    expect(customStock?.calculatedResult.primaryValue).toBeDefined();
  });

  it('should provide popular slugs dataset with at least 100 entries', () => {
    expect(ALL_PSEO_POPULAR_SLUGS.length).toBeGreaterThanOrEqual(100);
    expect(ALL_PSEO_POPULAR_SLUGS).toContain('samsung-minus-20');
    expect(ALL_PSEO_POPULAR_SLUGS).toContain('tsla-minus-50');
    expect(ALL_PSEO_POPULAR_SLUGS).toContain('chips-double-down');
  });
});
