import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
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

  // The legacy FX repository changes cash balances without a balanced ledger posting.
  // Do not permit member settlement until an idempotent SECURITY DEFINER contract exists.
  async swapWldToUsd(
    _userId: string,
    _wldAmount: number,
  ): Promise<{ usdCredited: number; feeWld: number; appliedRate: number }> {
    throw new ServiceUnavailableException('FX ledger settlement is not available');
  }

  async swapUsdToWld(
    _userId: string,
    _usdAmount: number,
  ): Promise<{ wldCredited: number; feeWld: number; appliedRate: number }> {
    throw new ServiceUnavailableException('FX ledger settlement is not available');
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

  async getSdrAllocations() {
    return this.repo.getSdrAllocations();
  }

  async getSwapAgreements() {
    return this.repo.getSwapAgreements();
  }

  async drawdownCurrencySwap(
    agreementId: string,
    amountUsd: number,
    adminId: string,
    purpose?: string
  ) {
    if (amountUsd <= 0) {
      throw new Error('인출 금액은 $1 USD 이상이어야 합니다.');
    }
    const result = await this.repo.drawdownCurrencySwap(
      agreementId,
      amountUsd,
      adminId,
      purpose || '외환 유동성 공급 및 환율 안정화'
    );

    if (this.discordAlertService) {
      await this.discordAlertService.sendAdminDirectMessage({
        title: '🚨 [비상] 양자간 통화스왑 긴급 자금 인출 집행',
        description: `우방국 통화스왑 라인을 가동하여 외환보유액을 긴급 확충했습니다.\n\n` +
          `• **협정 기관**: ${result.agreement.counterparty}\n` +
          `• **인출 금액**: $${amountUsd.toLocaleString()} USD\n` +
          `• **누적 인출액**: $${result.agreement.drawnAmountUsd.toLocaleString()} USD (잔여: $${result.agreement.availableFacilityUsd.toLocaleString()} USD)\n` +
          `• **확충 후 외환보유액**: $${result.newReservesUsd.toLocaleString()} USD\n` +
          `• **집행 관리자**: ${adminId}`,
        color: 0xef4444,
      }).catch((err) => this.logger.warn(`Failed to send DM: ${err.message}`));
    }

    return result;
  }

  async getForwardRates() {
    const spotRate = await this.repo.getLatestRate();
    // Covered Interest Parity (CIP): F = S * (1 + r_wld * t) / (1 + r_usd * t)
    const rWld = 0.035; // 3.5%
    const rUsd = 0.0525; // 5.25%

    const calcF = (days: number) => {
      const t = days / 360;
      const f = spotRate * ((1 + rWld * t) / (1 + rUsd * t));
      const forwardRate = Math.round(f * 100) / 100;
      const swapPoint = Math.round((forwardRate - spotRate) * 100) / 100;
      return { days, forwardRate, swapPoint };
    };

    return {
      spotRate,
      wldRatePct: 3.5,
      usdRatePct: 5.25,
      rates: {
        '1M': { tenor: '1M', label: '1개월 만기 (30일)', ...calcF(30) },
        '3M': { tenor: '3M', label: '3개월 만기 (90일)', ...calcF(90) },
        '6M': { tenor: '6M', label: '6개월 만기 (180일)', ...calcF(180) },
      },
    };
  }

  async createForwardContract(
    _userId: string,
    _position: 'BUY_USD' | 'SELL_USD',
    _tenor: '1M' | '3M' | '6M',
    _contractAmountUsd: number,
  ): Promise<Awaited<ReturnType<FxRepository['createForwardContract']>>> {
    // The legacy margin path is not tied to a durable WLD ledger receipt.
    throw new ServiceUnavailableException('FX forward settlement is not available');
  }

  async getUserForwardContracts(userId: string) {
    return this.repo.getUserForwardContracts(userId);
  }

  async listAllForwardContracts(limit: number = 30) {
    return this.repo.listAllForwardContracts(limit);
  }

  async settleForwardContract(contractId: string) {
    const currentSpotRate = await this.repo.getLatestRate();
    return this.repo.settleForwardContract(contractId, currentSpotRate);
  }

  async getEarlyWarningStatus() {
    const currentSpotRate = await this.repo.getLatestRate();
    return this.repo.getEarlyWarningStatus(currentSpotRate);
  }
}
