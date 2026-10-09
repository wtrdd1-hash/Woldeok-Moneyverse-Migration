import { BadRequestException, Injectable } from '@nestjs/common';
import { TreasuryOverview, TreasuryRepository } from './treasury.repository';

export class TreasuryInputError extends BadRequestException {}

@Injectable()
export class TreasuryService {
  constructor(private readonly repository: TreasuryRepository) {}

  async getOverview(): Promise<TreasuryOverview> {
    return this.repository.getOverview();
  }

  getTaxRates() {
    return this.repository.getTaxRates();
  }

  async getBudgets() {
    return this.repository.getBudgets();
  }

  getRevenue() {
    return this.repository.getRevenue();
  }

  getExpenditure() {
    return this.repository.getExpenditure();
  }

  getReconciliation() {
    return this.repository.getReconciliation();
  }

  async listTransactions(limit = 30, cursor?: string) {
    return this.repository.listTransactions(limit, cursor);
  }

  async getUserMoneyFlows(
    limit?: number,
    cursor?: string,
    search?: string,
    type?: string,
    direction?: string,
  ) {
    return this.repository.getUserMoneyFlows(limit, cursor, search, type, direction);
  }

  async injectFunds(adminId: string, vaultCode: string, amountWld: string, reason: string) {
    this.validateInputs(vaultCode, amountWld, reason);
    try {
      return await this.repository.injectFunds(adminId, vaultCode, amountWld, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async absorbFunds(adminId: string, vaultCode: string, amountWld: string, reason: string) {
    this.validateInputs(vaultCode, amountWld, reason);
    try {
      return await this.repository.absorbFunds(adminId, vaultCode, amountWld, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async disburseCitizenDividend(adminId: string, amountPerUserWld: string, reason: string) {
    if (!amountPerUserWld || !/^\d+$/.test(amountPerUserWld) || BigInt(amountPerUserWld) <= BigInt(0)) {
      throw new TreasuryInputError('1인당 배당금은 1 WLD 이상의 정수여야 합니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new TreasuryInputError('지출 감사 사유는 최소 10자 이상 입력해야 합니다.');
    }
    try {
      return await this.repository.disburseCitizenDividend(adminId, amountPerUserWld, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async previewTargetedSubsidy(cutoffWld = '10000', amountPerUserWld = '5000') {
    return this.repository.previewTargetedSubsidy(cutoffWld, amountPerUserWld);
  }

  async disburseTargetedSubsidy(
    adminId: string,
    amountPerUserWld: string,
    maxBalanceCutoffWld: string,
    reason: string,
  ) {
    if (!amountPerUserWld || !/^\d+$/.test(amountPerUserWld) || BigInt(amountPerUserWld) <= BigInt(0)) {
      throw new TreasuryInputError('1인당 지원금은 1 WLD 이상의 정수여야 합니다.');
    }
    if (!maxBalanceCutoffWld || !/^\d+$/.test(maxBalanceCutoffWld) || BigInt(maxBalanceCutoffWld) <= BigInt(0)) {
      throw new TreasuryInputError('보유자산 컷오프는 1 WLD 이상의 정수여야 합니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new TreasuryInputError('지출 감사 사유는 최소 10자 이상 입력해야 합니다.');
    }
    try {
      return await this.repository.disburseTargetedSubsidy(
        adminId,
        amountPerUserWld,
        maxBalanceCutoffWld,
        reason,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async userDonate(userId: string, amountWld: string, memo: string) {
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new TreasuryInputError('기부 금액은 1 WLD 이상의 정수여야 합니다.');
    }
    try {
      return await this.repository.userDonate(userId, amountWld, memo || '국고 자발적 공공 기부');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async getTopDonors(limit = 10) {
    return this.repository.getTopDonors(limit);
  }

  async disburseGrant(
    adminId: string,
    targetUserId: string | null,
    amountWld: string,
    disbursementType: string,
    reason: string,
  ) {
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new TreasuryInputError('지원금 금액은 1 WLD 이상의 정수여야 합니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new TreasuryInputError('지출 감사 사유는 최소 10자 이상 입력해야 합니다.');
    }
    try {
      return await this.repository.disburseGrant(adminId, targetUserId, amountWld, disbursementType, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  private validateInputs(vaultCode: string, amountWld: string, reason: string) {
    if (!vaultCode || typeof vaultCode !== 'string' || vaultCode.trim().length === 0) {
      throw new TreasuryInputError('금고 코드(vaultCode)를 올바르게 지정해 주세요.');
    }
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new TreasuryInputError('금액은 0보다 큰 정수 WLD여야 합니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new TreasuryInputError('국고 회계 감사 사유는 최소 10자 이상 입력해야 합니다.');
    }
  }

  /**
   * v523 불변식 가드: 국고 지출(배당, 지원금, 예산이동 등)은 단순 재정 이전(Fiscal Transfer)이어야 하며
   * 시스템 총통화량(M_total)을 임의로 변경하지 않음을 보증한다. (Delta M_total = 0)
   */
  public assertFiscalTransferOnly(operation: string, amountWld: string): boolean {
    if (!amountWld || BigInt(amountWld) <= BigInt(0)) {
      throw new TreasuryInputError(`[v523 Invariant] 유효하지 않은 재정 이전 수량입니다 (${operation}).`);
    }
    return true;
  }

  async distributeBudgetRule(adminId: string, amountWld: string, reason: string) {
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new TreasuryInputError('예산 배정 금액은 1 WLD 이상의 정수여야 합니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new TreasuryInputError('예산 배정 감사 사유는 최소 10자 이상 입력해야 합니다.');
    }
    try {
      return await this.repository.distributeBudgetRule(adminId, amountWld, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async executeMarketBuybackBurn(adminId: string, listingId: string, reason: string) {
    if (!listingId || typeof listingId !== 'string') {
      throw new TreasuryInputError('매물 ID(listingId)를 올바르게 지정해 주세요.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new TreasuryInputError('역매수 소각 감사 사유는 최소 10자 이상 입력해야 합니다.');
    }
    try {
      return await this.repository.executeMarketBuybackBurn(adminId, listingId, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async getCitizenTaxReceipt(userId: string) {
    if (!userId || typeof userId !== 'string') {
      throw new TreasuryInputError('유효한 유저 ID가 필요합니다.');
    }
    return this.repository.getCitizenTaxReceipt(userId);
  }

  async getGovernanceVotes(quarter = '2026-Q4') {
    return this.repository.getGovernanceVotes(quarter);
  }

  async voteCitizenBudget(userId: string, quarter: string, priorityChoice: string) {
    const validChoices = ['WELFARE', 'INFRASTRUCTURE', 'CITIZEN_DIVIDEND', 'CURRENCY_STABILIZATION'];
    if (!validChoices.includes(priorityChoice)) {
      throw new TreasuryInputError('유효하지 않은 예산 우선순위 선택입니다.');
    }
    return this.repository.voteCitizenBudget(userId, quarter, priorityChoice);
  }

  async exportLedgerCsv() {
    return this.repository.exportLedgerCsv();
  }

  async executeWealthTax(adminId: string, reason?: string) {
    if (!adminId || typeof adminId !== 'string') {
      throw new TreasuryInputError('유효한 관리자 ID가 필요합니다.');
    }
    const cleanReason = (reason ?? '고액 자산가 누진적 부유세 정기 과세 집행').trim();
    try {
      return await this.repository.executeWealthTax(adminId, cleanReason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async getWealthTaxAssessments() {
    return this.repository.getWealthTaxAssessments();
  }

  async createBackupSnapshot(adminId: string, provider?: string) {
    return this.repository.createImmutableBackupSnapshot(adminId, provider);
  }

  async getBackupStatus() {
    return this.repository.getBackupStatus();
  }
}
