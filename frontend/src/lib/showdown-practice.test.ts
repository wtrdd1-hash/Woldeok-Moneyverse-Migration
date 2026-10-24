import { describe, expect, it } from 'vitest';
import { verifiedPracticeRound } from './showdown-practice';

const good = { success: true, mode: 'PRACTICE_ONLY', playerRoll: [6], aiRoll: [1], outcome: 'win', stake: '0', payout: '0', resolvedAt: '2026-10-25T00:00:00.000Z' };

describe('practice round integrity', () => {
  it('accepts a coherent zero-WLD server result', () => {
    expect(verifiedPracticeRound(good)).toMatchObject(good);
  });
  it('rejects forged money, impossible dice and inconsistent results', () => {
    expect(verifiedPracticeRound({ ...good, payout: '190' })).toBeNull();
    expect(verifiedPracticeRound({ ...good, stake: '100' })).toBeNull();
    expect(verifiedPracticeRound({ ...good, playerRoll: [7] })).toBeNull();
    expect(verifiedPracticeRound({ ...good, outcome: 'loss' })).toBeNull();
    expect(verifiedPracticeRound({ ...good, mode: 'PAID' })).toBeNull();
    expect(verifiedPracticeRound({ ...good, transactionId: 'fake' })).toBeNull();
  });
});
