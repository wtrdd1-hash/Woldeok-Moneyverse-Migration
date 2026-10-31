import { describe, expect, it } from 'vitest';
import { verifyChatConversations, verifyChatMessages } from './chat-evidence';

const conversationId = '123e4567-e89b-42d3-a456-426614174000';
const peerId = '123e4567-e89b-42d3-a456-426614174001';
const messageId = '123e4567-e89b-42d3-a456-426614174002';

const conversation = {
  conversation_id: conversationId,
  state: 'active',
  latest_sequence: '9007199254740993',
  last_message_at: '2026-10-31T11:00:00.000Z',
  created_at: '2026-10-31T10:00:00.000Z',
  peer_user_id: peerId,
  peer_display_name: 'Member',
  peer_avatar_key: null,
  last_read_sequence: '9007199254740992',
  unread_count: '1',
  muted: false,
  archived: false,
  last_message_body: 'hello',
  is_peer_blocked: false,
};
const message = {
  id: messageId,
  conversation_id: conversationId,
  sender_id: peerId,
  sequence: '9007199254740993',
  body: 'hello',
  created_at: '2026-10-31T11:00:00.000Z',
  is_mine: false,
};

describe('authenticated chat evidence', () => {
  it('distinguishes verified empty conversations from unavailable or malformed responses', () => {
    expect(verifyChatConversations({ conversations: [] })).toEqual([]);
    expect(verifyChatConversations(null)).toBeNull();
    expect(verifyChatConversations({ conversations: null })).toBeNull();
    expect(verifyChatConversations({ conversations: 'not-an-array' })).toBeNull();
    expect(verifyChatConversations({ conversations: [conversation] })).toEqual([conversation]);
  });

  it('rejects invalid, duplicate or forged conversation evidence', () => {
    expect(verifyChatConversations({ conversations: [{ ...conversation, peer_user_id: 'bad' }] })).toBeNull();
    expect(verifyChatConversations({ conversations: [{ ...conversation, unread_count: '-1' }] })).toBeNull();
    expect(verifyChatConversations({ conversations: [{ ...conversation, latest_sequence: 12 }] })).toBeNull();
    expect(verifyChatConversations({ conversations: [{ ...conversation, archived: 'false' }] })).toBeNull();
    expect(verifyChatConversations({ conversations: [{ ...conversation, created_at: 'yesterday' }] })).toBeNull();
    expect(verifyChatConversations({ conversations: [conversation, conversation] })).toBeNull();
  });

  it('distinguishes verified empty history from failed or malformed history', () => {
    expect(verifyChatMessages({ messages: [] }, conversationId)).toEqual([]);
    expect(verifyChatMessages(null, conversationId)).toBeNull();
    expect(verifyChatMessages({ messages: 'oops' }, conversationId)).toBeNull();
    expect(verifyChatMessages({ messages: [message] }, conversationId)).toEqual([message]);
  });

  it('rejects cross-conversation, noncanonical, and duplicate message evidence', () => {
    expect(verifyChatMessages({ messages: [{ ...message, conversation_id: peerId }] }, conversationId)).toBeNull();
    expect(verifyChatMessages({ messages: [{ ...message, sequence: '01' }] }, conversationId)).toBeNull();
    expect(verifyChatMessages({ messages: [{ ...message, is_mine: 'false' }] }, conversationId)).toBeNull();
    expect(verifyChatMessages({ messages: [{ ...message, body: 1 }] }, conversationId)).toBeNull();
    expect(verifyChatMessages({ messages: [message, message] }, conversationId)).toBeNull();
  });
});
