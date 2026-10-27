import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBusinessCatalog, parseSeasonCatalog } from './catalog-evidence';

const ID1 = '11111111-1111-4111-8111-111111111111';
const ID2 = '22222222-2222-4222-8222-222222222222';
const business = {
  id: ID1,
  symbol: 'CAFE',
  name: 'Cafe',
  purchase_cost: '9007199254740993',
  daily_revenue: '100',
  daily_operating_cost: '0',
  active: true,
};
const event = {
  id: ID2,
  season_name: '2026 Autumn',
  title: 'Autumn challenge',
  cost_wld: '9007199254740993',
  points_per_entry: 10,
  active: false,
  ends_at: '2026-11-30T00:00:00.000Z',
};

describe('admin catalog authoritative evidence', () => {
  it('keeps an explicitly empty verified business catalog separate from unavailable data', () => {
    expect(parseBusinessCatalog({ businessTypes: [] })).toEqual([]);
    for (const value of [null, {}, { businessTypes: null }, { businessTypes: 'none' }, { businessTypes: [null] }]) {
      expect(parseBusinessCatalog(value)).toBeNull();
    }
  });

  it('preserves large WLD integer strings without Number rounding', () => {
    expect(parseBusinessCatalog({ businessTypes: [business] })?.[0]?.purchase_cost).toBe('9007199254740993');
    expect(parseSeasonCatalog({ events: [event] })?.[0]?.cost_wld).toBe('9007199254740993');
  });

  it('rejects malformed business identities, amounts and active flags', () => {
    const bad = [
      { id: 'not-uuid' },
      { symbol: '' },
      { name: '' },
      { purchase_cost: 100 },
      { purchase_cost: '01' },
      { daily_revenue: '-1' },
      { daily_operating_cost: '1.5' },
      { active: 'true' },
    ];
    for (const patch of bad) {
      expect(parseBusinessCatalog({ businessTypes: [{ ...business, ...patch }] })).toBeNull();
    }
  });

  it('rejects duplicate business IDs or symbols rather than rendering ambiguous write controls', () => {
    expect(parseBusinessCatalog({ businessTypes: [business, { ...business, symbol: 'OTHER' }] })).toBeNull();
    expect(parseBusinessCatalog({ businessTypes: [business, { ...business, id: ID2, symbol: 'cafe' }] })).toBeNull();
  });

  it('distinguishes verified empty season events from unavailable or malformed data', () => {
    expect(parseSeasonCatalog({ events: [] })).toEqual([]);
    for (const value of [null, {}, { events: null }, { events: {} }, { events: [false] }]) {
      expect(parseSeasonCatalog(value)).toBeNull();
    }
  });

  it('rejects malformed season amounts, points, dates, identities and flags', () => {
    const bad = [
      { id: 'x' },
      { season_name: '' },
      { title: '' },
      { cost_wld: 5 },
      { cost_wld: '1e3' },
      { points_per_entry: Number.MAX_SAFE_INTEGER + 1 },
      { points_per_entry: -1 },
      { active: 1 },
      { ends_at: 'not-a-date' },
    ];
    for (const patch of bad) {
      expect(parseSeasonCatalog({ events: [{ ...event, ...patch }] })).toBeNull();
    }
    expect(parseSeasonCatalog({ events: [event, { ...event }] })).toBeNull();
  });

  it('uses independently validated unknown API payloads and withholds event creation on unavailable evidence', () => {
    const source = readFileSync('src/app/admin/catalog/page.tsx', 'utf8');
    expect(source).toContain('parseBusinessCatalog');
    expect(source).toContain('parseSeasonCatalog');
    expect(source).toContain('apiOrNull<unknown>');
    expect(source).toMatch(/events !== null\s*\?\s*<NewSeasonEventForm/);
    expect(source).toContain('role="alert"');
    expect(source).toContain('href="/admin/catalog"');
  });
});
