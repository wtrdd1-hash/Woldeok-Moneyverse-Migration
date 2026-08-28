/**
 * The wallet's row shapes, and the one rule for reading a posting.
 *
 * Shared by the wallet screen and the activity page beside it. They were
 * declared inside the wallet page when it was the only thing that rendered a
 * ledger entry.
 */

export interface BalanceView {
  readonly availableAmount: string;
  readonly updatedAt: string;
}

export interface TransactionView {
  readonly transactionId: string;
  readonly type: string;
  readonly label: string;
  readonly netAmount: string;
  readonly direction: 'in' | 'out' | 'neutral';
  readonly occurredAt: string;
}

export interface Overview {
  readonly userId: string;
  readonly balances: {
    readonly currency: string;
    readonly cash: BalanceView;
    readonly bank: BalanceView;
    readonly totalAvailableAmount: string;
  };
  readonly recentTransactions: readonly TransactionView[];
}

/**
 * The API reports a direction and a net amount rather than the two accounts a
 * posting names, because the underlying ledger transaction has more than two
 * legs and only the member's own side is theirs to see.
 *
 * The strip still shows both ends — one of them is the member's wallet and
 * the other is where the money came from or went — so the entry reads as the
 * balanced movement it is rather than as a signed number.
 */
export function sides(entry: TransactionView): { debit: string; credit: string } {
  return entry.direction === 'out'
    ? { debit: '내 지갑', credit: entry.label }
    : { debit: entry.label, credit: '내 지갑' };
}
