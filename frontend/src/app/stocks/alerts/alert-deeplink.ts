import type { AlertStock } from './alert-manager';

export function resolveInitialAlertStockId(
  stocks: readonly AlertStock[],
  stockParam: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(stockParam) ? stockParam[0] : stockParam;
  const symbol = raw?.trim().toUpperCase();
  if (!symbol) return undefined;
  return stocks.find((stock) => stock.symbol.toUpperCase() === symbol)?.id;
}
