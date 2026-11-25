import { readWalletOverview } from '@/lib/wallet-overview';

/**
 * The member's cash pocket for the shop, or null when it is unknown. Unknown
 * is not 0: a 0 here showed members with money '잔액 부족' (review 2026-11-25).
 */
export function cashBalanceFromWallet(wallet: unknown): string | null {
  const amount = readWalletOverview(wallet)?.balances.cash.availableAmount;
  return typeof amount === 'string' && /^\d+$/.test(amount) ? amount : null;
}
