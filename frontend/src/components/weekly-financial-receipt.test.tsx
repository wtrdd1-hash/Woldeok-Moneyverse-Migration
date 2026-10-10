import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WeeklyFinancialReceipt } from './weekly-financial-receipt';

describe('WeeklyFinancialReceipt', () => {
  it('renders sample simulation disclaimer when no data is provided', () => {
    render(<WeeklyFinancialReceipt />);

    expect(screen.getByText(/예시 시뮬레이션|Sample Simulation/)).toBeDefined();
    expect(
      screen.getByText(/가상 주식 포트폴리오 활동 예시를 요약한 시뮬레이션 결산 리포트|Simulated sample portfolio/i),
    ).toBeDefined();
  });

  it('renders live holdings synced badge and data when provided', () => {
    render(
      <WeeklyFinancialReceipt
        data={{
          weekNumber: 41,
          periodLabel: '2026.10.11 실시간 보유 기준',
          totalTurnoverWld: '120,000',
          realizedGainWld: '+15,000',
          returnRatePct: '+12.5%',
          topStockSymbol: 'DUCKS',
          topStockReturnPct: '+24.0%',
          tradeCount: 5,
          feeBurnContributionWld: '240',
          diversificationScore: 88,
          traderPersona: '적극적 가상 투자자 (DUCKS 중심)',
        }}
      />,
    );

    expect(screen.getByText(/보유 연동|Holdings Synced/)).toBeDefined();
    expect(screen.getByText('DUCKS (+24.0%)')).toBeDefined();
    expect(screen.getByText(/120,000\s*WLD/)).toBeDefined();
    expect(screen.getByText(/\+15,000\s*WLD\s*\(\+12\.5%\)/)).toBeDefined();
    expect(
      screen.getByText(/실제 보유 주식 및 평가 현황을 기반으로 산출된 요약 영수증|Authoritative portfolio/i),
    ).toBeDefined();
  });
});
