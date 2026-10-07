import { Injectable, Logger } from '@nestjs/common';
import { FxRepository, FxReserveStatus, FxRatePoint, FxWallet, FxTransaction } from './fx.repository';
import { DiscordAlertService } from '../../discord/discord-alert.service';

@Injectable()
export class FxService {
  private readonly logger = new Logger(FxService.name);

  constructor(
    private readonly repo: FxRepository,
    private readonly discordAlertService?: DiscordAlertService,
  ) {}

  async getReserveStatus(): Promise<FxReserveStatus> {
    return this.repo.getReserveStatus();
  }

  async getRateHistory(limit: number = 30): Promise<FxRatePoint[]> {
    return this.repo.getRateHistory(limit);
  }

  async getUserWallet(userId: string): Promise<FxWallet> {
    return this.repo.getOrCreateUserWallet(userId);
  }

  async listTransactions(limit: number = 20): Promise<FxTransaction[]> {
    return this.repo.listTransactions(limit);
  }

  async setHalt(isHalted: boolean, adminId: string): Promise<boolean> {
    const res = await this.repo.setHalt(isHalted);
    const msg = isHalted
      ? '🚨 [서울외환시장] 외환당국에 의해 외환거래가 긴급 일시 정지(Halt)되었습니다.'
      : '✅ [서울외환시장] 외환거래 정지가 해제되어 정상 환전이 재개되었습니다.';
    
    if (this.discordAlertService) {
      await this.discordAlertService.sendAdminDirectMessage({
        title: '외환시장 긴급 제어 통보',
        description: `${msg}\n\n• **집행 관리자**: ${adminId}`,
        color: isHalted ? 0xef4444 : 0x10b981,
      }).catch((err) => this.logger.warn(`Failed to send DM: ${err.message}`));
    }
    return res;
  }

  async swapWldToUsd(
    userId: string,
    wldAmount: number
  ): Promise<{ usdCredited: number; feeWld: number; appliedRate: number }> {
    if (wldAmount < 1000) {
      throw new Error('최소 환전 금액은 1,000 WLD 이상이어야 합니다.');
    }
    const result = await this.repo.swapWldToUsd(userId, wldAmount);

    if (this.discordAlertService && wldAmount >= 50000) {
      await this.discordAlertService.sendAdminDirectMessage({
        title: '대규모 외환 환전 감지 (WLD ➡️ USD)',
        description: `국민(유저)의 달러 매수 환전이 체결되었습니다.\n\n` +
          `• **유저 식별자**: ${userId}\n` +
          `• **환전 WLD**: ${wldAmount.toLocaleString()} WLD\n` +
          `• **지급 USD**: $${result.usdCredited.toLocaleString()}\n` +
          `• **적용 환율**: 1 USD = ${result.appliedRate.toLocaleString()} WLD\n` +
          `• **국고 세수 귀속**: ${result.feeWld.toLocaleString()} WLD`,
        color: 0x3b82f6,
      }).catch((err) => this.logger.warn(`Failed to send DM: ${err.message}`));
    }

    return result;
  }

  async swapUsdToWld(
    userId: string,
    usdAmount: number
  ): Promise<{ wldCredited: number; feeWld: number; appliedRate: number }> {
    if (usdAmount < 1) {
      throw new Error('최소 환전 금액은 $1 이상이어야 합니다.');
    }
    const result = await this.repo.swapUsdToWld(userId, usdAmount);

    if (this.discordAlertService && usdAmount >= 50) {
      await this.discordAlertService.sendAdminDirectMessage({
        title: '대규모 외환 환전 감지 (USD ➡️ WLD)',
        description: `국민(유저)의 원화 환전이 체결되었습니다.\n\n` +
          `• **유저 식별자**: ${userId}\n` +
          `• **환전 USD**: $${usdAmount.toLocaleString()}\n` +
          `• **지급 WLD**: ${result.wldCredited.toLocaleString()} WLD\n` +
          `• **적용 환율**: 1 USD = ${result.appliedRate.toLocaleString()} WLD\n` +
          `• **국고 세수 귀속**: ${result.feeWld.toLocaleString()} WLD`,
        color: 0x10b981,
      }).catch((err) => this.logger.warn(`Failed to send DM: ${err.message}`));
    }

    return result;
  }

  async executeSmoothingIntervention(
    type: 'SELL_USD' | 'BUY_USD',
    amountUsd: number,
    adminId: string
  ): Promise<{ newRate: number; newReservesUsd: number }> {
    const result = await this.repo.executeSmoothingIntervention(type, amountUsd, adminId);

    const actionText = type === 'SELL_USD' 
      ? `외환보유액 달러 매도 개입 (-$${amountUsd.toLocaleString()}) ➡️ WLD 가치 방어` 
      : `외환보유액 달러 매수 개입 (+$${amountUsd.toLocaleString()}) ➡️ 외환보유액 확충`;

    if (this.discordAlertService) {
      await this.discordAlertService.sendAdminDirectMessage({
        title: '🏛️ 중앙은행 외환당국 스무딩 오퍼레이션 시장개입 집행',
        description: `${actionText}\n\n` +
          `• **조정 후 기준환율**: 1 USD = ${result.newRate.toFixed(2)} WLD\n` +
          `• **잔여 외환보유액**: $${result.newReservesUsd.toLocaleString()}\n` +
          `• **외환당국 집행관**: ${adminId}`,
        color: 0xf59e0b,
      }).catch((err) => this.logger.warn(`Failed to send DM: ${err.message}`));
    }

    return result;
  }
}
