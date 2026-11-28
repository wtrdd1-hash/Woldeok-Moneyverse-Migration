import { describe, expect, it } from 'vitest';
import { serverClockText } from './server-clock-pill';
import { parseGameClock } from '@/lib/game-calendar';

const base = {
  dayIndex: 437, weekIndex: 62, dayOfWeek: 3, realSecondsPerDay: 600, gameDaysPerWeek: 7,
  dayStartedAt: '2026-11-26T06:00:00Z', dayEndsAt: '2026-11-26T06:10:00Z', weekStartedAt: '2026-11-26T05:40:00Z',
  dayKey: '2027-03-14', weekKey: '2027-03-12',
};
const year = { gameYear: 2, dayOfYear: 73, gameDaysPerYear: 365, yearStartedAt: '2026-11-20T00:00:00Z',
  yearEndsAt: '2026-12-20T20:50:00Z', observedAt: '2026-11-26T06:05:00Z', calendarVersion: 'gameyear-v1' };

// GAMEYEAR.4: the header, mobile menu and dashboard show the API's year and day-of-year.
describe('server clock text', () => {
  it('shows the certified year and the week in every supported locale', () => {
    const clock = parseGameClock({ ...base, ...year });
    expect(clock).not.toBeNull();
    expect(serverClockText('en', clock!)).toEqual({ year: 'Y2 · D73', week: 'Week 63 · Day 3/7' });
    expect(serverClockText('ko', clock!).year).toBe('2년 · 73일차');
    expect(serverClockText('ja', clock!).year).toBe('2年 · 73日目');
    expect(serverClockText('zh', clock!).year).toBe('2年 · 第73天');
    expect(serverClockText('vi', clock!).year).toBe('Năm 2 · Ngày 73');
  });

  it('never invents a year the API did not certify', () => {
    const clock = parseGameClock(base);
    expect(clock).not.toBeNull();
    expect(serverClockText('en', clock!)).toEqual({ year: null, week: 'Week 63 · Day 3/7' });
  });
});
