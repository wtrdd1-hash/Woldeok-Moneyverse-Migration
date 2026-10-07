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

  it('국채 청약 실행 시 국고 자금 조달 및 관리자 디스코드 알림을 전송한다', async () => {
    const res = await service.subscribeBond('test-user-id', 'bond-1', 5);
    expect(res.holdingId).toBe('holding-1');
    expect(res.totalPriceWld).toBe('50000');
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('국채 청약'),
      }),
      '886478189520637992',
    );
  });

  it('시간당 쿠폰 이자 정산 시 이자 지급 집행 및 관리자 알림을 전송한다', async () => {
    const res = await service.processHourlyCouponsAndMaturities();
    expect(res.couponsDistributedWld).toBe('4500');
    expect(res.maturedCount).toBe(1);
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('국채 정산'),
      }),
      '886478189520637992',
    );
  });
});
