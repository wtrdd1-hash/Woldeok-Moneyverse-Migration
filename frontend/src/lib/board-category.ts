/** Verified categories are stock-linked discussion types, not general board posts. */
export const BOARD_CATEGORIES = ['analysis', 'question', 'journal', 'business', 'system'] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];

export function parseBoardCategory(value: unknown): { category: BoardCategory | null; invalid: boolean } {
  if (value === undefined) return { category: null, invalid: false };
  if (typeof value !== 'string' || !BOARD_CATEGORIES.some((category) => category === value))
    return { category: null, invalid: true };
  return { category: value as BoardCategory, invalid: false };
}

/** An empty array without a source marker is not proof that a filter ran. */
export function isVerifiedBoardCategoryResponse(payload: unknown, category: BoardCategory): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const response = payload as Record<string, unknown>;
  if (response.categoryFilter !== category || !Array.isArray(response.posts) || response.posts.length > 50) return false;
  const ids = new Set<string>();
  for (const post of response.posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return false;
    const row = post as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.postId)) return false;
    const key = row.postId.toLowerCase();
    if (ids.has(key)) return false;
    ids.add(key);
    if (!row.stock || typeof row.stock !== 'object' || Array.isArray(row.stock) ||
        (row.stock as Record<string, unknown>).category !== category) return false;
  }
  return true;
}
