/** Android and web must not accept a legacy backend's unverified sorted HTTP 200. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Za-z0-9._-]{1,16}$/;

export function isVerifiedBoardSymbolOrder(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (data.sortApplied !== 'stock-symbol' || !Array.isArray(data.posts) || data.posts.length > 50) return false;
  const seen = new Set<string>();
  let previous: readonly [number, string, string] | null = null;
  for (const row of data.posts) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const post = row as Record<string, unknown>;
    if (typeof post.postId !== 'string' || !UUID.test(post.postId) ||
        typeof post.title !== 'string' || !post.title.trim() || post.title.length > 120 ||
        typeof post.authorName !== 'string' || !post.authorName.trim() ||
        typeof post.createdAt !== 'string' || !Number.isFinite(Date.parse(post.createdAt)) ||
        !Number.isSafeInteger(post.commentCount) || (post.commentCount as number) < 0 ||
        post.mine !== false || typeof post.hasImage !== 'boolean') return false;
    const id = post.postId.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    let symbol = '';
    let untagged = 1;
    if (post.stock !== null) {
      if (!post.stock || typeof post.stock !== 'object' || Array.isArray(post.stock)) return false;
      const stock = post.stock as Record<string, unknown>;
      if (typeof stock.stockId !== 'string' || !UUID.test(stock.stockId) ||
          typeof stock.symbol !== 'string' || !SYMBOL.test(stock.symbol)) return false;
      symbol = stock.symbol.toUpperCase();
      untagged = 0;
    }
    const current: readonly [number, string, string] = [untagged, symbol, id];
    if (previous && (current[0] < previous[0] ||
        (current[0] === previous[0] && (current[1] < previous[1] ||
          (current[1] === previous[1] && current[2] < previous[2]))))) return false;
    previous = current;
  }
  return true;
}
