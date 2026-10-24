export type WalletDirection = 'in' | 'out' | 'neutral';

export function directionFromSearch(value: unknown): WalletDirection | undefined {
  return value === 'in' || value === 'out' || value === 'neutral' ? value : undefined;
}

export function walletActivityHref(direction: WalletDirection | undefined): string {
  return direction ? `/wallet/activity?direction=${direction}` : '/wallet/activity';
}
