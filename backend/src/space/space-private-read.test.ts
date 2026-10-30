import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { SpaceController } from './space.controller';
import { PostgresSpaceRepository } from './space.repository';
import { SpaceService } from './space.service';

const actor = '11111111-2222-4333-8444-555555555555';
const foreign = '22222222-3333-4444-8555-666666666666';
const spaceId = '33333333-4444-4555-8666-777777777777';

const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('P0 private spaces: authenticated actor must bind every member read', () => {
  it('binds detail and tax-status HTTP handlers to session actor, not only URL id', async () => {
    const service = {
      getSpaceById: vi.fn().mockResolvedValue({ id: spaceId }),
      getSpaceTaxStatus: vi.fn().mockResolvedValue({ spaceId }),
    };
    const controller = new SpaceController(service as unknown as SpaceService);
    await controller.getSpaceById(request, spaceId);
    await controller.getSpaceTaxStatus(request, spaceId);
    expect(service.getSpaceById).toHaveBeenCalledWith(actor, spaceId);
    expect(service.getSpaceTaxStatus).toHaveBeenCalledWith(actor, spaceId);
  });

  it('detail SQL never returns another member private/club space', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresSpaceRepository({ query });
    await repo.getSpaceById(actor, spaceId);
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(params).toEqual([spaceId, actor]);
    expect(sql).toMatch(/user_id\s*=\s*\$2::uuid/i);
    expect(sql).toMatch(/privacy\s*=\s*'public'/i);
  });

  it('tax-status SQL never reads another owner, including public spaces', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresSpaceRepository({ query });
    await expect(repo.getSpaceTaxStatus(actor, spaceId)).rejects.toThrow('space not found');
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(params).toEqual([spaceId, actor]);
    expect(sql).toMatch(/user_id\s*=\s*\$2::uuid/i);
  });

  it('public delinquency feed excludes private and club spaces', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresSpaceRepository({ query });
    await repo.listDelinquencies();
    const sql = query.mock.calls[0]?.[0] as string;
    expect(sql).toMatch(/s\.privacy\s*=\s*'public'/i);
    expect(sql).not.toMatch(/(?:JOIN|FROM)\s+public\.identities/i);
  });

  it('layout preflight checks both actor and space id before mutation', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresSpaceRepository({ query });
    await expect(repo.updateSpaceLayout(actor, spaceId, { theme: 'owner' })).rejects.toThrow();
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(params).toEqual([spaceId, actor]);
    expect(sql).toMatch(/user_id\s*=\s*\$2::uuid/i);
    expect(query).toHaveBeenCalledOnce();
  });

  it('invalid actor UUID is rejected before any detail or tax database read', async () => {
    const query = vi.fn();
    const repo = new PostgresSpaceRepository({ query });
    await expect(repo.getSpaceById(foreign.slice(0, 6), spaceId)).rejects.toThrow();
    await expect(repo.getSpaceTaxStatus(foreign.slice(0, 6), spaceId)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
});
