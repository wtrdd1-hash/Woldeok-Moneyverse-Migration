import { describe, expect, it } from 'vitest';
import { activityMinAmount, activityPeriodUrl, activityCursorUrl } from './period';
describe('wallet exact WLD minimum navigation', () => {
  it('preserves a canonical exact large WLD threshold across period and cursor links', () => {
    expect(activityMinAmount('900719925474099312345')).toBe('900719925474099312345');
    expect(activityPeriodUrl('30d', 'out', null, '900719925474099312345')).toBe('/wallet/activity?period=30d&direction=out&minAmount=900719925474099312345');
    expect(activityCursorUrl('all', 'signed.cursor', 'in', null, '900719925474099312345')).toContain('minAmount=900719925474099312345&cursor=signed.cursor');
  });
  it.each(['0', '01', '-1', '1.2', '1e3', '9'.repeat(31), ['1', '2']])('rejects unsafe input %s', (value) => {
    expect(() => activityMinAmount(value)).toThrow();
  });
});
