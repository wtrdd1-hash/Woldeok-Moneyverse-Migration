import { describe, expect, it, vi } from 'vitest';
import { TreasuryInputError, TreasuryService } from './treasury.service';
import {
  AUTHORITATIVE_BUDGET_ENVELOPES,
  AUTHORITATIVE_TAX_RATES,
} from './treasury.repository';
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
    distributeBudgetRule: vi.fn(),
    executeMarketBuybackBurn: vi.fn(),
    getCitizenTaxReceipt: vi.fn(),
    exportLedgerCsv: vi.fn(),
    executeWealthTax: vi.fn(),
    getWealthTaxAssessments: vi.fn(),
    createImmutableBackupSnapshot: vi.fn(),
    getBackupStatus: vi.fn(),
  } as unknown as TreasuryRepository;

  const service = new TreasuryService(mockRepo);

  it('delegates getTaxRates to repository', () => {
    const mockRates = AUTHORITATIVE_TAX_RATES.slice(0, 1);
    vi.mocked(mockRepo.getTaxRates).mockReturnValueOnce(mockRates);

    const rates = service.getTaxRates();
    expect(rates).toEqual(mockRates);
    expect(mockRepo.getTaxRates).toHaveBeenCalled();
  });

  it('delegates getBudgets to repository', async () => {
    const mockBudgets = AUTHORITATIVE_BUDGET_ENVELOPES.slice(0, 1);
    vi.mocked(mockRepo.getBudgets).mockResolvedValueOnce(mockBudgets);

    const budgets = await service.getBudgets();
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
    const mockOverview: Awaited<ReturnType<TreasuryRepository['getOverview']>> = {
      vaults: [],
      total_treasury_wld: '1000000',
      total_circulating_wld: '500000',
      reserve_ratio_pct: 200,
      available_wld: '800000',
      reserve_wld: '200000',
      coverage_days: 80,
      tax_rates: [],
      budgets: [],
      reconciliation: {
        status: 'RECONCILED',
        total_vaults_balance_wld: '1000000',
        total_ledger_net_flow_wld: '1000000',
        discrepancy_amount_wld: '0',
        last_reconciled_at: '2026-09-25T00:00:00.000Z',
      },
      stats_24h: {
        injected_wld: '0',
        absorbed_wld: '0',
        stock_halt_funded_wld: '0',
        recirculated_wld: '0',
      },
    };
    vi.mocked(mockRepo.getOverview).mockResolvedValueOnce(mockOverview);

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

  it('delegates distributeBudgetRule to repository when inputs are valid', async () => {
    vi.mocked((mockRepo as any).distributeBudgetRule).mockResolvedValueOnce({ success: true, total_allocated_wld: '1000000' });

    const res = await service.distributeBudgetRule(
      '00000000-0000-0000-0000-000000000001',
      '1000000',
      '2026년 4분기 4분할 헌법적 예산 배정 (복지/인프라/비축/소각)',
    );

    expect(res).toEqual({ success: true, total_allocated_wld: '1000000' });
    expect((mockRepo as any).distributeBudgetRule).toHaveBeenCalled();
  });

  it('rejects distributeBudgetRule with invalid amount or short reason', async () => {
    await expect(
      service.distributeBudgetRule('00000000-0000-0000-0000-000000000001', '0', '10자 이상의 정상 사유입니다'),
    ).rejects.toThrow(TreasuryInputError);

    await expect(
      service.distributeBudgetRule('00000000-0000-0000-0000-000000000001', '1000', 'short'),
    ).rejects.toThrow(TreasuryInputError);
  });

  it('delegates executeMarketBuybackBurn to repository', async () => {
    vi.mocked((mockRepo as any).executeMarketBuybackBurn).mockResolvedValueOnce({
      success: true,
      item_name: '고대 드래곤 투구',
      price_wld: '50000',
    });

    const res = await service.executeMarketBuybackBurn(
      '00000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000002',
      '장터 덤핑 매물 공개시장 역매수 영구소각 집행',
    );

    expect(res).toEqual({ success: true, item_name: '고대 드래곤 투구', price_wld: '50000' });
  });

  it('delegates exportLedgerCsv to repository', async () => {
    vi.mocked((mockRepo as any).exportLedgerCsv).mockResolvedValueOnce('Timestamp,Vault,TxType\n2026,MAIN,INJECTION');

    const csv = await service.exportLedgerCsv();
    expect(csv).toContain('Timestamp,Vault,TxType');
  });

  it('delegates executeWealthTax to repository', async () => {
    vi.mocked((mockRepo as any).executeWealthTax).mockResolvedValueOnce({
      success: true,
      assessed_count: 6,
      total_collected_wld: '6069',
    });

    const res = await service.executeWealthTax(
      '00000000-0000-0000-0000-000000000001',
      '고액 자산가 누진적 부유세 정기 과세 집행',
    );

    expect(res).toEqual({ success: true, assessed_count: 6, total_collected_wld: '6069' });
    expect((mockRepo as any).executeWealthTax).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000001',
      '고액 자산가 누진적 부유세 정기 과세 집행',
    );
  });

  it('delegates getWealthTaxAssessments to repository', async () => {
    vi.mocked((mockRepo as any).getWealthTaxAssessments).mockResolvedValueOnce([]);

    const res = await service.getWealthTaxAssessments();
    expect(res).toEqual([]);
    expect((mockRepo as any).getWealthTaxAssessments).toHaveBeenCalled();
  });

  it('delegates createBackupSnapshot to repository', async () => {
    const mockSnapshot = {
      snapshot_id: 'SNAP-20261001-ABCD1234',
      merkle_root_hash: 'abcdef1234567890',
      provider: 'CLOUDFLARE_R2_FREE',
      free_tier_status: 'FREE_TIER_COMPLIANT_ZERO_COST',
      payload_bytes: 1024,
      vault_balances: {},
      total_m0_wld: '1000000',
      created_at: '2026-10-01T00:00:00.000Z',
    };
    vi.mocked(mockRepo.createImmutableBackupSnapshot).mockResolvedValueOnce(mockSnapshot);

    const res = await service.createBackupSnapshot('00000000-0000-0000-0000-000000000001', 'CLOUDFLARE_R2_FREE');
    expect(res).toEqual(mockSnapshot);
    expect(mockRepo.createImmutableBackupSnapshot).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000001',
      'CLOUDFLARE_R2_FREE',
    );
  });

  it('delegates getBackupStatus to repository', async () => {
    const mockStatus = {
      latest_snapshot_id: 'SNAP-20261001-IMMUTABLE-LEDGER',
      provider: 'Cloudflare R2 & Google Drive Free Tier',
      free_tier_quota: '10.0 GB 무료 제공 중 1.2 MB 사용',
      stored_snapshots_count: 54,
      last_verified_at: '2026-10-01T00:00:00.000Z',
    };
    vi.mocked(mockRepo.getBackupStatus).mockResolvedValueOnce(mockStatus);

    const res = await service.getBackupStatus();
    expect(res).toEqual(mockStatus);
    expect(mockRepo.getBackupStatus).toHaveBeenCalled();
  });
});
