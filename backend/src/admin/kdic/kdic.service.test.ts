import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KdicService } from './kdic.service';
import { KdicRepository } from './kdic.repository';

describe('KdicService', () => {
  let service: KdicService;
  let mockRepo: Partial<KdicRepository>;

  beforeEach(() => {
    mockRepo = {
      getFundStatus: vi.fn().mockResolvedValue({
        id: 'KDIC_MAIN_FUND',
        fundName: '정부 예금보험공사 예금보험기금',
        totalFundWld: 10000000,
        protectionLimitPerUser: 500000,
        totalInsuredDepositsWld: 25000000,
        cumulativePremiumsCollectedWld: 0,
        cumulativePayoutsWld: 0,
        isEmergencyMode: false,
        updatedAt: new Date().toISOString(),
      }),
      getInsuredInstitutions: vi.fn().mockResolvedValue([
        {
          id: 'BANK_COMMERCIAL',
          institutionName: '머니버스 상업은행',
          institutionType: 'BANK',
          bisRatioPct: 14.8,
          soundnessGrade: 'GRADE_1',
          totalDepositsWld: 20000000,
          premiumRatePct: 0.08,
          status: 'HEALTHY',
          updatedAt: new Date().toISOString(),
        },
      ]),
      getUserInsuredCoverage: vi.fn().mockImplementation((userId: string) => {
        return Promise.resolve({
          userId,
          totalDepositWld: 600000,
          protectionLimitWld: 500000,
          protectedAmountWld: 500000,
          unprotectedAmountWld: 100000,
          coverageRatioPct: 83.3,
          isFullyProtected: false,
        });
      }),
      assessQuarterlyPremiums: vi.fn().mockResolvedValue({
        totalCollectedWld: 5000,
        recordsCount: 1,
      }),
      injectEmergencyLiquidity: vi.fn().mockResolvedValue({
        newBisRatioPct: 15.5,
        newFundWld: 9000000,
      }),
      executeDepositPayout: vi.fn().mockResolvedValue({
        payoutAmountWld: 500000,
        newFundWld: 9500000,
      }),
      listRecentPremiums: vi.fn().mockResolvedValue([]),
      listRecentPayouts: vi.fn().mockResolvedValue([]),
    };

    service = new KdicService(mockRepo as KdicRepository);
  });

  it('예금보험기금 및 금융기관 건전성 개요를 정상 조회한다', async () => {
    const res = await service.getFundOverview();
    expect(res.fund.totalFundWld).toBe(10000000);
    expect(res.institutions.length).toBe(1);
    expect(res.summary.averageBisRatioPct).toBe(14.8);
  });

  it('유저 예금자보호 한도(50만 WLD) 및 보호 금액을 정확히 산출한다', async () => {
    const coverage = await service.getUserCoverage('user-1');
    expect(coverage.protectionLimitWld).toBe(500000);
    expect(coverage.protectedAmountWld).toBe(500000);
    expect(coverage.unprotectedAmountWld).toBe(100000);
    expect(coverage.isFullyProtected).toBe(false);
  });

  it('금융 집행 3종을 거부하며 조회만 허용한다', async () => {
    for (const operation of [
      service.assessQuarterlyPremiums('ADMIN_TEST'),
      service.injectEmergencyLiquidity('BANK_COMMERCIAL', 1000000, 'ADMIN_TEST'),
      service.executeDepositPayout('BANK_COMMERCIAL', 'user-victim', 'ADMIN_TEST'),
    ]) {
      await expect(operation).rejects.toMatchObject({
        status: 503,
        response: expect.objectContaining({ code: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED' }),
      });
    }
    expect(mockRepo.assessQuarterlyPremiums).not.toHaveBeenCalled();
    expect(mockRepo.injectEmergencyLiquidity).not.toHaveBeenCalled();
    expect(mockRepo.executeDepositPayout).not.toHaveBeenCalled();
  });

});
