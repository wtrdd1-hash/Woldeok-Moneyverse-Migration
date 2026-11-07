export type BoardTopic = 'stock' | 'general';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseBoardTopic(value: string | string[] | undefined): {
  topic: BoardTopic | null;
  invalid: boolean;
} {
  if (value === undefined) return { topic: null, invalid: false };
  if (value === 'stock' || value === 'general') return { topic: value, invalid: false };
  return { topic: null, invalid: true };
}

export function verifiedBoardTopicResponse<T extends { postId: string; stock: unknown }>(
  payload: unknown,
  topic: BoardTopic,
): T[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  if (record.appliedTopic !== topic || !Array.isArray(record.posts) || record.posts.length > 50) return null;
  const seen = new Set<string>();
  for (const post of record.posts) {
    if (!post || typeof post !== 'object' || Array.isArray(post)) return null;
    const row = post as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !UUID.test(row.postId)) return null;
    const key = row.postId.toLowerCase();
    if (seen.has(key)) return null;
    seen.add(key);
    if (topic === 'general') {
      if (row.stock !== null) return null;
    } else {
      if (!row.stock || typeof row.stock !== 'object' || Array.isArray(row.stock)) return null;
      const stock = row.stock as Record<string, unknown>;
      if (typeof stock.stockId !== 'string' || !UUID.test(stock.stockId) ||
          typeof stock.symbol !== 'string' || !/^[A-Za-z0-9._-]{1,16}$/.test(stock.symbol)) return null;
    }
  }
  return record.posts as T[];
}
