import { describe, expect, it } from 'vitest';
import { validateAdminBankResponse } from './bank-evidence';

export const bankFixture = {
  overview: {
    deposit_amount: '9007199254740993',
    depositor_count: '3',
    open_loan_count: '100',
    outstanding_amount: '1000',
    overdue_loan_count: '10',
    overdue_amount: '100',
    maturing_7d_count: '2',
    issued_24h_count: '1',
    issued_24h_amount: '20',
    repaid_24h_amount: '10',
    borrower_count: '70',
  },
  grades: [
    {
      grade: 'A',
      minimum_account_days: 1,
      minimum_work_completions: 1,
      credit_limit: '10000',
      interest_bps: 100,
      term_days: 30,
      minimum_repayment: '100',
      active: true,
      open_loan_count: '100',
      outstanding_amount: '1000',
      overdue_loan_count: '10',
      issued_loan_count: '120',
      issued_principal: '1200',
    },
  ],
  loans: [
    {
      loan_id: '11111111-1111-4111-8111-111111111111',
      user_id: '22222222-2222-4222-8222-222222222222',
      display_name: 'Member',
      credit_grade: 'A',
      status: 'active',
      principal_amount: '100',
      interest_amount: '10',
      outstanding_amount: '90',
      repaid_amount: '20',
      minimum_repayment: '10',
      issued_at: '2026-10-27T00:00:00.000Z',
      maturity_at: '2026-11-27T00:00:00.000Z',
      overdue_at: null,
      status_reason: null,
    },
  ],
};

describe('admin bank financial evidence', () => {
  it('preserves exact WLD strings and distinguishes a verified empty loan list', () => {
    expect(validateAdminBankResponse(bankFixture)?.overview.deposit_amount).toBe(
      '9007199254740993',
    );
    expect(validateAdminBankResponse({ ...bankFixture, loans: [] })?.loans).toEqual([]);
    expect(validateAdminBankResponse(null)).toBeNull();
  });
  it('rejects malformed overview, missing fields and contradictions', () => {
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        overview: { ...bankFixture.overview, deposit_amount: Number('9007199254740993') },
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        overview: { ...bankFixture.overview, overdue_amount: '1e4' },
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        overview: { ...bankFixture.overview, overdue_loan_count: '101' },
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        overview: { ...bankFixture.overview, outstanding_amount: '99' },
      }),
    ).toBeNull();
    expect(validateAdminBankResponse({ ...bankFixture, overview: {} })).toBeNull();
  });
  it('rejects malformed loan identifiers, status, timestamps and duplicates', () => {
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        loans: [{ ...bankFixture.loans[0], loan_id: 'bad' }],
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        loans: [{ ...bankFixture.loans[0], status: 'forged' }],
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        loans: [{ ...bankFixture.loans[0], issued_at: 'invalid' }],
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        loans: [bankFixture.loans[0], bankFixture.loans[0]],
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({ ...bankFixture, loans: Array(201).fill(bankFixture.loans[0]) }),
    ).toBeNull();
  });
  it('rejects malformed credit grades, negative values and duplicate grades', () => {
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        grades: [{ ...bankFixture.grades[0], interest_bps: Infinity }],
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        grades: [{ ...bankFixture.grades[0], credit_limit: '-1' }],
      }),
    ).toBeNull();
    expect(
      validateAdminBankResponse({
        ...bankFixture,
        grades: [bankFixture.grades[0], bankFixture.grades[0]],
      }),
    ).toBeNull();
  });
});
