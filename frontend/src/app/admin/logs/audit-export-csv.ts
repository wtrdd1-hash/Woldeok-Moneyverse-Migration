/**
 * Audit evidence may contain attacker-controlled strings (names, actions, IP metadata).
 * CSV quoting protects the file structure, not spreadsheet formula execution.
 * Prefix a text marker before any cell that a spreadsheet could parse as a formula,
 * even after leading invisible characters. JSON export keeps the unmodified field values.
 */
const FORMULA_PREFIX = /^[\u0000-\u0020\u007f\u00a0\u200b-\u200f\u2028-\u202f\u2060\ufeff]*[=+\-@]/u;

export function auditCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value);
  const safe = FORMULA_PREFIX.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Serializes only the already validated, currently loaded page supplied by the caller. */
export function auditCsvDocument(
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
): string {
  return [headers, ...rows].map((row) => row.map(auditCsvCell).join(',')).join('\r\n');
}
