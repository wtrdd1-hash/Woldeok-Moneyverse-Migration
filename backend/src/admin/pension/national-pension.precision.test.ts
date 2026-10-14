import { describe, expect, it, vi } from 'vitest';
import { pensionHourlyPayout, pensionRefundSplit, NationalPensionRepository } from './national-pension.repository';
import { NationalPensionService } from './national-pension.service';

describe('pension monetary exactness', () => {
  it('splits a 90-digit pension principal into exact 95/5 integer amounts', () => {
    const amount = '9'.repeat(90);
    const { refundAmountWld, welfareContributionWld } = pensionRefundSplit(amount);
    expect(BigInt(refundAmountWld) + BigInt(welfareContributionWld)).toBe(BigInt(amount));
    expect(refundAmountWld).toBe((BigInt(amount) * 95n / 100n).toString());
    expect(welfareContributionWld).toBe((BigInt(amount) - BigInt(refundAmountWld)).toString());
  });

  it('computes hourly payouts for large savings without Number roundoff', () => {
    const amount = '9'.repeat(90);
    expect(pensionHourlyPayout(amount, 12)).toBe((BigInt(amount) * 12n / 10000n).toString());
    expect(pensionHourlyPayout('0', 8)).toBe('1');
  });

  it('rejects unsafe JSON numbers before sending any amount to the repository', async () => {
    const contribute = vi.fn().mockResolvedValue({ account: { accumulated_contribution_wld: '1' } });
    const service = new NationalPensionService({ contribute } as unknown as NationalPensionRepository);
    await expect(service.contribute('user', Number.MAX_SAFE_INTEGER + 2)).rejects.toThrow();
    expect(contribute).not.toHaveBeenCalled();
    await service.contribute('user', '9007199254740993123');
    expect(contribute).toHaveBeenCalledWith('user', '9007199254740993123', undefined);
  });
});
