import { canonicalIntegerString } from '@/lib/money';

export interface VerifiedSlotsReceipt {
  readonly playId: string;
  readonly transactionId: string;
  readonly outcomeFace: number;
  readonly netAmount: string;
  readonly replayed: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A successful HTTP response alone is not evidence of a committed casino play. */
export function parseVerifiedSlotsReceipt(value: unknown): VerifiedSlotsReceipt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('casino slots settlement receipt is missing');
  }

  const row = value as Record<string, unknown>;
  const netAmount = typeof row.net_amount === 'string'
    ? canonicalIntegerString(row.net_amount)
    : null;
  if (
    typeof row.play_id !== 'string' || !UUID.test(row.play_id) ||
    typeof row.transaction_id !== 'string' || !UUID.test(row.transaction_id) ||
    typeof row.outcome_face !== 'number' || !Number.isInteger(row.outcome_face) ||
    row.outcome_face < 1 || row.outcome_face > 6 ||
    netAmount === null || typeof row.replayed !== 'boolean'
  ) {
    throw new TypeError('casino slots settlement receipt is incomplete or invalid');
  }

  return {
    playId: row.play_id,
    transactionId: row.transaction_id,
    outcomeFace: row.outcome_face,
    netAmount,
    replayed: row.replayed,
  };
}
