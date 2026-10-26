// Chat sequence columns are PostgreSQL bigint, not IEEE-754 numbers.
const MAX_BIGINT_SEQUENCE = '9223372036854775807';

export function canonicalChatSequence(value: unknown): string | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? String(value) : null;
  }
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,18})$/.test(value)) return null;
  if (value.length === 19 && value > MAX_BIGINT_SEQUENCE) return null;
  return value;
}
