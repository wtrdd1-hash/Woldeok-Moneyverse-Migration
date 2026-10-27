import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { PostgresSeasonRepository } from './season.repository';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';

const actor = '11111111-1111-4111-8111-111111111111';
const season = '22222222-2222-4222-8222-222222222222';
const key = '33333333-3333-4333-8333-333333333333';
const hold = { status: 503, response: { code: 'SEASON_REWARD_LEDGER_UNAVAILABLE' } };

function setup() {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const repository = new PostgresSeasonRepository({ query } as unknown as Queryable);
  const service = new SeasonService(repository);
  return { query, repository, service };
}

describe('P0 season reward claim ledger containment', () => {
  it('rejects a repository call without invoking legacy cash-moving SQL', async () => {
    const { query, repository } = setup();
    await expect(repository.claimReward(actor, season, key)).rejects.toMatchObject(hold);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects a direct service call without invoking legacy SQL', async () => {
    const { query, service } = setup();
    await expect(service.claimReward(actor, season, key)).rejects.toMatchObject(hold);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects controller calls after session resolution without calling the service', async () => {
    const { service } = setup();
    const claim = vi.spyOn(service, 'claimReward');
    const controller = new SeasonController(service);
    const request = { session: { user_id: actor } } as RequestWithSession;
    await expect(controller.claimReward(request, { seasonId: season, idempotencyKey: key })).rejects.toMatchObject(hold);
    expect(claim).not.toHaveBeenCalled();
  });

  it('preserves read-only season event discovery', async () => {
    const { query, repository } = setup();
    await expect(repository.events()).resolves.toEqual([]);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[0]).toContain('season_active_events');
  });
});
