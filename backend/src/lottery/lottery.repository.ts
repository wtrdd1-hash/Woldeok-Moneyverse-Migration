import type { Queryable } from '../core/db';
import { queryRows } from '../core/db';

interface LotteryRoundRow {
  readonly round_number: number;
  readonly status: string;
  readonly ticket_price_wld: string;
  readonly jackpot_pool_wld: string;
  readonly total_tickets_sold: number;
  readonly draws_at: Date;
  readonly settled_at: Date | null;
  readonly winning_numbers: number[] | null;
}

export interface PublicLotteryRound {
  readonly roundNumber: number;
  readonly status: 'OPEN' | 'DRAWING' | 'SETTLED';
  readonly ticketPriceWld: string;
  readonly jackpotPoolWld: string;
  readonly totalTicketsSold: number;
  readonly drawsAt: string;
  readonly settledAt: string | null;
  readonly winningNumbers: number[] | null;
}

function amount(value: unknown): string {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,29})$/.test(value)) {
    throw new Error('lottery monetary record is invalid');
  }
  return value;
}

function positiveInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new Error('lottery round number is invalid');
  }
  return value;
}

function nonnegativeInteger(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('lottery ticket count is invalid');
  }
  return value;
}

function dateIso(value: unknown): string {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new Error('lottery date is invalid');
  }
  return value.toISOString();
}

function normalized(row: LotteryRoundRow): PublicLotteryRound {
  if (row.status !== 'OPEN' && row.status !== 'DRAWING' && row.status !== 'SETTLED') {
    throw new Error('lottery status is invalid');
  }
  const numbers = row.winning_numbers;
  if (row.status === 'SETTLED') {
    if (!Array.isArray(numbers) || numbers.length !== 6 ||
        numbers.some((n) => !Number.isSafeInteger(n) || n < 1 || n > 45) ||
        new Set(numbers).size !== 6 || row.settled_at === null) {
      throw new Error('settled lottery proof is incomplete');
    }
  }
  return {
    roundNumber: positiveInteger(row.round_number),
    status: row.status,
    ticketPriceWld: amount(row.ticket_price_wld),
    jackpotPoolWld: amount(row.jackpot_pool_wld),
    totalTicketsSold: nonnegativeInteger(row.total_tickets_sold),
    drawsAt: dateIso(row.draws_at),
    settledAt: row.status === 'SETTLED' ? dateIso(row.settled_at) : null,
    // A future or in-progress draw must never disclose uncommitted numbers.
    winningNumbers: row.status === 'SETTLED' ? [...numbers!] : null,
  };
}

export class LotteryRepository {
  constructor(private readonly db: Queryable) {}

  async listRounds(): Promise<{ readonly rounds: PublicLotteryRound[] }> {
    // Public round metadata only. Neither private tickets nor unverified
    // burn/payout accounting is a trustworthy public financial receipt.
    const rows = await queryRows<LotteryRoundRow>(
      this.db,
      'SELECT round_number, status, ticket_price_wld::text, jackpot_pool_wld::text, ' +
      'total_tickets_sold, draws_at, settled_at, winning_numbers ' +
      'FROM public.national_treasury_lottery_rounds ' +
      'ORDER BY round_number DESC LIMIT 12',
    );
    const rounds = rows.map(normalized);
    if (new Set(rounds.map((row) => row.roundNumber)).size !== rounds.length) {
      throw new Error('duplicate lottery round records');
    }
    return { rounds };
  }
}
