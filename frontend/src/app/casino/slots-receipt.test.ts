import { describe, expect, it } from 'vitest';
import { parseVerifiedSlotsReceipt } from './slots-receipt';

const valid = {
  play_id: '27a48214-7b68-4ac1-8e22-0a2b8e3c8a41',
  transaction_id: '67f1b28a-65ce-4cde-8a7b-3b40d987ad10',
  outcome_face: 6,
  net_amount: '900719925474099312345',
  replayed: false,
};

describe('casino slots settlement receipt', () => {
  it('accepts only a complete server/ledger receipt without rounding large WLD amounts', () => {
    expect(parseVerifiedSlotsReceipt(valid)).toEqual({
      playId: valid.play_id,
      transactionId: valid.transaction_id,
      outcomeFace: 6,
      netAmount: valid.net_amount,
      replayed: false,
    });
  });

  it.each<[unknown, string]>([
    [{ ...valid, play_id: undefined }, 'missing play id'],
    [{ ...valid, transaction_id: undefined }, 'missing ledger transaction'],
    [{ ...valid, transaction_id: 'fake-receipt' }, 'invented transaction id'],
    [{ ...valid, outcome_face: undefined }, 'missing outcome'],
    [{ ...valid, outcome_face: 7 }, 'impossible outcome'],
    [{ ...valid, outcome_face: 2.5 }, 'fractional outcome'],
    [{ ...valid, net_amount: Number.MAX_SAFE_INTEGER + 1 }, 'rounded WLD amount'],
    [{ ...valid, net_amount: '12.5' }, 'fractional WLD amount'],
    [{ ...valid, replayed: undefined }, 'unknown replay status'],
    [null, 'null body'],
  ])('refuses %s (%s) before showing a settled spin', (receipt) => {
    expect(() => parseVerifiedSlotsReceipt(receipt)).toThrow(TypeError);
  });

  it('preserves a replayed settled result without inventing a new spin', () => {
    expect(parseVerifiedSlotsReceipt({ ...valid, outcome_face: 2, net_amount: '-10', replayed: true })).toMatchObject({
      outcomeFace: 2,
      netAmount: '-10',
      replayed: true,
    });
  });
});
