import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { TreasuryBondService } from './treasury-bond.service';
import type { TreasuryBondRepository } from './treasury-bond.repository';
import type { DiscordAlertService } from '../../discord/discord-alert.service';

describe('TreasuryBondService Unit Tests', () => {
  const mockRepo = {
    getOverview: vi.fn().mockResolvedValue({
      totalBondsActive: 3,
      totalFundedWld: '50000000',
      totalHoldersCount: 12,
      totalCouponsPaidWld: '240000',
      benchmark1YYield: '4.50%',
      benchmark3YYield: '5.20%',
      benchmark5YYield: '6.50%',
    }),
    listBonds: vi.fn().mockResolvedValue([
      {
        id: 'bond-1',
        symbol: 'KTB-01Y',
        name: '월덱 1년물 단기국채',
        maturity_hours: 24,
        annual_coupon_rate_bps: 450,
        hourly_coupon_rate_bps: 5,
        par_value_wld: '10000',
        total_issued_units: '5000',
        available_units: '4990',
        total_funded_wld: '100000',
        status: 'OPEN_SUBSCRIPTION',
      },
    ]),
    getBondById: vi.fn().mockResolvedValue({
      id: 'bond-1',
      symbol: 'KTB-01Y',
      name: '월덱 1년물 단기국채',
      annual_coupon_rate_bps: 450,
      hourly_coupon_rate_bps: 5,
    }),
    subscribeBond: vi.fn().mockResolvedValue({
      holdingId: 'holding-1',
      totalPriceWld: '50000',
      maturityAt: '2026-10-08T12:00:00Z',
    }),
    processHourlyCouponsAndMaturities: vi.fn().mockResolvedValue({
      couponsDistributedWld: '4500',
      maturitiesRedeemedWld: '50000',
      holdingsProcessed: 5,
      maturedCount: 1,
    }),
    updateBondStatus: vi.fn().mockResolvedValue(true),
    createRepoLoan: vi.fn().mockResolvedValue({
      loanId: 'repo-loan-1',
      loanAmountWld: '40000',
    }),
    repayRepoLoan: vi.fn().mockResolvedValue({
      repaidAmountWld: '40050',
    }),
    toggleAutoRollover: vi.fn().mockResolvedValue(true),
  } as unknown as TreasuryBondRepository;

  const mockDiscord = {
    sendAdminDirectMessage: vi.fn().mockResolvedValue(true),
  } as unknown as DiscordAlertService;

  const service = new TreasuryBondService(mockRepo, mockDiscord);

  it('국채 시장 총괄 개요 지표를 성공적으로 조회한다', async () => {
    const overview = await service.getOverview();
    expect(overview.totalBondsActive).toBe(3);
    expect(overview.benchmark1YYield).toBe('4.50%');
    expect(overview.totalFundedWld).toBe('50000000');
  });

  it('국채 청약은 원장 정산이 준비될 때까지 거부하고 관리자 알림을 보내지 않는다', async () => {
    await expect(service.subscribeBond('test-user-id', 'bond-1', 5)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(mockRepo.subscribeBond).not.toHaveBeenCalled();
    expect(mockDiscord.sendAdminDirectMessage).not.toHaveBeenCalled();
  });

  it('쿠폰 이자와 만기 원금 정산은 원장 없이 지급하지 않는다', async () => {
    await expect(service.processHourlyCouponsAndMaturities()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(mockRepo.processHourlyCouponsAndMaturities).not.toHaveBeenCalled();
    expect(mockDiscord.sendAdminDirectMessage).not.toHaveBeenCalled();
  });

  it('레포 대출 실행 및 상환 모두 원장 없이 실행하지 않는다', async () => {
    await expect(service.createRepoLoan('test-user-id', 'holding-1')).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(service.repayRepoLoan('test-user-id', 'repo-loan-1')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(mockRepo.createRepoLoan).not.toHaveBeenCalled();
    expect(mockRepo.repayRepoLoan).not.toHaveBeenCalled();
  });

  it('만기 시 자동 롤오버 재투자 설정을 정상적으로 토글한다', async () => {
    const toggleRes = await service.toggleAutoRollover('test-user-id', 'holding-1', true);
    expect(toggleRes).toBe(true);
  });
});
