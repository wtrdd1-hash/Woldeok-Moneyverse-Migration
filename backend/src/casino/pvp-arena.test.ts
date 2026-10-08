import { describe, expect, it } from 'vitest';

describe('1:1 라이브 승부존 및 심야 암시장 핵심 금융 원장 규칙 검증', () => {
  describe('PVP 승부존 판돈 및 3% 국고 수수료 정산 엔진', () => {
    const calculatePvpSettlement = (stake: number, feeRate = 0.03) => {
      if (stake < 1000 || stake > 50000000) {
        throw new Error('판돈 한도 초과 (1,000 ~ 50,000,000 WLD)');
      }
      const totalPot = stake * 2;
      const treasuryFee = Math.round(totalPot * feeRate);
      const winnerPayout = totalPot - treasuryFee;
      const winnerNetGain = winnerPayout - stake;
      return { totalPot, treasuryFee, winnerPayout, winnerNetGain };
    };

    it('10,000 WLD 결투 시 3% 수수료를 제하고 승자에게 정확히 97%가 지급되어야 한다', () => {
      const result = calculatePvpSettlement(10000);
      expect(result.totalPot).toBe(20000);
      expect(result.treasuryFee).toBe(600); // 20,000 * 0.03
      expect(result.winnerPayout).toBe(19400); // 20,000 - 600
      expect(result.winnerNetGain).toBe(9400); // 19,400 - 10,000
      expect(result.winnerPayout + result.treasuryFee).toBe(result.totalPot);
    });

    it('100만 WLD 하이롤러 대결 시 6만 WLD가 국고 금고로 귀속되어야 한다', () => {
      const result = calculatePvpSettlement(1000000);
      expect(result.totalPot).toBe(2000000);
      expect(result.treasuryFee).toBe(60000);
      expect(result.winnerPayout).toBe(1940000);
      expect(result.winnerNetGain).toBe(940000);
    });

    it('최소 한도(1,000 WLD) 미만 및 최대 한도(5,000만 WLD) 초과 시 거절되어야 한다', () => {
      expect(() => calculatePvpSettlement(500)).toThrow('판돈 한도 초과');
      expect(() => calculatePvpSettlement(60000000)).toThrow('판돈 한도 초과');
    });
  });

  describe('심야 비밀 암시장 호가 증분 및 안티 스나이핑 엔진', () => {
    const calculateNextMinimumBid = (currentBid: number) => {
      const minIncrement = Math.max(10000, Math.round(currentBid * 0.05));
      return currentBid + minIncrement;
    };

    const evaluateAntiSniping = (nowMs: number, endsAtMs: number) => {
      const remainingMs = endsAtMs - nowMs;
      if (remainingMs < 30000) {
        return { extended: true, newEndsAtMs: nowMs + 30000 };
      }
      return { extended: false, newEndsAtMs: endsAtMs };
    };

    it('현재 최고가가 50만 WLD일 때 최소 5% 증분(25,000 WLD)이 가산되어야 한다', () => {
      const nextMin = calculateNextMinimumBid(500000);
      expect(nextMin).toBe(525000);
    });

    it('현재 최고가가 10만 WLD일 때 최소 단위 1만 WLD가 적용되어야 한다', () => {
      const nextMin = calculateNextMinimumBid(100000);
      expect(nextMin).toBe(110000);
    });

    it('마감 15초 전에 입찰이 들어오면 안티 스나이핑 가드가 발동하여 30초로 연장되어야 한다', () => {
      const now = Date.now();
      const endsAt = now + 15000; // 15초 남음
      const result = evaluateAntiSniping(now, endsAt);
      expect(result.extended).toBe(true);
      expect(result.newEndsAtMs - now).toBe(30000);
    });

    it('마감 5분 전 입찰 시에는 연장되지 않고 기존 종료 시간이 유지되어야 한다', () => {
      const now = Date.now();
      const endsAt = now + 300000; // 5분 남음
      const result = evaluateAntiSniping(now, endsAt);
      expect(result.extended).toBe(false);
      expect(result.newEndsAtMs).toBe(endsAt);
    });
  });
});
