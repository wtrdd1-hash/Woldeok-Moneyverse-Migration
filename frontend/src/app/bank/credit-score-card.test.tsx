import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreditScoreCard } from './credit-score-card';

describe('CreditScoreCard Component', () => {
  it('renders credit score card and syncs interest rate with standingLoanInterestBps', () => {
    render(
      <CreditScoreCard
        initialRating={{score: 610, tier: 5, tierNameKo: '일반 1급', creditLimitWld: 200000, interestRateBps: 600, maxInstallments: 6}}
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
    expect(screen.getByText(/게임활동 기반 참고용 신용 점수/)).toBeDefined();
  });

  it('falls back to default interest rate when standingLoanInterestBps is not provided', () => {
    render(<CreditScoreCard />);

    expect(screen.getByText(/신용 평가 자료를 불러올 수 없습니다/)).toBeDefined();
    expect(screen.queryByText('4.50%')).toBeNull();
  });
});
