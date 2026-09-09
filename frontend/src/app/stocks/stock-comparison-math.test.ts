import { describe, expect, it } from 'vitest';
import { signedDelta } from './stock-comparison-math';

describe('signedDelta', () => {
  it('formats positive, negative and flat changes', () => {
    expect(signedDelta('1500', '1000')).toBe('+500');
    expect(signedDelta('900', '1000')).toBe('-100');
    expect(signedDelta('1000', '1000')).toBe('0');
  });

  it('keeps values exact beyond JavaScript safe integers', () => {
    expect(signedDelta('9007199254741999', '9007199254740991')).toBe('+1,008');
  });
});
