import { describe, expect, it } from 'vitest';
import { MintService } from '../mint/mint.service';
import { CentralBankService } from './central-bank.service';

describe('CentralBankService - 국가중앙은행 통화 신용 정책 및 인수 승인 단위 테스트', () => {
  it('조폐국 주조 배치를 2단계 견제 결재를 통해 공식 인수 및 승인해야 한다', async () => {
    const mintService = new MintService();
    const centralBankService = new CentralBankService(mintService);

    const batch = await mintService.createMintBatch(
      {
        amountWld: '50000000',
        denomination: '10000',
        mintReason: '중앙은행 공급 요청',
        productionCostWld: '20000',
      },
      'MINTER',
    );

    const result = await centralBankService.acceptMintBatch(
      batch.id,
      {
        acceptanceReason: '통화정책위원회 승인 번호 2026-1014-01',
        targetVaultAllocation: 'TREASURY_MAIN',
      },
      'CENTRAL_BANK_CHAIR',
    );

    expect(result.centralBankTxId.startsWith('CB-ACCEPT-')).toBe(true);
    expect(result.batch.status).toBe('ACCEPTED_BY_CENTRAL_BANK');
  });

  it('거시경제 통화량 지표(M0, M1, M2) 및 통화승수를 정상 산출해야 한다', async () => {
    const mintService = new MintService();
    const centralBankService = new CentralBankService(mintService);

    const aggregates = await centralBankService.getMonetaryAggregates();
    expect(aggregates.centralBankAuthority.includes('중앙은행')).toBe(true);
    expect(BigInt(aggregates.m0BaseMoneyWld) > BigInt(0)).toBe(true);
    expect(BigInt(aggregates.m1NarrowMoneyWld) > BigInt(aggregates.m0BaseMoneyWld)).toBe(true);
    expect(BigInt(aggregates.m2BroadMoneyWld) > BigInt(aggregates.m1NarrowMoneyWld)).toBe(true);
    expect(Number(aggregates.moneyMultiplier) >= 1.0).toBe(true);
  });

  it('기준금리(Base Rate) 결정 및 테일러 룰 추정치를 갱신해야 한다', async () => {
    const mintService = new MintService();
    const centralBankService = new CentralBankService(mintService);

    const updated = await centralBankService.updateBaseRate(
      {
        baseRatePercent: '3.50',
        rateDecisionRationale: '물가 2% 안착을 위한 통화 긴축',
        targetInflationPercent: '2.0',
      },
      'MONETARY_POLICY_COMMITTEE',
    );

    expect(updated.ratePercent).toBe('3.50');
    expect(updated.decidedBy).toBe('MONETARY_POLICY_COMMITTEE');
    expect(Number(updated.taylorRuleEstimatedRate) > 0).toBe(true);
  });

  it('지급준비율(Reserve Requirement Ratio)을 정상 갱신해야 한다', async () => {
    const mintService = new MintService();
    const centralBankService = new CentralBankService(mintService);

    const updated = await centralBankService.updateReserveRequirement(
      {
        reserveRatioPercent: '8.0',
        regulationRationale: '시중은행 유동성 안전판 확보',
      },
      'CENTRAL_BANK_SUPERVISOR',
    );

    expect(updated.ratioPercent).toBe('8.0');
  });
});
