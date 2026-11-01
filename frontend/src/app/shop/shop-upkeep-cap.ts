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

/** A filtered HTTP 200 is not proof the upstream applied the requested ceiling. */
export function verifiedShopUpkeepCatalogue<T extends { readonly maintenance_cost?: unknown }>(
  payload: unknown,
  ceiling: string,
): payload is { readonly catalogItems: T[] } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const items = (payload as { catalogItems?: unknown }).catalogItems;
  if (!Array.isArray(items) || items.length > 1000) return false;
  if (!CANONICAL_UPKEEP.test(ceiling)) return false;
  const max = BigInt(ceiling);
  return items.every((row: unknown) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const upkeep = (row as { maintenance_cost?: unknown }).maintenance_cost;
    return typeof upkeep === 'string' && /^(0|[1-9][0-9]*)$/.test(upkeep) && BigInt(upkeep) <= max;
  });
}
