import { describe, expect, it } from 'vitest';
import { addTreasuryPreset, isValidTreasuryAmount } from './treasury-amount';

describe('treasury exact WLD amount', () => {
  it('preserves each WLD above IEEE-754 safe integer precision', () => {
    expect(addTreasuryPreset('9007199254740993', '1000000')).toBe('9007199255740993');
  });

  it('preserves zero and large integer precision without floating-point conversion', () => {
    expect(addTreasuryPreset('', '1000000')).toBe('1000000');
    expect(addTreasuryPreset('999999999999999999999', '5000000')).toBe('1000000000000004999999');
  });

  it.each(['-1', '1.5', '1e3', '1,000', 'Infinity', '１２３', ''])(
    'rejects invalid noncanonical input %s instead of silently coercing it', (value) => {
      expect(isValidTreasuryAmount(value)).toBe(false);
      if (value !== '') expect(addTreasuryPreset(value, '1000000')).toBeNull();
    },
  );

  it('rejects zero for treasury mutations and bounds pathological inputs', () => {
    expect(isValidTreasuryAmount('0')).toBe(false);
    expect(isValidTreasuryAmount('001')).toBe(false);
    expect(isValidTreasuryAmount('9'.repeat(31))).toBe(false);
    expect(addTreasuryPreset('9'.repeat(31), '1000000')).toBeNull();
  });
});
