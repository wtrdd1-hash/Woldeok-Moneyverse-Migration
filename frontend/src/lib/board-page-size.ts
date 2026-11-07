/** A bounded display selection within the existing 50 most recent public posts. */
export type BoardPageSize = 10 | 25 | 50;

export function parseBoardPageSize(value: unknown): BoardPageSize | null {
  if (value === undefined || value === '50') return 50;
  if (value === '10') return 10;
  if (value === '25') return 25;
  return null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isVerifiedBoardPageSizeResponse(payload: unknown, size: BoardPageSize): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const value = payload as Record<string, unknown>;
  if (value.limitApplied !== size || value.sourceWindow !== 50 ||
      !Array.isArray(value.posts) || value.posts.length > size) return false;
  const ids = new Set<string>();
  let previousTime = Infinity;
  let previousId = '';
  for (const item of value.posts) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const row = item as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !UUID.test(row.postId)) return false;
    const id = row.postId.toLowerCase();
    if (ids.has(id)) return false;
    ids.add(id);
    if (typeof row.title !== 'string' || row.title.length < 1 || row.title.length > 120 ||
        typeof row.authorName !== 'string' || row.authorName.length < 1 || row.authorName.length > 120 ||
        typeof row.commentCount !== 'number' || !Number.isSafeInteger(row.commentCount) || row.commentCount < 0 ||
        typeof row.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.createdAt)) return false;
    const timestamp = Date.parse(row.createdAt);
    if (!Number.isFinite(timestamp) || timestamp > previousTime ||
        (timestamp === previousTime && previousId && id > previousId)) return false;
    previousTime = timestamp;
    previousId = id;
  }
  return true;
}
