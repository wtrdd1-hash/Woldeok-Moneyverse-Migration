import { describe, expect, it, vi } from 'vitest';
import { PvpArenaRepository, PvpArenaSettlementHoldError } from './pvp-arena.repository';
import type { Queryable } from '../core/db';

/**
 * Monetary P0 containment: a caller must not reach any balance or wager SQL
 * while PvP settlement is not routed through the canonical audited ledger.
 */
describe('PvP non-ledger financial write containment', () => {
  function repository() {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const db = { query } as unknown as Queryable;
    return { repo: new PvpArenaRepository(db), query };
  }

  it('refuses to create a new wagering room before any SQL', async () => {
    const { repo, query } = repository();
    await expect(repo.createRoom({
      creatorUserId: '00000000-0000-4000-8000-000000000001',
      gameType: 'dice',
      stakeAmount: 10000,
    })).rejects.toBeInstanceOf(PvpArenaSettlementHoldError);
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses to join and settle existing waiting wagers before any SQL', async () => {
    const { repo, query } = repository();
    await expect(repo.joinAndPlay({
      roomId: '00000000-0000-4000-8000-000000000002',
      opponentUserId: '00000000-0000-4000-8000-000000000003',
    })).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });

  it('still permits original room cancellation for member recovery', async () => {
    const { repo, query } = repository();
    query.mockResolvedValue({ rows: [{ id: '00000000-0000-4000-8000-000000000002' }] });
    await expect(repo.cancelRoom(
      '00000000-0000-4000-8000-000000000002',
      '00000000-0000-4000-8000-000000000001',
    )).resolves.toBe(true);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('hold cannot be lifted by generic feature environment flags', async () => {
    const { repo, query } = repository();
    const old = process.env.MONEYVERSE_PVP_LEDGER_SETTLEMENT_CERTIFIED;
    process.env.MONEYVERSE_PVP_LEDGER_SETTLEMENT_CERTIFIED = 'true';
    try {
      await expect(repo.joinAndPlay({
        roomId: '00000000-0000-4000-8000-000000000002',
        opponentUserId: '00000000-0000-4000-8000-000000000003',
      })).rejects.toBeInstanceOf(PvpArenaSettlementHoldError);
      expect(query).not.toHaveBeenCalled();
    } finally {
      if (old === undefined) delete process.env.MONEYVERSE_PVP_LEDGER_SETTLEMENT_CERTIFIED;
      else process.env.MONEYVERSE_PVP_LEDGER_SETTLEMENT_CERTIFIED = old;
    }
  });
});
