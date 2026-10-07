import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FxService } from './fx.service';
import { FxRepository } from './fx.repository';
import { DiscordAlertService } from '../../discord/discord-alert.service';

describe('FxService', () => {
  let service: FxService;
  let mockRepo: Partial<FxRepository>;
  let mockDiscord: Partial<DiscordAlertService>;

  beforeEach(() => {
    mockRepo = {
      getReserveStatus: vi.fn().mockResolvedValue({
        id: 'test-res-id',
        reserveName: '중앙은행 외환보유액',
        currency: 'USD',
        totalReservesUsd: 1000000,
        targetAnchorRate: 1350.0,
        currentRate: 1352.5,
        isHalted: false,
        totalInterventionsCount: 0,
        totalIntervenedUsd: 0,
        updatedAt: new Date().toISOString(),
      }),
      swapWldToUsd: vi.fn().mockResolvedValue({
        usdCredited: 73.78,
        feeWld: 200,
        appliedRate: 1352.5,
      }),
      swapUsdToWld: vi.fn().mockResolvedValue({
        wldCredited: 134980,
        feeWld: 270,
        appliedRate: 1352.5,
      }),
      executeSmoothingIntervention: vi.fn().mockResolvedValue({
        newRate: 1327.5,
        newReservesUsd: 950000,
      }),
      setHalt: vi.fn().mockResolvedValue(true),
    };

    mockDiscord = {
      sendAdminDirectMessage: vi.fn().mockResolvedValue({ success: true }),
    };

    service = new FxService(
      mockRepo as FxRepository,
      mockDiscord as DiscordAlertService
    );
  });

  it('외환보유액 마스터 원장 상태를 정상 조회한다', async () => {
    const res = await service.getReserveStatus();
    expect(res.totalReservesUsd).toBe(1000000);
    expect(res.currentRate).toBe(1352.5);
  });

  it('최소 금액(1,000 WLD) 미만 환전 시도시 예외를 던진다', async () => {
    await expect(service.swapWldToUsd('user-1', 500)).rejects.toThrow(
      '최소 환전 금액은 1,000 WLD 이상이어야 합니다.'
    );
  });

  it('정상 WLD ➡️ USD 환전을 수행한다', async () => {
    const res = await service.swapWldToUsd('user-1', 100000);
    expect(res.usdCredited).toBe(73.78);
    expect(res.feeWld).toBe(200);
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalled();
  });

  it('스무딩 오퍼레이션 시장개입을 집행하고 관리자 DM 알림을 발송한다', async () => {
    const res = await service.executeSmoothingIntervention('SELL_USD', 50000, 'ADMIN_TEST');
    expect(res.newRate).toBe(1327.5);
    expect(res.newReservesUsd).toBe(950000);
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('스무딩 오퍼레이션'),
        color: 0xf59e0b,
      })
    );
  });

  it('외환 킬스위치(Halt) 토글 시 디스코드 알림을 발송한다', async () => {
    const res = await service.setHalt(true, 'ADMIN_TEST');
    expect(res).toBe(true);
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalled();
  });
});
