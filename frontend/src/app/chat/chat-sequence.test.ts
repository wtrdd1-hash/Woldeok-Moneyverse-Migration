import { describe, expect, it } from 'vitest';
import { maxChatSequence, nextChatSequence, parseChatSequence } from './chat-sequence';

describe('private chat bigint sequence strings', () => {
  it('preserves bigint cursors above Number.MAX_SAFE_INTEGER', () => {
    expect(parseChatSequence('9007199254740993')).toBe(9007199254740993n);
    expect(maxChatSequence(['9007199254740993', '9007199254740992'])).toBe('9007199254740993');
    expect(nextChatSequence('9007199254740993')).toBe('9007199254740994');
  });

  it('rejects malformed and out-of-range cursors', () => {
    for (const value of ['-1', '01', '12junk', '1e3', '9223372036854775808']) {
      expect(parseChatSequence(value)).toBeNull();
    }
  });

  it('keeps the maximum PostgreSQL bigint in range', () => {
    expect(parseChatSequence('9223372036854775807')).toBe(9223372036854775807n);
    expect(nextChatSequence('9223372036854775807')).toBe('9223372036854775807');
  });
});
