import { BOND_COUPON_SETTLEMENT_HOLD_REASON } from './bond-coupon-settlement-hold';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  TreasuryBondRepository,
  type BondCouponLogRow,
  type BondHoldingRow,
  type TreasuryBondRow,
  type TreasuryBondsOverview,
} from './treasury-bond.repository';
import { DiscordAlertService } from '../../discord/discord-alert.service';

@Injectable()
export class TreasuryBondService {
  private readonly logger = new Logger(TreasuryBondService.name);

  constructor(
    private readonly repository: TreasuryBondRepository,
    private readonly discordAlertService?: DiscordAlertService,
  ) {}

  async getOverview(): Promise<TreasuryBondsOverview> {
    return this.repository.getOverview();
  }

  async listBonds(): Promise<TreasuryBondRow[]> {
    return this.repository.listBonds();
  }

  async listUserHoldings(userId: string): Promise<BondHoldingRow[]> {
    return this.repository.listUserHoldings(userId);
  }

  async listRecentCouponLogs(limit = 20): Promise<BondCouponLogRow[]> {
    return this.repository.listRecentCouponLogs(limit);
  }

  async subscribeBond(userId: string, bondId: string, units: number) {
    this.logger.log(`User ${userId} subscribing to bond ${bondId} for ${units} units...`);
    const res = await this.repository.subscribeBond(userId, bondId, units);
    const bond = await this.repository.getBondById(bondId);

    // 관리자 디스코드 알림 발송
    if (this.discordAlertService && bond) {
      try {
        const title = '📜 [국채 청약] 신규 기획재정국채(KTB) 자금 조달 완료';
        const description =
          `투자자로부터 국가 국채 청약이 체결되어 중앙 국고(VAULT_MAIN)로 자금이 전액 납입되었습니다.\n\n` +
          `• **국채 종목**: ${bond.name} (${bond.symbol})\n` +
          `• **청약 좌수**: ${units}좌 (총 ${Number(res.totalPriceWld).toLocaleString('ko-KR')} WLD)\n` +
          `• **확정 표면금리**: 연 ${(bond.annual_coupon_rate_bps / 100).toFixed(2)}% (시간당 ${(bond.hourly_coupon_rate_bps / 100).toFixed(2)}%)\n` +
          `• **만기 일시**: ${res.maturityAt}`;

        await this.discordAlertService.sendAdminDirectMessage(
          {
            title,
            description,
            color: 0x3b82f6,
          },
          '886478189520637992',
        );
      } catch (err) {
        this.logger.warn(`Failed to send Discord alert for bond subscription: ${String(err)}`);
      }
    }

    return res;
  }

  async processHourlyCouponsAndMaturities() {
    // Service boundary protects callers even when they bypass the HTTP controller.
    throw new ServiceUnavailableException(BOND_COUPON_SETTLEMENT_HOLD_REASON);
  }

  async updateBondStatus(bondId: string, status: string, annualCouponRateBps?: number) {
    return this.repository.updateBondStatus(bondId, status, annualCouponRateBps);
  }

  async listUserRepoLoans(userId: string) {
    return this.repository.listUserRepoLoans(userId);
  }

  async createRepoLoan(userId: string, holdingId: string) {
    this.logger.log(`User ${userId} taking repo loan against bond holding ${holdingId}`);
    return this.repository.createRepoLoan(userId, holdingId);
  }

  async repayRepoLoan(userId: string, loanId: string) {
    this.logger.log(`User ${userId} repaying repo loan ${loanId}`);
    return this.repository.repayRepoLoan(userId, loanId);
  }

  async toggleAutoRollover(userId: string, holdingId: string, enabled: boolean) {
    return this.repository.toggleAutoRollover(userId, holdingId, enabled);
  }
}
