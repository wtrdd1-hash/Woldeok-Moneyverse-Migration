import type { UserHoldingItem, UserRepoLoanItem } from './bonds-portal-client';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^(0|[1-9]\d{0,29})$/;
const SYMBOL = /^[A-Z0-9-]{1,30}$/;
const HOLDING_STATES = new Set(['HOLDING', 'MATURED', 'SOLD']);
const LOAN_STATES = new Set(['ACTIVE', 'REPAID', 'LIQUIDATED']);
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const uuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);
const amount = (value: unknown): value is string => typeof value === 'string' && AMOUNT.test(value);
const count = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const rate = (value: unknown): value is number => count(value) && value <= 100_000;
const date = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}[ T]/.test(value) && Number.isFinite(Date.parse(value));
const name = (value: unknown): value is string => typeof value === 'string' && value.length > 0 && value.length <= 150;
const symbol = (value: unknown): value is string => typeof value === 'string' && SYMBOL.test(value);

/** An API failure, malformed record or duplicate is UNKNOWN, never a verified empty owner account. */
export function verifyOwnerBondHoldings(value: unknown): UserHoldingItem[] | null {
  if (!Array.isArray(value) || value.length > 500) return null;
  const ids = new Set<string>();
  for (const row of value) {
    if (!record(row) || !uuid(row.id) || !uuid(row.user_id) || !uuid(row.bond_id) ||
        !symbol(row.bond_symbol) || !name(row.bond_name) ||
        !amount(row.units) || row.units === '0' || !amount(row.par_value_wld) ||
        !amount(row.purchase_price_total_wld) || !amount(row.accrued_interest_wld) ||
        !rate(row.hourly_coupon_rate_bps) || !rate(row.annual_coupon_rate_bps) ||
        !date(row.purchased_at) || !date(row.maturity_at) ||
        typeof row.status !== 'string' || !HOLDING_STATES.has(row.status) ||
        typeof row.auto_rollover !== 'boolean' || typeof row.collateral_locked !== 'boolean' ||
        (row.hours_left !== undefined && !count(row.hours_left)) ||
        ids.has(row.id)) return null;
    ids.add(row.id);
  }
  return value as UserHoldingItem[];
}

export function verifyOwnerRepoLoans(value: unknown): UserRepoLoanItem[] | null {
  if (!Array.isArray(value) || value.length > 500) return null;
  const ids = new Set<string>();
  for (const row of value) {
    if (!record(row) || !uuid(row.id) || !uuid(row.user_id) || !uuid(row.holding_id) ||
        !name(row.bond_name) || !symbol(row.bond_symbol) ||
        !amount(row.principal_wld) || !amount(row.accrued_interest_wld) ||
        !rate(row.annual_interest_rate_bps) || !count(row.ltv_percent) || row.ltv_percent > 100 ||
        typeof row.status !== 'string' || !LOAN_STATES.has(row.status) ||
        !date(row.created_at) || ids.has(row.id)) return null;
    ids.add(row.id);
  }
  return value as UserRepoLoanItem[];
}
