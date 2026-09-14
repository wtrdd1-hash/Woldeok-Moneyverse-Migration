import { describe, expect, it } from 'vitest';
import { comparisonSymbolsQuery, initialComparisonIds, signedDelta, signedPercentChange } from './stock-comparison-math';

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


describe('signedPercentChange', () => {
  it('formats positive, negative and flat percentage changes', () => {
    expect(signedPercentChange('1500', '1000')).toBe('+50.00%');
    expect(signedPercentChange('900', '1000')).toBe('-10.00%');
    expect(signedPercentChange('1000', '1000')).toBe('0.00%');
  });

  it('keeps integer-string precision and truncates beyond two decimals', () => {
    expect(signedPercentChange('1001', '1000')).toBe('+0.10%');
    expect(signedPercentChange('9007199254741999', '9007199254740991')).toBe('+0.00%');
  });

  it('does not invent a percentage when the opening price is zero', () => {
    expect(signedPercentChange('1000', '0')).toBe('—');
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


describe('comparisonSymbolsQuery', () => {
  const stocks = [
    { id: 'alpha', symbol: 'AAA' },
    { id: 'beta', symbol: 'bbb' },
    { id: 'gamma', symbol: 'CCC' },
  ];

  it('serializes selected symbols in comparison order', () => {
    expect(comparisonSymbolsQuery(stocks, ['beta', 'alpha'])).toBe('symbols=BBB%2CAAA');
  });

  it('ignores unknown and duplicate ids and caps the result', () => {
    expect(comparisonSymbolsQuery(stocks, ['missing', 'alpha', 'alpha', 'beta', 'gamma'], 2)).toBe(
      'symbols=AAA%2CBBB',
    );
  });

  it('returns an empty query for an empty selection', () => {
    expect(comparisonSymbolsQuery(stocks, [])).toBe('');
  });
});
