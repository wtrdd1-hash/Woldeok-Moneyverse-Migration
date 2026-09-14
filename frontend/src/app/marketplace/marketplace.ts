export type MarketplaceHolding = {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly quantity: number;
  readonly acquired_at: string;
  readonly rarity: string;
  readonly effect_kind: string;
  readonly is_equipped: boolean;
  readonly serial_number: number | null;
};

export type MarketplaceFilterState = 'all' | 'equipped' | 'serialized';
export type MarketplaceSort = 'name' | 'quantity' | 'newest';

export interface MarketplaceQuery {
  readonly q: string;
  readonly category: string;
  readonly rarity: string;
  readonly state: MarketplaceFilterState;
  readonly sort: MarketplaceSort;
}

const STATES = new Set<MarketplaceFilterState>(['all', 'equipped', 'serialized']);
const SORTS = new Set<MarketplaceSort>(['name', 'quantity', 'newest']);

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export function marketplaceQuery(
  params: Readonly<Record<string, string | string[] | undefined>>,
): MarketplaceQuery {
  const state = first(params.state);
  const sort = first(params.sort);
  return {
    q: first(params.q).trim().slice(0, 80),
    category: first(params.category).trim().slice(0, 60),
    rarity: first(params.rarity).trim().slice(0, 60),
    state: STATES.has(state as MarketplaceFilterState) ? (state as MarketplaceFilterState) : 'all',
    sort: SORTS.has(sort as MarketplaceSort) ? (sort as MarketplaceSort) : 'name',
  };
}

export function filterMarketplaceHoldings(
  holdings: readonly MarketplaceHolding[],
  query: MarketplaceQuery,
): MarketplaceHolding[] {
  const needle = query.q.toLocaleLowerCase('ko-KR');
  const filtered = holdings.filter((item) => {
    if (query.category && item.category !== query.category) return false;
    if (query.rarity && item.rarity !== query.rarity) return false;
    if (query.state === 'equipped' && !item.is_equipped) return false;
    if (query.state === 'serialized' && item.serial_number === null) return false;
    if (!needle) return true;
    return [item.name, item.code, item.description].some((value) =>
      value.toLocaleLowerCase('ko-KR').includes(needle),
    );
  });

  return [...filtered].sort((left, right) => {
    if (query.sort === 'quantity') {
      return right.quantity - left.quantity || left.name.localeCompare(right.name, 'ko-KR');
    }
    if (query.sort === 'newest') {
      const byDate = Date.parse(right.acquired_at) - Date.parse(left.acquired_at);
      return byDate || left.name.localeCompare(right.name, 'ko-KR');
    }
    return left.name.localeCompare(right.name, 'ko-KR');
  });
}
