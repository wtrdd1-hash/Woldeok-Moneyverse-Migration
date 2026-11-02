/** Image descriptions are public alt text, but only the latest 50 published posts are searched. */
export function parseBoardImageDescription(value: unknown): {
  query: string | null;
  invalid: boolean;
} {
  if (value === undefined) return { query: null, invalid: false };
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > 80 ||
    /[<>\u0000-\u001f\u007f]/.test(value)
  ) {
    return { query: null, invalid: true };
  }
  return { query: value.trim(), invalid: false };
}

/** A legacy API returning {posts: []} must not be treated as a verified filtered empty result. */
export function verifiedImageDescriptionResults(payload: unknown, requested: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as { posts?: unknown; appliedImageAltQuery?: unknown };
  if (
    data.appliedImageAltQuery !== requested ||
    !Array.isArray(data.posts) ||
    data.posts.length > 50
  )
    return false;
  const ids = new Set<string>();
  for (const row of data.posts) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const post = row as { postId?: unknown; hasImage?: unknown };
    if (
      typeof post.postId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        post.postId,
      ) ||
      ids.has(post.postId.toLowerCase()) ||
      post.hasImage !== true
    )
      return false;
    ids.add(post.postId.toLowerCase());
  }
  return true;
}
