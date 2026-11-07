/** The public board source exposes only the latest 50 posts; never claim archive coverage. */
export function parseBoardUnansweredFilter(value: unknown): { enabled: boolean; invalid: boolean } {
  if (value === undefined) return { enabled: false, invalid: false };
  return value === '1' ? { enabled: true, invalid: false } : { enabled: false, invalid: true };
}

const POST_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** An old backend may silently ignore a query parameter and still return HTTP 200. */
export function isVerifiedUnansweredBoardResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  const filters = payload.appliedFilters;
  if (!filters || typeof filters !== 'object' || Array.isArray(filters) ||
      (filters as Record<string, unknown>).unansweredOnly !== true ||
      (filters as Record<string, unknown>).scope !== 'latest50') return false;
  if (!Array.isArray(payload.posts) || payload.posts.length > 50) return false;
  const seen = new Set<string>();
  for (const item of payload.posts) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const row = item as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !POST_UUID.test(row.postId) ||
        row.commentCount !== 0 || seen.has(row.postId.toLowerCase())) return false;
    seen.add(row.postId.toLowerCase());
  }
  return true;
}
