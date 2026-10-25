/** Private current virtual business ownership snapshot, not a settlement or ledger receipt. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^(0|[1-9][0-9]{0,37})$/;
const CONTROL = /[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g;

function cell(input: string): string {
  const clean = input.replace(CONTROL, ' ').trim();
  const safe = /^[=+\-@]/.test(clean) ? "'" + clean : clean;
  return '"' + safe.replace(/"/g, '""') + '"';
}

function text(value: unknown, field: string, max = 160): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > max) {
    throw new Error(`invalid ${field}`);
  }
  return value;
}

function amount(value: unknown, field: string): string {
  if (typeof value !== 'string' || !AMOUNT.test(value)) throw new Error(`invalid ${field}`);
  return value;
}

function timestamp(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) throw new Error('invalid purchase timestamp');
  const date = new Date(value);
  if (!Number.isFinite(date.valueOf())) throw new Error('invalid purchase timestamp');
  return date.toISOString();
}

function settlementDate(value: unknown): string {
  if (value === null) return '';
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new Error('invalid settlement date');
  return value;
}

function rowCsv(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid business row');
  const row = value as Record<string, unknown>;
  const ownershipId = text(row['ownershipId'], 'ownership id', 36);
  const businessTypeId = text(row['businessTypeId'], 'business type id', 36);
  if (!UUID.test(ownershipId) || !UUID.test(businessTypeId) || typeof row['isSettledToday'] !== 'boolean') {
    throw new Error('invalid business identity or settlement state');
  }
  return [
    ownershipId, businessTypeId, text(row['symbol'], 'symbol', 80), text(row['name'], 'name'),
    amount(row['purchaseCost'], 'purchase cost'), amount(row['dailyRevenue'], 'daily revenue'),
    amount(row['dailyOperatingCost'], 'daily operating cost'),
    timestamp(row['purchasedAt']), settlementDate(row['lastSettlementDate']),
    row['isSettledToday'] ? 'yes' : 'no', text(row['status'], 'status', 80),
    'Current virtual holdings snapshot only; not a settlement or ledger receipt',
  ].map(cell).join(',');
}

/** Validate every row before any CSV bytes leave the server. */
export function businessOwnershipCsv(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('holdings unavailable');
  const data = value as Record<string, unknown>;
  if (data['scope'] !== 'current_100_max' || !Array.isArray(data['businesses']) || data['businesses'].length > 100) {
    throw new Error('unverified or incomplete business snapshot');
  }
  const header = [
    'Ownership ID', 'Business type ID', 'Symbol', 'Name', 'Purchase cost (WLD)',
    'Daily revenue (WLD)', 'Daily operating cost (WLD)', 'Purchased at (UTC)',
    'Last settlement date', 'Settled today', 'Status',
    'Current virtual holdings snapshot only; not a settlement or ledger receipt',
  ];
  const rows = data['businesses'].map(rowCsv);
  return '\uFEFF' + [header.map(cell).join(','), ...rows].join('\r\n') + '\r\n';
}
