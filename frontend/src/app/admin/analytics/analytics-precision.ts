import type { AdminStock, AdminUser } from '../types';

const QUINTILE_LABELS = [
  '5분위 (상위 20%)', '4분위 (20~40%)', '3분위 (40~60%)',
  '2분위 (60~80%)', '1분위 (하위 20%)',
] as const;
const QUINTILE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899'] as const;

export interface WealthQuintile {
  readonly label: string;
  readonly color: string;
  readonly count: number;
  readonly totalWealth: bigint;
  readonly avgWealth: bigint;
  readonly ratio: string;
}

export interface StockCapitalization {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly cap: bigint;
  readonly price: bigint;
  readonly shares: bigint;
  readonly trades: number;
  readonly active: boolean;
}

function exactNonnegativeInteger(value: unknown): bigint | null {
  // The PostgreSQL numeric read model must not be rounded through IEEE-754.
  if (typeof value !== 'string' || value.length > 40 || !/^(0|[1-9][0-9]*)$/.test(value)) return null;
  return BigInt(value);
}

function shareTenths(part: bigint, total: bigint): string {
  if (total === 0n) return '0.0';
  const tenths = (part * 1000n + total / 2n) / total;
  return `${tenths / 10n}.${tenths % 10n}`;
}

/** Validate the admin-only read-model envelope before it reaches client cohort logic. */
export function parseAnalyticsUsers(value: unknown): readonly AdminUser[] | null {
  if (!value || typeof value !== 'object' || !('users' in value)) return null;
  const rows = value.users;
  if (!Array.isArray(rows) || rows.length > 1000) return null;
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)
      || typeof row.user_id !== 'string' || !row.user_id || seen.has(row.user_id)
      || typeof row.status !== 'string' || typeof row.display_name !== 'string'
      || typeof row.created_at !== 'string' || !Number.isFinite(Date.parse(row.created_at))
      || (row.is_admin !== undefined && typeof row.is_admin !== 'boolean')) return null;
    for (const key of ['last_login_at', 'last_seen_at', 'last_admin_at'] as const) {
      const date = row[key];
      if (date !== undefined && date !== null &&
        (typeof date !== 'string' || !Number.isFinite(Date.parse(date)))) return null;
    }
    seen.add(row.user_id);
  }
  return rows as readonly AdminUser[];
}

/** An admin list is a bounded sample, never the platform-wide wealth distribution. */
export function calculateWealthQuintiles(users: readonly Pick<AdminUser, 'user_id' | 'total_net_worth'>[]): readonly WealthQuintile[] | null {
  if (users.length > 1000) return null;
  const seen = new Set<string>();
  const wealth: bigint[] = [];
  for (const user of users) {
    if (!user || typeof user !== 'object' || typeof user.user_id !== 'string' || !user.user_id || seen.has(user.user_id)) return null;
    const amount = exactNonnegativeInteger(user.total_net_worth);
    if (amount === null) return null;
    seen.add(user.user_id);
    wealth.push(amount);
  }
  if (wealth.length === 0) return [];
  wealth.sort((a, b) => a === b ? 0 : a > b ? -1 : 1);
  const total = wealth.reduce((sum, amount) => sum + amount, 0n);
  const base = Math.floor(wealth.length / 5);
  const remainder = wealth.length % 5;
  let offset = 0;
  return QUINTILE_LABELS.map((label, index) => {
    const count = base + (index < remainder ? 1 : 0);
    const group = wealth.slice(offset, offset + count);
    offset += count;
    const totalWealth = group.reduce((sum, amount) => sum + amount, 0n);
    return {
      label, color: QUINTILE_COLORS[index]!, count, totalWealth,
      avgWealth: count > 0 ? (totalWealth + BigInt(Math.floor(count / 2))) / BigInt(count) : 0n,
      ratio: shareTenths(totalWealth, total),
    };
  });
}

/** Reject the entire stock sample if one row could falsify top-five capitalization. */
export function calculateStockCapitalization(stocks: readonly AdminStock[]): readonly StockCapitalization[] | null {
  if (stocks.length > 10000) return null;
  const seen = new Set<string>();
  const rows: StockCapitalization[] = [];
  for (const stock of stocks) {
    if (!stock || typeof stock !== 'object') return null;
    const price = exactNonnegativeInteger(stock.current_price);
    const shares = exactNonnegativeInteger(stock.shares_outstanding);
    if (price === null || shares === null || typeof stock.id !== 'string' || !stock.id
      || seen.has(stock.id) || typeof stock.symbol !== 'string' || !stock.symbol.trim()
      || typeof stock.name !== 'string' || !stock.name.trim()
      || !Number.isSafeInteger(stock.trades) || stock.trades < 0
      || typeof stock.active !== 'boolean'
      || (stock.halt_status !== undefined && typeof stock.halt_status !== 'string')) return null;
    seen.add(stock.id);
    rows.push({
      id: stock.id, symbol: stock.symbol, name: stock.name,
      cap: price * shares, price, shares, trades: stock.trades,
      active: stock.active && (!stock.halt_status || stock.halt_status === 'ACTIVE'),
    });
  }
  rows.sort((a, b) => a.cap === b.cap ? a.id.localeCompare(b.id) : a.cap > b.cap ? -1 : 1);
  return rows.slice(0, 5);
}

/** A malformed 200 from the stock admin read endpoint is not an empty market. */
export function parseAnalyticsStocks(value: unknown): readonly AdminStock[] | null {
  if (!value || typeof value !== 'object' || !('stocks' in value)) return null;
  const rows = value.stocks;
  if (!Array.isArray(rows)) return null;
  return calculateStockCapitalization(rows as readonly AdminStock[]) === null ? null : rows as readonly AdminStock[];
}
