import { describe, expect, it } from 'vitest';
import {
  calculateMarketTax,
  MARKET_TAX_RATE,
  MAX_MARKET_TAX_WLD,
} from './marketplace-tax';

describe('OSRS 스타일 2% 마켓 거래세 및 자동 소각 엔진 (marketplace-tax)', () => {
  it('상수 값이 기획 명세와 정확히 일치해야 한다', () => {
    expect(MARKET_TAX_RATE).toBe(0.02);
    expect(MAX_MARKET_TAX_WLD).toBe(500_000n);
  });

  it('일반적인 거래 규모에서 2% 거래세를 정확히 원천징수하고 50/50으로 분배해야 한다', () => {
    // 10,000 WLD 거래: 2% = 200 WLD
    const result = calculateMarketTax(10_000);
    expect(result.grossWld).toBe(10_000n);
    expect(result.taxRatePercent).toBe(2.0);
    expect(result.taxAmount).toBe(200n);
    expect(result.sellerProceeds).toBe(9_800n);
    expect(result.coinSinkAmount).toBe(100n); // 50% 영구 소각
    expect(result.treasuryAllocation).toBe(100n); // 50% 국고 적립
  });

  it('대규모 거래 시 최대 상한(50만 WLD)이 엄격하게 적용되어야 한다', () => {
    // 1억 WLD 거래: 2%는 2,000,000 WLD이지만 최대 500,000 WLD로 캡
    const result = calculateMarketTax(100_000_000n);
    expect(result.taxAmount).toBe(500_000n);
    expect(result.sellerProceeds).toBe(99_500_000n);
    expect(result.coinSinkAmount).toBe(250_000n);
    expect(result.treasuryAllocation).toBe(250_000n);
  });

  it('홀수 세금액의 경우 소각 쪽에 안전하게 1 올림 분배되어야 한다', () => {
    // 150 WLD 거래: 2% = 3 WLD
    const result = calculateMarketTax(150);
    expect(result.taxAmount).toBe(3n);
    expect(result.coinSinkAmount).toBe(2n);
    expect(result.treasuryAllocation).toBe(1n);
    expect(result.coinSinkAmount + result.treasuryAllocation).toBe(result.taxAmount);
  });

  it('0 WLD 또는 음수 입력 시 안전하게 0을 반환해야 한다', () => {
    const zero = calculateMarketTax(0);
    expect(zero.taxAmount).toBe(0n);
    expect(zero.sellerProceeds).toBe(0n);

    const negative = calculateMarketTax(-100);
    expect(negative.taxAmount).toBe(0n);
    expect(negative.sellerProceeds).toBe(0n);
  });

  it('문자열 형태의 금액 입력도 정확히 파싱하여 처리해야 한다', () => {
    const strResult = calculateMarketTax('50000');
    expect(strResult.grossWld).toBe(50_000n);
    expect(strResult.taxAmount).toBe(1_000n);
    expect(strResult.sellerProceeds).toBe(49_000n);
    expect(strResult.coinSinkAmount).toBe(500n);
    expect(strResult.treasuryAllocation).toBe(500n);
  });
});
