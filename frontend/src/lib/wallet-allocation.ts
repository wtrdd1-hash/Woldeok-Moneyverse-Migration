/** Exact display-only WLD allocation, retaining all monetary values as strings. */
export function exactAssetShares(amounts: readonly string[]): {
  readonly totalAmount: string;
  readonly shareBps: number[];
} {
  const values = amounts.map((amount) => {
    if (!/^(0|[1-9][0-9]*)$/.test(amount)) throw new Error('invalid wallet allocation amount');
    return BigInt(amount);
  });
  const total = values.reduce((sum, value) => sum + value, 0n);
  return {
    totalAmount: total.toString(),
    // Only basis points are converted to Number; the WLD integers never are.
    shareBps: values.map((value) => total === 0n ? 0 : Number((value * 10000n) / total)),
  };
}

export function formatShareBps(value: string): string {
  if (!/^(0|[1-9][0-9]*)$/.test(value) || BigInt(value) > 10000n) return '—';
  const bps = BigInt(value);
  return `${bps / 100n}.${(bps % 100n).toString().padStart(2, '0')}%`;
}
