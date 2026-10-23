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
  readonly cashDelta?: string | undefined;
  readonly bankDelta?: string | undefined;
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
 * The server supplies owner-scoped, signed cash and bank movements when it can
 * prove both ledger pockets. A zero-net bank transfer is not a zero movement.
 * Never infer missing pocket values from labels or from the overall direction.
 */
const CANONICAL_WLD = /^(?:0|[1-9][0-9]*|-[1-9][0-9]*)$/;

export function isCanonicalWld(value: unknown): value is string {
  return typeof value === 'string'
    && CANONICAL_WLD.test(value)
    && (value.startsWith('-') ? value.length - 1 : value.length) <= 38;
}

export function pocketBreakdown(
  entry: TransactionView,
): { cashDelta: string; bankDelta: string } | null {
  const { cashDelta, bankDelta, netAmount } = entry;
  if (!isCanonicalWld(cashDelta) || !isCanonicalWld(bankDelta) || !isCanonicalWld(netAmount)) {
    return null;
  }
  if (BigInt(cashDelta) + BigInt(bankDelta) !== BigInt(netAmount)) return null;
  return { cashDelta, bankDelta };
}

export function postingAmount(entry: TransactionView): string | null {
  if (!isCanonicalWld(entry.netAmount)) return null;
  const pockets = pocketBreakdown(entry);
  // Legacy nonzero net amounts can be displayed without pocket detail, but a
  // zero-net transfer or contradictory pocket evidence must never invent zero.
  if (!pockets && (entry.netAmount === '0' || entry.cashDelta !== undefined || entry.bankDelta !== undefined)) {
    return null;
  }
  if (entry.netAmount === '0' && pockets && pockets.cashDelta !== '0') {
    return pockets.cashDelta.startsWith('-') ? pockets.cashDelta.slice(1) : pockets.cashDelta;
  }
  return entry.netAmount.startsWith('-') ? entry.netAmount.slice(1) : entry.netAmount;
}

/** Display labels describe only the owner's view, never every ledger leg. */
export function sides(entry: TransactionView): { debit: string; credit: string } {
  const pockets = pocketBreakdown(entry);
  if (entry.netAmount === '0' && pockets) {
    if (pockets.cashDelta.startsWith('-') && BigInt(pockets.bankDelta) > 0n) {
      return { debit: '활동 지갑', credit: '은행 보관함' };
    }
    if (pockets.bankDelta.startsWith('-') && BigInt(pockets.cashDelta) > 0n) {
      return { debit: '은행 보관함', credit: '활동 지갑' };
    }
  }
  return entry.direction === 'out'
    ? { debit: '내 지갑', credit: entry.label }
    : { debit: entry.label, credit: '내 지갑' };
}
