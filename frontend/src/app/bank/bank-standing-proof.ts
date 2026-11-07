import type { BankBond, BankLoan, BankStanding } from './types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]{0,77})$/;
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function wld(value: unknown): value is string {
  return typeof value === 'string' && WLD.test(value);
}
function uuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}
function text(value: unknown, max = 120): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
function integer(value: unknown, min = 0, max = 1_000_000): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}
function rate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1e100;
}
function date(value: unknown): value is string {
  return typeof value === 'string' && ISO_TIME.test(value) && Number.isFinite(Date.parse(value));
}

function parseLoan(value: unknown): BankLoan | null {
  const row = record(value);
  if (!row || !uuid(row.loan_id) || !wld(row.principal_amount) ||
      !wld(row.interest_amount) || !wld(row.outstanding_amount) ||
      !date(row.issued_at) || !['active', 'overdue'].includes(String(row.status)) ||
      (row.maturity_at !== null && row.maturity_at !== undefined && !date(row.maturity_at)) ||
      (row.minimum_repayment !== undefined && !wld(row.minimum_repayment)) ||
      (row.credit_grade !== undefined && row.credit_grade !== null && !text(row.credit_grade, 40))) return null;
  return {
    loan_id: row.loan_id,
    principal_amount: row.principal_amount,
    interest_amount: row.interest_amount,
    outstanding_amount: row.outstanding_amount,
    issued_at: row.issued_at,
    status: row.status as string,
    maturity_at: (row.maturity_at ?? null) as string | null,
    ...(typeof row.minimum_repayment === 'string' ? { minimum_repayment: row.minimum_repayment } : {}),
    ...(typeof row.credit_grade === 'string' ? { credit_grade: row.credit_grade } : {}),
  };
}

function parseBonds(value: unknown): readonly BankBond[] | null {
  if (!Array.isArray(value) || value.length > 500) return null;
  const bonds: BankBond[] = [];
  const ids = new Set<string>();
  for (const valueRow of value) {
    const row = record(valueRow);
    if (!row || !uuid(row.id) || ids.has(row.id.toLowerCase()) ||
        !text(row.bond_code, 64) || !text(row.bond_name, 120) ||
        !wld(row.principal_amount) || !wld(row.maturity_amount) ||
        !integer(row.yield_bps) || !date(row.purchased_at) || !date(row.maturity_at) ||
        typeof row.is_matured !== 'boolean' || row.status !== 'holding') return null;
    ids.add(row.id.toLowerCase());
    bonds.push({
      id: row.id, bond_code: row.bond_code, bond_name: row.bond_name,
      principal_amount: row.principal_amount, yield_bps: row.yield_bps,
      maturity_amount: row.maturity_amount, purchased_at: row.purchased_at,
      maturity_at: row.maturity_at, is_matured: row.is_matured, status: 'holding',
    });
  }
  return bonds;
}

/** Verify the existing actor-scoped migration 194 read model before financial rendering. */
export function parseVerifiedBankStanding(value: unknown): BankStanding | null {
  const row = record(value);
  if (!row || !wld(row.cash_balance) || !wld(row.bank_balance) ||
      !wld(row.unclaimed_interest) || !wld(row.credit_limit) ||
      !wld(row.loan_minimum_repayment) || !integer(row.daily_interest_rate_bps) ||
      !rate(row.daily_interest_rate_pct) || !rate(row.annual_yield_pct) ||
      !text(row.credit_grade, 40) || !integer(row.loan_interest_bps) ||
      !integer(row.loan_term_days, 1, 36_500)) return null;
  const bonds = parseBonds(row.bonds);
  const loan = row.active_loan === null ? null : parseLoan(row.active_loan);
  if (!bonds || (row.active_loan !== null && !loan)) return null;
  // Never spread untrusted upstream data: only migration 194's allowlisted fields survive.
  return {
    cash_balance: row.cash_balance, bank_balance: row.bank_balance,
    daily_interest_rate_bps: row.daily_interest_rate_bps,
    daily_interest_rate_pct: row.daily_interest_rate_pct,
    annual_yield_pct: row.annual_yield_pct,
    unclaimed_interest: row.unclaimed_interest, credit_grade: row.credit_grade,
    credit_limit: row.credit_limit, loan_interest_bps: row.loan_interest_bps,
    loan_term_days: row.loan_term_days, loan_minimum_repayment: row.loan_minimum_repayment,
    active_loan: loan, bonds,
  };
}
