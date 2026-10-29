const CANONICAL_UPKEEP = /^(0|[1-9][0-9]{0,29})$/;

/** Never silently reinterpret malformed upkeep limits as an empty filter. */
export function parseShopUpkeepCap(raw: unknown): { value: string; invalid: boolean } {
  if (raw === undefined || raw === '') return { value: '', invalid: false };
  if (typeof raw !== 'string' || !CANONICAL_UPKEEP.test(raw)) {
    return { value: '', invalid: true };
  }
  return { value: raw, invalid: false };
}

export function shopCatalogueQuery(query: string, maxUpkeep: string): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (maxUpkeep) params.set('maxUpkeep', maxUpkeep);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}
