import { describe, it, expect } from 'vitest';
import { calculateKimchiPremium } from './kimchi-premium-calculator';

describe('kimchi-premium-calculator unit tests', () => {
  it('should accurately calculate positive kimchi premium', () => {
    // 국내 10,000,000원, 해외 $7,000, 환율 1,350원 -> 해외환산 9,450,000원
    const res = calculateKimchiPremium({
      domesticPriceKrw: 10000000,
      foreignPriceUsd: 7000,
      usdKrwExchangeRate: 1350,
      investmentAmountKrw: 10000000,
      transferFeeCoin: 0.0005,
    });

    expect(res.foreignPriceKrwConverted).toBe(9450000);
    expect(res.priceDifferencePerCoin).toBe(550000);
    expect(res.premiumRate).toBeCloseTo(5.82, 1);
    expect(res.statusTag).toBe('HIGH_PREMIUM');
    expect(res.netArbitrageProfitKrw).toBeGreaterThan(0);
  });

  it('should detect reverse premium (discount)', () => {
    // 국내 9,000,000원, 해외 $7,000, 환율 1,350원 -> 해외환산 9,450,000원
    const res = calculateKimchiPremium({
      domesticPriceKrw: 9000000,
      foreignPriceUsd: 7000,
      usdKrwExchangeRate: 1350,
      investmentAmountKrw: 10000000,
      transferFeeCoin: 0.0005,
    });

    expect(res.premiumRate).toBeLessThan(0);
    expect(res.statusTag).toBe('DISCOUNT_REVERSE');
  });
});
