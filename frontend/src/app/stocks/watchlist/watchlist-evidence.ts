// The owner-scoped stock_my_watchlist SQL read is authoritative; client-visible
// sorting and BigInt conversion must not interpret a malformed proxy payload.
export interface VerifiedWatchlistRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly created_at: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PRICE = /^[1-9][0-9]{0,18}$/;
const BIGINT_MAX = 9223372036854775807n;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

function isPrice(value: unknown): value is string {
  return typeof value === 'string' && PRICE.test(value) && BigInt(value) >= 10n && BigInt(value) <= BIGINT_MAX;
}

export function parseVerifiedStockWatchlist(payload: unknown): readonly VerifiedWatchlistRow[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const rows = (payload as { stocks?: unknown }).stocks;
  if (!Array.isArray(rows) || rows.length > 5000) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  for (const value of rows) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const row = value as Record<string, unknown>;
    if (typeof row.stock_id !== 'string' || !UUID.test(row.stock_id)) return null;
    if (typeof row.symbol !== 'string' || !/^[A-Z][A-Z0-9]{1,7}$/.test(row.symbol)) return null;
    if (typeof row.name !== 'string' || row.name.trim().length === 0 || row.name.length > 80) return null;
    if (!isPrice(row.current_price) || !isPrice(row.day_open_price)) return null;
    if (typeof row.created_at !== 'string' || !ISO_DATE.test(row.created_at) || !Number.isFinite(Date.parse(row.created_at))) return null;
    const id = row.stock_id.toLowerCase();
    if (ids.has(id) || symbols.has(row.symbol)) return null;
    ids.add(id);
    symbols.add(row.symbol);
  }
  return rows as VerifiedWatchlistRow[];
}
