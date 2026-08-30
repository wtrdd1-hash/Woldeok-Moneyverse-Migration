import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { AdminInputError, adminValidation } from './admin.repository';

const { assertAction, assertLimit, assertPayload, assertUuid } = adminValidation;

/**
 * Every `bigint` below arrives as a string and leaves as a string.
 * node-postgres hands bigint back as text precisely so it is not silently
 * narrowed, and `sequence` is a chain position -- an off-by-one there is a
 * row the console cannot find.
 */
type BigIntString = string;

// packages/database/migrations/064-audit-search-and-verification.sql
export interface AuditSearchRow {
  sequence: BigIntString;
  audit_id: string;
  created_at: Date;
  hash_version: number;
  actor_user_id: string | null;
  action: string;
  feature: string | null;
  target_kind: string | null;
  target_id: string | null;
  subject_user_id: string | null;
  transaction_id: string | null;
  request_id: string | null;
  trace_id: string | null;
  session_hash: string | null;
  client_ip: string | null;
  outcome: string | null;
  response_status: number | null;
  metadata: unknown;
  context: unknown;
  previous_integrity_hash: string | null;
  integrity_hash: string;
}

export interface AuditRevealRow {
  sequence: BigIntString;
  audit_id: string;
  created_at: Date;
  actor_user_id: string | null;
  action: string;
  session_hash: string | null;
  client_ip: string | null;
  context: unknown;
  metadata: unknown;
}

export interface ChainVerificationRow {
  verification_id: string;
  from_sequence: BigIntString;
  to_sequence: BigIntString;
  checked_count: BigIntString;
  verified_count: BigIntString;
  legacy_count: BigIntString;
  mismatch_count: BigIntString;
  link_break_count: BigIntString;
  column_drift_count: BigIntString;
  first_bad_sequence: BigIntString | null;
  status: string;
}

export interface ChainVerificationHistoryRow extends ChainVerificationRow {
  requested_by: string | null;
  started_at: Date;
  completed_at: Date;
}

// packages/database/migrations/065-audit-retention-and-destruction.sql
export interface RetentionOverviewRow {
  category: string;
  retention_days: number;
  cutoff_at: Date;
  total_rows: BigIntString;
  expired_rows: BigIntString;
  oldest_expired_sequence: BigIntString | null;
  newest_expired_sequence: BigIntString | null;
  last_disposition: string | null;
  last_disposition_at: Date | null;
}

export interface DispositionRow {
  record_id: string;
  category: string;
  from_sequence: BigIntString;
  to_sequence: BigIntString;
  row_count: BigIntString;
  method: string;
  note: string;
  evidence_hash: string | null;
  performed_by: string;
  performed_at: Date;
}

export interface AuditSearchFilters {
  from?: unknown;
  to?: unknown;
  actorFilter?: unknown;
  subjectUserId?: unknown;
  feature?: unknown;
  action?: unknown;
  targetId?: unknown;
  transactionId?: unknown;
  requestId?: unknown;
  traceId?: unknown;
  clientIp?: unknown;
  outcome?: unknown;
  cursor?: unknown;
  limit?: unknown;
}

const FEATURE = /^[a-z][a-z0-9_.:-]{0,63}$/;
const ACTION_FILTER = /^[a-z][a-z0-9_.:-]{0,119}$/;
const CATEGORY = /^[a-z][a-z0-9_]{2,31}$/;
const ADDRESS = /^[0-9a-fA-F.:]+(\/\d{1,3})?$/;
const OUTCOMES = new Set(['success', 'failure', 'partial']);
const METHODS = new Set(['archived', 'destroyed', 'retained_on_hold']);

function optionalText(value: unknown, pattern: RegExp, field: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new AdminInputError(`${field} is malformed`);
  }
  return value;
}

function optionalUuid(value: unknown, field: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  assertUuid(value, field);
  return value as string;
}

/**
 * A timestamp the caller typed. `Date.parse` accepts a great deal that is not
 * a date, so the result is checked rather than the input.
 */
function optionalMoment(value: unknown, field: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') throw new AdminInputError(`${field} must be an ISO timestamp`);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new AdminInputError(`${field} must be an ISO timestamp`);
  return parsed.toISOString();
}

/**
 * Sequence values cross the wire as decimal strings because they are bigints.
 * `Number()` would accept `1e400` and lose precision above 2^53, so the shape
 * is checked as text and passed on as text.
 */
function optionalSequence(value: unknown, field: string): string | null {
  if (value === null || value === undefined || value === '') return null;
  const text = typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : value;
  if (typeof text !== 'string' || !/^\d{1,18}$/.test(text)) {
    throw new AdminInputError(`${field} must be a whole number`);
  }
  return text;
}

function requiredSequence(value: unknown, field: string): string {
  const sequence = optionalSequence(value, field);
  if (sequence === null) throw new AdminInputError(`${field} is required`);
  return sequence;
}

function requiredReason(value: unknown, field = 'reason'): string {
  if (typeof value !== 'string' || value.trim().length < 10 || value.length > 1000) {
    throw new AdminInputError(`${field} must be 10 to 1000 characters`);
  }
  return value;
}

export class AuditRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * One row per administrator HTTP request, written by the trail middleware.
   * Separate from `admin_record_audit_event` because it must also work for
   * the request that was refused, whose caller holds no role.
   */
  async recordConsoleAccess({
    actorUserId,
    action,
    targetId = null,
    requestId = null,
    metadata = {},
    context = {},
  }: {
    actorUserId: unknown;
    action: unknown;
    targetId?: unknown;
    requestId?: unknown;
    metadata?: unknown;
    context?: unknown;
  }): Promise<string> {
    assertUuid(actorUserId, 'actor user id');
    assertAction(action);
    assertUuid(targetId, 'target id', { optional: true });
    assertUuid(requestId, 'request id', { optional: true });
    assertPayload(metadata, 'metadata');
    assertPayload(context, 'context');

    const row = await queryOne<{ audit_id: string }>(
      this.pool,
      'SELECT public.admin_record_console_access($1,$2,$3,$4,$5::jsonb,$6::jsonb) AS audit_id',
      [actorUserId, action, targetId, requestId, metadata, context],
    );
    if (!row) throw new Error('admin_record_console_access did not return a row');
    return row.audit_id;
  }

  async searchEvents({
    actorUserId,
    filters = {},
  }: {
    actorUserId: unknown;
    filters?: AuditSearchFilters;
  }): Promise<AuditSearchRow[]> {
    assertUuid(actorUserId, 'actor user id');
    const limit = filters.limit ?? 30;
    assertLimit(limit);

    const outcome = optionalText(filters.outcome, /^[a-z]+$/, 'outcome');
    if (outcome !== null && !OUTCOMES.has(outcome)) {
      throw new AdminInputError('outcome is malformed');
    }

    return queryRows<AuditSearchRow>(
      this.pool,
      `SELECT event.sequence::text AS sequence, event.audit_id, event.created_at,
              event.hash_version, event.actor_user_id, event.action, event.feature,
              event.target_kind, event.target_id, event.subject_user_id, event.transaction_id,
              event.request_id, event.trace_id, event.session_hash, event.client_ip,
              event.outcome, event.response_status, event.metadata, event.context,
              event.previous_integrity_hash, event.integrity_hash
       FROM public.admin_search_audit_events(
         $1, $2::timestamptz, $3::timestamptz, $4, $5, $6, $7, $8, $9, $10, $11,
         $12::inet, $13, $14::bigint, $15
       ) AS event`,
      [
        actorUserId,
        optionalMoment(filters.from, 'from'),
        optionalMoment(filters.to, 'to'),
        optionalUuid(filters.actorFilter, 'administrator'),
        optionalUuid(filters.subjectUserId, 'member'),
        optionalText(filters.feature, FEATURE, 'feature'),
        optionalText(filters.action, ACTION_FILTER, 'action'),
        optionalUuid(filters.targetId, 'target id'),
        optionalUuid(filters.transactionId, 'transaction id'),
        optionalUuid(filters.requestId, 'request id'),
        optionalUuid(filters.traceId, 'trace id'),
        optionalText(filters.clientIp, ADDRESS, 'address'),
        outcome,
        optionalSequence(filters.cursor, 'cursor'),
        limit,
      ],
    );
  }

  async revealEvent({
    actorUserId,
    auditId,
    reason,
  }: {
    actorUserId: unknown;
    auditId: unknown;
    reason: unknown;
  }): Promise<AuditRevealRow | null> {
    assertUuid(actorUserId, 'actor user id');
    assertUuid(auditId, 'audit id');
    return queryOne<AuditRevealRow>(
      this.pool,
      `SELECT event.sequence::text AS sequence, event.audit_id, event.created_at,
              event.actor_user_id, event.action, event.session_hash, event.client_ip,
              event.context, event.metadata
       FROM public.admin_reveal_audit_event($1, $2, $3) AS event`,
      [actorUserId, auditId, requiredReason(reason)],
    );
  }

  async verifyChain({
    actorUserId,
    fromSequence = null,
    toSequence = null,
  }: {
    actorUserId: unknown;
    fromSequence?: unknown;
    toSequence?: unknown;
  }): Promise<ChainVerificationRow | null> {
    assertUuid(actorUserId, 'actor user id');
    return queryOne<ChainVerificationRow>(
      this.pool,
      `SELECT result.verification_id,
              result.from_sequence::text AS from_sequence,
              result.to_sequence::text AS to_sequence,
              result.checked_count::text AS checked_count,
              result.verified_count::text AS verified_count,
              result.legacy_count::text AS legacy_count,
              result.mismatch_count::text AS mismatch_count,
              result.link_break_count::text AS link_break_count,
              result.column_drift_count::text AS column_drift_count,
              result.first_bad_sequence::text AS first_bad_sequence,
              result.status
       FROM public.admin_verify_audit_chain($1, $2::bigint, $3::bigint) AS result`,
      [
        actorUserId,
        optionalSequence(fromSequence, 'from sequence'),
        optionalSequence(toSequence, 'to sequence'),
      ],
    );
  }

  async listVerifications({
    actorUserId,
    limit = 30,
  }: {
    actorUserId: unknown;
    limit?: unknown;
  }): Promise<ChainVerificationHistoryRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertLimit(limit);
    return queryRows<ChainVerificationHistoryRow>(
      this.pool,
      `SELECT result.verification_id, result.requested_by,
              result.from_sequence::text AS from_sequence,
              result.to_sequence::text AS to_sequence,
              result.checked_count::text AS checked_count,
              result.verified_count::text AS verified_count,
              result.legacy_count::text AS legacy_count,
              result.mismatch_count::text AS mismatch_count,
              result.link_break_count::text AS link_break_count,
              result.column_drift_count::text AS column_drift_count,
              result.first_bad_sequence::text AS first_bad_sequence,
              result.status, result.started_at, result.completed_at
       FROM public.admin_list_audit_chain_verifications($1, $2) AS result`,
      [actorUserId, limit],
    );
  }

  async retentionOverview({ actorUserId }: { actorUserId: unknown }): Promise<RetentionOverviewRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<RetentionOverviewRow>(
      this.pool,
      `SELECT overview.category, overview.retention_days, overview.cutoff_at,
              overview.total_rows::text AS total_rows,
              overview.expired_rows::text AS expired_rows,
              overview.oldest_expired_sequence::text AS oldest_expired_sequence,
              overview.newest_expired_sequence::text AS newest_expired_sequence,
              overview.last_disposition, overview.last_disposition_at
       FROM public.admin_audit_retention_overview($1) AS overview`,
      [actorUserId],
    );
  }

  async setRetentionPolicy({
    idempotencyKey,
    actorUserId,
    category,
    retentionDays,
    legalBasis,
    description,
    effectiveAt = null,
    reason,
  }: {
    idempotencyKey: unknown;
    actorUserId: unknown;
    category: unknown;
    retentionDays: unknown;
    legalBasis: unknown;
    description: unknown;
    effectiveAt?: unknown;
    reason: unknown;
  }): Promise<{
    policy_id: string;
    category: string;
    retention_days: number;
    effective_at: Date;
    replaced_retention_days: number | null;
  } | null> {
    assertUuid(idempotencyKey, 'idempotency key');
    assertUuid(actorUserId, 'actor user id');
    if (!Number.isSafeInteger(retentionDays) || (retentionDays as number) < 1 || (retentionDays as number) > 3650) {
      throw new AdminInputError('retention must be between 1 and 3650 days');
    }
    if (typeof legalBasis !== 'string' || legalBasis.trim().length === 0 || legalBasis.length > 500) {
      throw new AdminInputError('legal basis is required');
    }
    if (typeof description !== 'string' || description.trim().length === 0 || description.length > 1000) {
      throw new AdminInputError('description is required');
    }

    return queryOne(
      this.pool,
      `SELECT policy.policy_id, policy.category, policy.retention_days, policy.effective_at,
              policy.replaced_retention_days
       FROM public.admin_set_audit_retention_policy(
         $1,$2,$3,$4,$5,$6,$7::timestamptz,$8
       ) AS policy`,
      [
        idempotencyKey,
        actorUserId,
        optionalText(category, CATEGORY, 'category'),
        retentionDays,
        legalBasis,
        description,
        optionalMoment(effectiveAt, 'effective at'),
        requiredReason(reason),
      ],
    );
  }

  async recordDisposition({
    idempotencyKey,
    actorUserId,
    category,
    fromSequence,
    toSequence,
    method,
    note = '',
    reason,
  }: {
    idempotencyKey: unknown;
    actorUserId: unknown;
    category: unknown;
    fromSequence: unknown;
    toSequence: unknown;
    method: unknown;
    note?: unknown;
    reason: unknown;
  }): Promise<{
    record_id: string;
    category: string;
    from_sequence: BigIntString;
    to_sequence: BigIntString;
    row_count: BigIntString;
    method: string;
  } | null> {
    assertUuid(idempotencyKey, 'idempotency key');
    assertUuid(actorUserId, 'actor user id');
    if (typeof method !== 'string' || !METHODS.has(method)) {
      throw new AdminInputError('method must be archived, destroyed or retained_on_hold');
    }
    if (typeof note !== 'string' || note.length > 1000) {
      throw new AdminInputError('note must be at most 1000 characters');
    }

    return queryOne(
      this.pool,
      `SELECT record.record_id, record.category,
              record.from_sequence::text AS from_sequence,
              record.to_sequence::text AS to_sequence,
              record.row_count::text AS row_count,
              record.method
       FROM public.admin_record_audit_destruction(
         $1,$2,$3,$4::bigint,$5::bigint,$6,$7,$8
       ) AS record`,
      [
        idempotencyKey,
        actorUserId,
        optionalText(category, CATEGORY, 'category'),
        requiredSequence(fromSequence, 'from sequence'),
        requiredSequence(toSequence, 'to sequence'),
        method,
        note,
        requiredReason(reason),
      ],
    );
  }

  async listDispositions({
    actorUserId,
    limit = 30,
  }: {
    actorUserId: unknown;
    limit?: unknown;
  }): Promise<DispositionRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertLimit(limit);
    return queryRows<DispositionRow>(
      this.pool,
      `SELECT record.record_id, record.category,
              record.from_sequence::text AS from_sequence,
              record.to_sequence::text AS to_sequence,
              record.row_count::text AS row_count,
              record.method, record.note, record.evidence_hash,
              record.performed_by, record.performed_at
       FROM public.admin_list_audit_dispositions($1, $2) AS record`,
      [actorUserId, limit],
    );
  }
}
