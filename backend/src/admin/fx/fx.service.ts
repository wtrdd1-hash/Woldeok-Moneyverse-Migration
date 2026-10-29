import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { FxRepository, FxReserveStatus, FxRatePoint, FxWallet, FxTransaction, FxForwardContract, CurrencySwapAgreement } from './fx.repository';
import { DiscordAlertService } from '../../discord/discord-alert.service';

@Injectable()
export class FxService {

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

  async getUserWallet(_userId: string): Promise<FxWallet> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async listTransactions(limit: number = 20): Promise<FxTransaction[]> {
    return this.repo.listTransactions(limit);
  }

  async setHalt(_isHalted: boolean, _adminId: string): Promise<boolean> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async swapWldToUsd(
    _userId: string,
    _wldAmount: number
  ): Promise<{ usdCredited: number; feeWld: number; appliedRate: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async swapUsdToWld(
    _userId: string,
    _usdAmount: number
  ): Promise<{ wldCredited: number; feeWld: number; appliedRate: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async executeSmoothingIntervention(
    _type: 'SELL_USD' | 'BUY_USD',
    _amountUsd: number,
    _adminId: string
  ): Promise<{ newRate: number; newReservesUsd: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async getSdrAllocations() {
    return this.repo.getSdrAllocations();
  }

  async getSwapAgreements() {
    return this.repo.getSwapAgreements();
  }

  async drawdownCurrencySwap(
    _agreementId: string,
    _amountUsd: number,
    _adminId: string,
    _purpose?: string
  ): Promise<{ agreement: CurrencySwapAgreement; newReservesUsd: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
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
    _contractAmountUsd: number
  ): Promise<FxForwardContract> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async getUserForwardContracts(userId: string) {
    return this.repo.getUserForwardContracts(userId);
  }

  async listAllForwardContracts(limit: number = 30) {
    return this.repo.listAllForwardContracts(limit);
  }

  async settleForwardContract(_contractId: string): Promise<{ contract: FxForwardContract; refundWld: number }> {
    // No direct balance, reserve or margin writes without an authoritative ledger receipt.
    throw new ServiceUnavailableException('FX financial operations are unavailable until ledger-backed settlement is verified.');
  }

  async getEarlyWarningStatus() {
    const currentSpotRate = await this.repo.getLatestRate();
    return this.repo.getEarlyWarningStatus(currentSpotRate);
  }
}
