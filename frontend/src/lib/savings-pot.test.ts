// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  SAVINGS_PLANS,
  calculateDailyInterest,
  calculateExpectedMaturityYield,
  getStoredSavingsPots,
  saveSavingsPots,
  openSavingsPot,
  claimDailyInterestFromPot,
  type SavingsPotRecord,
} from './savings-pot';

describe('savings-pot logic & account isolation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('calculates daily compound interest and maturity yield correctly', () => {
    const daily = calculateDailyInterest(10000, 7.2);
    expect(daily).toBeGreaterThan(0);

    const yieldResult = calculateExpectedMaturityYield(10000, 7.2, 1.0, 30);
    expect(yieldResult.interest).toBeGreaterThan(0);
    expect(yieldResult.total).toBe(10000 + yieldResult.interest);
  });

  it('isolates savings pots by userId', () => {
    // Open pot for user-A
    const potA = openSavingsPot('7d_flex', 1000, 'user-A');
    expect(potA.principalWld).toBe(1000);

    // User A should have 1 pot
    const potsA = getStoredSavingsPots('user-A');
    expect(potsA.length).toBe(1);
    expect(potsA[0]?.id).toBe(potA.id);

    // User B should have 0 pots
    const potsB = getStoredSavingsPots('user-B');
    expect(potsB.length).toBe(0);

    // Guest should have 0 pots
    const potsGuest = getStoredSavingsPots();
    expect(potsGuest.length).toBe(0);
  });

  it('guards against claiming interest before 24 hours', () => {
    const pot = openSavingsPot('30d_growth', 5000, 'user-C');
    const claimRes = claimDailyInterestFromPot(pot.id, 'user-C');
    expect(claimRes.success).toBe(false);
    expect(claimRes.claimedAmount).toBe(0);
  });

  it('allows claiming interest after 24 hours have elapsed', () => {
    const pot = openSavingsPot('30d_growth', 10000, 'user-D');
    // Artificially age the lastClaimedAt by 2 days
    const pots = getStoredSavingsPots('user-D');
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const agedPots: SavingsPotRecord[] = [
      {
        ...pots[0]!,
        lastClaimedAt: twoDaysAgo,
      },
    ];
    saveSavingsPots(agedPots, 'user-D');

    const claimRes = claimDailyInterestFromPot(pot.id, 'user-D');
    expect(claimRes.success).toBe(true);
    expect(claimRes.claimedAmount).toBeGreaterThan(0);
    expect(claimRes.updatedPot?.claimedInterestWld).toBe(claimRes.claimedAmount);
  });
});
