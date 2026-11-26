import { describe, expect, it } from 'vitest';
import { addDays, dayKeyOf, parseGameClock, passbookDate, weekDayOf } from './game-calendar';

const raw = {
  ok: true, policyVersion: 'v2026.09.15.114', dayIndex: 10415, weekIndex: 1487, dayOfWeek: 7,
  realSecondsPerDay: 600, gameDaysPerWeek: 7, dayStartedAt: '2026-11-25T22:50:00Z', dayEndsAt: '2026-11-25T23:00:00Z',
  weekStartedAt: '2026-11-25T21:50:00Z', weekEndsAt: '2026-11-25T23:00:00Z', dayKey: '2028-07-07', weekKey: '2028-07-01',
};

describe('game calendar', () => {
  it('parses the server clock and refuses partial ones', () => {
    expect(parseGameClock(raw)?.dayOfWeek).toBe(7);
    expect(parseGameClock({ ...raw, dayKey: undefined })).toBeNull();
    expect(parseGameClock({ ...raw, dayOfWeek: 9 })).toBeNull();
    expect(parseGameClock(null)).toBeNull();
  });
  it('dates lines like a passbook', () => {
    expect(passbookDate('2028-07-07')).toBe('28.07.07');
    expect(addDays('2028-07-01', 6)).toBe('2028-07-07');
  });
  it('places a real moment in the game week', () => {
    const clock = parseGameClock(raw)!;
    expect(weekDayOf(clock, '2026-11-25T22:55:00Z')).toBe(7);
    expect(weekDayOf(clock, '2026-11-25T21:51:00Z')).toBe(1);
    expect(weekDayOf(clock, '2026-11-25T21:49:00Z')).toBeNull();
    expect(dayKeyOf(clock, '2026-11-25T22:41:00Z')).toBe('2028-07-06');
  });
});

describe('game year (GAMEYEAR.4)', () => {
  const withYear = { ...raw, calendarVersion: 'v2026.11.26.GAMEYEAR.2', gameYear: 29, dayOfYear: 203, gameDaysPerYear: 365,
    realSecondsPerGameYear: 219000, yearStartedAt: '2026-11-24T14:20:00Z', yearEndsAt: '2026-11-27T03:10:00Z', observedAt: '2026-11-26T00:03:25.488Z' };
  it('reads the year from the API only', () => {
    expect(parseGameClock(withYear)?.year?.gameYear).toBe(29);
    expect(parseGameClock(raw)?.year).toBeNull();
    expect(parseGameClock({ ...withYear, dayOfYear: 366 })?.year).toBeNull();
    expect(parseGameClock({ ...withYear, gameYear: 0 })?.year).toBeNull();
  });
  it('labels the year in five languages, English as the fallback', async () => {
    const { gameYearLabel } = await import('./game-calendar');
    const y = parseGameClock(withYear)!.year!;
    expect(gameYearLabel('en', y)).toBe('Moneyverse Year 29 · Day 203');
    expect(gameYearLabel('ko', y)).toBe('머니버스 29년 · 203일차');
    expect(gameYearLabel('ja', y)).toBe('マネーバース29年 · 203日目');
    expect(gameYearLabel('zh', y)).toBe('Moneyverse 第29年 · 第203天');
    expect(gameYearLabel('vi', y)).toBe('Năm Moneyverse 29 · Ngày 203');
    expect(gameYearLabel('xx', y)).toBe('Moneyverse Year 29 · Day 203');
    expect(gameYearLabel('ko', y, true)).toBe('29년 · 203일차');
  });
});
