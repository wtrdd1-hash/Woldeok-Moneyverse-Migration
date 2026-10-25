import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { requirePositiveWld } from '../../wallet/wallet.repository';
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

  async contribute(userId: string, amountWld: string | number, note?: string) {
    const exactAmount = requirePositiveWld(amountWld, 'amountWld');
    this.logger.log(`User ${userId} contributing ${exactAmount} WLD to National Pension...`);
    const res = await this.repository.contribute(userId, exactAmount, note);

    // 대규모 기여금 또는 관리자 DM 알림
    if (this.discordAlertService && BigInt(exactAmount) >= 10000n && res.account) {
      try {
        const title = '🏛️ [국민연금] 대규모 공적 연금 기여금 국고 납입';
        const description =
          `국민(유저)의 연금 기여금이 접수되어 중앙 국고(VAULT_MAIN)로 입금되었습니다.\n\n` +
          `• **기여 납입자**: ${userId}\n` +
          `• **납입 금액**: ${BigInt(exactAmount).toLocaleString('ko-KR')} WLD\n` +
          `• **적립 후 총 기여금**: ${BigInt(res.account.accumulated_contribution_wld).toLocaleString('ko-KR')} WLD\n` +
          `• **가입 등급**: ${res.account.tier}\n` +
          `• **국고 잔액**: ${BigInt(res.newVaultBalanceWld).toLocaleString('ko-KR')} WLD`;

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
          `• **총 지급 연금액**: ${BigInt(result.totalPayoutAmount).toLocaleString('ko-KR')} WLD\n` +
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

  async listPayoutLogs(userId: string, limit = 20): Promise<(NationalPensionPayoutLogRow & { ledgerVerification: 'UNVERIFIED_LEDGER'; ledgerTransactionId: null })[]> {
    try {
      const rows = await this.repository.listPayoutLogs(userId, limit);
      // Legacy payout rows have no canonical transaction ID and must not imply money was posted.
      return rows.map((row) => ({ ...row, ledgerVerification: 'UNVERIFIED_LEDGER' as const, ledgerTransactionId: null }));
    } catch (error) {
      if ((error as { code?: string } | null)?.code === '42501') {
        throw new ServiceUnavailableException({
          code: 'PENSION_PAYOUT_READ_UNAVAILABLE',
          message: 'Historical pension payout records are temporarily unavailable.',
        });
      }
      throw error;
    }
  }

  async listRecentPayoutLogs(limit = 20): Promise<NationalPensionPayoutLogRow[]> {
    return this.repository.listRecentPayoutLogs(limit);
  }
}
