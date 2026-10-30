import { describe, expect, it } from 'vitest';
import { normalizedWorkRewardCeiling, workTasksApiPath } from './work-duration-filter';

describe('member work reward ceiling on web', () => {
  it('keeps the default task board and existing duration selection', () => {
    expect(normalizedWorkRewardCeiling(undefined)).toBeNull();
    expect(workTasksApiPath(null, null)).toBe('/api/v1/work/tasks');
    expect(workTasksApiPath('300', null)).toBe('/api/v1/work/tasks?maxDurationSeconds=300');
  });

  it.each(['100', '200', '500', '1000', '2000', '5000', '10000'])(
    'sends only approved %s WLD preview ceilings', (value) => {
      expect(normalizedWorkRewardCeiling(value)).toBe(value);
      expect(workTasksApiPath('300', value)).toBe(`/api/v1/work/tasks?maxDurationSeconds=300&maxReward=${value}`);
    },
  );

  it.each(['0', '01', '999999999999999999', '100&admin=true', 'Infinity', ''])('rejects unsupported web preset %s', (raw) => {
    expect(normalizedWorkRewardCeiling(raw)).toBeNull();
  });
});
