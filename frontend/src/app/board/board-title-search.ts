/** Only searches the latest 50 publicly visible board posts, never the full archive. */
export function parseBoardTitleQuery(value: unknown): { query: string | null; invalid: boolean } {
  if (value === undefined) return { query: null, invalid: false };
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > 80 ||
    /[<>\u0000-\u001f\u007f]/.test(value)
  ) {
    return { query: null, invalid: true };
  }
  return { query: value.trim(), invalid: false };
}

/** Reply filtering applies to the same latest 50 public posts as title search. */
export function parseBoardRepliesFilter(
  value: unknown,
): { replies: 'all' | 'with' | 'without'; invalid: boolean } {
  if (value === undefined || value === 'all') return { replies: 'all', invalid: false };
  if (value === 'with' || value === 'without') return { replies: value, invalid: false };
  return { replies: 'all', invalid: true };
}
