import { describe, expect, it } from 'vitest';
import type { EarlyUnlock } from './unlocks';
import {
  businessGate,
  businessGateNote,
  nextUnlock,
  unlockConditions,
  unlockState,
  unlockStateNote,
} from './unlocks';

function unlock(overrides: Partial<EarlyUnlock> = {}): EarlyUnlock {
  return {
    unlock_code: 'stall_business',
    unlock_label: '중고 판매대',
    unlock_detail: '레벨 5부터 살 수 있어요.',
    unlock_business_symbol: 'STALL',
    needs_job_level: 5,
    needs_account_days: 0,
    needs_work_completions: 0,
    is_enforced: true,
    unlocked: false,
    next_up: false,
    member_job_level: 2,
    member_account_days: 3,
    member_work_completions: 4,
    ...overrides,
  };
}

describe('unlockState', () => {
  it('reads an open rung as open whether or not anything enforces it', () => {
    expect(unlockState(unlock({ unlocked: true }))).toBe('unlocked');
    expect(unlockState(unlock({ unlocked: true, is_enforced: false }))).toBe('unlocked');
  });

  /*
   * The judgement this whole module exists for. 16.1 gates 기본 은행 예금 at
   * level 3 and nothing in the database refuses a deposit, so calling that
   * rung 잠김 would tell a member they cannot do something they can. It is the
   * plan, and it has to read as the plan.
   */
  it('never calls an unenforced rung locked', () => {
    expect(unlockState(unlock({ is_enforced: false }))).toBe('planned');
    expect(unlockState(unlock({ is_enforced: true }))).toBe('locked');
  });
});

describe('unlockStateNote', () => {
  it('says both halves of what an unenforced rung means', () => {
    const note = unlockStateNote(unlock({ is_enforced: false }));
    expect(note).toContain('지금도 이용할 수 있고');
    expect(note).toContain('앞으로');
  });
});

describe('unlockConditions', () => {
  it('puts the member’s own figure beside every condition', () => {
    const [condition] = unlockConditions(unlock());
    expect(condition?.label).toBe('직업 레벨');
    expect(condition?.value).toBe('5레벨 (지금 2레벨)');
    expect(condition?.met).toBe(false);
  });

  it('marks a condition the member已 meets as met', () => {
    const [condition] = unlockConditions(unlock({ member_job_level: 7 }));
    expect(condition?.met).toBe(true);
  });

  it('reports the loan rung’s two conditions in the order the bank tests them', () => {
    const conditions = unlockConditions(
      unlock({
        unlock_code: 'credit_c_loan',
        needs_job_level: 1,
        needs_account_days: 7,
        needs_work_completions: 10,
        member_account_days: 9,
        member_work_completions: 4,
      }),
    );
    expect(conditions.map((condition) => condition.key)).toEqual([
      'accountDays',
      'workCompletions',
    ]);
    expect(conditions[0]?.met).toBe(true);
    expect(conditions[1]?.value).toBe('10회 (지금 4회)');
  });

  // Every account satisfies these on the day it is made, and printing them as
  // something to reach says nothing at all.
  it('drops a condition that asks for nothing', () => {
    expect(unlockConditions(unlock({ needs_job_level: 1 }))).toEqual([]);
  });
});

describe('nextUnlock', () => {
  it('takes the rung the database marked, and answers null when none is', () => {
    const marked = unlock({ unlock_code: 'street_cart', next_up: true });
    expect(nextUnlock([unlock(), marked])?.unlock_code).toBe('street_cart');
    expect(nextUnlock([unlock()])).toBeNull();
  });
});

describe('businessGate', () => {
  const rung = (over: Partial<EarlyUnlock>): EarlyUnlock => ({
    unlock_code: 'stall_business',
    unlock_label: '중고 판매대',
    unlock_detail: '',
    unlock_business_symbol: 'STALL',
    needs_job_level: 5,
    needs_account_days: 0,
    needs_work_completions: 0,
    is_enforced: true,
    unlocked: false,
    next_up: false,
    member_job_level: 1,
    member_account_days: 0,
    member_work_completions: 0,
    ...over,
  });

  it('finds the rung that gates a business', () => {
    expect(businessGate([rung({})], 'STALL')?.unlock_code).toBe('stall_business');
  });

  it('is silent about a business no rung names', () => {
    expect(businessGate([rung({})], 'FARM')).toBeNull();
  });

  it('is silent once the rung is open', () => {
    expect(businessGate([rung({ unlocked: true })], 'STALL')).toBeNull();
  });

  // The mistake worth a test: a rung the database does not enforce must not
  // disable a purchase that would in fact succeed.
  it('does not gate on a rung nothing enforces', () => {
    expect(businessGate([rung({ is_enforced: false })], 'STALL')).toBeNull();
  });

  it('says both the requirement and where the member stands', () => {
    expect(businessGateNote(rung({}))).toBe('레벨 5부터 살 수 있어요. 지금은 레벨 1이에요.');
  });
});
