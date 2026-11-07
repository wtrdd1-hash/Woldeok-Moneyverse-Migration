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

/** Filtering is deliberately limited to the source's latest 50 public rows. */
export function parseBoardMinimumReplies(value: unknown): { minimum: number | null; invalid: boolean } {
  if (value === undefined) return { minimum: null, invalid: false };
  if (typeof value !== 'string' || !['1', '5', '10'].includes(value)) return { minimum: null, invalid: true };
  return { minimum: Number(value), invalid: false };
}

/** An old backend can ignore the filter, even when it returns an empty success. */
export function isVerifiedBoardMinimumReplies(payload: unknown, minimum: number): boolean {
  if (![1, 5, 10].includes(minimum) || !payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const source = payload as Record<string, unknown>;
  const filters = source.filters;
  if (!filters || typeof filters !== 'object' || Array.isArray(filters) ||
      (filters as Record<string, unknown>).minReplies !== minimum ||
      (filters as Record<string, unknown>).scope !== 'latest50' ||
      !Array.isArray(source.posts) || source.posts.length > 50) return false;
  const ids = new Set<string>();
  for (const post of source.posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return false;
    const row = post as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.postId) || ids.has(row.postId.toLowerCase())) return false;
    if (typeof row.commentCount !== 'number' || !Number.isSafeInteger(row.commentCount) || row.commentCount < minimum) return false;
    ids.add(row.postId.toLowerCase());
  }
  return true;
}
