import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreditScoreCard } from './credit-score-card';

describe('CreditScoreCard Component', () => {
  it('renders credit score card and syncs interest rate with standingLoanInterestBps', () => {
    render(
      <CreditScoreCard
        standingCreditLimit="50000"
        standingCreditGrade="C"
        standingLoanInterestBps="800"
        standingLoanTermDays={30}
      />,
    );

    // C등급 권위 뱃지 표시 검증
    expect(screen.getByText(/C등급 ·/)).toBeDefined();
    // 서버 공시 금리 800bps -> 8.00% 동기화 검증
    expect(screen.getByText('8.00%')).toBeDefined();
    // 공시 한도 동기화 검증
    expect(screen.getByText(/50,000 WLD와 100% 동기화된 권위 신용 지표/)).toBeDefined();
  });

  it('falls back to default interest rate when standingLoanInterestBps is not provided', () => {
    render(<CreditScoreCard />);

    // 기본 fallbackRating interestRateBps: 450 -> 4.50%
    expect(screen.getByText('4.50%')).toBeDefined();
  });
});
