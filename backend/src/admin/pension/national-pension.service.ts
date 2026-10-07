import { Injectable, Logger } from '@nestjs/common';
import { DiscordAlertService } from '../../discord/discord-alert.service';
import {
  NationalPensionAccountRow,
  NationalPensionContributionRow,
  NationalPensionOverview,
  NationalPensionPayoutLogRow,
  NationalPensionRepository,
} from './national-pension.repository';

@Injectable()
export class NationalPensionService {
  private readonly logger = new Logger(NationalPensionService.name);

  constructor(
    private readonly repository: NationalPensionRepository,
    private readonly discordAlertService?: DiscordAlertService,
  ) {}

  async getOverview(): Promise<NationalPensionOverview> {
    return this.repository.getOverview();
  }

  async getAccount(userId: string): Promise<NationalPensionAccountRow> {
    return this.repository.getOrCreateAccount(userId);
  }

  async contribute(userId: string, amountWld: number, note?: string) {
    this.logger.log(`User ${userId} contributing ${amountWld} WLD to National Pension...`);
    const res = await this.repository.contribute(userId, amountWld, note);

    // 대규모 기여금 또는 관리자 DM 알림
    if (this.discordAlertService && amountWld >= 10000 && res.account) {
      try {
        const title = '🏛️ [국민연금] 대규모 공적 연금 기여금 국고 납입';
        const description =
          `국민(유저)의 연금 기여금이 접수되어 중앙 국고(VAULT_MAIN)로 입금되었습니다.\n\n` +
          `• **기여 납입자**: ${userId}\n` +
          `• **납입 금액**: ${amountWld.toLocaleString('ko-KR')} WLD\n` +
          `• **적립 후 총 기여금**: ${Number(res.account.accumulated_contribution_wld).toLocaleString('ko-KR')} WLD\n` +
          `• **가입 등급**: ${res.account.tier}\n` +
          `• **국고 잔액**: ${Number(res.newVaultBalanceWld).toLocaleString('ko-KR')} WLD`;

        await this.discordAlertService.sendAdminDirectMessage(
          {
            title,
            description,
            color: 0x10b981, // Emerald Green
          },
          '886478189520637992',
        );
      } catch (err) {
        this.logger.warn(`Failed to send discord DM on pension contribution: ${err}`);
      }
    }

    return res;
  }

  async toggleRetirement(userId: string) {
    const account = await this.repository.toggleRetirement(userId);
    this.logger.log(`User ${userId} toggled retirement status to ${account.status}`);
    return account;
  }

  async liquidate(userId: string) {
    this.logger.log(`User ${userId} requested liquidation of pension fund...`);
    return this.repository.liquidate(userId);
  }

  async distributeHourlyPensionPayouts() {
    this.logger.log('Executing hourly national pension payouts...');
    const result = await this.repository.distributeHourlyPensionPayouts();
    this.logger.log(
      `Distributed ${result.totalPayoutAmount} WLD to ${result.pensionersCount} pensioners.`,
    );

    if (this.discordAlertService && result.pensionersCount > 0) {
      try {
        const title = '👴 [국민연금] 1시간 주기 공적 기초연금 정기 지급 완료';
        const description =
          `은퇴 수령 중인 국민들에게 중앙 국고(VAULT_MAIN)로부터 시간당 기초연금이 정상 지급되었습니다.\n\n` +
          `• **연금 수령 대상자**: ${result.pensionersCount}명\n` +
          `• **총 지급 연금액**: ${result.totalPayoutAmount.toLocaleString('ko-KR')} WLD\n` +
          `• **지급 주기**: 1시간 (정기 복리 운용 연계)`;

        await this.discordAlertService.sendAdminDirectMessage(
          {
            title,
            description,
            color: 0x8b5cf6, // Violet
          },
          '886478189520637992',
        );
      } catch (err) {
        this.logger.warn(`Failed to send discord DM on pension payouts: ${err}`);
      }
    }

    return result;
  }

  async listContributions(userId: string, limit = 20): Promise<NationalPensionContributionRow[]> {
    return this.repository.listContributions(userId, limit);
  }

  async listPayoutLogs(userId: string, limit = 20): Promise<NationalPensionPayoutLogRow[]> {
    return this.repository.listPayoutLogs(userId, limit);
  }

  async listRecentPayoutLogs(limit = 20): Promise<NationalPensionPayoutLogRow[]> {
    return this.repository.listRecentPayoutLogs(limit);
  }
}
