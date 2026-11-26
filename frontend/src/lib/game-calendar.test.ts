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
