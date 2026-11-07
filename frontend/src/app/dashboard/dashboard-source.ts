import type { Overview } from '../wallet/sides';

export interface DashboardWatchlistRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
}

export interface DashboardHoldingRow {
  readonly stock_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly quantity: string;
  readonly market_value: string;
  readonly current_price: string;
}

export interface DashboardTradeRow {
  readonly trade_id: string;
  readonly symbol: string;
  readonly side: string;
  readonly quantity: string;
  readonly gross_amount: string;
  readonly created_at: string;
}

export interface DashboardAlertEvent {
  readonly event_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly trigger_price: string;
  readonly trigger_day_change_bps: number;
  readonly triggered_at: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Z][A-Z0-9]{1,7}$/;
const INTEGER = /^(0|[1-9][0-9]*)$/;
const SIGNED = /^(0|[1-9][0-9]*|-[1-9][0-9]*)$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

const object = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const uuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);
const symbol = (value: unknown): value is string => typeof value === 'string' && SYMBOL.test(value);
const label = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= 160;
const integer = (value: unknown, allowZero = false): value is string =>
  typeof value === 'string' && value.length <= 38 && INTEGER.test(value) && (allowZero || value !== '0');
const stockInteger = (value: unknown): value is string =>
  integer(value) && BigInt(value) <= 9223372036854775807n;
const signed = (value: unknown): value is string => typeof value === 'string' && value.length <= 128 && SIGNED.test(value);
const timestamp = (value: unknown): value is string =>
  typeof value === 'string' && ISO.test(value) && Number.isFinite(Date.parse(value));

function rows<T>(payload: unknown, key: string, max: number, idKey: string, validate: (value: unknown) => value is T): readonly T[] | null {
  const source = object(payload);
  if (!source || !Array.isArray(source[key]) || source[key].length > max) return null;
  const seen = new Set<string>();
  const symbols = new Set<string>();
  for (const item of source[key]) {
    const row = object(item);
    if (!row || !validate(item) || typeof row[idKey] !== 'string') return null;
    const id = row[idKey].toLowerCase();
    if (seen.has(id)) return null;
    if (key === 'stocks' || key === 'holdings') {
      if (typeof row.symbol !== 'string' || symbols.has(row.symbol)) return null;
      symbols.add(row.symbol);
    }
    seen.add(id);
  }
  return source[key] as T[];
}

const validWatchlist = (value: unknown): value is DashboardWatchlistRow => {
  const row = object(value);
  return !!row && uuid(row.stock_id) && symbol(row.symbol) && label(row.name) &&
    stockInteger(row.current_price) && stockInteger(row.day_open_price);
};

const validHolding = (value: unknown): value is DashboardHoldingRow => {
  const row = object(value);
  return !!row && uuid(row.stock_id) && symbol(row.symbol) && label(row.name) &&
    stockInteger(row.quantity) && integer(row.market_value, true) && stockInteger(row.current_price);
};

const validTrade = (value: unknown): value is DashboardTradeRow => {
  const row = object(value);
  return !!row && uuid(row.trade_id) && symbol(row.symbol) &&
    (row.side === 'buy' || row.side === 'sell') && integer(row.quantity) &&
    integer(row.gross_amount) && timestamp(row.created_at);
};

const validAlert = (value: unknown): value is DashboardAlertEvent => {
  const row = object(value);
  return !!row && uuid(row.event_id) && symbol(row.symbol) && label(row.name) &&
    stockInteger(row.trigger_price) && typeof row.trigger_day_change_bps === 'number' &&
    Number.isSafeInteger(row.trigger_day_change_bps) && timestamp(row.triggered_at);
};

/** A failed or malformed owner read is unknown, never an empty verified list. */
export const dashboardWatchlist = (payload: unknown) => rows(payload, 'stocks', 500, 'stock_id', validWatchlist);
export const dashboardPortfolio = (payload: unknown) => rows(payload, 'holdings', 500, 'stock_id', validHolding);
export const dashboardHistory = (payload: unknown) => rows(payload, 'trades', 50, 'trade_id', validTrade);
export const dashboardAlerts = (payload: unknown) => rows(payload, 'events', 5, 'event_id', validAlert);

/** Wallet balances are exact signed integer strings; the total must equal both owner pockets. */
export function dashboardWallet(payload: unknown): Overview | null {
  const wallet = object(payload);
  const balances = object(wallet?.balances);
  const cash = object(balances?.cash);
  const bank = object(balances?.bank);
  if (!wallet || !uuid(wallet.userId) || !balances || balances.currency !== 'WLD' ||
      !cash || !bank || !signed(cash.availableAmount) || !signed(bank.availableAmount) ||
      !timestamp(cash.updatedAt) || !timestamp(bank.updatedAt) || !signed(balances.totalAvailableAmount) ||
      BigInt(cash.availableAmount) + BigInt(bank.availableAmount) !== BigInt(balances.totalAvailableAmount) ||
      !Array.isArray(wallet.recentTransactions) || wallet.recentTransactions.length > 6 ||
      (wallet.recentTransactionsHasMore !== undefined && typeof wallet.recentTransactionsHasMore !== 'boolean')) return null;
  const ids = new Set<string>();
  for (const value of wallet.recentTransactions) {
    const entry = object(value);
    if (!entry || !uuid(entry.transactionId) || ids.has(entry.transactionId.toLowerCase()) ||
        !label(entry.label) || !signed(entry.netAmount) || !timestamp(entry.occurredAt) ||
        !['in', 'out', 'neutral'].includes(String(entry.direction)) ||
        (entry.cashDelta !== undefined && !signed(entry.cashDelta)) ||
        (entry.bankDelta !== undefined && !signed(entry.bankDelta))) return null;
    ids.add(entry.transactionId.toLowerCase());
  }
  return payload as Overview;
}
