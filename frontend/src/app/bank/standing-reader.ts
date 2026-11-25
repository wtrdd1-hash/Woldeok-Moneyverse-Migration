import type { BankStanding } from './types';

/**
 * GET /api/v1/banking/standing, trusted only as the database function's object
 * (`public.bank_get_my_standing`): either the body itself or Spring's
 * `data.canonical` passthrough. Spring's camelCase projection fills missing
 * values with invented defaults, so it is never read. Null means unavailable.
 */
const WLD = /^(?:0|[1-9][0-9]*)$/;
const obj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const wld = (v: unknown): v is string => typeof v === 'string' && WLD.test(v);

export function readBankStanding(raw: unknown): BankStanding | null {
  if (!obj(raw)) return null;
  const row = 'cash_balance' in raw ? raw : obj(raw.data) && obj(raw.data.canonical) ? raw.data.canonical : null;
  if (!row) return null;
  if (!wld(row.cash_balance) || !wld(row.bank_balance) || !wld(row.unclaimed_interest)) return null;
  if (row.bonds !== undefined && (!Array.isArray(row.bonds) || !row.bonds.every((b) => obj(b) && wld(b.principal_amount)))) return null;
  if (row.active_loan !== null && row.active_loan !== undefined && !(obj(row.active_loan) && wld(row.active_loan.outstanding_amount))) return null;
  return row as unknown as BankStanding;
}
