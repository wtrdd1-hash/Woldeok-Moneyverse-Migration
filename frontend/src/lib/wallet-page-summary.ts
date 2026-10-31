import { isCanonicalWld } from '@/app/wallet/sides';

export interface VerifiedWalletPageSummary {
  readonly scope: 'VISIBLE_PAGE_ONLY';
  readonly transactionCount: number;
  readonly cashDelta: string;
  readonly bankDelta: string;
  readonly netDelta: string;
}

/** Verify a bounded owner page independently; never trust a claimed aggregate. */
export function verifiedWalletPageSummary(value: unknown): VerifiedWalletPageSummary | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const page = value as Record<string, unknown>;
  if (
    !Array.isArray(page.transactions) ||
    page.transactions.length > 50 ||
    typeof page.hasMore !== 'boolean' ||
    typeof page.asOf !== 'string' ||
    !Number.isFinite(Date.parse(page.asOf)) ||
    new Date(page.asOf).toISOString() !== page.asOf ||
    Date.parse(page.asOf) > Date.now() + 5 * 60_000 ||
    (page.hasMore
      ? page.transactions.length !== 50 ||
        typeof page.nextCursor !== 'string' ||
        page.nextCursor.length === 0 ||
        page.nextCursor.length > 2048
      : page.nextCursor !== null)
  )
    return null;
  const summary = page.pageSummary;
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return null;
  const result = summary as Record<string, unknown>;
  if (
    result.scope !== 'VISIBLE_PAGE_ONLY' ||
    result.transactionCount !== page.transactions.length ||
    !Number.isSafeInteger(result.transactionCount)
  )
    return null;
  const canonicalSum = (amount: unknown): amount is string =>
    typeof amount === 'string' &&
    /^(?:0|[1-9][0-9]*|-[1-9][0-9]*)$/.test(amount) &&
    (amount.startsWith('-') ? amount.length - 1 : amount.length) <= 42;
  if (
    !canonicalSum(result.cashDelta) ||
    !canonicalSum(result.bankDelta) ||
    !canonicalSum(result.netDelta)
  )
    return null;
  let cash = 0n;
  let bank = 0n;
  let net = 0n;
  const seen = new Set<string>();
  for (const item of page.transactions) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (
      typeof row.transactionId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.transactionId) ||
      seen.has(row.transactionId) ||
      typeof row.type !== 'string' ||
      typeof row.label !== 'string' ||
      typeof row.occurredAt !== 'string' ||
      !Number.isFinite(Date.parse(row.occurredAt)) ||
      new Date(row.occurredAt).toISOString() !== row.occurredAt ||
      Date.parse(row.occurredAt) > Date.parse(page.asOf as string) ||
      !isCanonicalWld(row.cashDelta) ||
      !isCanonicalWld(row.bankDelta) ||
      !isCanonicalWld(row.netAmount)
    )
      return null;
    const expectedDirection =
      BigInt(row.netAmount) > 0n ? 'in' : BigInt(row.netAmount) < 0n ? 'out' : 'neutral';
    if (row.direction !== expectedDirection) return null;
    seen.add(row.transactionId);
    if (BigInt(row.cashDelta) + BigInt(row.bankDelta) !== BigInt(row.netAmount)) return null;
    cash += BigInt(row.cashDelta);
    bank += BigInt(row.bankDelta);
    net += BigInt(row.netAmount);
  }
  if (
    cash.toString() !== result.cashDelta ||
    bank.toString() !== result.bankDelta ||
    net.toString() !== result.netDelta ||
    cash + bank !== net
  )
    return null;
  return {
    scope: 'VISIBLE_PAGE_ONLY',
    transactionCount: result.transactionCount as number,
    cashDelta: result.cashDelta,
    bankDelta: result.bankDelta,
    netDelta: result.netDelta,
  };
}
