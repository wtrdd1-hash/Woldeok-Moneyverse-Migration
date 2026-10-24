import { describe, expect, it } from 'vitest';
import { activityCategory, activityCategoryHref, ACTIVITY_CATEGORIES } from './category';

describe('wallet activity category navigation', () => {
  it('allows only known categories from untrusted URL search params', () => {
    expect(activityCategory('rewards')).toBe('rewards');
    expect(activityCategory('banking')).toBe('banking');
    expect(activityCategory('all')).toBe('all');
    expect(activityCategory('invalid')).toBe('all');
    expect(activityCategory(['rewards', 'other'])).toBe('all');
    expect(activityCategory(undefined)).toBe('all');
  });
  it('uses safe stable member-only URLs without reflecting unknown query strings', () => {
    expect(activityCategoryHref('all')).toBe('/wallet/activity');
    expect(activityCategoryHref('markets')).toBe('/wallet/activity?category=markets');
    expect(ACTIVITY_CATEGORIES.map((item) => item.value)).toEqual([
      'all', 'rewards', 'transfers', 'banking', 'purchases', 'markets', 'other',
    ]);
  });
});
