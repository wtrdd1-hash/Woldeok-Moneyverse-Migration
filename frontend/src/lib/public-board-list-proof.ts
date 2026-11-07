/** Validate the public latest-50 source before producing user-visible post links. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface VerifiedBoardPost {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly commentCount: number;
  readonly mine: false;
  readonly hasImage: boolean;
  readonly stock: null | {
    readonly stockId: string;
    readonly symbol: string;
    readonly name: string;
    readonly category: string;
    readonly stance: string;
    readonly positionDisclosure: string;
  };
}

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

function validText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

export function isVerifiedPublicBoardList(payload: unknown): payload is { posts: VerifiedBoardPost[] } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const posts = (payload as { posts?: unknown }).posts;
  if (!Array.isArray(posts) || posts.length > 50) return false;
  const seen = new Set<string>();
  for (const entry of posts) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const post = entry as Record<string, unknown>;
    if (typeof post.postId !== 'string' || !UUID.test(post.postId)) return false;
    const id = post.postId.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    if (!validText(post.title, 120) || !validText(post.authorName, 120) ||
        !validTimestamp(post.createdAt) ||
        (post.updatedAt !== null && !validTimestamp(post.updatedAt)) ||
        !Number.isSafeInteger(post.commentCount) || Number(post.commentCount) < 0 ||
        post.mine !== false || typeof post.hasImage !== 'boolean') return false;
    if (post.stock !== null) {
      if (!post.stock || typeof post.stock !== 'object' || Array.isArray(post.stock)) return false;
      const stock = post.stock as Record<string, unknown>;
      if (typeof stock.stockId !== 'string' || !UUID.test(stock.stockId) ||
          !validText(stock.symbol, 16) || !validText(stock.name, 120) ||
          !validText(stock.category, 40) || !validText(stock.stance, 40) ||
          !validText(stock.positionDisclosure, 40)) return false;
    }
  }
  return true;
}
