import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { KdicRepository, UserInsuredCoverage } from './kdic.repository';
import { rejectUnverifiedKdicSettlement } from './kdic-ledger-hold';
import type { DiscordAlertService } from '../../discord/discord-alert.service';

@Injectable()
export class KdicService {
  constructor(private readonly repo: KdicRepository, _discordAlertService?: DiscordAlertService) {}

  async getLedgerIntegrity() {
    const row = await this.repo.getLedgerIntegrity().catch(() => {
      throw new ServiceUnavailableException({ code: 'KDIC_LEDGER_DIAGNOSTICS_UNAVAILABLE' });
    });
    const fields = [
      'transactionCount', 'postingCount', 'accountCount', 'unbalancedTransactionCount',
      'mismatchedAccountCount', 'absoluteDifferenceWld', 'unlinkedTreasuryCount', 'treasuryRecordCount',
    ] as const;
    for (const field of fields) {
      if (typeof row[field] !== 'string' || !/^(0|[1-9][0-9]{0,63})$/.test(row[field])) {
        throw new ServiceUnavailableException({ code: 'KDIC_LEDGER_DIAGNOSTICS_UNAVAILABLE' });
      }
    }
    if (BigInt(row.mismatchedAccountCount) > BigInt(row.accountCount) ||
        BigInt(row.unlinkedTreasuryCount) > BigInt(row.treasuryRecordCount) ||
        !Number.isFinite(Date.parse(row.checkedAt))) {
      throw new ServiceUnavailableException({ code: 'KDIC_LEDGER_DIAGNOSTICS_UNAVAILABLE' });
    }
    const balanced = row.accountCount !== '0' && row.mismatchedAccountCount === '0' &&
      row.unbalancedTransactionCount === '0' && row.absoluteDifferenceWld === '0';
    const blockers: string[] = ['KDIC_WRITERS_UNVERIFIED'];
    if (row.unlinkedTreasuryCount !== '0') blockers.push('TREASURY_ROWS_WITHOUT_CANONICAL_LINK');
    if (row.unbalancedTransactionCount !== '0') blockers.push('UNBALANCED_JOURNAL');
    if (row.mismatchedAccountCount !== '0' || row.absoluteDifferenceWld !== '0') blockers.push('BALANCE_PROJECTION_MISMATCH');
    return { ...row, numericBalanced: balanced, settlementReady: false as const, state: 'BLOCKED' as const, blockers };
  }

  async getFundOverview(adminActor?: string) {
    const [fund, institutions] = await Promise.all([
      this.repo.getFundStatus(),
      this.repo.getInsuredInstitutions(),
    ]);
    // Public visitors never query member-identifying KDIC premium or payout records.
    const [recentPremiums, recentPayouts] = adminActor
      ? await Promise.all([
          this.repo.listRecentPremiums(10, adminActor),
          this.repo.listRecentPayouts(10, adminActor),
        ])
      : [[], []];

    const totalDeposits = institutions.reduce((sum, i) => sum + i.totalDepositsWld, 0);
    const averageBisRatio = institutions.length > 0 
      ? Math.round((institutions.reduce((sum, i) => sum + i.bisRatioPct, 0) / institutions.length) * 10) / 10 
      : 14.0;

    return {
      fund,
      institutions,
      summary: {
        totalInsuredInstitutions: institutions.length,
        totalDepositsWld: totalDeposits,
        averageBisRatioPct: averageBisRatio,
        reserveCoverageRatioPct: totalDeposits > 0 ? Math.round((fund.totalFundWld / totalDeposits) * 1000) / 10 : 40.0,
      },
      recentPremiums,
      recentPayouts,
    };
  }

  async getUserCoverage(userId: string): Promise<UserInsuredCoverage> {
    return this.repo.getUserInsuredCoverage(userId);
  }

  async assessQuarterlyPremiums(adminId: string): Promise<{ totalCollectedWld: number; recordsCount: number }> {
    rejectUnverifiedKdicSettlement();
    return this.repo.assessQuarterlyPremiums(adminId);
  }

  async injectEmergencyLiquidity(
    institutionId: string,
    amountWld: number,
    adminId: string,
  ): Promise<{ newBisRatioPct: number; newFundWld: number }> {
    rejectUnverifiedKdicSettlement();
    return this.repo.injectEmergencyLiquidity(institutionId, amountWld, adminId);
  }

  async executeDepositPayout(
    institutionId: string,
    userId: string,
    adminId: string,
  ): Promise<{ payoutAmountWld: number; newFundWld: number }> {
    rejectUnverifiedKdicSettlement();
    return this.repo.executeDepositPayout(institutionId, userId, adminId);
  }

}
