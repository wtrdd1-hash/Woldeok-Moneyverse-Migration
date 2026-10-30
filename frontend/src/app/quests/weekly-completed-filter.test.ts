import { describe, expect, it } from 'vitest';
import { isVerifiedCompletedGoalsBoard } from './weekly-completed-filter';

const goal = (overrides: Record<string, unknown> = {}) => ({
  goal_code: 'weekly_work', goal_label: 'Work', goal_detail: 'Verified work',
  goal_metric: 'work', goal_window: 'week', goal_target: '9007199254740993',
  goal_progress: '9007199254740993', goal_unit: 'WLD',
  goal_self_reported: false, goal_completed: true, week_start: '2026-10-26',
  ...overrides,
});

describe('completed weekly quest evidence', () => {
  it('accepts exact bigint-string evidence and untouched collections', () => {
    expect(isVerifiedCompletedGoalsBoard({ goals: [goal()], collections: [] })).toBe(true);
  });
  it('rejects uncompleted or forged 200 responses', () => {
    expect(isVerifiedCompletedGoalsBoard({ goals: [goal({ goal_completed: false })], collections: [] })).toBe(false);
    expect(isVerifiedCompletedGoalsBoard({ goals: [goal({ goal_completed: 'true' })], collections: [] })).toBe(false);
    expect(isVerifiedCompletedGoalsBoard({ goals: [goal({ goal_progress: Number('9007199254740993') })], collections: [] })).toBe(false);
    expect(isVerifiedCompletedGoalsBoard({ goals: [goal({ goal_progress: '1.2' })], collections: [] })).toBe(false);
    expect(isVerifiedCompletedGoalsBoard({ goals: [goal({ goal_progress: '1' })], collections: [] })).toBe(false);
  });
  it('rejects duplicate goal codes and malformed boards', () => {
    expect(isVerifiedCompletedGoalsBoard({ goals: [goal(), goal()], collections: [] })).toBe(false);
    expect(isVerifiedCompletedGoalsBoard({ goals: [], collections: null })).toBe(false);
  });
});
