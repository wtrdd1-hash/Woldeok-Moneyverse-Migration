import type { ComparableStock } from '../stock-comparison';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Z][A-Z0-9]{1,7}$/;
const INTEGER = /^(0|[1-9][0-9]{0,18})$/;
const MAX_BIGINT = 9223372036854775807n;
const MAX_STOCKS = 500;
const MAX_SHARES = 1000000000000n;

function exactInteger(value: unknown, allowZero: boolean): bigint | null {
  if (typeof value !== 'string' || !INTEGER.test(value)) return null;
  const amount = BigInt(value);
  return amount <= MAX_BIGINT && (allowZero || amount > 0n) ? amount : null;
}

/**
 * `stock_market_overview()` owns the authoritative values, but TypeScript
 * cannot prove the shape of a network response. Reject the entire snapshot
 * instead of showing partial prices or treating malformed data as no listings.
 */
export function verifiedComparisonMarket(payload: unknown): readonly ComparableStock[] | null {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload) || !('stocks' in payload)) return null;
  const rows = payload.stocks;
  if (!Array.isArray(rows) || rows.length > MAX_STOCKS) return null;

  const ids = new Set<string>();
  const symbols = new Set<string>();
  for (const row of rows) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) return null;
    const stock = row as Record<string, unknown>;
    if (typeof stock.id !== 'string' || !UUID.test(stock.id) ||
        typeof stock.symbol !== 'string' || !SYMBOL.test(stock.symbol) ||
        typeof stock.name !== 'string' || stock.name.trim().length === 0 || stock.name.length > 80 ||
        ids.has(stock.id.toLowerCase()) || symbols.has(stock.symbol)) return null;

    const current = exactInteger(stock.current_price, false);
    const open = exactInteger(stock.day_open_price, false);
    const high = exactInteger(stock.day_high_price, false);
    const low = exactInteger(stock.day_low_price, false);
    const outstanding = exactInteger(stock.shares_outstanding, false);
    const available = exactInteger(stock.shares_available, true);
    if (current === null || open === null || high === null || low === null ||
        outstanding === null || available === null || high < low ||
        outstanding > MAX_SHARES || available > outstanding) return null;

    ids.add(stock.id.toLowerCase());
    symbols.add(stock.symbol);
  }
  return rows as ComparableStock[];
}
