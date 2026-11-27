import { pick } from '@/lib/copy';
import type { Locale } from '@/lib/locale';
import { groupDigits } from '@/lib/money';
import { COPY, fill } from './copy';

/*
 * Every helper here takes the member's locale last and defaults it to Korean, the
 * carried-over product copy the tests read; the page and the actions always pass
 * the request locale.
 */

/**
 * The engagement loop's pure vocabulary.
 *
 * The page and its parts read the board through it, and the server actions
 * turn a receipt into a sentence with it. It carries no `server-only` and
 * touches neither the network nor the clock, so a client control that later
 * needs to name an NPC can import it as it stands.
 */

/**
 * One entry of `today_tasks` or `weekly_goals`, as
 * `member_engagement_dashboard` builds it with jsonb_build_object:
 * packages/database/migrations/082-engagement-loop-functions.sql.
 *
 * `progress` is a count of things done, held in an `integer` column. It is
 * not money -- nothing in this feature posts to the ledger -- so a number is
 * the right type for it. The rule this product enforces is that a balance
 * never becomes a Number, and there is no balance on this screen.
 */
export interface EngagementGoal {
  readonly code: string;
  readonly title: string;
  readonly progress: number;
}

/**
 * The `next_unlock` object, or null. Null carries two facts at once: the
 * member is at the top stage, or they have no `user_progression` row yet and
 * the function's scalar subquery found nothing. The screen says both.
 */
export interface EngagementNextUnlock {
  readonly stage: string;
  readonly requirements: Readonly<Record<string, number>> | null;
}

/** `GET /api/v1/engagement`, which returns the dashboard row unenveloped. */
export interface EngagementBoard {
  readonly today_tasks: readonly EngagementGoal[];
  readonly weekly_goals: readonly EngagementGoal[];
  readonly next_unlock: EngagementNextUnlock | null;
  readonly notifications_enabled: boolean;
}

/** The receipt `POST /api/v1/engagement/goals/{code}/progress` answers with. */
export interface ProgressReceipt {
  readonly code: string;
  readonly progress: number;
  readonly completed: boolean;
  readonly replayed: boolean;
}

/**
 * The receipt `POST /api/v1/engagement/npcs/{code}/orders` answers with.
 *
 * `affinity` is null on one path only: a replayed key that was spent on
 * something other than an order with this NPC leaves no relationship to read
 * back. "No relationship was found for this key" is not the same fact as "the
 * relationship stands at zero", so it is not defaulted to one.
 */
export interface NpcOrderReceipt {
  readonly npc_code: string;
  readonly affinity: number | null;
  readonly replayed: boolean;
}

/**
 * The goals, and the words they are read in.
 *
 * The dashboard sends a title with every goal, but the titles live in
 * `engagement_catalog` and they are English -- 'First wage', 'Weekly variety'
 * -- so the words a member reads are written here. A code this build has not
 * been taught keeps the API's own title rather than disappearing: a goal the
 * member is being asked to finish must be legible even when this file is a
 * migration behind.
 */
const GOAL_TITLES: Readonly<Record<string, (typeof COPY)[keyof typeof COPY]>> = Object.freeze({
  first_wage: COPY.goalFirstWage,
  wise_spending: COPY.goalWiseSpending,
  neighbour_help: COPY.goalNeighbourHelp,
  weekly_variety: COPY.goalWeeklyVariety,
  return_day_1: COPY.goalReturnDay1,
});

export function goalTitle(goal: EngagementGoal, locale: Locale = 'ko'): string {
  const known = GOAL_TITLES[goal.code];
  if (known !== undefined) return pick(locale, known);
  return goal.title.trim() === '' ? goal.code : goal.title;
}

/**
 * The NPCs a member can take an order from.
 *
 * Written here because no API answers for them. `npc_profiles` is revoked
 * from the application role and 082 grants no reader, so the codes an order
 * is placed against cannot be fetched -- the same position the growth stages
 * are in on /progression, and the same answer.
 *
 * The consequence is stated rather than hidden: if an operator deactivates
 * one of these, the button stays on screen and the order is refused with the
 * sentence the action falls back to. That is a worse day than a directory
 * would give, and a much better one than a section that can never do
 * anything.
 */
export interface Npc {
  readonly code: string;
  readonly name: string;
  readonly errand: string;
}

const NPC_COPY = Object.freeze([
  { code: 'market_keeper', name: COPY.npcMarketKeeperName, errand: COPY.npcMarketKeeperErrand },
  { code: 'courier', name: COPY.npcCourierName, errand: COPY.npcCourierErrand },
]);

/** The NPCs, in the member's language. */
export function npcs(locale: Locale = 'ko'): readonly Npc[] {
  return NPC_COPY.map((npc) => ({ code: npc.code, name: pick(locale, npc.name), errand: pick(locale, npc.errand) }));
}

export const NPCS: readonly Npc[] = Object.freeze(npcs('ko'));

/** The NPC's name, or the code itself for one this build has not been taught. */
export function npcName(code: string, locale: Locale = 'ko'): string {
  return npcs(locale).find((npc) => npc.code === code)?.name ?? code;
}

/**
 * A count of things done, in the figures every other number on the screen is
 * written in. Grouped through `groupDigits` so 1,200 recorded steps read the
 * way an amount would, though this is a count and never an amount.
 *
 * Anything that is not a whole count is refused rather than rendered: a
 * missing figure printed as `NaN회` claims the member did NaN of something.
 */
export function progressLabel(progress: number, locale: Locale = 'ko'): string {
  if (!Number.isInteger(progress) || progress < 0) return '—';
  return fill(pick(locale, COPY.countTimes), { n: groupDigits(String(progress)) });
}

/**
 * Affinity, as points.
 *
 * The unit is this screen's, not the schema's -- `npc_relationships.affinity`
 * is a bare integer. It is added because Korean particles agree with the
 * sound of the preceding word: "친밀도가 2가" and "친밀도가 3이" would have to
 * be chosen per digit, while "2점이" and "3점이" never change.
 */
export function affinityLabel(affinity: number, locale: Locale = 'ko'): string {
  if (!Number.isInteger(affinity) || affinity < 0) return '—';
  return fill(pick(locale, COPY.affinityPoints), { n: groupDigits(String(affinity)) });
}

/**
 * The growth stages, in the member's language.
 *
 * Deliberately the same four words /progression writes, and deliberately
 * copied rather than imported: no page in this application reaches into
 * another page's directory, and a vocabulary shared between two routes would
 * have to live in a module neither of them owns. Seven short lines duplicated
 * is the cheaper of the two.
 */
const STAGE_NAMES: Readonly<Record<string, (typeof COPY)[keyof typeof COPY]>> = Object.freeze({
  starter: COPY.stageStarter,
  early: COPY.stageEarly,
  middle: COPY.stageMiddle,
  advanced: COPY.stageAdvanced,
});

export function stageLabel(code: string, locale: Locale = 'ko'): string {
  const known = STAGE_NAMES[code];
  return known === undefined ? code : pick(locale, known);
}

/** One line of "what the next stage asks for", ready to render. */
export interface RequirementLine {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

interface RequirementWords {
  readonly label: (typeof COPY)[keyof typeof COPY];
  /** The figure with its unit, as a `{n}` template: units sit on different sides per language. */
  readonly value: (typeof COPY)[keyof typeof COPY];
}

const REQUIREMENT_LABELS: Readonly<Record<string, RequirementWords>> = Object.freeze({
  workCompletions: { label: COPY.reqWorkCompletions, value: COPY.reqWorkCompletionsValue },
  jobLevel: { label: COPY.reqJobLevel, value: COPY.reqJobLevelValue },
  businesses: { label: COPY.reqBusinesses, value: COPY.reqBusinessesValue },
});

/**
 * The next stage's unlock requirements, in the words a member reads.
 *
 * Every value is a count -- finished tasks, a job level, owned businesses --
 * and never an amount of WLD. A requirement of zero is dropped, because
 * printing "완료한 작업 0회" as a condition to meet says nothing, and an
 * unrecognised key survives under its own name: a condition the member cannot
 * see is one they cannot meet.
 */
export function unlockLines(
  requirements: Readonly<Record<string, number>> | null,
  locale: Locale = 'ko',
): readonly RequirementLine[] {
  if (!requirements) return [];

  return Object.entries(requirements)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value > 0)
    .map(([key, value]) => {
      const known = REQUIREMENT_LABELS[key];
      const figure = groupDigits(String(value));
      return known === undefined
        ? { key, label: key, value: figure }
        : { key, label: pick(locale, known.label), value: fill(pick(locale, known.value), { n: figure }) };
    });
}

/**
 * What one recorded step of progress is reported as.
 *
 * Every figure comes from the receipt rather than from the form: a replay
 * answers with the stored row, whose count is whatever the first call left
 * behind. `completed` is reported even on a replay, because a member pressing
 * the button again is most often asking whether the goal is finished.
 */
export function progressMessage(receipt: ProgressReceipt, locale: Locale = 'ko'): string {
  const count = progressLabel(receipt.progress, locale);
  const template = receipt.replayed
    ? (receipt.completed ? COPY.progressReplayedCompleted : COPY.progressReplayed)
    : (receipt.completed ? COPY.progressCompleted : COPY.progressRecorded);
  return fill(pick(locale, template), { count });
}

/** What one order taken from an NPC is reported as. */
export function npcOrderMessage(receipt: NpcOrderReceipt, locale: Locale = 'ko'): string {
  const name = npcName(receipt.npc_code, locale);
  if (receipt.affinity === null) {
    return fill(pick(locale, COPY.orderAffinityUnknown), { name });
  }
  const affinity = affinityLabel(receipt.affinity, locale);
  return fill(pick(locale, receipt.replayed ? COPY.orderReplayed : COPY.orderTaken), { name, affinity });
}

/** What the saved notification preference is reported as, read back from the answer. */
export function preferenceMessage(notificationsEnabled: boolean, locale: Locale = 'ko'): string {
  return pick(locale, notificationsEnabled ? COPY.preferenceOn : COPY.preferenceOff);
}
