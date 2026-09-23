/**
 * KRX 7단계 표준 주식 호가 틱 사이즈 (Tick Size Tier) 엔진
 * 기준: docs/planning/deltas/v2026.09.23.406.ko.md Flaw G406-02
 *
 * 티어 구간:
 * - 1,000원 미만: 1원 단위
 * - 1,000원 ~ 5,000원: 5원 단위
 * - 5,000원 ~ 10,000원: 10원 단위
 * - 10,000원 ~ 50,000원: 50원 단위
 * - 50,000원 ~ 100,000원: 100원 단위
 * - 100,000원 ~ 500,000원: 500원 단위
 * - 500,000원 이상: 1,000원 단위
 */

export function getKrxTickSize(price: number): number {
  if (price < 1_000) return 1;
  if (price < 5_000) return 5;
  if (price < 10_000) return 10;
  if (price < 50_000) return 50;
  if (price < 100_000) return 100;
  if (price < 500_000) return 500;
  return 1_000;
}

/**
 * 주어진 가격을 해당 가격대의 KRX 틱 단위로 자동 반올림 스냅(Snap)
 */
export function snapToKrxTick(price: number): number {
  if (price <= 1) return 1;
  const tick = getKrxTickSize(price);
  const snapped = Math.round(price / tick) * tick;
  return Math.max(1, snapped);
}

/**
 * 현재 가격에서 n틱 위(양수) 또는 n틱 아래(음수) 가격을 계산
 */
export function stepKrxTick(basePrice: number, steps: number): number {
  let current = Math.max(1, snapToKrxTick(basePrice));
  const dir = steps >= 0 ? 1 : -1;
  const count = Math.abs(steps);

  for (let i = 0; i < count; i++) {
    // 하향 이동 시에는 현재 가격 직전 가격이 속한 구간의 틱 크기를 적용
    const tick = dir > 0 ? getKrxTickSize(current) : getKrxTickSize(Math.max(1, current - 1));
    const next = current + (dir * tick);
    if (next <= 1) {
      current = 1;
      break;
    }
    current = next;
  }

  return current;
}

/**
 * 5-Depth 또는 10-Depth에 대한 정확한 KRX 매도(Ask) 및 매수(Bid) 호가 가격 목록 생성
 */
export function generateKrxLadder(basePrice: number, depth: 5 | 10): {
  askPrices: number[];
  bidPrices: number[];
} {
  const snappedBase = snapToKrxTick(basePrice);
  const steps = depth === 5 ? [5, 4, 3, 2, 1] : [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const bidSteps = depth === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const askPrices = steps.map((s) => stepKrxTick(snappedBase, s));
  const bidPrices = bidSteps.map((s) => stepKrxTick(snappedBase, -s));

  return { askPrices, bidPrices };
}
