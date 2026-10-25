export interface PracticeShowdownRound {
  readonly success: true;
  readonly mode: 'PRACTICE_ONLY';
  readonly playerRoll: readonly [number];
  readonly aiRoll: readonly [number];
  readonly outcome: 'win' | 'loss' | 'draw';
  readonly stake: '0';
  readonly payout: '0';
  readonly resolvedAt: string;
}

function isDie(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === 'number' && value >= 1 && value <= 6;
}

/** Fail closed if an upstream version unexpectedly claims to pay WLD or returns forged dice. */
export function verifiedPracticeRound(value: unknown): PracticeShowdownRound | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (row.success !== true || row.mode !== 'PRACTICE_ONLY' || row.stake !== '0' || row.payout !== '0') return null;
  if ('transactionId' in row || 'newBalance' in row || 'rewardAmount' in row) return null;
  if (!Array.isArray(row.playerRoll) || row.playerRoll.length !== 1 || !isDie(row.playerRoll[0])) return null;
  if (!Array.isArray(row.aiRoll) || row.aiRoll.length !== 1 || !isDie(row.aiRoll[0])) return null;
  const outcome = row.playerRoll[0] > row.aiRoll[0] ? 'win' : row.playerRoll[0] < row.aiRoll[0] ? 'loss' : 'draw';
  if (row.outcome !== outcome || typeof row.resolvedAt !== 'string' || !Number.isFinite(Date.parse(row.resolvedAt))) return null;
  return row as unknown as PracticeShowdownRound;
}
