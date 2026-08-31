import { describe, expect, it } from 'vitest';
import type { EarlyCollection, EarlyWeeklyGoal } from './early-game';
import {
  collectionFigure,
  collectionPercent,
  collectionRewardNote,
  goalCaveat,
  goalFigure,
  goalPercent,
  goalWindowLabel,
} from './early-game';

function goal(overrides: Partial<EarlyWeeklyGoal> = {}): EarlyWeeklyGoal {
  return {
    goal_code: 'weekly_spend_or_save',
    goal_label: '1,000 WLD 소비 또는 저축',
    goal_detail: '이번 주에 쓴 금액과 저축한 금액을 합해서 셉니다.',
    goal_metric: 'spend_or_save',
    goal_window: 'week',
    goal_target: '1000',
    goal_progress: '820',
    goal_unit: 'WLD',
    goal_self_reported: false,
    goal_completed: false,
    week_start: '2026-08-31',
    ...overrides,
  };
}

function collection(overrides: Partial<EarlyCollection> = {}): EarlyCollection {
  return {
    book_code: 'starter_tools',
    book_label: '초보 도구 도감',
    book_detail: '일반 상점에서 산 초보 물건이 기록돼요.',
    reward_title: 'tool_collector',
    reward_note: '칭호 · 도구 수집가',
    reward_held: false,
    entry_total: 10,
    entry_unlocked: 3,
    entries: [],
    ...overrides,
  };
}

describe('goalPercent', () => {
  it('measures progress against the target', () => {
    expect(goalPercent('820', '1000')).toBe(82);
    expect(goalPercent('0', '1000')).toBe(0);
  });

  it('clamps a finished goal rather than drawing past the end of the bar', () => {
    expect(goalPercent('4000', '1000')).toBe(100);
  });

  /*
   * The spend goal sums `ledger_postings.amount`, a bigint. Number would round
   * silently past 2^53 and draw a bar from a figure nobody holds, which is the
   * exact mistake `lib/money.ts` exists to prevent.
   */
  it('measures a bigint week without going through Number', () => {
    expect(goalPercent('9007199254740993', '18014398509481984')).toBe(50);
  });

  it('draws nothing rather than guessing when a figure is not an integer', () => {
    expect(goalPercent('많이', '1000')).toBe(0);
    expect(goalPercent('100', '0')).toBe(0);
  });
});

describe('goalFigure', () => {
  // 'WLD' is a word and reads as one; 종 and 회 are counters and attach.
  it('spaces a Latin unit and joins a Korean counter', () => {
    expect(goalFigure(goal())).toBe('820 / 1,000 WLD');
    expect(goalFigure(goal({ goal_progress: '3', goal_target: '5', goal_unit: '종' }))).toBe(
      '3 / 5종',
    );
  });

  it('refuses a figure that is not a whole count', () => {
    expect(goalFigure(goal({ goal_progress: 'NaN' }))).toBe('—');
  });
});

describe('goalWindowLabel', () => {
  it('separates this week from a standing total', () => {
    expect(goalWindowLabel('week')).toBe('이번 주');
    expect(goalWindowLabel('lifetime')).toBe('지금까지');
  });

  it('keeps a window this build has not been taught rather than dropping it', () => {
    expect(goalWindowLabel('season')).toBe('season');
  });
});

describe('goalCaveat', () => {
  /*
   * The NPC goal moves on a button press that verifies nothing. Rendering it
   * exactly like three goals computed from receipts would claim a verification
   * this application does not perform.
   */
  it('warns on the goal a member can move themselves, and nowhere else', () => {
    expect(goalCaveat(goal({ goal_self_reported: true }))).toContain('직접');
    expect(goalCaveat(goal())).toBeNull();
  });
});

describe('collectionPercent and collectionFigure', () => {
  it('counts pages', () => {
    expect(collectionPercent(3, 10)).toBe(30);
    expect(collectionFigure(collection())).toBe('3 / 10장');
  });

  it('draws nothing for a book with no pages rather than dividing by zero', () => {
    expect(collectionPercent(0, 0)).toBe(0);
  });
});

describe('collectionRewardNote', () => {
  it('says the title has arrived, is still to come, or is missing', () => {
    expect(collectionRewardNote(collection({ reward_held: true }))).toContain('받았어요');
    expect(collectionRewardNote(collection())).toContain('모두 모으면');
    // A complete book grants its title from the trigger on the row that
    // completed it, so this state is a defect and reads as one.
    expect(collectionRewardNote(collection({ entry_unlocked: 10 }))).toContain(
      '아직 표시되지 않았어요',
    );
  });
});
