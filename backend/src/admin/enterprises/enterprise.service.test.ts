import { describe, expect, it, vi } from 'vitest';
import { EnterpriseService } from './enterprise.service';
import type { EnterpriseRepository } from './enterprise.repository';

describe('EnterpriseService', () => {
  it('should harvest SOE dividends and return processed count', async () => {
    const mockRepo = {
      getStateHoldingOverview: vi.fn(),
      listStateEnterprises: vi.fn(),
      listPrivateEnterprises: vi.fn(),
      listRecentDividendLogs: vi.fn(),
      distributeSoeDividends: vi.fn().mockResolvedValue({
        total_dividends_collected: '108000',
        enterprises_processed: 3,
        treasury_balance_after: '25243090',
      }),
      updateSoeStatus: vi.fn(),
    } as unknown as EnterpriseRepository;

    const mockDiscordAlert = {
      sendAdminDirectMessage: vi.fn().mockResolvedValue({ success: true }),
    };

    const service = new EnterpriseService(mockRepo, mockDiscordAlert as any);
    const result = await service.harvestSoeDividends('admin-uuid');

    expect(result.total_dividends_collected).toBe('108000');
    expect(result.enterprises_processed).toBe(3);
    expect(mockDiscordAlert.sendAdminDirectMessage).toHaveBeenCalled();
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
