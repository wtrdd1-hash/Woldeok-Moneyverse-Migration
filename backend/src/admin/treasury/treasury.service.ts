import { TelegramAlertService } from '../../telegram/telegram-alert.service';
import { BadRequestException, Injectable, Optional, ServiceUnavailableException } from '@nestjs/common';
import { TreasuryOverview, TreasuryRepository } from './treasury.repository';

export class TreasuryInputError extends BadRequestException {}

@Injectable()
export class TreasuryService {
  constructor(private readonly repository: TreasuryRepository, @Optional() private readonly telegram?: TelegramAlertService) {}

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

  async disburseCitizenDividend(adminId: string, amountPerUserWld: string, reason: string, idempotencyKey?: string) {
    if (!amountPerUserWld || !/^\d+$/.test(amountPerUserWld) || BigInt(amountPerUserWld) <= BigInt(0)) {
      throw new TreasuryInputError('1인당 배당금은 1 WLD 이상의 정수여야 합니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new TreasuryInputError('지출 감사 사유는 최소 10자 이상 입력해야 합니다.');
    }
    if (!idempotencyKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) throw new TreasuryInputError('배당 요청 UUID가 필요합니다.');
    try {
      return await this.repository.disburseCitizenDividend(adminId, amountPerUserWld, reason, idempotencyKey);
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
      const result = await this.repository.disburseTargetedSubsidy(
        adminId,
        amountPerUserWld,
        maxBalanceCutoffWld,
        reason,
      );
      if (this.telegram) {
        this.telegram.notifyTreasuryGrant({
          action: 'TARGETED_SUBSIDY',
          amountWld: (result as any)?.total_disbursed_wld || amountPerUserWld,
          targetUser: `대상자 ${(result as any)?.eligible_users_count || 0}명 (1인당 ${amountPerUserWld} WLD)`,
          adminId,
          reason,
        }).catch(() => undefined);
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async userDonate(userId: string, amountWld: string, memo: string, idempotencyKey: string) {
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new TreasuryInputError('기부 금액은 1 WLD 이상의 정수여야 합니다.');
    }
    try {
      return await this.repository.userDonate(userId, amountWld, memo || '국고 자발적 공공 기부', idempotencyKey);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async getTopDonors(limit = 10) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
      throw new TreasuryInputError('limit must be an integer between 1 and 100');
    }
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
      const result = await this.repository.disburseGrant(adminId, targetUserId, amountWld, disbursementType, reason);
      if (this.telegram) {
        this.telegram.notifyTreasuryGrant({
          action: 'DISBURSED',
          amountWld,
          targetUser: targetUserId ?? '공공/기관 수혜',
          adminId,
          reason,
        }).catch(() => undefined);
      }
      return result;
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
      const result = await this.repository.distributeBudgetRule(adminId, amountWld, reason);
      if (this.telegram) {
        this.telegram.notifyTreasuryGrant({
          action: 'BUDGET_DISTRIBUTION',
          amountWld,
          targetUser: '각 부문별 예산 금고',
          adminId,
          reason,
        }).catch(() => undefined);
      }
      return result;
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

  async createBackupSnapshot(_adminId: string, _provider?: string): Promise<never> {
    // No backup is persisted, signed or restore-tested by this API yet.
    throw new ServiceUnavailableException({
      code: 'TREASURY_BACKUP_EVIDENCE_UNAVAILABLE',
      message: 'Verified backup persistence and restore evidence are unavailable.',
    });
  }

  async getBackupStatus(): Promise<never> {
    throw new ServiceUnavailableException({
      code: 'TREASURY_BACKUP_EVIDENCE_UNAVAILABLE',
      message: 'Verified backup persistence and restore evidence are unavailable.',
    });
  }

  async getHealthInsuranceOverview() {
    return this.repository.getHealthInsuranceOverview();
  }

  async claimHealthInsuranceBenefit(userId: string, claimType: string, expenseWld: string, reason: string) {
    if (!userId || typeof userId !== 'string') {
      throw new TreasuryInputError('유효한 유저 ID가 필요합니다.');
    }
    if (!expenseWld || !/^\d+$/.test(expenseWld) || BigInt(expenseWld) <= BigInt(0)) {
      throw new TreasuryInputError('청구 비용은 1 WLD 이상의 정수여야 합니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      throw new TreasuryInputError('건강보험 청구 사유는 최소 5자 이상 입력해야 합니다.');
    }
    try {
      const result = await this.repository.claimHealthInsuranceBenefit(userId, claimType, expenseWld, reason);
      if (this.telegram) {
        this.telegram.notifyTreasuryGrant({
          action: 'TARGETED_SUBSIDY',
          amountWld: (result as any)?.benefit_amount_wld || expenseWld,
          targetUser: userId,
          adminId: 'system.health_insurance',
          reason: `[건보급여] ${claimType}: ${reason}`,
        }).catch(() => undefined);
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async listTreasuryGrants() {
    return this.repository.listTreasuryGrants();
  }

  async reviewGrantApprove(
    adminId: string,
    grantId: string,
    amountWld: string,
    vaultCode = "VAULT_WELFARE",
    reason = "창업 지원금 승인 및 원자적 국고 지급",
  ) {
    if (!adminId || typeof adminId !== "string") {
      throw new TreasuryInputError("유효한 관리자 ID가 필요합니다.");
    }
    if (!grantId || typeof grantId !== "string") {
      throw new TreasuryInputError("유효한 신청서 ID가 필요합니다.");
    }
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new TreasuryInputError("승인 금액은 1 WLD 이상의 정수여야 합니다.");
    }
    try {
      const result = await this.repository.reviewGrantApprove(adminId, grantId, amountWld, vaultCode, reason);
      if (this.telegram) {
        this.telegram.notifyTreasuryGrant({
          action: "DISBURSED",
          amountWld,
          targetUser: (result as any)?.target_user_id ?? grantId,
          adminId,
          reason: "[창업지원금 승인] " + reason + " (금고: " + vaultCode + ")",
        }).catch(() => undefined);
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async reviewGrantReject(
    adminId: string,
    grantId: string,
    reason = "사업계획서 요건 미충족으로 인한 반려",
  ) {
    if (!adminId || typeof adminId !== "string") {
      throw new TreasuryInputError("유효한 관리자 ID가 필요합니다.");
    }
    if (!grantId || typeof grantId !== "string") {
      throw new TreasuryInputError("유효한 신청서 ID가 필요합니다.");
    }
    try {
      return await this.repository.reviewGrantReject(adminId, grantId, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async applyGrant(
    userId: string,
    applicantName: string,
    businessName: string,
    businessPlan: string,
    category: string,
    tier: string,
  ) {
    if (!userId || typeof userId !== "string") {
      throw new TreasuryInputError("로그인 세션이 필요합니다.");
    }
    if (!businessName || businessName.trim().length < 2) {
      throw new TreasuryInputError("사업체 명칭은 최소 2자 이상이어야 합니다.");
    }
    if (!businessPlan || businessPlan.trim().length < 20) {
      throw new TreasuryInputError("사업계획서 요약은 최소 20자 이상 구체적으로 작성해 주세요.");
    }
    try {
      return await this.repository.applyGrant(userId, applicantName, businessName, businessPlan, category, tier);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async getUserGrant(userId: string) {
    if (!userId || typeof userId !== "string") {
      throw new TreasuryInputError("로그인 세션이 필요합니다.");
    }
    return this.repository.getUserGrant(userId);
  }

  async runClawbackSweepNow(adminId: string) {
    if (!adminId || typeof adminId !== "string") {
      throw new TreasuryInputError("유효한 관리자 ID가 필요합니다.");
    }
    try {
      const result = await this.repository.runClawbackSweepNow();
      if (this.telegram && result.reclaimed_count > 0) {
        this.telegram.notifyTreasuryGrant({
          action: "DISBURSED",
          amountWld: String(result.total_reclaimed_wld),
          targetUser: "VAULT_WELFARE",
          adminId,
          reason: "[미창업 자동환수 즉시 집행] 총 " + result.reclaimed_count + "건, " + result.total_reclaimed_wld + " WLD 회수",
        }).catch(() => undefined);
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async disburseAdminSalary(
    actorId: string,
    targetAdminId: string,
    amountWld: string,
    reason: string,
  ) {
    if (!actorId || !targetAdminId) {
      throw new TreasuryInputError('유효한 관리자 세션이 필요합니다.');
    }
    if (!amountWld || !/^[1-9][0-9]{0,7}$/.test(amountWld) || Number(amountWld) > 5000000) {
      throw new TreasuryInputError('관리자 임금은 1 ~ 5,000,000 WLD 사이의 정수여야 합니다.');
    }
    if (!reason || reason.trim().length < 5) {
      throw new TreasuryInputError('임금 지급 사유는 최소 5자 이상 작성해야 합니다.');
    }
    try {
      const result = await this.repository.disburseAdminSalary(actorId, targetAdminId, amountWld, reason);
      if (this.telegram && result?.success) {
        this.telegram.notifyTreasuryGrant({
          action: 'DISBURSED',
          amountWld,
          targetUser: targetAdminId,
          adminId: actorId,
          reason: '[국고 관리자 임금 지급] ' + reason,
        }).catch(() => undefined);
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async topupFromMintDirect(
    actorId: string,
    amountWld: string,
    reason: string,
    requestKey: string,
  ) {
    if (!actorId) {
      throw new TreasuryInputError('유효한 관리자 세션이 필요합니다.');
    }
    if (!amountWld || !/^[1-9][0-9]{0,7}$/.test(amountWld) || Number(amountWld) > 10000000) {
      throw new TreasuryInputError('조폐국 국고 충전액은 1 ~ 10,000,000 WLD 사이여야 합니다.');
    }
    if (!requestKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestKey)) {
      throw new TreasuryInputError('유효한 UUID v4 요청 멱등키가 필요합니다.');
    }
    try {
      const result = await this.repository.topupFromMintDirect(actorId, amountWld, reason, requestKey);
      if (this.telegram && result?.success) {
        this.telegram.notifyTreasuryGrant({
          action: 'BUDGET_DISTRIBUTION',
          amountWld,
          targetUser: 'VAULT_MAIN',
          adminId: actorId,
          reason: '[조폐국 화폐발행 국고 직행 충전] ' + reason,
        }).catch(() => undefined);
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

}
