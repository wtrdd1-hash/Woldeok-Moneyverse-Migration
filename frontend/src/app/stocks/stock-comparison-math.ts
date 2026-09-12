import { groupDigits } from '@/lib/money';

/**
 * Authoritative WLD values stay integer strings all the way to this helper.
 * BigInt keeps comparisons exact beyond Number.MAX_SAFE_INTEGER.
 */
export function signedDelta(current: string, open: string): string {
  const delta = BigInt(current) - BigInt(open);
  if (delta === 0n) return '0';
  const prefix = delta > 0n ? '+' : '-';
  const absolute = delta > 0n ? delta : -delta;
  return `${prefix}${groupDigits(absolute.toString())}`;
}
