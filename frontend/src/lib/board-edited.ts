/** Verify the bounded public read-model, not a user-controlled or success-shaped fallback. */
export function isVerifiedEditedBoardPosts(payload: unknown, stock?: string | null, title?: string | null): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const posts = (payload as { posts?: unknown }).posts;
  if (!Array.isArray(posts) || posts.length > 50) return false;
  const seen = new Set<string>();
  for (const value of posts) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const row = value as Record<string, unknown>;
    if (typeof row.postId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.postId)) return false;
    const id = row.postId.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    if (typeof row.title !== 'string' || row.title.length < 1 || row.title.length > 120 ||
        typeof row.authorName !== 'string' || row.authorName.length < 1 || row.authorName.length > 120 ||
        row.mine !== false || typeof row.hasImage !== 'boolean' ||
        typeof row.commentCount !== 'number' || !Number.isSafeInteger(row.commentCount) || row.commentCount < 0) return false;
    if (typeof row.createdAt !== 'string' || typeof row.updatedAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.createdAt) ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.updatedAt)) return false;
    const created = Date.parse(row.createdAt);
    const updated = Date.parse(row.updatedAt);
    if (!Number.isFinite(created) || !Number.isFinite(updated) || updated <= created) return false;
    if (title && !row.title.toLocaleLowerCase().includes(title.toLocaleLowerCase())) return false;
    if (stock) {
      if (!row.stock || typeof row.stock !== 'object' || Array.isArray(row.stock) ||
          typeof (row.stock as Record<string, unknown>).symbol !== 'string' ||
          (row.stock as { symbol: string }).symbol.toUpperCase() !== stock.toUpperCase()) return false;
    }
  }
  return true;
}
