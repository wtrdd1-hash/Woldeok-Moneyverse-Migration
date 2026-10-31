import { describe, expect, it, vi } from 'vitest';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';
import { PostgresSeasonRepository } from './season.repository';
import type { Queryable } from '../core/db';

const eventId = '11111111-1111-4111-8111-111111111111';

function setup() {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const repo = new PostgresSeasonRepository({ query } as unknown as Queryable);
  const service = new SeasonService(repo);
  return { query, service, controller: new SeasonController(service) };
}

describe('P1 verified season event leaderboard rank windows', () => {
  it.each([['3', 3], ['10', 10], ['20', 20], [undefined, 20]] as const)(
    'limits ranked SQL on the server: %s -> %s', async (raw, expected) => {
      const { query, controller } = setup();
      await expect(controller.leaderboard(eventId, raw)).resolves.toEqual({ entries: [] });
      expect(query).toHaveBeenCalledOnce();
      expect(query.mock.calls[0]?.[0]).toContain('season_event_leaderboard($1,$2::integer)');
      expect(query.mock.calls[0]?.[1]).toEqual([eventId, expected]);
    },
  );

  it.each(['0', '21', '50', '3.0', '-1', '', '03', 'all', ['3', '10']])(
    'rejects invalid or repeated limit %s before SQL', async (raw) => {
      const { query, controller } = setup();
      await expect(controller.leaderboard(eventId, raw)).rejects.toMatchObject({ status: 400 });
      expect(query).not.toHaveBeenCalled();
    },
  );

  it('refuses unsupported limits when bypassing HTTP controller', async () => {
    const { query, service } = setup();
    expect(() => service.leaderboard(eventId, 50)).toThrow();
    expect(query).not.toHaveBeenCalled();
  });
});
