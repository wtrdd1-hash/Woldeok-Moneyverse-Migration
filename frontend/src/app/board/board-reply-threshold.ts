/** Exact, user-selectable thresholds; never silently normalize ambiguous input. */
export function parseBoardReplyThreshold(value: unknown): { minimum: number | null; invalid: boolean } {
  if (value === undefined) return { minimum: null, invalid: false };
  if (typeof value !== 'string' || !['2', '5', '10'].includes(value)) {
    return { minimum: null, invalid: true };
  }
  return { minimum: Number(value), invalid: false };
}
