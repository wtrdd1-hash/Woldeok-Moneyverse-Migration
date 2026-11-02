import { isCanonicalWld, type Overview, type TransactionView } from './sides';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function date(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}

function nonnegativeWld(value: unknown): value is string {
  return isCanonicalWld(value) && !value.startsWith('-');
}

function verifiedTransaction(value: unknown): value is TransactionView {
  if (!record(value) || typeof value.transactionId !== 'string' || !UUID.test(value.transactionId)
    || typeof value.type !== 'string' || !value.type.trim()
    || typeof value.label !== 'string' || !value.label.trim()
    || !isCanonicalWld(value.netAmount) || !date(value.occurredAt)) return false;
  const net = BigInt(value.netAmount);
  if (value.direction !== (net > 0n ? 'in' : net < 0n ? 'out' : 'neutral')) return false;
  const hasCash = value.cashDelta !== undefined;
  const hasBank = value.bankDelta !== undefined;
  if (hasCash !== hasBank) return false;
  if (hasCash && (!isCanonicalWld(value.cashDelta) || !isCanonicalWld(value.bankDelta)
    || BigInt(value.cashDelta) + BigInt(value.bankDelta) !== net)) return false;
  return true;
}

/** An unavailable or malformed owner read is never evidence of a zero WLD balance. */
export function verifiedWalletOverview(raw: unknown): Overview | null {
  if (!record(raw) || typeof raw.userId !== 'string' || !UUID.test(raw.userId)
    || !record(raw.balances) || raw.balances.currency !== 'WLD'
    || !record(raw.balances.cash) || !record(raw.balances.bank)
    || !nonnegativeWld(raw.balances.cash.availableAmount)
    || !nonnegativeWld(raw.balances.bank.availableAmount)
    || !nonnegativeWld(raw.balances.totalAvailableAmount)
    || !date(raw.balances.cash.updatedAt) || !date(raw.balances.bank.updatedAt)
    || !Array.isArray(raw.recentTransactions) || raw.recentTransactions.length > 50
    || (raw.recentTransactionsHasMore !== undefined && typeof raw.recentTransactionsHasMore !== 'boolean')) {
    return null;
  }
  if (BigInt(raw.balances.cash.availableAmount) + BigInt(raw.balances.bank.availableAmount)
    !== BigInt(raw.balances.totalAvailableAmount)) return null;
  const seen = new Set<string>();
  for (const entry of raw.recentTransactions) {
    if (!verifiedTransaction(entry) || seen.has(entry.transactionId)) return null;
    seen.add(entry.transactionId);
  }
  return raw as unknown as Overview;
}
