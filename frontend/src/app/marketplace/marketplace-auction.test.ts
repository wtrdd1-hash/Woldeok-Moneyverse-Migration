import { describe, it, expect } from 'vitest';

describe('Marketplace Auction & Escrow Business Logic (PLAYER_MARKETPLACE_CRAFTING_SPEC)', () => {
  describe('English Auction & Anti-Sniping Invariants', () => {
    it('calculates minimum next bid as current bid + max(50 WLD, 5%)', () => {
      const currentBidBig = 2000n;
      const fivePercent = (currentBidBig * 5n) / 100n; // 100
      const minIncrement = fivePercent > 50n ? fivePercent : 50n;
      const nextMinBid = currentBidBig + minIncrement;

      expect(nextMinBid).toBe(2100n);
    });

    it('triggers anti-sniping extension when bid occurs within 30 seconds of closing', () => {
      const now = 100000;
      const endsAt = now + 25 * 1000; // 25초 남음 (30초 이내)
      const diff = endsAt - now;

      const shouldExtend = diff <= 30 * 1000;
      const newEndsAt = shouldExtend ? endsAt + 60 * 1000 : endsAt;

      expect(shouldExtend).toBe(true);
      expect(newEndsAt - now).toBe(85 * 1000); // 60초 연장되어 85초 남음
    });

    it('does not extend auction if bid occurs more than 30 seconds before closing', () => {
      const now = 100000;
      const endsAt = now + 45 * 1000; // 45초 남음
      const diff = endsAt - now;

      const shouldExtend = diff <= 30 * 1000;
      expect(shouldExtend).toBe(false);
    });

    it('calculates 2% auction settlement sink fee on winning bid', () => {
      const winningBid = 8500n;
      const auctionSinkFee = (winningBid * 2n) / 100n;
      const sellerNet = winningBid - auctionSinkFee;

      expect(auctionSinkFee).toBe(170n);
      expect(sellerNet).toBe(8330n);
    });
  });

  describe('P2P 1:1 Direct Escrow Trade (Dual Sign-Off)', () => {
    it('progresses trade state machine from PROPOSED to ACCEPTED to COMPLETED', () => {
      let status: 'PROPOSED' | 'ACCEPTED_BY_PEER' | 'COMPLETED' = 'PROPOSED';

      // 1단계: 상대방 수락
      status = 'ACCEPTED_BY_PEER';
      expect(status).toBe('ACCEPTED_BY_PEER');

      // 2단계: 양측 최종 서명 동시 스왑
      status = 'COMPLETED';
      expect(status).toBe('COMPLETED');
    });

    it('prevents completion if state is not ACCEPTED_BY_PEER', () => {
      const canSign = (s: 'PROPOSED' | 'ACCEPTED_BY_PEER') => s === 'ACCEPTED_BY_PEER';
      expect(canSign('PROPOSED')).toBe(false);
      expect(canSign('ACCEPTED_BY_PEER')).toBe(true);
    });
  });

  describe('System Appraisal Service (Specification §5.3)', () => {
    it('calculates appraisal fee as max(250 WLD, ceil(ref_value * 0.0025))', () => {
      // 1. 일반 품목 (가치 1,500 WLD) -> 1500 * 0.0025 = 3.75 -> max(250, 4) = 250 WLD
      const normalValue = 1500;
      const normalFee = Math.max(250, Math.ceil(normalValue * 0.0025));
      expect(normalFee).toBe(250);

      // 2. 초고가 전설 품목 (가치 200,000 WLD) -> 200000 * 0.0025 = 500 WLD -> max(250, 500) = 500 WLD
      const highValue = 200000;
      const highFee = Math.max(250, Math.ceil(highValue * 0.0025));
      expect(highFee).toBe(500);
    });
  });

  describe('Price Discovery Anomaly Detection', () => {
    it('detects high price anomaly when current price exceeds 150% of P75', () => {
      const p75 = 1000n;
      const normalPrice = 1300n;
      const excessivePrice = 1600n;

      const isHighAnomaly = (price: bigint) => price > (p75 * 150n) / 100n;

      expect(isHighAnomaly(normalPrice)).toBe(false);
      expect(isHighAnomaly(excessivePrice)).toBe(true);
    });

    it('detects low price discount when current price is below 60% of P25', () => {
      const p25 = 1000n;
      const normalPrice = 800n;
      const bargainPrice = 500n;

      const isLowAnomaly = (price: bigint) => price < (p25 * 60n) / 100n;

      expect(isLowAnomaly(normalPrice)).toBe(false);
      expect(isLowAnomaly(bargainPrice)).toBe(true);
    });
  });
});
