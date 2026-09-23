import { describe, it, expect } from 'vitest';
import {
  getKrxTickSize,
  snapToKrxTick,
  stepKrxTick,
  generateKrxLadder,
} from './tick-size';

describe('KRX 7단계 호가 틱 사이즈 엔진 (tick-size)', () => {
  it('가격대별 7단계 정규 틱 크기를 정확하게 반환해야 한다', () => {
    // 1. 1,000원 미만 -> 1원 단위
    expect(getKrxTickSize(50)).toBe(1);
    expect(getKrxTickSize(999)).toBe(1);

    // 2. 1,000원 ~ 5,000원 -> 5원 단위
    expect(getKrxTickSize(1_000)).toBe(5);
    expect(getKrxTickSize(4_999)).toBe(5);

    // 3. 5,000원 ~ 10,000원 -> 10원 단위
    expect(getKrxTickSize(5_000)).toBe(10);
    expect(getKrxTickSize(9_999)).toBe(10);

    // 4. 10,000원 ~ 50,000원 -> 50원 단위
    expect(getKrxTickSize(10_000)).toBe(50);
    expect(getKrxTickSize(49_999)).toBe(50);

    // 5. 50,000원 ~ 100,000원 -> 100원 단위
    expect(getKrxTickSize(50_000)).toBe(100);
    expect(getKrxTickSize(99_999)).toBe(100);

    // 6. 100,000원 ~ 500,000원 -> 500원 단위
    expect(getKrxTickSize(100_000)).toBe(500);
    expect(getKrxTickSize(499_999)).toBe(500);

    // 7. 500,000원 이상 -> 1,000원 단위
    expect(getKrxTickSize(500_000)).toBe(1_000);
    expect(getKrxTickSize(8_991_585)).toBe(1_000);
  });

  it('임의의 가격을 해당 가격대의 틱 단위로 정확하게 반올림 스냅해야 한다', () => {
    expect(snapToKrxTick(53)).toBe(53); // 1원 단위
    expect(snapToKrxTick(1_002)).toBe(1_000); // 5원 단위 반내림
    expect(snapToKrxTick(1_004)).toBe(1_005); // 5원 단위 반올림
    expect(snapToKrxTick(25_024)).toBe(25_000); // 50원 단위 반내림
    expect(snapToKrxTick(25_035)).toBe(25_050); // 50원 단위 반올림
    expect(snapToKrxTick(120_150)).toBe(120_000); // 500원 단위 반내림
    expect(snapToKrxTick(120_350)).toBe(120_500); // 500원 단위 반올림
    expect(snapToKrxTick(1_500_499)).toBe(1_500_000); // 1000원 단위
    expect(snapToKrxTick(1_500_501)).toBe(1_501_000); // 1000원 단위
    expect(snapToKrxTick(0)).toBe(1); // 최저가 1원 방어
  });

  it('단계별 틱 이동(stepKrxTick) 시 가격대 경계를 넘어가도 자연스럽게 틱 크기가 전환되어야 한다', () => {
    // 998원에서 1틱 위 -> 999원 (1원 단위)
    expect(stepKrxTick(998, 1)).toBe(999);
    // 999원에서 1틱 위 -> 1,000원
    expect(stepKrxTick(999, 1)).toBe(1_000);
    // 1,000원에서 1틱 위 -> 1,005원 (5원 단위로 전환!)
    expect(stepKrxTick(1_000, 1)).toBe(1_005);
    // 1,005원에서 2틱 아래 -> 999원 (1,000원 거쳐 999원)
    expect(stepKrxTick(1_005, -2)).toBe(999);
  });

  it('호가 사다리(generateKrxLadder)가 5-Depth 및 10-Depth에 맞춰 올바른 정렬과 가격을 생성해야 한다', () => {
    const ladder5 = generateKrxLadder(10_000, 5); // 10,000원은 50원 틱
    expect(ladder5.askPrices).toHaveLength(5);
    expect(ladder5.bidPrices).toHaveLength(5);

    // Asks는 내림차순(가장 높은 매도호가가 첫 번째, 최우선 매도호가가 마지막)
    expect(ladder5.askPrices[4]).toBe(10_050); // +1틱
    expect(ladder5.askPrices[0]).toBe(10_250); // +5틱

    // Bids는 최우선 매수호가가 첫 번째(+1틱 아래: 10,000원에서 50원 틱인 9,950원), 이후 10원 틱 적용
    expect(ladder5.bidPrices[0]).toBe(9_950);
    expect(ladder5.bidPrices[4]).toBe(9_910);
  });
});
