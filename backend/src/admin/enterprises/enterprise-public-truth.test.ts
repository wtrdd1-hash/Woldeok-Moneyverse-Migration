import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PublicEnterpriseController } from './enterprise.controller';
import type { EnterpriseService } from './enterprise.service';

const overview = { total_soe_assets_wld: '9007199254740993', hourly_soe_dividends_wld: '18' };
const soes = [{ code: 'SOE_TEST', name: 'Verified SOE', net_profit_hourly_wld: '60' }];

function controller(fail = false) {
  const service = {
    getStateHoldingOverview: vi.fn().mockImplementation(() => fail ? Promise.reject(new Error('private DB host')) : Promise.resolve(overview)),
    listStateEnterprises: vi.fn().mockResolvedValue(soes),
    listPrivateEnterprises: vi.fn().mockResolvedValue([]),
  } as unknown as EnterpriseService;
  return { subject: new PublicEnterpriseController(service), service };
}

describe('public SOE disclosure integrity', () => {
  it('returns only real repository values with explicit projection/not-settled provenance', async () => {
    const { subject, service } = controller();
    const response = await subject.getPublicEnterprises();
    expect(response.overview).toEqual(overview);
    expect(response.soes).toEqual(soes);
    expect(response.source).toBe('DATABASE_SNAPSHOT');
    expect(response.settlementStatus).toBe('NOT_VERIFIED');
    expect(service.getStateHoldingOverview).toHaveBeenCalledOnce();
  });

  it('fails closed with 503 and no leaked database detail on read failure', async () => {
    const { subject } = controller(true);
    await expect(subject.getPublicEnterprises()).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(subject.getPublicEnterprises()).rejects.not.toThrow('private DB host');
  });
});
