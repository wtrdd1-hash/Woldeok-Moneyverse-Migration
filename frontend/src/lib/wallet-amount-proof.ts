/** Fail closed on a legacy HTTP 200 that ignored the exact WLD amount filter. */
export function verifiedWalletAmountPage(value: unknown, minAmount: string, direction: string): boolean {
  if (!/^[1-9][0-9]{0,29}$/.test(minAmount) || !value || typeof value !== 'object' || Array.isArray(value)) return false;
  const page = value as Record<string, unknown>;
  if (!Array.isArray(page.transactions) || page.transactions.length > 50 || typeof page.hasMore !== 'boolean' ||
      typeof page.asOf !== 'string' || !Number.isFinite(Date.parse(page.asOf)) ||
      new Date(page.asOf).toISOString() !== page.asOf || Date.parse(page.asOf) > Date.now() + 300_000 ||
      (page.hasMore ? page.transactions.length !== 50 || typeof page.nextCursor !== 'string' ||
        !page.nextCursor || page.nextCursor.length > 2048 : page.nextCursor !== null)) return false;
  const seen = new Set<string>();
  for (const row of page.transactions) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const item = row as Record<string, unknown>;
    if (typeof item.type !== 'string' || item.type.length > 120 || typeof item.label !== 'string' || item.label.length > 240 ||
        typeof item.transactionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.transactionId) || seen.has(item.transactionId) ||
        typeof item.netAmount !== 'string' || !/^(0|[1-9][0-9]*|-[1-9][0-9]*)$/.test(item.netAmount) ||
        typeof item.cashDelta !== 'string' || typeof item.bankDelta !== 'string' ||
        !/^(0|[1-9][0-9]*|-[1-9][0-9]*)$/.test(item.cashDelta) ||
        !/^(0|[1-9][0-9]*|-[1-9][0-9]*)$/.test(item.bankDelta) ||
        BigInt(item.cashDelta) + BigInt(item.bankDelta) !== BigInt(item.netAmount) ||
        (BigInt(item.netAmount) < 0n ? -BigInt(item.netAmount) : BigInt(item.netAmount)) < BigInt(minAmount) ||
        item.direction !== (BigInt(item.netAmount) > 0n ? 'in' : BigInt(item.netAmount) < 0n ? 'out' : 'neutral') ||
        (direction !== 'all' && item.direction !== direction) ||
        typeof item.occurredAt !== 'string' || !Number.isFinite(Date.parse(item.occurredAt)) ||
        new Date(item.occurredAt).toISOString() !== item.occurredAt || Date.parse(item.occurredAt) > Date.parse(page.asOf)) return false;
    seen.add(item.transactionId);
  }
  return true;
}
