import type { ActivityCalendarRange } from '@/app/wallet/activity/period';

const INTEGER = /^(?:0|[1-9]\d*|-[1-9]\d*)$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Reject a stale or fabricated HTTP 200 rather than showing unverifiable private ledger entries. */
export function verifiedWalletCalendarPage(
  value: unknown,
  range: ActivityCalendarRange,
  direction: string,
): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const page = value as Record<string, unknown>;
  if (
    !Array.isArray(page.transactions) ||
    page.transactions.length > 50 ||
    typeof page.hasMore !== 'boolean' ||
    typeof page.asOf !== 'string' ||
    !Number.isFinite(Date.parse(page.asOf)) ||
    new Date(page.asOf).toISOString() !== page.asOf ||
    (page.hasMore
      ? typeof page.nextCursor !== 'string' || !page.nextCursor || page.nextCursor.length > 2048
      : page.nextCursor !== null)
  )
    return false;
  if (page.hasMore && page.transactions.length !== 50) return false;
  const asOf = Date.parse(page.asOf);
  if (asOf > Date.now() + 5 * 60_000) return false;
  const start = Date.parse(`${range.from}T00:00:00.000Z`) - 9 * 3_600_000;
  const before = Date.parse(`${range.to}T00:00:00.000Z`) + 86_400_000 - 9 * 3_600_000;
  const seen = new Set<string>();
  for (const item of page.transactions) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const entry = item as Record<string, unknown>;
    if (
      typeof entry.transactionId !== 'string' ||
      !UUID.test(entry.transactionId) ||
      seen.has(entry.transactionId) ||
      typeof entry.type !== 'string' ||
      typeof entry.label !== 'string' ||
      typeof entry.netAmount !== 'string' ||
      !INTEGER.test(entry.netAmount) ||
      typeof entry.occurredAt !== 'string' ||
      !Number.isFinite(Date.parse(entry.occurredAt)) ||
      new Date(entry.occurredAt).toISOString() !== entry.occurredAt
    )
      return false;
    seen.add(entry.transactionId);
    const occurred = Date.parse(entry.occurredAt);
    if (occurred < start || occurred >= before || occurred > asOf) return false;
    const expectedDirection =
      BigInt(entry.netAmount) > 0n ? 'in' : BigInt(entry.netAmount) < 0n ? 'out' : 'neutral';
    if (
      entry.direction !== expectedDirection ||
      (direction !== 'all' && direction !== expectedDirection)
    )
      return false;
    if (entry.cashDelta === undefined || entry.bankDelta === undefined) return false;
    if (entry.cashDelta !== undefined) {
      if (
        typeof entry.cashDelta !== 'string' ||
        typeof entry.bankDelta !== 'string' ||
        !INTEGER.test(entry.cashDelta) ||
        !INTEGER.test(entry.bankDelta) ||
        BigInt(entry.cashDelta) + BigInt(entry.bankDelta) !== BigInt(entry.netAmount)
      )
        return false;
    }
  }
  return true;
}
