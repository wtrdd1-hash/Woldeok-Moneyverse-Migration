const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A copied transaction reference must never become an arbitrary route. */
export function receiptPath(reference: string): string | null {
  const trimmed = reference.trim();
  return UUID.test(trimmed) ? `/wallet/activity/${trimmed.toLowerCase()}` : null;
}
