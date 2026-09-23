/**
 * Aave v3 / Compound III 스타일 Kinked Jump Interest Rate Model & 바젤 III 20% 법정 준비금
 * 기준: docs/planning/deltas/v2026.09.23.406.ko.md Flaw G406-06
 *
 * 공식:
 * - U <= 80%: Borrow Rate = 3% + (U / 0.8) * 5% (완만한 3% ~ 8%)
 * - U > 80%: Borrow Rate = 8% + ((U - 0.8) / 0.2) * 40% (최대 48% 점프 페널티)
 * - 법정 지급준비금: 총 예금의 20% 동결 (뱅크런 방지 및 인출 보장)
 * - Supply Rate = Borrow Rate * U * (1 - 0.20)
 */

export interface KinkedRateResult {
  readonly utilizationRate: number; // 0.0 ~ 1.0 (이용률 U)
  readonly borrowRateBps: number; // 대출 이자율 (basis points, 100bps = 1%)
  readonly supplyRateBps: number; // 예금 이자율 (basis points)
  readonly reserveBufferBps: number; // 법정 지급준비율 (2000bps = 20%)
  readonly isKinkExceeded: boolean; // U > 0.80 초과 여부 (점프 페널티 발동 여부)
  readonly availableBorrowCapacity: bigint; // 추가 대출 가능 한도 (총 예금의 80% - 현재 총 대출)
  readonly statutoryReserveAmount: bigint; // 동결된 20% 법정 준비금
}

export const OPTIMAL_UTILIZATION = 0.80; // U_optimal = 80%
export const BASE_BORROW_RATE_BPS = 300; // 기본 대출 금리 3.00%
export const SLOPE_1_BPS = 500; // U <= 80% 구간 기울기 (+5.00%, 최대 8.00%)
export const SLOPE_2_BPS = 4000; // U > 80% 구간 급경사 점프 기울기 (+40.00%, 최대 48.00%)
export const STATUTORY_RESERVE_RATIO = 0.20; // 바젤 III 20% 법정 준비율
export const STATUTORY_RESERVE_BPS = 2000; // 2000bps

export function calculateKinkedInterestRate(
  totalDeposits: bigint | string | number,
  totalBorrows: bigint | string | number,
): KinkedRateResult {
  const deposits = BigInt(totalDeposits.toString());
  const borrows = BigInt(totalBorrows.toString());

  // 예금이 0이거나 음수이면 기본 금리 반환
  if (deposits <= 0n) {
    return {
      utilizationRate: 0,
      borrowRateBps: BASE_BORROW_RATE_BPS,
      supplyRateBps: 0,
      reserveBufferBps: STATUTORY_RESERVE_BPS,
      isKinkExceeded: false,
      availableBorrowCapacity: 0n,
      statutoryReserveAmount: 0n,
    };
  }

  // 바젤 III 20% 법정 준비금 계산
  const statutoryReserveAmount = (deposits * 20n) / 100n;
  // 최대 대출 가능 총액 (총 예금의 80%)
  const maxBorrowLimit = deposits - statutoryReserveAmount;
  const availableBorrowCapacity = borrows < maxBorrowLimit ? maxBorrowLimit - borrows : 0n;

  // 이용률 U 계산 (소수점 정밀도 4자리)
  const utilization = Math.min(1.0, Number((borrows * 10000n) / deposits) / 10000);
  const isKinkExceeded = utilization > OPTIMAL_UTILIZATION;

  let borrowRateBps: number;
  if (!isKinkExceeded) {
    // U <= 0.80: Borrow Rate = 3% + (U / 0.8) * 5%
    borrowRateBps = Math.round(BASE_BORROW_RATE_BPS + ((utilization / OPTIMAL_UTILIZATION) * SLOPE_1_BPS));
  } else {
    // U > 0.80: Borrow Rate = 8% + ((U - 0.8) / 0.2) * 40%
    const excessU = (utilization - OPTIMAL_UTILIZATION) / (1.0 - OPTIMAL_UTILIZATION);
    borrowRateBps = Math.round((BASE_BORROW_RATE_BPS + SLOPE_1_BPS) + (excessU * SLOPE_2_BPS));
  }

  // 예금 이자율 (Supply Rate = Borrow Rate * U * (1 - Reserve Ratio))
  const supplyRateBps = Math.round(borrowRateBps * utilization * (1 - STATUTORY_RESERVE_RATIO));

  return {
    utilizationRate: utilization,
    borrowRateBps,
    supplyRateBps,
    reserveBufferBps: STATUTORY_RESERVE_BPS,
    isKinkExceeded,
    availableBorrowCapacity,
    statutoryReserveAmount,
  };
}
