import { STATUS_STATES } from './status';

/** The backend owns freshness; this boundary only checks its declared contract. */
export interface VerifiedStatusRow {
  readonly sourceKey: string;
  readonly displayName: string;
  readonly state: string;
  readonly detail: string | null;
  readonly observedAt: string | null;
  readonly freshnessState: 'fresh' | 'stale' | 'unknown';
  readonly ageMs: number | null;
  readonly policyVersion: 'status-v1';
}

const SOURCE_KEY = /^[a-z][a-z0-9_-]{2,63}$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_SOURCES = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validTimestamp(value: unknown): value is string {
  return typeof value === 'string' && ISO_TIMESTAMP.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}

function parseRow(value: unknown): VerifiedStatusRow | null {
  if (!isRecord(value)) return null;
  const { sourceKey, displayName, state, detail, observedAt, freshnessState, ageMs, policyVersion } = value;
  if (typeof sourceKey !== 'string' || !SOURCE_KEY.test(sourceKey) ||
      typeof displayName !== 'string' || !displayName.trim() || displayName.length > 80 ||
      typeof state !== 'string' || !(STATUS_STATES as readonly string[]).includes(state) ||
      (detail !== null && (typeof detail !== 'string' || detail.length > 280)) ||
      (observedAt !== null && !validTimestamp(observedAt)) ||
      (freshnessState !== 'fresh' && freshnessState !== 'stale' && freshnessState !== 'unknown') ||
      (ageMs !== null && (typeof ageMs !== 'number' || !Number.isSafeInteger(ageMs) || ageMs < 0)) ||
      policyVersion !== 'status-v1') return null;

  // An unknown or stale snapshot cannot be presented as a verified healthy row.
  // Age thresholds remain exclusively defined by the backend status-v1 policy.
  if (freshnessState === 'fresh' && (state === 'unknown' || observedAt === null || ageMs === null)) return null;
  if (freshnessState === 'stale' && (state !== 'unknown' || observedAt === null || ageMs === null)) return null;
  if (freshnessState === 'unknown' && (state !== 'unknown' || ageMs !== null)) return null;

  return {
    sourceKey, displayName, state, detail, observedAt,
    freshnessState, ageMs, policyVersion,
  };
}

/** Invalid successful responses are outages of evidence, never an empty/healthy board. */
export function parseStatusRows(value: unknown): VerifiedStatusRow[] | null {
  if (!isRecord(value) || !Array.isArray(value.status) || value.status.length > MAX_SOURCES) return null;
  const rows: VerifiedStatusRow[] = [];
  const seen = new Set<string>();
  for (const candidate of value.status) {
    const row = parseRow(candidate);
    if (row === null || seen.has(row.sourceKey)) return null;
    seen.add(row.sourceKey);
    rows.push(row);
  }
  return rows;
}

/** Only normalized, evidence-backed current health can be omitted from attention. */
export function attentionStatusRows(rows: readonly VerifiedStatusRow[]): VerifiedStatusRow[] {
  return rows.filter((row) => row.freshnessState !== 'fresh' || row.state !== 'operational');
}
