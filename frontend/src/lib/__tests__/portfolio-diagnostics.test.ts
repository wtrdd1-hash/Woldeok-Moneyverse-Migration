import { describe, it, expect } from 'vitest';
import {
  diagnosePortfolioDiversification,
  type PortfolioDiagnosticResult,
} from '@/lib/portfolio-diagnostics';
import type { PortfolioHoldingInput } from '@/app/stocks/portfolio/analysis';

describe('Portfolio Diversification Diagnostics Engine (Section 5.7)', () => {
  it('handles empty portfolio gracefully', () => {
    const result = diagnosePortfolioDiversification([]);
    expect(result.distinctSectorCount).toBe(0);
    expect(result.isThreeSectorDiversified).toBe(false);
    expect(result.riskGrade).toBe('A');
    expect(result.marketMasteryXpBonus).toBe(0);
  });

  it('classifies a well-diversified 3-sector portfolio as Grade A with +150 XP bonus', () => {
    const holdings: PortfolioHoldingInput[] = [
      {
        stock_id: '1',
        symbol: 'WDG', // 엔터
        name: '월덕게임즈',
        quantity: '10',
        average_cost: '1000',
        market_value: '10000',
        current_price: '1000',
      },
      {
        stock_id: '2',
        symbol: 'WDT', // 기술
        name: '월덱테크',
        quantity: '10',
        average_cost: '1000',
        market_value: '10000',
        current_price: '1000',
      },
      {
        stock_id: '3',
        symbol: 'WDB', // 금융
        name: '덕뱅크홀딩스',
        quantity: '10',
        average_cost: '1000',
        market_value: '10000',
        current_price: '1000',
      },
    ];

    const result = diagnosePortfolioDiversification(holdings);

    expect(result.distinctSectorCount).toBe(3);
    expect(result.isThreeSectorDiversified).toBe(true);
    expect(result.riskGrade).toBe('A');
    expect(result.marketMasteryXpBonus).toBe(150);
    expect(result.gradeTitle).toContain('최우수 분산');
    expect(result.hhiScore).toBeLessThan(3500);
  });

  it('classifies a 2-sector portfolio as Grade B with +75 XP bonus', () => {
    const holdings: PortfolioHoldingInput[] = [
      {
        stock_id: '1',
        symbol: 'WDG', // 엔터
        name: '월덕게임즈',
        quantity: '10',
        average_cost: '1000',
        market_value: '15000',
        current_price: '1500',
      },
      {
        stock_id: '2',
        symbol: 'WDT', // 기술
        name: '월덱테크',
        quantity: '10',
        average_cost: '1000',
        market_value: '10000',
        current_price: '1000',
      },
    ];

    const result = diagnosePortfolioDiversification(holdings);

    expect(result.distinctSectorCount).toBe(2);
    expect(result.isThreeSectorDiversified).toBe(false);
    expect(result.riskGrade).toBe('B');
    expect(result.marketMasteryXpBonus).toBe(75);
    expect(result.recommendationMessage).toContain('3섹터 분산 보너스');
  });

  it('classifies single-sector concentrated portfolio as Grade C with warning', () => {
    const holdings: PortfolioHoldingInput[] = [
      {
        stock_id: '1',
        symbol: 'WDG', // 엔터
        name: '월덕게임즈',
        quantity: '100',
        average_cost: '1000',
        market_value: '100000',
        current_price: '1000',
      },
    ];

    const result = diagnosePortfolioDiversification(holdings);

    expect(result.distinctSectorCount).toBe(1);
    expect(result.isThreeSectorDiversified).toBe(false);
    expect(result.riskGrade).toBe('C');
    expect(result.marketMasteryXpBonus).toBe(0);
    expect(result.hhiScore).toBe(10000);
    expect(result.gradeTitle).toContain('고위험 집중');
  });
});
