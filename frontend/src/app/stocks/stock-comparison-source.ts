import type { ComparableStock } from './stock-comparison';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYMBOL = /^[a-z0-9_-]{1,24}$/i;
const INTEGER = /^(0|[1-9][0-9]*)$/;
const MAX_PG_BIGINT = 9223372036854775807n;
const MAX_STOCKS = 100;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pgBigint(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 19 && INTEGER.test(value) && BigInt(value) <= MAX_PG_BIGINT;
}

/**
 * Nest's stock list is a public SECURITY DEFINER read, but TypeScript's generic
 * api() type does not validate HTTP JSON. Reject the entire response instead
 * of silently dropping invalid prices or claiming a verified empty market.
 */
export function parseComparableStockMarket(value: unknown): ComparableStock[] | null {
  if (!record(value) || !Array.isArray(value.stocks) || value.stocks.length > MAX_STOCKS) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  const result: ComparableStock[] = [];
  for (const stock of value.stocks as unknown[]) {
    if (!record(stock) || typeof stock.id !== 'string' || !UUID.test(stock.id) ||
      typeof stock.symbol !== 'string' || !SYMBOL.test(stock.symbol) ||
      typeof stock.name !== 'string' || !stock.name.trim() || stock.name.length > 160 ||
      !pgBigint(stock.current_price) || !pgBigint(stock.day_open_price) ||
      !pgBigint(stock.day_high_price) || !pgBigint(stock.day_low_price) ||
      !pgBigint(stock.shares_available)) return null;
    const id = stock.id.toLowerCase();
    const symbol = stock.symbol.toUpperCase();
    if (ids.has(id) || symbols.has(symbol) || BigInt(stock.day_low_price) > BigInt(stock.day_high_price)) return null;
    ids.add(id);
    symbols.add(symbol);
    result.push({
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      current_price: stock.current_price,
      day_open_price: stock.day_open_price,
      day_high_price: stock.day_high_price,
      day_low_price: stock.day_low_price,
      shares_available: stock.shares_available,
    });
  }
  return result;
}
