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
