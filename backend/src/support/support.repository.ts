import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

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

  myThreads(actor: string, limit = 50, search?: string) {
    if (search) {
      // Search only the latest 100 owner-scoped rows; do not imply all-history coverage.
      return queryRows<SupportThreadRow>(this.pool,
        `SELECT thread_id::text,subject,status,created_at,updated_at,last_message_at
         FROM public.support_my_threads($1,$2)
         WHERE pg_catalog.strpos(pg_catalog.lower(subject), pg_catalog.lower($3::text)) > 0`,
        [actor, 100, search]);
    }
    return queryRows<SupportThreadRow>(this.pool,
      'SELECT thread_id::text,subject,status,created_at,updated_at,last_message_at FROM public.support_my_threads($1,$2)',
      [actor, limit]);
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
      'SELECT message_id::text,sender_kind,body,created_at FROM public.support_my_message_receipt($1,$2,$3)',
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
