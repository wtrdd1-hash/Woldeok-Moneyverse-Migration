import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** The two faces 042's CHECK allows and 060's byte mapping produces. */
const FACES = new Set(['heads', 'tails']);

/**
 * The four states 059 permits on a feature switch row, plus the fact that an
 * unregistered feature reads back as 'disabled'. Only 'enabled' is open: the
 * comparison casino_play_coin and casino_coin_terms both make.
 */
export const CASINO_OPEN = 'enabled';

export class CasinoInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CasinoInputError';
  }
}

/**
 * Validated here as well as in the database function. The double gate is
 * deliberate and documented across this codebase: the function is the
 * authority, and this turns a malformed argument into a 400 with a sentence
 * about the field rather than a 500 carrying a message about a function.
 */
function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new CasinoInputError(`${field} must be a UUID`);
  }
}

function assertFace(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !FACES.has(value)) {
    throw new CasinoInputError('the choice must be heads or tails');
  }
}

/**
 * Bounds, not limits. The policy in public.casino_policy owns the minimum and
 * maximum stake and an operator changes them without a deploy, so mirroring
 * today's 10..10000 here would be a second copy that goes stale and starts
 * refusing bets the policy allows. What is checked here is only what no
 * policy could ever make true: a stake has to be a whole number of WLD above
 * zero, and it has to be small enough that the number survived JSON intact.
 *
 * `Number.isSafeInteger` does not narrow `unknown` on its own, hence the
 * typeof first.
 */
function assertStake(value: unknown): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) {
    throw new CasinoInputError('the stake must be a whole number of WLD above zero');
  }
}

function assertSelfLimit(value: unknown, field: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new CasinoInputError(`${field} must be a whole number of WLD, zero or above`);
  }
}

/**
 * A lock is either absent or a moment PostgreSQL can parse. Whether that
 * moment is far enough in the future is not decided here: 080 compares it
 * against `clock_timestamp()`, and the database's clock is the one the lock
 * will actually be measured against.
 */
function lockUntilOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new CasinoInputError('the lock-until moment must be an ISO 8601 timestamp');
  }
  return value;
}

/**
 * public.casino_coin_terms RETURNS TABLE: 060-casino-coin-fairness.sql,
 * redefined by 099-casino-payout-and-limits.sql when the payout stopped being
 * even money.
 */
export interface CasinoTermsRow {
  readonly enabled: boolean;
  readonly min_stake: string;
  readonly max_stake: string;
  readonly daily_stake_limit: string;
  readonly daily_loss_limit: string;
  readonly daily_stake_used: string;
  readonly daily_loss_used: string;
  readonly remaining_stake: string;
  readonly remaining_loss: string;
  readonly win_probability_ppm: number;
  readonly payout_multiplier_ppm: number;
  readonly house_edge_ppm: number;
  readonly worst_case_loss: string;
  /**
   * What a winning maximum-stake play actually pays, net of the stake (099).
   *
   * Reported by the database rather than derived here, because the payout
   * rounds down to whole WLD and a second copy of that arithmetic in
   * TypeScript is a second chance to disagree with the ledger about what a
   * member is owed.
   */
  readonly net_win_at_max: string;
}

/**
 * public.casino_coin_win_probability_ppm and
 * public.casino_latest_qualifying_distribution_trial, read together:
 * packages/database/migrations/060-casino-coin-fairness.sql
 *
 * Every trial column is nullable because no qualifying trial need exist. The
 * ppm figures stay numbers -- they are counts out of a million, not money,
 * and integer columns at that -- while the two numerics keep their text form
 * for the same reason every bigint here does.
 */
export interface CasinoFairnessRow {
  readonly win_probability_ppm: number;
  readonly trial_id: string | null;
  readonly trials: string | null;
  readonly heads: string | null;
  readonly expected_win_probability_ppm: number | null;
  readonly observed_win_probability_ppm: number | null;
  readonly z_score: string | null;
  readonly tolerance_sigma: string | null;
  readonly created_at: Date | null;
}

/** public.casino_play_coin RETURNS TABLE: packages/database/migrations/060-casino-coin-fairness.sql */
export interface CasinoPlayRow {
  readonly play_id: string;
  readonly outcome: string;
  readonly net_amount: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
  readonly win_probability_ppm: number;
  readonly payout_multiplier_ppm: number;
  readonly worst_case_loss: string;
  /**
   * What a winning maximum-stake play actually pays, net of the stake (099).
   *
   * Reported by the database rather than derived here, because the payout
   * rounds down to whole WLD and a second copy of that arithmetic in
   * TypeScript is a second chance to disagree with the ledger about what a
   * member is owed.
   */
  readonly net_win_at_max: string;
}

/**
 * Database gateway for the coin game.
 *
 * Every statement targets a SECURITY DEFINER function that 042, 060 or 080
 * granted to moneyverse_app. The four casino tables --
 * virtual_casino_coin_plays, casino_policy, casino_coin_distribution_trials
 * and casino_self_limits -- are revoked from that role, so there is no SQL
 * path here that reads or writes one directly, and there must never be.
 */
export class CasinoRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * The state of the casino's own switch, for the routes that must refuse
   * before they take a stake.
   *
   * The feature key is a literal rather than a parameter: this repository
   * speaks for one feature, and a key a caller could vary would be a way to
   * ask about somebody else's.
   */
  async switchState(): Promise<string> {
    const row = await queryOne<{ state: string }>(
      this.pool,
      `SELECT public.feature_switch_state('casino') AS state`,
    );
    if (!row) throw new Error('feature_switch_state did not return a row');
    return row.state;
  }

  /**
   * The odds, the limits, and what this member has spent against them today.
   * Korean game law wants the odds on the screen before the stake, so this is
   * the read a play screen makes first.
   */
  async terms(actor: unknown): Promise<CasinoTermsRow> {
    assertUuid(actor, 'actor');
    const row = await queryOne<CasinoTermsRow>(
      this.pool,
      `SELECT terms.enabled,
              terms.min_stake::text AS min_stake,
              terms.max_stake::text AS max_stake,
              terms.daily_stake_limit::text AS daily_stake_limit,
              terms.daily_loss_limit::text AS daily_loss_limit,
              terms.daily_stake_used::text AS daily_stake_used,
              terms.daily_loss_used::text AS daily_loss_used,
              terms.remaining_stake::text AS remaining_stake,
              terms.remaining_loss::text AS remaining_loss,
              terms.win_probability_ppm,
              terms.payout_multiplier_ppm,
              terms.house_edge_ppm,
              terms.worst_case_loss::text AS worst_case_loss,
              terms.net_win_at_max::text AS net_win_at_max
       FROM public.casino_coin_terms($1::uuid) AS terms`,
      [actor],
    );
    if (!row) throw new Error('casino_coin_terms did not return a row');
    return row;
  }

  /**
   * The disclosed probability and the trial that backs it up.
   *
   * One statement and one row, always. casino_latest_qualifying_distribution_trial
   * returns no rows at all when no trial qualifies -- which is the normal
   * state before the casino has ever opened -- and a bare join would then
   * lose the disclosed probability with it, leaving the route to answer 200
   * with an empty body. The LATERAL keeps the probability on a row of its own
   * and lets every trial column be null instead.
   */
  async fairness(): Promise<CasinoFairnessRow> {
    const row = await queryOne<CasinoFairnessRow>(
      this.pool,
      `SELECT disclosure.win_probability_ppm,
              trial.trial_id::text AS trial_id,
              trial.trials::text AS trials,
              trial.heads::text AS heads,
              trial.expected_win_probability_ppm,
              trial.observed_win_probability_ppm,
              trial.z_score::text AS z_score,
              trial.tolerance_sigma::text AS tolerance_sigma,
              trial.created_at
       FROM (SELECT public.casino_coin_win_probability_ppm() AS win_probability_ppm)
              AS disclosure
       LEFT JOIN LATERAL public.casino_latest_qualifying_distribution_trial() AS trial ON true`,
    );
    if (!row) throw new Error('casino_coin_win_probability_ppm did not return a row');
    return row;
  }

  /**
   * One toss. The key comes first and the actor second, as it does for every
   * idempotent write in this schema, and neither the face, the odds nor the
   * payout is a parameter the browser can reach.
   */
  async play(
    key: unknown,
    actor: unknown,
    choice: unknown,
    stake: unknown,
  ): Promise<CasinoPlayRow> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertFace(choice);
    assertStake(stake);
    const row = await queryOne<CasinoPlayRow>(
      this.pool,
      `SELECT play.play_id::text AS play_id,
              play.outcome,
              play.net_amount::text AS net_amount,
              play.transaction_id::text AS transaction_id,
              play.replayed,
              play.win_probability_ppm,
              play.payout_multiplier_ppm,
              play.worst_case_loss::text AS worst_case_loss
       FROM public.casino_play_coin($1::uuid, $2::uuid, $3::text, $4::bigint) AS play`,
      [key, actor, choice, String(stake)],
    );
    if (!row) throw new Error('casino_play_coin did not return a row');
    return row;
  }

  /**
   * The member's own daily caps and, optionally, a lock they cannot lift
   * until it expires. 080 enforces all three with a trigger on the plays
   * table, so a limit set here binds every path into the game, present and
   * future.
   *
   * The actor comes first and there is no idempotency key, because this is an
   * upsert of one row keyed by the member rather than an event: sending it
   * twice sets the same limits twice, which is the same limits.
   */
  async setSelfLimit(
    actor: unknown,
    dailyBetLimit: unknown,
    dailyLossLimit: unknown,
    lockUntil: unknown,
  ): Promise<void> {
    assertUuid(actor, 'actor');
    assertSelfLimit(dailyBetLimit, 'the daily stake limit');
    assertSelfLimit(dailyLossLimit, 'the daily loss limit');
    const lockedUntil = lockUntilOrNull(lockUntil);
    await queryRows(
      this.pool,
      `SELECT public.member_set_casino_self_limit($1::uuid, $2::bigint, $3::bigint, $4::timestamptz)`,
      [actor, String(dailyBetLimit), String(dailyLossLimit), lockedUntil],
    );
  }
}
