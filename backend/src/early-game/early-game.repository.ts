import type { Queryable } from '../core/db';
import { queryRows } from '../core/db';

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
 * Database gateway for 16.1's early game.
 *
 * Three reads and no writes, and that is the whole point of the feature: the
 * ladder, the goals and the books are all computed from rows that a
 * money-moving or reward-paying function already wrote. There is nothing here
 * a member could call to move one of these numbers, and there must not be --
 * `engagement_record_progress` is the counterexample this feature was built
 * to avoid repeating.
 *
 * Every statement targets a SECURITY DEFINER function that 101 granted to
 * moneyverse_app. The four tables 101 adds are revoked from that role, as are
 * all thirteen it reads through them.
 */
export class EarlyGameRepository {
  constructor(private readonly pool: Queryable) {}

  /** The unlock ladder, with this member's own standing against every rung. */
  unlocks(actor: unknown): Promise<EarlyUnlockRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<EarlyUnlockRow>(
      this.pool,
      `SELECT rung.unlock_code, rung.unlock_label, rung.unlock_detail,
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
}
