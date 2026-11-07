/** A legacy or stale API cannot claim an exact match with success-shaped empty rows. */
export function isVerifiedExactBoard(payload: unknown, title: string, stock?: string | null): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const response = payload as Record<string, unknown>;
  if (response.titleMatch !== 'exact' || response.titleQuery !== title || !Array.isArray(response.posts) || response.posts.length > 50) return false;
  const seen = new Set<string>();
  for (const entry of response.posts) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const post = entry as Record<string, unknown>;
    if (typeof post.postId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(post.postId)) return false;
    const id = post.postId.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    if (typeof post.title !== 'string' || post.title.toLowerCase() !== title.toLowerCase() || post.title.length > 120 ||
        typeof post.authorName !== 'string' || post.authorName.length > 120 ||
        typeof post.createdAt !== 'string' || !Number.isFinite(Date.parse(post.createdAt)) ||
        typeof post.commentCount !== 'number' || !Number.isSafeInteger(post.commentCount) || post.commentCount < 0 || post.mine !== false) return false;
    if (stock) {
      if (!post.stock || typeof post.stock !== 'object' || (post.stock as Record<string, unknown>).symbol?.toString().toUpperCase() !== stock.toUpperCase()) return false;
    }
  }
  return true;
}
