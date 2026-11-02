/** Public market rows come from stock_market_overview(), not browser-generated quotes. */
export interface PublicMarketStock {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly day_high_price: string;
  readonly day_low_price: string;
  readonly shares_outstanding: string;
  readonly shares_available: string;
  readonly halt_status: 'ACTIVE' | 'HALTING' | 'HALTED_SETTLING' | 'HALTED_SETTLED';
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Z][A-Z0-9]{1,7}$/;
const POSITIVE = /^[1-9][0-9]{0,37}$/;
const NONNEGATIVE = /^(?:0|[1-9][0-9]{0,37})$/;
const HALT_STATES = new Set(['ACTIVE', 'HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED']);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function verifiedRow(value: unknown): value is PublicMarketStock {
  if (!record(value)) return false;
  if (typeof value.id !== 'string' || !UUID.test(value.id) ||
      typeof value.symbol !== 'string' || !SYMBOL.test(value.symbol) ||
      typeof value.name !== 'string' || value.name.trim().length === 0 || value.name.length > 80 ||
      typeof value.description !== 'string' || value.description.length > 500 ||
      typeof value.halt_status !== 'string' || !HALT_STATES.has(value.halt_status)) return false;
  for (const key of ['current_price', 'day_open_price', 'day_high_price', 'day_low_price'] as const) {
    if (typeof value[key] !== 'string' || !POSITIVE.test(value[key])) return false;
  }
  for (const key of ['shares_outstanding', 'shares_available'] as const) {
    if (typeof value[key] !== 'string' || !NONNEGATIVE.test(value[key])) return false;
  }
  if (BigInt(value.day_low_price as string) > BigInt(value.day_high_price as string)) return false;
  return true;
}

/** null means unverified; [] means a successfully verified empty public market. */
export function parsePublicMarket(value: unknown): readonly PublicMarketStock[] | null {
  if (!record(value) || !Array.isArray(value.stocks) || value.stocks.length > 100) return null;
  const ids = new Set<string>();
  const symbols = new Set<string>();
  for (const row of value.stocks) {
    if (!verifiedRow(row) || ids.has(row.id.toLowerCase()) || symbols.has(row.symbol)) return null;
    ids.add(row.id.toLowerCase());
    symbols.add(row.symbol);
  }
  return value.stocks as PublicMarketStock[];
}

/** One decimal place with exact integers; very small nonzero moves stay visible. */
export function marketDayChange(current: string, open: string): string {
  const delta = BigInt(current) - BigInt(open);
  if (delta === 0n) return '0.0%';
  const base = BigInt(open);
  const abs = delta < 0n ? -delta : delta;
  const tenths = (abs * 1000n + base / 2n) / base;
  const prefix = delta > 0n ? '+' : '−';
  if (tenths === 0n) return `${prefix}<0.1%`;
  return `${prefix}${tenths / 10n}.${tenths % 10n}%`;
}
