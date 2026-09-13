import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

interface ActiveSessionRow {
  readonly session_id: string;
  readonly created_at: Date;
  readonly expires_at: Date;
  readonly reauthenticated_at: Date | null;
  readonly admin_opened_at: Date | null;
}

export interface MemberSessionView {
  readonly sessionId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly reauthenticatedAt: string | null;
  readonly current: boolean;
  readonly administratorSession: boolean;
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
      `SELECT id::text AS session_id, created_at, expires_at, reauthenticated_at, admin_opened_at
       FROM auth_sessions
       WHERE user_id=$1 AND revoked_at IS NULL AND expires_at>now()
       ORDER BY created_at DESC, id DESC`,
      [userId],
    );
    return rows.map((row) => ({
      sessionId: row.session_id,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      reauthenticatedAt: row.reauthenticated_at?.toISOString() ?? null,
      current: row.session_id === currentSessionId,
      administratorSession: row.admin_opened_at !== null,
    }));
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
