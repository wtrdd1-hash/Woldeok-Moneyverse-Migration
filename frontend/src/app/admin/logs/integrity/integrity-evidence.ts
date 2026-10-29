import type {
  AuditDisposition,
  AuditRetentionCategory,
  ChainVerificationHistory,
} from '../../types';

type RecordValue = Record<string, unknown>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const COUNT = /^(0|[1-9]\d{0,18})$/;
const HEX_DIGEST = /^[0-9a-f]{64}$/i;
const METHODS = new Set(['archived', 'destroyed', 'retained_on_hold']);

function object(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function count(value: unknown): value is string {
  return typeof value === 'string' && COUNT.test(value) && BigInt(value) <= 9223372036854775807n;
}

function uuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function timestamp(value: unknown): value is string {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 1000;
}

function rows<T>(
  response: unknown,
  key: string,
  valid: (row: unknown) => boolean,
  identity: (row: RecordValue) => string,
  maxRows = 100,
): T[] | null {
  if (!object(response) || !Array.isArray(response[key]) || response[key].length > maxRows) return null;
  const items: unknown[] = response[key];
  if (!items.every(valid)) return null;
  const ids = items.map((row) => identity(row as RecordValue));
  if (new Set(ids).size !== ids.length) return null;
  return items as T[];
}

function validVerification(value: unknown): boolean {
  if (!object(value) || !uuid(value.verification_id)
    || !(value.requested_by === null || uuid(value.requested_by))
    || !timestamp(value.started_at) || !timestamp(value.completed_at)
    || Date.parse(value.started_at) > Date.parse(value.completed_at)
    || Date.parse(value.completed_at) > Date.now() + 300000) return false;
  const numeric = [
    'from_sequence', 'to_sequence', 'checked_count', 'verified_count',
    'legacy_count', 'mismatch_count', 'link_break_count', 'column_drift_count',
  ] as const;
  if (!numeric.every((key) => count(value[key]))) return false;
  const from = BigInt(value.from_sequence as string);
  const to = BigInt(value.to_sequence as string);
  const checked = BigInt(value.checked_count as string);
  const verified = BigInt(value.verified_count as string);
  const legacy = BigInt(value.legacy_count as string);
  const mismatch = BigInt(value.mismatch_count as string);
  const linkBreak = BigInt(value.link_break_count as string);
  const columnDrift = BigInt(value.column_drift_count as string);
  // SQL migration 064 checks at most 100,000 rows. A passed badge must not
  // hide contradictory totals, even if each individual count is in range.
  if ((from > to && value.status !== 'empty') || checked > 100000n
    || (checked > 0n && checked > to - from + 1n)
    || verified + legacy + mismatch > checked
    || linkBreak > checked || columnDrift > checked) return false;
  if (value.first_bad_sequence !== null
    && (!count(value.first_bad_sequence)
      || BigInt(value.first_bad_sequence) < from
      || BigInt(value.first_bad_sequence) > to)) return false;
  const raised = mismatch > 0n || linkBreak > 0n || columnDrift > 0n;
  if (raised !== (value.first_bad_sequence !== null)) return false;
  if (checked === 0n && (verified !== 0n || legacy !== 0n || mismatch !== 0n
    || linkBreak !== 0n || columnDrift !== 0n)) return false;
  return (value.status === 'failed' && raised)
    || (value.status === 'passed' && !raised && checked > 0n)
    || (value.status === 'empty' && checked === 0n && !raised);
}

function validRetention(value: unknown): boolean {
  if (!object(value) || !text(value.category) || value.category.length > 128
    || !Number.isInteger(value.retention_days) || (value.retention_days as number) < 1
    || (value.retention_days as number) > 3650 || !timestamp(value.cutoff_at)
    || !count(value.total_rows) || !count(value.expired_rows)
    || BigInt(value.expired_rows) > BigInt(value.total_rows)) return false;
  const oldest = value.oldest_expired_sequence;
  const newest = value.newest_expired_sequence;
  if (!(oldest === null && newest === null)
    && !(count(oldest) && count(newest) && BigInt(oldest) <= BigInt(newest))) return false;
  return (value.last_disposition === null || (text(value.last_disposition) && METHODS.has(value.last_disposition)))
    && (value.last_disposition_at === null || timestamp(value.last_disposition_at));
}

function validDisposition(value: unknown): boolean {
  if (!object(value) || !uuid(value.record_id) || !uuid(value.performed_by)
    || !text(value.category) || value.category.length > 128
    || !count(value.from_sequence) || !count(value.to_sequence)
    || !count(value.row_count) || !timestamp(value.performed_at)
    || !METHODS.has(value.method as string)
    || typeof value.note !== 'string' || value.note.length > 1000
    || !(value.evidence_hash === null
      || (typeof value.evidence_hash === 'string' && HEX_DIGEST.test(value.evidence_hash)))) return false;
  return BigInt(value.from_sequence) <= BigInt(value.to_sequence)
    && BigInt(value.row_count) <= BigInt(value.to_sequence) - BigInt(value.from_sequence) + 1n;
}

/** Never render a successful compliance signal or privileged mutation control from unvalidated JSON. */
export function parseAuditVerifications(response: unknown): ChainVerificationHistory[] | null {
  return rows(response, 'verifications', validVerification, (row) => row.verification_id as string, 30);
}

export function parseAuditRetention(response: unknown): AuditRetentionCategory[] | null {
  return rows(response, 'categories', validRetention, (row) => row.category as string);
}

export function parseAuditDispositions(response: unknown): AuditDisposition[] | null {
  return rows(response, 'dispositions', validDisposition, (row) => row.record_id as string);
}
