/** Read-only ceiling on the canonical, owner-scoped recent 20 work receipts. */
export function normalizedReceiptCeiling(raw: unknown): string | null {
  return typeof raw === 'string' && /^(?:0|[1-9][0-9]{0,17})$/.test(raw) ? raw : null;
}

export function workReceiptsApiPath(ceiling: string | null): string {
  const verified = normalizedReceiptCeiling(ceiling);
  return verified === null ? '/api/v1/work/receipts' :
    `/api/v1/work/receipts?maxReceiptReward=${encodeURIComponent(verified)}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Fail closed when a stale or forged backend ignores the opt-in filter. */
export function verifiedReceiptCeiling(payload: unknown, ceiling: string): boolean {
  if (normalizedReceiptCeiling(ceiling) === null ||
      !payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const receipts = (payload as { receipts?: unknown }).receipts;
  if (!Array.isArray(receipts) || receipts.length > 20) return false;
  return receipts.every((row: unknown) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const receipt = row as Record<string, unknown>;
    return typeof receipt.receipt_id === 'string' && UUID.test(receipt.receipt_id) &&
      typeof receipt.assignment_id === 'string' && UUID.test(receipt.assignment_id) &&
      typeof receipt.name === 'string' && receipt.name.length <= 300 &&
      typeof receipt.code === 'string' && receipt.code.length <= 120 &&
      typeof receipt.created_at === 'string' && Number.isFinite(Date.parse(receipt.created_at)) &&
      (receipt.transaction_id === null || (typeof receipt.transaction_id === 'string' && UUID.test(receipt.transaction_id))) &&
      typeof receipt.experience_amount === 'string' && /^(?:0|[1-9][0-9]{0,18})$/.test(receipt.experience_amount) &&
      typeof receipt.reward_amount === 'string' && /^(?:0|[1-9][0-9]{0,18})$/.test(receipt.reward_amount) &&
      BigInt(receipt.reward_amount) <= BigInt(ceiling);
  });
}
