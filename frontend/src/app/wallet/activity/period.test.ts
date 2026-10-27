import { describe, expect, it } from 'vitest';
import { activityPeriod, activityPeriodUrl } from './period';

describe('wallet activity rolling periods', () => {
  it('accepts only all, 7d and 30d and never reflects arbitrary query strings', () => {
    expect(activityPeriod('7d')).toBe('7d');
    expect(activityPeriod('30d')).toBe('30d');
    expect(activityPeriod('all')).toBe('all');
    expect(activityPeriod(undefined)).toBe('all');
    expect(activityPeriod('7d&recent=100000')).toBe('all');
  });

  it('constructs canonical navigation without user-controlled URL injection', () => {
    expect(activityPeriodUrl('7d')).toBe('/wallet/activity?period=7d');
    expect(activityPeriodUrl('all')).toBe('/wallet/activity');
  });
});
