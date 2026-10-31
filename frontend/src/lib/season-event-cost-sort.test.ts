import { describe, expect, it } from 'vitest';
import { parseSeasonCostSort, verifiedSeasonCostEvents } from './season-event-cost-sort';
const id = (n: number) => `${String(n).padStart(8, '0')}-1111-4111-8111-111111111111`;
const row = (n: number, cost: string) => ({
  event_id: id(n), season_id: id(99), season_name: 'S', title: 'Event', description: 'D',
  cost_wld: cost, points_per_entry: 2, ends_at: '2026-11-01T00:00:00.000Z',
});
describe('season event cost proof', () => {
  it('parses only one allowlisted cost sort', () => {
    expect(parseSeasonCostSort(undefined)).toBe('default');
    expect(parseSeasonCostSort('cost_asc')).toBe('cost_asc');
    expect(parseSeasonCostSort('cost_desc')).toBe('cost_desc');
    expect(parseSeasonCostSort(['cost_asc', 'cost_desc'])).toBeNull();
    expect(parseSeasonCostSort('')).toBeNull();
    expect(parseSeasonCostSort('cost_desc,default')).toBeNull();
  });
  it('verifies exact order and rejects forged success and rounded monetary values', () => {
    const rows = [row(1, '5'), row(2, '9007199254740992'), row(3, '9007199254740993')];
    expect(verifiedSeasonCostEvents({ events: rows }, 'cost_asc')).toEqual(rows);
    expect(verifiedSeasonCostEvents({ events: rows }, 'cost_desc')).toBeNull();
    expect(verifiedSeasonCostEvents({ events: [...rows].reverse() }, 'cost_desc')).not.toBeNull();
    expect(verifiedSeasonCostEvents({ events: [row(1, '01')] }, 'cost_asc')).toBeNull();
    expect(verifiedSeasonCostEvents({ events: [row(1, '5.0')] }, 'cost_asc')).toBeNull();
    expect(verifiedSeasonCostEvents({ events: [row(1, '5'), row(1, '6')] }, 'cost_asc')).toBeNull();
    expect(verifiedSeasonCostEvents({ events: 'no rows' }, 'cost_asc')).toBeNull();
  });
});
