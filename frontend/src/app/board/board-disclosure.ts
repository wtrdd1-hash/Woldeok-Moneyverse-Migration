export const BOARD_DISCLOSURES = ['holder', 'no_position', 'operator_related', 'undisclosed'] as const;
export type BoardDisclosure = (typeof BOARD_DISCLOSURES)[number];

export function parseBoardDisclosure(value: string | string[] | undefined): {
  readonly value: BoardDisclosure | null;
  readonly invalid: boolean;
} {
  if (value === undefined) return { value: null, invalid: false };
  if (typeof value !== 'string' || !BOARD_DISCLOSURES.some((allowed) => allowed === value)) {
    return { value: null, invalid: true };
  }
  return { value: value as BoardDisclosure, invalid: false };
}

const POST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isVerifiedBoardDisclosure(payload: unknown, disclosure: BoardDisclosure): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const result = payload as Record<string, unknown>;
  const applied = result.appliedFilters;
  if (!applied || typeof applied !== 'object' || Array.isArray(applied) ||
      (applied as Record<string, unknown>).positionDisclosure !== disclosure ||
      !Array.isArray(result.posts) || result.posts.length > 50) return false;
  const ids = new Set<string>();
  for (const row of result.posts) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const post = row as Record<string, unknown>;
    const stock = post.stock;
    if (typeof post.postId !== 'string' || !POST_ID.test(post.postId) ||
        ids.has(post.postId.toLowerCase()) || !stock || typeof stock !== 'object' ||
        Array.isArray(stock) || (stock as Record<string, unknown>).positionDisclosure !== disclosure) return false;
    ids.add(post.postId.toLowerCase());
  }
  return true;
}
