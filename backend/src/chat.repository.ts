import type { Queryable } from './core/db';
import { queryOne } from './core/db';

export interface ChatConversationRow { conversation_id: string; latest_sequence: string; state: string }
export interface ChatMessageRow { message_id: string; sequence: string; body: string; created_at: Date | string }

export class ChatRepository {
  constructor(private readonly db: Queryable) {}
  async open(actor: string, peer: string): Promise<ChatConversationRow> {
    const row = await queryOne<ChatConversationRow>(this.db,
      'SELECT conversation_id, latest_sequence, state FROM public.private_chat_open($1::uuid,$2::uuid)', [actor, peer]);
    if (!row) throw new Error('private_chat_open returned no row');
    return row;
  }
  async send(actor: string, conversation: string, key: string, body: string): Promise<ChatMessageRow> {
    const row = await queryOne<ChatMessageRow>(this.db,
      'SELECT message_id, sequence, body, created_at FROM public.private_chat_send($1::uuid,$2::uuid,$3::uuid,$4::text)', [actor, conversation, key, body]);
    if (!row) throw new Error('private_chat_send returned no row');
    return row;
  }
  async read(actor: string, conversation: string, sequence: string): Promise<string> {
    const row = await queryOne<{ last_read_sequence: string }>(this.db,
      'SELECT public.private_chat_read($1::uuid,$2::uuid,$3::bigint)::text AS last_read_sequence', [actor, conversation, sequence]);
    if (!row) throw new Error('private_chat_read returned no row');
    return row.last_read_sequence;
  }
}
