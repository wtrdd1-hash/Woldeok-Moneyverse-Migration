import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type { SeasonEventRow, SeasonLeaderboardRow, SeasonRepository } from './season.service';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class SeasonInputError extends Error {}
const id = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !UUID.test(value))
    throw new SeasonInputError(`${field} must be a UUID`);
  return value;
};

// Raw row returned by season_consume() (see migration
// 037-season-consumption-events.sql). All fields are re-validated field by
// field in season-service.ts's consume(), so they are kept `unknown` here
// rather than trusted, matching that defensive intent.
interface SeasonConsumeRow {
  readonly event_id?: unknown;
  readonly points_earned?: unknown;
  readonly transaction_id?: unknown;
  readonly replayed?: unknown;
}

interface SeasonConsumeInput {
  readonly userId: string;
  readonly eventId: string;
  readonly quantity: unknown;
  readonly idempotencyKey: string;
}

export class PostgresSeasonRepository implements SeasonRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool?.query) throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async events(): Promise<readonly SeasonEventRow[]> {
    return queryRows<SeasonEventRow>(
      this.pool,
      'SELECT event_id::text,season_id::text,season_name,title,description,cost_wld::text,points_per_entry,ends_at FROM public.season_active_events()',
    );
  }

  // Declared `async` so id()'s synchronous throw below (built into the
  // query's parameter array) becomes a rejected promise rather than a
  // synchronous exception at the call site — see the matching note in
  // postgres-stock-repository.ts.
  async leaderboard(eventId: unknown): Promise<readonly SeasonLeaderboardRow[]> {
    // season_event_leaderboard() returns `rank` as a bigint (see the
    // migration): uncast, node-postgres parses bigint/int8 columns as
    // strings, not numbers, to avoid precision loss above 2^53. That
    // silently mismatched SeasonLeaderboardRow.rank (declared `number`) at
    // runtime. dense_rank() over a season's entrants is always small enough
    // for int4, so cast it explicitly instead of trusting the wire format.
    return queryRows<SeasonLeaderboardRow>(
      this.pool,
      'SELECT rank::int,points::text,entries::text,display_name FROM public.season_event_leaderboard($1,20)',
      [id(eventId, 'event id')],
    );
  }

  async consume({
    userId,
    eventId,
    quantity,
    idempotencyKey,
  }: SeasonConsumeInput): Promise<SeasonConsumeRow> {
    if (
      typeof quantity !== 'number' ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      throw new SeasonInputError('quantity must be between 1 and 100');
    }
    const row = await queryOne<SeasonConsumeRow>(
      this.pool,
      'SELECT event_id::text,points_earned::text,transaction_id::text,replayed FROM public.season_consume($1,$2,$3,$4)',
      [
        id(idempotencyKey, 'idempotency key'),
        id(userId, 'user id'),
        id(eventId, 'event id'),
        quantity,
      ],
    );
    if (!row) throw new Error('database did not return an event receipt');
    return row;
  }
}
