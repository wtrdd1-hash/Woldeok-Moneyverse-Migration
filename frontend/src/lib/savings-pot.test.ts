// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  SAVINGS_PLANS,
  calculateDailyInterest,
  calculateExpectedMaturityYield,
  openSavingsPot,
  getStoredSavingsPots,
  claimDailyInterestFromPot,
} from './savings-pot';

describe('Central Bank Smart Savings Pot Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defines 3 distinct fixed-term savings plans with valid rates and periods', () => {
    expect(SAVINGS_PLANS.length).toBe(3);

    const plan7d = SAVINGS_PLANS.find((p) => p.id === '7d_flex');
    expect(plan7d?.periodDays).toBe(7);
    expect(plan7d?.baseAprPct).toBe(4.5);

    const plan30d = SAVINGS_PLANS.find((p) => p.id === '30d_growth');
    expect(plan30d?.periodDays).toBe(30);
    expect(plan30d?.baseAprPct).toBe(7.2);
    expect(plan30d?.bonusMaturityPct).toBe(1.0);

    const plan90d = SAVINGS_PLANS.find((p) => p.id === '90d_wealth');
    expect(plan90d?.periodDays).toBe(90);
    expect(plan90d?.baseAprPct).toBe(12.0);
  });

  it('calculates daily compound interest correctly', () => {
    // 10,000 WLD @ 7.2% APR -> daily ~ 1.97 WLD
    const daily = calculateDailyInterest(10000, 7.2);
    expect(daily).toBeCloseTo(1.97, 1);
  });

  it('calculates expected maturity yield with bonus interest', () => {
    // 10,000 WLD, 7.2% APR, 1.0% bonus, 30 days
    const yieldResult = calculateExpectedMaturityYield(10000, 7.2, 1.0, 30);
    expect(yieldResult.interest).toBeGreaterThan(50);
    expect(yieldResult.total).toBe(10000 + yieldResult.interest);
  });

  it('opens a new savings pot and records it to storage', () => {
    const pot = openSavingsPot('30d_growth', 5000);
    expect(pot.id).toBeDefined();
    expect(pot.principalWld).toBe(5000);
    expect(pot.planId).toBe('30d_growth');

    const pots = getStoredSavingsPots();
    expect(pots.length).toBe(1);
    expect(pots[0]?.id).toBe(pot.id);
  });

  it('claims daily interest and accumulates claimed balance', () => {
    const pot = openSavingsPot('7d_flex', 10000);
    const claimRes = claimDailyInterestFromPot(pot.id);
    expect(claimRes.success).toBe(true);
    expect(claimRes.claimedAmount).toBeGreaterThan(0);

    const stored = getStoredSavingsPots();
    expect(stored[0]?.claimedInterestWld).toBe(claimRes.claimedAmount);
  });
});
