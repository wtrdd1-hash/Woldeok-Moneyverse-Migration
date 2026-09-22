import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ChatInputError extends Error {}

export interface ConversationRow {
  readonly conversation_id: string;
  readonly state: string;
  readonly latest_sequence: string;
  readonly last_message_at: Date | null;
  readonly created_at: Date;
  readonly peer_user_id: string;
  readonly peer_display_name: string;
  readonly peer_avatar_key: string | null;
  readonly last_read_sequence: string;
  readonly unread_count: string;
  readonly muted: boolean;
  readonly archived: boolean;
  readonly last_message_body: string | null;
  readonly is_peer_blocked?: boolean;
}

export interface MessageRow {
  readonly id: string;
  readonly conversation_id: string;
  readonly sender_id: string;
  readonly sequence: string;
  readonly body: string;
  readonly created_at: Date;
  readonly is_mine: boolean;
}

export interface OpenConversationResult {
  readonly conversation_id: string;
  readonly latest_sequence: string;
  readonly state: string;
}

export interface SendMessageResult {
  readonly message_id: string;
  readonly sequence: string;
  readonly body: string;
  readonly created_at: Date;
}

@Injectable()
export class PostgresChatRepository {
  constructor(private readonly client: Queryable) {}

  async openConversation(actorUserId: string, peerUserId: string): Promise<OpenConversationResult> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(peerUserId)) throw new ChatInputError('peerUserId must be a valid UUID');
    if (actorUserId === peerUserId) throw new ChatInputError('cannot open conversation with oneself');

    const row = await queryOne<OpenConversationResult>(
      this.client,
      `SELECT conversation_id, latest_sequence::text, state
       FROM public.private_chat_open($1::uuid, $2::uuid);`,
      [actorUserId, peerUserId],
    );
    if (!row) throw new Error('failed to open or retrieve conversation');
    return row;
  }

  async sendMessage(
    actorUserId: string,
    conversationId: string,
    idempotencyKey: string,
    body: string,
  ): Promise<SendMessageResult> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(conversationId)) throw new ChatInputError('conversationId must be a valid UUID');
    if (!UUID_REGEX.test(idempotencyKey)) throw new ChatInputError('idempotencyKey must be a valid UUID');
    if (body.length < 1 || body.length > 2000) throw new ChatInputError('body length must be between 1 and 2000');

    const row = await queryOne<SendMessageResult>(
      this.client,
      `SELECT message_id, sequence::text, body, created_at
       FROM public.private_chat_send($1::uuid, $2::uuid, $3::uuid, $4::text);`,
      [actorUserId, conversationId, idempotencyKey, body],
    );
    if (!row) throw new Error('failed to send message');
    return row;
  }

  async markAsRead(actorUserId: string, conversationId: string, sequence: number): Promise<string> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(conversationId)) throw new ChatInputError('conversationId must be a valid UUID');
    if (sequence < 0) throw new ChatInputError('sequence must be non-negative');

    const row = await queryOne<{ last_read_sequence: string }>(
      this.client,
      `SELECT public.private_chat_read($1::uuid, $2::uuid, $3::bigint)::text AS last_read_sequence;`,
      [actorUserId, conversationId, sequence],
    );
    return row?.last_read_sequence ?? sequence.toString();
  }

  async listConversations(actorUserId: string, limit = 50): Promise<ConversationRow[]> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    const safeLimit = Math.min(Math.max(1, limit), 100);

    return queryRows<ConversationRow>(
      this.client,
      `SELECT
         c.id AS conversation_id,
         c.state,
         c.latest_sequence::text,
         c.last_message_at,
         c.created_at,
         CASE WHEN c.participant_a_id = $1::uuid THEN c.participant_b_id ELSE c.participant_a_id END AS peer_user_id,
         COALESCE(u.display_name, '회원') AS peer_display_name,
         p.avatar_key AS peer_avatar_key,
         ps.last_read_sequence::text,
         GREATEST(0, c.latest_sequence - ps.last_read_sequence)::text AS unread_count,
         ps.muted,
         ps.archived,
         public.private_chat_is_blocked($1::uuid, (CASE WHEN c.participant_a_id = $1::uuid THEN c.participant_b_id ELSE c.participant_a_id END)) AS is_peer_blocked,
         (
           SELECT m.body
           FROM public.private_chat_messages m
           WHERE m.conversation_id = c.id
           ORDER BY m.sequence DESC
           LIMIT 1
         ) AS last_message_body
       FROM public.private_chat_conversations c
       JOIN public.private_chat_participant_state ps
         ON ps.conversation_id = c.id AND ps.user_id = $1::uuid
       JOIN public.users u
         ON u.id = (CASE WHEN c.participant_a_id = $1::uuid THEN c.participant_b_id ELSE c.participant_a_id END)
       LEFT JOIN public.user_profiles p
         ON p.user_id = u.id
       WHERE ps.archived = false
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
       LIMIT $2;`,
      [actorUserId, safeLimit],
    );
  }

  async listMessages(
    actorUserId: string,
    conversationId: string,
    limit = 50,
    beforeSequence?: number,
  ): Promise<MessageRow[]> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(conversationId)) throw new ChatInputError('conversationId must be a valid UUID');
    const safeLimit = Math.min(Math.max(1, limit), 100);

    return queryRows<MessageRow>(
      this.client,
      `SELECT
         m.id,
         m.conversation_id,
         m.sender_id,
         m.sequence::text,
         m.body,
         m.created_at,
         (m.sender_id = $1::uuid) AS is_mine
       FROM public.private_chat_messages m
       JOIN public.private_chat_conversations c ON c.id = m.conversation_id
       WHERE m.conversation_id = $2::uuid
         AND ($1::uuid IN (c.participant_a_id, c.participant_b_id))
         AND ($3::bigint IS NULL OR m.sequence < $3::bigint)
       ORDER BY m.sequence DESC
       LIMIT $4;`,
      [actorUserId, conversationId, beforeSequence ?? null, safeLimit],
    );
  }

  async archiveConversation(actorUserId: string, conversationId: string, archived: boolean): Promise<boolean> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(conversationId)) throw new ChatInputError('conversationId must be a valid UUID');

    await queryOne(
      this.client,
      `UPDATE public.private_chat_participant_state
       SET archived = $3, updated_at = now()
       WHERE conversation_id = $2::uuid AND user_id = $1::uuid;`,
      [actorUserId, conversationId, archived],
    );
    return true;
  }

  async muteConversation(actorUserId: string, conversationId: string, muted: boolean): Promise<boolean> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(conversationId)) throw new ChatInputError('conversationId must be a valid UUID');

    const row = await queryOne<{ private_chat_mute: boolean }>(
      this.client,
      `SELECT public.private_chat_mute($1::uuid, $2::uuid, $3::boolean);`,
      [actorUserId, conversationId, muted],
    );
    return row?.private_chat_mute ?? true;
  }

  async blockUser(actorUserId: string, targetUserId: string): Promise<boolean> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(targetUserId)) throw new ChatInputError('targetUserId must be a valid UUID');
    if (actorUserId === targetUserId) throw new ChatInputError('cannot block oneself');

    const row = await queryOne<{ private_chat_block: boolean }>(
      this.client,
      `SELECT public.private_chat_block($1::uuid, $2::uuid);`,
      [actorUserId, targetUserId],
    );
    return row?.private_chat_block ?? true;
  }

  async unblockUser(actorUserId: string, targetUserId: string): Promise<boolean> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(targetUserId)) throw new ChatInputError('targetUserId must be a valid UUID');

    const row = await queryOne<{ private_chat_unblock: boolean }>(
      this.client,
      `SELECT public.private_chat_unblock($1::uuid, $2::uuid);`,
      [actorUserId, targetUserId],
    );
    return row?.private_chat_unblock ?? true;
  }

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    if (!UUID_REGEX.test(userA) || !UUID_REGEX.test(userB)) return false;
    const row = await queryOne<{ is_blocked: boolean }>(
      this.client,
      `SELECT public.private_chat_is_blocked($1::uuid, $2::uuid) AS is_blocked;`,
      [userA, userB],
    );
    return row?.is_blocked ?? false;
  }

  async reportConversation(
    actorUserId: string,
    conversationId: string,
    reason: string,
    details: string,
  ): Promise<{ reportId: string }> {
    if (!UUID_REGEX.test(actorUserId)) throw new ChatInputError('actorUserId must be a valid UUID');
    if (!UUID_REGEX.test(conversationId)) throw new ChatInputError('conversationId must be a valid UUID');
    if (!['spam_promotional', 'fraud_scam', 'abuse_harassment', 'other'].includes(reason)) {
      throw new ChatInputError('invalid report reason');
    }
    if (details.length < 2 || details.length > 2000) {
      throw new ChatInputError('details must be between 2 and 2000 characters');
    }

    const row = await queryOne<{ report_id: string }>(
      this.client,
      `SELECT public.private_chat_report($1::uuid, $2::uuid, $3::text, $4::text) AS report_id;`,
      [actorUserId, conversationId, reason, details],
    );
    if (!row?.report_id) throw new Error('failed to submit chat report');
    return { reportId: row.report_id };
  }

  async totalUnreadCount(actorUserId: string): Promise<number> {
    if (!UUID_REGEX.test(actorUserId)) return 0;
    const row = await queryOne<{ total_unread: string }>(
      this.client,
      `SELECT COALESCE(SUM(GREATEST(0, c.latest_sequence - ps.last_read_sequence)), 0)::text AS total_unread
       FROM public.private_chat_conversations c
       JOIN public.private_chat_participant_state ps
         ON ps.conversation_id = c.id AND ps.user_id = $1::uuid
       WHERE ps.archived = false AND ps.muted = false;`,
      [actorUserId],
    );
    return Number.parseInt(row?.total_unread ?? '0', 10) || 0;
  }
}
