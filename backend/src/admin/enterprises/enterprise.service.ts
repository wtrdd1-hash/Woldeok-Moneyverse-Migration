import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  EnterpriseRepository,
  type PrivateEnterpriseRow,
  type StateEnterpriseDividendLogRow,
  type StateEnterpriseRow,
  type StateHoldingOverview,
} from './enterprise.repository';

@Injectable()
export class EnterpriseService {
  constructor(
    private readonly repository: EnterpriseRepository,
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

  async harvestSoeDividends(_adminId?: string) {
    // Never call the legacy non-atomic remittance or report a synthetic success.
    throw new ServiceUnavailableException({
      code: 'SOE_DIVIDEND_LEDGER_UNAVAILABLE',
      message: 'SOE dividend remittance is suspended pending atomic ledger verification',
    });
  }

  async updateSoeStatus(code: string, status: string, dividendRateBps?: number): Promise<boolean> {
    const validStatuses = ['ACTIVE', 'PAUSED', 'PRIVATIZING'];
    if (!validStatuses.includes(status)) {
      throw new Error(`유효하지 않은 공기업 운영 상태입니다: ${status}`);
    }
    return this.repository.updateSoeStatus(code, status, dividendRateBps);
  }
}
