import type { WalletDirection } from './direction';
import type { WalletCategory } from './category-filter';
import type { WalletPeriod } from './period-filter';

export interface WalletActivityFilters {
  readonly direction?: WalletDirection | undefined;
  readonly category?: WalletCategory;
  readonly period?: WalletPeriod | null;
}

function filterParams(filters: WalletActivityFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.direction) params.set('direction', filters.direction);
  if (filters.category) params.set('category', filters.category);
  if (filters.period) params.set('period', filters.period);
  return params;
}

export function walletActivityApiPath(filters: WalletActivityFilters): string {
  const params = filterParams(filters);
  params.set('recent', '50');
  // Keep recent first for backwards-compatible API and app-api contract checks.
  return `/api/v1/wallet?recent=50${[...params.entries()].filter(([key]) => key !== 'recent').map(([key, value]) => `&${key}=${encodeURIComponent(value)}`).join('')}`;
}

export function walletActivityPageHref(filters: WalletActivityFilters): string {
  const query = filterParams(filters).toString();
  return query ? `/wallet/activity?${query}` : '/wallet/activity';
}
