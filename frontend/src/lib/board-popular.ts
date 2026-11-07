/** Explicit popular ordering applies only to the 50 newest public posts. */
export function parseBoardPopularSort(value: string | string[] | undefined): {
  readonly enabled: boolean;
  readonly invalid: boolean;
} {
  if (value === undefined || value === 'recent') return { enabled: false, invalid: false };
  return value === 'popular' ? { enabled: true, invalid: false } : { enabled: false, invalid: true };
}

const POST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Fail closed if the backend did not actually apply the requested ordering. */
export function isVerifiedPopularBoardResponse(payload: unknown): payload is {
  readonly posts: readonly { readonly postId: string; readonly commentCount: number; readonly createdAt: string }[];
  readonly appliedSort: { readonly order: 'popular'; readonly scope: 'latest50' };
} {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  const marker = data.appliedSort;
  if (!marker || typeof marker !== 'object' || Array.isArray(marker) ||
      (marker as Record<string, unknown>).order !== 'popular' ||
      (marker as Record<string, unknown>).scope !== 'latest50') return false;
  if (!Array.isArray(data.posts) || data.posts.length > 50) return false;
  let previousCount = Infinity;
  let previousTime = Infinity;
  const ids = new Set<string>();
  for (const item of data.posts) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const row = item as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !POST_ID.test(row.postId) || ids.has(row.postId.toLowerCase())) return false;
    if (typeof row.commentCount !== 'number' || !Number.isSafeInteger(row.commentCount) || row.commentCount < 0) return false;
    if (typeof row.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.createdAt)) return false;
    const time = Date.parse(row.createdAt);
    if (!Number.isFinite(time) || row.commentCount > previousCount ||
        (row.commentCount === previousCount && time > previousTime)) return false;
    ids.add(row.postId.toLowerCase());
    previousCount = row.commentCount;
    previousTime = time;
  }
  return true;
}
