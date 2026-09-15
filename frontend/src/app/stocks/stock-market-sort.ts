export type StockSort = 'default' | 'name' | 'price' | 'change' | 'available';

export interface SortableStock {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly current_price: string;
  readonly day_open_price: string;
  readonly shares_available: string;
}

export function normalizeStockSort(value: string | undefined): StockSort {
  return value === 'name' || value === 'price' || value === 'change' || value === 'available'
    ? value
    : 'default';
}

function integer(value: string): bigint {
  return /^-?\d+$/.test(value) ? BigInt(value) : 0n;
}

function compareChange(a: SortableStock, b: SortableStock): number {
  const aOpen = integer(a.day_open_price);
  const bOpen = integer(b.day_open_price);
  if (aOpen <= 0n || bOpen <= 0n) return 0;
  const left = (integer(a.current_price) - aOpen) * bOpen;
  const right = (integer(b.current_price) - bOpen) * aOpen;
  return left === right ? 0 : left > right ? -1 : 1;
}

export function sortMarketStocks<T extends SortableStock>(
  stocks: readonly T[],
  sort: StockSort,
): T[] {
  if (sort === 'default') return [...stocks];
  return [...stocks].sort((a, b) => {
    let order = 0;
    if (sort === 'name') order = a.name.localeCompare(b.name);
    if (sort === 'price')
      order =
        integer(a.current_price) === integer(b.current_price)
          ? 0
          : integer(a.current_price) > integer(b.current_price)
            ? -1
            : 1;
    if (sort === 'available')
      order =
        integer(a.shares_available) === integer(b.shares_available)
          ? 0
          : integer(a.shares_available) > integer(b.shares_available)
            ? -1
            : 1;
    if (sort === 'change') order = compareChange(a, b);
    return order || a.symbol.localeCompare(b.symbol);
  });
}
