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
export type MarketplaceAcquiredWindow = 'all' | '7d' | '30d';

export interface MarketplaceQuery {
  readonly q: string;
  readonly category: string;
  readonly rarity: string;
  readonly effect: string;
  readonly minQuantity: number;
  readonly acquired: MarketplaceAcquiredWindow;
  readonly state: MarketplaceFilterState;
  readonly sort: MarketplaceSort;
}

const STATES = new Set<MarketplaceFilterState>(['all', 'equipped', 'serialized']);
const SORTS = new Set<MarketplaceSort>(['name', 'quantity', 'newest']);
const ACQUIRED_WINDOWS = new Set<MarketplaceAcquiredWindow>(['all', '7d', '30d']);
const MAX_MIN_QUANTITY = 999_999;
const DAY_MS = 24 * 60 * 60 * 1000;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function minimumQuantity(value: string | string[] | undefined): number {
  const raw = first(value).trim();
  if (!/^\d+$/.test(raw)) return 0;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return 0;
  return Math.min(parsed, MAX_MIN_QUANTITY);
}

export function marketplaceQuery(
  params: Readonly<Record<string, string | string[] | undefined>>,
): MarketplaceQuery {
  const acquired = first(params.acquired);
  const state = first(params.state);
  const sort = first(params.sort);
  return {
    q: first(params.q).trim().slice(0, 80),
    category: first(params.category).trim().slice(0, 60),
    rarity: first(params.rarity).trim().slice(0, 60),
    effect: first(params.effect).trim().slice(0, 60),
    minQuantity: minimumQuantity(params.minQuantity),
    acquired: ACQUIRED_WINDOWS.has(acquired as MarketplaceAcquiredWindow)
      ? (acquired as MarketplaceAcquiredWindow)
      : 'all',
    state: STATES.has(state as MarketplaceFilterState) ? (state as MarketplaceFilterState) : 'all',
    sort: SORTS.has(sort as MarketplaceSort) ? (sort as MarketplaceSort) : 'name',
  };
}

export function filterMarketplaceHoldings(
  holdings: readonly MarketplaceHolding[],
  query: MarketplaceQuery,
  now: Date = new Date(),
): MarketplaceHolding[] {
  const needle = query.q.toLocaleLowerCase('ko-KR');
  const nowMs = now.getTime();
  const acquiredCutoffMs =
    query.acquired === '7d'
      ? nowMs - 7 * DAY_MS
      : query.acquired === '30d'
        ? nowMs - 30 * DAY_MS
        : null;

  const filtered = holdings.filter((item) => {
    if (query.category && item.category !== query.category) return false;
    if (query.rarity && item.rarity !== query.rarity) return false;
    if (query.effect && item.effect_kind !== query.effect) return false;
    if (query.minQuantity > 0 && item.quantity < query.minQuantity) return false;
    if (acquiredCutoffMs !== null) {
      const acquiredAtMs = Date.parse(item.acquired_at);
      if (!Number.isFinite(acquiredAtMs) || acquiredAtMs < acquiredCutoffMs || acquiredAtMs > nowMs) {
        return false;
      }
    }
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
