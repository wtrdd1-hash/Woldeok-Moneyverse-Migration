export type StockWatchlistTrend = 'all' | 'up' | 'down' | 'flat';
export interface VerifiedWatchlistRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly created_at: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER = /^(0|[1-9][0-9]*)$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const MAX_BIGINT = 9223372036854775807n;

export function parseStockWatchlistTrend(value: unknown): StockWatchlistTrend | null {
  if (value === undefined || value === 'all') return 'all';
  return value === 'up' || value === 'down' || value === 'flat' ? value : null;
}

function exactAmount(value: unknown): bigint | null {
  if (typeof value !== 'string' || value.length > 19 || !INTEGER.test(value)) return null;
  const amount = BigInt(value);
  return amount <= MAX_BIGINT ? amount : null;
}

/** Reject a stale upstream's unfiltered HTTP 200, not just malformed JSON. */
export function parseVerifiedStockWatchlist(
  payload: unknown,
  trend: StockWatchlistTrend,
): { readonly stocks: readonly VerifiedWatchlistRow[] } | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const stocks = (payload as { stocks?: unknown }).stocks;
  if (!Array.isArray(stocks) || stocks.length > 5000) return null;
  const ids = new Set<string>();
  for (const raw of stocks) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const stock = raw as Record<string, unknown>;
    if (typeof stock.stock_id !== 'string' || !UUID.test(stock.stock_id) || ids.has(stock.stock_id.toLowerCase())) return null;
    if (typeof stock.symbol !== 'string' || stock.symbol.length < 1 || stock.symbol.length > 40 ||
        typeof stock.name !== 'string' || stock.name.length < 1 || stock.name.length > 200 ||
        typeof stock.created_at !== 'string' || !ISO_TIMESTAMP.test(stock.created_at) || !Number.isFinite(Date.parse(stock.created_at))) return null;
    const price = exactAmount(stock.current_price);
    const open = exactAmount(stock.day_open_price);
    if (price === null || open === null) return null;
    if (trend !== 'all' && (open === 0n || !(trend === 'up' ? price > open : trend === 'down' ? price < open : price === open))) return null;
    ids.add(stock.stock_id.toLowerCase());
  }
  return { stocks: stocks as VerifiedWatchlistRow[] };
}
