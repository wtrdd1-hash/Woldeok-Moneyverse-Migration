import { describe, expect, it } from 'vitest';
import { parseSupportMessages, parseSupportThreads } from './support-conversation-evidence';

const thread = { thread_id: 'cdd32f28-c7f0-491b-b8a7-2bb01dd89080', subject: 'Question', status: 'open', created_at: '2026-11-01T00:00:00Z', last_message_at: '2026-11-01T00:00:00Z' };
const message = { message_id: '5f14a42e-20d2-43a0-9c9c-1c9dbdc8d30b', sender_kind: 'admin', body: 'Verified reply', created_at: '2026-11-01T00:00:00Z' };

describe('support API owner conversation envelopes', () => {
  it('distinguishes verified empty from unavailable', () => {
    expect(parseSupportThreads({ threads: [] })).toEqual([]);
    expect(parseSupportMessages({ messages: [] })).toEqual([]);
    expect(parseSupportThreads(null)).toBeNull();
    expect(parseSupportMessages({ messages: null })).toBeNull();
  });

  it('accepts the existing owner-scoped Nest contract', () => {
    expect(parseSupportThreads({ threads: [thread] })).toEqual([thread]);
    expect(parseSupportMessages({ messages: [message] })).toEqual([message]);
  });

  it('rejects duplicated, invalid, or oversized thread envelopes as a whole', () => {
    expect(parseSupportThreads({ threads: [thread, thread] })).toBeNull();
    expect(parseSupportThreads({ threads: [{ ...thread, status: 'unknown' }] })).toBeNull();
    expect(parseSupportThreads({ threads: Array.from({ length: 101 }, (_, i) => ({ ...thread, thread_id: String(i) })) })).toBeNull();
    expect(parseSupportThreads({ threads: [{ ...thread, subject: null }] })).toBeNull();
  });

  it('rejects fabricated sender attribution, duplicate IDs and malformed bodies', () => {
    expect(parseSupportMessages({ messages: [{ ...message, sender_kind: 'operator' }] })).toBeNull();
    expect(parseSupportMessages({ messages: [message, message] })).toBeNull();
    expect(parseSupportMessages({ messages: [{ ...message, body: null }] })).toBeNull();
    expect(parseSupportMessages({ messages: Array.from({ length: 501 }, (_, i) => ({ ...message, message_id: String(i) })) })).toBeNull();
  });
});
