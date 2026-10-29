import { ConflictException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import type { NotificationQueryDto } from './notification.dto';
import { createNotificationSearchCursor, parseNotificationSearchCursor, validateNotificationSearch, type NotificationSearchInput } from './notification-search';

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
         AND ($2::text IS NULL OR category = $2::text)
         AND ($3::boolean IS NULL OR is_read = FALSE)
       ORDER BY created_at DESC, id DESC
       LIMIT $4 OFFSET $5`,
      [actor, query.category ?? null, unreadOnly, limit, offset],
    );
  }

  /** Search never mutates notification or ledger state. A single read-only PG
   * transaction gives a server-derived as-of time and a bounded query timeout.
   * The existing owner/date B-tree index must be present; otherwise fail closed.
   */
  async searchNotifications(actor: string, session: string, input: NotificationSearchInput): Promise<{
    items: { id: string; category: string; title: string; body: string; link: string | null; isRead: boolean; createdAt: string }[];
    nextCursor: string | null; hasMore: boolean; asOfUtc: string;
  }> {
    if (process.env.NOTIFICATION_SEARCH_ENABLED !== 'true') {
      throw new ServiceUnavailableException('Notification search is disabled');
    }
    const filter = validateNotificationSearch(input);
    const cursor = input.cursor ? parseNotificationSearchCursor(input.cursor, actor, session, filter) : null;
    if (!this.pool || !('connect' in this.pool) || typeof this.pool.connect !== 'function') {
      throw new ServiceUnavailableException('Notification search database is unavailable');
    }
    const client = await (this.pool as Queryable & { connect(): Promise<Queryable & { release(): void }> }).connect();
    let began = false;
    try {
      await client.query('BEGIN READ ONLY');
      began = true;
      await client.query("SET LOCAL statement_timeout = '2000ms'");
      await client.query("SET LOCAL lock_timeout = '500ms'");
      const index = await queryOne<{ available: boolean }>(client, `SELECT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'public' AND tablename = 'in_app_notifications'
          AND indexname = 'idx_in_app_notif_user_created'
          AND indexdef LIKE '%(user_id, created_at DESC)%'
      ) AS available`);
      if (index?.available !== true) throw new ServiceUnavailableException('Notification search index unavailable');
      const time = await queryOne<{ as_of: Date }>(client, 'SELECT clock_timestamp() AS as_of');
      if (!time?.as_of || !Number.isFinite(new Date(time.as_of).getTime())) {
        throw new ServiceUnavailableException('Notification search snapshot unavailable');
      }
      const asOf = cursor?.asOf ?? new Date(time.as_of).toISOString();
      const rows = await queryRows<{
        id: string; category: string; title: string; body: string; link: string | null;
        is_read: boolean; created_at: Date;
      }>(client, `SELECT id::text, category, left(title, 200) AS title, left(body, 2000) AS body, link, is_read, created_at
        FROM public.in_app_notifications
        WHERE user_id = $1::uuid
          AND ($2::text IS NULL OR category = $2::text)
          AND ($3::boolean = FALSE OR is_read = FALSE)
          AND created_at >= $4::timestamptz AND created_at < $5::timestamptz
          AND created_at <= $6::timestamptz
          AND (strpos(lower(title), lower($7::text)) > 0 OR strpos(lower(body), lower($7::text)) > 0)
          AND ($8::timestamptz IS NULL OR (created_at, id) < ($8::timestamptz, $9::uuid))
        ORDER BY created_at DESC, id DESC LIMIT $10`, [
        actor, filter.category, filter.unreadOnly, filter.fromUtc, filter.toUtc, asOf,
        filter.query, cursor?.afterAt ?? null, cursor?.afterId ?? null, filter.limit + 1,
      ]);
      await client.query('COMMIT');
      began = false;
      const hasMore = rows.length > filter.limit;
      const page = rows.slice(0, filter.limit);
      const last = page.at(-1);
      const nextCursor = hasMore && last ? createNotificationSearchCursor(
        actor, session, filter, asOf, new Date(last.created_at).toISOString(), last.id,
      ) : null;
      return {
        items: page.map((row) => ({
          id: row.id, category: row.category, title: row.title, body: row.body,
          // An untrusted notification URL must not become an external redirect.
          link: typeof row.link === 'string' && row.link.startsWith('/') && !row.link.startsWith('//') &&
            !/[\\\u0000-\u001f]/.test(row.link) ? row.link : null,
          isRead: row.is_read, createdAt: new Date(row.created_at).toISOString(),
        })),
        nextCursor, hasMore, asOfUtc: asOf,
      };
    } catch (error: unknown) {
      if (began) await client.query('ROLLBACK').catch(() => undefined);
      if (error instanceof ServiceUnavailableException || error instanceof ConflictException) throw error;
      // SQL errors and timeout details must not reveal private notification text.
      throw new ServiceUnavailableException('Notification search unavailable');
    } finally {
      client.release();
    }
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

  /** A receipt observes unread rows after the mutation; new arrivals are not silently counted as read. */
  async markAllReadWithReceipt(actor: string): Promise<{ updatedCount: number; remainingUnreadCount: number }> {
    if (!this.pool) throw new Error('database pool unavailable');
    const updated = await queryOne<{ affected_count: number }>(
      this.pool,
      'SELECT public.notification_mark_all_read($1) AS affected_count',
      [actor],
    );
    const remaining = await queryOne<{ unread_count: number }>(
      this.pool,
      'SELECT public.notification_unread_count($1) AS unread_count',
      [actor],
    );
    if (!Number.isSafeInteger(updated?.affected_count) || (updated?.affected_count ?? -1) < 0 ||
        !Number.isSafeInteger(remaining?.unread_count) || (remaining?.unread_count ?? -1) < 0) {
      throw new Error('notification read-all receipt unavailable');
    }
    return { updatedCount: updated!.affected_count, remainingUnreadCount: remaining!.unread_count };
  }

  /**
   * A notification is not a reward ledger entry. Until an atomic, auditable
   * reward-settlement operation exists, claiming must never mark notifications
   * as read or report that funds were credited.
   */
  async claimAll(_actor: string): Promise<never> {
    throw new ConflictException('Reward claiming is unavailable; no rewards or notifications were changed.');
  }
}

