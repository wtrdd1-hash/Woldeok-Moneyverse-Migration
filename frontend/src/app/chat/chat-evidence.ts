import type { ChatConversation, ChatMessage } from './actions';
import { chatSequence } from './chat-sequence';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function isChatUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value) && Number.isFinite(Date.parse(value));
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isConversation(value: unknown): value is ChatConversation {
  if (!isRecord(value)) return false;
  const latest = chatSequence(value.latest_sequence);
  const read = chatSequence(value.last_read_sequence);
  const unread = chatSequence(value.unread_count);
  return isChatUuid(value.conversation_id) && isChatUuid(value.peer_user_id) &&
    typeof value.state === 'string' && value.state.length > 0 &&
    latest !== null && read !== null && unread !== null &&
    read <= latest && unread <= latest &&
    isIsoDate(value.created_at) &&
    (value.last_message_at === null || isIsoDate(value.last_message_at)) &&
    typeof value.peer_display_name === 'string' &&
    isNullableString(value.peer_avatar_key) && isNullableString(value.last_message_body) &&
    typeof value.muted === 'boolean' && typeof value.archived === 'boolean' &&
    (value.is_peer_blocked === undefined || typeof value.is_peer_blocked === 'boolean');
}

function isMessage(value: unknown, conversationId: string): value is ChatMessage {
  if (!isRecord(value)) return false;
  return isChatUuid(value.id) && value.conversation_id === conversationId &&
    isChatUuid(value.sender_id) && chatSequence(value.sequence) !== null &&
    typeof value.body === 'string' && value.body.length <= 2000 &&
    isIsoDate(value.created_at) && typeof value.is_mine === 'boolean';
}

/** A failed or malformed authenticated read must never be converted to an empty inbox. */
export function verifyChatConversations(value: unknown): ChatConversation[] | null {
  if (!isRecord(value) || !Array.isArray(value.conversations)) return null;
  if (value.conversations.length > 100 || !value.conversations.every(isConversation)) return null;
  const ids = value.conversations.map((row: ChatConversation) => row.conversation_id);
  return new Set(ids).size === ids.length ? value.conversations : null;
}

export function verifyChatMessages(value: unknown, conversationId: string): ChatMessage[] | null {
  if (!isChatUuid(conversationId) || !isRecord(value) || !Array.isArray(value.messages)) return null;
  if (value.messages.length > 100 || !value.messages.every((row: unknown) => isMessage(row, conversationId))) return null;
  const ids = value.messages.map((row: ChatMessage) => row.id);
  const sequences = value.messages.map((row: ChatMessage) => row.sequence);
  return new Set(ids).size === ids.length && new Set(sequences).size === sequences.length
    ? value.messages : null;
}
