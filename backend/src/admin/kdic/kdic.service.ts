import { Injectable, Logger } from '@nestjs/common';
import { KdicRepository, KdicFundStatus, InsuredInstitution, UserInsuredCoverage, KdicPremiumRecord, KdicPayoutRecord } from './kdic.repository';
import { DiscordAlertService } from '../../discord/discord-alert.service';

@Injectable()
export class KdicService {
  private readonly logger = new Logger(KdicService.name);

  constructor(
    private readonly repo: KdicRepository,
    private readonly discordAlertService?: DiscordAlertService,
  ) {}

  /** No admin/private read path is used for the public portal. */
  async getPublicPortalData(): Promise<Record<string, unknown>> {
    return this.repo.getPublicPortalSnapshot();
  }

  async getFundOverview() {
    const [fund, institutions, recentPremiums, recentPayouts] = await Promise.all([
      this.repo.getFundStatus(),
      this.repo.getInsuredInstitutions(),
      this.repo.listRecentPremiums(10),
      this.repo.listRecentPayouts(10),
    ]);

    const totalDeposits = institutions.reduce((sum, i) => sum + i.totalDepositsWld, 0);
    const averageBisRatio = institutions.length > 0 
      ? Math.round((institutions.reduce((sum, i) => sum + i.bisRatioPct, 0) / institutions.length) * 10) / 10 
      : 14.0;

    return {
      fund,
      institutions,
      summary: {
        totalInsuredInstitutions: institutions.length,
        totalDepositsWld: totalDeposits,
        averageBisRatioPct: averageBisRatio,
        reserveCoverageRatioPct: totalDeposits > 0 ? Math.round((fund.totalFundWld / totalDeposits) * 1000) / 10 : 40.0,
      },
      recentPremiums,
      recentPayouts,
    };
  }

  async getUserCoverage(userId: string): Promise<UserInsuredCoverage> {
    return this.repo.getUserInsuredCoverage(userId);
  }

  async assessQuarterlyPremiums(adminId: string) {
    const result = await this.repo.assessQuarterlyPremiums(adminId);

    if (this.discordAlertService) {
      await this.discordAlertService.sendAdminDirectMessage({
        title: '🏦 예금보험공사 분기별 예금보험료 정기 징수 완료',
        description: `부보 금융기관(시중은행/증권사)의 예보료가 예금보험기금에 정상 편입되었습니다.\n\n` +
          `• **총 징수 예보료**: +${result.totalCollectedWld.toLocaleString()} WLD\n` +
          `• **대상 기관 수**: ${result.recordsCount}개 금융기관 (연 0.08% 요율 적용)\n` +
          `• **집행 관리자**: ${adminId}`,
        color: 0x10b981,
      }).catch((err) => this.logger.warn(`Failed to send DM: ${err.message}`));
    }

    return result;
  }

  async injectEmergencyLiquidity(
    institutionId: string,
    amountWld: number,
    adminId: string
  ) {
    if (amountWld <= 0) {
      throw new Error('지원 유동성은 1 WLD 이상이어야 합니다.');
    }
    const result = await this.repo.injectEmergencyLiquidity(institutionId, amountWld, adminId);

    if (this.discordAlertService) {
      await this.discordAlertService.sendAdminDirectMessage({
        title: '🚨 [금융안정기금] 부실 금융기관 긴급 유동성 대여(Bailout) 집행',
        description: `뱅크런 및 건전성 악화를 방어하기 위해 예금보험기금 긴급 자금을 투입했습니다.\n\n` +
          `• **지원 대상 기관**: ${institutionId}\n` +
          `• **투입 긴급 유동성**: ${amountWld.toLocaleString()} WLD\n` +
          `• **회복 후 BIS 비율**: ${result.newBisRatioPct.toFixed(2)}%\n` +
          `• **잔여 예보기금**: ${result.newFundWld.toLocaleString()} WLD\n` +
          `• **승인 집행관**: ${adminId}`,
        color: 0xef4444,
      }).catch((err) => this.logger.warn(`Failed to send DM: ${err.message}`));
    }

    return result;
  }

  async executeDepositPayout(
    institutionId: string,
    userId: string,
    adminId: string
  ) {
    const result = await this.repo.executeDepositPayout(institutionId, userId, adminId);

    if (this.discordAlertService) {
      await this.discordAlertService.sendAdminDirectMessage({
        title: '🛡️ [예금자보호법 제31조] 피해 예금자 대위변제금(Payout) 지급 완료',
        description: `부실 금융기관의 예금자에 대해 법정 한도 내 즉시 대위변제가 집행되었습니다.\n\n` +
          `• **부실 금융기관**: ${institutionId}\n` +
          `• **피해 예금자 ID**: ${userId}\n` +
          `• **지급 대위변제금**: ${result.payoutAmountWld.toLocaleString()} WLD (최고 50만 WLD 보장)\n` +
          `• **잔여 예보기금**: ${result.newFundWld.toLocaleString()} WLD\n` +
          `• **집행 관리자**: ${adminId}`,
        color: 0x3b82f6,
      }).catch((err) => this.logger.warn(`Failed to send DM: ${err.message}`));
    }

    return result;
  }
}
