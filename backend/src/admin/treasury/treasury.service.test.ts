import { describe, expect, it, vi } from 'vitest';
import { TreasuryInputError, TreasuryService } from './treasury.service';
import type { TreasuryRepository } from './treasury.repository';

describe('TreasuryService', () => {
  const mockRepo = {
    getOverview: vi.fn(),
    listTransactions: vi.fn(),
    injectFunds: vi.fn(),
    absorbFunds: vi.fn(),
  } as unknown as TreasuryRepository;

  const service = new TreasuryService(mockRepo);

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
