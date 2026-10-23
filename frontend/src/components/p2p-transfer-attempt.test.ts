import { describe, expect, it } from 'vitest';
import { resolveP2PAttempt } from './p2p-transfer-attempt';

const payload = {
  recipientUserId: 'b9b9c172-018d-4a77-a8d0-9d6c14751213',
  amount: '12345678901234567890123456789012345678',
  message: 'thanks',
  sticker: 'cheer',
};

describe('P2P ambiguous network retry identity', () => {
  it('keeps one key for identical retry and a new key for every changed payload', () => {
    let sequence = 0;
    const generate = () => `request-${++sequence}`;
    const first = resolveP2PAttempt(null, payload, generate);
    expect(resolveP2PAttempt(first, payload, generate).key).toBe(first.key);
    for (const changed of [
      { ...payload, amount: '2' },
      { ...payload, recipientUserId: 'a2c47252-8bcb-4f76-b33a-09bb0f0bd651' },
      { ...payload, message: 'other' },
      { ...payload, sticker: 'coffee' },
    ]) {
      expect(resolveP2PAttempt(first, changed, generate).key).not.toBe(first.key);
    }
    expect(first.payload.amount).toBe(payload.amount);
  });
});
