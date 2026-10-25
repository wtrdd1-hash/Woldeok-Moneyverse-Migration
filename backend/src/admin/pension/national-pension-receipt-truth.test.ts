import { describe, expect, it, vi } from 'vitest';
import { NationalPensionRepository } from './national-pension.repository';
import { NationalPensionService } from './national-pension.service';

const row = {
  id: 'receipt-1', account_id: 'account-1', user_id: 'owner-1',
  payout_amount_wld: '900719925474099312345', snapshot_accumulated_wld: '900719925474099312345',
  created_at: '2026-10-15T01:00:00Z',
};

describe('national pension historical payout receipts', () => {
  it('preserves the original exact amount and explicitly marks unjournaled history as unverified', async () => {
    const listPayoutLogs = vi.fn().mockResolvedValue([row]);
    const service = new NationalPensionService({ listPayoutLogs } as unknown as NationalPensionRepository);
    expect(await service.listPayoutLogs('owner-1')).toEqual([{
      ...row, ledgerVerification: 'UNVERIFIED_LEDGER', ledgerTransactionId: null,
    }]);
    expect(listPayoutLogs).toHaveBeenCalledWith('owner-1', 20);
  });

  it('does not misreport database failures as an empty history', async () => {
    const service = new NationalPensionService({ listPayoutLogs: vi.fn().mockRejectedValue(new Error('database unavailable')) } as unknown as NationalPensionRepository);
    await expect(service.listPayoutLogs('owner-1')).rejects.toThrow('database unavailable');
  });
  it('returns an explicit 503 when the app role cannot read pension history', async () => {
    const error = Object.assign(new Error('permission denied for table national_pension_payout_logs'), { code: '42501' });
    const service = new NationalPensionService({ listPayoutLogs: vi.fn().mockRejectedValue(error) } as unknown as NationalPensionRepository);
    await expect(service.listPayoutLogs('owner-1')).rejects.toMatchObject({ status: 503 });
  });
  it('uses a bounded owner predicate for historical payouts without writes', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    const repo = new NationalPensionRepository({ query } as never);
    expect(await repo.listPayoutLogs('owner-1', 20)).toEqual([row]);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id = $1'), ['owner-1', 20]);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
