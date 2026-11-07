import { parseStatusRows, type VerifiedStatusRow } from './status-response';

export function validStatusSourceKey(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z][a-z0-9_-]{2,63}$/.test(value);
}

/** An ignored filter can look like an empty success; require source-owned proof. */
export function parseSourceStatusRows(value: unknown, requested: string): VerifiedStatusRow[] | null {
  if (!validStatusSourceKey(requested) || !value || typeof value !== 'object' || Array.isArray(value) ||
      (value as { sourceKey?: unknown }).sourceKey !== requested) return null;
  const rows = parseStatusRows(value);
  if (rows === null || rows.some((row) => row.sourceKey !== requested)) return null;
  return rows;
}
