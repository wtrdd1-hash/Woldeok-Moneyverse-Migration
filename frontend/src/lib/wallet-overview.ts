import type { Overview, TransactionView } from '@/app/wallet/sides';

/**
 * One reader for GET /api/v1/wallet.
 *
 * The page contract is the NestJS one (`balances.cash` …). Production is served
 * by Spring, which answers `{ success, data: WalletOverview }` where
 * WalletService fills `balanceWld` = cash + bank, `pendingBalanceWld` = the
 * USER_CASH pocket and `lockedBalanceWld` = the USER_BANK pocket (pinned by a
 * test against the Java source). Anything that is neither shape, or whose
 * pockets do not add up, is unavailable: return null, never throw, never guess.
 */
const WLD = /^(?:0|-?[1-9][0-9]*)$/;

function obj(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function amount(v: unknown): v is string {
  return typeof v === 'string' && WLD.test(v);
}

function canonical(raw: Record<string, unknown>): Overview | null {
  const b = raw.balances;
  if (!obj(b) || b.currency !== 'WLD' || !amount(b.totalAvailableAmount)) return null;
  if (!obj(b.cash) || !amount(b.cash.availableAmount) || !obj(b.bank) || !amount(b.bank.availableAmount)) return null;
  if (typeof raw.userId !== 'string' || !Array.isArray(raw.recentTransactions)) return null;
  return raw as unknown as Overview;
}

function posting(p: unknown): TransactionView | null {
  if (!obj(p) || typeof p.id !== 'string' || !amount(p.amount) || typeof p.created_at !== 'string') return null;
  const dir = String(p.direction).toLowerCase();
  if (dir !== 'debit' && dir !== 'credit') return null;
  const value = BigInt(p.amount);
  const net = dir === 'debit' ? value : -value;
  const type = typeof p.tx_type === 'string' && p.tx_type ? p.tx_type : 'TRANSFER';
  return {
    transactionId: p.id,
    type,
    label: type,
    netAmount: net.toString(),
    direction: net > 0n ? 'in' : net < 0n ? 'out' : 'neutral',
    occurredAt: p.created_at,
  };
}

function spring(raw: Record<string, unknown>): Overview | null {
  const d = raw.data;
  if (!obj(d) || d.currency !== 'WLD' || typeof d.userId !== 'string') return null;
  if (!amount(d.balanceWld) || !amount(d.pendingBalanceWld) || !amount(d.lockedBalanceWld)) return null;
  if (BigInt(d.pendingBalanceWld) + BigInt(d.lockedBalanceWld) !== BigInt(d.balanceWld)) return null;
  const rows = Array.isArray(d.recentTransactions) ? d.recentTransactions.map(posting) : [];
  if (rows.some((r) => r === null)) return null;
  const at = (rows[0] as TransactionView | undefined)?.occurredAt ?? '';
  return {
    userId: d.userId,
    balances: {
      currency: 'WLD',
      cash: { availableAmount: d.pendingBalanceWld, updatedAt: at },
      bank: { availableAmount: d.lockedBalanceWld, updatedAt: at },
      totalAvailableAmount: d.balanceWld,
    },
    recentTransactions: rows as TransactionView[],
  };
}

export function readWalletOverview(raw: unknown): Overview | null {
  if (!obj(raw)) return null;
  return 'balances' in raw ? canonical(raw) : spring(raw);
}
