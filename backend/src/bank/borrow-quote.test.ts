import { describe, expect, it } from 'vitest';
import { quoteNewBorrow } from './borrow-quote';

const standing = {
  credit_limit: '500000', loan_interest_bps: 450, loan_term_days: 30, active_loan: null,
};

describe('owner-scoped new loan origination quote', () => {
  it('uses PostgreSQL policy ceil interest and canonical integer strings', () => {
    expect(quoteNewBorrow(standing, '101')).toMatchObject({
      eligible: true, principalWld: '101', interestWld: '5', totalDueWld: '106',
      creditLimitWld: '500000', interestRateBps: 450, termDays: 30, binding: false,
    });
  });
  it('never coerces large WLD amounts through JavaScript Number', () => {
    const limit = '900719925474099312345678901234567890';
    const result = quoteNewBorrow({ ...standing, credit_limit: limit }, limit);
    expect(result.totalDueWld).toBe((BigInt(limit) + (BigInt(limit) * 450n + 9999n) / 10000n).toString());
  });
  it.each(['0', '-10', '1.5', '01', '1e5', 'Infinity', ' 100', '1'.repeat(101)])('rejects noncanonical amount %s', (amount) => {
    expect(() => quoteNewBorrow(standing, amount)).toThrow();
  });
  it('rejects over-limit principal and missing authoritative policy', () => {
    expect(() => quoteNewBorrow(standing, '500001')).toThrow();
    expect(() => quoteNewBorrow({ ...standing, loan_interest_bps: Number.NaN }, '100')).toThrow();
    expect(() => quoteNewBorrow(null, '100')).toThrow();
  });
  it('refuses to offer a new loan when another loan is outstanding', () => {
    expect(quoteNewBorrow({ ...standing, active_loan: { loan_id: 'opaque' } }, '100')).toMatchObject({
      eligible: false, reason: 'ACTIVE_LOAN', binding: false,
    });
  });
  it('returns an honest no-credit state for zero borrowing limit', () => {
    expect(quoteNewBorrow({ ...standing, credit_limit: '0' }, '100')).toMatchObject({
      eligible: false, reason: 'NO_CREDIT', binding: false,
    });
  });
});
