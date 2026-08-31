import { groupDigits } from '@/lib/money';

/**
 * 16.1's 초반 해금, and the one judgement this screen has to get right.
 *
 * A rung is in one of three states, and the third exists because the
 * specification describes locks this database does not keep. `enforced` is
 * false for those, and calling them 잠김 would put a rule on screen that the
 * application will not apply -- a member told they cannot deposit until level
 * 3 would simply be wrong, and would stop trying something that works. So an
 * unenforced rung reads as 예정 and never as a locked door.
 */

/** `public.early_game_unlocks` (101), as the API returns it. */
export interface EarlyUnlock {
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

export type UnlockState = 'unlocked' | 'locked' | 'planned';

export function unlockState(unlock: EarlyUnlock): UnlockState {
  if (unlock.unlocked) return 'unlocked';
  return unlock.is_enforced ? 'locked' : 'planned';
}

export const UNLOCK_STATE_LABELS: Readonly<Record<UnlockState, string>> = Object.freeze({
  unlocked: '열림',
  locked: '잠김',
  planned: '예정',
});

/**
 * One condition, with the member's own figure beside it.
 *
 * The figure is what turns a rung from a rule into a distance: "직업 레벨 5
 * (지금 2레벨)" tells a member how far they are, and it comes from the same
 * read that decided whether the rung is open, so the two cannot disagree.
 */
export interface UnlockCondition {
  readonly key: string;
  readonly label: string;
  readonly value: string;
  readonly met: boolean;
}

/**
 * What this rung asks for, in the words a member reads.
 *
 * A condition of one level, zero days or zero tasks is dropped: every account
 * satisfies it on the day it is made, and printing "직업 레벨 1레벨" as
 * something to reach says nothing. A rung with no conditions left is the first
 * one, and the card says so in words instead.
 */
export function unlockConditions(unlock: EarlyUnlock): readonly UnlockCondition[] {
  const conditions: UnlockCondition[] = [];

  if (unlock.needs_job_level > 1) {
    conditions.push({
      key: 'jobLevel',
      label: '직업 레벨',
      value: `${groupDigits(String(unlock.needs_job_level))}레벨 (지금 ${groupDigits(
        String(unlock.member_job_level),
      )}레벨)`,
      met: unlock.member_job_level >= unlock.needs_job_level,
    });
  }

  if (unlock.needs_account_days > 0) {
    conditions.push({
      key: 'accountDays',
      label: '가입 기간',
      value: `${groupDigits(String(unlock.needs_account_days))}일 (지금 ${groupDigits(
        String(unlock.member_account_days),
      )}일)`,
      met: unlock.member_account_days >= unlock.needs_account_days,
    });
  }

  if (unlock.needs_work_completions > 0) {
    conditions.push({
      key: 'workCompletions',
      label: '보상을 받은 작업',
      value: `${groupDigits(String(unlock.needs_work_completions))}회 (지금 ${groupDigits(
        String(unlock.member_work_completions),
      )}회)`,
      met: unlock.member_work_completions >= unlock.needs_work_completions,
    });
  }

  return conditions;
}

/**
 * The sentence a rung's state is explained with.
 *
 * The 예정 sentence is the important one. It says both halves of the truth --
 * this is the plan, and nothing is stopping you today -- because a member who
 * read only the first half would wait for something that has already happened.
 */
export function unlockStateNote(unlock: EarlyUnlock): string {
  switch (unlockState(unlock)) {
    case 'unlocked':
      return '지금 이용할 수 있어요.';
    case 'locked':
      return '조건을 채우면 열려요. 조건이 모자라면 요청이 거절돼요.';
    default:
      return '아직 잠금이 걸려 있지 않아요. 지금도 이용할 수 있고, 조건은 앞으로 적용될 목표예요.';
  }
}

/** The rung the member is working towards, or null when every lock is open. */
export function nextUnlock(unlocks: readonly EarlyUnlock[]): EarlyUnlock | null {
  return unlocks.find((unlock) => unlock.next_up) ?? null;
}
