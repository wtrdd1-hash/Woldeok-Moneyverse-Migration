/** The casino safety control is only confirmed after the owner's DB-backed read. */
export interface CasinoSelfLimitReceipt {
  readonly daily_bet_limit: string;
  readonly daily_loss_limit: string;
  readonly locked_until: string | null;
}

interface RequestedCasinoSelfLimit {
  readonly dailyBetLimit: number;
  readonly dailyLossLimit: number;
  readonly lockedUntil: string | null;
}

function canonicalLimit(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value);
}

function sameLock(value: unknown, expected: string | null): boolean {
  if (expected === null) return value === null;
  if (typeof value !== 'string') return false;
  const actualTime = Date.parse(value);
  const expectedTime = Date.parse(expected);
  return Number.isFinite(actualTime) && Number.isFinite(expectedTime) && actualTime === expectedTime;
}

function matches(value: unknown, requested: RequestedCasinoSelfLimit): value is CasinoSelfLimitReceipt {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    canonicalLimit(row.daily_bet_limit) &&
    canonicalLimit(row.daily_loss_limit) &&
    row.daily_bet_limit === String(requested.dailyBetLimit) &&
    row.daily_loss_limit === String(requested.dailyLossLimit) &&
    sameLock(row.locked_until, requested.lockedUntil)
  );
}

export class CasinoSelfLimitEvidenceError extends Error {
  constructor() {
    super('casino self-limit persistence evidence is missing or contradictory');
  }
}

/**
 * The PUT endpoint echoes the requested DTO after its SQL call. That response
 * alone cannot prove the member's protective cap is persisted. Compare it
 * with the authenticated GET, which reads member_casino_self_limit in SQL.
 */
export function verifyCasinoSelfLimit(
  requested: RequestedCasinoSelfLimit,
  writeReceipt: unknown,
  persisted: unknown,
): CasinoSelfLimitReceipt {
  if (!matches(writeReceipt, requested) || !matches(persisted, requested)) {
    throw new CasinoSelfLimitEvidenceError();
  }
  return persisted;
}
