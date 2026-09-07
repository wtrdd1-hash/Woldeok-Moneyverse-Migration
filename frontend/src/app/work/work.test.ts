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
    experience_preview: '14',
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
    [61, '1분 1초'],
    [779, '12분 59초'],
    [300, '5분'],
    [3600, '1시간'],
    [3661, '1시간 1분 1초'],
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
  it('states both WLD and proficiency EXP for the exact server preview', () => {
    const sentence = rewardSentence(task());
    expect(sentence).toContain('80 WLD');
    expect(sentence).toContain('14 EXP');
  });

  it('explains when a career-level bonus changes the actual payout', () => {
    const sentence = rewardSentence(task({ reward_preview: '84', experience_preview: '15' }));
    expect(sentence).toContain('84 WLD');
    expect(sentence).toContain('15 EXP');
    expect(sentence).toContain('직업 레벨 보너스');
  });

  it('says payouts are paused when either authoritative preview is unavailable', () => {
    expect(rewardSentence(task({ reward_preview: null }))).toContain('일시 중지');
    expect(rewardSentence(task({ experience_preview: null }))).toContain('일시 중지');
  });
});

describe('isSpent', () => {
  it('never marks repeatable work as spent', () => {
    expect(isSpent(task({ taken_today: 1, daily_limit: 2 }))).toBe(false);
    expect(isSpent(task({ taken_today: 2, daily_limit: 2 }))).toBe(false);
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

  it('floats active job tasks to the top without quota-based reordering', () => {
    const tasks = [
      task({ code: 'other_rec', job_type: 'miner', recommended: true }),
      task({ code: 'my_spent', job_type: 'detective', daily_limit: 3, taken_today: 3 }),
      task({ code: 'my_unspent', job_type: 'detective', daily_limit: 3, taken_today: 1 }),
      task({ code: 'other_norm', job_type: 'miner', recommended: false }),
    ];
    expect(boardOrder(tasks, 'detective').map((entry) => entry.code)).toEqual([
      'my_spent',
      'my_unspent',
      'other_rec',
      'other_norm',
    ]);
  });

  it('does not mutate what it was given', () => {
    const tasks = [task({ code: 'a' }), task({ code: 'b', recommended: true })];
    boardOrder(tasks);
    expect(tasks.map((entry) => entry.code)).toEqual(['a', 'b']);
  });
});
