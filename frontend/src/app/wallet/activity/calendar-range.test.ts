import { describe, expect, it } from 'vitest';
import { activityCalendarRange, activityCursorUrl, activityPeriodUrl } from './period';

const now = new Date('2026-10-30T04:00:00.000Z');
describe('wallet KST calendar range navigation', () => {
  it('accepts exact inclusive days and keeps the direction on previous pages', () => {
    const range = activityCalendarRange('2026-10-28', '2026-10-30', now);
    expect(range).toEqual({ from: '2026-10-28', to: '2026-10-30' });
    expect(activityPeriodUrl('all', 'out', range!)).toBe(
      '/wallet/activity?direction=out&from=2026-10-28&to=2026-10-30',
    );
    expect(activityCursorUrl('all', 'signed.cursor', 'out', range!)).toBe(
      '/wallet/activity?direction=out&from=2026-10-28&to=2026-10-30&cursor=signed.cursor',
    );
  });
  it.each([
    ['2026-02-29', '2026-03-01'],
    ['2026-10-31', '2026-10-31'],
    ['2026-10-30', '2026-10-29'],
    ['2025-01-01', '2026-10-30'],
    ['2026-10-29', undefined],
    [undefined, '2026-10-29'],
  ])(
    'rejects invalid or incomplete date filters without silently showing all activity',
    (from, to) => {
      expect(() => activityCalendarRange(from, to, now)).toThrow();
    },
  );
  it('retains legacy period links when no calendar range is selected', () => {
    expect(activityCalendarRange(undefined, undefined, now)).toBeNull();
    expect(activityPeriodUrl('30d', 'in')).toBe('/wallet/activity?period=30d&direction=in');
  });
});
