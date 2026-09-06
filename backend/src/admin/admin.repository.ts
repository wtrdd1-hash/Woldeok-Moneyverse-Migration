import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { EncryptionService } from '../security/encryption.service';

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

function isSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value);
}

function assertLimit(value: unknown): void {
  if (!isSafeInteger(value) || value < 1 || value > 100) {
    throw new AdminInputError('limit must be an integer between 1 and 100');
  }
}

/** Row interfaces below are annotated with the migration that defines their columns. */

// packages/database/migrations/007-admin-hardening.sql (admin_current_roles)
interface AdminRoleRow {
  role: string;
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
  cash_balance?: number;
  bank_balance?: number;
  bond_balance?: number;
  stock_eval?: number;
  total_net_worth?: number;
  wealth_rank?: number;
  last_login_at?: Date | null;
  last_seen_at?: Date | null;
  last_admin_at?: Date | null;
}

interface UserAccessSummaryRow {
  user_id: string;
  last_login_at: Date | null;
  last_seen_at: Date | null;
  last_admin_at: Date | null;
}

// packages/database/migrations/039-admin-discord-outbox-read.sql (admin_recent_discord_outbox_events)
// delivery_status gained `suppressed` and `dead_letter` in 066: an event no
// route announces, and one the worker has given up on. Rendered as it arrives,
// like the four that were already there.
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

// packages/database/migrations/007-admin-hardening.sql (admin_record_audit_event)
interface AuditIdRow {
  audit_id: string;
}

@Injectable()
export class AdminRepository {
  readonly pool: Queryable;
  readonly encryptionService: EncryptionService;

  constructor(pool: Queryable, encryptionService?: EncryptionService) {
    this.pool = pool;
    this.encryptionService = encryptionService ?? new EncryptionService();
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
    limit = 100,
  }: {
    actorUserId: unknown;
    limit?: unknown;
  }): Promise<AdminUserRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertLimit(limit);
    const [rows, summaries] = await Promise.all([
      queryRows<Record<string, unknown>>(
        this.pool,
        'SELECT user_id::text,status,display_name,created_at,restricted_at,restriction_reason,cash_balance,bank_balance,bond_balance,stock_eval,total_net_worth,wealth_rank FROM public.admin_list_users($1,$2)',
        [actorUserId, limit],
      ),
      queryRows<UserAccessSummaryRow>(
        this.pool,
        'SELECT user_id::text,last_login_at,last_seen_at,last_admin_at FROM public.activity_user_access_summaries($1)',
        [actorUserId],
      ),
    ]);
    const summariesByUser = new Map(summaries.map((summary) => [summary.user_id, summary]));
    return rows.map((r) => ({
      user_id: String(r.user_id),
      status: String(r.status),
      display_name: this.encryptionService.decrypt(String(r.display_name)) ?? String(r.display_name),
      created_at: r.created_at as Date,
      restricted_at: (r.restricted_at as Date) ?? null,
      restriction_reason: (r.restriction_reason as string) ?? null,
      cash_balance: Number(r.cash_balance ?? 0),
      bank_balance: Number(r.bank_balance ?? 0),
      bond_balance: Number(r.bond_balance ?? 0),
      stock_eval: Number(r.stock_eval ?? 0),
      total_net_worth: Number(r.total_net_worth ?? 0),
      wealth_rank: Number(r.wealth_rank ?? 0),
      last_login_at: summariesByUser.get(String(r.user_id))?.last_login_at ?? null,
      last_seen_at: summariesByUser.get(String(r.user_id))?.last_seen_at ?? null,
      last_admin_at: summariesByUser.get(String(r.user_id))?.last_admin_at ?? null,
    }));
  }

  async userPortfolio({
    actorUserId,
    targetUserId,
  }: {
    actorUserId: unknown;
    targetUserId: unknown;
  }): Promise<unknown> {
    assertUuid(actorUserId, 'actor user id');
    assertUuid(targetUserId, 'target user id');
    const row = await queryOne<{ admin_get_user_portfolio: unknown }>(
      this.pool,
      'SELECT public.admin_get_user_portfolio($1, $2)',
      [actorUserId, targetUserId],
    );
    const data = row?.admin_get_user_portfolio ?? null;
    if (
      data &&
      typeof data === 'object' &&
      'displayName' in data &&
      typeof (data as { displayName: unknown }).displayName === 'string'
    ) {
      const obj = data as { displayName: string };
      obj.displayName = this.encryptionService.decrypt(obj.displayName) ?? obj.displayName;
    }
    return data;
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
