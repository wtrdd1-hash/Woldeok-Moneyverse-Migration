import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import {
  TreasuryBondRepository,
  type BondCouponLogRow,
  type BondHoldingRow,
  type TreasuryBondRow,
  type TreasuryBondsOverview,
} from './treasury-bond.repository';
import { DiscordAlertService } from '../../discord/discord-alert.service';
import { BOND_REPO_LOAN_HOLD_REASON } from './bond-repo-loan-hold';

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
    const res = await this.repository.subscribeBond(userId, bondId, units);
    if (this.discordAlertService) {
      this.discordAlertService.sendAdminDirectMessage({
        title: '🏛️ [국채 청약 완료]',
        color: 0x38bdf8,
        description: `유저 ${userId}가 국채(${bondId}) ${units}좌를 청약했습니다. (총액: ${res.totalPriceWld} WLD)`,
      }).catch(() => {});
    }
    return res;
  }

  async processHourlyCouponsAndMaturities() {
    const res = await this.repository.processHourlyCouponsAndMaturities();
    this.logger.log(
      `[BondCoupon] Daily coupon & maturity settled: ${res.couponsDistributedWld} WLD distributed, ${res.maturitiesRedeemedWld} WLD redeemed across ${res.holdingsProcessed} holdings.`
    );
    return res;
  }

  async createBond(params: {
    symbol: string;
    name: string;
    maturityHours: number;
    annualCouponRateBps: number;
    parValueWld: string;
    totalIssuedUnits: number;
    description?: string | undefined;
  }) {
    return this.repository.createBond(params);
  }
  async updateBondStatus(bondId: string, status: string, annualCouponRateBps?: number) {
    return this.repository.updateBondStatus(bondId, status, annualCouponRateBps);
  }

  async listUserRepoLoans(userId: string) {
    return this.repository.listUserRepoLoans(userId);
  }

  async createRepoLoan(_userId: string, _holdingId: string): Promise<never> {
    // Internal callers must not bypass the HTTP hold and mint unposted WLD.
    throw new ServiceUnavailableException(BOND_REPO_LOAN_HOLD_REASON);
  }

  async repayRepoLoan(_userId: string, _loanId: string): Promise<never> {
    // Repayment must be atomic with the principal debit and collateral release.
    throw new ServiceUnavailableException(BOND_REPO_LOAN_HOLD_REASON);
  }

  async toggleAutoRollover(userId: string, holdingId: string, enabled: boolean) {
    return this.repository.toggleAutoRollover(userId, holdingId, enabled);
  }
}
