import { describe, it, expect } from 'vitest';
import { analyzePortfolio, type PortfolioHoldingInput } from '../stocks/portfolio/analysis';

describe('wallet stock holdings and sell action integration', () => {
  it('computes aggregated stock valuation and profit correctly for wallet display', () => {
    const mockHoldings: PortfolioHoldingInput[] = [
      {
        stock_id: 'stock-wdx',
        symbol: 'WDX',
        name: '월덕 익스프레스',
        quantity: '100',
        average_cost: '50000',
        market_value: '6000000',
        current_price: '60000',
      },
      {
        stock_id: 'stock-kdg',
        symbol: 'KDG',
        name: '케이덕 게임즈',
        quantity: '50',
        average_cost: '20000',
        market_value: '800000',
        current_price: '16000',
      },
    ];

    const analysis = analyzePortfolio(mockHoldings);

    // 총 평가금액: 6,000,000 + 800,000 = 6,800,000
    expect(analysis.total_market_value).toBe('6800000');
    // 총 원금: (100 * 50,000) + (50 * 20,000) = 5,000,000 + 1,000,000 = 6,000,000
    expect(analysis.total_cost_basis).toBe('6000000');
    // 총 손익: +800,000
    expect(analysis.total_unrealized_gain_loss).toBe('800000');
    // 총 수익률: (800,000 / 6,000,000) * 10,000 = +1333 bps (약 +13.33%)
    expect(analysis.total_gain_loss_bps).toBe('1333');

    // 개별 종목 매도 파라미터 유효성 검증
    const wdxHolding = analysis.holdings.find((h) => h.symbol === 'WDX');
    expect(wdxHolding).toBeDefined();
    expect(wdxHolding?.quantity).toBe('100');
    expect(wdxHolding?.current_price).toBe('60000');
    expect(wdxHolding?.unrealized_gain_loss).toBe('1000000');
  });

  it('handles empty portfolio gracefully without crash', () => {
    const emptyHoldings: PortfolioHoldingInput[] = [];
    const analysis = analyzePortfolio(emptyHoldings);

    expect(analysis.total_market_value).toBe('0');
    expect(analysis.total_cost_basis).toBe('0');
    expect(analysis.total_unrealized_gain_loss).toBe('0');
    expect(analysis.total_gain_loss_bps).toBe('0');
    expect(analysis.holdings).toHaveLength(0);
  });
});
