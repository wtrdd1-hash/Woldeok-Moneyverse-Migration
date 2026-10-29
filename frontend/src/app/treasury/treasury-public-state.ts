import type { TreasuryOverviewData, TreasuryLedgerItem, UserEligibilityStatus } from './treasury.types';

/** Fail closed: a treasury-only balance or receipt is not an independently reconciled public financial statement. */
export function buildUnverifiedTreasuryState(isLoggedIn: boolean): {
  overview: TreasuryOverviewData;
  recentLedger: TreasuryLedgerItem[];
  userEligibility: UserEligibilityStatus;
} {
  return {
    overview: {
      verified: false,
      totalBalanceWld: '—',
      safeReserveWld: '—',
      availableBalanceWld: '—',
      reserveRatioPercent: 30, // policy target only, not a confirmed balance
      totalCumulativeDisbursedWld: '—',
      totalBurnedWld: '—',
      beneficiaryCount: null,
      activeProgramsCount: 0,
      lastDisbursedAt: '',
    },
    recentLedger: [],
    userEligibility: {
      isLoggedIn,
      citizenDividendEligible: false,
      citizenDividendCooldownHours: 0,
      emergencyReliefEligible: false,
      userCashBalance: '—',
      bondBoosterEligible: false,
      activeGrantApplied: false,
    },
  };
}
