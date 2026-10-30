import { describe, expect, it } from 'vitest';
import { receiptAmountRangeError } from './shop-receipt-amount-range';

describe('owner purchase receipt amount bounds', () => {
  it('accepts optional and inclusive positive integer-string bounds beyond JS safe integer', () => {
    expect(receiptAmountRangeError('', '')).toBeNull();
    expect(receiptAmountRangeError('70', '70')).toBeNull();
    expect(receiptAmountRangeError('9007199254740993', '9007199254740994')).toBeNull();
  });
  it('rejects malformed, zero, noncanonical, too long or inverted bounds', () => {
    for (const value of ['0', '01', '-1', '1.5', '9'.repeat(31)]) {
      expect(receiptAmountRangeError('', value)).not.toBeNull();
      expect(receiptAmountRangeError(value, '')).not.toBeNull();
    }
    expect(receiptAmountRangeError('9007199254740994', '9007199254740993')).not.toBeNull();
  });
});
