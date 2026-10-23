import type { TransactionView } from '../sides';

/** The cursor is an opaque transaction UUID, resolved against the owner's ledger. */
export interface WalletHistoryResult {
  readonly transactions: readonly TransactionView[];
  readonly nextCursor: string | null;
}

export function historyApiPath(before?: string): string {
  return `/api/v1/wallet/history${before ? `?before=${encodeURIComponent(before)}` : ''}`;
}

export function historyHref(before: string): string {
  return `/wallet/activity?before=${encodeURIComponent(before)}`;
}
