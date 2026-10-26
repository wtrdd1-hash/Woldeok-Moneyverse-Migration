import type { PublicBondItem } from './bonds-portal-client';

interface BondMarketOverview {
  readonly totalBondsActive: number;
  readonly totalFundedWld: string;
  readonly totalHoldersCount: number;
  readonly totalCouponsPaidWld: string;
  readonly benchmark1YYield: string;
  readonly benchmark3YYield: string;
  readonly benchmark5YYield: string;
}

export interface VerifiedBondMarket {
  readonly bonds: PublicBondItem[];
  readonly overview: BondMarketOverview;
  readonly disclosedAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER = /^(0|[1-9]\d{0,29})$/;
const STATES = new Set(['OPEN_SUBSCRIPTION', 'TRADING', 'CLOSED', 'FROZEN']);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isAmount = (value: unknown): value is string =>
  typeof value === 'string' && INTEGER.test(value);
const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const isRate = (value: unknown): value is number => isCount(value) && value <= 100_000;

/** Trust only a recent server response backed by the virtual bond market read API. */
export function verifyBondMarkets(payload: unknown, nowMs = Date.now()): VerifiedBondMarket | null {
  if (!isRecord(payload) || !isRecord(payload.overview) || !Array.isArray(payload.bonds)) return null;
  if (typeof payload.disclosed_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(payload.disclosed_at)) return null;
  const observedMs = Date.parse(payload.disclosed_at);
  if (!Number.isFinite(observedMs) || observedMs > nowMs + 60_000 || nowMs - observedMs > 300_000) return null;
  if (payload.bonds.length > 100) return null;

  const raw = payload.overview;
  if (!isCount(raw.totalBondsActive) || !isCount(raw.totalHoldersCount) ||
      !isAmount(raw.totalFundedWld) || !isAmount(raw.totalCouponsPaidWld)) return null;

  const ids = new Set<string>();
  const symbols = new Set<string>();
  const bonds: PublicBondItem[] = [];
  for (const entry of payload.bonds) {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !UUID.test(entry.id) ||
        typeof entry.symbol !== 'string' || !/^[A-Z0-9-]{1,30}$/.test(entry.symbol) ||
        typeof entry.name !== 'string' || entry.name.length < 1 || entry.name.length > 150 ||
        !isCount(entry.maturity_hours) || entry.maturity_hours === 0 ||
        !isRate(entry.annual_coupon_rate_bps) || !isRate(entry.hourly_coupon_rate_bps) ||
        !isAmount(entry.par_value_wld) || !isAmount(entry.total_issued_units) ||
        !isAmount(entry.available_units) || !isAmount(entry.total_funded_wld) ||
        typeof entry.status !== 'string' || !STATES.has(entry.status) ||
        !(typeof entry.description === 'string' || entry.description === null)) return null;
    if (ids.has(entry.id) || symbols.has(entry.symbol) ||
        BigInt(entry.available_units) > BigInt(entry.total_issued_units)) return null;
    ids.add(entry.id);
    symbols.add(entry.symbol);
    bonds.push({
      id: entry.id, symbol: entry.symbol, name: entry.name,
      maturity_hours: entry.maturity_hours, annual_coupon_rate_bps: entry.annual_coupon_rate_bps,
      hourly_coupon_rate_bps: entry.hourly_coupon_rate_bps,
      par_value_wld: entry.par_value_wld, total_issued_units: entry.total_issued_units,
      available_units: entry.available_units, total_funded_wld: entry.total_funded_wld,
      status: entry.status, description: entry.description ?? '',
    });
  }
  const live = bonds.filter((bond) => bond.status === 'OPEN_SUBSCRIPTION' || bond.status === 'TRADING');
  if (raw.totalBondsActive > bonds.length) return null;
  const yieldFor = (symbol: string) => {
    const match = live.find((bond) => bond.symbol === symbol);
    return match ? `${(match.annual_coupon_rate_bps / 100).toFixed(2)}%` : '—';
  };
  return {
    disclosedAt: payload.disclosed_at,
    bonds,
    overview: {
      totalBondsActive: raw.totalBondsActive,
      totalFundedWld: raw.totalFundedWld,
      totalHoldersCount: raw.totalHoldersCount,
      totalCouponsPaidWld: raw.totalCouponsPaidWld,
      benchmark1YYield: yieldFor('KTB-01Y'),
      benchmark3YYield: yieldFor('KTB-03Y'),
      benchmark5YYield: yieldFor('KTB-05Y'),
    },
  };
}
