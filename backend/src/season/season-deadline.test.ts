import { describe, expect, it, vi } from 'vitest';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';
import { filterSeasonDeadlineEvents, parseSeasonDeadlineFilter } from './season-deadline';

const now = new Date('2026-11-01T00:00:00.000Z');
const row = (id: string, ends_at: unknown) => ({
  event_id: id, season_id: '22222222-2222-4222-8222-222222222222',
  season_name: 'Autumn', title: 'Festival', description: '',
  cost_wld: '900719925474099312345', points_per_entry: 10, ends_at,
});

describe('seven-day season deadline discovery', () => {
  it('accepts only absent or exact 7d; rejects duplicate/unknown before DB access', () => {
    expect(parseSeasonDeadlineFilter(undefined)).toBeNull();
    expect(parseSeasonDeadlineFilter('7d')).toBe('7d');
    for (const bad of ['', '1d', '7D', ['7d', '7d'], null]) {
      expect(() => parseSeasonDeadlineFilter(bad)).toThrow();
    }
  });
  it('uses strict future and inclusive seven-day boundary without number-casting WLD', () => {
    const rows = [row('expired', now.toISOString()), row('soon', '2026-11-02T00:00:00.000Z'),
      row('boundary', '2026-11-08T00:00:00.000Z'), row('late', '2026-11-08T00:00:00.001Z')];
    expect(filterSeasonDeadlineEvents(rows, now).map((event) => event.event_id)).toEqual(['soon', 'boundary']);
    expect(filterSeasonDeadlineEvents(rows, now)[0]?.cost_wld).toBe('900719925474099312345');
  });
  it('rejects malformed source evidence instead of treating it as empty', () => {
    expect(() => filterSeasonDeadlineEvents([row('bad', 'not-a-date')], now)).toThrow();
    expect(() => filterSeasonDeadlineEvents([row('bad', '2026-11-02T00:00:00.000Z'), null], now)).toThrow();
    expect(() => filterSeasonDeadlineEvents([{ ...row('bad', '2026-11-02T00:00:00.000Z'), cost_wld: 100 }], now)).toThrow();
  });
  it('keeps default route unchanged and filters only when explicitly requested', async () => {
    const events = vi.fn().mockResolvedValue([row('soon', '2026-11-02T00:00:00.000Z'), row('late', '2026-11-12T00:00:00.000Z')]);
    const controller = new SeasonController({ events } as unknown as SeasonService);
    expect((await controller.events()).events).toHaveLength(2);
    const filtered = await controller.events('7d', now);
    expect(filtered).toEqual({ events: [row('soon', '2026-11-02T00:00:00.000Z')], asOfUtc: now.toISOString() });
    await expect(controller.events(['7d', '7d'])).rejects.toMatchObject({ status: 400 });
    expect(events).toHaveBeenCalledTimes(2);
  });
});
