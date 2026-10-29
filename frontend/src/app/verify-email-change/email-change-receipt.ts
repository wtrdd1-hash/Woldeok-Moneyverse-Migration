/** Verify the authoritative mutation result at runtime; TypeScript API generics are not evidence. */
export function isEmailChangeReceipt(value: unknown): value is { outcome: 'email-changed'; sessionsRevoked: true } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const receipt = value as Record<string, unknown>;
  return receipt.outcome === 'email-changed' && receipt.sessionsRevoked === true &&
    receipt.success !== false && !('error' in receipt);
}
