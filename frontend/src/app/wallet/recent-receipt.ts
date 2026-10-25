import { isCanonicalWld, pocketBreakdown, type TransactionView } from './sides';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isWalletReceiptId(value: string): boolean {
  return UUID.test(value);
}

/** Treat malformed or partial API projections as unavailable, never as a confirmed payment. */
export function validatedRecentReceipt(payload: unknown, requestedId: string): TransactionView | null {
  if (!isWalletReceiptId(requestedId) || !payload || typeof payload !== 'object') return null;
  const result = payload as Record<string, unknown>;
  if (result.scope !== 'recent_50' || !result.receipt || typeof result.receipt !== 'object') return null;
  const row = result.receipt as Record<string, unknown>;
  if (typeof row.transactionId !== 'string' || row.transactionId.toLowerCase() !== requestedId.toLowerCase()) return null;
  if (typeof row.type !== 'string' || !row.type || typeof row.label !== 'string' || !row.label) return null;
  if (typeof row.occurredAt !== 'string' || !Number.isFinite(Date.parse(row.occurredAt))) return null;
  if (!isCanonicalWld(row.netAmount)) return null;
  const direction = BigInt(row.netAmount) > 0n ? 'in' : BigInt(row.netAmount) < 0n ? 'out' : 'neutral';
  if (row.direction !== direction) return null;
  const receipt = row as unknown as TransactionView;
  return pocketBreakdown(receipt) ? receipt : null;
}
