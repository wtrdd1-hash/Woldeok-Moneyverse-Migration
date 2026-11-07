import type { WalletHistoryPage } from '@/app/wallet/activity/types';
import type { ActivityDirection, ActivityPeriod } from '@/app/wallet/activity/period';
import { isCanonicalWld } from '@/app/wallet/sides';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UTC_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function timestamp(value: unknown): number | null {
  if (typeof value !== 'string' || !UTC_TIME.test(value)) return null;
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return null;
  const canonical = new Date(parsed).toISOString();
  return canonical === value || canonical.replace(/\.000Z$/, 'Z') === value ? parsed : null;
}

/** Validate the authenticated owner API response before treating an HTTP 200 as ledger evidence. */
export function verifiedWalletActivityPage(
  value: unknown,
  period: ActivityPeriod,
  direction: ActivityDirection,
  now: number = Date.now(),
): WalletHistoryPage | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const page = value as Record<string, unknown>;
  const asOf = timestamp(page.asOf);
  if (
    asOf === null || asOf > now + 5 * 60_000 ||
    !Array.isArray(page.transactions) || page.transactions.length > 50 ||
    typeof page.hasMore !== 'boolean' ||
    (page.hasMore
      ? page.transactions.length !== 50 || typeof page.nextCursor !== 'string' ||
        page.nextCursor.length < 1 || page.nextCursor.length > 2048
      : page.nextCursor !== null)
  ) return null;

  const since = period === 'all' ? null : asOf - (period === '7d' ? 7 : 30) * 86_400_000;
  const seen = new Set<string>();
  for (const item of page.transactions) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    const occurred = timestamp(row.occurredAt);
    if (
      typeof row.transactionId !== 'string' || !UUID.test(row.transactionId) ||
      seen.has(row.transactionId.toLowerCase()) ||
      typeof row.type !== 'string' || !row.type.trim() || row.type.length > 128 ||
      typeof row.label !== 'string' || !row.label.trim() || row.label.length > 256 ||
      occurred === null || occurred > asOf || (since !== null && occurred < since) ||
      !isCanonicalWld(row.netAmount)
    ) return null;
    seen.add(row.transactionId.toLowerCase());
    const amount = BigInt(row.netAmount);
    const expectedDirection = amount > 0n ? 'in' : amount < 0n ? 'out' : 'neutral';
    if (row.direction !== expectedDirection || (direction !== 'all' && direction !== expectedDirection)) return null;
    const cashPresent = row.cashDelta !== undefined;
    const bankPresent = row.bankDelta !== undefined;
    if (cashPresent !== bankPresent) return null;
    if (cashPresent && (
      !isCanonicalWld(row.cashDelta) || !isCanonicalWld(row.bankDelta) ||
      BigInt(row.cashDelta) + BigInt(row.bankDelta) !== amount
    )) return null;
  }
  return value as WalletHistoryPage;
}
