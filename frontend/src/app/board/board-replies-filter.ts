/** An explicit opt-in: absence preserves the public board's existing list. */
export function parseBoardRepliedFilter(value: unknown): { enabled: boolean; invalid: boolean } {
  if (value === undefined) return { enabled: false, invalid: false };
  if (value === '1') return { enabled: true, invalid: false };
  return { enabled: false, invalid: true };
}

/** A stale backend must not claim that a filtered empty list is verified. */
export function isVerifiedRepliedPosts(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  const applied = data.appliedFilters;
  if (!applied || typeof applied !== 'object' || Array.isArray(applied) ||
      (applied as Record<string, unknown>).repliedOnly !== true ||
      (applied as Record<string, unknown>).scope !== 'latest50') return false;
  if (!Array.isArray(data.posts) || data.posts.length > 50) return false;
  const ids = new Set<string>();
  for (const row of data.posts) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const post = row as Record<string, unknown>;
    if (typeof post.postId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(post.postId)) return false;
    const canonicalPostId = post.postId.toLowerCase();
    if (ids.has(canonicalPostId)) return false;
    if (typeof post.commentCount !== 'number' || !Number.isSafeInteger(post.commentCount) ||
        post.commentCount < 1) return false;
    ids.add(canonicalPostId);
  }
  return true;
}
