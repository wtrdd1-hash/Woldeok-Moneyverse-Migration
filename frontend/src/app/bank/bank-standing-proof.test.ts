import { describe, expect, it } from 'vitest';
import { parseVerifiedBankStanding } from './bank-standing-proof';

export const bankStandingFixture = {
  cash_balance: '900719925474099312345678901', bank_balance: '42',
  daily_interest_rate_bps: 10, daily_interest_rate_pct: 0.1, annual_yield_pct: 44.03,
  unclaimed_interest: '5', credit_grade: 'A', credit_limit: '1000',
  loan_interest_bps: 120, loan_term_days: 30, loan_minimum_repayment: '1',
  active_loan: null,
  bonds: [{
    id: '11111111-1111-4111-8111-111111111111', bond_code: 'BOND_7D',
    bond_name: 'Seven-day WLD', principal_amount: '9007199254740993',
    yield_bps: 100, maturity_amount: '9007199254741000',
    purchased_at: '2026-11-01T00:00:00+00:00', maturity_at: '2026-11-08T00:00:00+00:00',
    is_matured: false, status: 'holding',
  }],
};

const loan = {
  loan_id: '22222222-2222-4222-8222-222222222222',
  principal_amount: '100', interest_amount: '2', outstanding_amount: '102',
  issued_at: '2026-11-01T00:00:00+00:00', status: 'active',
  maturity_at: '2026-12-01T00:00:00+00:00', minimum_repayment: '1', credit_grade: 'A',
};

describe('verified owner bank standing (migration 194)', () => {
  it('preserves exact large WLD and the owner-scoped bond and loan read model', () => {
    const parsed = parseVerifiedBankStanding({ ...bankStandingFixture, active_loan: loan });
    expect(parsed?.cash_balance).toBe(bankStandingFixture.cash_balance);
    expect(parsed?.bonds[0]?.principal_amount).toBe('9007199254740993');
    expect(parsed?.active_loan?.outstanding_amount).toBe('102');
    expect(parsed).not.toHaveProperty('password');
  });

  it.each([null, [], {}, { ...bankStandingFixture, cash_balance: 'NaN' },
    { ...bankStandingFixture, bank_balance: 12 },
    { ...bankStandingFixture, unclaimed_interest: '-1' },
    { ...bankStandingFixture, credit_limit: '01' },
    { ...bankStandingFixture, loan_minimum_repayment: '1e9' },
    { ...bankStandingFixture, daily_interest_rate_pct: Number.POSITIVE_INFINITY },
    { ...bankStandingFixture, loan_term_days: -1 },
    { ...bankStandingFixture, bonds: 'not a list' },
    { ...bankStandingFixture, bonds: [{ ...bankStandingFixture.bonds[0], principal_amount: 'bad' }] },
    { ...bankStandingFixture, bonds: [bankStandingFixture.bonds[0], bankStandingFixture.bonds[0]] },
    { ...bankStandingFixture, active_loan: { ...loan, outstanding_amount: 'bad' } },
    { ...bankStandingFixture, active_loan: { ...loan, loan_id: 'not-uuid' } },
  ])('rejects unverified success-shaped source %#', (value) => {
    expect(parseVerifiedBankStanding(value)).toBeNull();
  });

  it('does not coerce missing loan or bond fields into an invented zero', () => {
    expect(parseVerifiedBankStanding({ ...bankStandingFixture, active_loan: undefined })).toBeNull();
    expect(parseVerifiedBankStanding({ ...bankStandingFixture, bonds: undefined })).toBeNull();
  });
});
