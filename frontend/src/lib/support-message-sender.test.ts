import { describe, expect, it } from 'vitest';
import { parseSupportSenderMessages } from './support-message-sender';
const id = '11111111-1111-4111-8111-111111111111';
const row = { message_id: id, sender_kind: 'admin', body: '확인했습니다', created_at: '2026-10-30T00:00:00.000Z' };
describe('owner support sender proof', () => {
  it('accepts a verified empty result and matching sender', () => {
    expect(parseSupportSenderMessages({ messages: [] }, 'admin')).toEqual([]);
    expect(parseSupportSenderMessages({ messages: [row] }, 'admin')).toEqual([row]);
  });
  it('rejects mismatched, malformed, duplicate and unbounded success-shaped data', () => {
    expect(parseSupportSenderMessages({ messages: [row] }, 'user')).toBeNull();
    expect(parseSupportSenderMessages({ messages: [{ ...row, message_id: 'wrong' }] }, 'admin')).toBeNull();
    expect(parseSupportSenderMessages({ messages: [row, row] }, 'admin')).toBeNull();
    expect(parseSupportSenderMessages({ messages: Array(201).fill(row) }, 'admin')).toBeNull();
    expect(parseSupportSenderMessages({ messages: [{ ...row, created_at: 'bad' }] }, 'admin')).toBeNull();
  });
});
