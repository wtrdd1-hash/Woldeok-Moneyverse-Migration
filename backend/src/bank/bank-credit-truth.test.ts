import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { BankRepository } from './bank.repository';
import { toCreditScoreAssets } from './credit-rating.service';

const actor = '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef';

describe('Actor-derived game credit evidence (v716)', () => {
  it('fetches only the signed-in user facts; never fixed age/job/repayments', async () => {
    const seen: { sql: string; values?: readonly unknown[] }[] = [];
    const fakeDb: Queryable = {
      async query<R extends Record<string, unknown>>(sql: string, values?: readonly unknown[]) {
        seen.push({sql, values});
        return {rows: [{account_age_days: 3, job_level: 2, repayment_count: 0, overdue_count: 1} as unknown as R]};
      },
    };
    const result = await new BankRepository(fakeDb).getCreditFacts(actor);
    expect(result).toEqual({
      accountAgeDays: 3, jobLevel: 2, historicalRepaymentsCount: 0, overdueRepaymentsCount: 1,
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.values).toEqual([actor]);
    expect(seen[0]?.sql).toContain('public.virtual_bank_loan_repayments');
    expect(seen[0]?.sql).toContain('public.user_job_progress');
    expect(seen[0]?.sql).toContain('public.users');
  });

  it('fails closed if user record is missing', async () => {
    const fakeDb: Queryable = {async query<R extends Record<string, unknown>>() {return {rows: [] as R[]};}};
    await expect(new BankRepository(fakeDb).getCreditFacts(actor)).rejects.toThrow('credit profile unavailable');
  });

  it('caps exact large WLD balances only for score factor math, never rounds using Number', () => {
    expect(toCreditScoreAssets('900719925474099312345678901234567890')).toBe(75_000);
    expect(toCreditScoreAssets('1000.000')).toBe(1_000);
    expect(toCreditScoreAssets('0')).toBe(0);
    expect(() => toCreditScoreAssets('1.125')).toThrow();
    expect(() => toCreditScoreAssets(Number.MAX_SAFE_INTEGER + 10)).toThrow();
  });
});
