import { ServiceUnavailableException } from '@nestjs/common';
import type { StockWatchlistRow } from './stock.repository';

export type WatchlistTrend = 'all' | 'up' | 'down' | 'flat';
const WLD_INTEGER = /^(0|[1-9][0-9]*)$/;
const MAX_BIGINT = 9223372036854775807n;

export function parseWatchlistTrend(value: unknown): WatchlistTrend | null {
  if (value === undefined || value === 'all') return 'all';
  return value === 'up' || value === 'down' || value === 'flat' ? value : null;
}

function amount(value: unknown): bigint {
  if (typeof value !== 'string' || !WLD_INTEGER.test(value) || value.length > 19) {
    throw new ServiceUnavailableException('watchlist price evidence is unavailable');
  }
  const parsed = BigInt(value);
  if (parsed > MAX_BIGINT) throw new ServiceUnavailableException('watchlist price evidence is unavailable');
  return parsed;
}

/** The SQL function already scopes rows to the session owner; never expand that window. */
export function filterWatchlistTrend(rows: readonly StockWatchlistRow[], trend: WatchlistTrend): readonly StockWatchlistRow[] {
  if (trend === 'all') return rows;
  return rows.filter((row) => {
    const price = amount(row.current_price);
    const open = amount(row.day_open_price);
    if (open === 0n) return false; // Missing open is not an unchanged trading day.
    return trend === 'up' ? price > open : trend === 'down' ? price < open : price === open;
  });
}
