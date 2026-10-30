/** Owner-only recent Work receipts. This is not a lifetime or ledger settlement export. */
export interface WorkReceiptExportRow {
  readonly receipt_id: string;
  readonly assignment_id: string;
  readonly code: string;
  readonly name: string;
  readonly reward_amount: string;
  readonly experience_amount: string;
  readonly transaction_id: string | null;
  readonly created_at: string;
}

export interface WorkReceiptExport {
  readonly scope: 'recent_20';
  readonly currency: 'WLD';
  readonly receipts: readonly WorkReceiptExportRow[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_BIGINT = 9223372036854775807n;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalAmount(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]{0,18})$/.test(value) && BigInt(value) <= MAX_BIGINT;
}

function canonicalTimestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

export function parseWorkReceiptExport(value: unknown): WorkReceiptExport | null {
  if (!isRecord(value) || value.scope !== 'recent_20' || value.currency !== 'WLD' ||
      !Array.isArray(value.receipts) || value.receipts.length > 20) return null;
  const ids = new Set<string>();
  for (const raw of value.receipts as unknown[]) {
    if (!isRecord(raw) || typeof raw.receipt_id !== 'string' || !UUID.test(raw.receipt_id) ||
        ids.has(raw.receipt_id) || typeof raw.assignment_id !== 'string' || !UUID.test(raw.assignment_id) ||
        typeof raw.code !== 'string' || !raw.code.trim() || raw.code.length > 100 ||
        typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > 300 ||
        !canonicalAmount(raw.reward_amount) || !canonicalAmount(raw.experience_amount) || raw.experience_amount === '0' ||
        (raw.transaction_id !== null && (typeof raw.transaction_id !== 'string' || !UUID.test(raw.transaction_id))) ||
        !canonicalTimestamp(raw.created_at)) return null;
    ids.add(raw.receipt_id);
  }
  return value as unknown as WorkReceiptExport;
}

/** Quoting alone does not prevent spreadsheet formula evaluation. */
function csvCell(value: string): string {
  const clean = value.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u2060\ufeff]/g, ' ').trim();
  const safe = /^[=+\-@]/.test(clean) ? `'${clean}` : clean;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function workReceiptCsv(data: WorkReceiptExport): string {
  const verified = parseWorkReceiptExport(data);
  if (!verified) throw new Error('Unverified Work receipt export');
  const headers = ['created_at_utc', 'receipt_id', 'assignment_id', 'task_code', 'task_name', 'reward_wld', 'experience', 'ledger_transaction_id'];
  const rows = verified.receipts.map((row) => [
    row.created_at, row.receipt_id, row.assignment_id, row.code, row.name,
    row.reward_amount, row.experience_amount, row.transaction_id ?? '',
  ].map(csvCell).join(','));
  return `\uFEFF${[headers.map(csvCell).join(','), ...rows].join('\r\n')}\r\n`;
}
