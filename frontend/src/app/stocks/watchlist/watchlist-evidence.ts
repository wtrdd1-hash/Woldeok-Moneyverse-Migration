/** A member-scoped read from stock_my_watchlist; not an assertion of price freshness. */
export interface WatchlistRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly created_at: string;
}

export type WatchlistSort = 'saved' | 'change' | 'price' | 'name';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const integer = /^(?:0|[1-9][0-9]{0,29})$/;
const symbol = /^[A-Za-z0-9._-]{1,16}$/;
const isoUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function validRow(value: unknown): value is WatchlistRow {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return typeof row.stock_id === 'string' && uuid.test(row.stock_id)
    && typeof row.symbol === 'string' && symbol.test(row.symbol)
    && typeof row.name === 'string' && row.name.trim().length > 0 && row.name.length <= 200
    && typeof row.current_price === 'string' && integer.test(row.current_price)
    && typeof row.day_open_price === 'string' && integer.test(row.day_open_price)
    && typeof row.created_at === 'string' && isoUtc.test(row.created_at)
    && !Number.isNaN(Date.parse(row.created_at))
    && new Date(row.created_at).toISOString() === row.created_at;
}

export function parseWatchlistResponse(raw: unknown): { readonly stocks: readonly WatchlistRow[] } | null {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const stocks = (raw as Record<string, unknown>).stocks;
  if (!Array.isArray(stocks) || stocks.length > 10_000) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  for (const stock of stocks) {
    if (!validRow(stock)) return null;
    const id = stock.stock_id.toLowerCase();
    const ticker = stock.symbol.toUpperCase();
    if (ids.has(id) || symbols.has(ticker)) return null;
    ids.add(id);
    symbols.add(ticker);
  }
  return { stocks };
}

export function normalizeWatchlistQuery(value: unknown): string {
  const first = Array.isArray(value) ? value[0] : value;
  return typeof first === 'string' ? first.trim().slice(0, 80) : '';
}

export function normalizeWatchlistSort(value: unknown): WatchlistSort {
  return value === 'change' || value === 'price' || value === 'name' ? value : 'saved';
}

export function changeLabel(current: string, open: string): string {
  const currentValue = BigInt(current);
  const openValue = BigInt(open);
  if (openValue <= 0n) return '—';
  const diff = currentValue - openValue;
  const basisPoints = (diff * 10000n) / openValue;
  if (diff !== 0n && basisPoints === 0n) return diff > 0n ? '+<0.01%' : '-<0.01%';
  const absolute = basisPoints < 0n ? -basisPoints : basisPoints;
  return `${basisPoints > 0n ? '+' : basisPoints < 0n ? '-' : ''}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}%`;
}

function compareChange(a: WatchlistRow, b: WatchlistRow): number {
  const openA = BigInt(a.day_open_price);
  const openB = BigInt(b.day_open_price);
  // An absent price baseline cannot establish a movement ranking.
  if (openA === 0n || openB === 0n) return openA === openB ? 0 : openA === 0n ? 1 : -1;
  const left = (BigInt(a.current_price) - openA) * openB;
  const right = (BigInt(b.current_price) - openB) * openA;
  return left === right ? 0 : left > right ? -1 : 1;
}

export function sortWatchlist(stocks: readonly WatchlistRow[], sort: WatchlistSort): WatchlistRow[] {
  return [...stocks].sort((a, b) => {
    let result = 0;
    if (sort === 'change') result = compareChange(a, b);
    if (sort === 'price') {
      const left = BigInt(a.current_price);
      const right = BigInt(b.current_price);
      result = left === right ? 0 : left > right ? -1 : 1;
    }
    if (sort === 'name') result = a.name.localeCompare(b.name);
    if (sort === 'saved') result = b.created_at.localeCompare(a.created_at);
    return result || a.symbol.localeCompare(b.symbol);
  });
}
