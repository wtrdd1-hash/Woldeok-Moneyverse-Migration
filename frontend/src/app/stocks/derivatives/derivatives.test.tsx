import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  calculateLiquidationPrice,
  calculateDerivativesPnL,
  calculateFundingFee,
  calculateLiquidationSettlement,
  generateLiquidationHeatmap,
  DERIVATIVES_MARKET_SYMBOLS,
} from '@moneyverse/contract';
import DerivativesPage from './page';

describe('가상 파생상품 10x 레버리지 선물 거래소 계약 & 계산 엔진 테스트', () => {
  it('1. 격리 마진 롱/숏 청산가(Liquidation Price)를 정확히 계산해야 한다', () => {
    const entryPrice = 10000;

    // 10x 롱: entryPrice * (1 - 0.10 + 0.05) = 9,500
    const long10x = calculateLiquidationPrice(entryPrice, 10, 'LONG');
    expect(long10x).toBe(9500);

    // 10x 숏: entryPrice * (1 + 0.10 - 0.05) = 10,500
    const short10x = calculateLiquidationPrice(entryPrice, 10, 'SHORT');
    expect(short10x).toBe(10500);

    // 5x 롱: entryPrice * (1 - 0.20 + 0.05) = 8,500
    const long5x = calculateLiquidationPrice(entryPrice, 5, 'LONG');
    expect(long5x).toBe(8500);

    // 5x 숏: entryPrice * (1 + 0.20 - 0.05) = 11,500
    const short5x = calculateLiquidationPrice(entryPrice, 5, 'SHORT');
    expect(short5x).toBe(11500);
  });

  it('2. 실시간 미실현 손익(PnL) 및 ROI %를 레버리지 배율에 맞게 정확히 산출해야 한다', () => {
    const entryPrice = 10000;
    const margin = 1000000; // 100만 WLD

    // 10x 롱: 시세 +10% 상승 시 PnL = +100만 WLD (ROI +100%)
    const longProfit = calculateDerivativesPnL(entryPrice, 11000, margin, 10, 'LONG');
    expect(longProfit.pnl).toBe(1000000);
    expect(longProfit.roi).toBe(100);

    // 10x 숏: 시세 +10% 상승 시 PnL = -100만 WLD (ROI -100%)
    const shortLoss = calculateDerivativesPnL(entryPrice, 11000, margin, 10, 'SHORT');
    expect(shortLoss.pnl).toBe(-1000000);
    expect(shortLoss.roi).toBe(-100);

    // 손실 제한: 최대 손실은 증거금(100%)으로 제한됨
    const maxLoss = calculateDerivativesPnL(entryPrice, 5000, margin, 10, 'LONG');
    expect(maxLoss.pnl).toBe(-1000000);
    expect(maxLoss.roi).toBe(-100);
  });

  it('3. 8시간 펀딩비 및 청산 시 50% 보험적립 + 50% 영구소각 원장 정산을 정상 수행해야 한다', () => {
    const positionValue = 20000000; // 2천만 WLD
    const fundingRate = 0.01; // +0.01%
    const fundingFee = calculateFundingFee(positionValue, fundingRate);
    expect(fundingFee).toBe(2000);

    const margin = 2000000; // 2백만 WLD
    const settlement = calculateLiquidationSettlement(margin);
    expect(settlement.insuranceFundDeposit).toBe(1000000);
    expect(settlement.hardBurnWld).toBe(1000000);
    expect(settlement.insuranceFundDeposit + settlement.hardBurnWld).toBe(margin);
  });

  it('4. 10대 종목 실시간 청산 히트맵 클러스터를 정상 생성해야 한다', () => {
    const currentPrice = 12500;
    const heatmap = generateLiquidationHeatmap(currentPrice);
    expect(heatmap.length).toBeGreaterThan(0);
    expect(heatmap.some((c) => c.type === 'LONG_LIQUIDATION')).toBe(true);
    expect(heatmap.some((c) => c.type === 'SHORT_LIQUIDATION')).toBe(true);
  });

  it('5. 프론트엔드 파생상품 거래소 화면이 정상 렌더링되어야 한다', () => {
    render(<DerivativesPage />);
    expect(screen.getByText(/10X 레버리지 파생상품 선물 거래소/i)).toBeDefined();
    expect(screen.getByText(/실시간 청산 히트맵/i)).toBeDefined();
    expect(screen.getByText(/선물 주문 콘솔/i)).toBeDefined();
  });
});
