import { describe, expect, it } from 'vitest';
import {
  calculateMarketTax,
  MARKET_TAX_RATE,
  MAX_MARKET_TAX_WLD,
} from './market-tax';

describe('프론트엔드 마켓 거래세 엔진 (market-tax)', () => {
  it('상수 값이 기획 명세와 정확히 일치해야 한다', () => {
    expect(MARKET_TAX_RATE).toBe(0.02);
    expect(MAX_MARKET_TAX_WLD).toBe(500_000);
  });

  it('일반적인 거래 규모에서 2% 거래세를 정확히 원천징수하고 50/50으로 분배해야 한다', () => {
    const result = calculateMarketTax(10_000);
    expect(result.grossWld).toBe(10_000);
    expect(result.taxRatePercent).toBe(2.0);
    expect(result.taxAmount).toBe(200);
    expect(result.sellerProceeds).toBe(9_800);
    expect(result.coinSinkAmount).toBe(100);
    expect(result.treasuryAllocation).toBe(100);
  });

  it('대규모 거래 시 최대 상한(50만 WLD)이 엄격하게 적용되어야 한다', () => {
    const result = calculateMarketTax(100_000_000);
    expect(result.taxAmount).toBe(500_000);
    expect(result.sellerProceeds).toBe(99_500_000);
    expect(result.coinSinkAmount).toBe(250_000);
    expect(result.treasuryAllocation).toBe(250_000);
  });

  it('홀수 세금액의 경우 소각 쪽에 안전하게 1 올림 분배되어야 한다', () => {
    const result = calculateMarketTax(150);
    expect(result.taxAmount).toBe(3);
    expect(result.coinSinkAmount).toBe(2);
    expect(result.treasuryAllocation).toBe(1);
    expect(result.coinSinkAmount + result.treasuryAllocation).toBe(result.taxAmount);
  });

  it('0 이하 입력 시 안전하게 0을 반환해야 한다', () => {
    expect(calculateMarketTax(0).taxAmount).toBe(0);
    expect(calculateMarketTax(-500).taxAmount).toBe(0);
  });
});
