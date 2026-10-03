import { describe, it, expect } from 'vitest';
import { calculateRealEstateYield } from './real-estate-calculator';

describe('real-estate-calculator unit tests', () => {
  it('should correctly calculate Net Cap Rate and Leveraged ROE', () => {
    // 매매가 10억, 보증금 1억, 월세 400만(연 4,800만), 대출 6억(금리 4%), 취득세 4.6%, 유지비 연 200만
    const res = calculateRealEstateYield({
      purchasePrice: 1000000000,
      deposit: 100000000,
      monthlyRent: 4000000,
      loanAmount: 600000000,
      loanInterestRate: 4.0,
      acquisitionTaxRate: 4.6,
      annualMaintenanceExpense: 2000000,
    });

    expect(res.acquisitionTax).toBe(46000000);
    expect(res.totalPurchaseCost).toBe(1046000000);
    // 실투자금 = 1,046,000,000 - 100,000,000 - 600,000,000 = 346,000,000
    expect(res.actualInvestedCapital).toBe(346000000);
    expect(res.annualGrossRent).toBe(48000000);
    expect(res.annualLoanInterest).toBe(24000000); // 6억 * 4% = 2,400만
    // 연간 순수익 = 4,800만 - 2,400만 - 200만 = 2,200만
    expect(res.annualNetIncome).toBe(22000000);
    expect(res.monthlyNetCashFlow).toBe(Math.round(22000000 / 12));

    expect(res.leveragedRoe).toBeGreaterThan(5.0);
    expect(res.netCapRate).toBeGreaterThan(4.0);
    expect(res.grade).toBe('B');
  });

  it('should gracefully handle zero inputs without dividing by zero', () => {
    const res = calculateRealEstateYield({
      purchasePrice: 0,
      deposit: 0,
      monthlyRent: 0,
      loanAmount: 0,
      loanInterestRate: 0,
      acquisitionTaxRate: 0,
      annualMaintenanceExpense: 0,
    });

    expect(res.netCapRate).toBe(0);
    expect(res.leveragedRoe).toBe(0);
    expect(res.grade).toBe('C');
  });
});
