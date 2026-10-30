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


describe('P1 pension annual rate truth #1910', () => {
  it('does not publish an uncertified annual yield from unrelated configuration', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ total_aum: '50000', total_subscribers: '1', total_receivers: '1', total_pension_paid: '0' }] })
      .mockResolvedValueOnce({ rows: [{ balance_wld: '25000000' }] });
    const repo = new NationalPensionRepository({ query } as never);
    const result = await repo.getOverview();
    expect(result.benchmarkAnnualPayoutRate).toBeNull();
    expect(result.annualPayoutRateCertified).toBe(false);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls.flat().join(' ')).not.toContain('benchmark_annual_payout_rate_bps');
  });

  it('exposes the 700.8% nominal annual mismatch without floating-point money math', () => {
    const principal = 50000n;
    const hourly = BigInt(pensionHourlyPayout(principal.toString(), 8));
    expect(hourly).toBe(40n);
    expect(hourly * 8760n).toBe(350400n);
    expect(hourly * 8760n * 10000n / principal).toBe(70080n); // 700.8% in bps
    for (const [amount, bps] of [[100000n, 9], [500000n, 10], [2000000n, 11], [10000000n, 12]] as const) {
      const perHour = BigInt(pensionHourlyPayout(amount.toString(), bps));
      expect(perHour).toBe(amount * BigInt(bps) / 10000n);
      expect(perHour * 8760n * 3n).toBe(amount * BigInt(bps) / 10000n * 26280n);
    }
    expect(BigInt(pensionHourlyPayout('1', 8))).toBe(1n); // min-1 rounding amplifies small principals
  });
});
