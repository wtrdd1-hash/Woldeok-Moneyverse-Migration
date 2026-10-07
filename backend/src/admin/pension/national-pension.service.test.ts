import { describe, expect, it, vi } from 'vitest';
import { NationalPensionRepository } from './national-pension.repository';
import { NationalPensionService } from './national-pension.service';

describe('NationalPensionService', () => {
  it('should get overview from repository', async () => {
    const mockRepo = {
      getOverview: vi.fn().mockResolvedValue({
        totalAumWld: '5000000',
        totalSubscribersCount: 120,
        totalRetiredReceiversCount: 15,
        totalPensionPaidWld: '350000',
        benchmarkAnnualPayoutRate: '8.0%',
        vaultMainBalanceWld: '25180000',
      }),
    } as unknown as NationalPensionRepository;

    const service = new NationalPensionService(mockRepo);
    const overview = await service.getOverview();

    expect(overview.totalAumWld).toBe('5000000');
    expect(overview.totalSubscribersCount).toBe(120);
    expect(mockRepo.getOverview).toHaveBeenCalled();
  });

  it('should process pension contribution correctly', async () => {
    const mockRepo = {
      contribute: vi.fn().mockResolvedValue({
        account: {
          id: 'acc-1',
          user_id: 'user-1',
          tier: 'TIER_1_YOUTH',
          accumulated_contribution_wld: '10000',
        },
        contributedAmountWld: 10000,
        newVaultBalanceWld: '25190000',
      }),
    } as unknown as NationalPensionRepository;

    const service = new NationalPensionService(mockRepo);
    const result = await service.contribute('user-1', 10000);

    expect(result.contributedAmountWld).toBe(10000);
    expect(result.account.accumulated_contribution_wld).toBe('10000');
    expect(mockRepo.contribute).toHaveBeenCalledWith('user-1', 10000, undefined);
  });

  it('should toggle retirement mode', async () => {
    const mockRepo = {
      toggleRetirement: vi.fn().mockResolvedValue({
        id: 'acc-1',
        user_id: 'user-1',
        status: 'RETIRED_RECEIVING',
      }),
    } as unknown as NationalPensionRepository;

    const service = new NationalPensionService(mockRepo);
    const result = await service.toggleRetirement('user-1');

    expect(result.status).toBe('RETIRED_RECEIVING');
    expect(mockRepo.toggleRetirement).toHaveBeenCalledWith('user-1');
  });

  it('should process hourly pension payouts', async () => {
    const mockRepo = {
      distributeHourlyPensionPayouts: vi.fn().mockResolvedValue({
        totalPayoutAmount: 4500,
        pensionersCount: 6,
      }),
    } as unknown as NationalPensionRepository;

    const service = new NationalPensionService(mockRepo);
    const result = await service.distributeHourlyPensionPayouts();

    expect(result.totalPayoutAmount).toBe(4500);
    expect(result.pensionersCount).toBe(6);
    expect(mockRepo.distributeHourlyPensionPayouts).toHaveBeenCalled();
  });

  it('should liquidate pension account', async () => {
    const mockRepo = {
      liquidate: vi.fn().mockResolvedValue({
        account: { id: 'acc-1', status: 'LIQUIDATED' },
        refundAmountWld: 95000,
        welfareContributionWld: 5000,
      }),
    } as unknown as NationalPensionRepository;

    const service = new NationalPensionService(mockRepo);
    const result = await service.liquidate('user-1');

    expect(result.refundAmountWld).toBe(95000);
    expect(result.welfareContributionWld).toBe(5000);
    expect(mockRepo.liquidate).toHaveBeenCalledWith('user-1');
  });
});
