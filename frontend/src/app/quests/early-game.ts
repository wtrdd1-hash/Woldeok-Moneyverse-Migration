import { groupDigits } from '@/lib/money';

/**
 * 16.1's weekly goals and collection books, as the quests screen reads them.
 *
 * Pure, and outside `page.tsx` for the reason `quests.ts` is: a page cannot be
 * rendered in a test, and the arithmetic behind a progress bar can.
 *
 * Nothing here writes. Every figure on these cards is computed by 101 from a
 * work receipt, a shop purchase or a ledger posting, so there is no button to
 * press and no count for a member to report -- which is the difference between
 * these cards and the ones above them on the same screen.
 */

/** `public.early_game_weekly_goals` (101), as the API returns it. */
export interface EarlyWeeklyGoal {
  readonly goal_code: string;
  readonly goal_label: string;
  readonly goal_detail: string;
  readonly goal_metric: string;
  readonly goal_window: string;
  /** A bigint, and one of the four goals is measured in WLD. It stays a string. */
  readonly goal_target: string;
  readonly goal_progress: string;
  readonly goal_unit: string;
  readonly goal_self_reported: boolean;
  readonly goal_completed: boolean;
  /** The Monday this week started, in Seoul, as the database named the day. */
  readonly week_start: string;
}

export interface EarlyCollectionEntry {
  readonly code: string;
  readonly label: string;
  readonly unlocked: boolean;
  readonly unlocked_at: string | null;
}

/** `public.early_game_collections` (101). */
export interface EarlyCollection {
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

/** `GET /api/v1/engagement/early-game`. */
export interface EarlyGameBoard {
  readonly goals: readonly EarlyWeeklyGoal[];
  readonly collections: readonly EarlyCollection[];
}

const INTEGER = /^-?\d+$/;

/**
 * A percentage for a progress bar, clamped to 0..100.
 *
 * BigInt and not Number, for the reason every amount here avoids Number: one
 * of these goals sums `ledger_postings.amount`, which is a bigint, and a
 * member with a large enough week would round through a double. The scaling by
 * 100 happens inside BigInt and only the final ratio -- a value between 0 and
 * 100 -- becomes a number.
 */
export function goalPercent(progress: string, target: string): number {
  if (!INTEGER.test(progress) || !INTEGER.test(target)) return 0;
  const total = BigInt(target);
  if (total <= 0n) return 0;
  const done = BigInt(progress);
  if (done <= 0n) return 0;
  if (done >= total) return 100;
  return Number((done * 100n) / total);
}

/**
 * "820 / 1,000 WLD", or "3 / 5종".
 *
 * The space before a Latin unit is not decoration: 'WLD' is a word and reads
 * as one, while 종, 회 and 단계 are counters that attach to the number. A
 * figure that is not a whole count is refused rather than rendered, because
 * "NaN회" claims the member did NaN of something.
 */
export function goalFigure(goal: EarlyWeeklyGoal): string {
  if (!INTEGER.test(goal.goal_progress) || !INTEGER.test(goal.goal_target)) return '—';
  const separator = /^[A-Za-z]/.test(goal.goal_unit) ? ' ' : '';
  return `${groupDigits(goal.goal_progress)} / ${groupDigits(goal.goal_target)}${separator}${
    goal.goal_unit
  }`;
}

/**
 * Which stretch of time a goal is counted over.
 *
 * 'lifetime' exists because one of the four has no timestamp to window by --
 * `npc_relationships` records an affinity and not when it moved -- and a
 * standing total shown among three weekly ones would read as this week's work.
 */
export function goalWindowLabel(window: string): string {
  if (window === 'week') return '이번 주';
  if (window === 'lifetime') return '지금까지';
  return window;
}

/**
 * The warning that goes on the one goal a member can move by pressing a
 * button. Null for the three that are computed, so nothing is said where
 * there is nothing to warn about.
 */
export function goalCaveat(goal: EarlyWeeklyGoal): string | null {
  return goal.goal_self_reported
    ? '이 목표만 직접 받은 NPC 주문 기록으로 올라가요. 나머지 목표는 실제 작업·구매 기록으로 계산돼요.'
    : null;
}

/** A percentage for a collection, clamped to 0..100. Both figures are counts. */
export function collectionPercent(unlocked: number, total: number): number {
  if (!Number.isInteger(unlocked) || !Number.isInteger(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((unlocked / total) * 100)));
}

/** "3 / 10장" -- pages, which is what a 도감 is counted in. */
export function collectionFigure(collection: EarlyCollection): string {
  return `${groupDigits(String(collection.entry_unlocked))} / ${groupDigits(
    String(collection.entry_total),
  )}장`;
}

/**
 * What the book's reward is, and whether it has arrived.
 *
 * The title is granted by a trigger on the very work receipt or purchase that
 * fills the last page, so a complete book with no title is a defect rather
 * than a wait -- and the sentence says which of the two a member is looking at
 * instead of quietly reading the same either way.
 */
export function collectionRewardNote(collection: EarlyCollection): string {
  if (collection.reward_held) return `${collection.reward_note} · 받았어요`;
  if (collection.entry_unlocked >= collection.entry_total && collection.entry_total > 0) {
    return `${collection.reward_note} · 아직 표시되지 않았어요`;
  }
  return `${collection.reward_note} · 모두 모으면 받아요`;
}
