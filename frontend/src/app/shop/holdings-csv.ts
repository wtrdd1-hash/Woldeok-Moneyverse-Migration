/**
 * Export the current owner-verified Store 2.0 holdings. No purchase price,
 * WLD balance, or receipt is inferred from inventory quantities.
 * Reject malformed/oversized API data instead of generating a misleading file.
 */
interface Holding {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly acquired_at: string;
  readonly expires_at: string | null;
  readonly is_equipped: boolean;
  readonly serial_number: number | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CODE = /^[a-z0-9_]{3,64}$/;
const MAX_ROWS = 5000;

function validDate(value: unknown): value is string {
  return typeof value === 'string' &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) &&
    !Number.isNaN(Date.parse(value));
}

function holdingFromApi(value: unknown): Holding {
  if (!value || typeof value !== 'object') throw new Error('invalid holdings export');
  const row = value as Partial<Holding>;
  if (typeof row.catalog_id !== 'string' || !UUID.test(row.catalog_id) ||
      typeof row.code !== 'string' || !CODE.test(row.code) ||
      typeof row.name !== 'string' || !row.name.trim() || row.name.length > 300 ||
      typeof row.category !== 'string' || !row.category.trim() || row.category.length > 150 ||
      typeof row.quantity !== 'number' || !Number.isSafeInteger(row.quantity) || row.quantity < 0 ||
      !validDate(row.acquired_at) ||
      (row.expires_at !== null && !validDate(row.expires_at)) ||
      typeof row.is_equipped !== 'boolean' ||
      (row.serial_number !== null && (typeof row.serial_number !== 'number' ||
        !Number.isSafeInteger(row.serial_number) || row.serial_number < 0))) {
    throw new Error('unverified holdings export row');
  }
  return row as Holding;
}

function csvField(value: string | number | boolean | null): string {
  const raw = value === null ? '' : String(value);
  // Spreadsheet formula injection can be triggered after leading whitespace.
  const safe = /^\s*[=+\-@]/u.test(raw) ? "'" + raw : raw;
  return '"' + safe.replaceAll('"', '""') + '"';
}

export function exportHoldingsCsv(rows: unknown): string {
  if (!Array.isArray(rows) || rows.length > MAX_ROWS) {
    throw new Error('holdings export unavailable or exceeds limit');
  }
  const verified = rows.map(holdingFromApi);
  const lines = [
    ['catalog_id', 'code', 'name', 'category', 'quantity', 'acquired_at', 'expires_at', 'is_equipped', 'serial_number'],
    ...verified.map((r) => [
      r.catalog_id, r.code, r.name, r.category, r.quantity,
      r.acquired_at, r.expires_at, r.is_equipped, r.serial_number,
    ]),
  ];
  return '\uFEFF' + lines.map((row) => row.map(csvField).join(',')).join('\r\n') + '\r\n';
}
