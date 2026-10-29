/** Canonicalize public help keywords without changing their language or spelling. */
export function normalizeVerifiedHelpQuery(input: unknown): string | null {
  if (typeof input !== 'string' || Array.from(input).length > 100) return null;
  return input.replace(/\s+/gu, ' ').trim();
}
