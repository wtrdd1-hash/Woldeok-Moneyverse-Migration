import type { AdminMarketEvent, AdminStock, AdminStockDynamics } from '../types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]{0,37})$/;
const DECIMAL = /^-?(0|[1-9]\d{0,17})(\.\d{1,12})?$/;
const HALT_STATES = new Set(['ACTIVE', 'HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED']);

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function text(value: unknown, max = 256): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function money(value: unknown, positive = false): value is string {
  return typeof value === 'string' && WLD.test(value) && (!positive || value !== '0');
}
function decimal(value: unknown, nonNegative = false): value is string {
  return typeof value === 'string' && DECIMAL.test(value) && (!nonNegative || !value.startsWith('-'));
}
function iso(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}
function rows(value: unknown, key: string, max: number): unknown[] | null {
  if (!record(value) || !Array.isArray(value[key]) || value[key].length > max) return null;
  return value[key];
}

/** PostgreSQL stock identifiers and exact bigint strings are mandatory before privileged controls render. */
export function parseMarketStocks(value: unknown): AdminStock[] | null {
  const items = rows(value, 'stocks', 5000);
  if (!items) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  const parsed: AdminStock[] = [];
  for (const item of items) {
    if (!record(item) || typeof item.id !== 'string' || !UUID.test(item.id) ||
      !text(item.symbol, 64) || !text(item.name) || !money(item.current_price, true) ||
      !money(item.shares_outstanding, true) || !money(item.shares_available) ||
      BigInt(item.shares_available) > BigInt(item.shares_outstanding) ||
      !integer(item.holders) || !integer(item.trades) || typeof item.active !== 'boolean' ||
      (item.halt_status !== undefined && (typeof item.halt_status !== 'string' || !HALT_STATES.has(item.halt_status))) ||
      (item.halted_at !== undefined && item.halted_at !== null && !iso(item.halted_at))) return null;
    const id = item.id.toLowerCase();
    const symbol = item.symbol.toLowerCase();
    if (ids.has(id) || symbols.has(symbol)) return null;
    ids.add(id); symbols.add(symbol);
    parsed.push({ id: item.id, symbol: item.symbol, name: item.name, current_price: item.current_price,
      shares_outstanding: item.shares_outstanding, shares_available: item.shares_available,
      holders: item.holders, trades: item.trades, active: item.active,
      halt_status: typeof item.halt_status === 'string' ? item.halt_status : undefined,
      halted_at: typeof item.halted_at === 'string' ? item.halted_at : null });
  }
  return parsed;
}

export function parseMarketDynamics(value: unknown): AdminStockDynamics[] | null {
  const items = rows(value, 'stocks', 5000);
  if (!items) return null;
  const ids = new Set<string>();
  const parsed: AdminStockDynamics[] = [];
  for (const item of items) {
    if (!record(item) || typeof item.stock_id !== 'string' || !UUID.test(item.stock_id) ||
      !text(item.symbol, 64) || !text(item.name) || !money(item.current_price, true) ||
      !money(item.fair_value, true) || !decimal(item.trend_bps) ||
      !decimal(item.vol_bps, true) || !decimal(item.market_trend_bps) ||
      !integer(item.live_events)) return null;
    const id = item.stock_id.toLowerCase();
    if (ids.has(id)) return null;
    ids.add(id);
    parsed.push({ stock_id: item.stock_id, symbol: item.symbol, name: item.name,
      current_price: item.current_price, fair_value: item.fair_value,
      trend_bps: item.trend_bps, vol_bps: item.vol_bps,
      market_trend_bps: item.market_trend_bps, live_events: item.live_events });
  }
  return parsed;
}

export function parseMarketEvents(value: unknown): AdminMarketEvent[] | null {
  const items = rows(value, 'events', 200);
  if (!items) return null;
  const ids = new Set<string>();
  const parsed: AdminMarketEvent[] = [];
  for (const item of items) {
    if (!record(item) || typeof item.id !== 'string' || !UUID.test(item.id) ||
      (item.stock_id !== null && (typeof item.stock_id !== 'string' || !UUID.test(item.stock_id))) ||
      (item.stock_id === null ? item.symbol !== null || item.name !== null : !text(item.symbol, 64) || !text(item.name)) ||
      (item.direction !== 'up' && item.direction !== 'down') ||
      !integer(item.strength) || item.strength < 1 || item.strength > 3 ||
      !text(item.headline, 120) || typeof item.body !== 'string' || item.body.length > 2000 ||
      !text(item.source, 128) || !iso(item.starts_at) || !iso(item.ends_at) ||
      Date.parse(item.ends_at) <= Date.parse(item.starts_at) ||
      (item.cancelled_at !== null && !iso(item.cancelled_at)) ||
      typeof item.live !== 'boolean' || (item.live && item.cancelled_at !== null)) return null;
    const id = item.id.toLowerCase();
    if (ids.has(id)) return null;
    ids.add(id);
    parsed.push({ id: item.id, stock_id: item.stock_id, symbol: item.symbol, name: item.name,
      direction: item.direction, strength: item.strength, headline: item.headline, body: item.body,
      source: item.source, starts_at: item.starts_at, ends_at: item.ends_at,
      cancelled_at: item.cancelled_at, live: item.live });
  }
  return parsed;
}
