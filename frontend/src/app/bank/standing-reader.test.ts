import { describe, expect, it } from 'vitest';
import { readBankStanding } from './standing-reader';

/**
 * Production regression 2026-11-25 (digest 958076666): signed-in /bank threw
 * "Cannot convert undefined to a BigInt" because Spring wraps the standing in
 * `{ success, data }` with renamed fields and invented defaults (A1, 5000000,
 * 4.50%). Only the database function's own object is trusted.
 */
const DB = {
  cash_balance: '1200', bank_balance: '800', daily_interest_rate_bps: 1, daily_interest_rate_pct: 0.01,
  annual_yield_pct: 3.72, unclaimed_interest: '4', credit_grade: 'B2', credit_limit: '300000',
  loan_interest_bps: 50, loan_term_days: 7, loan_minimum_repayment: '0', active_loan: null,
  bonds: [{ principal_amount: '100' }],
};

describe('readBankStanding', () => {
  it('accepts the bank_get_my_standing object directly', () => {
    expect(readBankStanding(DB)).toEqual(DB);
  });
  it('accepts the object passed through by Spring as data.canonical', () => {
    expect(readBankStanding({ success: true, data: { cashBalanceWld: '1200', canonical: DB } })).toEqual(DB);
  });
  it('rejects the Spring camelCase body without the canonical object (no invented grade or limit)', () => {
    expect(readBankStanding({ success: true, data: { cashBalanceWld: '1200', depositBalanceWld: '800', creditGrade: 'A1', creditLimitWld: '5000000' } })).toBeNull();
  });
  it.each([
    ['missing cash', { ...DB, cash_balance: undefined }],
    ['decimal bank', { ...DB, bank_balance: '1.5' }],
    ['bond without principal', { ...DB, bonds: [{}] }],
    ['loan without outstanding amount', { ...DB, active_loan: { principal_amount: '1' } }],
    ['null', null],
  ])('returns null for %s instead of crashing', (_l, raw) => {
    expect(readBankStanding(raw)).toBeNull();
  });
});
