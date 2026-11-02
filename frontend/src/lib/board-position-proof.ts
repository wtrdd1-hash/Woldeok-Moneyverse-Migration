import type { BoardPosition } from '@/app/board/board-position-filter';

/** A filtered empty result is trusted only when the source echoes the applied filter. */
export function isVerifiedBoardPositionResponse(payload: unknown, position: BoardPosition): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (data.appliedPosition !== position || !Array.isArray(data.posts) || data.posts.length > 50) return false;
  const ids = new Set<string>();
  return data.posts.every((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const post = entry as Record<string, unknown>;
    const stock = post.stock;
    if (typeof post.postId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(post.postId) ||
        ids.has(post.postId) || !stock || typeof stock !== 'object' || Array.isArray(stock) ||
        (stock as Record<string, unknown>).positionDisclosure !== position) return false;
    ids.add(post.postId);
    return true;
  });
}
