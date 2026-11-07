const POST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** A matching filter echo alone is insufficient: every returned row must prove the threshold. */
export function isVerifiedBoardReplyThreshold(payload: unknown, minimum: number): boolean {
  if (![2, 5, 10].includes(minimum) || !payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (data.minReplies !== minimum || !Array.isArray(data.posts) || data.posts.length > 50) return false;
  const ids = new Set<string>();
  for (const post of data.posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return false;
    const row = post as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !POST_ID.test(row.postId) ||
        ids.has(row.postId.toLowerCase()) || typeof row.commentCount !== 'number' ||
        !Number.isSafeInteger(row.commentCount) || row.commentCount < minimum) return false;
    ids.add(row.postId.toLowerCase());
  }
  return true;
}
