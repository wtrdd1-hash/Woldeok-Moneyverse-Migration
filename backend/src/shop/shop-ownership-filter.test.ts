import { describe, expect, it } from 'vitest';
import { filterShopOwnership, parseShopOwnership } from './shop-ownership-filter';

const items = [
  { code: 'owned', user_owned_quantity: 2 },
  { code: 'unowned', user_owned_quantity: 0 },
  { code: 'owned_one', user_owned_quantity: 1 },
] as const;

describe('member shop ownership filter', () => {
  it('defaults to all and accepts only exact public query tokens', () => {
    expect(parseShopOwnership(undefined)).toBe('all');
    for (const token of ['all', 'owned', 'unowned'] as const) {
      expect(parseShopOwnership(token)).toBe(token);
    }
    for (const bad of ['', 'OWNED', ' owned ', 'mine', '0', ['owned'], null, 1]) {
      expect(() => parseShopOwnership(bad)).toThrow();
    }
  });

  it('filters using the already actor-scoped database quantity, without mutating rows', () => {
    expect(filterShopOwnership(items, 'all').map((i) => i.code)).toEqual([
      'owned',
      'unowned',
      'owned_one',
    ]);
    expect(filterShopOwnership(items, 'owned').map((i) => i.code)).toEqual(['owned', 'owned_one']);
    expect(filterShopOwnership(items, 'unowned').map((i) => i.code)).toEqual(['unowned']);
    expect(items).toHaveLength(3);
  });

  it('fails closed on malformed database ownership instead of claiming unowned', () => {
    for (const invalid of [null, undefined, '0', -1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => filterShopOwnership([{ user_owned_quantity: invalid }], 'unowned')).toThrow();
    }
  });
});
