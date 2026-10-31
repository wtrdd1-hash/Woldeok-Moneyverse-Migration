import type { ComparableStock } from '../stock-comparison';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Za-z0-9._-]{1,32}$/;
const INTEGER = /^(0|[1-9][0-9]{0,18})$/;
const PG_BIGINT_MAX = 9_223_372_036_854_775_807n;
const MAX_LISTED_STOCKS = 1000;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function wldInteger(value: unknown): value is string {
  return typeof value === 'string' && INTEGER.test(value) && BigInt(value) <= PG_BIGINT_MAX;
}

function stock(value: unknown): value is ComparableStock {
  if (!record(value)) return false;
  if (typeof value.id !== 'string' || !UUID.test(value.id)) return false;
  if (typeof value.symbol !== 'string' || !SYMBOL.test(value.symbol)) return false;
  if (typeof value.name !== 'string' || value.name.trim().length === 0 || value.name.length > 160) return false;
  if (!wldInteger(value.current_price) || !wldInteger(value.day_open_price)) return false;
  if (!wldInteger(value.day_high_price) || !wldInteger(value.day_low_price)) return false;
  if (!wldInteger(value.shares_available)) return false;
  return BigInt(value.day_low_price) <= BigInt(value.day_high_price);
}

/**
 * A generic API type parameter does not validate a runtime response. Reject the
 * entire comparison set when one row is malformed: dropping it would silently
 * change a user's selected stocks, and BigInt rendering could throw otherwise.
 */
export function parseComparisonMarket(value: unknown): readonly ComparableStock[] | null {
  if (!record(value) || !Array.isArray(value.stocks) || value.stocks.length > MAX_LISTED_STOCKS) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  const result: ComparableStock[] = [];
  for (const row of value.stocks as unknown[]) {
    if (!stock(row)) return null;
    const id = row.id.toLowerCase();
    const symbol = row.symbol.toUpperCase();
    if (ids.has(id) || symbols.has(symbol)) return null;
    ids.add(id);
    symbols.add(symbol);
    result.push(row);
  }
  return result;
}
