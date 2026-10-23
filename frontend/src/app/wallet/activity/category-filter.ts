export type WalletCategory = '' | 'transfer' | 'bank' | 'reward';

export function walletCategoryFromQuery(value: unknown): WalletCategory {
  return value === 'transfer' || value === 'bank' || value === 'reward' ? value : '';
}

export function walletCategoryApiPath(category: WalletCategory): string {
  return `/api/v1/wallet?recent=50${category ? `&category=${category}` : ''}`;
}
