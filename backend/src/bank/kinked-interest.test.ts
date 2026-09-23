import { describe, it, expect } from 'vitest';
import {
  calculateKinkedInterestRate,
  OPTIMAL_UTILIZATION,
  STATUTORY_RESERVE_RATIO,
} from './kinked-interest';

describe('Aave 스타일 Kinked 점프 이자율 & 바젤 III 20% 법정 준비금 엔진', () => {
  it('예금이 없을 경우 기본 최저 대출 금리와 0% 예금 금리를 반환해야 한다', () => {
    const result = calculateKinkedInterestRate(0n, 0n);
    expect(result.utilizationRate).toBe(0);
    expect(result.borrowRateBps).toBe(300); // 3.00%
    expect(result.supplyRateBps).toBe(0);
    expect(result.isKinkExceeded).toBe(false);
    expect(result.availableBorrowCapacity).toBe(0n);
    expect(result.statutoryReserveAmount).toBe(0n);
  });

  it('이용률 U <= 80% 구간에서 완만한 3% ~ 8% 선형 금리를 적용해야 한다', () => {
    // 1,000만 WLD 예금, 400만 WLD 대출 (U = 40%)
    const result40 = calculateKinkedInterestRate(10_000_000n, 4_000_000n);
    expect(result40.utilizationRate).toBe(0.4);
    // 3% + (0.4 / 0.8) * 5% = 5.5% (550 bps)
    expect(result40.borrowRateBps).toBe(550);
    expect(result40.isKinkExceeded).toBe(false);
    // 20% 법정 준비금: 200만 WLD
    expect(result40.statutoryReserveAmount).toBe(2_000_000n);
    // 추가 대출 가능 한도: 800만 - 400만 = 400만 WLD
    expect(result40.availableBorrowCapacity).toBe(4_000_000n);

    // 1,000만 WLD 예금, 800만 WLD 대출 (U = 80%, Kink 기준점)
    const result80 = calculateKinkedInterestRate(10_000_000n, 8_000_000n);
    expect(result80.utilizationRate).toBe(OPTIMAL_UTILIZATION);
    // 3% + 5% = 8.00% (800 bps)
    expect(result80.borrowRateBps).toBe(800);
    expect(result80.isKinkExceeded).toBe(false);
    expect(result80.availableBorrowCapacity).toBe(0n);
  });

  it('이용률 U > 80% 초과 구간에서 최대 48%의 급격한 점프 이자율을 발동해야 한다', () => {
    // 1,000만 WLD 예금, 900만 WLD 대출 (U = 90%)
    const result90 = calculateKinkedInterestRate(10_000_000n, 9_000_000n);
    expect(result90.utilizationRate).toBe(0.9);
    expect(result90.isKinkExceeded).toBe(true);
    // 8% + ((0.9 - 0.8) / 0.2) * 40% = 8% + 20% = 28.00% (2800 bps)
    expect(result90.borrowRateBps).toBe(2800);

    // 1,000만 WLD 예금, 1,000만 WLD 대출 (U = 100%, 최대 페널티)
    const result100 = calculateKinkedInterestRate(10_000_000n, 10_000_000n);
    expect(result100.utilizationRate).toBe(1.0);
    expect(result100.isKinkExceeded).toBe(true);
    // 8% + 40% = 48.00% (4800 bps)
    expect(result100.borrowRateBps).toBe(4800);
    expect(result100.availableBorrowCapacity).toBe(0n);
  });

  it('바젤 III 20% 법정 준비금 버퍼가 항상 총 예금의 20%로 동결되어야 한다', () => {
    const totalDeposits = 50_000_000n;
    const result = calculateKinkedInterestRate(totalDeposits, 10_000_000n);
    const expectedReserve = (totalDeposits * BigInt(Math.round(STATUTORY_RESERVE_RATIO * 100))) / 100n;
    expect(result.statutoryReserveAmount).toBe(expectedReserve);
    expect(result.statutoryReserveAmount).toBe(10_000_000n);
  });
});
