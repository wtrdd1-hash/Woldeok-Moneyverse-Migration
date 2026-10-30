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
import { BOND_SUBSCRIPTION_HOLD_REASON } from './bond-subscription-hold';
import { BOND_COUPON_SETTLEMENT_HOLD_REASON } from './bond-coupon-settlement-hold';

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

  async subscribeBond(_userId: string, _bondId: string, _units: number) {
    // Never signal success or notify Discord for an unposted financial debit.
    throw new ServiceUnavailableException(BOND_SUBSCRIPTION_HOLD_REASON);
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
