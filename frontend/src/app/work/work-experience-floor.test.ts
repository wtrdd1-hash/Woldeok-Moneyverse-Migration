import { describe, expect, it } from 'vitest';
import { normalizedWorkExperienceFloor, workTasksApiPath } from './work-duration-filter';
import { isVerifiedWorkExperienceFloor } from '@/lib/work-experience-floor';

const task = (experience_preview: unknown) => ({ task_id: '11111111-1111-4111-8111-111111111111', experience_preview });

describe('member work preview EXP filter', () => {
  it('keeps default and combines existing server filters', () => {
    expect(workTasksApiPath(null)).toBe('/api/v1/work/tasks');
    expect(workTasksApiPath('300', '1000', true, '50')).toBe('/api/v1/work/tasks?maxDurationSeconds=300&maxReward=1000&availableOnly=1&minExperience=50');
  });
  it.each(['10', '25', '50', '100', '250', '500'])('forwards approved %s EXP preset', (value) => {
    expect(normalizedWorkExperienceFloor(value)).toBe(value);
    expect(workTasksApiPath(null, null, false, value)).toBe(`/api/v1/work/tasks?minExperience=${value}`);
  });
  it.each(['0', '01', 'Infinity', '10&admin=true', '999999999999999999', '', ['50', '100']])('rejects unsupported web preset %s', (raw) => {
    expect(normalizedWorkExperienceFloor(raw)).toBeNull();
  });
  it('accepts only verified numeric preview rows meeting floor; rejects stale HTTP 200 payload', () => {
    expect(isVerifiedWorkExperienceFloor({ featureState: 'enabled', tasks: [task('9007199254740993')] }, '9007199254740993')).toBe(true);
    expect(isVerifiedWorkExperienceFloor({ featureState: 'enabled', tasks: [task('49')] }, '50')).toBe(false);
    expect(isVerifiedWorkExperienceFloor({ featureState: 'enabled', tasks: [task(null)] }, '50')).toBe(false);
    expect(isVerifiedWorkExperienceFloor({ featureState: 'enabled', tasks: [task(50)] }, '50')).toBe(false);
    expect(isVerifiedWorkExperienceFloor({ tasks: [] }, '50')).toBe(false);
    expect(isVerifiedWorkExperienceFloor({ featureState: 'enabled', tasks: [] }, '50')).toBe(true);
  });
});
