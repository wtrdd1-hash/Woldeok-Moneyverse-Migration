import { describe, expect, it } from 'vitest';
import { buildUnverifiedTreasuryState } from './treasury-public-state';

describe('v1415 public fiscal truth', () => {
  it('does not invent balances, ledger history, recipients or eligible claims', () => {
    const state = buildUnverifiedTreasuryState(true);
    expect(state.overview.verified).toBe(false);
    expect(state.overview.totalBalanceWld).toBe('—');
    expect(state.overview.totalCumulativeDisbursedWld).toBe('—');
    expect(state.overview.totalBurnedWld).toBe('—');
    expect(state.overview.beneficiaryCount).toBeNull();
    expect(state.overview.activeProgramsCount).toBe(0);
    expect(state.recentLedger).toEqual([]);
    expect(state.userEligibility.isLoggedIn).toBe(true);
    expect(state.userEligibility.citizenDividendEligible).toBe(false);
    expect(state.userEligibility.bondBoosterEligible).toBe(false);
    expect(state.userEligibility.emergencyReliefEligible).toBe(false);
  });
});
