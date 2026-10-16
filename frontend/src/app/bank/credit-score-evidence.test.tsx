import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreditScoreCard } from './credit-score-card';

describe('CreditScoreCard evidence truth (v716)', () => {
  it('never invents tier, score, or interest rate when the real API is missing', () => {
    render(<CreditScoreCard standingCreditLimit="90071992547409931234567" />);
    expect(screen.getByText(/신용 평가 자료를 불러올 수 없습니다/)).toBeDefined();
    expect(screen.queryByText('780')).toBeNull();
    expect(screen.queryByText('4.50%')).toBeNull();
    expect(screen.getByText(/90,071,992,547,409,931,234,567/)).toBeDefined();
  });

  it('marks simulation separately from actual borrowing authority', () => {
    render(<CreditScoreCard initialRating={{
      score: 610, tier: 5, tierNameKo: '일반 1급', creditLimitWld: 200000,
      interestRateBps: 600, maxInstallments: 6,
      simulatedNotice: '학습 시뮬레이션입니다.',
    }} standingCreditLimit="50000" standingCreditGrade="C" standingLoanInterestBps="800" />);
    expect(screen.getByText(/게임활동 기반 참고용 신용 점수/)).toBeDefined();
    expect(screen.getByText('8.00%')).toBeDefined();
    expect(screen.getByText(/50,000 WLD/)).toBeDefined();
  });
});
