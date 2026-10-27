/** Keep PostgreSQL bigint chat cursors as exact decimal strings in the browser. */
const MAX_PG_BIGINT = 9223372036854775807n;

export function chatSequence(value: unknown): bigint | null {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value)) return null;
  const number = BigInt(value);
  return number <= MAX_PG_BIGINT ? number : null;
}

export function latestChatSequence(values: readonly string[]): string {
  let latest = 0n;
  for (const value of values) {
    const sequence = chatSequence(value);
    if (sequence !== null && sequence > latest) latest = sequence;
  }
  return latest.toString();
}
