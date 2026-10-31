import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type { SupportKstRange } from './support-date-range';

export interface SupportThreadRow {
  readonly thread_id: string;
  readonly subject: string;
  readonly status: string;
  readonly created_at: Date;
  readonly updated_at?: Date;
  readonly last_message_at?: Date;
  readonly user_id?: string;
  readonly display_name?: string;
}

export interface SupportMessageRow {
  readonly message_id: string;
  readonly sender_kind: 'user' | 'admin';
  readonly sender_user_id?: string;
  readonly body: string;
  readonly created_at: Date;
}

export class SupportRepository {
  constructor(private readonly pool: Queryable) {}

  myThreads(actor: string, status: string | null = null, q?: string, sort?: 'oldest', range?: SupportKstRange) {
    if (range) {
      const params: unknown[] = [actor, 100];
      const clauses: string[] = [];
      if (q !== undefined) { params.push(q); clauses.push(`strpos(lower(subject), lower($${params.length})) > 0`); }
      if (status !== null) { params.push(status); clauses.push(`status = $${params.length}`); }
      params.push(range.fromUtc); clauses.push(`last_message_at >= $${params.length}::timestamptz`);
      params.push(range.toUtcExclusive); clauses.push(`last_message_at < $${params.length}::timestamptz`);
      return queryRows<SupportThreadRow>(this.pool,
        `SELECT thread_id::text,subject,status,created_at,updated_at,last_message_at
         FROM public.support_my_threads($1,$2) WHERE ${clauses.join(' AND ')}
         ORDER BY last_message_at ${sort === 'oldest' ? 'ASC,thread_id ASC' : 'DESC,thread_id DESC'} LIMIT 50`, params);
    }
    if (sort === 'oldest') {
      // Reorder the latest 100 owner-scoped conversations; never claim an all-time oldest search.
      const clauses: string[] = [];
      const params: unknown[] = [actor, 100];
      if (q !== undefined) { params.push(q); clauses.push(`strpos(lower(subject), lower($${params.length})) > 0`); }
      if (status !== null) { params.push(status); clauses.push(`status = $${params.length}`); }
      const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
      return queryRows<SupportThreadRow>(this.pool,
        `SELECT thread_id::text,subject,status,created_at,updated_at,last_message_at
         FROM public.support_my_threads($1,$2)${where}
         ORDER BY last_message_at ASC,thread_id ASC LIMIT 50`, params);
    }
    if (q !== undefined) {
      // Restrict to the newest 100 owner-scoped rows *before* matching; never
      // widen access to another member or interpret %/_ as LIKE wildcards.
      const statusSql = status === null ? '' : ' AND status = $4';
      const params: unknown[] = [actor, 100, q];
      if (status !== null) params.push(status);
      return queryRows<SupportThreadRow>(this.pool,
        `SELECT thread_id::text,subject,status,created_at,updated_at,last_message_at
         FROM public.support_my_threads($1,$2)
         WHERE strpos(lower(subject), lower($3)) > 0${statusSql}
         ORDER BY last_message_at DESC,thread_id DESC LIMIT 50`, params);
    }
    if (status !== null) {
      return queryRows<SupportThreadRow>(this.pool,
        `SELECT thread_id::text,subject,status,created_at,updated_at,last_message_at
         FROM public.support_my_threads($1,$2)
         WHERE status = $3
         ORDER BY last_message_at DESC,thread_id DESC LIMIT $4`,
        [actor, 100, status, 50]);
    }
    return queryRows<SupportThreadRow>(this.pool,
      'SELECT thread_id::text,subject,status,created_at,updated_at,last_message_at FROM public.support_my_threads($1,$2)',
      [actor, 50]);
  }

  /** Owner-scoped recent-100 sample, not an all-time count. */
  async myThreadSummary(actor: string) {
    const row = await queryOne<{
      readonly open: number;
      readonly waiting_user: number;
      readonly resolved: number;
      readonly scanned: number;
    }>(this.pool, `
      SELECT
        count(*) FILTER (WHERE status = 'open')::integer AS open,
        count(*) FILTER (WHERE status = 'waiting_user')::integer AS waiting_user,
        count(*) FILTER (WHERE status = 'resolved')::integer AS resolved,
        count(*)::integer AS scanned
      FROM public.support_my_threads($1,100)
    `, [actor]);
    if (!row || ![row.open, row.waiting_user, row.resolved, row.scanned]
      .every((value) => Number.isSafeInteger(value) && value >= 0) ||
      row.open + row.waiting_user + row.resolved !== row.scanned ||
      row.scanned > 100) {
      throw new Error('support summary is unavailable');
    }
    return {
      open: row.open,
      waitingUser: row.waiting_user,
      resolved: row.resolved,
      scanned: row.scanned,
      mayBeIncomplete: row.scanned === 100,
    };
  }

  createThread(actor: string, key: string, subject: string, body: string) {
    return queryOne<SupportThreadRow>(this.pool,
      'SELECT thread_id::text,status,created_at FROM public.support_create_thread($1,$2,$3,$4)',
      [actor, key, subject, body]);
  }

  messages(actor: string, thread: string, limit = 200) {
    return queryRows<SupportMessageRow>(this.pool,
      'SELECT message_id::text,sender_kind,body,created_at FROM public.support_thread_messages($1,$2,$3)',
      [actor, thread, limit]);
  }

  exactMessage(actor: string, thread: string, messageId: string) {
    return queryOne<SupportMessageRow>(this.pool,
      `SELECT message_id::text,sender_kind,body,created_at
       FROM public.support_my_message_receipt($1,$2,$3)`,
      [actor, thread, messageId]);
  }

  addMessage(actor: string, key: string, thread: string, body: string) {
    return queryOne<SupportMessageRow>(this.pool,
      'SELECT message_id::text,sender_kind,body,created_at FROM public.support_add_message($1,$2,$3,$4)',
      [actor, key, thread, body]);
  }

  adminThreads(actor: string, status: string | null, limit = 100) {
    return queryRows<SupportThreadRow>(this.pool,
      `SELECT thread_id::text,user_id::text,display_name,subject,status,created_at,last_message_at
       FROM public.admin_support_threads($1,$2,$3)`, [actor, status, limit]);
  }

  adminMessages(actor: string, thread: string, limit = 500) {
    return queryRows<SupportMessageRow>(this.pool,
      `SELECT message_id::text,sender_kind,sender_user_id::text,body,created_at
       FROM public.admin_support_thread_messages($1,$2,$3)`, [actor, thread, limit]);
  }

  adminReply(actor: string, key: string, thread: string, body: string) {
    return queryOne<SupportMessageRow>(this.pool,
      'SELECT message_id::text,sender_kind,body,created_at FROM public.admin_support_reply($1,$2,$3,$4)',
      [actor, key, thread, body]);
  }

  async adminSetStatus(actor: string, thread: string, status: string): Promise<boolean> {
    const row = await queryOne<{ changed: boolean }>(this.pool,
      'SELECT public.admin_support_set_status($1,$2,$3) AS changed', [actor, thread, status]);
    return row?.changed === true;
  }
}
