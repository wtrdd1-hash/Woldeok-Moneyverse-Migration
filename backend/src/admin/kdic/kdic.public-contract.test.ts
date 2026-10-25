import { describe, expect, it, vi } from 'vitest';
import { PublicKdicController } from './kdic.controller';
import type { KdicService } from './kdic.service';

describe('KDIC public PostgreSQL-backed snapshot contract', () => {
  it('includes actual institution identifiers and balances, not synthetic browser fallback values', async () => {
    const service = { getFundOverview: vi.fn().mockResolvedValue({
      fund: { fundName: '월덕 가상기금', totalFundWld: 1500, protectionLimitPerUser: 500000,
        totalInsuredDepositsWld: 900, isEmergencyMode: false, updatedAt: '2026-10-26T00:00:00.000Z' },
      institutions: [{ id: 'bank-a', institutionName: '월덕 가상은행', institutionType: 'BANK',
        bisRatioPct: 12.5, soundnessGrade: 'GRADE_1', totalDepositsWld: 900,
        premiumRatePct: 0.08, status: 'HEALTHY' }],
      summary: { totalInsuredInstitutions: 1, totalDepositsWld: 900,
        averageBisRatioPct: 12.5, reserveCoverageRatioPct: 166.7 },
    }) };
    const controller = new PublicKdicController(service as unknown as KdicService);
    const response = await controller.getPublicPortalData();
    expect(response.data.institutions[0]).toEqual(expect.objectContaining({
      id: 'bank-a', totalDepositsWld: 900, premiumRatePct: 0.08,
    }));
    expect(service.getFundOverview).toHaveBeenCalledOnce();
  });
});
