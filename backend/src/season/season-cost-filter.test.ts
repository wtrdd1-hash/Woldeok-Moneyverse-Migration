import { describe, expect, it, vi } from 'vitest';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';
import type { SeasonRepository, SeasonEventRow } from './season.service';

const makeEvent = (cost: string): SeasonEventRow => ({
  event_id: '11111111-1111-4111-8111-111111111111', season_id: '22222222-2222-4222-8222-222222222222',
  season_name: 'Autumn', title: 'Festival', description: '', cost_wld: cost as SeasonEventRow['cost_wld'],
  points_per_entry: 1, ends_at: '2026-11-02T00:00:00Z',
});

function setup(rows: SeasonEventRow[]) {
  const events = vi.fn().mockResolvedValue(rows);
  const service = new SeasonService({ events } as unknown as SeasonRepository);
  return { events, controller: new SeasonController(service) };
}

describe('authenticated season event fee-cap read path', () => {
  it('rejects malformed, duplicate and unrelated query parameters before touching PostgreSQL', async () => {
    const { controller, events } = setup([]);
    for (const query of [{ maxCost: '01' }, { maxCost: ['1', '2'] }, { maxCost: '-1' }, { bogus: '1' }]) {
      await expect(controller.events(query)).rejects.toMatchObject({ status: 400 });
    }
    expect(events).not.toHaveBeenCalled();
  });
  it('filters actual SECURITY DEFINER result with exact integer-string precision', async () => {
    const { controller, events } = setup([makeEvent('9007199254740993'), makeEvent('9007199254740992')]);
    const result = await controller.events({ maxCost: '9007199254740992' });
    expect(result).toMatchObject({ maxCost: '9007199254740992', events: [makeEvent('9007199254740992')] });
    expect(events).toHaveBeenCalledOnce();
  });
  it('preserves unfiltered compatibility and fails closed on malformed source cost', async () => {
    const { controller } = setup([makeEvent('1')]);
    expect(await controller.events({})).toEqual({ events: [makeEvent('1')] });
    expect(await controller.events({ maxCost: '' })).toEqual({ events: [makeEvent('1')] });
    const invalid = setup([makeEvent('not-a-number')]);
    await expect(invalid.controller.events({ maxCost: '100' })).rejects.toMatchObject({ status: 503 });
  });
});
