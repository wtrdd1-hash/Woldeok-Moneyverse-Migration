import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { SeasonController } from './season.controller';
import { SeasonService, type SeasonRepository, type SeasonEventRow } from './season.service';

const uuid = (n: number) => `${String(n).padStart(8, '0')}-1111-4111-8111-111111111111`;
const event = (n: number, cost: string): SeasonEventRow => ({
  event_id: uuid(n), season_id: uuid(99), season_name: 'Test season',
  title: `Event ${n}`, description: 'Test', cost_wld: cost,
  points_per_entry: 1, ends_at: new Date('2026-11-01T00:00:00Z'),
});

function controllerWith(rows: readonly SeasonEventRow[]) {
  const events = vi.fn(async () => rows);
  const service = new SeasonService({ events } as unknown as SeasonRepository);
  return { controller: new SeasonController(service), events };
}

describe('P1 season event WLD cost ordering', () => {
  it('sorts exactly above Number.MAX_SAFE_INTEGER, preserving DB order on ties', async () => {
    const { controller, events } = controllerWith([
      event(1, '9007199254740993'), event(2, '5'), event(3, '9007199254740992'), event(4, '5'),
    ]);
    expect((await controller.events('cost_asc')).events.map((e) => e.event_id)).toEqual([uuid(2), uuid(4), uuid(3), uuid(1)]);
    expect((await controller.events('cost_desc')).events.map((e) => e.event_id)).toEqual([uuid(1), uuid(3), uuid(2), uuid(4)]);
    expect((await controller.events()).events.map((e) => e.event_id)).toEqual([uuid(1), uuid(2), uuid(3), uuid(4)]);
    expect(events).toHaveBeenCalledTimes(3);
  });

  it('rejects duplicate, empty and unknown sort values before accessing the database', async () => {
    const { controller, events } = controllerWith([]);
    for (const invalid of [['cost_asc', 'cost_desc'], '', 'cheapest', 'cost_asc,default']) {
      await expect(controller.events(invalid)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(events).not.toHaveBeenCalled();
  });

  it('does not sort or present malformed financial amounts as verified data', async () => {
    for (const amount of ['1.5', '01', '90071992547409931234567890', '-1']) {
      const { controller } = controllerWith([event(1, amount)]);
      await expect(controller.events('cost_asc')).rejects.toMatchObject({ status: 503 });
    }
  });
});
