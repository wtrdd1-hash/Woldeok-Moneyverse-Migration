import type { AdminStockDynamics } from '../types';

/**
 * PostgreSQL numeric values are strings, but the dynamics row is LEFT JOINed.
 * Missing rows and an absent market regime are not evidence of a zero trend.
 */
function basisPoints(value: unknown): number | null {
  if (typeof value !== 'string' || !/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Math.abs(parsed) > 1_000_000) return null;
  return parsed;
}

export function formatStockTrend(value: unknown): string {
  const bps = basisPoints(value);
  if (bps === null) return '—';
  return `${bps > 0 ? '+' : ''}${(bps / 100).toFixed(1)} %/일`;
}

export function formatMarketVolatility(value: unknown): string {
  const bps = basisPoints(value);
  if (bps === null || bps < 0) return '—';
  return `${(bps / 100).toFixed(1)} %/일`;
}

export function stockTrendDirection(value: unknown): 'up' | 'down' | null {
  const bps = basisPoints(value);
  if (bps === null || bps === 0) return null;
  return bps > 0 ? 'up' : 'down';
}

/** A single row cannot establish the market-wide regime when other rows disagree. */
export function formatMarketTrend(rows: readonly { readonly market_trend_bps: unknown }[] | null): string {
  if (!rows?.length) return '—';
  const first = basisPoints(rows[0]?.market_trend_bps);
  if (first === null || rows.some((row) => basisPoints(row.market_trend_bps) !== first)) return '—';
  return formatStockTrend(rows[0]?.market_trend_bps);
}

/** Prices stay BigInt until the bounded percentage can be represented safely. */
export function formatMarketGap(price: unknown, fair: unknown): string {
  if (
    typeof price !== 'string' || typeof fair !== 'string' ||
    !/^\d+$/.test(price) || !/^\d+$/.test(fair)
  ) return '—';
  const fairAmount = BigInt(fair);
  if (fairAmount === 0n) return '—';
  const bps = ((BigInt(price) - fairAmount) * 10_000n) / fairAmount;
  if (bps > BigInt(Number.MAX_SAFE_INTEGER) || bps < -BigInt(Number.MAX_SAFE_INTEGER)) return '—';
  const value = Number(bps) / 100;
  return `${value > 0 ? '+' : ''}${value.toFixed(1)} %`;
}

export function hasUnverifiedMarketEvidence(row: AdminStockDynamics): boolean {
  return (
    formatMarketGap(row.current_price, row.fair_value) === '—' ||
    formatStockTrend(row.trend_bps) === '—' ||
    formatMarketVolatility(row.vol_bps) === '—' ||
    basisPoints(row.market_trend_bps) === null ||
    !Number.isSafeInteger(row.live_events) || row.live_events < 0
  );
}
