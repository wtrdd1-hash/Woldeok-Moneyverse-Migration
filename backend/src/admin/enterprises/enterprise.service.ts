import { Injectable, Logger } from '@nestjs/common';
import {
  EnterpriseRepository,
  type PrivateEnterpriseRow,
  type StateEnterpriseDividendLogRow,
  type StateEnterpriseRow,
  type StateHoldingOverview,
} from './enterprise.repository';
import { DiscordAlertService } from '../../discord/discord-alert.service';

@Injectable()
export class EnterpriseService {
  private readonly logger = new Logger(EnterpriseService.name);

  constructor(
    private readonly repository: EnterpriseRepository,
    private readonly discordAlertService?: DiscordAlertService,
  ) {}

  async getStateHoldingOverview(): Promise<StateHoldingOverview> {
    return this.repository.getStateHoldingOverview();
  }

  async listStateEnterprises(): Promise<StateEnterpriseRow[]> {
    return this.repository.listStateEnterprises();
  }

  async listPrivateEnterprises(): Promise<PrivateEnterpriseRow[]> {
    return this.repository.listPrivateEnterprises();
  }

  async listRecentDividendLogs(limit = 20): Promise<StateEnterpriseDividendLogRow[]> {
    return this.repository.listRecentDividendLogs(limit);
  }

  async harvestSoeDividends(adminId?: string) {
    this.logger.log('Starting SOE dividend remittance to Central Treasury...');
    const result = await this.repository.distributeSoeDividends(adminId);
    this.logger.log(`SOE dividends harvested: ${result.total_dividends_collected} WLD across ${result.enterprises_processed} SOEs`);

    // 디스코드 관리자 알림 발송
    if (this.discordAlertService && BigInt(result.total_dividends_collected) > BigInt(0)) {
      try {
        const title = '🏛️ [국가 공기업] 3대 기간 공기업 법정 이익배당 국고 납입 완료';
        const description =
          `월덱 국가투자공사(WSHC) 산하 3대 공기업(W-Power, W-Net, WDB)으로부터 당기순이익 30% 법정 배당금이 중앙 국고로 전액 납입되었습니다.\n\n` +
          `• **징수 총 배당금**: +${Number(result.total_dividends_collected).toLocaleString('ko-KR')} WLD\n` +
          `• **국고 잔액**: ${Number(result.treasury_balance_after).toLocaleString('ko-KR')} WLD\n` +
          `• **적용 모델**: 싱가포르 테마섹 + 노르웨이 GPFG 지주회사 배당 환원 체계`;

        await this.discordAlertService.sendAdminDirectMessage(
          {
            title,
            description,
            color: 0x10b981,
          },
          '886478189520637992',
        );
      } catch (err) {
        this.logger.warn(`Failed to send Discord alert for SOE dividends: ${String(err)}`);
      }
    }

    return result;
  }

  async updateSoeStatus(code: string, status: string, dividendRateBps?: number): Promise<boolean> {
    const validStatuses = ['ACTIVE', 'PAUSED', 'PRIVATIZING'];
    if (!validStatuses.includes(status)) {
      throw new Error(`유효하지 않은 공기업 운영 상태입니다: ${status}`);
    }
    return this.repository.updateSoeStatus(code, status, dividendRateBps);
  }
}
