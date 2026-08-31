import { describe, expect, it } from 'vitest';
import type { EventReceipt, FirstDayStep, TodayEvent } from './early-events';
import {
  claimMessage,
  eventBlockMessage,
  experienceNote,
  firstDaySummary,
  pendingEffectNote,
  rewardLine,
  stepFigure,
} from './early-events';

function event(overrides: Partial<TodayEvent> = {}): TodayEvent {
  return {
    event_date: '2026-08-31',
    event_code: 'lost_and_found',
    event_label: '분실물 발견',
    event_detail: '길에서 잃어버린 물건을 주웠어요.',
    claim_label: '돌려주기',
    reward_amount: '40',
    reward_experience: '0',
    experience_blocked: false,
    reward_item_name: null,
    reward_item_quantity: 0,
    pending_effect: '평판과 칭호 진행도',
    claimed: false,
    claimed_at: null,
    claim_transaction_id: null,
    claim_block: null,
    ...overrides,
  };
}

function step(overrides: Partial<FirstDayStep> = {}): FirstDayStep {
  return {
    step_code: 'job_sampler',
    step_label: '직업 체험 작업 해 보기',
    step_detail: '보상을 받은 작업의 직업 종류를 셉니다.',
    step_href: '/work',
    step_metric: 'job_sampler',
    step_verified: true,
    step_target: '4',
    step_progress: '2',
    step_unit: '종',
    step_done: false,
    ...overrides,
  };
}

describe('rewardLine', () => {
  it('names only the parts the event actually pays', () => {
    expect(rewardLine(event())).toBe('40 WLD');
    expect(rewardLine(event({ reward_amount: '25', reward_experience: '10' }))).toBe(
      '25 WLD · 경험치 10',
    );
    expect(
      rewardLine(
        event({
          reward_amount: '0',
          reward_item_name: '작업 에너지 음료',
          reward_item_quantity: 2,
        }),
      ),
    ).toBe('작업 에너지 음료 2개');
  });

  it('says nothing rather than zero when there is nothing left to pay', () => {
    expect(rewardLine(event({ reward_amount: '0', reward_experience: '0' }))).toBe('—');
  });
});

describe('eventBlockMessage', () => {
  it('tells a finished day apart from one that has not started', () => {
    expect(eventBlockMessage(event({ claim_block: 'claimed' }))).toContain('이미 받았어요');
    expect(eventBlockMessage(event({ claim_block: 'needs_work' }))).toContain('작업 보상');
    expect(eventBlockMessage(event())).toBeNull();
  });
});

describe('experienceNote', () => {
  it('explains a missing experience only where the event is still worth taking', () => {
    expect(experienceNote(event({ experience_blocked: true }))).toContain('경험치');
    // The block message already says this one; saying both tells a member twice.
    expect(
      experienceNote(event({ experience_blocked: true, claim_block: 'needs_work' })),
    ).toBeNull();
    expect(experienceNote(event())).toBeNull();
  });
});

describe('pendingEffectNote', () => {
  it('prints what the event does not do yet, and nothing when it does it all', () => {
    expect(pendingEffectNote(event())).toBe('아직 준비 중 · 평판과 칭호 진행도');
    expect(pendingEffectNote(event({ pending_effect: null }))).toBeNull();
  });
});

describe('claimMessage', () => {
  const receipt = (overrides: Partial<EventReceipt> = {}): EventReceipt => ({
    event_code: 'lost_and_found',
    event_label: '분실물 발견',
    reward_amount: '40',
    experience_amount: '0',
    item_name: null,
    item_quantity: 0,
    transaction_id: '00000000-0000-4000-8000-000000000000',
    replayed: false,
    ...overrides,
  });

  it('reports what was handed over', () => {
    expect(claimMessage(receipt())).toBe('분실물 발견 · 40 WLD 받았어요');
  });

  it('says a repeated request was heard without claiming a second payout', () => {
    expect(claimMessage(receipt({ replayed: true }))).toBe('이미 받은 사건이에요. 40 WLD 받았어요');
  });
});

describe('stepFigure', () => {
  it('counts a verified step and refuses to invent one for the others', () => {
    expect(stepFigure(step())).toBe('2 / 4종');
    expect(stepFigure(step({ step_unit: 'WLD', step_progress: '150', step_target: '300' }))).toBe(
      '150 / 300 WLD',
    );
    expect(stepFigure(step({ step_verified: false, step_target: '0', step_progress: '0' }))).toBeNull();
  });
});

describe('firstDaySummary', () => {
  it('counts only the steps something actually records', () => {
    expect(
      firstDaySummary([
        step({ step_code: 'profile_setup', step_done: true }),
        step({ step_code: 'economy_tutorial', step_verified: false }),
        step({ step_code: 'first_tool', step_done: false }),
      ]),
    ).toBe('기록으로 확인된 단계 1 / 2');
  });
});
