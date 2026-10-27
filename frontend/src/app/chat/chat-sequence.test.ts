import { describe, expect, it } from 'vitest';
import { chatSequence, latestChatSequence } from './chat-sequence';

describe('private chat PostgreSQL bigint sequence precision', () => {
  it('parses exact values beyond JavaScript safe integers', () => {
    expect(chatSequence('9007199254740993')).toBe(9007199254740993n);
    expect(chatSequence('9223372036854775807')).toBe(9223372036854775807n);
    expect(latestChatSequence(['9007199254740993', '9007199254740994'])).toBe('9007199254740994');
  });
  it.each(['', '01', '-1', '1e2', '2junk', '9223372036854775808'])('rejects invalid value %s', (value) => {
    expect(chatSequence(value)).toBeNull();
  });
  it('does not round or trust invalid entries when finding newest sequence', () => {
    expect(latestChatSequence(['0', '2junk', '9007199254740993', '9007199254740992'])).toBe('9007199254740993');
  });
});
