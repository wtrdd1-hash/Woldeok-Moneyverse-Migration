/** Title ordering is opt-in; default remains the original recent-first snapshot. */
export function parseBoardTitleOrder(value: unknown): { order: 'title' | null; invalid: boolean } {
  if (value === undefined) return { order: null, invalid: false };
  return value === 'title' ? { order: 'title', invalid: false } : { order: null, invalid: true };
}
