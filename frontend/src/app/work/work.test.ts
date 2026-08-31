import { describe, expect, it } from 'vitest';
import type { WorkTask } from './work';
import {
  boardOrder,
  difficultyLabel,
  durationLabel,
  hasExpired,
  isOpen,
  isSpent,
  jobLabel,
  progressPercent,
  remaining,
  rewardSentence,
  secondsUntilSubmittable,
  statusLabel,
} from './work';

function task(overrides: Partial<WorkTask> = {}): WorkTask {
  return {
    task_id: '00000000-0000-4000-8000-000000000000',
    code: 'farm_care',
    name: '농장 관리',
    description: '재배와 수확 목표를 완료합니다.',
    job_type: 'farmer',
    difficulty: 2,
    base_reward: '80',
    base_experience: '14',
    minimum_duration_seconds: 600,
    daily_limit: 2,
    taken_today: 0,
    reward_preview: '80',
    recommended: false,
    ...overrides,
  };
}

describe('jobLabel', () => {
  it('names the five jobs 066 defines', () => {
    expect(jobLabel('farmer')).toBe('농부');
    expect(jobLabel('merchant')).toBe('상인');
  });

  it('renders a job this build has not been taught as itself', () => {
    expect(jobLabel('smith')).toBe('smith');
  });
});

describe('difficultyLabel', () => {
  it('names every level the CHECK allows', () => {
    expect([1, 2, 3, 4, 5].map(difficultyLabel)).toEqual([
      '아주 쉬움',
      '쉬움',
      '보통',
      '어려움',
      '아주 어려움',
    ]);
  });

  it('does not invent a name for a level outside the constraint', () => {
    expect(difficultyLabel(9)).toBe('9단계');
  });
});

describe('statusLabel and isOpen', () => {
  it('treats only an assignment the member can still act on as open', () => {
    const base = {
      assignment_id: 'a',
      task_id: 't',
      code: 'c',
      name: 'n',
      job_type: 'farmer',
      assigned_at: '2026-08-31T00:00:00.000Z',
      expires_at: '2026-09-01T00:00:00.000Z',
      reward_amount: null,
      experience_amount: null,
    };
    expect(isOpen({ ...base, status: 'assigned' })).toBe(true);
    expect(isOpen({ ...base, status: 'submitted' })).toBe(true);
    for (const status of ['approved', 'rejected', 'expired']) {
      expect(isOpen({ ...base, status })).toBe(false);
    }
  });

  it('names each status', () => {
    expect(statusLabel('approved')).toBe('지급 완료');
    expect(statusLabel('unheard_of')).toBe('unheard_of');
  });
});

describe('durationLabel', () => {
  it.each([
    [30, '30초'],
    [60, '1분'],
    [300, '5분'],
    [3600, '1시간'],
    [5400, '1시간 30분'],
  ])('says %i seconds as %s', (seconds, expected) => {
    expect(durationLabel(seconds)).toBe(expected);
  });
});

describe('secondsUntilSubmittable', () => {
  const assigned = '2026-08-31T00:00:00.000Z';

  it('counts down the minimum duration 067 enforces', () => {
    expect(secondsUntilSubmittable(assigned, 600, Date.parse(assigned))).toBe(600);
    expect(secondsUntilSubmittable(assigned, 600, Date.parse(assigned) + 599_000)).toBe(1);
  });

  it('is zero once the wait is over, never negative', () => {
    expect(secondsUntilSubmittable(assigned, 600, Date.parse(assigned) + 600_000)).toBe(0);
    expect(secondsUntilSubmittable(assigned, 600, Date.parse(assigned) + 86_400_000)).toBe(0);
  });

  // A malformed timestamp must not disable the button forever: the database
  // is the authority on whether a submission is early, and it will say so.
  it('does not hold the control back on an unparseable timestamp', () => {
    expect(secondsUntilSubmittable('not a time', 600, Date.now())).toBe(0);
  });
});

describe('hasExpired', () => {
  it('is true only once the expiry has passed', () => {
    const at = '2026-08-31T00:00:00.000Z';
    expect(hasExpired(at, Date.parse(at) - 1)).toBe(false);
    expect(hasExpired(at, Date.parse(at))).toBe(true);
  });

  it('treats an unparseable expiry as not expired', () => {
    expect(hasExpired('', Date.now())).toBe(false);
  });
});

describe('remaining and progressPercent', () => {
  it('reports what is left of a cap', () => {
    expect(remaining('120', '400')).toBe('280');
  });

  it('never reports a negative remainder when a cap has been lowered', () => {
    // The auto policy engine (092) can lower `daily_cap` after a member has
    // already been paid more than the new value.
    expect(remaining('500', '400')).toBe('0');
    expect(progressPercent('500', '400')).toBe(100);
  });

  it('reports zero rather than dividing by a cap of zero', () => {
    expect(progressPercent('0', '0')).toBe(0);
  });
});

describe('rewardSentence', () => {
  it('says the preview when it matches the catalogue price', () => {
    expect(rewardSentence(task())).toContain('80 WLD');
  });

  it('explains a preview cut by the repeat decay', () => {
    const sentence = rewardSentence(task({ reward_preview: '64' }));
    expect(sentence).toContain('64 WLD');
    expect(sentence).toContain('기본 80 WLD');
  });

  // The two facts that are not "you will be paid this much", and are not the
  // same as each other.
  it('separates a spent cap from rewards being switched off', () => {
    expect(rewardSentence(task({ reward_preview: '0' }))).toContain('모두 채웠어요');
    expect(rewardSentence(task({ reward_preview: null }))).toContain('멈춰 있어요');
  });
});

describe('isSpent', () => {
  it('is true once the day’s takes equal the limit 066 sets', () => {
    expect(isSpent(task({ taken_today: 1, daily_limit: 2 }))).toBe(false);
    expect(isSpent(task({ taken_today: 2, daily_limit: 2 }))).toBe(true);
  });
});

describe('boardOrder', () => {
  it('puts the day’s suggestions first without dropping the rest', () => {
    const tasks = [
      task({ code: 'a', recommended: false }),
      task({ code: 'b', recommended: true }),
      task({ code: 'c', recommended: false }),
      task({ code: 'd', recommended: true }),
    ];
    expect(boardOrder(tasks).map((entry) => entry.code)).toEqual(['b', 'd', 'a', 'c']);
  });

  it('does not mutate what it was given', () => {
    const tasks = [task({ code: 'a' }), task({ code: 'b', recommended: true })];
    boardOrder(tasks);
    expect(tasks.map((entry) => entry.code)).toEqual(['a', 'b']);
  });
});
