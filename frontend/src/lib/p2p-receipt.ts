/** A ledger receipt is a database UUID, never a browser-generated display token. */
export function isLedgerUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function verifiedP2PReceipt(value: unknown): { transactionId: string } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const result = value as Record<string, unknown>;
  if (result.success === false || !isLedgerUuid(result.transactionId)) return null;
  return { transactionId: result.transactionId };
}
