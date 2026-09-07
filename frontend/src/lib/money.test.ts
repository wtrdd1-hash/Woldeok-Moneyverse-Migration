import { describe, expect, it } from 'vitest';
import { changeAmount, changePercent, groupDigits } from './money';

/**
 * Money crosses this application as a canonical integer string and never as a
 * number, because `numeric(38,0)` holds values a double cannot represent.
 * These are the two helpers the market screen added, so these are the tests
 * that say the rule still holds for them.
 */
describe('changeAmount', () => {
  it('subtracts without going through a number', () => {
    // A price of 10^30 and the same price one WLD higher. As doubles both
    // round to the same value and the difference comes out as zero.
    const open = '1' + '0'.repeat(30);
    const oneMore = '1' + '0'.repeat(29) + '1';
    expect(Number(oneMore) - Number(open)).toBe(0);
    expect(changeAmount(oneMore, open)).toBe('1');
  });

  it('signs a fall', () => {
    expect(changeAmount('98000', '100000')).toBe('-2000');
  });

  it('answers zero for anything that is not an integer string', () => {
    expect(changeAmount('12.5', '100')).toBe('0');
    expect(changeAmount('100', 'abc')).toBe('0');
  });
});

describe('changePercent', () => {
  it('renders two places with an explicit sign', () => {
    expect(changePercent('101250', '100000')).toBe('+1.25');
    expect(changePercent('98750', '100000')).toBe('−1.25');
  });

  it('uses a true minus sign, matching groupDigits', () => {
    expect(changePercent('99000', '100000')?.startsWith('−')).toBe(true);
    expect(groupDigits('-1000')).toBe('−1,000');
  });

  // A move from nothing has no percentage, and inventing one would be worse
  // than showing none.
  it('has no answer when the opening price is zero', () => {
    expect(changePercent('500', '0')).toBeNull();
  });

  it('keeps its precision at magnitudes a double would round', () => {
    const open = '1' + '0'.repeat(24);
    const current = '105' + '0'.repeat(22);
    expect(changePercent(current, open)).toBe('+5.00');
  });

  it('rounds toward zero rather than away, so a gain is never overstated', () => {
    // 1.999% truncates to 1.99, not 2.00.
    expect(changePercent('101999', '100000')).toBe('+1.99');
  });
});


describe('money formatting runtime boundary', () => {
  it('formats a safe integer number without crashing when an API driver returns a number', async () => {
    const { groupDigits } = await import('./money');
    expect(groupDigits(123456)).toBe('123,456');
  });

  it('refuses to pretend an unsafe JavaScript number is an exact WLD amount', async () => {
    const { groupDigits } = await import('./money');
    expect(groupDigits(Number.MAX_SAFE_INTEGER + 2)).toBe('—');
  });
});
