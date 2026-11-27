import { describe, expect, it } from 'vitest';
import { dateStampText } from './game-date-stamp';
import { parseGameClock } from '@/lib/game-calendar';

const clock = parseGameClock({
  dayIndex: 10465, weekIndex: 1495, dayOfWeek: 1, realSecondsPerDay: 600, gameDaysPerWeek: 7,
  dayStartedAt: '2026-11-26T07:10:00Z', dayEndsAt: '2026-11-26T07:20:00Z', weekStartedAt: '2026-11-26T07:10:00Z',
  dayKey: '2028-08-26', weekKey: '2028-08-26', calendarVersion: 'v2026.11.26.GAMEYEAR.2', gameYear: 29, dayOfYear: 246,
  gameDaysPerYear: 365, yearStartedAt: '2026-11-24T14:20:00Z', yearEndsAt: '2026-11-27T03:10:00Z', observedAt: '2026-11-26T07:14:00Z',
})!;
const now = Date.parse('2026-11-26T07:15:00Z');

// Browser QA 2026-11-26: the live top bar renders this stamp, which was Korean-only and showed
// no server year. It now shows the API year in the reader's language (I18N-01, GAMEYEAR.4).
describe('game date stamp text', () => {
  it('shows the API year and week in English without Korean text', () => {
    const t = dateStampText('en', clock, now);
    expect(t.desktopLine).toBe('Y29 · D246 · Week 1,496 · Day 1/7');
    expect(t.compactLine).toBe('D246');
    expect(t.aria).toContain('Moneyverse Year 29 · Day 246');
    expect(t.aria).toContain('05:00');
    for (const v of Object.values(t)) expect(v).not.toMatch(/[가-힣]/);
  });

  it('keeps Korean for Korean readers and covers every locale', () => {
    expect(dateStampText('ko', clock, now).desktopLine).toBe('29년 · 246일차 · 1,496주차 · 1일째');
    expect(dateStampText('ko', clock, now).compactLine).toBe('246일차');
    for (const l of ['ja', 'zh', 'vi']) {
      for (const v of Object.values(dateStampText(l, clock, now))) expect(v).not.toMatch(/[가-힣]/);
    }
  });

  it('without a certified year it shows the week only and never invents a year', () => {
    const noYear = { ...clock, year: null };
    const t = dateStampText('en', noYear, now);
    expect(t.desktopLine).toBe('Week 1,496 · Day 1/7');
    expect(t.compactLine).toBe('Day 1/7');
  });
});
