/** Stock stance is a bounded discovery filter, not a trading recommendation. */
export type BoardStance = 'bullish' | 'neutral' | 'bearish' | 'none';
const STANCES: readonly string[] = ['bullish', 'neutral', 'bearish', 'none'];

export function parseBoardStance(value: unknown): { stance: BoardStance | null; invalid: boolean } {
  if (value === undefined || value === 'all') return { stance: null, invalid: false };
  if (typeof value !== 'string' || !STANCES.includes(value)) return { stance: null, invalid: true };
  return { stance: value as BoardStance, invalid: false };
}

/** Require the source's applied-filter proof, plus basic row/identity integrity. */
export function verifiedBoardStanceResponse(value: unknown, stance: BoardStance, stockSymbol?: string | null): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const payload = value as Record<string, unknown>;
  const proof = payload.appliedStance;
  if (!proof || typeof proof !== 'object' || Array.isArray(proof) ||
      (proof as Record<string, unknown>).value !== stance ||
      (proof as Record<string, unknown>).scope !== 'latest50') return false;
  if (!Array.isArray(payload.posts) || payload.posts.length > 50) return false;
  const ids = new Set<string>();
  for (const raw of payload.posts) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
    const row = raw as Record<string, unknown>;
    if (typeof row.postId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.postId)) return false;
    const id = row.postId.toLowerCase();
    if (ids.has(id)) return false;
    ids.add(id);
    if (!row.stock || typeof row.stock !== 'object' || Array.isArray(row.stock) ||
        (row.stock as Record<string, unknown>).stance !== stance) return false;
    if (stockSymbol && (typeof (row.stock as Record<string, unknown>).symbol !== 'string' ||
        (row.stock as { symbol: string }).symbol.toUpperCase() !== stockSymbol.toUpperCase())) return false;
  }
  return true;
}
