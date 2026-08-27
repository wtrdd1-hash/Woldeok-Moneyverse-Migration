import { describe, expect, it } from 'vitest';
import { isWldAmount, wldAmount } from './money';

describe('wldAmount', () => {
  it('accepts a canonical zero', () => {
    expect(wldAmount('0', 'balance')).toBe('0');
  });

  it('accepts the widest supported magnitude', () => {
    const thirtyEightDigits = `9${'0'.repeat(37)}`;
    expect(wldAmount(thirtyEightDigits, 'balance')).toBe(thirtyEightDigits);
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

  it('rejects a value wider than the widest money column', () => {
    expect(() => wldAmount(`9${'0'.repeat(38)}`, 'balance')).toThrow(TypeError);
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
