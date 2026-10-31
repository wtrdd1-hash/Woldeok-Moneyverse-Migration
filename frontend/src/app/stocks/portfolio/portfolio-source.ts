import type { PortfolioHoldingInput } from './analysis';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Za-z0-9._-]{1,30}$/;
const CANONICAL_AMOUNT = /^(0|[1-9][0-9]*)$/;
const MAX_DB_BIGINT = 9_223_372_036_854_775_807n;

/** Accept only owner-scoped DB read-function shapes; unknown is not an empty portfolio. */
export function parsePortfolioResponse(payload: unknown): PortfolioHoldingInput[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const holdings = (payload as { holdings?: unknown }).holdings;
  if (!Array.isArray(holdings) || holdings.length > 100) return null;

  const ids = new Set<string>();
  const symbols = new Set<string>();
  const result: PortfolioHoldingInput[] = [];
  for (const value of holdings) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const row = value as Record<string, unknown>;
    if (typeof row.stock_id !== 'string' || !UUID.test(row.stock_id) ||
        typeof row.symbol !== 'string' || !SYMBOL.test(row.symbol) ||
        typeof row.name !== 'string' || row.name.trim().length < 1 || row.name.length > 120 ||
        !['ACTIVE', 'HALTING', 'HALTED_SETTLING', 'HALTED_SETTLED'].includes(String(row.halt_status))) return null;

    const id = row.stock_id.toLowerCase();
    const symbol = row.symbol.toUpperCase();
    if (ids.has(id) || symbols.has(symbol)) return null;
    ids.add(id);
    symbols.add(symbol);

    const numbers: Record<string, bigint> = {};
    for (const key of ['quantity', 'average_cost', 'current_price', 'market_value'] as const) {
      const raw = row[key];
      if (typeof raw !== 'string' || !CANONICAL_AMOUNT.test(raw)) return null;
      const parsed = BigInt(raw);
      if (parsed > MAX_DB_BIGINT) return null;
      numbers[key] = parsed;
    }
    if (numbers.quantity === 0n ||
        numbers.market_value !== numbers.quantity! * numbers.current_price!) return null;

    result.push({
      stock_id: row.stock_id,
      symbol: row.symbol,
      name: row.name,
      quantity: row.quantity as string,
      average_cost: row.average_cost as string,
      current_price: row.current_price as string,
      market_value: row.market_value as string,
      halt_status: row.halt_status as 'ACTIVE' | 'HALTING' | 'HALTED_SETTLING' | 'HALTED_SETTLED',
    });
  }
  return result;
}

export interface StockHaltReceipt {
  readonly id: string;
  readonly halt_event_id: string;
  readonly stock_id: string;
  readonly stock_symbol: string;
  readonly stock_name: string;
  readonly quantity: string;
  readonly basis_method: string;
  readonly basis_unit_amount: string;
  readonly refund_amount: string;
  readonly status: 'settled' | 'settling' | 'quarantined';
  readonly created_at: string;
}

/** Preserve the difference between no receipts and a failed private source. */
export function parseStockHaltReceipts(payload: unknown): StockHaltReceipt[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const receipts = (payload as { receipts?: unknown }).receipts;
  if (!Array.isArray(receipts) || receipts.length > 50) return null;
  const seen = new Set<string>();
  const result: StockHaltReceipt[] = [];
  for (const raw of receipts) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const row = raw as Record<string, unknown>;
    if (typeof row.id !== 'string' || !UUID.test(row.id) || seen.has(row.id.toLowerCase()) ||
        typeof row.halt_event_id !== 'string' || !UUID.test(row.halt_event_id) ||
        typeof row.stock_id !== 'string' || !UUID.test(row.stock_id) ||
        typeof row.stock_symbol !== 'string' || !SYMBOL.test(row.stock_symbol) ||
        typeof row.stock_name !== 'string' || !row.stock_name.trim() || row.stock_name.length > 120 ||
        row.basis_method !== 'average_cost' ||
        (row.status !== 'settled' && row.status !== 'settling' && row.status !== 'quarantined') ||
        typeof row.created_at !== 'string' || !Number.isFinite(Date.parse(row.created_at))) return null;
    const amounts: Record<string, bigint> = {};
    for (const key of ['quantity', 'basis_unit_amount', 'refund_amount'] as const) {
      const value = row[key];
      if (typeof value !== 'string' || !CANONICAL_AMOUNT.test(value)) return null;
      const parsed = BigInt(value);
      if (parsed > MAX_DB_BIGINT) return null;
      amounts[key] = parsed;
    }
    if (row.status === 'settled' && (amounts.quantity === 0n || amounts.basis_unit_amount === 0n || amounts.refund_amount === 0n ||
        amounts.quantity! * amounts.basis_unit_amount! !== amounts.refund_amount)) return null;
    if (row.status !== 'settled' && amounts.refund_amount !== 0n) return null;
    seen.add(row.id.toLowerCase());
    result.push(row as unknown as StockHaltReceipt);
  }
  return result;
}
