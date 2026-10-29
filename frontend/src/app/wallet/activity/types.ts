import type { Overview } from '../sides';

export interface WalletHistoryPage {
  readonly transactions: Overview['recentTransactions'];
  readonly hasMore: boolean;
  readonly nextCursor: string | null;
  readonly asOf: string;
}
