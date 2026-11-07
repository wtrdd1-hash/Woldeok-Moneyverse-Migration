import { describe, expect, it } from 'vitest';
import { formatPortfolioShareSnapshot } from './portfolio-share-format';

describe('formatPortfolioShareSnapshot', () => {
  it('preserves WLD values above Number.MAX_SAFE_INTEGER without rounding', () => {
    const result = formatPortfolioShareSnapshot('9007199254740993', '9007199254740993', '2500');
    expect(result.assetText).toBe('9,007,199,254,740,993 WLD');
    expect(result.profitText).toBe('+9,007,199,254,740,993 WLD');
    expect(result.yieldText).toBe('+25.00%');
    expect(result.grade).toBe('S+');
  });

  it('formats a negative gain and negative basis-point rate exactly', () => {
    const result = formatPortfolioShareSnapshot('100000000000000000001', '-100000000000000000001', '-1005');
    expect(result.assetText).toBe('100,000,000,000,000,000,001 WLD');
    expect(result.profitText).toBe('-100,000,000,000,000,000,001 WLD');
    expect(result.yieldText).toBe('-10.05%');
    expect(result.grade).toBe('C');
    expect(result.isProfit).toBe(false);
  });

  it('does not claim a positive gain for a zero balance', () => {
    expect(formatPortfolioShareSnapshot('0', '0', '0')).toMatchObject({
      assetText: '0 WLD', profitText: '0 WLD', yieldText: '0.00%', isProfit: false, grade: 'B',
    });
  });

  it('fails closed on invalid monetary or rate input', () => {
    expect(() => formatPortfolioShareSnapshot('1.5', '0', '0')).toThrow();
    expect(() => formatPortfolioShareSnapshot('0', 'Infinity', '0')).toThrow();
    expect(() => formatPortfolioShareSnapshot('0', '0', 'NaN')).toThrow();
  });
});
