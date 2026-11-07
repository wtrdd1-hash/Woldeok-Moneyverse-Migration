export type BoardRecentPeriod = '24h' | '7d' | '30d';

const DAYS: Readonly<Record<BoardRecentPeriod, number>> = { '24h': 1, '7d': 7, '30d': 30 };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOLERANCE_MS = 120_000;

export function parseBoardRecentPeriod(value: unknown): { period: BoardRecentPeriod | null; invalid: boolean } {
  if (value === undefined) return { period: null, invalid: false };
  if (value === '24h' || value === '7d' || value === '30d') return { period: value, invalid: false };
  return { period: null, invalid: true };
}

/** Empty rows alone cannot prove that the upstream applied the requested time window. */
export function verifiedBoardRecentPeriod(
  payload: unknown,
  period: BoardRecentPeriod,
  now = Date.now(),
  filters?: { readonly q?: string | null; readonly stock?: string | null },
): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const result = payload as Record<string, unknown>;
  if (result.period !== period || typeof result.cutoffUtc !== 'string' || !Array.isArray(result.posts) || result.posts.length > 50) return false;
  const cutoff = Date.parse(result.cutoffUtc);
  if (!Number.isFinite(cutoff) || new Date(cutoff).toISOString() !== result.cutoffUtc ||
      Math.abs(cutoff - (now - DAYS[period] * 86_400_000)) > TOLERANCE_MS) return false;
  const ids = new Set<string>();
  for (const value of result.posts) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const row = value as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !UUID.test(row.postId) ||
        typeof row.title !== 'string' || typeof row.createdAt !== 'string') return false;
    const id = row.postId.toLowerCase();
    if (ids.has(id)) return false;
    ids.add(id);
    const created = Date.parse(row.createdAt);
    if (!Number.isFinite(created) || new Date(created).toISOString() !== row.createdAt ||
        created < cutoff || created > now + TOLERANCE_MS) return false;
    if (filters?.q && !row.title.toLowerCase().includes(filters.q.trim().toLowerCase())) return false;
    if (filters?.stock) {
      if (!row.stock || typeof row.stock !== 'object' || Array.isArray(row.stock) ||
          typeof (row.stock as Record<string, unknown>).symbol !== 'string' ||
          (row.stock as { symbol: string }).symbol.toUpperCase() !== filters.stock.toUpperCase()) return false;
    }
  }
  return true;
}
