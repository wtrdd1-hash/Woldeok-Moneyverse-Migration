import { describe, expect, it, vi } from 'vitest';
import { TreasuryInputError, TreasuryService } from './treasury.service';
import type { TreasuryRepository } from './treasury.repository';

describe('TreasuryService', () => {
  const mockRepo = {
    getOverview: vi.fn(),
    getTaxRates: vi.fn(),
    listTransactions: vi.fn(),
    injectFunds: vi.fn(),
    absorbFunds: vi.fn(),
  } as unknown as TreasuryRepository;

  const service = new TreasuryService(mockRepo);

  it('delegates getTaxRates to repository', () => {
    const mockRates = [
      { id: 'tax_user_transfer', category: 'User Transfers', current_rate_pct: 0 }
    ];
    vi.mocked(mockRepo.getTaxRates).mockReturnValueOnce(mockRates as any);

    const rates = service.getTaxRates();
    expect(rates).toEqual(mockRates);
    expect(mockRepo.getTaxRates).toHaveBeenCalled();
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
    vi.mocked(mockRepo.getOverview).mockResolvedValueOnce(mockOverview as any);

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
