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

  it('우방국 통화스왑 긴급 자금을 인출하고 관리자 DM 알림을 발송한다', async () => {
    mockRepo.drawdownCurrencySwap = vi.fn().mockResolvedValue({
      agreement: {
        id: 'SWAP_FED_BOK',
        counterparty: '미국 연방준비제도 (US Federal Reserve)',
        totalFacilityUsd: 60000000000,
        drawnAmountUsd: 500000000,
        availableFacilityUsd: 59500000000,
        status: 'DRAWN',
        interestRatePct: 5.25,
      },
      newReservesUsd: 1500000,
    });

    const res = await service.drawdownCurrencySwap('SWAP_FED_BOK', 500000000, 'ADMIN_TEST');
    expect(res.agreement.drawnAmountUsd).toBe(500000000);
    expect(res.newReservesUsd).toBe(1500000);
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining('통화스왑 긴급 자금 인출'),
        color: 0xef4444,
      })
    );
  });

  it('CIP(Covered Interest Parity) 공식에 따라 1M/3M/6M 이론 선물환율을 산출한다', async () => {
    mockRepo.getLatestRate = vi.fn().mockResolvedValue(1350.0);
    const result = await service.getForwardRates();

    expect(result.spotRate).toBe(1350.0);
    expect(result.rates['1M'].days).toBe(30);
    expect(result.rates['3M'].days).toBe(90);
    expect(result.rates['6M'].days).toBe(180);
    // WLD 금리(3.5%) < USD 금리(5.25%)이므로 선물환율은 현물환율보다 디스카운트(하락)되어야 함
    expect(result.rates['1M'].forwardRate).toBeLessThan(1350.0);
    expect(result.rates['3M'].forwardRate).toBeLessThan(result.rates['1M'].forwardRate);
    expect(result.rates['6M'].forwardRate).toBeLessThan(result.rates['3M'].forwardRate);
  });

  it('선물환 환헤지 계약을 체결하고 증거금을 기록한다', async () => {
    mockRepo.getLatestRate = vi.fn().mockResolvedValue(1350.0);
    mockRepo.createForwardContract = vi.fn().mockResolvedValue({
      id: 'contract-uuid',
      userId: 'user-1',
      position: 'BUY_USD',
      tenor: '3M',
      contractAmountUsd: 2000,
      contractRate: 1344.15,
      spotRateAtContract: 1350.0,
      marginWld: 268830,
      maturityDate: new Date().toISOString(),
      status: 'ACTIVE',
    });

    const contract = await service.createForwardContract('user-1', 'BUY_USD', '3M', 2000);
    expect(contract.position).toBe('BUY_USD');
    expect(contract.tenor).toBe('3M');
    expect(contract.marginWld).toBe(268830);
    expect(mockDiscord.sendAdminDirectMessage).toHaveBeenCalled();
  });

  it('EWS 외환위기 조기경보 지표를 정확히 산출한다', async () => {
    mockRepo.getLatestRate = vi.fn().mockResolvedValue(1430.0); // 급등 상황
    mockRepo.getEarlyWarningStatus = vi.fn().mockReturnValue({
      fsiScore: 90,
      stage: 'EMERGENCY',
      triggerReason: '심각 위기: 환율 괴리율 극대화',
      currentSpotRate: 1430.0,
    });

    const ews = await service.getEarlyWarningStatus();
    expect(ews.stage).toBe('EMERGENCY');
    expect(ews.fsiScore).toBe(90);
  });
});
