import { describe, expect, it, vi } from 'vitest';
import { EnterpriseService } from './enterprise.service';
import type { EnterpriseRepository } from './enterprise.repository';

describe('EnterpriseService', () => {
  it('delegates canonical SOE dividend harvest to repository', async () => {
    const mockResult = {
      total_dividends_collected: '108000',
      enterprises_processed: 3,
      treasury_balance_after: '191163911',
      ledger_transaction_id: 'tx-uuid-1234',
    };
    const repo = {
      distributeSoeDividends: vi.fn().mockResolvedValue(mockResult),
    } as unknown as EnterpriseRepository;
    const service = new EnterpriseService(repo);

    const result = await service.harvestSoeDividends('admin-uuid-1234');

    expect(repo.distributeSoeDividends).toHaveBeenCalledWith('admin-uuid-1234');
    expect(result).toEqual(mockResult);
  });

  it('should validate status on updateSoeStatus', async () => {
    const mockRepo = {
      updateSoeStatus: vi.fn().mockResolvedValue(true),
    } as unknown as EnterpriseRepository;

    const service = new EnterpriseService(mockRepo);
    await expect(service.updateSoeStatus('SOE_POWER', 'INVALID_STATUS')).rejects.toThrow(
      '유효하지 않은 공기업 운영 상태입니다',
    );

    const actor = '11111111-1111-4111-8111-111111111111';
    const key = '22222222-2222-4222-8222-222222222222';
    const validResult = await service.updateSoeStatus('SOE_POWER', 'ACTIVE', 3500,
      actor, 'Approver governance review', key);
    expect(validResult).toBe(true);
    expect(mockRepo.updateSoeStatus).toHaveBeenCalledWith('SOE_POWER', 'ACTIVE', 3500,
      actor, 'Approver governance review', key);
  });
});
