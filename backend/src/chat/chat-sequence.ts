/** Canonical signed PostgreSQL bigint sequence, transported as a decimal string. */
const MAX_PG_BIGINT = 9223372036854775807n;

export function parsePgChatSequence(value: unknown, allowZero = false): string {
  // Older mobile clients send JSON numbers; only exact safe integers are compatible.
  const raw = typeof value === 'number' && Number.isSafeInteger(value) ? String(value) : value;
  if (typeof raw !== 'string' || !/^(0|[1-9][0-9]*)$/.test(raw)) {
    throw new RangeError('chat sequence must be a canonical decimal integer');
  }
  const sequence = BigInt(raw);
  if (sequence > MAX_PG_BIGINT || (!allowZero && sequence === 0n)) {
    throw new RangeError('chat sequence exceeds PostgreSQL bigint bounds');
  }
  return raw;
}
