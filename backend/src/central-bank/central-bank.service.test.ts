import { describe, expect, it } from 'vitest';
import { MintService } from '../mint/mint.service';
import { CentralBankService } from './central-bank.service';

describe('CentralBankService - 국가중앙은행 통화 신용 정책 및 인수 승인 단위 테스트', () => {
  it('rejects mint acceptance without verified ledger settlement', async () => {
    const bank = new CentralBankService(new MintService());
    await expect(bank.acceptMintBatch('fake-batch', {
      acceptanceReason: 'test', targetVaultAllocation: 'TREASURY_MAIN',
    }, 'actor')).rejects.toMatchObject({
      status: 503, response: { code: 'MINT_LEDGER_EVIDENCE_UNAVAILABLE' },
    });
  });

  it('does not present synthetic M0/M1/M2 supply as authoritative', async () => {
    const bank = new CentralBankService(new MintService());
    await expect(bank.getMonetaryAggregates()).rejects.toMatchObject({
      status: 503, response: { code: 'MINT_LEDGER_EVIDENCE_UNAVAILABLE' },
    });
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

  it('기준금리 변동 시 시중 상업은행 예대금리(대출/적금)가 Kinked 모형에 연동되어 자동 재산출되어야 한다', async () => {
    const mintService = new MintService();
    const centralBankService = new CentralBankService(mintService);

    // 기준금리를 4.00%로 인상
    await centralBankService.updateBaseRate(
      {
        baseRatePercent: '4.00',
        rateDecisionRationale: '인플레이션 억제',
        targetInflationPercent: '2.0',
      },
      'MPC',
    );

    const rates = centralBankService.getCommercialBankRates();
    expect(rates.centralBankBaseRatePercent).toBe('4.00');
    // 대출금리는 기준금리 4.00% 기반으로 가산되어 4.00% 이상이어야 함
    expect(Number(rates.commercialBorrowRatePercent) >= 4.0).toBe(true);
    // 예대마진(NIM)은 양수여야 함
    expect(rates.netInterestMarginBps > 0).toBe(true);
  });
});
