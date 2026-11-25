import { describe, expect, it } from 'vitest';
import { isEarlyGameBoard, isEngagementBoard, readFirstDaySteps, readTodayEvent } from './early-events-reader';

/**
 * Production regression 2026-11-25 (frontend-errors.log, /quests): "Cannot
 * destructure property 'auth' of 'e'" — next/link got href=undefined because
 * Spring's EarlyGameController answers hard-coded `{ step, title, completed }`
 * rows instead of public.early_first_day_flow rows. Its /today answer is also a
 * fabricated "50,000 WLD" event. Neither may reach the screen.
 */
const STEP = {
  step_code: 'first_trade', step_label: '첫 매수', step_detail: '거래소에서 한 주 사기', step_href: '/stocks',
  step_metric: 'trades', step_verified: true, step_target: '1', step_progress: '0', step_unit: '회', step_done: false,
};
const EVENT = {
  event_date: '2026-11-25', event_code: 'rain', event_label: '비 오는 날', event_detail: '...', claim_label: '받기',
  reward_amount: '40', reward_experience: '20', experience_blocked: false, reward_item_name: null,
  reward_item_quantity: 0, pending_effect: null, claimed: false, claimed_at: null, claim_transaction_id: null, claim_block: null,
};

describe('early-game readers', () => {
  it('keeps database first-day rows', () => {
    expect(readFirstDaySteps({ steps: [STEP] })).toEqual([STEP]);
  });
  it('rejects the Spring placeholder rows (no step_href) instead of rendering a broken link', () => {
    expect(readFirstDaySteps({ steps: [{ step: 1, title: '계정 생성 및 프로필 설정', completed: true }] })).toBeNull();
  });
  it('rejects an internal or external href that is not a site path', () => {
    expect(readFirstDaySteps({ steps: [{ ...STEP, step_href: 'https://evil.example' }] })).toBeNull();
  });
  it('keeps a database event and an explicit "no event today"', () => {
    expect(readTodayEvent({ event: EVENT })).toEqual({ event: EVENT });
    expect(readTodayEvent({ event: null })).toEqual({ event: null });
  });
  it('rejects the Spring "50,000 WLD" placeholder event', () => {
    expect(readTodayEvent({ event: { id: 'early-event-x', name: '첫 날의 출석 보너스', rewardWld: 50000, isClaimed: false } })).toBeNull();
  });
  it('rejects the Spring streak status where the engagement dashboard is expected', () => {
    expect(isEngagementBoard({ currentStreak: 3, claimedToday: false })).toBe(false);
    expect(isEngagementBoard({ today_tasks: [], weekly_goals: [], next_unlock: null, notifications_enabled: true })).toBe(true);
    expect(isEarlyGameBoard({ goals: [], collections: [] })).toBe(true);
    expect(isEarlyGameBoard({ status: 404 })).toBe(false);
  });
});
