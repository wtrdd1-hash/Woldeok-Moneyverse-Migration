import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AdminInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminInputError';
  }
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function assertUuid(
  value: unknown,
  field: string,
  { optional = false }: { optional?: boolean } = {},
): void {
  if (optional && (value === null || value === undefined)) return;
  if (!isUuid(value)) throw new AdminInputError(`${field} must be a UUID`);
}

function assertAction(value: unknown, field = 'action'): void {
  if (typeof value !== 'string' || !/^[a-z][a-z0-9_.:-]{2,119}$/.test(value)) {
    throw new AdminInputError(`${field} must be a valid administrative action`);
  }
}

function assertPayload(value: unknown, field = 'payload'): void {
  if (value === null || Array.isArray(value) || typeof value !== 'object') {
    throw new AdminInputError(`${field} must be a JSON object`);
  }

  let encoded: string | undefined;
  try {
    encoded = JSON.stringify(value);
  } catch {
    throw new AdminInputError(`${field} must be JSON serializable`);
  }
  if (!encoded || Buffer.byteLength(encoded, 'utf8') > 16_384) {
    throw new AdminInputError(`${field} must be at most 16 KiB`);
  }
}

function assertDecision(value: unknown): asserts value is 'approved' | 'rejected' {
  if (value !== 'approved' && value !== 'rejected') {
    throw new AdminInputError('decision must be approved or rejected');
  }
}

function isSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value);
}

function assertLimit(value: unknown): void {
  if (!isSafeInteger(value) || value < 1 || value > 100) {
    throw new AdminInputError('limit must be an integer between 1 and 100');
  }
}

function assertReason(value: unknown, decision: 'approved' | 'rejected'): string | null {
  if (value === null || value === undefined || value === '') {
    if (decision === 'rejected') throw new AdminInputError('a rejection reason is required');
    return null;
  }
  if (typeof value !== 'string' || value.trim().length > 1000) {
    throw new AdminInputError('reason must be a string of at most 1000 characters');
  }
  return value.trim() || null;
}

/** Row interfaces below are annotated with the migration that defines their columns. */

// packages/database/migrations/007-admin-hardening.sql (admin_current_roles)
interface AdminRoleRow {
  role: string;
}

// packages/database/migrations/008-admin-read-models.sql (admin_list_approval_requests)
interface AdminApprovalRequestRow {
  approval_request_id: string;
  requester_id: string;
  approver_id: string | null;
  action: string;
  payload: unknown;
  status: string;
  requires_two_person_approval: boolean;
  created_at: Date;
  decided_at: Date | null;
  decision_reason: string | null;
}

// packages/database/migrations/008-admin-read-models.sql (admin_recent_audit_events)
interface AdminAuditEventRow {
  audit_id: string;
  actor_user_id: string;
  action: string;
  target_id: string | null;
  request_id: string | null;
  metadata: unknown;
  created_at: Date;
  previous_integrity_hash: string | null;
  integrity_hash: string;
}

// packages/database/migrations/026-admin-user-restrictions.sql (admin_list_users)
interface AdminUserRow {
  user_id: string;
  status: string;
  display_name: string;
  created_at: Date;
  restricted_at: Date | null;
  restriction_reason: string | null;
}

// packages/database/migrations/039-admin-discord-outbox-read.sql (admin_recent_discord_outbox_events)
interface AdminDiscordOutboxEventRow {
  event_id: string;
  event_type: string;
  created_at: Date;
  delivered_at: Date | null;
  delivery_attempts: number;
  delivery_status: string;
}

// packages/database/migrations/026-admin-user-restrictions.sql (admin_set_user_restriction)
interface ChangedRow {
  changed: boolean | null;
}

// packages/database/migrations/007-admin-hardening.sql (admin_create_approval_request)
interface ApprovalRequestIdRow {
  approval_request_id: string;
}

// packages/database/migrations/007-admin-hardening.sql (admin_decide_approval_request)
interface ApprovalDecisionRow {
  approval_request_id: string;
  status: string;
}

// packages/database/migrations/007-admin-hardening.sql (admin_record_audit_event)
interface AuditIdRow {
  audit_id: string;
}

@Injectable()
export class AdminRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    this.pool = pool;
  }

  async currentRoles({ userId }: { userId: unknown }): Promise<string[]> {
    assertUuid(userId, 'user id');
    const rows = await queryRows<AdminRoleRow>(
      this.pool,
      'SELECT role::text AS role FROM public.admin_current_roles($1)',
      [userId],
    );
    return rows.map(({ role }) => role);
  }

  async approvalRequests({
    actorUserId,
    limit = 30,
  }: {
    actorUserId: unknown;
    limit?: unknown;
  }): Promise<AdminApprovalRequestRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertLimit(limit);
    return queryRows<AdminApprovalRequestRow>(
      this.pool,
      `SELECT approval_request_id, requester_id, approver_id, action, payload,
              status, requires_two_person_approval, created_at, decided_at, decision_reason
       FROM public.admin_list_approval_requests($1, $2)`,
      [actorUserId, limit],
    );
  }

  async recentAuditEvents({
    actorUserId,
    limit = 30,
  }: {
    actorUserId: unknown;
    limit?: unknown;
  }): Promise<AdminAuditEventRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertLimit(limit);
    return queryRows<AdminAuditEventRow>(
      this.pool,
      `SELECT audit_id, actor_user_id, action, target_id, request_id, metadata,
              created_at, previous_integrity_hash, integrity_hash
       FROM public.admin_recent_audit_events($1, $2)`,
      [actorUserId, limit],
    );
  }

  async users({
    actorUserId,
    limit = 50,
  }: {
    actorUserId: unknown;
    limit?: unknown;
  }): Promise<AdminUserRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertLimit(limit);
    return queryRows<AdminUserRow>(
      this.pool,
      'SELECT user_id::text,status,display_name,created_at,restricted_at,restriction_reason FROM public.admin_list_users($1,$2)',
      [actorUserId, limit],
    );
  }

  async recentDiscordOutboxEvents({
    actorUserId,
    limit = 30,
  }: {
    actorUserId: unknown;
    limit?: unknown;
  }): Promise<AdminDiscordOutboxEventRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertLimit(limit);
    return queryRows<AdminDiscordOutboxEventRow>(
      this.pool,
      'SELECT event_id::text,event_type,created_at,delivered_at,delivery_attempts,delivery_status FROM public.admin_recent_discord_outbox_events($1,$2)',
      [actorUserId, limit],
    );
  }

  async setUserRestriction({
    actorUserId,
    userId,
    restricted,
    reason,
    requestId = null,
  }: {
    actorUserId: unknown;
    userId: unknown;
    restricted: unknown;
    reason: unknown;
    requestId?: unknown;
  }): Promise<{ changed: boolean }> {
    assertUuid(actorUserId, 'actor user id');
    assertUuid(userId, 'user id');
    assertUuid(requestId, 'request id', { optional: true });
    if (typeof restricted !== 'boolean' || typeof reason !== 'string')
      throw new AdminInputError('invalid restriction request');
    const row = await queryOne<ChangedRow>(
      this.pool,
      'SELECT public.admin_set_user_restriction($1,$2,$3,$4,$5) AS changed',
      [actorUserId, userId, restricted, reason, requestId],
    );
    return { changed: Boolean(row?.changed) };
  }

  async createApprovalRequest({
    requesterId,
    action,
    payload,
    idempotencyKey,
    requestId = null,
  }: {
    requesterId: unknown;
    action: unknown;
    payload: unknown;
    idempotencyKey: unknown;
    requestId?: unknown;
  }): Promise<string> {
    assertUuid(requesterId, 'requester id');
    assertAction(action);
    assertPayload(payload);
    assertUuid(idempotencyKey, 'idempotency key');
    assertUuid(requestId, 'request id', { optional: true });

    const row = await queryOne<ApprovalRequestIdRow>(
      this.pool,
      `SELECT public.admin_create_approval_request(
        $1, $2, $3::jsonb, $4, $5
      ) AS approval_request_id`,
      [requesterId, action, payload, idempotencyKey, requestId],
    );
    // Invariant: admin_create_approval_request is `RETURNS uuid`, so selecting
    // its result always yields exactly one row.
    if (!row) throw new Error('admin_create_approval_request did not return a row');
    return row.approval_request_id;
  }

  async decideApprovalRequest({
    approverId,
    approvalRequestId,
    decision,
    reason = null,
    requestId = null,
  }: {
    approverId: unknown;
    approvalRequestId: unknown;
    decision: unknown;
    reason?: unknown;
    requestId?: unknown;
  }): Promise<{ approvalRequestId: string; status: string }> {
    assertUuid(approverId, 'approver id');
    assertUuid(approvalRequestId, 'approval request id');
    assertDecision(decision);
    const normalizedReason = assertReason(reason, decision);
    assertUuid(requestId, 'request id', { optional: true });

    const row = await queryOne<ApprovalDecisionRow>(
      this.pool,
      `SELECT approval_request_id, status
       FROM public.admin_decide_approval_request($1, $2, $3, $4, $5)`,
      [approverId, approvalRequestId, decision, normalizedReason, requestId],
    );
    // Invariant: admin_decide_approval_request raises on every not-found or
    // invalid-state case and otherwise always RETURN QUERYs exactly one row.
    if (!row) throw new Error('admin_decide_approval_request did not return a row');
    return { approvalRequestId: row.approval_request_id, status: row.status };
  }

  async recordAuditEvent({
    actorUserId,
    action,
    targetId = null,
    requestId = null,
    metadata = {},
  }: {
    actorUserId: unknown;
    action: unknown;
    targetId?: unknown;
    requestId?: unknown;
    metadata?: unknown;
  }): Promise<string> {
    assertUuid(actorUserId, 'actor user id');
    assertAction(action);
    assertUuid(targetId, 'target id', { optional: true });
    assertUuid(requestId, 'request id', { optional: true });
    assertPayload(metadata, 'metadata');

    const row = await queryOne<AuditIdRow>(
      this.pool,
      `SELECT public.admin_record_audit_event(
        $1, $2, $3, $4, $5::jsonb
      ) AS audit_id`,
      [actorUserId, action, targetId, requestId, metadata],
    );
    // Invariant: admin_record_audit_event is `RETURNS uuid`, so selecting its
    // result always yields exactly one row.
    if (!row) throw new Error('admin_record_audit_event did not return a row');
    return row.audit_id;
  }
}

export const adminValidation = {
  assertAction,
  assertLimit,
  assertPayload,
  assertUuid,
};
