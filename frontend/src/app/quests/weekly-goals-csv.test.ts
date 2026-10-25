import { describe, expect, it } from 'vitest';
import { weeklyGoalsCsv } from './weekly-goals-csv';

const goal = {
  goal_code: 'weekly_work',
  goal_label: '=HYPERLINK("https://evil.test")',
  goal_detail: 'Verified work receipts',
  goal_metric: 'work_receipts',
  goal_window: 'week',
  goal_target: '999999999999999999999999999999',
  goal_progress: '123456789012345678901234567890',
  goal_unit: 'WLD',
  goal_self_reported: false,
  goal_completed: false,
  week_start: '2026-10-26',
};
describe('current-week quest snapshot CSV', () => {
  it('exports exact decimal strings and neutralizes formula text', () => {
    const csv = weeklyGoalsCsv({ scope: 'current_week_only', goals: [goal] });
    expect(csv).toContain('123456789012345678901234567890');
    expect(csv).toContain('999999999999999999999999999999');
    expect(csv).toContain('"\'=HYPERLINK(""https://evil.test"")"');
    expect(csv).toContain('current-week snapshot, not a payout receipt');
  });
  it('distinguishes self-reported NPC progress', () => {
    const csv = weeklyGoalsCsv({ scope: 'current_week_only', goals: [{ ...goal, goal_self_reported: true }] });
    expect(csv).toContain('"self-reported NPC order"');
  });
  it('refuses unverified, oversized or mixed-week data', () => {
    expect(() => weeklyGoalsCsv({ scope: 'all_history', goals: [] })).toThrow();
    expect(() => weeklyGoalsCsv({ scope: 'current_week_only', goals: Array(13).fill(goal) })).toThrow();
    expect(() => weeklyGoalsCsv({ scope: 'current_week_only', goals: [{ ...goal, goal_progress: '1e25' }] })).toThrow();
    expect(() => weeklyGoalsCsv({ scope: 'current_week_only', goals: [goal, { ...goal, goal_code: 'other', week_start: '2026-10-19' }] })).toThrow();
    expect(() => weeklyGoalsCsv({ scope: 'current_week_only', goals: [{ ...goal, goal_window: 'fiction' }] })).toThrow();
    expect(() => weeklyGoalsCsv({ scope: 'current_week_only', goals: [{ ...goal, goal_completed: 'yes' }] })).toThrow();
  });
  it('does not confuse an empty current week with an API error', () => {
    const csv = weeklyGoalsCsv({ scope: 'current_week_only', goals: [] });
    expect(csv).toContain('Goal code');
  });
});
