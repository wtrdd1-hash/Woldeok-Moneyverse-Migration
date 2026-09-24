import { describe, expect, it, vi } from 'vitest';
import { TreasuryInputError, TreasuryService } from './treasury.service';
import type { TreasuryRepository } from './treasury.repository';

describe('TreasuryService', () => {
  const mockRepo = {
    getOverview: vi.fn(),
    getTaxRates: vi.fn(),
    getBudgets: vi.fn(),
    getRevenue: vi.fn(),
    getExpenditure: vi.fn(),
    getReconciliation: vi.fn(),
    listTransactions: vi.fn(),
    injectFunds: vi.fn(),
    absorbFunds: vi.fn(),
  } as unknown as TreasuryRepository;

  const service = new TreasuryService(mockRepo);

  it('delegates getTaxRates to repository', () => {
    const mockRates = [
      { id: 'tax_user_transfer', category: 'User Transfers', current_rate_pct: 0 }
    ];
    vi.mocked(mockRepo.getTaxRates).mockReturnValueOnce(
      mockRates as unknown as ReturnType<TreasuryRepository['getTaxRates']>,
    );

    const rates = service.getTaxRates();
    expect(rates).toEqual(mockRates);
    expect(mockRepo.getTaxRates).toHaveBeenCalled();
  });

  it('delegates getBudgets to repository', () => {
    const mockBudgets = [
      { budget_id: 'BUDGET_ESSENTIAL_REFUND', category: 'ESSENTIAL_REFUND', priority: 1 }
    ];
    vi.mocked(mockRepo.getBudgets).mockReturnValueOnce(
      mockBudgets as unknown as ReturnType<TreasuryRepository['getBudgets']>,
    );

    const budgets = service.getBudgets();
    expect(budgets).toEqual(mockBudgets);
    expect(mockRepo.getBudgets).toHaveBeenCalled();
  });

  it('delegates getRevenue to repository', async () => {
    const mockRevenue = { items: [], total_24h_wld: '0', total_7d_wld: '0', total_30d_wld: '0' };
    vi.mocked(mockRepo.getRevenue).mockResolvedValueOnce(mockRevenue);

    const res = await service.getRevenue();
    expect(res).toEqual(mockRevenue);
    expect(mockRepo.getRevenue).toHaveBeenCalled();
  });

  it('delegates getExpenditure to repository', async () => {
    const mockExpenditure = { items: [], total_24h_wld: '0', total_7d_wld: '0', total_30d_wld: '0' };
    vi.mocked(mockRepo.getExpenditure).mockResolvedValueOnce(mockExpenditure);

    const res = await service.getExpenditure();
    expect(res).toEqual(mockExpenditure);
    expect(mockRepo.getExpenditure).toHaveBeenCalled();
  });

  it('delegates getReconciliation to repository', async () => {
    const mockRecon = {
      status: 'RECONCILED' as const,
      total_vaults_balance_wld: '100',
      total_ledger_net_flow_wld: '100',
      discrepancy_amount_wld: '0',
      last_reconciled_at: '2026-09-24T00:00:00.000Z',
    };
    vi.mocked(mockRepo.getReconciliation).mockResolvedValueOnce(mockRecon);

    const res = await service.getReconciliation();
    expect(res).toEqual(mockRecon);
    expect(mockRepo.getReconciliation).toHaveBeenCalled();
  });

  it('delegates getOverview to repository and returns liquidity and tax schedule fields', async () => {
    const mockOverview = {
      vaults: [],
      total_treasury_wld: '1000000',
      total_circulating_wld: '500000',
      reserve_ratio_pct: 200,
      available_wld: '800000',
      reserve_wld: '200000',
      coverage_days: 80,
      tax_rates: [],
      stats_24h: { injected_wld: '0', absorbed_wld: '0', recirculated_fees_wld: '0' },
    };
    vi.mocked(mockRepo.getOverview).mockResolvedValueOnce(
      mockOverview as unknown as Awaited<ReturnType<TreasuryRepository['getOverview']>>,
    );

    const result = await service.getOverview();
    expect(result).toEqual(mockOverview);
    expect(result.coverage_days).toBe(80);
    expect(result.available_wld).toBe('800000');
  });

  it('rejects injection if reason is shorter than 10 characters', async () => {
    await expect(
      service.injectFunds('00000000-0000-0000-0000-000000000001', 'VAULT_MAIN', '1000', 'short'),
    ).rejects.toThrow(TreasuryInputError);
  });

  it('rejects injection if amount is not positive integer', async () => {
    await expect(
      service.injectFunds('00000000-0000-0000-0000-000000000001', 'VAULT_MAIN', '0', '정상적인 감사 사유를 입력합니다.'),
    ).rejects.toThrow(TreasuryInputError);

    await expect(
      service.injectFunds('00000000-0000-0000-0000-000000000001', 'VAULT_MAIN', '-100', '정상적인 감사 사유를 입력합니다.'),
    ).rejects.toThrow(TreasuryInputError);
  });

  it('rejects injection if vaultCode is empty', async () => {
    await expect(
      service.injectFunds('00000000-0000-0000-0000-000000000001', '', '1000', '정상적인 감사 사유를 입력합니다.'),
    ).rejects.toThrow(TreasuryInputError);
  });

  it('calls repository when parameters are valid', async () => {
    vi.mocked(mockRepo.injectFunds).mockResolvedValueOnce({ success: true });

    const res = await service.injectFunds(
      '00000000-0000-0000-0000-000000000001',
      'VAULT_MAIN',
      '1000000',
      '충분히 긴 감사 사유를 입력합니다 (10자 이상).',
    );

    expect(res).toEqual({ success: true });
    expect(mockRepo.injectFunds).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000001',
      'VAULT_MAIN',
      '1000000',
      '충분히 긴 감사 사유를 입력합니다 (10자 이상).',
    );
  });
});
