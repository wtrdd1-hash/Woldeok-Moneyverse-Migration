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
    expect(
      marketplaceQuery({
        state: 'broken',
        sort: 'random',
        acquired: 'forever',
        minQuantity: '-10',
        q: '  수리  ',
      }),
    ).toEqual({
      q: '수리',
      category: '',
      rarity: '',
      effect: '',
      minQuantity: 0,
      acquired: 'all',
      state: 'all',
      sort: 'name',
    });
  });

  it('accepts supported cleanup state and acquisition-order values', () => {
    expect(marketplaceQuery({ state: 'unequipped', sort: 'oldest' })).toMatchObject({
      state: 'unequipped',
      sort: 'oldest',
    });
  });

  it('takes only the first repeated query parameter', () => {
    expect(
      marketplaceQuery({
        category: ['material', 'cosmetic'],
        rarity: ['common', 'rare'],
        effect: ['convenience', 'display'],
        minQuantity: ['2', '1'],
        acquired: ['7d', '30d'],
        state: ['serialized', 'all'],
      }),
    ).toMatchObject({
      category: 'material',
      rarity: 'common',
      effect: 'convenience',
      minQuantity: 2,
      acquired: '7d',
      state: 'serialized',
    });
  });

  it('bounds the minimum quantity filter to a safe integer range', () => {
    expect(marketplaceQuery({ minQuantity: '2' }).minQuantity).toBe(2);
    expect(marketplaceQuery({ minQuantity: '1.5' }).minQuantity).toBe(0);
    expect(marketplaceQuery({ minQuantity: '999999999' }).minQuantity).toBe(999_999);
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

  it('filters category, rarity, effect kind, quantity and item state together', () => {
    expect(
      filterMarketplaceHoldings(
        items,
        marketplaceQuery({
          category: 'material',
          rarity: 'common',
          effect: 'convenience',
          minQuantity: '2',
          state: 'unequipped',
        }),
      ).map((item) => item.code),
    ).toEqual(['repair_kit']);
    expect(
      filterMarketplaceHoldings(
        items,
        marketplaceQuery({
          category: 'cosmetic',
          rarity: 'common',
          effect: 'display',
          minQuantity: '2',
          state: 'equipped',
        }),
      ),
    ).toHaveLength(0);
  });

  it('filters by a bounded recent-acquisition window using the server render time', () => {
    const now = new Date('2026-09-14T00:00:00.000Z');
    expect(
      filterMarketplaceHoldings(items, marketplaceQuery({ acquired: '7d' }), now).map(
        (item) => item.code,
      ),
    ).toEqual(['city_badge']);
    expect(
      filterMarketplaceHoldings(items, marketplaceQuery({ acquired: '30d' }), now).map(
        (item) => item.code,
      ),
    ).toEqual(['city_badge', 'repair_kit']);
  });

  it('rejects invalid or future acquisition timestamps from recent windows', () => {
    const now = new Date('2026-09-14T00:00:00.000Z');
    const malformed = holding({ code: 'bad_date', acquired_at: 'not-a-date' });
    const future = holding({ code: 'future_item', acquired_at: '2026-09-15T00:00:00.000Z' });
    expect(
      filterMarketplaceHoldings(
        [malformed, future, ...items],
        marketplaceQuery({ acquired: '30d' }),
        now,
      ).map((item) => item.code),
    ).toEqual(['city_badge', 'repair_kit']);
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
    expect(
      filterMarketplaceHoldings(source, marketplaceQuery({ sort: 'oldest' })).map(
        (item) => item.code,
      ),
    ).toEqual(['repair_kit', 'city_badge']);
    expect(source).toEqual(items);
  });

  it('keeps malformed acquisition dates at the end for chronological sorting', () => {
    const malformed = holding({ code: 'bad_date', name: '오류 날짜', acquired_at: 'not-a-date' });
    expect(
      filterMarketplaceHoldings([malformed, ...items], marketplaceQuery({ sort: 'newest' })).map(
        (item) => item.code,
      ),
    ).toEqual(['city_badge', 'repair_kit', 'bad_date']);
    expect(
      filterMarketplaceHoldings([malformed, ...items], marketplaceQuery({ sort: 'oldest' })).map(
        (item) => item.code,
      ),
    ).toEqual(['repair_kit', 'city_badge', 'bad_date']);
  });
});
