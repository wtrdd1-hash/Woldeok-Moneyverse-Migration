/** A literal, bounded author filter over the existing latest-50 public board source. */
export function parseBoardAuthorQuery(value: unknown): { query: string | null; invalid: boolean } {
  if (value === undefined) return { query: null, invalid: false };
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 80 || /[<>\u0000-\u001f\u007f]/.test(value)) {
    return { query: null, invalid: true };
  }
  return { query: value.trim(), invalid: false };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Reject legacy success-shaped responses; the source must explicitly attest filtering. */
export function verifiedBoardAuthorResults(payload: unknown, author: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const result = payload as Record<string, unknown>;
  if (result.authorFilter !== author || result.sourceWindow !== 50 || !Array.isArray(result.posts) || result.posts.length > 50) return false;
  const ids = new Set<string>();
  for (const post of result.posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return false;
    const item = post as Record<string, unknown>;
    if (typeof item.postId !== 'string' || !UUID.test(item.postId) || ids.has(item.postId.toLowerCase())) return false;
    ids.add(item.postId.toLowerCase());
    if (typeof item.title !== 'string' || !item.title.trim() || item.title.length > 120 ||
        typeof item.authorName !== 'string' || !item.authorName.trim() || item.authorName.length > 120 ||
        !item.authorName.toLowerCase().includes(author.toLowerCase()) ||
        typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt)) ||
        typeof item.commentCount !== 'number' || !Number.isSafeInteger(item.commentCount) || item.commentCount < 0) return false;
  }
  return true;
}
