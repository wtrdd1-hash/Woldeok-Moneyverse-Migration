import { Injectable, Logger } from '@nestjs/common';
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
    this.logger.log('Starting hourly treasury bond coupon interest & maturity processing...');
    const result = await this.repository.processHourlyCouponsAndMaturities();
    this.logger.log(
      `Coupons distributed: ${result.couponsDistributedWld} WLD, Maturities: ${result.maturitiesRedeemedWld} WLD across ${result.holdingsProcessed} holdings`,
    );

    // 관리자 알림 발송 (이자 지급액이 존재할 때)
    if (
      this.discordAlertService &&
      (BigInt(result.couponsDistributedWld) > BigInt(0) || BigInt(result.maturitiesRedeemedWld) > BigInt(0))
    ) {
      try {
        const title = '💵 [국채 정산] 시간당 국채 쿠폰 이자 및 만기 원금 상환 완료';
        const description =
          `월덱 기획재정국채(KTB) 보유 투자자 전원에게 확정 쿠폰 이자 및 만기 상환금이 지급되었습니다.\n\n` +
          `• **지급 총 쿠폰 이자**: +${Number(result.couponsDistributedWld).toLocaleString('ko-KR')} WLD\n` +
          `• **만기 원금 상환액**: +${Number(result.maturitiesRedeemedWld).toLocaleString('ko-KR')} WLD (상환: ${result.maturedCount}건)\n` +
          `• **처리 보유 계좌**: ${result.holdingsProcessed}개 채권 구좌`;

        await this.discordAlertService.sendAdminDirectMessage(
          {
            title,
            description,
            color: 0x10b981,
          },
          '886478189520637992',
        );
      } catch (err) {
        this.logger.warn(`Failed to send Discord alert for coupon distribution: ${String(err)}`);
      }
    }

    return result;
  }

  async updateBondStatus(bondId: string, status: string, annualCouponRateBps?: number) {
    return this.repository.updateBondStatus(bondId, status, annualCouponRateBps);
  }
}
