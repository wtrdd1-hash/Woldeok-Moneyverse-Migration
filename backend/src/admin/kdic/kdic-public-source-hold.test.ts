import { describe, expect, it, vi } from 'vitest';
import { PublicKdicController } from './kdic.controller';
import type { KdicService } from './kdic.service';

describe('KDIC public coverage source truth', () => {
  it('never presents an unverified fund or institution as publicly insured', async () => {
    const service = { getFundOverview: vi.fn().mockResolvedValue({
      fund: { totalFundWld: 10000000, protectionLimitPerUser: 500000 },
      institutions: [], summary: { totalInsuredInstitutions: 2 },
    }) };
    const controller = new PublicKdicController(service as unknown as KdicService);
    await expect(controller.getPublicPortalData()).rejects.toMatchObject({
      status: 503, response: expect.objectContaining({ code: 'KDIC_COVERAGE_UNVERIFIED' }),
    });
    expect(service.getFundOverview).not.toHaveBeenCalled();
  });

  it('does not certify individual protection without an authoritative settlement record', async () => {
    const service = { getUserCoverage: vi.fn().mockResolvedValue({ protectedAmountWld: 500000, isFullyProtected: true }) };
    const controller = new PublicKdicController(service as unknown as KdicService);
    await expect(controller.getMyCoverage({ session: { user_id: '00000000-0000-4000-8000-000000000001' } } as never))
      .rejects.toMatchObject({ status: 503, response: expect.objectContaining({ code: 'KDIC_COVERAGE_UNVERIFIED' }) });
    expect(service.getUserCoverage).not.toHaveBeenCalled();
  });
});
