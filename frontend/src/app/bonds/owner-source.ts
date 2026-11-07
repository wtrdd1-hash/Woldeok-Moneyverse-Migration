import type { UserHoldingItem, UserRepoLoanItem } from './bonds-portal-client';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^(0|[1-9][0-9]{0,29})$/;
const SYMBOL = /^[A-Z0-9-]{1,30}$/;
const HOLDING_STATUS = new Set(['HOLDING', 'MATURED', 'SOLD']);
const REPO_STATUS = new Set(['ACTIVE', 'REPAID', 'LIQUIDATED']);
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const uuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);
const amount = (value: unknown): value is string => typeof value === 'string' && AMOUNT.test(value);
const count = (value: unknown, max = 100_000): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max;
const label = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 150;
const date = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(value) &&
  Number.isFinite(Date.parse(value));
const rows = (value: unknown): value is unknown[] => Array.isArray(value) && value.length <= 1000;

/** Fail closed on the whole owner response; a missing financial row is not a zero balance. */
export function parseBondOwnerHoldings(payload: unknown): UserHoldingItem[] | null {
  if (!rows(payload)) return null;
  const ids = new Set<string>();
  const result: UserHoldingItem[] = [];
  for (const value of payload) {
    if (!record(value) || !uuid(value.id) || ids.has(value.id) || !uuid(value.bond_id) ||
        typeof value.bond_symbol !== 'string' || !SYMBOL.test(value.bond_symbol) || !label(value.bond_name) ||
        !amount(value.units) || value.units === '0' || !amount(value.par_value_wld) ||
        !amount(value.purchase_price_total_wld) || !amount(value.accrued_interest_wld) ||
        !count(value.hourly_coupon_rate_bps) || !count(value.annual_coupon_rate_bps) ||
        !date(value.purchased_at) || !date(value.maturity_at) ||
        typeof value.status !== 'string' || !HOLDING_STATUS.has(value.status) ||
        typeof value.auto_rollover !== 'boolean' || typeof value.collateral_locked !== 'boolean' ||
        (value.hours_left !== undefined && !count(value.hours_left, 1_000_000))) return null;
    ids.add(value.id);
    result.push({ id: value.id, bond_id: value.bond_id, bond_symbol: value.bond_symbol,
      bond_name: value.bond_name, units: value.units, par_value_wld: value.par_value_wld,
      purchase_price_total_wld: value.purchase_price_total_wld, accrued_interest_wld: value.accrued_interest_wld,
      hourly_coupon_rate_bps: value.hourly_coupon_rate_bps, annual_coupon_rate_bps: value.annual_coupon_rate_bps,
      purchased_at: value.purchased_at, maturity_at: value.maturity_at, status: value.status,
      auto_rollover: value.auto_rollover, collateral_locked: value.collateral_locked,
      ...(value.hours_left === undefined ? {} : { hours_left: value.hours_left }),
    });
  }
  return result;
}

export function parseBondOwnerRepoLoans(payload: unknown): UserRepoLoanItem[] | null {
  if (!rows(payload)) return null;
  const ids = new Set<string>();
  const result: UserRepoLoanItem[] = [];
  for (const value of payload) {
    if (!record(value) || !uuid(value.id) || ids.has(value.id) || !uuid(value.holding_id) ||
        !label(value.bond_name) || typeof value.bond_symbol !== 'string' || !SYMBOL.test(value.bond_symbol) ||
        !amount(value.principal_wld) || !amount(value.accrued_interest_wld) ||
        !count(value.annual_interest_rate_bps) || !count(value.ltv_percent, 100) ||
        typeof value.status !== 'string' || !REPO_STATUS.has(value.status) || !date(value.created_at)) return null;
    ids.add(value.id);
    result.push({ id: value.id, holding_id: value.holding_id, bond_name: value.bond_name,
      bond_symbol: value.bond_symbol, principal_wld: value.principal_wld,
      annual_interest_rate_bps: value.annual_interest_rate_bps,
      accrued_interest_wld: value.accrued_interest_wld, ltv_percent: value.ltv_percent,
      status: value.status, created_at: value.created_at });
  }
  return result;
}
