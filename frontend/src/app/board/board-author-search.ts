/** Public display-name filter for the latest 50 approved board posts only. */
export function parseBoardAuthorQuery(value: unknown): { query: string | null; invalid: boolean } {
  if (value === undefined) return { query: null, invalid: false };
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 40 || /[<>\u0000-\u001f\u007f]/.test(value)) {
    return { query: null, invalid: true };
  }
  return { query: value.trim(), invalid: false };
}

/** A stale Android upstream must not return unfiltered author results as success. */
export function verifiedPublicBoardAuthor(payload: unknown, author: string): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const posts = (payload as { posts?: unknown }).posts;
  if (!Array.isArray(posts) || posts.length > 50) return false;
  return posts.every((post: unknown) => {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return false;
    const name = (post as { authorName?: unknown }).authorName;
    return typeof name === 'string' && name.length <= 120 && name.toLowerCase().includes(author.toLowerCase());
  });
}
