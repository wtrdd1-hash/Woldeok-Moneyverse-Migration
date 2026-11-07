/** Author ordering is opt-in; default remains the original recent-first snapshot. */
export function parseBoardAuthorOrder(value: unknown): { order: 'author' | null; invalid: boolean } {
  if (value === undefined) return { order: null, invalid: false };
  return value === 'author' ? { order: 'author', invalid: false } : { order: null, invalid: true };
}
