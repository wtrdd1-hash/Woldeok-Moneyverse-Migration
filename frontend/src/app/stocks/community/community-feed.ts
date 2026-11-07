export interface VerifiedStockPost {
  readonly postId: string;
  readonly title: string;
  readonly authorName: string;
  readonly createdAt: string;
  readonly commentCount: number;
  readonly stock: {
    readonly symbol: string;
    readonly name: string;
    readonly category: string;
    readonly stance: 'bullish' | 'bearish' | 'neutral' | 'none';
    readonly positionDisclosure: string;
  };
}

export type StockCommunityFeed =
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'verified'; readonly posts: readonly VerifiedStockPost[] };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Za-z0-9._-]{1,16}$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value)
    && Number.isFinite(Date.parse(value));
}

/** The public board API is SQL-backed, but a 200 alone is not proof of a valid feed. */
export function parseStockCommunityFeed(payload: unknown): StockCommunityFeed {
  if (!record(payload) || !Array.isArray(payload.posts) || payload.posts.length > 50) {
    return { kind: 'unavailable' };
  }

  const posts: VerifiedStockPost[] = [];
  const ids = new Set<string>();
  for (const item of payload.posts) {
    if (!record(item)) return { kind: 'unavailable' };
    // The shared board endpoint includes ordinary discussions; this surface
    // deliberately displays only records with a stock tag.
    if (item.stock === null) continue;
    if (!record(item.stock)) return { kind: 'unavailable' };
    const stock = item.stock;
    if (
      typeof item.postId !== 'string' || !UUID.test(item.postId) || ids.has(item.postId) ||
      !text(item.title, 120) || !text(item.authorName, 120) ||
      !validDate(item.createdAt) ||
      typeof item.commentCount !== 'number' ||
      !Number.isSafeInteger(item.commentCount) || item.commentCount < 0 ||
      typeof stock.symbol !== 'string' || !SYMBOL.test(stock.symbol) ||
      !text(stock.name, 120) || !text(stock.category, 40) ||
      !['bullish', 'bearish', 'neutral', 'none'].includes(String(stock.stance)) ||
      !text(stock.positionDisclosure, 40)
    ) return { kind: 'unavailable' };

    ids.add(item.postId);
    posts.push({
      postId: item.postId,
      title: item.title,
      authorName: item.authorName,
      createdAt: item.createdAt,
      commentCount: item.commentCount,
      stock: {
        symbol: stock.symbol.toUpperCase(),
        name: stock.name,
        category: stock.category,
        stance: stock.stance as VerifiedStockPost['stock']['stance'],
        positionDisclosure: stock.positionDisclosure,
      },
    });
  }
  return { kind: 'verified', posts };
}
