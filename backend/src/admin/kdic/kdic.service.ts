import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { KdicRepository, UserInsuredCoverage } from './kdic.repository';
import type { DiscordAlertService } from '../../discord/discord-alert.service';

@Injectable()
export class KdicService {
  constructor(private readonly repo: KdicRepository, _discordAlertService?: DiscordAlertService) {}

  async getFundOverview() {
    const [fund, institutions, recentPremiums, recentPayouts] = await Promise.all([
      this.repo.getFundStatus(),
      this.repo.getInsuredInstitutions(),
      this.repo.listRecentPremiums(10),
      this.repo.listRecentPayouts(10),
    ]);

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

  // The old handlers altered fund balances without a database-owned, replay-safe ledger contract.
  // No administrator or caller may re-enable them until an atomic settlement function is verified.
  async assessQuarterlyPremiums(_adminId: string): Promise<{ totalCollectedWld: number; recordsCount: number }> {
    throw new ServiceUnavailableException('KDIC financial settlements are temporarily unavailable');
  }

  async injectEmergencyLiquidity(_institutionId: string, _amountWld: number, _adminId: string): Promise<{ newBisRatioPct: number; newFundWld: number }> {
    throw new ServiceUnavailableException('KDIC financial settlements are temporarily unavailable');
  }

  async executeDepositPayout(_institutionId: string, _userId: string, _adminId: string): Promise<{ payoutAmountWld: number; newFundWld: number }> {
    throw new ServiceUnavailableException('KDIC financial settlements are temporarily unavailable');
  }
}
