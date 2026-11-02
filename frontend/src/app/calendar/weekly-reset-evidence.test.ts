import { describe, expect, it } from 'vitest';
import { parseWeeklyResetEvidence } from './weekly-reset-evidence';

const now = new Date('2026-11-03T00:00:00.000Z');
const goal = (overrides: Record<string, unknown> = {}) => ({
  goal_code: 'weekly_tasks', goal_label: 'Weekly tasks', goal_detail: 'Work',
  goal_metric: 'distinct_work_tasks', goal_window: 'week',
  goal_target: '3', goal_progress: '1', goal_unit: 'times',
  goal_self_reported: false, goal_completed: false,
  week_start: '2026-11-02', ...overrides,
});
const envelope = (goals: unknown) => ({ goals, collections: [] });

describe('verified weekly calendar source', () => {
  it('keeps exact current KST Monday and next reset', () => {
    expect(parseWeeklyResetEvidence(envelope([goal()]), now)).toEqual({
      count: 1, weekStart: '2026-11-02', nextReset: '2026-11-08T15:00:00.000Z',
    });
  });
  it('distinguishes a verified empty catalogue from an unavailable source', () => {
    expect(parseWeeklyResetEvidence(envelope([]), now)).toEqual({ count: 0, weekStart: null, nextReset: null });
    expect(parseWeeklyResetEvidence({ collections: [] }, now)).toBeNull();
    expect(parseWeeklyResetEvidence({ goals: [] }, now)).toBeNull();
    expect(parseWeeklyResetEvidence(envelope({}), now)).toBeNull();
  });
  it('rejects malformed successful responses rather than counting invented goals', () => {
    expect(parseWeeklyResetEvidence(envelope([goal({ goal_target: 'not-a-number' })]), now)).toBeNull();
    expect(parseWeeklyResetEvidence(envelope([goal({ goal_completed: 'true' })]), now)).toBeNull();
    expect(parseWeeklyResetEvidence(envelope([goal({ goal_window: 'unknown' })]), now)).toBeNull();
    expect(parseWeeklyResetEvidence(envelope([goal({ week_start: '2026-11-31' })]), now)).toBeNull();
  });
  it('rejects duplicate goals and inconsistent or stale weeks', () => {
    expect(parseWeeklyResetEvidence(envelope([goal(), goal()]), now)).toBeNull();
    expect(parseWeeklyResetEvidence(envelope([goal(), goal({ goal_code: 'another', week_start: '2026-10-26' })]), now)).toBeNull();
    expect(parseWeeklyResetEvidence(envelope([goal({ week_start: '2026-10-26' })]), now)).toBeNull();
  });
  it('does not confuse lifetime NPC affinity with a weekly reset count', () => {
    expect(parseWeeklyResetEvidence(envelope([goal(), goal({ goal_code: 'npc', goal_window: 'lifetime' })]), now)?.count).toBe(1);
  });
  it('rejects oversized bigint strings and wrong weekday source claims', () => {
    expect(parseWeeklyResetEvidence(envelope([goal({ goal_target: '9'.repeat(20000) })]), now)).toBeNull();
    expect(parseWeeklyResetEvidence(envelope([goal({ week_start: '2026-11-01' })]), now)).toBeNull();
  });
  it('uses the Seoul week boundary rather than UTC Monday', () => {
    const sundayUtc = new Date('2026-11-01T15:01:00.000Z');
    expect(parseWeeklyResetEvidence(envelope([goal()]), sundayUtc)?.weekStart).toBe('2026-11-02');
  });
  it('rejects unbounded source rows', () => {
    expect(parseWeeklyResetEvidence(envelope(Array.from({ length: 33 }, (_, i) => goal({ goal_code: `goal_${i}` }))), now)).toBeNull();
  });
});
