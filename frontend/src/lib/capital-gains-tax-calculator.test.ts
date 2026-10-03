import { describe, it, expect } from 'vitest';
import { calculateCapitalGainsTax } from './capital-gains-tax-calculator';

describe('capital-gains-tax-calculator unit tests', () => {
  it('should calculate tax-free when gain is less than or equal to 2.5M KRW', () => {
    const res = calculateCapitalGainsTax({
      realizedGainKrw: 2500000,
      applyBasicDeduction: true,
    });

    expect(res.taxableBaseKrw).toBe(0);
    expect(res.totalTaxPayableKrw).toBe(0);
    expect(res.effectiveTaxRate).toBe(0);
  });

  it('should calculate 22% tax on amount exceeding 2.5M KRW', () => {
    // 실현수익 1,000만원, 기본공제 250만원 -> 과세표준 750만원 -> 세금 165만원
    const res = calculateCapitalGainsTax({
      realizedGainKrw: 10000000,
      applyBasicDeduction: true,
    });

    expect(res.taxableBaseKrw).toBe(7500000);
    expect(res.nationalTaxKrw).toBe(1500000); // 20%
    expect(res.localTaxKrw).toBe(150000); // 2%
    expect(res.totalTaxPayableKrw).toBe(1650000); // 22%
    expect(res.netProfitAfterTaxKrw).toBe(8350000);
  });

  it('should apply loss harvesting to reduce tax to zero', () => {
    // 실현수익 800만원, 손실상계 550만원 -> 남은수익 250만원 -> 기본공제 250만원 -> 과세표준 0원
    const res = calculateCapitalGainsTax({
      realizedGainKrw: 8000000,
      unrealizedLossKrw: 5500000,
      applyLossHarvesting: true,
      applyBasicDeduction: true,
    });

    expect(res.lossHarvestingDeduction).toBe(5500000);
    expect(res.taxableBaseKrw).toBe(0);
    expect(res.totalTaxPayableKrw).toBe(0);
    expect(res.taxSavedByLossHarvesting).toBe(Math.round(5500000 * 0.22));
  });
});
