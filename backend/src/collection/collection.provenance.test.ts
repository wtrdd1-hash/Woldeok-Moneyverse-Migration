import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { PostgresCollectionRepository } from './collection.repository';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';

const actor = '11111111-2222-4333-8444-555555555555';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

function fixture() {
  const query = vi.fn(async (_sql: string, _params?: unknown[]) => ({ rows: [{ count: '1' }] }));
  const repo = new PostgresCollectionRepository({ query } as unknown as Queryable);
  const service = new CollectionService(repo);
  const controller = new CollectionController(service);
  return { query, repo, service, controller };
}

describe('P0 collection provenance quarantine', () => {
  it('GET never inserts or fabricates member ownership, even when legacy records exist', async () => {
    const { query, controller } = fixture();
    const result = await controller.listCollections(request);
    expect(result).toEqual({ pieces: [], unverifiedRecords: '1', verificationStatus: 'unavailable' });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toContain('collection_unverified_count');
    expect(query.mock.calls[0]?.[0]).not.toMatch(/INSERT|UPDATE|DELETE/i);
    expect(query.mock.calls[0]?.[1]).toEqual([actor]);
  });

  it('GET curation status does not create progress or claim a verified ladder step', async () => {
    const { query, controller } = fixture();
    const result = await controller.getCurationStatus(request);
    expect(result).toEqual({ status: null, verificationStatus: 'unavailable' });
    expect(query.mock.calls.every(([sql]) => !/INSERT|UPDATE|DELETE/i.test(sql))).toBe(true);
  });

  it('holds collection edits and progression before database mutation while provenance is unavailable', async () => {
    const { query, controller } = fixture();
    await expect(controller.updatePiece(request, 'legacy-1', { isFavorite: true })).rejects.toMatchObject({ status: 503 });
    await expect(controller.advanceCuration(request, { targetStep: 7 })).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });
});
