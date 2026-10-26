// Keep PostgreSQL bigint chat cursors as decimal strings until comparing with BigInt.
const MAX_SEQUENCE = 9223372036854775807n;

export function parseChatSequence(value: string): bigint | null {
  if (!/^(0|[1-9][0-9]{0,18})$/.test(value)) return null;
  const parsed = BigInt(value);
  return parsed <= MAX_SEQUENCE ? parsed : null;
}

export function maxChatSequence(values: readonly string[]): string {
  return values.reduce<bigint>((max, value) => {
    const parsed = parseChatSequence(value);
    return parsed !== null && parsed > max ? parsed : max;
  }, 0n).toString();
}

export function nextChatSequence(value: string): string {
  const parsed = parseChatSequence(value);
  if (parsed === null || parsed === MAX_SEQUENCE) return value;
  return (parsed + 1n).toString();
}
