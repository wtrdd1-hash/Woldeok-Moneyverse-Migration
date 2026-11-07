import type { ComparableStock } from './stock-comparison';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Za-z0-9._-]{1,24}$/;
const WLD_INTEGER = /^(0|[1-9][0-9]{0,37})$/;

function verifiedStock(value: unknown): value is ComparableStock {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const stock = value as Record<string, unknown>;
  if (typeof stock.id !== 'string' || !UUID.test(stock.id)) return false;
  if (typeof stock.symbol !== 'string' || !SYMBOL.test(stock.symbol)) return false;
  if (typeof stock.name !== 'string' || !stock.name.trim() || stock.name.length > 120) return false;
  for (const key of ['current_price', 'day_open_price', 'day_high_price', 'day_low_price', 'shares_available']) {
    if (typeof stock[key] !== 'string' || !WLD_INTEGER.test(stock[key])) return false;
  }
  // Reject contradictory market data instead of presenting it as an authoritative quote.
  return BigInt(stock.current_price as string) > 0n &&
    BigInt(stock.day_low_price as string) <= BigInt(stock.day_high_price as string);
}

/** Distinguish a verified empty market from unavailable or malformed API data. */
export function parseComparableStocksResponse(response: unknown): ComparableStock[] | null {
  if (response === null || typeof response !== 'object' || Array.isArray(response)) return null;
  const stocks = (response as Record<string, unknown>).stocks;
  if (!Array.isArray(stocks) || stocks.length > 200) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  for (const stock of stocks) {
    if (!verifiedStock(stock)) return null;
    const id = stock.id.toLowerCase();
    const symbol = stock.symbol.toUpperCase();
    if (ids.has(id) || symbols.has(symbol)) return null;
    ids.add(id);
    symbols.add(symbol);
  }
  return stocks;
}
