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

/** A successful owner response is not evidence until every receipt is checked. */
function parseReceiptRows(value: unknown): Receipt[] | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const ids = new Set<string>();
  const receipts: Receipt[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (
      typeof row.receipt_id !== 'string' ||
      !UUID.test(row.receipt_id) ||
      ids.has(row.receipt_id) ||
      typeof row.assignment_id !== 'string' ||
      !UUID.test(row.assignment_id) ||
      typeof row.code !== 'string' ||
      row.code.length === 0 ||
      row.code.length > 120 ||
      typeof row.name !== 'string' ||
      row.name.length === 0 ||
      row.name.length > 240 ||
      typeof row.reward_amount !== 'string' ||
      !AMOUNT.test(row.reward_amount) ||
      typeof row.experience_amount !== 'string' ||
      !AMOUNT.test(row.experience_amount) ||
      (row.transaction_id !== null &&
        (typeof row.transaction_id !== 'string' || !UUID.test(row.transaction_id))) ||
      typeof row.created_at !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T/.test(row.created_at) ||
      !Number.isFinite(Date.parse(row.created_at))
    ) return null;
    ids.add(row.receipt_id);
    receipts.push(row as Receipt);
  }
  return receipts;
}

/** Legacy unfiltered endpoint returns only {receipts}; never infer an empty list on failure. */
export function parseUnfilteredWorkReceipts(payload: unknown): { receipts: Receipt[] } | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const rows = parseReceiptRows((payload as Record<string, unknown>).receipts);
  return rows === null ? null : { receipts: rows };
}

/** A legacy backend ignoring minReward must not return a success-shaped filtered list. */
export function parseFilteredWorkReceipts(payload: unknown, floor: string): Verified | null {
  if (normalizeWorkReceiptFloor(floor) === null || !payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const data = payload as Record<string, unknown>;
  if (data.scope !== 'recent20' || data.minReward !== floor) return null;
  const receipts = parseReceiptRows(data.receipts);
  if (receipts === null || receipts.some((row) => BigInt(row.reward_amount) < BigInt(floor))) return null;
  return { scope: 'recent20', minReward: floor, receipts };
}
