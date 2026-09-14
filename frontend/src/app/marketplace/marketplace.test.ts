import { describe, expect, it } from 'vitest';
import {
  filterMarketplaceHoldings,
  marketplaceQuery,
  type MarketplaceHolding,
} from './marketplace';

const holding = (overrides: Partial<MarketplaceHolding> = {}): MarketplaceHolding => ({
  catalog_id: '11111111-1111-4111-8111-111111111111',
  code: 'repair_kit',
  name: '수리 키트',
  description: '사업 장비를 정비하는 재료',
  category: 'material',
  quantity: 2,
  acquired_at: '2026-09-01T00:00:00.000Z',
  rarity: 'common',
  effect_kind: 'convenience',
  is_equipped: false,
  serial_number: null,
  ...overrides,
});

const items = [
  holding(),
  holding({
    catalog_id: '22222222-2222-4222-8222-222222222222',
    code: 'city_badge',
    name: '도시 배지',
    description: '프로필 전시용 고유 배지',
    category: 'cosmetic',
    quantity: 1,
    acquired_at: '2026-09-10T00:00:00.000Z',
    effect_kind: 'display',
    is_equipped: true,
    serial_number: 42,
  }),
];

describe('marketplaceQuery', () => {
  it('normalizes unknown filter values instead of trusting the URL', () => {
    expect(marketplaceQuery({ state: 'broken', sort: 'random', q: '  수리  ' })).toEqual({
      q: '수리',
      category: '',
      rarity: '',
      effect: '',
      state: 'all',
      sort: 'name',
    });
  });

  it('takes only the first repeated query parameter', () => {
    expect(
      marketplaceQuery({
        category: ['material', 'cosmetic'],
        rarity: ['common', 'rare'],
        effect: ['convenience', 'display'],
        state: ['serialized', 'all'],
      }),
    ).toMatchObject({
      category: 'material',
      rarity: 'common',
      effect: 'convenience',
      state: 'serialized',
    });
  });
});

describe('filterMarketplaceHoldings', () => {
  it('searches member-visible name, code and description text', () => {
    expect(
      filterMarketplaceHoldings(items, marketplaceQuery({ q: 'repair' })).map((item) => item.code),
    ).toEqual(['repair_kit']);
    expect(
      filterMarketplaceHoldings(items, marketplaceQuery({ q: '전시용' })).map((item) => item.code),
    ).toEqual(['city_badge']);
  });

  it('filters category, rarity, effect kind and item state together', () => {
    expect(
      filterMarketplaceHoldings(
        items,
        marketplaceQuery({
          category: 'cosmetic',
          rarity: 'common',
          effect: 'display',
          state: 'equipped',
        }),
      ),
    ).toHaveLength(1);
    expect(
      filterMarketplaceHoldings(
        items,
        marketplaceQuery({
          category: 'material',
          rarity: 'common',
          effect: 'display',
          state: 'serialized',
        }),
      ),
    ).toHaveLength(0);
  });

  it('sorts by quantity or acquisition time without mutating the API result', () => {
    const source = [...items];
    expect(
      filterMarketplaceHoldings(source, marketplaceQuery({ sort: 'quantity' })).map(
        (item) => item.code,
      ),
    ).toEqual(['repair_kit', 'city_badge']);
    expect(
      filterMarketplaceHoldings(source, marketplaceQuery({ sort: 'newest' })).map(
        (item) => item.code,
      ),
    ).toEqual(['city_badge', 'repair_kit']);
    expect(source).toEqual(items);
  });
});
