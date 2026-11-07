/** Sorts only the latest 50 verified public posts, not the full archive. */
export function parseBoardStockSort(value: unknown): {
  sort: 'recent' | 'stock'; invalid: boolean;
} {
  if (value === undefined || value === 'recent') return { sort: 'recent', invalid: false };
  if (value === 'stock') return { sort: 'stock', invalid: false };
  return { sort: 'recent', invalid: true };
}
