import { describe, expect, it } from 'vitest';
import {
  verifyCalendarSeasons,
  verifyCalendarToday,
  verifyCalendarWeeklyGoals,
  verifyCalendarShop,
} from './calendar-evidence';

const id1 = '123e4567-e89b-42d3-a456-426614174000';
const id2 = '123e4567-e89b-42d3-a456-426614174001';
const season = {
  event_id: id1,
  season_id: id2,
  season_name: 'Autumn',
  title: 'Festival',
  description: 'Collect points',
  cost_wld: '9007199254740993',
  points_per_entry: 2,
  ends_at: '2026-11-01T00:00:00.000Z',
};
const shopItem = {
  catalog_id: id1,
  name: 'Limited item',
  category: 'limited',
  price: '9007199254740993',
  sale_ends_at: '2026-11-02T00:00:00.000Z',
};
const event = {
  event_date: '2026-10-31',
  event_label: 'Today event',
  event_detail: 'Participate',
  claimed: false,
};
const weeklyGoal = {
  goal_code: 'weekly_work',
  goal_window: 'week',
  week_start: '2026-10-26',
};

describe('calendar server evidence', () => {
  it('distinguishes verified empty sources from failed or malformed sources', () => {
    expect(verifyCalendarSeasons({ events: [] })).toEqual([]);
    expect(verifyCalendarShop({ catalogItems: [] })).toEqual([]);
    expect(verifyCalendarWeeklyGoals({ goals: [] })).toEqual([]);
    expect(verifyCalendarToday({ event: null })).toBeNull();
    expect(verifyCalendarSeasons(null)).toBeNull();
    expect(verifyCalendarSeasons({ events: null })).toBeNull();
    expect(verifyCalendarShop({ catalogItems: 'none' })).toBeNull();
    expect(verifyCalendarWeeklyGoals({ goals: null })).toBeNull();
    expect(verifyCalendarToday({})).toBeUndefined();
  });

  it('accepts only source-backed event dates, amounts, and distinct identifiers', () => {
    expect(verifyCalendarSeasons({ events: [season] })).toEqual([season]);
    expect(verifyCalendarSeasons({ events: [{ ...season, cost_wld: 100 }] })).toBeNull();
    expect(verifyCalendarSeasons({ events: [{ ...season, cost_wld: '-1' }] })).toBeNull();
    expect(verifyCalendarSeasons({ events: [{ ...season, ends_at: 'tomorrow' }] })).toBeNull();
    expect(verifyCalendarSeasons({ events: [{ ...season, ends_at: '2026-02-30T00:00:00.000Z' }] })).toBeNull();
    expect(verifyCalendarSeasons({ events: [{ ...season, points_per_entry: Infinity }] })).toBeNull();
    expect(verifyCalendarSeasons({ events: [{ ...season, event_id: 'bad' }] })).toBeNull();
    expect(verifyCalendarSeasons({ events: [season, season] })).toBeNull();
  });

  it('rejects invalid shop deadlines rather than reporting an empty sale calendar', () => {
    expect(verifyCalendarShop({ catalogItems: [shopItem] })).toEqual([shopItem]);
    expect(verifyCalendarShop({ catalogItems: [{ ...shopItem, sale_ends_at: null }] })).toEqual([
      { ...shopItem, sale_ends_at: null },
    ]);
    expect(verifyCalendarShop({ catalogItems: [{ ...shopItem, sale_ends_at: 'invalid' }] })).toBeNull();
    expect(verifyCalendarShop({ catalogItems: [{ ...shopItem, price: '1.5' }] })).toBeNull();
    expect(verifyCalendarShop({ catalogItems: [shopItem, shopItem] })).toBeNull();
  });

  it('refuses forged daily and weekly status while preserving valid empty events', () => {
    expect(verifyCalendarToday({ event })).toEqual(event);
    expect(verifyCalendarToday({ event: { ...event, claimed: 'false' } })).toBeUndefined();
    expect(verifyCalendarToday({ event: { ...event, event_date: '2026-02-30' } })).toBeUndefined();
    expect(verifyCalendarToday(null)).toBeUndefined();
    expect(verifyCalendarWeeklyGoals({ goals: [weeklyGoal] })).toEqual([weeklyGoal]);
    expect(verifyCalendarWeeklyGoals({ goals: [{ ...weeklyGoal, week_start: 'tomorrow' }] })).toBeNull();
    expect(verifyCalendarWeeklyGoals({ goals: [weeklyGoal, weeklyGoal] })).toBeNull();
  });
});
