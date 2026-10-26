import type { CouponLogItem, TreasuryBondItem, TreasuryBondsOverview } from './bond-control-tower';

export interface AdminBondTelemetry {
  readonly overview: TreasuryBondsOverview;
  readonly bonds: TreasuryBondItem[];
  readonly couponLogs: CouponLogItem[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const isAmount = (value: unknown): value is string =>
  typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value);
const isLabel = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 500;
const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const isBenchmark = (value: unknown): value is string =>
  value === '—' || (typeof value === 'string' && /^(?:[0-9]+)(?:\.[0-9]{1,2})?%$/.test(value));

function isOverview(value: unknown): value is TreasuryBondsOverview {
  if (!isRecord(value)) return false;
  return (
    isCount(value.totalBondsActive) &&
    isCount(value.totalHoldersCount) &&
    isAmount(value.totalFundedWld) &&
    isAmount(value.totalCouponsPaidWld) &&
    isAmount(value.totalRepoLoansWld) &&
    isBenchmark(value.benchmark1YYield) &&
    isBenchmark(value.benchmark3YYield) &&
    isBenchmark(value.benchmark5YYield)
  );
}

function isBond(value: unknown): value is TreasuryBondItem {
  if (!isRecord(value)) return false;
  return (
    isUuid(value.id) &&
    isLabel(value.symbol) &&
    isLabel(value.name) &&
    isCount(value.maturity_hours) &&
    isCount(value.annual_coupon_rate_bps) &&
    isCount(value.hourly_coupon_rate_bps) &&
    isAmount(value.par_value_wld) &&
    isAmount(value.total_issued_units) &&
    isAmount(value.available_units) &&
    isAmount(value.total_funded_wld) &&
    isLabel(value.status) &&
    typeof value.description === 'string'
  );
}

function isCouponLog(value: unknown): value is CouponLogItem {
  if (!isRecord(value)) return false;
  return (
    isUuid(value.id) &&
    (value.holding_id === null || isUuid(value.holding_id)) &&
    isUuid(value.user_id) &&
    isLabel(value.bond_symbol) &&
    isLabel(value.bond_name) &&
    isLabel(value.event_type) &&
    isAmount(value.amount_wld) &&
    typeof value.created_at === 'string' &&
    Number.isFinite(Date.parse(value.created_at))
  );
}

/** The UI may only call telemetry verified when all three admin API responses are well formed. */
export function parseAdminBondTelemetry(value: unknown): AdminBondTelemetry | null {
  if (
    !isRecord(value) ||
    !isOverview(value.overview) ||
    !Array.isArray(value.bonds) ||
    !value.bonds.every(isBond) ||
    !Array.isArray(value.couponLogs) ||
    !value.couponLogs.every(isCouponLog)
  )
    return null;
  return {
    overview: value.overview,
    bonds: value.bonds,
    couponLogs: value.couponLogs,
  };
}
