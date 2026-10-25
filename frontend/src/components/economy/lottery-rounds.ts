export interface PublicLotteryRound {
  readonly roundNumber: number;
  readonly status: 'OPEN' | 'DRAWING' | 'SETTLED';
  readonly ticketPriceWld: string;
  readonly jackpotPoolWld: string;
  readonly totalTicketsSold: number;
  readonly drawsAt: string;
  readonly settledAt: string | null;
  readonly winningNumbers: readonly number[] | null;
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function integerString(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]{0,29})$/.test(value);
}

function isoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString() === value;
}

export function formatLotteryWld(value: string): string {
  if (!integerString(value)) throw new Error('invalid WLD amount');
  return BigInt(value).toLocaleString('ko-KR');
}

export function parseLotteryRounds(value: unknown): PublicLotteryRound[] {
  if (!object(value) || !Array.isArray(value.rounds) || value.rounds.length > 12) {
    throw new Error('invalid lottery round response');
  }
  const seen = new Set<number>();
  return value.rounds.map((row: unknown) => {
    if (!object(row) || typeof row.roundNumber !== 'number' ||
      !Number.isSafeInteger(row.roundNumber) || row.roundNumber <= 0 ||
      seen.has(row.roundNumber) ||
      (row.status !== 'OPEN' && row.status !== 'DRAWING' && row.status !== 'SETTLED') ||
      !integerString(row.ticketPriceWld) || !integerString(row.jackpotPoolWld) ||
      typeof row.totalTicketsSold !== 'number' || !Number.isSafeInteger(row.totalTicketsSold) ||
      row.totalTicketsSold < 0 || !isoDate(row.drawsAt)) {
      throw new Error('invalid lottery round record');
    }
    seen.add(row.roundNumber);
    if (row.status === 'SETTLED') {
      if (!isoDate(row.settledAt) || !Array.isArray(row.winningNumbers) ||
        row.winningNumbers.length !== 6 ||
        row.winningNumbers.some((n: unknown) => typeof n !== 'number' || !Number.isSafeInteger(n) || n < 1 || n > 45) ||
        new Set(row.winningNumbers).size !== 6) {
        throw new Error('invalid settled lottery record');
      }
    } else if (row.settledAt !== null || row.winningNumbers !== null) {
      throw new Error('unsettled lottery numbers must not be disclosed');
    }
    return row as unknown as PublicLotteryRound;
  });
}
