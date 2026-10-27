import type { CouponLogItem, TreasuryBondItem, TreasuryBondsOverview } from './bond-control-tower';

export interface BondEvidence {
  overview: TreasuryBondsOverview;
  bonds: TreasuryBondItem[];
  couponLogs: CouponLogItem[];
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const amount = /^(0|[1-9][0-9]*)$/;
const yieldPattern = /^(0|[1-9][0-9]*)\.[0-9]{2}%$/;

function record(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid bond evidence');
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 1000) throw new Error('Invalid bond text');
  return value;
}

function id(value: unknown): string {
  const result = text(value);
  if (!uuid.test(result)) throw new Error('Invalid bond identifier');
  return result;
}

function money(value: unknown): string {
  if (typeof value !== 'string' || !amount.test(value) || value.length > 39) throw new Error('Invalid bond integer');
  return value;
}

function count(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) throw new Error('Invalid bond count');
  return value;
}

function percent(value: unknown): string {
  if (typeof value !== 'string' || !yieldPattern.test(value)) throw new Error('Invalid bond yield');
  return value;
}

function list<T>(value: unknown, maximum: number, parse: (value: unknown) => T, key: (value: T) => string): T[] {
  if (!Array.isArray(value) || value.length > maximum) throw new Error('Invalid bond list');
  const parsed = value.map(parse);
  if (new Set(parsed.map(key)).size !== parsed.length) throw new Error('Duplicate bond evidence');
  return parsed;
}

export function parseBondEvidence(value: unknown): BondEvidence {
  const root = record(value);
  const raw = record(root.overview);
  const overview: TreasuryBondsOverview = {
    totalBondsActive: count(raw.totalBondsActive),
    totalFundedWld: money(raw.totalFundedWld),
    totalHoldersCount: count(raw.totalHoldersCount),
    totalCouponsPaidWld: money(raw.totalCouponsPaidWld),
    benchmark1YYield: percent(raw.benchmark1YYield),
    benchmark3YYield: percent(raw.benchmark3YYield),
    benchmark5YYield: percent(raw.benchmark5YYield),
  };
  if (raw.totalRepoLoansWld !== undefined) money(raw.totalRepoLoansWld);

  const bonds = list(root.bonds, 500, (entry): TreasuryBondItem => {
    const b = record(entry);
    const issued = money(b.total_issued_units);
    const available = money(b.available_units);
    if (BigInt(available) > BigInt(issued)) throw new Error('Invalid bond inventory');
    const status = text(b.status);
    if (!/^[A-Z_]{2,40}$/.test(status)) throw new Error('Invalid bond status');
    return {
      id: id(b.id),
      symbol: text(b.symbol),
      name: text(b.name),
      maturity_hours: count(b.maturity_hours),
      annual_coupon_rate_bps: count(b.annual_coupon_rate_bps),
      hourly_coupon_rate_bps: count(b.hourly_coupon_rate_bps),
      par_value_wld: money(b.par_value_wld),
      total_issued_units: issued,
      available_units: available,
      total_funded_wld: money(b.total_funded_wld),
      status,
      description: typeof b.description === 'string' && b.description.length <= 1000 ? b.description : '',
    };
  }, (b) => b.id);

  if (overview.totalBondsActive !== bonds.filter((b) => b.status === 'OPEN_SUBSCRIPTION' || b.status === 'TRADING').length) {
    throw new Error('Inconsistent active bond count');
  }

  const couponLogs = list(root.couponLogs, 30, (entry): CouponLogItem => {
    const log = record(entry);
    if (log.event_type !== 'COUPON_INTEREST' && log.event_type !== 'MATURITY_REDEMPTION') {
      throw new Error('Unknown bond settlement event');
    }
    const date = text(log.created_at);
    if (!Number.isFinite(Date.parse(date))) throw new Error('Invalid bond event date');
    return {
      id: id(log.id),
      holding_id: log.holding_id === null ? null : id(log.holding_id),
      user_id: id(log.user_id),
      bond_symbol: text(log.bond_symbol),
      bond_name: text(log.bond_name),
      event_type: log.event_type,
      amount_wld: money(log.amount_wld),
      created_at: date,
    };
  }, (log) => log.id);

  return { overview, bonds, couponLogs };
}
