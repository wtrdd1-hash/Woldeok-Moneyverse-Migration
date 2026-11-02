/** Sorts only the latest public 50-row source snapshot, not the full archive. */
export function parseBoardSymbolOrder(value: unknown): {
  readonly sort: 'recent' | 'stock-symbol'; readonly invalid: boolean;
} {
  if (value === undefined || value === 'recent') return { sort: 'recent', invalid: false };
  if (value === 'stock-symbol') return { sort: 'stock-symbol', invalid: false };
  return { sort: 'recent', invalid: true };
}
