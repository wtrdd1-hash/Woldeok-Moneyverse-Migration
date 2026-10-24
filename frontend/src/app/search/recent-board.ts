const POST_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface RecentPublicBoardPost {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
}

export function normalizeSearchQuery(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().slice(0, 80) : '';
}

/**
 * The existing public endpoint returns at most 50 recent published posts.
 * Never label this bounded title lookup as a full-history board search.
 */
export function filterRecentPublicBoardPosts(
  payload: unknown,
  query: string,
  limit = 10,
): readonly RecentPublicBoardPost[] | null {
  if (typeof payload !== 'object' || payload === null || !('posts' in payload) || !Array.isArray(payload.posts)) {
    return null;
  }

  const recent = payload.posts.slice(0, 50);
  if (recent.some((item: unknown) =>
    typeof item !== 'object' || item === null ||
    !('title' in item) || typeof item.title !== 'string' ||
    !('authorName' in item) || typeof item.authorName !== 'string' ||
    !('postId' in item) || typeof item.postId !== 'string'
  )) {
    return null;
  }

  const term = normalizeSearchQuery(query).toLocaleLowerCase();
  if (!term) return [];
  const maximum = Number.isFinite(limit) ? Math.min(10, Math.max(1, Math.floor(limit))) : 10;
  const found: RecentPublicBoardPost[] = [];
  const seen = new Set<string>();
  for (const item of recent as RecentPublicBoardPost[]) {
    if (!POST_UUID.test(item.postId) || seen.has(item.postId)) continue;
    if (!item.title.toLocaleLowerCase().includes(term)) continue;
    seen.add(item.postId);
    found.push({ postId: item.postId, title: item.title, authorName: item.authorName });
    if (found.length === maximum) break;
  }
  return found;
}
