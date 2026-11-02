/** A text-only search is a bounded view of the newest 50 public posts, not the archive. */
export function parseBoardMediaFilter(value: unknown): { media: 'text' | null; invalid: boolean } {
  if (value === undefined) return { media: null, invalid: false };
  if (value === 'text') return { media: 'text', invalid: false };
  return { media: null, invalid: true };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Prevent a legacy/unverified upstream success from masquerading as a filtered empty result. */
export function verifiedTextOnlyBoardResponse(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const result = value as Record<string, unknown>;
  if (result.filterApplied !== 'text' || !Array.isArray(result.posts) || result.posts.length > 50) return false;
  const seen = new Set<string>();
  for (const row of result.posts) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const post = row as Record<string, unknown>;
    if (typeof post.postId !== 'string' || !UUID.test(post.postId) ||
        typeof post.title !== 'string' || !post.title.trim() || post.title.length > 120 ||
        typeof post.authorName !== 'string' || !post.authorName.trim() || post.authorName.length > 120 ||
        typeof post.createdAt !== 'string' || !Number.isFinite(Date.parse(post.createdAt)) ||
        post.hasImage !== false) return false;
    const id = post.postId.toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
  }
  return true;
}
