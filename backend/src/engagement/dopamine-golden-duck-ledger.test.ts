import { describe, expect, it, vi } from 'vitest';
import { DopamineRepository } from './dopamine.repository';
import type { Queryable } from '../core/db';

describe('Golden Duck read-only ledger evidence', () => {
  it('uses owner-bound parameters and KST day, not an untrusted client actor', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ transaction_id: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d' }] });
    const repository = new DopamineRepository({ query } as unknown as Queryable);
    const actor = '11111111-2222-4333-8444-555555555555';
    await expect(repository.goldenDuckLedgerStatus(actor)).resolves.toEqual({ claimedToday: true, transactionId: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d' });
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('actor_user_id = $1::uuid');
    expect(sql).toContain("'Asia/Seoul'");
    expect(sql).toContain("'game.dopamine.golden_duck'");
    expect(params).toEqual([actor]);
  });
  it('returns an actual empty history without minting anything', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new DopamineRepository({ query } as unknown as Queryable);
    await expect(repository.goldenDuckLedgerStatus('11111111-2222-4333-8444-555555555555')).resolves.toEqual({ claimedToday: false, transactionId: null });
    expect(query.mock.calls[0]![0]).toMatch(/^SELECT/);
  });
});
