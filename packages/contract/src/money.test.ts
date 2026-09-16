import { describe, expect, it } from 'vitest';
import { isWldAmount, WLD_MAX_DIGITS, wldAmount } from './money';

describe('wldAmount', () => {
  it('accepts a canonical zero', () => {
    expect(wldAmount('0', 'balance')).toBe('0');
  });

  it('accepts values far beyond bigint and 경 units', () => {
    const huge = `9${'0'.repeat(99)}`;
    expect(wldAmount(huge, 'balance')).toBe(huge);
  });

  it('accepts PostgreSQL NUMERIC maximum integer width', () => {
    const maximum = `9${'0'.repeat(WLD_MAX_DIGITS - 1)}`;
    expect(wldAmount(maximum, 'balance')).toBe(maximum);
  });

  it('accepts a negative amount', () => {
    expect(wldAmount('-42', 'delta')).toBe('-42');
  });

  it('rejects a leading zero', () => {
    expect(() => wldAmount('012', 'balance')).toThrow(TypeError);
  });

  it('rejects negative zero', () => {
    expect(() => wldAmount('-0', 'balance')).toThrow(TypeError);
  });

  it('rejects an explicit plus sign', () => {
    expect(() => wldAmount('+1', 'balance')).toThrow(TypeError);
  });

  it('rejects exponent notation', () => {
    expect(() => wldAmount('1e3', 'balance')).toThrow(TypeError);
  });

  it('accepts magnitudes beyond bigint and the former 38-digit storage contract', () => {
    const huge = `9${'0'.repeat(199)}`;
    expect(wldAmount(huge, 'balance')).toBe(huge);
  });

  it('names the field in the error message', () => {
    expect(() => wldAmount('nonsense', 'transferAmount')).toThrow(/transferAmount/);
  });
});

describe('isWldAmount', () => {
  it('narrows a canonical integer string', () => {
    expect(isWldAmount('1234')).toBe(true);
  });

  it('rejects a number', () => {
    expect(isWldAmount(1234)).toBe(false);
  });

  it('rejects a non-integer string', () => {
    expect(isWldAmount('12.5')).toBe(false);
  });
});
