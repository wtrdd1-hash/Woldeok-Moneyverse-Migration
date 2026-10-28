import { describe, expect, it, vi } from 'vitest';
import { TreasuryRepository } from './treasury.repository';
import { TreasuryService } from './treasury.service';

describe('v1420 canonical citizen dividend settlement', () => {
  const actor = '00000000-0000-4000-8000-000000000001';
  const key = '00000000-0000-4000-8000-000000000002';
  it('requires stable request key before any treasury payout', async () => {
    const query = vi.fn();
    const repo = { disburseCitizenDividend: vi.fn() };
    const service = new TreasuryService(repo as never);
    await expect(service.disburseCitizenDividend(actor, '1000', '국고 시민배당 원장 정합성 확인 테스트')).rejects.toThrow();
    expect(repo.disburseCitizenDividend).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });
  it('calls only the key-bound canonical SQL payout and retains its receipt', async () => {
    const receipt = { success: true, ledger_transaction_id: 'txn', beneficiary_count: 2 };
    const query = vi.fn().mockResolvedValue({ rows: [{ result: receipt }] });
    const repo = new TreasuryRepository({ query } as never);
    expect(await repo.disburseCitizenDividend(actor, '1000', '국고 정식 배당 지급 증거 기록', key)).toEqual(receipt);
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/treasury_disburse_citizen_dividend\(\$1::uuid,\s*\$2::text,\s*\$3::text,\s*\$4::uuid\)/),
      [actor, '1000', '국고 정식 배당 지급 증거 기록', key],
    );
  });
});
