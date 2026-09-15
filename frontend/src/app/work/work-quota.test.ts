import { describe, expect, it } from 'vitest';
import { dailyQuotaLabel } from './work-quota';

describe('dailyQuotaLabel', () => {
  it('shows authoritative taken and daily-limit values in Korean', () => {
    expect(dailyQuotaLabel(1, 3, false)).toBe('오늘 1/3회 완료');
  });

  it('shows authoritative taken and daily-limit values in English', () => {
    expect(dailyQuotaLabel(2, 5, true)).toBe('Completed today: 2 / 5');
  });

  it('does not turn a reached quota into a disabled/spent state', () => {
    expect(dailyQuotaLabel(3, 3, false)).toBe('오늘 3/3회 완료');
  });
});
