/** A chronological view of the latest 50 public board posts, not the archive. */
export type BoardOrder = 'newest' | 'oldest';
export function parseBoardOrder(value: unknown): {
  order: BoardOrder; explicit: boolean; invalid: boolean;
} {
  if (value === undefined) return { order: 'newest', explicit: false, invalid: false };
  if (value === 'newest' || value === 'oldest') {
    return { order: value, explicit: true, invalid: false };
  }
  return { order: 'newest', explicit: true, invalid: true };
}

/** Android may only display ordered rows when the backend explicitly confirms the filter. */
export function isVerifiedBoardOrderPayload(payload: unknown, order: BoardOrder): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const value = payload as Record<string, unknown>;
  if (value.order !== order || !Array.isArray(value.posts) || value.posts.length > 50) return false;
  const seen = new Set<string>();
  let last: number | undefined;
  for (const post of value.posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return false;
    const row = post as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !row.postId || seen.has(row.postId) ||
        typeof row.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.createdAt)) return false;
    const time = Date.parse(row.createdAt);
    if (!Number.isFinite(time) ||
        (last !== undefined && (order === 'oldest' ? time < last : time > last))) return false;
    seen.add(row.postId);
    last = time;
  }
  return true;
}
