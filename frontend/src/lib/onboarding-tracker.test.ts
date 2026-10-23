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

  it('lists seven guide destinations without invented WLD reward amounts', () => {
    expect(ONBOARDING_STEPS).toHaveLength(7);
    expect(ONBOARDING_STEPS.every((step) => !('rewardWld' in step))).toBe(true);
  });

  it('marks an action complete and avoids duplicate marking', () => {
    const res1 = markOnboardingActionComplete('spin_roulette');
    expect(res1.isNewlyCompleted).toBe(true);
    expect(res1.state.completed).toContain('spin_roulette');

    const res2 = markOnboardingActionComplete('spin_roulette');
    expect(res2.isNewlyCompleted).toBe(false);
  });

  it('does not create a wallet credit from a completed guide step', () => {
    markOnboardingActionComplete('spin_roulette');
    const result = claimOnboardingReward('spin_roulette');
    expect(result.rewardWld).toBe(0);
    expect(result.state.totalEarnedWld).toBe(0);
    expect(result.state.claimed).toEqual([]);
  });
});

describe('unverified onboarding rewards must fail closed', () => {
  it('never credits a wallet or marks a local step as a paid reward', () => {
    saveOnboardingState({ completed: ['spin_roulette'], claimed: [], totalEarnedWld: 0 });
    const result = claimOnboardingReward('spin_roulette');
    expect(result.rewardWld).toBe(0);
    expect(result.rewardXp).toBe(0);
    expect(result.state.claimed).toEqual([]);
    expect(result.state.totalEarnedWld).toBe(0);
  });

  it('does not trust historical local claimed WLD as actual wallet balance', () => {
    saveOnboardingState({ completed: ['spin_roulette'], claimed: ['spin_roulette'], totalEarnedWld: 10000 });
    const state = getOnboardingState();
    expect(state.claimed).toEqual([]);
    expect(state.totalEarnedWld).toBe(0);
    expect(state.completed).toContain('spin_roulette');
  });
});
