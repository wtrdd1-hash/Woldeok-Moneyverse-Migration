import { describe, expect, it, vi } from 'vitest';
import { PvpArenaRepository, PvpArenaInputError } from './pvp-arena.repository';
import type { Queryable } from '../core/db';

describe('PvP arena certified transactional ledger operation', () => {
  function repository() {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const db = { query } as unknown as Queryable;
    return { repo: new PvpArenaRepository(db), query };
  }

  it('validates game type on createRoom', async () => {
    const { repo } = repository();
    await expect(repo.createRoom({
      creatorUserId: '00000000-0000-4000-8000-000000000001',
      gameType: 'invalid' as any,
      stakeAmount: 10000,
    })).rejects.toBeInstanceOf(PvpArenaInputError);
  });

  it('validates stake bounds on createRoom', async () => {
    const { repo } = repository();
    await expect(repo.createRoom({
      creatorUserId: '00000000-0000-4000-8000-000000000001',
      gameType: 'dice',
      stakeAmount: 500, // min is 1000
    })).rejects.toBeInstanceOf(PvpArenaInputError);
  });

  it('requires active cash wallet for room creation', async () => {
    const { repo, query } = repository();
    query.mockResolvedValue({ rows: [] }); // no cash account found
    await expect(repo.createRoom({
      creatorUserId: '00000000-0000-4000-8000-000000000001',
      gameType: 'dice',
      stakeAmount: 10000,
    })).rejects.toBeInstanceOf(PvpArenaInputError);
    expect(query).toHaveBeenCalled();
  });

  it('permits original room cancellation for member recovery', async () => {
    const { repo, query } = repository();
    query.mockResolvedValue({ rows: [{ id: '00000000-0000-4000-8000-000000000002' }] });
    await expect(repo.cancelRoom(
      '00000000-0000-4000-8000-000000000002',
      '00000000-0000-4000-8000-000000000001',
    )).resolves.toBe(true);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
