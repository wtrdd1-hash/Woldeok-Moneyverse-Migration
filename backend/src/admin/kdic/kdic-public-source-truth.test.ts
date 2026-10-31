import { describe, expect, it, vi } from 'vitest';
import { PublicKdicController } from './kdic.controller';
import type { KdicService } from './kdic.service';

describe('public KDIC coverage evidence gate', () => {
  it('refuses to publish unverified insurance reserves and insured institutions', async () => {
    const service = { getFundOverview: vi.fn() };
    const controller = new PublicKdicController(service as unknown as KdicService);
    await expect(controller.getPublicPortalData()).rejects.toMatchObject({
      status: 503,
      response: expect.objectContaining({ code: 'KDIC_COVERAGE_UNVERIFIED' }),
    });
    expect(service.getFundOverview).not.toHaveBeenCalled();
  });

  it('refuses a fictitious legal payout calculation before any member DB read', async () => {
    const service = { getUserCoverage: vi.fn() };
    const controller = new PublicKdicController(service as unknown as KdicService);
    await expect(controller.getMyCoverage({} as never)).rejects.toMatchObject({
      status: 503,
      response: expect.objectContaining({ code: 'KDIC_COVERAGE_UNVERIFIED' }),
    });
    expect(service.getUserCoverage).not.toHaveBeenCalled();
  });
});
