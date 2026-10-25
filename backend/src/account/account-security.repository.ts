import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

interface ActiveSessionRow {
  readonly session_id: string;
  readonly created_at: Date;
  readonly expires_at: Date;
  readonly reauthenticated_at: Date | null;
  readonly admin_opened_at: Date | null;
  readonly last_seen_at: Date;
  readonly device_label: string;
}

export interface MemberSessionView {
  readonly sessionId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly reauthenticatedAt: string | null;
  readonly current: boolean;
  readonly administratorSession: boolean;
  readonly lastSeenAt: string;
  readonly deviceLabel: string;
}

interface ExportSessionRow {
  readonly created_at: Date;
  readonly expires_at: Date;
  readonly last_seen_at: Date;
  readonly device_label: string;
  readonly current: boolean;
  readonly administrator_session: boolean;
}

export interface MemberSessionExportView {
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly lastSeenAt: string;
  readonly deviceLabel: string;
  readonly current: boolean;
  readonly administratorSession: boolean;
}

interface SecurityEventRow {
  readonly event_type: string;
  readonly created_at: Date;
}

export interface MemberSecurityEventView {
  readonly type: string;
  readonly createdAt: string;
}

interface RevokedCountRow {
  readonly revoked_sessions: number;
}

@Injectable()
export class AccountSecurityRepository {
  constructor(private readonly pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
  }

  async activeSessions(userId: string, currentSessionId: string): Promise<MemberSessionView[]> {
    const rows = await queryRows<ActiveSessionRow>(
      this.pool,
      `SELECT session_id::text AS session_id, created_at, expires_at, reauthenticated_at, admin_opened_at,
              last_seen_at, device_label
       FROM account_active_sessions($1::uuid, $2::uuid)`,
      [userId, currentSessionId],
    );
    return rows.map((row) => ({
      sessionId: row.session_id,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      reauthenticatedAt: row.reauthenticated_at?.toISOString() ?? null,
      current: row.session_id === currentSessionId,
      administratorSession: row.admin_opened_at !== null,
      lastSeenAt: row.last_seen_at.toISOString(),
      deviceLabel: row.device_label,
    }));
  }

  async activeSessionsForExport(userId: string, currentSessionId: string): Promise<MemberSessionExportView[]> {
    // Fetch one extra row so a truncated inventory cannot masquerade as complete.
    const rows = await queryRows<ExportSessionRow>(
      this.pool,
      `SELECT created_at, expires_at, last_seen_at, device_label,
              (session_id = $2::uuid) AS current,
              (admin_opened_at IS NOT NULL) AS administrator_session
       FROM public.account_active_sessions($1::uuid, $2::uuid)
       LIMIT 101`,
      [userId, currentSessionId],
    );
    return rows.map((row) => ({
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      lastSeenAt: row.last_seen_at.toISOString(),
      deviceLabel: row.device_label,
      current: row.current,
      administratorSession: row.administrator_session,
    }));
  }

  async recentEvents(userId: string): Promise<MemberSecurityEventView[]> {
    const rows = await queryRows<SecurityEventRow>(
      this.pool,
      `SELECT event_type, created_at FROM account_recent_security_events($1::uuid, 20)`,
      [userId],
    );
    return rows.map((row) => ({ type: row.event_type, createdAt: row.created_at.toISOString() }));
  }

  async revokeOtherSession(
    userId: string,
    currentSessionId: string,
    targetSessionId: string,
  ): Promise<boolean> {
    const row = await queryOne<{ readonly id: string }>(
      this.pool,
      `UPDATE auth_sessions
       SET revoked_at=coalesce(revoked_at, now())
       WHERE id=$3 AND user_id=$1 AND id<>$2
         AND revoked_at IS NULL AND expires_at>now()
       RETURNING id::text AS id`,
      [userId, currentSessionId, targetSessionId],
    );
    return row !== null;
  }

  async revokeOtherSessions(userId: string, currentSessionId: string): Promise<number> {
    const row = await queryOne<RevokedCountRow>(
      this.pool,
      `WITH revoked AS (
         UPDATE auth_sessions
         SET revoked_at=coalesce(revoked_at, now())
         WHERE user_id=$1 AND id<>$2
           AND revoked_at IS NULL AND expires_at>now()
         RETURNING 1
       )
       SELECT count(*)::integer AS revoked_sessions FROM revoked`,
      [userId, currentSessionId],
    );
    return row?.revoked_sessions ?? 0;
  }
}
