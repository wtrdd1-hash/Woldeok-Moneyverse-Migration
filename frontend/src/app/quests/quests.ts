import { groupDigits } from '@/lib/money';

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
 * The goals, and the Korean they are read in.
 *
 * The dashboard sends a title with every goal, but the titles live in
 * `engagement_catalog` and they are English -- 'First wage', 'Weekly variety'
 * -- so the words a member reads are written here. A code this build has not
 * been taught keeps the API's own title rather than disappearing: a goal the
 * member is being asked to finish must be legible even when this file is a
 * migration behind.
 */
const GOAL_TITLES: Readonly<Record<string, string>> = Object.freeze({
  first_wage: '첫 급여',
  wise_spending: '알뜰한 소비',
  neighbour_help: '이웃 돕기',
  weekly_variety: '이번 주 다양하게',
  return_day_1: '다시 만난 첫날',
});

export function goalTitle(goal: EngagementGoal): string {
  const known = GOAL_TITLES[goal.code];
  if (known !== undefined) return known;
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

export const NPCS: readonly Npc[] = Object.freeze([
  {
    code: 'market_keeper',
    name: '시장 상인',
    errand: '가게에 들일 물건을 하루치씩 부탁해요.',
  },
  {
    code: 'courier',
    name: '배달원',
    errand: '이웃에게 갈 짐을 옮겨 달라고 해요.',
  },
]);

/** The NPC's Korean name, or the code itself for one this build has not been taught. */
export function npcName(code: string): string {
  return NPCS.find((npc) => npc.code === code)?.name ?? code;
}

/**
 * A count of things done, in the figures every other number on the screen is
 * written in. Grouped through `groupDigits` so 1,200 recorded steps read the
 * way an amount would, though this is a count and never an amount.
 *
 * Anything that is not a whole count is refused rather than rendered: a
 * missing figure printed as `NaN회` claims the member did NaN of something.
 */
export function progressLabel(progress: number): string {
  if (!Number.isInteger(progress) || progress < 0) return '—';
  return `${groupDigits(String(progress))}회`;
}

/**
 * Affinity, as points.
 *
 * The unit is this screen's, not the schema's -- `npc_relationships.affinity`
 * is a bare integer. It is added because Korean particles agree with the
 * sound of the preceding word: "친밀도가 2가" and "친밀도가 3이" would have to
 * be chosen per digit, while "2점이" and "3점이" never change.
 */
export function affinityLabel(affinity: number): string {
  if (!Number.isInteger(affinity) || affinity < 0) return '—';
  return `${groupDigits(String(affinity))}점`;
}

/**
 * The growth stages, in Korean.
 *
 * Deliberately the same four words /progression writes, and deliberately
 * copied rather than imported: no page in this application reaches into
 * another page's directory, and a vocabulary shared between two routes would
 * have to live in a module neither of them owns. Seven short lines duplicated
 * is the cheaper of the two.
 */
const STAGE_NAMES: Readonly<Record<string, string>> = Object.freeze({
  starter: '첫걸음',
  early: '성장 초기',
  middle: '성장 중기',
  advanced: '성장 후기',
});

export function stageLabel(code: string): string {
  return STAGE_NAMES[code] ?? code;
}

/** One line of "what the next stage asks for", ready to render. */
export interface RequirementLine {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

interface RequirementWords {
  readonly label: string;
  readonly unit: string;
}

const REQUIREMENT_LABELS: Readonly<Record<string, RequirementWords>> = Object.freeze({
  workCompletions: { label: '완료한 작업', unit: '회' },
  jobLevel: { label: '직업 레벨', unit: '레벨' },
  businesses: { label: '보유한 사업', unit: '개' },
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
): readonly RequirementLine[] {
  if (!requirements) return [];

  return Object.entries(requirements)
    .filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value > 0)
    .map(([key, value]) => {
      const known = REQUIREMENT_LABELS[key];
      const figure = groupDigits(String(value));
      return known === undefined
        ? { key, label: key, value: figure }
        : { key, label: known.label, value: `${figure}${known.unit}` };
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
export function progressMessage(receipt: ProgressReceipt): string {
  const count = progressLabel(receipt.progress);
  if (receipt.replayed) {
    return receipt.completed
      ? `이미 기록된 진행이에요. 이 목표는 달성했고, 지금까지 ${count} 기록되어 있어요.`
      : `이미 기록된 진행이에요. 지금까지 ${count} 기록되어 있어요.`;
  }
  return receipt.completed
    ? `목표를 달성했어요. 지금까지 ${count} 기록했어요.`
    : `진행을 기록했어요. 지금까지 ${count} 기록했어요.`;
}

/** What one order taken from an NPC is reported as. */
export function npcOrderMessage(receipt: NpcOrderReceipt): string {
  const name = npcName(receipt.npc_code);
  if (receipt.affinity === null) {
    return `이미 처리된 요청이에요. ${name}에게 쌓은 친밀도는 지금 확인할 수 없어요.`;
  }
  const affinity = affinityLabel(receipt.affinity);
  return receipt.replayed
    ? `이미 받아 둔 주문이에요. ${name}에게 쌓은 친밀도는 ${affinity}이에요.`
    : `${name}에게서 주문을 받았어요. 친밀도가 ${affinity}이 되었어요.`;
}

/** What the saved notification preference is reported as, read back from the answer. */
export function preferenceMessage(notificationsEnabled: boolean): string {
  return notificationsEnabled
    ? '목표와 주문 알림을 받도록 저장했어요.'
    : '목표와 주문 알림을 받지 않도록 저장했어요.';
}
