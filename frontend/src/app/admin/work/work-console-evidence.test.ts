import { describe, expect, it } from 'vitest';
import { parseAdminWorkConsole } from './work-console-evidence';

const task = {
  task_id: '11111111-1111-4111-8111-111111111111', code: 'farmer-harvest',
  name: 'Harvest', job_type: 'farmer', difficulty: 2, base_reward: '9007199254740993',
  base_experience: '10', minimum_duration_seconds: 60, daily_limit: 5, active: true,
  open_assignment_count: '1', awaiting_verification_count: '0', approved_24h: '2',
  rejected_24h: '0', paid_24h: '9007199254740993', last_assigned_at: '2026-10-27T15:00:00.000Z',
};
const job = {
  job_type: 'farmer', member_count: '2', average_level: '2.50', top_level: 3,
  total_experience: '9007199254740993', active_7d_count: '1',
};
const policy = {
  policy_id: 1, effective_at: '2026-10-27T15:00:00.000Z', daily_cap: '5000',
  weekly_cap: '10000', repeat_decay_percent: 10, enabled: true, reason: 'Active policy',
  active_task_count: '1', open_assignment_count: '1', awaiting_verification_count: '0',
  paid_24h: '9007199254740993', members_paid_24h: '2', experience_24h: '10',
};
const response = { catalogue: [task], jobLevels: [job], policy };

describe('admin work console PostgreSQL evidence boundary', () => {
  it('accepts verified catalogue, job levels and policy without coercing bigint WLD', () => {
    expect(parseAdminWorkConsole(response)?.catalogue[0]?.base_reward).toBe('9007199254740993');
  });
  it('accepts an explicitly absent policy but never fabricates an enabled version', () => {
    const absent = { ...policy, policy_id: null, effective_at: null, daily_cap: null,
      weekly_cap: null, repeat_decay_percent: null, enabled: null, reason: null };
    expect(parseAdminWorkConsole({ ...response, policy: absent })?.policy.enabled).toBeNull();
  });
  it.each([null, {}, { ...response, catalogue: null }, { ...response, jobLevels: 'none' },
    { ...response, policy: null }, { ...response, catalogue: [task, task] },
    { ...response, jobLevels: [job, job] }])('rejects absent or duplicate evidence %#', (value) => {
    expect(parseAdminWorkConsole(value)).toBeNull();
  });
  it.each([
    { ...task, task_id: 'not-a-uuid' }, { ...task, base_reward: Number.MAX_SAFE_INTEGER + 2 },
    { ...task, paid_24h: '1e5' }, { ...task, open_assignment_count: '-1' },
    { ...task, daily_limit: -1 }, { ...task, minimum_duration_seconds: Number.NaN },
    { ...task, active: 'true' }, { ...task, last_assigned_at: 'not-a-date' },
  ])('rejects unsafe catalogue rows %#', (bad) => {
    expect(parseAdminWorkConsole({ ...response, catalogue: [bad] })).toBeNull();
  });
  it.each([
    { ...job, member_count: '-1' }, { ...job, average_level: Number.NaN },
    { ...job, active_7d_count: '3' }, { ...job, total_experience: 'Infinity' },
    { ...job, top_level: -1 },
  ])('rejects invalid job-level evidence %#', (bad) => {
    expect(parseAdminWorkConsole({ ...response, jobLevels: [bad] })).toBeNull();
  });
  it.each([
    { ...policy, policy_id: null }, { ...policy, policy_id: -1 },
    { ...policy, enabled: 'true' }, { ...policy, repeat_decay_percent: 101 },
    { ...policy, daily_cap: '-1' }, { ...policy, paid_24h: '9007199254740993.5' },
    { ...policy, effective_at: '2026-02-30' }, { ...policy, members_paid_24h: 'NaN' },
  ])('rejects invalid or inconsistent policy evidence %#', (bad) => {
    expect(parseAdminWorkConsole({ ...response, policy: bad })).toBeNull();
  });
});
