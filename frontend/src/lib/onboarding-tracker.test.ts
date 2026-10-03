import { beforeEach, describe, expect, it } from 'vitest';
import {
  ONBOARDING_STEPS,
  getOnboardingState,
  markOnboardingActionComplete,
  claimOnboardingReward,
  saveOnboardingState,
} from './onboarding-tracker';

describe('onboarding-tracker engine', () => {
  beforeEach(() => {
    saveOnboardingState({ completed: [], claimed: [], totalEarnedWld: 0 });
  });

  it('contains 6 defined onboarding steps summing to 150,000 WLD', () => {
    expect(ONBOARDING_STEPS).toHaveLength(6);
    const totalWld = ONBOARDING_STEPS.reduce((acc, step) => acc + step.rewardWld, 0);
    expect(totalWld).toBe(150000);
  });

  it('marks an action complete and avoids duplicate marking', () => {
    const res1 = markOnboardingActionComplete('spin_roulette');
    expect(res1.isNewlyCompleted).toBe(true);
    expect(res1.state.completed).toContain('spin_roulette');

    const res2 = markOnboardingActionComplete('spin_roulette');
    expect(res2.isNewlyCompleted).toBe(false);
  });

  it('claims reward for completed step and adds WLD to totalEarnedWld', () => {
    markOnboardingActionComplete('spin_roulette');
    const claimRes = claimOnboardingReward('spin_roulette');

    expect(claimRes.rewardWld).toBe(10000);
    expect(claimRes.rewardXp).toBe(50);
    expect(claimRes.state.claimed).toContain('spin_roulette');
    expect(claimRes.state.totalEarnedWld).toBe(10000);

    // Repeated claim should return 0
    const repeatClaim = claimOnboardingReward('spin_roulette');
    expect(repeatClaim.rewardWld).toBe(0);
  });
});
