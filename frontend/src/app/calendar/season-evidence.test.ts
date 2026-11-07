import { describe, expect, it } from 'vitest';
import { parseSeasonCalendarEvents } from './season-evidence';

const id1 = '00000000-0000-4000-8000-000000000001';
const id2 = '00000000-0000-4000-8000-000000000002';
const valid = {
  event_id: id1,
  season_id: id2,
  season_name: '가을 시즌',
  title: '서버 확인 이벤트',
  description: '참여 비용과 종료일은 서버 기록',
  cost_wld: '9007199254740993',
  points_per_entry: 12,
  ends_at: '2026-11-15T12:30:00.000Z',
};

describe('season calendar source evidence', () => {
  it('accepts verified empty response without fabricating events', () => {
    expect(parseSeasonCalendarEvents({ events: [] })).toEqual([]);
    expect(parseSeasonCalendarEvents(null)).toBeNull();
    expect(parseSeasonCalendarEvents({})).toBeNull();
  });

  it('preserves canonical exact WLD strings and a real bounded event', () => {
    expect(parseSeasonCalendarEvents({ events: [valid] })).toEqual([valid]);
  });

  it('rejects malformed collections, duplicate IDs and oversized responses', () => {
    expect(parseSeasonCalendarEvents({ events: null })).toBeNull();
    expect(parseSeasonCalendarEvents({ events: [valid, valid] })).toBeNull();
    expect(parseSeasonCalendarEvents({ events: Array.from({ length: 201 }, () => valid) })).toBeNull();
    expect(parseSeasonCalendarEvents({ events: [null] })).toBeNull();
  });

  it('rejects unverified amounts, points, UUIDs and impossible dates', () => {
    for (const broken of [
      { cost_wld: '-1' },
      { cost_wld: '01' },
      { cost_wld: '1e5' },
      { cost_wld: 1000 },
      { points_per_entry: Number.POSITIVE_INFINITY },
      { points_per_entry: 1.25 },
      { event_id: 'not-an-id' },
      { ends_at: 'not-a-date' },
      { ends_at: '2026-02-31T12:30:00Z' },
      { season_name: '' },
    ]) {
      expect(parseSeasonCalendarEvents({ events: [{ ...valid, ...broken }] })).toBeNull();
    }
  });
});
