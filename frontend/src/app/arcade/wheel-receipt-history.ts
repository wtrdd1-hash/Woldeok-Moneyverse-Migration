/** A wheel result is a committed, member-scoped server receipt, not a simulated spin. */
export interface VerifiedWheelResult {
  readonly playId: string;
  readonly transactionId: string;
  readonly seg: number;
  readonly type: 'blue' | 'gold' | 'violet' | 'neutral';
  readonly isWin: boolean;
}

interface WheelReceipt {
  readonly playId: string;
  readonly transactionId: string;
  readonly themeOutcome: string;
  readonly netAmount: string;
  readonly replayed: boolean;
}

export function isReceiptUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(value);
}

export function parseVerifiedWheelOutcome(value: unknown): Pick<VerifiedWheelResult, 'seg' | 'type'> | null {
  if (typeof value !== 'string') return null;
  const match = /^([1-9]|1[0-9]|20):(blue|gold|violet|neutral)$/.exec(value);
  if (!match) return null;
  const segment = Number(match[1]);
  const expected = segment <= 10 ? 'blue' : segment <= 15 ? 'gold' : segment <= 17 ? 'violet' : 'neutral';
  if (match[2] !== expected) return null;
  return { seg: segment, type: expected };
}

export function addVerifiedWheelResult(
  previous: readonly VerifiedWheelResult[],
  receipt: WheelReceipt,
): readonly VerifiedWheelResult[] {
  const outcome = parseVerifiedWheelOutcome(receipt.themeOutcome);
  if (!outcome || !isReceiptUuid(receipt.playId) || !isReceiptUuid(receipt.transactionId)) return previous;
  if (!/^-?(0|[1-9][0-9]*)$/.test(receipt.netAmount)) return previous;
  if (previous.some((item) => item.playId.toLowerCase() === receipt.playId.toLowerCase())) return previous;
  return [{
    playId: receipt.playId,
    transactionId: receipt.transactionId,
    seg: outcome.seg,
    type: outcome.type,
    isWin: BigInt(receipt.netAmount) > 0n,
  }, ...previous].slice(0, 10);
}
