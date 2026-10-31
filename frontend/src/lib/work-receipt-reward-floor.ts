/** Member-only, read-only filter over the database's latest 20 owner receipts. */
export function normalizeWorkReceiptFloor(raw: unknown): string | null {
  return typeof raw === 'string' && /^(?:0|[1-9][0-9]{0,17})$/.test(raw) ? raw : null;
}

export function workReceiptsApiPath(floor: string | undefined): string {
  return floor === undefined
    ? '/api/v1/work/receipts'
    : `/api/v1/work/receipts?minReward=${encodeURIComponent(floor)}`;
}

type Receipt = {
  receipt_id: string;
  assignment_id: string;
  code: string;
  name: string;
  reward_amount: string;
  experience_amount: string;
  transaction_id: string | null;
  created_at: string;
};
type Verified = { scope: 'recent20'; minReward: string; receipts: Receipt[] };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^(?:0|[1-9][0-9]{0,18})$/;

/** A legacy backend ignoring minReward must not return a success-shaped filtered list. */
export function parseFilteredWorkReceipts(payload: unknown, floor: string): Verified | null {
  if (
    normalizeWorkReceiptFloor(floor) === null ||
    !payload ||
    typeof payload !== 'object' ||
    Array.isArray(payload)
  )
    return null;
  const data = payload as Record<string, unknown>;
  if (
    data.scope !== 'recent20' ||
    data.minReward !== floor ||
    !Array.isArray(data.receipts) ||
    data.receipts.length > 20
  )
    return null;
  const ids = new Set<string>();
  const receipts: Receipt[] = [];
  for (const item of data.receipts) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (
      typeof row.receipt_id !== 'string' ||
      !UUID.test(row.receipt_id) ||
      ids.has(row.receipt_id) ||
      typeof row.assignment_id !== 'string' ||
      !UUID.test(row.assignment_id) ||
      typeof row.code !== 'string' ||
      row.code.length > 120 ||
      typeof row.name !== 'string' ||
      row.name.length > 240 ||
      typeof row.reward_amount !== 'string' ||
      !AMOUNT.test(row.reward_amount) ||
      BigInt(row.reward_amount) < BigInt(floor) ||
      typeof row.experience_amount !== 'string' ||
      !AMOUNT.test(row.experience_amount) ||
      (row.transaction_id !== null &&
        (typeof row.transaction_id !== 'string' || !UUID.test(row.transaction_id))) ||
      typeof row.created_at !== 'string' ||
      !Number.isFinite(Date.parse(row.created_at))
    )
      return null;
    ids.add(row.receipt_id);
    receipts.push(row as Receipt);
  }
  return { scope: 'recent20', minReward: floor, receipts };
}
