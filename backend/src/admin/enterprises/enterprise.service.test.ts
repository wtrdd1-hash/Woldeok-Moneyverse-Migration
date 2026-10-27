import { describe, expect, it, vi } from 'vitest';
import { EnterpriseService } from './enterprise.service';
import type { EnterpriseRepository } from './enterprise.repository';

describe('EnterpriseService', () => {
  it('rejects unjournaled SOE dividend harvest before repository or Discord effects', async () => {
    const repo = { distributeSoeDividends: vi.fn() } as unknown as EnterpriseRepository;
    const service = new EnterpriseService(repo);

    await expect(service.harvestSoeDividends('admin-uuid')).rejects.toMatchObject({
      status: 503,
      response: expect.objectContaining({ code: 'SOE_DIVIDEND_LEDGER_UNAVAILABLE' }),
    });
    expect(repo.distributeSoeDividends).not.toHaveBeenCalled();
  });

  it('should validate status on updateSoeStatus', async () => {
    const mockRepo = {
      updateSoeStatus: vi.fn().mockResolvedValue(true),
    } as unknown as EnterpriseRepository;

    const service = new EnterpriseService(mockRepo);
    await expect(service.updateSoeStatus('SOE_POWER', 'INVALID_STATUS')).rejects.toThrow(
      '유효하지 않은 공기업 운영 상태입니다',
    );

    const validResult = await service.updateSoeStatus('SOE_POWER', 'ACTIVE', 3500);
    expect(validResult).toBe(true);
  });
});
