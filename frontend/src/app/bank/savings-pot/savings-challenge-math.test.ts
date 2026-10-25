import { describe, expect, it } from 'vitest';
import { calculateSavingsPlan, parseVerifiedWld } from './savings-challenge-math';

describe('verified savings planning arithmetic', () => {
  it('rejects invalid, fractional, signed and unbounded ledger strings', () => {
    for (const value of ['', '-1', '1.2', '1e4', 'NaN', '1,000', '9'.repeat(41)]) {
      expect(parseVerifiedWld(value)).toBeNull();
    }
    expect(parseVerifiedWld('00042')).toBe('42');
    expect(parseVerifiedWld('0')).toBe('0');
  });

  it('calculates hypothetical daily target using exact WLD integers, never claims a deposit', () => {
    expect(calculateSavingsPlan('100000', '400000', 7)).toEqual({
      remaining: '300000', dailyNeeded: '42858', days: 7,
    });
    expect(calculateSavingsPlan('100000', '400000', 30)).toEqual({
      remaining: '300000', dailyNeeded: '10000', days: 30,
    });
    expect(calculateSavingsPlan('500000', '400000', 7)).toEqual({
      remaining: '0', dailyNeeded: '0', days: 7,
    });
  });

  it('preserves large WLD precision and rejects invalid goals', () => {
    expect(calculateSavingsPlan('9007199254740993', '9007199254741000', 7)?.dailyNeeded).toBe('1');
    expect(calculateSavingsPlan('100', '-5', 7)).toBeNull();
    expect(calculateSavingsPlan('100', '200', 0 as 7)).toBeNull();
  });
});
