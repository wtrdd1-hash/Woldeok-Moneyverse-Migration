import { describe, expect, it } from 'vitest';
import { parseMarketplaceSearch } from './marketplace-search';

describe('member marketplace listing search', () => {
  it('allows an empty query and trims a bounded Korean search', () => {
    expect(parseMarketplaceSearch(undefined)).toEqual({ valid: true, query: '' });
    expect(parseMarketplaceSearch('  에메랄드  ')).toEqual({ valid: true, query: '에메랄드' });
  });

  it('rejects duplicate, oversized, control and malformed searches without a database request', () => {
    for (const value of [['item', 'other'], 'a'.repeat(41), 'bad\nquery', 'bad\u0000query']) {
      expect(parseMarketplaceSearch(value).valid).toBe(false);
    }
  });

  it('preserves literal wildcard characters for backend escaping', () => {
    expect(parseMarketplaceSearch('50%_sale')).toEqual({ valid: true, query: '50%_sale' });
  });
});
