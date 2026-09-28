import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  calculateCompanyValuation,
  calculateIpoAllocation,
  calculateShareholderDividend,
  calculateCorporateTaxAndBurn,
  INITIAL_VENTURE_COMPANIES,
} from '@moneyverse/contract';
import VenturesPage from './page';

describe('가상 스타트업 VC 엔젤투자 & 크라우드펀딩 계약 및 금융 연산 엔진 테스트', () => {
  it('1. 기업가치(Valuation)를 자본금과 일일 매출 승수에 따라 정확히 산출해야 한다', () => {
    const capital = 50000000; // 5천만 WLD
    const dailyRevenue = 30000000; // 3천만 WLD
    const multiplier = 15;

    const valuation = calculateCompanyValuation(capital, dailyRevenue, multiplier);
    // 50,000,000 + (30,000,000 * 15) = 500,000,000 WLD
    expect(valuation).toBe(500000000);
  });

  it('2. IPO 초과 청약 시 공모주 비례 배분 및 잔여 증거금 환불을 정확히 계산해야 한다', () => {
    const targetAmount = 100000000; // 목표 1억 WLD
    const totalSubscribed = 200000000; // 청약 2억 WLD (2.0x 경쟁률)
    const offeredShares = 200000; // 20만주
    const sharePrice = 500; // 주당 500 WLD

    const subscriptionAmount = 10000000; // 1천만 WLD 청약 신청 (20,000주 신청)
    const result = calculateIpoAllocation(
      subscriptionAmount,
      targetAmount,
      totalSubscribed,
      offeredShares,
      sharePrice
    );

    // 20,000주 / 2.0x = 10,000주 배정
    expect(result.allocatedShares).toBe(10000);
    expect(result.spentAmount).toBe(5000000); // 10,000 * 500
    expect(result.refundAmount).toBe(5000000); // 1천만 - 5백만
    expect(result.competitionRatio).toBe(2.0);
  });

  it('3. 주주 일일 배당금 및 법인세 3% 소각액을 정확히 산출해야 한다', () => {
    const dailyRevenue = 30000000; // 3천만 WLD
    const payoutRatio = 0.30; // 30%
    const shareRatioPct = 6.0; // 6% 지분

    // 총 배당풀: 30,000,000 * 0.3 = 9,000,000 WLD
    // 주주 배당: 9,000,000 * 0.06 = 540,000 WLD
    const dividend = calculateShareholderDividend(dailyRevenue, payoutRatio, shareRatioPct);
    expect(dividend).toBe(540000);

    // 법인세 3% 소각: 30,000,000 * 0.03 = 900,000 WLD
    const corporateTax = calculateCorporateTaxAndBurn(dailyRevenue);
    expect(corporateTax).toBe(900000);
  });

  it('4. 프론트엔드 스타트업 VC 대시보드가 정상 렌더링되어야 한다', () => {
    render(<VenturesPage />);
    expect(screen.getByText(/가상 스타트업 VC & 엔젤투자/i)).toBeDefined();
    expect(screen.getByText(/스타트업 디렉토리 & 기업가치 랭킹/i)).toBeDefined();
    expect(screen.getByText(/공모주 청약\(IPO\) 크라우드펀딩/i)).toBeDefined();
    expect(screen.getByText(/내 보유 지분 & 엔젤 거버넌스/i)).toBeDefined();
  });
});
