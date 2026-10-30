import { describe, expect, it } from 'vitest';
import { isVerifiedAvailableWorkBoard } from './work-daily-availability';

const task = { task_id: '11111111-1111-4111-8111-111111111111', daily_limit: 2, taken_today: 1 };

describe('owner work daily availability response integrity', () => {
  it('accepts the authoritative board and unlimited daily quotas', () => {
    expect(isVerifiedAvailableWorkBoard({ featureState: 'enabled', tasks: [task] })).toBe(true);
    expect(
      isVerifiedAvailableWorkBoard({
        featureState: 'enabled',
        tasks: [{ ...task, daily_limit: 0, taken_today: 100 }],
      }),
    ).toBe(true);
  });
  it('fails closed on exhausted tasks, invalid actor-scoped rows and invented empty 200s', () => {
    expect(
      isVerifiedAvailableWorkBoard({
        featureState: 'enabled',
        tasks: [{ ...task, taken_today: 2 }],
      }),
    ).toBe(false);
    expect(
      isVerifiedAvailableWorkBoard({
        featureState: 'enabled',
        tasks: [{ ...task, task_id: 'not-a-uuid' }],
      }),
    ).toBe(false);
    expect(isVerifiedAvailableWorkBoard({ tasks: [] })).toBe(false);
    expect(
      isVerifiedAvailableWorkBoard({
        featureState: 'enabled',
        tasks: [{ ...task, taken_today: '0' }],
      }),
    ).toBe(false);
  });
});
