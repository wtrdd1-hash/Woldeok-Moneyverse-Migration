import { describe, expect, it } from 'vitest';
import { PublicKdicController } from './kdic.controller';
import type { KdicService } from './kdic.service';

const evidence = {
  fund: { id: 'KDIC', fundName: 'Kdic', totalFundWld: 0,
    protectionLimitPerUser: 500000, totalInsuredDepositsWld: 20000,
    cumulativePremiumsCollectedWld: 0, cumulativePayoutsWld: 0,
    isEmergencyMode: false, updatedAt: '2026-11-04T00:00:00Z' },
  institutions: [ { id: 'bank-a', institutionName: 'Example', institutionType: 'BANK',
    bisRatioPct: 14.5, soundnessGrade: 'GRADE_1', totalDepositsWld: 20000,
    premiumRatePct: 0.08, status: 'HEALTHY', updatedAt: '2026-11-04T00:00:00Z' } ],
  summary: { totalInsuredInstitutions: 1, totalDepositsWld: 20000,
    averageBisRatioPct: 14.5, reserveCoverageRatioPct: 0 },
  recentPremiums: [], recentPayouts: [],
};

describe('v1742 KDIC public API contract', () => {
  it('returns actual zero fund and all source-backed institution fields frontend renders', async () => {
    const controller = new PublicKdicController({ getFundOverview: async () => evidence } as unknown as KdicService);
    const output = await controller.getPublicPortalData();
    expect(output.success).toBe(true);
    expect(output.data.fund.totalFundWld).toBe(0);
    expect(output.data.institutions).toEqual([{ id: 'bank-a', institutionName: 'Example',
      institutionType: 'BANK', bisRatioPct: 14.5, soundnessGrade: 'GRADE_1',
      totalDepositsWld: 20000, premiumRatePct: 0.08, status: 'HEALTHY' }]);
    expect(output.data.summary.totalDepositsWld).toBe(20000);
    expect('recentPayouts' in output.data).toBe(false);
  });
});
