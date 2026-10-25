import { describe, expect, it } from 'vitest';
import { formatLotteryWld, parseLotteryRounds } from './lottery-rounds';

const round = {
  roundNumber: 1,
  status: 'OPEN',
  ticketPriceWld: '1000',
  jackpotPoolWld: '900719925474099300000',
  totalTicketsSold: 0,
  drawsAt: '2026-11-01T00:00:00.000Z',
  settledAt: null,
  winningNumbers: null,
};

describe('verified lottery round response', () => {
  it('preserves exact integer WLD values and an authenticated empty state', () => {
    expect(parseLotteryRounds({ rounds: [round] })).toEqual([round]);
    expect(parseLotteryRounds({ rounds: [] })).toEqual([]);
    expect(formatLotteryWld('900719925474099300000')).toBe(BigInt('900719925474099300000').toLocaleString('ko-KR'));
  });

  it('rejects invented, fractional, duplicate or malformed data', () => {
    expect(() => parseLotteryRounds({ rounds: [{ ...round, ticketPriceWld: 1000 }] })).toThrow();
    expect(() => parseLotteryRounds({ rounds: [{ ...round, jackpotPoolWld: '0.1' }] })).toThrow();
    expect(() => parseLotteryRounds({ rounds: [round, round] })).toThrow();
    expect(() => parseLotteryRounds({ rounds: [{ ...round, status: 'SETTLED', winningNumbers: [1, 2, 3, 4, 5, 5] }] })).toThrow();
    expect(() => parseLotteryRounds({ rounds: [{ ...round, drawsAt: 'not-a-date' }] })).toThrow();
  });
});
