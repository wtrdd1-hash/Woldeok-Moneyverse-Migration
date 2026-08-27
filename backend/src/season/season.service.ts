import { Injectable } from '@nestjs/common';
import { SeasonInputError } from './season.repository';
import type { WldAmount } from '@moneyverse/contract';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const id = (v: unknown, n: string): string => {
  if (typeof v !== 'string' || !UUID.test(v)) throw new SeasonInputError(`${n} must be a UUID`);
  return v;
};

// Row shapes returned by PostgresSeasonRepository. events()/leaderboard()
// are passed straight through by SeasonService without validation, so
// their fields are typed to the repository's actual `::text` casts.
// cost_wld is a WLD amount; points/entries are gamification tallies, not
// money, so they stay plain strings.
export interface SeasonEventRow {
  readonly event_id: string;
  readonly season_id: string;
  readonly season_name: string;
  readonly title: string;
  readonly description: string;
  readonly cost_wld: WldAmount;
  readonly points_per_entry: number;
  readonly ends_at: unknown;
}

export interface SeasonLeaderboardRow {
  readonly rank: number;
  readonly points: string;
  readonly entries: string;
  readonly display_name: string;
}

// consume()'s row, by contrast, is re-validated field by field below
// (id()/String()/===true), so its fields are kept `unknown` to match that
// defensive intent rather than asserting the database is already trusted.
interface SeasonConsumeRow {
  readonly event_id?: unknown;
  readonly points_earned?: unknown;
  readonly transaction_id?: unknown;
  readonly replayed?: unknown;
}

interface SeasonConsumeRepositoryInput {
  readonly userId: string;
  readonly eventId: string;
  readonly quantity: unknown;
  readonly idempotencyKey: string;
}

export interface SeasonRepository {
  events(): Promise<readonly SeasonEventRow[]>;
  leaderboard(eventId: string): Promise<readonly SeasonLeaderboardRow[]>;
  consume(input: SeasonConsumeRepositoryInput): Promise<SeasonConsumeRow>;
}

export interface SeasonConsumeInput {
  readonly eventId?: unknown;
  readonly quantity?: unknown;
  readonly idempotencyKey?: unknown;
}

export interface SeasonConsumeResult {
  readonly eventId: string;
  readonly pointsEarned: string;
  readonly transactionId: string;
  readonly replayed: boolean;
}

@Injectable()
export class SeasonService {
  readonly repository: SeasonRepository;

  constructor(repository: SeasonRepository) {
    this.repository = repository;
  }

  events(): Promise<readonly SeasonEventRow[]> {
    return this.repository.events();
  }

  leaderboard(eventId: unknown): Promise<readonly SeasonLeaderboardRow[]> {
    return this.repository.leaderboard(id(eventId, 'event id'));
  }

  async consume(userId: unknown, input?: SeasonConsumeInput): Promise<SeasonConsumeResult> {
    const row = await this.repository.consume({
      userId: id(userId, 'user id'),
      eventId: id(input?.eventId, 'event id'),
      quantity: input?.quantity,
      idempotencyKey: id(input?.idempotencyKey, 'idempotency key'),
    });
    return {
      eventId: id(row.event_id, 'event id'),
      pointsEarned: String(row.points_earned),
      transactionId: id(row.transaction_id, 'transaction id'),
      replayed: row.replayed === true,
    };
  }
}
