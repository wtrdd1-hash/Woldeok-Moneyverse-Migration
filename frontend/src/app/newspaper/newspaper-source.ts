import type { MarketEvent, StockTickerItem } from './newspaper-view';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Z0-9][A-Z0-9._-]{0,15}$/;
const PG_BIGINT_MAX = 9223372036854775807n;
const MAX_EVENTS = 200;
const MAX_STOCKS = 500;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function text(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
function uuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}
function symbol(value: unknown): value is string {
  return typeof value === 'string' && SYMBOL.test(value);
}
function positivePgInt(value: unknown): value is string {
  return typeof value === 'string' && /^[1-9][0-9]{0,18}$/.test(value) && BigInt(value) <= PG_BIGINT_MAX;
}
function isoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
}

/** A failed read or malformed success is unknown, not an empty verified market. */
export function parseNewspaperEvents(payload: unknown): readonly MarketEvent[] | null {
  if (!record(payload) || !Array.isArray(payload.events) || payload.events.length > MAX_EVENTS) return null;
  const ids = new Set<string>();
  const events: MarketEvent[] = [];
  for (const raw of payload.events as unknown[]) {
    if (!record(raw) || !uuid(raw.id) || ids.has(raw.id)
      || (raw.stock_id !== null && !uuid(raw.stock_id))
      || (raw.symbol !== null && !symbol(raw.symbol))
      || (raw.name !== null && !text(raw.name, 200))
      || (raw.direction !== 'up' && raw.direction !== 'down')
      || !Number.isInteger(raw.strength) || ![1, 2, 3].includes(raw.strength as number)
      || !text(raw.headline, 500) || !text(raw.body, 5000) || !text(raw.source, 200)
      || !isoDate(raw.starts_at) || !isoDate(raw.ends_at)
      || Date.parse(raw.ends_at) < Date.parse(raw.starts_at)) return null;
    ids.add(raw.id);
    events.push({
      id: raw.id, stock_id: raw.stock_id as string | null,
      symbol: raw.symbol as string | null, name: raw.name as string | null,
      direction: raw.direction, strength: raw.strength as number,
      headline: raw.headline, body: raw.body, source: raw.source,
      starts_at: raw.starts_at, ends_at: raw.ends_at,
    });
  }
  return events;
}

export function parseNewspaperStocks(payload: unknown): readonly StockTickerItem[] | null {
  if (!record(payload) || !Array.isArray(payload.stocks) || payload.stocks.length > MAX_STOCKS) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  const stocks: StockTickerItem[] = [];
  for (const raw of payload.stocks as unknown[]) {
    if (!record(raw) || !uuid(raw.id) || ids.has(raw.id)
      || !symbol(raw.symbol) || symbols.has(raw.symbol)
      || !text(raw.name, 200)
      || !positivePgInt(raw.current_price) || !positivePgInt(raw.day_open_price)) return null;
    ids.add(raw.id);
    symbols.add(raw.symbol);
    stocks.push({
      id: raw.id, symbol: raw.symbol, name: raw.name,
      current_price: raw.current_price, day_open_price: raw.day_open_price,
    });
  }
  return stocks;
}
