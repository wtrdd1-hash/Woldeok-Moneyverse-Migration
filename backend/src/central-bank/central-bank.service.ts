import { BadRequestException, Injectable } from '@nestjs/common';
import { MintService } from '../mint/mint.service';
import {
  AcceptMintBatchDto,
  UpdateBaseRateDto,
  UpdateReserveRequirementDto,
} from './central-bank.dto';

export interface BaseRateDecision {
  ratePercent: string;
  rationale: string;
  targetInflationPercent: string;
  taylorRuleEstimatedRate: string;
  decidedBy: string;
  decidedAt: string;
}

export interface ReserveRequirementRecord {
  ratioPercent: string;
  rationale: string;
  decidedBy: string;
  enforcedAt: string;
}

@Injectable()
export class CentralBankService {
  constructor(private readonly mintService: MintService) {}

  private currentBaseRate: BaseRateDecision = {
    ratePercent: '3.25',
    rationale: '물가 안정 및 금융 유동성 균형 유지를 위한 기준금리 결정',
    targetInflationPercent: '2.0',
    taylorRuleEstimatedRate: '3.40',
    decidedBy: 'CENTRAL_BANK_MONETARY_POLICY_COMMITTEE',
    decidedAt: '2026-10-01T00:00:00.000Z',
  };

  private currentReserveRequirement: ReserveRequirementRecord = {
    ratioPercent: '7.0',
    rationale: '시중 상업은행 지급준비율 법정 기준',
    decidedBy: 'CENTRAL_BANK_SUPERVISORY_BOARD',
    enforcedAt: '2026-10-01T00:00:00.000Z',
  };

  /**
   * 조폐국 주조 화폐 인수 및 국고 방출 승인 (2단계 상호 견제)
   * 조폐국이 주조한 M0 화폐를 중앙은행이 심사 후 인수 승인해야만 국고/시장에 유통됨
   */
  async acceptMintBatch(batchId: string, dto: AcceptMintBatchDto, acceptedBy: string) {
    const batch = await this.mintService.getBatchById(batchId);
    if (batch.status !== 'PENDING_CENTRAL_BANK_ACCEPTANCE') {
      throw new BadRequestException(`배치 상태가 중앙은행 인수 대기 상태가 아닙니다 (${batch.status})`);
    }

    const centralBankTxId = `CB-ACCEPT-${Date.now()}`;
    const updatedBatch = await this.mintService.markBatchAccepted(batchId, centralBankTxId);

    return {
      message: '국가조폐국 주조 화폐가 국가중앙은행에 의해 공식 인수 및 유통 승인되었습니다.',
      centralBankTxId,
      acceptedBy,
      targetVaultAllocation: dto.targetVaultAllocation || 'TREASURY_MAIN',
      acceptanceReason: dto.acceptanceReason,
      batch: updatedBatch,
      acceptedAt: new Date().toISOString(),
    };
  }

  /**
   * M0(본원통화), M1(협의통화), M2(광의통화) 거시경제 통화량 지표 산출
   */
  async getMonetaryAggregates() {
    const seigniorageLedger = await this.mintService.getSeigniorageLedger();
    const m0BaseMoney = BigInt(seigniorageLedger.totalMintedM0Wld) - BigInt(seigniorageLedger.totalBurnedDestroyedWld);

    // M1: M0(시중 현금 통화) + 요구불 예금 (대략 M0의 약 1.8배)
    const demandDeposits = (m0BaseMoney * BigInt(80)) / BigInt(100);
    const m1NarrowMoney = m0BaseMoney + demandDeposits;

    // M2: M1 + 정기예적금 + 시장형 금융상품 (대략 M1의 약 2.4배)
    const timeDepositsAndBonds = (m1NarrowMoney * BigInt(140)) / BigInt(100);
    const m2BroadMoney = m1NarrowMoney + timeDepositsAndBonds;

    // 통화승수 (Money Multiplier = M2 / M0)
    const moneyMultiplier = m0BaseMoney > BigInt(0)
      ? (Number(m2BroadMoney) / Number(m0BaseMoney)).toFixed(2)
      : '1.00';

    return {
      centralBankAuthority: '대한민국 국가중앙은행 (Woldeok Central Bank)',
      m0BaseMoneyWld: m0BaseMoney.toString(),
      m1NarrowMoneyWld: m1NarrowMoney.toString(),
      m2BroadMoneyWld: m2BroadMoney.toString(),
      moneyMultiplier,
      currentBaseRatePercent: this.currentBaseRate.ratePercent,
      reserveRequirementRatioPercent: this.currentReserveRequirement.ratioPercent,
      inflationTargetPercent: this.currentBaseRate.targetInflationPercent,
      calculatedAt: new Date().toISOString(),
    };
  }

  async getBaseRate(): Promise<BaseRateDecision> {
    return this.currentBaseRate;
  }

  /**
   * 기준금리(Base Rate) 결정 및 공시 (금융통화위원회)
   */
  async updateBaseRate(dto: UpdateBaseRateDto, decidedBy: string): Promise<BaseRateDecision> {
    const rate = Number(dto.baseRatePercent);
    if (isNaN(rate) || rate < 0 || rate > 25) {
      throw new BadRequestException('기준금리는 0% 이상 25% 이하의 수치여야 합니다.');
    }

    // 테일러 룰 추정 공식 간이 시뮬레이션: 중립금리 2.0% + 인플레이션 2.5% + 0.5*(인플레 갭) + 0.5*(GDP 갭)
    const targetInf = Number(dto.targetInflationPercent || '2.0');
    const estimatedTaylor = (2.0 + targetInf + 0.5 * (targetInf - 2.0)).toFixed(2);

    this.currentBaseRate = {
      ratePercent: dto.baseRatePercent,
      rationale: dto.rateDecisionRationale,
      targetInflationPercent: targetInf.toFixed(1),
      taylorRuleEstimatedRate: estimatedTaylor,
      decidedBy,
      decidedAt: new Date().toISOString(),
    };

    return this.currentBaseRate;
  }

  async getReserveRequirement(): Promise<ReserveRequirementRecord> {
    return this.currentReserveRequirement;
  }

  /**
   * 지급준비율(Reserve Requirement Ratio) 갱신
   */
  async updateReserveRequirement(
    dto: UpdateReserveRequirementDto,
    decidedBy: string,
  ): Promise<ReserveRequirementRecord> {
    const ratio = Number(dto.reserveRatioPercent);
    if (isNaN(ratio) || ratio < 1 || ratio > 50) {
      throw new BadRequestException('지급준비율은 1% 이상 50% 이하의 수치여야 합니다.');
    }

    this.currentReserveRequirement = {
      ratioPercent: dto.reserveRatioPercent,
      rationale: dto.regulationRationale,
      decidedBy,
      enforcedAt: new Date().toISOString(),
    };

    return this.currentReserveRequirement;
  }
}
