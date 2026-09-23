import { BadRequestException, Injectable } from '@nestjs/common';
import { TreasuryOverview, TreasuryRepository } from './treasury.repository';

export class TreasuryInputError extends BadRequestException {}

@Injectable()
export class TreasuryService {
  constructor(private readonly repository: TreasuryRepository) {}

  async getOverview(): Promise<TreasuryOverview> {
    return this.repository.getOverview();
  }

  getTaxRates() {
    return this.repository.getTaxRates();
  }

  getBudgets() {
    return this.repository.getBudgets();
  }

  getRevenue() {
    return this.repository.getRevenue();
  }

  getExpenditure() {
    return this.repository.getExpenditure();
  }

  getReconciliation() {
    return this.repository.getReconciliation();
  }

  async listTransactions(limit = 30, cursor?: string) {
    return this.repository.listTransactions(limit, cursor);
  }

  async injectFunds(adminId: string, vaultCode: string, amountWld: string, reason: string) {
    this.validateInputs(vaultCode, amountWld, reason);
    try {
      return await this.repository.injectFunds(adminId, vaultCode, amountWld, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  async absorbFunds(adminId: string, vaultCode: string, amountWld: string, reason: string) {
    this.validateInputs(vaultCode, amountWld, reason);
    try {
      return await this.repository.absorbFunds(adminId, vaultCode, amountWld, reason);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new TreasuryInputError(msg);
    }
  }

  private validateInputs(vaultCode: string, amountWld: string, reason: string) {
    if (!vaultCode || typeof vaultCode !== 'string' || vaultCode.trim().length === 0) {
      throw new TreasuryInputError('금고 코드(vaultCode)를 올바르게 지정해 주세요.');
    }
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new TreasuryInputError('금액은 0보다 큰 정수 WLD여야 합니다.');
    }
    if (!reason || typeof reason !== 'string' || reason.trim().length < 10) {
      throw new TreasuryInputError('국고 회계 감사 사유는 최소 10자 이상 입력해야 합니다.');
    }
  }
}
