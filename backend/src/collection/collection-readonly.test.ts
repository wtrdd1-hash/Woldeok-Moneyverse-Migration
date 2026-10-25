import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresCollectionRepository } from './collection.repository';

const actor = '11111111-1111-4111-8111-111111111111';

describe('Collection read provenance', () => {
  it('does not issue unearned collectible assets when the owner has none', async () => {
    const query = vi.fn(async (sql: string) => {
      if (/SELECT count\(\*\)/i.test(sql)) return { rows: [{ count: '0' }] };
      if (/^\s*SELECT id::text/i.test(sql)) return { rows: [] };
      throw new Error('read-only GET must not issue or update collectible assets');
    });
    const repo = new PostgresCollectionRepository({ query } as unknown as Queryable);

    await expect(repo.listCollections(actor)).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toMatch(/WHERE user_id = \$1::uuid/);
    expect(query.mock.calls[0]?.[1]).toEqual([actor]);
  });

  it('returns only persisted owner holdings without hidden seed or mutation queries', async () => {
    const held = [{ id: 'existing', code: 'VERIFIED', isFavorite: false }];
    const query = vi.fn(async (sql: string) => {
      if (/SELECT count\(\*\)/i.test(sql)) return { rows: [{ count: '1' }] };
      if (/^\s*SELECT id::text/i.test(sql)) return { rows: held };
      throw new Error('unexpected write during collection read');
    });
    const repo = new PostgresCollectionRepository({ query } as unknown as Queryable);

    await expect(repo.listCollections(actor)).resolves.toEqual(held);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[1]).toEqual([actor]);
  });
});

describe('Collection curation GET', () => {
  it('does not create a curation row for a member who has never curated', async () => {
    const query = vi.fn(async (sql: string) => {
      if (/^\s*SELECT ladder_step/i.test(sql)) return { rows: [] };
      throw new Error('GET curation status must not insert or update rows');
    });
    const repo = new PostgresCollectionRepository({ query } as unknown as Queryable);

    await expect(repo.getCurationStatus(actor)).resolves.toBeNull();
    expect(query).toHaveBeenCalledTimes(1);
  });
});


describe('Collection curation mutation remains explicit', () => {
  it('creates the initial curation row only from an explicit advance command', async () => {
    const query = vi.fn(async (sql: string, values?: readonly unknown[]) => {
      if (/^\s*SELECT ladder_step/i.test(sql)) return { rows: [] };
      if (/^\s*INSERT INTO public.user_curation_progress/i.test(sql)) {
        expect(values).toEqual([actor, 1, 'D7']);
        return { rows: [{ ladderStep: 1, timelineDay: 'D7', updatedAt: '2026-10-25T00:00:00Z' }] };
      }
      throw new Error('unexpected SQL');
    });
    const repo = new PostgresCollectionRepository({ query } as unknown as Queryable);

    await expect(repo.advanceCuration(actor)).resolves.toMatchObject({ ladderStep: 1, timelineDay: 'D7' });
    expect(query).toHaveBeenCalledTimes(2);
  });
});
