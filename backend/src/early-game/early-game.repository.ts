import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class EarlyGameInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EarlyGameInputError';
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
    throw new EarlyGameInputError(`${field} must be a UUID`);
  }
}

/**
 * public.early_game_unlocks RETURNS TABLE:
 * packages/database/migrations/101-early-game-progress.sql
 *
 * Every number here is a count -- a job level, whole days since the account
 * was created, finished tasks -- and never an amount of WLD, which is why a
 * number is the right type for one. Nothing in this module touches a balance.
 *
 * `is_enforced` is the one field a screen must not ignore. False means the
 * ladder carries this rung as 16.1's plan and the database refuses nothing
 * below it, so rendering it as a locked door would state a rule that does not
 * exist -- the failure this feature is most able to commit.
 */
export interface EarlyUnlockRow {
  readonly unlock_code: string;
  readonly unlock_label: string;
  readonly unlock_detail: string;
  /** The business symbol this rung gates, or null when it gates none. */
  readonly unlock_business_symbol: string | null;
  readonly needs_job_level: number;
  readonly needs_account_days: number;
  readonly needs_work_completions: number;
  readonly is_enforced: boolean;
  readonly unlocked: boolean;
  readonly next_up: boolean;
  readonly member_job_level: number;
  readonly member_account_days: number;
  readonly member_work_completions: number;
}

/**
 * public.early_game_weekly_goals RETURNS TABLE:
 * packages/database/migrations/101-early-game-progress.sql
 *
 * `goal_target` and `goal_progress` are bigints and stay strings: one of the
 * four goals is measured in WLD and is a sum over `ledger_postings`, and this
 * codebase does not put an amount through Number even when today's figure
 * would survive it.
 *
 * `goal_self_reported` marks the one goal whose number a member can raise by
 * pressing a button -- the NPC affinity, which `engagement_record_npc_order`
 * moves without verifying that an order was delivered. It reaches the screen
 * so the screen can say so.
 */
export interface EarlyWeeklyGoalRow {
  readonly goal_code: string;
  readonly goal_label: string;
  readonly goal_detail: string;
  readonly goal_metric: string;
  readonly goal_window: string;
  readonly goal_target: string;
  readonly goal_progress: string;
  readonly goal_unit: string;
  readonly goal_self_reported: boolean;
  readonly goal_completed: boolean;
  readonly week_start: string;
}

/** One page of a collection, as the function builds it with jsonb_build_object. */
export interface EarlyCollectionEntry {
  readonly code: string;
  readonly label: string;
  readonly unlocked: boolean;
  /** The moment the evidence was recorded, not the moment anybody swept for it. */
  readonly unlocked_at: string | null;
}

/**
 * public.early_game_collections RETURNS TABLE:
 * packages/database/migrations/101-early-game-progress.sql
 *
 * `reward_title` is nullable because the column is; both seeded books pay one
 * today. `reward_held` is whether the member already holds it -- the title is
 * granted by a trigger on the work receipt or the purchase that completed the
 * book, so a completed book with no title held would be a defect worth seeing
 * rather than something a screen should hide.
 */
export interface EarlyCollectionRow {
  readonly book_code: string;
  readonly book_label: string;
  readonly book_detail: string;
  readonly reward_title: string | null;
  readonly reward_note: string;
  readonly reward_held: boolean;
  readonly entry_total: number;
  readonly entry_unlocked: number;
  readonly entries: readonly EarlyCollectionEntry[];
}

/**
 * The Seoul day a screen is claiming for.
 *
 * Sent by the caller rather than computed here, and that is deliberate: the
 * database names the day in the read model, the claim refuses anything but
 * today in Seoul, and computing it in TypeScript would be a second Asia/Seoul
 * implementation whose disagreement with the first would look like a member
 * being refused at random.
 */
const DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function assertSeoulDay(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !DAY.test(value)) {
    throw new EarlyGameInputError(`${field} must be a YYYY-MM-DD date`);
  }
  // '2026-02-31' satisfies the pattern, and PostgreSQL answers it with 22008,
  // which `pg-error.ts` does not map -- it would reach a member as a 500. The
  // round-trip is what rejects a day that does not exist.
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new EarlyGameInputError(`${field} must be a real calendar date`);
  }
}

/**
 * public.early_event_today RETURNS TABLE:
 * packages/database/migrations/103-early-game-events.sql
 *
 * `reward_amount` and `reward_experience` are what claiming right now would
 * actually pay this member -- 095's rule for `reward_preview` -- and not what
 * the catalogue declares. They differ for a member who has never been paid
 * for work, and `experience_blocked` is how the screen knows to say why.
 *
 * `claim_block` is 'claimed', 'needs_work' or null. It reaches the screen as
 * a reason rather than as a disabled flag, because "already taken" and "work
 * first" are two different days for a member.
 */
export interface EarlyEventRow {
  readonly event_date: string;
  readonly event_code: string;
  readonly event_label: string;
  readonly event_detail: string;
  readonly claim_label: string;
  readonly reward_amount: string;
  readonly reward_experience: string;
  readonly experience_blocked: boolean;
  readonly reward_item_name: string | null;
  readonly reward_item_quantity: number;
  readonly pending_effect: string | null;
  readonly claimed: boolean;
  readonly claimed_at: Date | null;
  readonly claim_transaction_id: string | null;
  readonly claim_block: string | null;
}

/**
 * public.early_event_claim RETURNS TABLE (103).
 *
 * `transaction_id` is null for an event that paid only an item or only
 * experience: nothing moved through the ledger, so there is nothing to point
 * at, and a screen has to say so rather than render a blank link.
 */
export interface EarlyEventReceiptRow {
  readonly event_code: string;
  readonly event_label: string;
  readonly reward_amount: string;
  readonly experience_amount: string;
  readonly item_name: string | null;
  readonly item_quantity: number;
  readonly transaction_id: string | null;
  readonly replayed: boolean;
}

/**
 * public.early_first_day_flow RETURNS TABLE (103).
 *
 * `step_verified` is the field a screen must not ignore. False means nothing
 * records this step -- reading the tutorial, opening the growth board -- and
 * rendering it as a box that ticks itself would be `engagement_record_progress`
 * with a nicer name.
 */
export interface EarlyFirstDayStepRow {
  readonly step_code: string;
  readonly step_label: string;
  readonly step_detail: string;
  readonly step_href: string;
  readonly step_metric: string;
  readonly step_verified: boolean;
  readonly step_target: string;
  readonly step_progress: string;
  readonly step_unit: string;
  readonly step_done: boolean;
}

/**
 * Database gateway for 16.1's early game.
 *
 * Five reads and one write. The five are computed from rows that a
 * money-moving or reward-paying function already wrote -- the ladder, the
 * goals, the books, the day's event and the first-day flow -- and there is
 * nothing among them a member could call to move one of those numbers.
 * `engagement_record_progress` is the counterexample this module was built to
 * avoid repeating, and none of the reads takes an amount.
 *
 * The write is `claimEvent`, and it is not that shape either. It takes a key
 * and a day: no event, no amount, no count. `early_event_claim` (103) draws
 * the day's event itself from a hash of the member and the Seoul date and
 * prices it from its own catalogue, so the only thing a caller can influence
 * is whether the claim happens at all -- and `early_event_claims` is keyed on
 * (member, day), which means once.
 *
 * Every statement targets a SECURITY DEFINER function that 101 or 103 granted
 * to moneyverse_app. The seven tables those two migrations add are revoked
 * from that role, as is every table they read through them.
 */
export class EarlyGameRepository {
  constructor(private readonly pool: Queryable) {}

  /** The unlock ladder, with this member's own standing against every rung. */
  unlocks(actor: unknown): Promise<EarlyUnlockRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<EarlyUnlockRow>(
      this.pool,
      `SELECT rung.unlock_code, rung.unlock_label, rung.unlock_detail,
              rung.unlock_business_symbol,
              rung.needs_job_level, rung.needs_account_days, rung.needs_work_completions,
              rung.is_enforced, rung.unlocked, rung.next_up,
              rung.member_job_level, rung.member_account_days, rung.member_work_completions
       FROM public.early_game_unlocks($1::uuid) AS rung`,
      [actor],
    );
  }

  /**
   * This week's goals.
   *
   * `week_start` is cast to text rather than left as a `date`: pg parses a
   * date into a JavaScript Date at the *server's* local midnight, and the week
   * this function means starts at midnight in Seoul. The string is the day the
   * database named, and it stays that day.
   */
  weeklyGoals(actor: unknown): Promise<EarlyWeeklyGoalRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<EarlyWeeklyGoalRow>(
      this.pool,
      `SELECT goal.goal_code, goal.goal_label, goal.goal_detail, goal.goal_metric,
              goal.goal_window, goal.goal_target::text, goal.goal_progress::text,
              goal.goal_unit, goal.goal_self_reported, goal.goal_completed,
              goal.week_start::text
       FROM public.early_game_weekly_goals($1::uuid) AS goal`,
      [actor],
    );
  }

  /** The collection books, page by page. */
  collections(actor: unknown): Promise<EarlyCollectionRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<EarlyCollectionRow>(
      this.pool,
      `SELECT book.book_code, book.book_label, book.book_detail, book.reward_title,
              book.reward_note, book.reward_held, book.entry_total, book.entry_unlocked,
              book.entries
       FROM public.early_game_collections($1::uuid) AS book`,
      [actor],
    );
  }

  /**
   * The event this member is dealt today.
   *
   * Null when the catalogue has no active row, which is how the feature is
   * switched off -- a different answer from a failed request, and the route
   * keeps them apart.
   */
  todayEvent(actor: unknown): Promise<EarlyEventRow | null> {
    assertUuid(actor, 'actor');
    return queryOne<EarlyEventRow>(
      this.pool,
      `SELECT event.event_date::text, event.event_code, event.event_label, event.event_detail,
              event.claim_label, event.reward_amount::text, event.reward_experience::text,
              event.experience_blocked, event.reward_item_name, event.reward_item_quantity,
              event.pending_effect, event.claimed, event.claimed_at,
              event.claim_transaction_id::text, event.claim_block
       FROM public.early_event_today($1::uuid) AS event`,
      [actor],
    );
  }

  /**
   * Claiming today's event.
   *
   * The day is cast to `date` in the statement rather than left for pg to
   * infer, so a value this repository accepted reaches the function as the
   * type it declares.
   */
  claimEvent(key: unknown, actor: unknown, day: unknown): Promise<EarlyEventReceiptRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertSeoulDay(day, 'event date');
    return queryOne<EarlyEventReceiptRow>(
      this.pool,
      `SELECT receipt.event_code, receipt.event_label, receipt.reward_amount::text,
              receipt.experience_amount::text, receipt.item_name, receipt.item_quantity,
              receipt.transaction_id::text, receipt.replayed
       FROM public.early_event_claim($1::uuid, $2::uuid, $3::date) AS receipt`,
      [key, actor, day],
    );
  }

  /** 16.1's first day, step by step, counted from what happened. */
  firstDayFlow(actor: unknown): Promise<EarlyFirstDayStepRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<EarlyFirstDayStepRow>(
      this.pool,
      `SELECT step.step_code, step.step_label, step.step_detail, step.step_href,
              step.step_metric, step.step_verified, step.step_target::text,
              step.step_progress::text, step.step_unit, step.step_done
       FROM public.early_first_day_flow($1::uuid) AS step`,
      [actor],
    );
  }
}
