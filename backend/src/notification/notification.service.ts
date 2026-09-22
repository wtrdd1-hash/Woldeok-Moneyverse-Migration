import { Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import type { NotificationQueryDto } from './notification.dto';

@Injectable()
export class NotificationService {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable | null) {}

  async listNotifications(actor: string, query: NotificationQueryDto): Promise<unknown[]> {
    if (!this.pool) throw new Error('database pool unavailable');
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;
    const unreadOnly = query.unreadOnly ? true : null;

    return queryRows(
      this.pool,
      `SELECT id::text, category, title, body, link, dedupe_key,
              is_read, read_at, created_at
       FROM public.in_app_notifications
       WHERE user_id = $1
         AND ($2::boolean IS NULL OR is_read = FALSE)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [actor, unreadOnly, limit, offset],
    );
  }

  async unreadCount(actor: string): Promise<number> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ unread_count: number }>(
      this.pool,
      `SELECT public.notification_unread_count($1) AS unread_count`,
      [actor],
    );
    return row?.unread_count ?? 0;
  }

  async markRead(actor: string, notificationId: string): Promise<boolean> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ success: boolean }>(
      this.pool,
      `SELECT public.notification_mark_read($1, $2) AS success`,
      [actor, notificationId],
    );
    return row?.success ?? false;
  }

  async markAllRead(actor: string): Promise<number> {
    if (!this.pool) throw new Error('database pool unavailable');
    const row = await queryOne<{ affected_count: number }>(
      this.pool,
      `SELECT public.notification_mark_all_read($1) AS affected_count`,
      [actor],
    );
    return row?.affected_count ?? 0;
  }
}
