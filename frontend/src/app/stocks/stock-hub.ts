export type StockHaltStatus = 'ACTIVE' | 'HALTING' | 'HALTED_SETTLING' | 'HALTED_SETTLED' | 'HALTED';

export interface HubStock {
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
  readonly halt_status?: StockHaltStatus;
  readonly halted_at?: string | null;
  readonly active?: boolean;
}

export interface HubHolding {
  readonly stock_id: string;
  readonly quantity: string;
  readonly average_cost: string;
  readonly market_value: string;
  readonly current_price: string;
  readonly halt_status?: StockHaltStatus;
}

export function normalizeStockSymbol(value: string): string | null {
  const symbol = value.trim().toUpperCase();
  return /^[A-Z0-9._-]{1,16}$/.test(symbol) ? symbol : null;
}

export function findStockBySymbol(stocks: readonly HubStock[], value: string): HubStock | null {
  const symbol = normalizeStockSymbol(value);
  if (!symbol) return null;
  return stocks.find((stock) => stock.symbol.toUpperCase() === symbol) ?? null;
}

export function findHoldingForStock(
  holdings: readonly HubHolding[],
  stockId: string,
): HubHolding | null {
  return holdings.find((holding) => holding.stock_id === stockId) ?? null;
}
