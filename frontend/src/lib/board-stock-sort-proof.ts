/** A mobile sort request must not silently accept an old backend ignoring the order. */
export function verifiedBoardStockSort(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  if ((payload as { sortApplied?: unknown }).sortApplied !== 'stock') return false;
  const posts = (payload as { posts?: unknown }).posts;
  if (!Array.isArray(posts) || posts.length > 50) return false;
  let previous: { symbol: string | null; id: string } | null = null;
  const seen = new Set<string>();
  for (const value of posts) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const row = value as Record<string, unknown>;
    if (typeof row.postId !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.postId) || seen.has(row.postId)) return false;
    if (row.stock !== null && (!row.stock || typeof row.stock !== 'object' || Array.isArray(row.stock))) return false;
    const symbol = row.stock === null ? null : (row.stock as Record<string, unknown>).symbol;
    if (symbol !== null && (typeof symbol !== 'string' || !/^[A-Za-z0-9._-]{1,16}$/.test(symbol))) return false;
    const current = { symbol: symbol === null ? null : (symbol as string).toUpperCase(), id: row.postId.toLowerCase() };
    if (previous && (previous.symbol === null && current.symbol !== null ||
        previous.symbol !== null && current.symbol !== null && (previous.symbol > current.symbol ||
          previous.symbol === current.symbol && previous.id > current.id) ||
        previous.symbol === null && current.symbol === null && previous.id > current.id)) return false;
    seen.add(row.postId);
    previous = current;
  }
  return true;
}
