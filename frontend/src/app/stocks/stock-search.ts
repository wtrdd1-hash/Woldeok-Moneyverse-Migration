export interface SearchableStock {
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
}

export function normalizeStockQuery(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim().slice(0, 80) ?? '';
}

export function filterStocks<T extends SearchableStock>(
  stocks: readonly T[],
  query: string,
  locale: string,
): T[] {
  const normalized = query.toLocaleLowerCase(locale);
  if (!normalized) return [...stocks];

  return stocks.filter((stock) =>
    [stock.symbol, stock.name, stock.description].some((value) =>
      value.toLocaleLowerCase(locale).includes(normalized),
    ),
  );
}
