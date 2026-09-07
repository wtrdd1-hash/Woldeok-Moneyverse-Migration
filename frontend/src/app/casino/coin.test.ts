import { describe, expect, it } from 'vitest';
import {
  absAmount,
  closureOf,
  faceLabel,
  isLockChoice,
  lockUntilIso,
  multiplierFromPpm,
  percentFromPpm,
  resultOf,
  selfLimitAmount,
  trimZeros,
} from './coin';

describe('closureOf', () => {
  it('names each closure the API sends a code for', () => {
    expect(closureOf({ status: 403, code: 'casino_disabled' })).toBe('disabled');
    expect(closureOf({ status: 503, code: 'casino_paused' })).toBe('paused');
    expect(closureOf({ status: 503, code: 'casino_safe_mode' })).toBe('safe_mode');
  });

  // The distinction the whole page rests on: a 403 with no code is a rejected
  // request, not a shut game, and telling a member the game is closed because
  // their CSRF token was refused would send them away for no reason.
  it('reports no closure for a refusal that carries no casino code', () => {
    expect(closureOf({ status: 403 })).toBeNull();
    expect(closureOf({ status: 503, code: 'something_else' })).toBeNull();
    expect(closureOf({ status: 500, code: 42 })).toBeNull();
  });

  it('survives being handed something that is not an error object', () => {
    expect(closureOf(null)).toBeNull();
    expect(closureOf(undefined)).toBeNull();
    expect(closureOf('casino_disabled')).toBeNull();
  });
});

describe('parts per million on screen', () => {
  it('renders a probability as a percentage with two places', () => {
    expect(percentFromPpm(500_000)).toBe('50.00');
    expect(percentFromPpm(0)).toBe('0.00');
    expect(percentFromPpm(1_000_000)).toBe('100.00');
    expect(percentFromPpm(499_940)).toBe('49.99');
  });

  it('renders a payout as a multiple of the stake', () => {
    expect(multiplierFromPpm(2_000_000)).toBe('2.00');
    expect(multiplierFromPpm(1_500_000)).toBe('1.50');
  });

  // A house edge can be negative, and it must round the same distance a
  // positive figure does rather than towards positive infinity.
  it('renders a negative figure with a true minus sign', () => {
    expect(percentFromPpm(-25_000)).toBe('−2.50');
    expect(percentFromPpm(-250)).toBe('−0.03');
  });

  it('says nothing rather than NaN when handed a figure that is not one', () => {
    expect(percentFromPpm(Number.NaN)).toBe('—');
  });
});

describe('trimZeros', () => {
  it('drops the padding a numeric column arrives with', () => {
    expect(trimZeros('0.620000')).toBe('0.62');
    expect(trimZeros('5.000')).toBe('5');
    expect(trimZeros('-1.500')).toBe('-1.5');
  });

  it('leaves anything that is not a plain decimal alone', () => {
    expect(trimZeros('5')).toBe('5');
    expect(trimZeros('')).toBe('');
  });
});

describe('reading one play', () => {
  it('labels the two faces the schema allows', () => {
    expect(faceLabel('heads')).toBe('앞면');
    expect(faceLabel('tails')).toBe('뒷면');
    expect(faceLabel('edge')).toBe('알 수 없음');
  });

  it('decides win or loss from the sign alone', () => {
    expect(resultOf('5000')).toBe('win');
    expect(resultOf('-5000')).toBe('loss');
    expect(resultOf('0')).toBe('even');
  });

  // The reason the sign is read off the string: a net amount is a bigint and
  // Number() would round one this size without saying so.
  it('keeps every digit of an amount far beyond a safe integer', () => {
    const huge = '9' + '0'.repeat(37);
    expect(absAmount(`-${huge}`)).toBe(huge);
    expect(resultOf(`-${huge}`)).toBe('loss');
  });
});

describe('the self-imposed lock', () => {
  it('turns a chosen length into a moment in the future', () => {
    const from = new Date('2026-08-31T00:00:00.000Z');
    expect(lockUntilIso('7', from)).toBe('2026-09-07T00:00:00.000Z');
    expect(lockUntilIso('1', from)).toBe('2026-09-01T00:00:00.000Z');
  });

  it('locks for nothing when no lock was chosen', () => {
    const from = new Date('2026-08-31T00:00:00.000Z');
    expect(lockUntilIso('none', from)).toBeNull();
    expect(lockUntilIso('0', from)).toBeNull();
    expect(lockUntilIso('400', from)).toBeNull();
  });

  it('accepts only the lengths the form offers', () => {
    expect(isLockChoice('none')).toBe(true);
    expect(isLockChoice('30')).toBe(true);
    expect(isLockChoice('365')).toBe(false);
  });
});

describe('selfLimitAmount', () => {
  // The difference from `wholeAmount`, and the reason this exists: a limit of
  // zero is the explicit sentinel for leaving that self-limit unbound, as
  // migration 164 defines it.
  it('accepts zero', () => {
    expect(selfLimitAmount('0')).toBe(0);
  });

  it('reads back a grouped figure the input rendered', () => {
    expect(selfLimitAmount('1,000,000')).toBe(1_000_000);
  });

  it('refuses anything that is not a whole number of WLD', () => {
    expect(selfLimitAmount('')).toBeNull();
    expect(selfLimitAmount('-5')).toBeNull();
    expect(selfLimitAmount('1.5')).toBeNull();
    expect(selfLimitAmount('열')).toBeNull();
    expect(selfLimitAmount(null)).toBeNull();
  });
});
