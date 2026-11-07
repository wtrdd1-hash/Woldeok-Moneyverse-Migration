import { describe, expect, it } from 'vitest';
import { filterSeasonEventsByCost, isVerifiedSeasonCostResponse, normalizeSeasonMaxCost } from './season-cost';

const event = (cost_wld: unknown) => ({
  event_id: '11111111-1111-4111-8111-111111111111',
  season_id: '22222222-2222-4222-8222-222222222222',
  season_name: 'Autumn', title: 'Festival', description: 'Read-only',
  cost_wld, points_per_entry: 10, ends_at: '2026-11-02T00:00:00.000Z',
});

describe('canonical season event entry-fee cap', () => {
  it('accepts exact int64 WLD strings without IEEE-754 coercion', () => {
    expect(normalizeSeasonMaxCost('0')).toBe('0');
    expect(normalizeSeasonMaxCost('9007199254740993')).toBe('9007199254740993');
    expect(normalizeSeasonMaxCost('9223372036854775807')).toBe('9223372036854775807');
    for (const raw of ['', '01', '-1', '+1', '1.0', '1e3', ' 1', '9223372036854775808', 100, ['1', '2'], null]) {
      expect(normalizeSeasonMaxCost(raw)).toBeNull();
    }
  });
  it('filters source rows with BigInt and rejects malformed source instead of treating it as zero', () => {
    const source = [event('9007199254740993'), event('9007199254740992'), event('9223372036854775807')];
    expect(filterSeasonEventsByCost(source, '9007199254740992')).toEqual([source[1]]);
    expect(filterSeasonEventsByCost([event('unknown')], '100')).toBeNull();
    expect(filterSeasonEventsByCost([event(-1)], '100')).toBeNull();
    expect(filterSeasonEventsByCost('bad' as never, '100')).toBeNull();
  });
  it('requires exact backend echo, valid owner-session event shape and cap compliance', () => {
    const cap = '9007199254740993';
    expect(isVerifiedSeasonCostResponse({ maxCost: cap, events: [event(cap)] }, cap)).toBe(true);
    expect(isVerifiedSeasonCostResponse({ maxCost: cap, events: [] }, cap)).toBe(true);
    expect(isVerifiedSeasonCostResponse({ events: [event(cap)] }, cap)).toBe(false);
    expect(isVerifiedSeasonCostResponse({ maxCost: '1', events: [event(cap)] }, cap)).toBe(false);
    expect(isVerifiedSeasonCostResponse({ maxCost: cap, events: [event('9007199254740994')] }, cap)).toBe(false);
    expect(isVerifiedSeasonCostResponse({ maxCost: cap, events: [event('NaN')] }, cap)).toBe(false);
    expect(isVerifiedSeasonCostResponse({ maxCost: cap, events: [event(cap), event(cap)] }, cap)).toBe(false);
  });
});
