import { describe, expect, it } from 'vitest';
import { canOfferCreditApplication, parseCreditEvidence } from './credit-evidence';

const loanId = '00000000-0000-4000-8000-000000000001';
const rung = {
  grade: 'C', minimum_account_days: 3, minimum_work_completions: 1,
  credit_limit: '10000000000000000000', interest_bps: 500,
  term_days: 30, minimum_repayment: '1000', held: true,
};
const valid = { grade: 'C', loans: [], ladder: [rung] };
const loan = {
  loan_id: loanId, principal_amount: '1000', interest_amount: '50',
  outstanding_amount: '1050', status: 'active',
  issued_at: '2026-10-30T09:00:00.000Z', repaid_at: null,
};

describe('authenticated progression credit evidence', () => {
  it('accepts verified empty loans and exact large WLD strings', () => {
    const result = parseCreditEvidence(valid);
    expect(result?.ladder[0]?.credit_limit).toBe('10000000000000000000');
    expect(canOfferCreditApplication(result)).toBe(true);
  });

  it.each([null, undefined, {}, { grade: 'C', ladder: [rung] },
    { ...valid, loans: null }, { ...valid, loans: '[]' },
    { ...valid, ladder: [{ ...rung, credit_limit: '1e8' }] },
    { ...valid, ladder: [{ ...rung, credit_limit: '-1' }] },
    { ...valid, ladder: [{ ...rung, interest_bps: Number.NaN }] },
    { ...valid, ladder: [{ ...rung, held: 'true' }] },
    { ...valid, loans: [{ ...loan, outstanding_amount: 1 }] },
    { ...valid, loans: [{ ...loan, issued_at: 'not-a-date' }] },
    { ...valid, loans: [loan, loan] },
    { ...valid, ladder: [rung, rung] },
  ])('refuses missing, malformed or duplicated source evidence (%#)', (payload) => {
    const result = parseCreditEvidence(payload);
    expect(result).toBeNull();
    expect(canOfferCreditApplication(result)).toBe(false);
  });

  it('does not offer borrowing for new grade, an active loan or an unknown loan status', () => {
    const newGrade = parseCreditEvidence({ grade: 'new', loans: [], ladder: [{ ...rung, grade: 'new', credit_limit: '0' }] });
    expect(canOfferCreditApplication(newGrade)).toBe(false);
    const active = parseCreditEvidence({ ...valid, loans: [loan] });
    expect(canOfferCreditApplication(active)).toBe(false);
    const unfamiliar = parseCreditEvidence({ ...valid, loans: [{ ...loan, status: 'written_off' }] });
    expect(unfamiliar?.loans[0]?.status).toBe('written_off');
    expect(canOfferCreditApplication(unfamiliar)).toBe(false);
  });

  it('requires a matching held policy and allows repaid historical loans', () => {
    expect(parseCreditEvidence({ ...valid, ladder: [{ ...rung, held: false }] })).toBeNull();
    expect(canOfferCreditApplication(parseCreditEvidence({ ...valid, loans: [{ ...loan, status: 'repaid', outstanding_amount: '0', repaid_at: '2026-10-31T09:00:00Z' }] }))).toBe(true);
  });
});
