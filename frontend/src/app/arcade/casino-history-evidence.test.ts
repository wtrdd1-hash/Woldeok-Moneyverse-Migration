import { describe, expect, it } from 'vitest';
import { parseCasinoHistory } from './casino-history-evidence';

const coin = {
  play_id: '11111111-1111-4111-8111-111111111111',
  game: 'coin', choice: 'heads', outcome: 'tails',
  stake_amount: '9007199254740993', net_amount: '-9007199254740993',
  transaction_id: '22222222-2222-4222-8222-222222222222',
  played_at: '2026-10-30T11:00:00.000Z',
} as const;
const dice = {
  ...coin,
  play_id: '33333333-3333-4333-8333-333333333333',
  transaction_id: '44444444-4444-4444-8444-444444444444',
  game: 'dice_parity', choice: 'odd', outcome: '3',
  stake_amount: '10', net_amount: '9',
  played_at: '2026-10-30T10:00:00.000Z',
};

describe('owner casino history SQL read model evidence', () => {
  it('accepts a verified empty history without inventing plays', () => {
    expect(parseCasinoHistory([])).toEqual([]);
  });
  it('preserves 64-bit exact WLD amounts and ordered member receipts', () => {
    expect(parseCasinoHistory([coin, dice])).toEqual([coin, dice]);
  });
  it('accepts an actual dice-number result without converting its WLD values', () => {
    expect(parseCasinoHistory([{ ...dice, game: 'dice_number', choice: '3', outcome: '6' }])).toHaveLength(1);
  });
  it('rejects malformed, oversized and duplicate source rows', () => {
    expect(parseCasinoHistory(null)).toBeNull();
    expect(parseCasinoHistory({ plays: [] })).toBeNull();
    expect(parseCasinoHistory(Array.from({ length: 21 }, () => coin))).toBeNull();
    expect(parseCasinoHistory([coin, coin])).toBeNull();
    expect(parseCasinoHistory([coin, { ...dice, transaction_id: coin.transaction_id }])).toBeNull();
    expect(parseCasinoHistory([dice, coin])).toBeNull();
  });
  it('rejects invented games, choices, outcomes, invalid dates and forged ids', () => {
    for (const patch of [
      { game: 'slots' }, { game: 'dice_parity' }, { choice: 'odd' },
      { outcome: 'jackpot' }, { play_id: 'not-a-uuid' },
      { transaction_id: 'not-a-uuid' }, { played_at: '2026-02-30T11:00:00Z' },
      { played_at: '2099-10-30T11:00:00Z' },
    ]) expect(parseCasinoHistory([{ ...coin, ...patch }])).toBeNull();
    expect(parseCasinoHistory([{ ...dice, choice: 'even', outcome: '7' }])).toBeNull();
  });
  it('rejects unverified WLD and impossible loss while preserving bigint precision', () => {
    for (const patch of [
      { stake_amount: '1e9' }, { stake_amount: '0' },
      { stake_amount: '9223372036854775808' },
      { net_amount: '-9223372036854775809' },
      { net_amount: '-9007199254740994' },
      { net_amount: 'NaN' }, { net_amount: 2 },
    ]) expect(parseCasinoHistory([{ ...coin, ...patch }])).toBeNull();
  });
});
