import type { Overview } from '../sides';
import type { VerifiedWalletPageSummary } from '@/lib/wallet-page-summary';

export interface WalletHistoryPage {
  readonly transactions: Overview['recentTransactions'];
  readonly hasMore: boolean;
  readonly nextCursor: string | null;
  readonly asOf: string;
  readonly pageSummary?: VerifiedWalletPageSummary | null;
}
