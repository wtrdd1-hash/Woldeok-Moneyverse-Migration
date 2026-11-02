/** Only the latest 50 public rows are eligible for stock-name discovery. */
export function parseBoardStockName(value: unknown): { query: string | null; invalid: boolean } {
  if (value === undefined) return { query: null, invalid: false };
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 80 ||
      /[<>\u0000-\u001f\u007f]/.test(value)) {
    return { query: null, invalid: true };
  }
  return { query: value.trim(), invalid: false };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** A legacy backend's success-shaped empty list is not proof that a filter ran. */
export function isVerifiedBoardStockName(payload: unknown, name: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (data.sourceWindow !== 50 || data.stockNameFilter !== name ||
      !Array.isArray(data.posts) || data.posts.length > 50) return false;
  const ids = new Set<string>();
  for (const value of data.posts) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const post = value as Record<string, unknown>;
    if (typeof post.postId !== 'string' || !UUID.test(post.postId) ||
        ids.has(post.postId.toLowerCase()) || typeof post.title !== 'string' ||
        !post.title.trim() || typeof post.commentCount !== 'number' ||
        !Number.isSafeInteger(post.commentCount) || post.commentCount < 0 ||
        typeof post.createdAt !== 'string' || !Number.isFinite(Date.parse(post.createdAt))) return false;
    ids.add(post.postId.toLowerCase());
    if (!post.stock || typeof post.stock !== 'object' || Array.isArray(post.stock)) return false;
    const stock = post.stock as Record<string, unknown>;
    if (typeof stock.name !== 'string' || !stock.name.toLowerCase().includes(name.toLowerCase())) return false;
  }
  return true;
}
