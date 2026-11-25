import { readWalletOverview } from '@/lib/wallet-overview';

export interface CanonicalWalletOverview {
  readonly balances?: { readonly cash?: { readonly availableAmount?: string } };
}

export function cashBalanceFromWallet(wallet: CanonicalWalletOverview | null): string {
  const amount = readWalletOverview(wallet)?.balances.cash.availableAmount ?? wallet?.balances?.cash?.availableAmount;
  return typeof amount === 'string' && /^\d+$/.test(amount) ? amount : '0';
}
