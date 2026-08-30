import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * The shape 081 puts a CHECK on for both `engagement_catalog.code` and
 * `npc_profiles.code`. Mirrored here so that a mistyped code arrives as a 400
 * naming the field rather than as a 409 about an unknown goal -- the two are
 * different mistakes and only one of them is worth retrying.
 */
const CODE = /^[a-z0-9_]{3,64}$/;

/**
 * The bounds `engagement_record_progress` enforces on `p_amount` itself: 082
 * raises 22023 outside 1..1000. Repeated here, not inferred, for the same
 * reason the code pattern is.
 */
const AMOUNT_MIN = 1;
const AMOUNT_MAX = 1000;

export class EngagementInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EngagementInputError';
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
    throw new EngagementInputError(`${field} must be a UUID`);
  }
}

function assertCode(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !CODE.test(value)) {
    throw new EngagementInputError(
      `${field} must be 3 to 64 characters of lower-case letters, digits and underscores`,
    );
  }
}

/**
 * `Number.isSafeInteger` does not narrow `unknown` on its own, hence the
 * typeof first. The ceiling is 082's, not a policy of this layer's: a member
 * cannot report a thousand and one of anything because the function will not
 * record it.
 */
function assertAmount(value: unknown): asserts value is number {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < AMOUNT_MIN ||
    value > AMOUNT_MAX
  ) {
    throw new EngagementInputError(
      `the amount must be a whole number between ${AMOUNT_MIN} and ${AMOUNT_MAX}`,
    );
  }
}

function assertBoolean(value: unknown, field: string): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new EngagementInputError(`${field} must be true or false`);
  }
}

/**
 * One entry of `today_tasks` or `weekly_goals`, as
 * `member_engagement_dashboard` builds it with jsonb_build_object:
 * packages/database/migrations/082-engagement-loop-functions.sql
 *
 * `progress` is a count of things done -- work completions, shop purchases,
 * NPC orders -- held in an `integer` column. It is not money, nothing in this
 * feature posts to the ledger, and no value here can approach 2^53, so a
 * number is the right type. The rule this codebase enforces is that a
 * *balance* never becomes a Number, and there is no balance in this module.
 */
export interface EngagementGoal {
  readonly code: string;
  readonly title: string;
  readonly progress: number;
}

/**
 * The `next_unlock` object, or null at the top stage. `requirements` is
 * `progression_stages.unlock_requirements`, which 076 seeds with
 * `workCompletions`, `jobLevel` and `businesses` and 077 reads back with
 * `::integer` -- counts, never money. `ProgressionRepository` types the same
 * payload the same way; it is redeclared rather than imported so that this
 * module does not reach into another module's file for a type.
 */
export interface EngagementNextUnlock {
  readonly stage: string;
  readonly requirements: Readonly<Record<string, number>>;
}

/**
 * public.member_engagement_dashboard RETURNS TABLE:
 * packages/database/migrations/082-engagement-loop-functions.sql
 *
 * Always exactly one row for an active member -- the function raises 28000
 * for anybody else rather than answering none. A zero-row read would make the
 * route answer 200 with an empty body, which a screen cannot tell apart from
 * "this member has no goals".
 */
export interface EngagementDashboardRow {
  readonly today_tasks: readonly EngagementGoal[];
  readonly weekly_goals: readonly EngagementGoal[];
  readonly next_unlock: EngagementNextUnlock | null;
  readonly notifications_enabled: boolean;
}

/**
 * public.engagement_record_progress RETURNS TABLE:
 * packages/database/migrations/082-engagement-loop-functions.sql
 *
 * `code` is the goal the *receipt* records, which on a replay is whatever the
 * first call recorded and need not be the code this call sent: the
 * idempotency key is the identity of the command, and the function answers
 * from the stored row. That is why the row is returned as the database
 * produced it instead of being merged with the request.
 */
export interface EngagementProgressRow {
  readonly code: string;
  readonly progress: number;
  readonly completed: boolean;
  readonly replayed: boolean;
}

/**
 * public.engagement_record_npc_order RETURNS TABLE:
 * packages/database/migrations/082-engagement-loop-functions.sql
 *
 * `affinity` is nullable on the replay path and only there. That path looks
 * the key up in `engagement_progress_receipts` -- which every engagement
 * command shares -- and then reads the caller's own relationship with the
 * named NPC; a key already spent on something other than an order with this
 * NPC leaves nothing to read. Typed as null rather than defaulted to zero,
 * because "no relationship was found for this key" is not the same fact as
 * "the relationship stands at zero".
 */
export interface EngagementNpcOrderRow {
  readonly npc_code: string;
  readonly affinity: number | null;
  readonly replayed: boolean;
}

/**
 * Database gateway for the engagement loop.
 *
 * Every statement targets a SECURITY DEFINER function that 082 granted to
 * moneyverse_app. The eight tables 081 adds are revoked from that role, so
 * there is no SQL path here that reads or writes one directly, and there must
 * never be.
 *
 * `member_activity_signals` is absent for the same reason: 082 maintains it
 * from triggers on `work_reward_receipts` and `shop_purchases` and grants no
 * reader, so nothing in this API can show it yet.
 */
export class EngagementRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * Today's goals, this week's goals, the next stage, and whether the member
   * wants to hear about any of it. One statement, because the screen renders
   * the four side by side and the function already assembles them together.
   */
  async dashboard(actor: unknown): Promise<EngagementDashboardRow> {
    assertUuid(actor, 'actor');
    const row = await queryOne<EngagementDashboardRow>(
      this.pool,
      `SELECT board.today_tasks, board.weekly_goals,
              board.next_unlock, board.notifications_enabled
       FROM public.member_engagement_dashboard($1::uuid) AS board`,
      [actor],
    );
    if (!row) throw new Error('member_engagement_dashboard did not return a row');
    return row;
  }

  /**
   * One report of progress against one goal. The key comes first and the
   * actor second, as it does for every idempotent write in this schema.
   *
   * The reward is not a parameter and cannot be: `engagement_catalog.reward`
   * is read inside the same transaction that grants it, so what a completed
   * goal hands over is decided by the catalogue rather than by the caller.
   */
  async recordProgress(
    key: unknown,
    actor: unknown,
    goalCode: unknown,
    amount: unknown,
  ): Promise<EngagementProgressRow> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertCode(goalCode, 'the goal code');
    assertAmount(amount);
    const row = await queryOne<EngagementProgressRow>(
      this.pool,
      `SELECT recorded.code, recorded.progress, recorded.completed, recorded.replayed
       FROM public.engagement_record_progress($1::uuid, $2::uuid, $3::text, $4::integer)
              AS recorded`,
      [key, actor, goalCode, amount],
    );
    if (!row) throw new Error('engagement_record_progress did not return a row');
    return row;
  }

  /**
   * One order taken from one NPC.
   *
   * The function moves the affinity and advances `neighbour_help` under the
   * same key, in one transaction, so the two cannot disagree about whether
   * the order happened.
   */
  async recordNpcOrder(
    key: unknown,
    actor: unknown,
    npcCode: unknown,
  ): Promise<EngagementNpcOrderRow> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertCode(npcCode, 'the npc code');
    const row = await queryOne<EngagementNpcOrderRow>(
      this.pool,
      `SELECT placed.npc_code, placed.affinity, placed.replayed
       FROM public.engagement_record_npc_order($1::uuid, $2::uuid, $3::text) AS placed`,
      [key, actor, npcCode],
    );
    if (!row) throw new Error('engagement_record_npc_order did not return a row');
    return row;
  }

  /**
   * The member's own notification preference.
   *
   * The actor comes first and there is no idempotency key, because this is an
   * upsert of one row keyed by the member rather than an event: sending it
   * twice sets the same preference twice, which is the same preference. The
   * function returns what it stored, so the answer is read back from the
   * database rather than echoed from the request.
   */
  async setPreferences(actor: unknown, notificationsEnabled: unknown): Promise<boolean> {
    assertUuid(actor, 'actor');
    assertBoolean(notificationsEnabled, 'the notification preference');
    const row = await queryOne<{ notifications_enabled: boolean }>(
      this.pool,
      `SELECT public.member_set_engagement_preferences($1::uuid, $2::boolean)
                AS notifications_enabled`,
      [actor, notificationsEnabled],
    );
    if (!row) throw new Error('member_set_engagement_preferences did not return a row');
    return row.notifications_enabled;
  }
}
