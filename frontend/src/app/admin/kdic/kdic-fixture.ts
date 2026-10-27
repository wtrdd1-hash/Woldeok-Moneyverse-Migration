export const fixture = {
  success: true,
  data: {
    fund: { id: 'KDIC_MAIN_FUND', fundName: 'Test fund', totalFundWld: 10000000,
      protectionLimitPerUser: 500000, totalInsuredDepositsWld: 25000000,
      cumulativePremiumsCollectedWld: 100, cumulativePayoutsWld: 10,
      isEmergencyMode: false, updatedAt: '2026-10-28T00:00:00Z' },
    institutions: [{ id: 'BANK_COMMERCIAL', institutionName: 'Test bank', institutionType: 'BANK',
      bisRatioPct: 14.8, soundnessGrade: 'GRADE_1', totalDepositsWld: 25000000,
      premiumRatePct: 0.08, status: 'HEALTHY', updatedAt: '2026-10-28T00:00:00Z' }],
    summary: { totalInsuredInstitutions: 1, totalDepositsWld: 25000000,
      averageBisRatioPct: 14.8, reserveCoverageRatioPct: 40 },
    recentPremiums: [], recentPayouts: [],
  },
};
