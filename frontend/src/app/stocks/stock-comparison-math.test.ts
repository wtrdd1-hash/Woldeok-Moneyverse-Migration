import { describe, expect, it } from 'vitest';
import { initialComparisonIds, signedDelta } from './stock-comparison-math';

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

describe('initialComparisonIds', () => {
  const stocks = [
    { id: 'alpha', symbol: 'AAA' },
    { id: 'beta', symbol: 'BBB' },
    { id: 'gamma', symbol: 'CCC' },
    { id: 'delta', symbol: 'DDD' },
  ];

  it('uses the first two stocks when no deep-link symbols are supplied', () => {
    expect(initialComparisonIds(stocks, [])).toEqual(['alpha', 'beta']);
  });

  it('preselects a deep-linked stock without silently adding another stock', () => {
    expect(initialComparisonIds(stocks, ['bbb'])).toEqual(['beta']);
  });

  it('ignores unknown and duplicate symbols and caps selection at three', () => {
    expect(initialComparisonIds(stocks, ['DDD', 'missing', 'AAA', 'ddd', 'CCC', 'BBB'])).toEqual([
      'delta',
      'alpha',
      'gamma',
    ]);
  });
});
