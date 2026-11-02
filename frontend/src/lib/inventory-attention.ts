/** Proof for the owner-scoped attention view. Never infer an empty result from an unverified 200. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isVerifiedInventoryAttention(payload: unknown): payload is { filter: 'attention'; holdings: Record<string, unknown>[] } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const data = payload as Record<string, unknown>;
  if (data.filter !== 'attention' || !Array.isArray(data.holdings) || data.holdings.length > 10000) return false;
  const ids = new Set<string>();
  for (const value of data.holdings) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const row = value as Record<string, unknown>;
    if (typeof row.catalog_id !== 'string' || !UUID.test(row.catalog_id)) return false;
    const id = row.catalog_id.toLowerCase();
    if (ids.has(id)) return false;
    ids.add(id);
    if (typeof row.suspended !== 'boolean' ||
        typeof row.unpaid_weeks !== 'number' || !Number.isSafeInteger(row.unpaid_weeks) || row.unpaid_weeks < 0 ||
        typeof row.arrears_due !== 'string' || !/^(0|[1-9][0-9]{0,39})$/.test(row.arrears_due)) return false;
    if (!row.suspended && row.unpaid_weeks === 0 && BigInt(row.arrears_due) === 0n) return false;
  }
  return true;
}
