const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isVerifiedBoardDiscussionOrder(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (data.sortApplied !== 'discussed' || !Array.isArray(data.posts) || data.posts.length > 50) return false;
  const ids = new Set<string>();
  let previousCount = Infinity;
  let previousTime = Infinity;
  for (const value of data.posts) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const row = value as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !UUID.test(row.postId)) return false;
    const id = row.postId.toLowerCase();
    if (ids.has(id)) return false;
    ids.add(id);
    if (typeof row.title !== 'string' || row.title.length === 0 || row.title.length > 120 ||
        typeof row.authorName !== 'string' || row.authorName.length === 0 || row.authorName.length > 120 ||
        typeof row.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.createdAt) ||
        !Number.isSafeInteger(row.commentCount) || (row.commentCount as number) < 0) return false;
    const time = Date.parse(row.createdAt);
    if (!Number.isFinite(time)) return false;
    const count = row.commentCount as number;
    if (count > previousCount || (count === previousCount && time > previousTime)) return false;
    previousCount = count;
    previousTime = time;
  }
  return true;
}
