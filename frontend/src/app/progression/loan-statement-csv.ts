/** Validated read-only virtual loan history, not a loan payment or settlement receipt. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^(0|[1-9][0-9]{0,37})$/;

function cell(input: string): string {
  const clean = input.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ').trim();
  const safe = /^[=+\-@]/.test(clean) ? "'" + clean : clean;
  return '"' + safe.replace(/"/g, '""') + '"';
}

function timestamp(value: unknown, optional = false): string {
  if (value === null && optional) return '';
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) throw new Error('invalid loan timestamp');
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('invalid loan timestamp');
  return date.toISOString();
}

function loanRow(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid loan');
  const row = value as Record<string, unknown>;
  if (typeof row['loan_id'] !== 'string' || !UUID.test(row['loan_id']) ||
      typeof row['status'] !== 'string' || row['status'].length < 1 || row['status'].length > 80 ||
      !['principal_amount', 'interest_amount', 'outstanding_amount'].every(
        (key) => typeof row[key] === 'string' && AMOUNT.test(row[key] as string),
      )) throw new Error('unverified loan');
  return [
    row['loan_id'] as string,
    row['principal_amount'] as string,
    row['interest_amount'] as string,
    row['outstanding_amount'] as string,
    row['status'] as string,
    timestamp(row['issued_at']),
    timestamp(row['repaid_at'], true),
    'Recent 20 virtual loans only; older records may exist',
  ].map(cell).join(',');
}

/** Validate the entire response before any bytes are sent. */
export function loanStatementCsv(data: unknown): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('loan statement unavailable');
  const result = data as Record<string, unknown>;
  if (result['scope'] !== 'recent_20_only' ||
      !Array.isArray(result['loans']) || result['loans'].length > 20) {
    throw new Error('unverified loan statement');
  }
  const header = [
    'Loan ID', 'Principal (WLD)', 'Interest (WLD)', 'Outstanding (WLD)',
    'Status', 'Issued at (UTC)', 'Repaid at (UTC)', 'Recent 20 virtual loans only; older records may exist',
  ];
  const rows = result['loans'].map((loan: unknown) => loanRow(loan));
  return '\uFEFF' + [header.map(cell).join(','), ...rows].join('\r\n') + '\r\n';
}
