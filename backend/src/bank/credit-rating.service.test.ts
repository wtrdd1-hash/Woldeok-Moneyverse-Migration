import { describe, expect, it } from 'vitest';
import {
  evaluateUserCreditRating,
  generateLoanSchedule,
} from './credit-rating.service';

describe('CreditRatingService', () => {
  it('should assign Tier 1 (Prime AAA) to veteran player with high level, wealth, and repayments', () => {
    const veteranProfile = {
      userId: 'user_vet_01',
      accountAgeDays: 60,
      jobLevel: 10,
      totalCashWld: 50000,
      depositBalanceWld: 50000,
      historicalRepaymentsCount: 6,
      overdueRepaymentsCount: 0,
      recentCasinoSpendWld: 0,
    };

    const rating = evaluateUserCreditRating(veteranProfile);

    expect(rating.score).toBeGreaterThanOrEqual(900);
    expect(rating.tier).toBe(1);
    expect(rating.creditLimitWld).toBe(500_000);
    expect(rating.interestRateBps).toBe(350);
    expect(rating.maxInstallments).toBe(12);
  });

  it('should degrade tier and apply overdue penalties when loan defaults occur', () => {
    const delinquentProfile = {
      userId: 'user_delinq_01',
      accountAgeDays: 20,
      jobLevel: 2,
      totalCashWld: 1000,
      depositBalanceWld: 0,
      historicalRepaymentsCount: 0,
      overdueRepaymentsCount: 3, // 3 overdue payments (-300)
    };

    const rating = evaluateUserCreditRating(delinquentProfile);

    expect(rating.score).toBeLessThan(400);
    expect(rating.tier).toBeGreaterThanOrEqual(8);
    expect(rating.recoveryGuidance).toBeDefined();
  });

  it('should generate equal-principal installment schedule without hidden fees', () => {
    const scheduleResult = generateLoanSchedule(120000, 6, 600); // 120,000 WLD, 6 installments, 6.0% APR

    expect(scheduleResult.principalAmountWld).toBe(120000);
    expect(scheduleResult.installmentCount).toBe(6);
    expect(scheduleResult.earlyRepaymentPenaltyWld).toBe(0);
    expect(scheduleResult.schedule).toHaveLength(6);

    // Sum of installment principals must match original principal
    const sumPrincipal = scheduleResult.schedule.reduce((sum, item) => sum + item.principalWld, 0);
    expect(sumPrincipal).toBe(120000);

    // Last installment remaining balance must be 0
    expect(scheduleResult.schedule[5]?.remainingBalanceWld).toBe(0);
  });
});
