import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresSpaceRepository } from './space.repository';
import { SpaceService } from './space.service';

const actor = '11111111-2222-4333-8444-555555555555';
const target = '22222222-3333-4444-8555-666666666666';
const key = '33333333-4444-4555-8666-777777777777';
const unavailable = {
  status: 503,
  response: { code: 'SPACE_LEDGER_SETTLEMENT_UNAVAILABLE' },
};

function setup() {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const repo = new PostgresSpaceRepository({ query } as unknown as Queryable);
  return { query, repo, service: new SpaceService(repo) };
}

describe('P0: unjournaled space economy writes must fail closed', () => {
  it('blocks a space purchase before touching the database', async () => {
    const { repo, query } = setup();
    await expect(repo.purchaseSpace(actor, 'SPACE_STUDIO', 'Test', key)).rejects.toMatchObject(unavailable);
    expect(query).not.toHaveBeenCalled();
  });

  it('blocks city-project contributions before touching the database', async () => {
    const { repo, query } = setup();
    await expect(repo.contributeCityProject(actor, target, 500, key)).rejects.toMatchObject(unavailable);
    expect(query).not.toHaveBeenCalled();
  });

  it('blocks property-tax debits before touching the database', async () => {
    const { repo, query } = setup();
    await expect(repo.payPropertyTax(actor, target, 5, key)).rejects.toMatchObject(unavailable);
    expect(query).not.toHaveBeenCalled();
  });

  it('returns the same explicit 503 through the service for all three routes', async () => {
    const { service, query } = setup();
    await expect(service.purchaseSpace(actor, 'SPACE_STUDIO', 'Test', key)).rejects.toMatchObject(unavailable);
    await expect(service.contributeCityProject(actor, target, 500, key)).rejects.toMatchObject(unavailable);
    await expect(service.payPropertyTax(actor, target, 5, key)).rejects.toMatchObject(unavailable);
    expect(query).not.toHaveBeenCalled();
  });

  it('keeps existing space holdings read-only and queryable', async () => {
    const { repo, query } = setup();
    await expect(repo.listUserSpaces(actor)).resolves.toEqual([]);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[0]).toMatch(/SELECT id, user_id/);
  });

  it('keeps city project progress read-only and queryable', async () => {
    const { repo, query } = setup();
    await expect(repo.listCityProjects()).resolves.toEqual([]);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[0]).toMatch(/FROM public\.city_projects/);
  });
});
