/**
 * Board list rows from the DB-backed Spring list (GET /api/v1/board/stock-posts,
 * public.member_board_public_list_with_stock) or the canonical contract. A row
 * is kept only when it carries a database UUID; Spring's placeholder endpoint
 * (/board/public/stock-posts, id "stock-post-01") can therefore never produce
 * a link. A body that is not a list is unavailable (null).
 */
export interface BoardPostRow {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly commentCount: number;
  readonly mine: boolean;
  readonly stock: { readonly symbol: string } | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const obj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);

function row(v: unknown): BoardPostRow | null {
  if (!obj(v)) return null;
  const id = typeof v.postId === 'string' ? v.postId : typeof v.id === 'string' ? v.id : null;
  if (!id || !UUID.test(id) || typeof v.title !== 'string' || typeof v.createdAt !== 'string') return null;
  const symbol = obj(v.stock) && typeof v.stock.symbol === 'string' ? v.stock.symbol : typeof v.stockSymbol === 'string' ? v.stockSymbol : null;
  return {
    postId: id,
    title: v.title,
    authorName: typeof v.authorName === 'string' ? v.authorName : '',
    createdAt: v.createdAt,
    updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : null,
    commentCount: typeof v.commentCount === 'number' ? v.commentCount : 0,
    mine: v.mine === true,
    stock: symbol ? { symbol } : null,
  };
}

export function readBoardPosts(raw: unknown): BoardPostRow[] | null {
  if (!obj(raw) || !Array.isArray(raw.posts)) return null;
  return raw.posts.map(row).filter((r): r is BoardPostRow => r !== null);
}
