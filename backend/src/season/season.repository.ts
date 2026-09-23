import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';
import type {
  ClaimSeasonRewardResult,
  CurrentSeasonStatus,
  HallOfFameHonoree,
  HallOfFameSeason,
  SeasonEventRow,
  SeasonLeaderboardRow,
  SeasonRepository,
  SettleSeasonResult,
} from './season.service';

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

  async current(userId: string): Promise<CurrentSeasonStatus> {
    const validUserId = id(userId, 'user id');

    const activeSeason = await queryOne<{
      id: string;
      name: string;
      starts_at: Date;
      ends_at: Date;
      lifecycle_state: string;
    }>(
      this.pool,
      `SELECT id::text, name, starts_at, ends_at, lifecycle_state
       FROM public.virtual_seasons
       WHERE active = true
       ORDER BY starts_at DESC
       LIMIT 1;`,
    );

    if (!activeSeason) {
      throw new SeasonInputError('no active season found');
    }

    const participantsCountRow = await queryOne<{ count: string }>(
      this.pool,
      `SELECT count(DISTINCT entry.user_id)::text AS count
       FROM public.virtual_consumption_event_entries entry
       JOIN public.virtual_consumption_events evt ON evt.id = entry.event_id
       WHERE evt.season_id = $1::uuid;`,
      [activeSeason.id],
    );
    const totalParticipants = Number(participantsCountRow?.count ?? '0');

    const myStanding = await queryOne<{ rank: number; points: string }>(
      this.pool,
      `WITH totals AS (
         SELECT entry.user_id,
                SUM(entry.points_earned)::numeric AS points,
                COUNT(*)::bigint AS entries
         FROM public.virtual_consumption_event_entries entry
         JOIN public.virtual_consumption_events evt ON evt.id = entry.event_id
         WHERE evt.season_id = $1::uuid
         GROUP BY entry.user_id
       ),
       ranked AS (
         SELECT totals.user_id,
                totals.points,
                DENSE_RANK() OVER (ORDER BY totals.points DESC, totals.entries ASC, totals.user_id) AS rank
         FROM totals
       )
       SELECT rank::int, points::text FROM ranked WHERE user_id = $2::uuid;`,
      [activeSeason.id, validUserId],
    );

    const myRank = myStanding ? myStanding.rank : null;
    const myScore = myStanding ? Number(myStanding.points) : 0;

    let myTier = 'Bronze';
    let tierRewardWld = 100;
    let tierTrophy: string | null = null;

    if (myRank !== null && totalParticipants > 0) {
      const pct = (myRank / totalParticipants) * 100;
      if (myRank <= 10) {
        myTier = 'Capital Master';
        tierRewardWld = 500;
        tierTrophy = `TROPHY_SEASON_CHAMPION_#${myRank}`;
      } else if (pct <= 1.0) {
        myTier = 'Diamond';
        tierRewardWld = 500;
      } else if (pct <= 5.0) {
        myTier = 'Platinum';
        tierRewardWld = 400;
      } else if (pct <= 20.0) {
        myTier = 'Gold';
        tierRewardWld = 250;
      } else if (pct <= 50.0) {
        myTier = 'Silver';
        tierRewardWld = 150;
      } else {
        myTier = 'Bronze';
        tierRewardWld = 100;
      }
    }

    return {
      seasonId: activeSeason.id,
      seasonName: activeSeason.name,
      startsAt: activeSeason.starts_at,
      endsAt: activeSeason.ends_at,
      lifecycleState: activeSeason.lifecycle_state,
      totalParticipants,
      myRank,
      myScore,
      myTier,
      tierRewardWld,
      tierTrophy,
    };
  }

  async hallOfFame(): Promise<readonly HallOfFameSeason[]> {
    const rows = await queryRows<{
      season_id: string;
      season_name: string;
      rank: number;
      user_id: string;
      display_name: string;
      score: string;
      trophy_code: string;
      settled_at: Date;
    }>(
      this.pool,
      `SELECT season_id::text, season_name, rank::int, user_id::text, display_name, score::text, trophy_code, settled_at
       FROM public.season_hall_of_fame
       ORDER BY settled_at DESC, rank ASC;`,
      [],
    );

    const seasonMap = new Map<string, {
      seasonId: string;
      seasonName: string;
      settledAt: Date;
      honorees: HallOfFameHonoree[];
    }>();

    for (const r of rows) {
      let entry = seasonMap.get(r.season_id);
      if (!entry) {
        entry = {
          seasonId: r.season_id,
          seasonName: r.season_name,
          settledAt: r.settled_at,
          honorees: [],
        };
        seasonMap.set(r.season_id, entry);
      }
      entry.honorees.push({
        rank: r.rank,
        userId: r.user_id,
        displayName: r.display_name,
        score: Number(r.score),
        trophyCode: r.trophy_code,
        trophyName: `시즌 #${r.rank}위 챔피언 트로피`,
      });
    }

    return Array.from(seasonMap.values());
  }

  async settle(seasonId?: string): Promise<SettleSeasonResult> {
    let targetSeasonId = seasonId;
    if (!targetSeasonId) {
      const active = await queryOne<{ id: string }>(
        this.pool,
        `SELECT id::text FROM public.virtual_seasons WHERE active = true ORDER BY starts_at DESC LIMIT 1;`,
      );
      if (!active) throw new SeasonInputError('no active season to settle');
      targetSeasonId = active.id;
    }

    const sId = id(targetSeasonId, 'season id');

    const row = await queryOne<{
      settled_count: number;
      hall_of_fame_count: number;
      season_name: string;
    }>(
      this.pool,
      `SELECT settled_count, hall_of_fame_count, season_name FROM public.season_settle_rewards($1::uuid);`,
      [sId],
    );

    if (!row) throw new Error('failed to settle season rewards');

    return {
      seasonId: sId,
      seasonName: row.season_name,
      settledCount: row.settled_count,
      hallOfFameCount: row.hall_of_fame_count,
    };
  }

  async claimReward(
    userId: string,
    seasonId: string,
    idempotencyKey: string,
  ): Promise<ClaimSeasonRewardResult> {
    const uId = id(userId, 'user id');
    const sId = id(seasonId, 'season id');
    const iKey = id(idempotencyKey, 'idempotency key');

    const row = await queryOne<{
      claim_id: string;
      season_id: string;
      season_name: string;
      tier: string;
      rank: number | null;
      reward_wld: string;
      trophy_code: string | null;
      claimed_at: Date;
    }>(
      this.pool,
      `SELECT claim_id::text, season_id::text, season_name, tier, rank::int, reward_wld::text, trophy_code, claimed_at
       FROM public.season_claim_reward($1::uuid, $2::uuid, $3::uuid);`,
      [uId, sId, iKey],
    );

    if (!row) throw new Error('failed to claim season reward');

    return {
      claimId: row.claim_id,
      seasonId: row.season_id,
      seasonName: row.season_name,
      tier: row.tier,
      rank: row.rank,
      rewardWld: Number(row.reward_wld),
      trophyCode: row.trophy_code,
      claimedAt: row.claimed_at,
    };
  }
}
