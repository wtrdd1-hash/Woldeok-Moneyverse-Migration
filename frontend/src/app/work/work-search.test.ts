import { describe, expect, it } from 'vitest';
import type { WorkTask } from './work';
import { filterWorkTasks, filterWorkTasksByMinReward } from './work-search';

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

describe('filterWorkTasks', () => {
  const tasks = [
    task(),
    task({
      task_id: '00000000-0000-4000-8000-000000000001',
      code: 'debug_service',
      name: '서비스 디버깅',
      description: '운영 오류를 분석하고 수정합니다.',
      job_type: 'developer',
    }),
  ];

  it('matches task names and descriptions case-insensitively', () => {
    expect(filterWorkTasks(tasks, '  DEBUG  ').map((item) => item.code)).toEqual(['debug_service']);
    expect(filterWorkTasks(tasks, '수확').map((item) => item.code)).toEqual(['farm_care']);
  });

  it('also matches stable task and career codes', () => {
    expect(filterWorkTasks(tasks, 'developer').map((item) => item.code)).toEqual(['debug_service']);
    expect(filterWorkTasks(tasks, 'farm_care').map((item) => item.code)).toEqual(['farm_care']);
  });

  it('returns the original list for blank search text', () => {
    expect(filterWorkTasks(tasks, '   ')).toBe(tasks);
  });
});


describe('work task minimum reward filter', () => {
  const tasks = [task({ reward_preview: '9007199254740993' }), task({ code: 'low', reward_preview: '25' }), task({ code: 'paused', reward_preview: null })];
  it('compares integer-string rewards without Number precision loss', () => {
    expect(filterWorkTasksByMinReward(tasks, '9007199254740993').map((t) => t.code)).toEqual(['farm_care']);
    expect(filterWorkTasksByMinReward(tasks, '26').map((t) => t.code)).toEqual(['farm_care']);
  });
  it('preserves the unfiltered list for the all selection', () => {
    expect(filterWorkTasksByMinReward(tasks, '')).toBe(tasks);
  });
  it('does not represent unavailable reward previews as eligible', () => {
    expect(filterWorkTasksByMinReward(tasks, '0').map((t) => t.code)).toEqual(['farm_care', 'low']);
  });
});
