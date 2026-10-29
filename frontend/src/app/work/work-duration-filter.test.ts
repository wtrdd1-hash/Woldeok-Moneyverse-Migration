import { describe, expect, it } from 'vitest';
import { normalizedWorkDuration, workTasksApiPath } from './work-duration-filter';

describe('work duration selection and internal API routing', () => {
  it('keeps default full catalogue when no preset is selected', () => {
    expect(normalizedWorkDuration(undefined)).toBeNull();
    expect(workTasksApiPath(null)).toBe('/api/v1/work/tasks');
  });

  it.each(['60', '120', '180', '300', '600', '900'])(
    'forwards approved %s seconds exactly',
    (value) => {
      expect(normalizedWorkDuration(value)).toBe(value);
      expect(workTasksApiPath(value)).toBe(`/api/v1/work/tasks?maxDurationSeconds=${value}`);
    },
  );

  it.each(['0', '601', '01', '900&admin=true', 'Infinity', ''])(
    'never forwards unsupported %s',
    (value) => {
      expect(normalizedWorkDuration(value)).toBeNull();
    },
  );
});
