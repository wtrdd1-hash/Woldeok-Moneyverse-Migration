import { describe, expect, it } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { DopamineController } from './dopamine.controller';

const actor = { session: { user_id: '00000000-0000-4000-8000-000000000001' } } as unknown as RequestWithSession;

describe('P0 mini-showdown server-authoritative practice rounds', () => {
  const controller = new DopamineController(null);

  it('refuses client-authored win, dice and stake even if the caller is authenticated', async () => {
    await expect(controller.resolveMiniShowdown(actor, {
      outcome: 'win', playerRoll: [6], aiRoll: [1], stake: 100,
    })).rejects.toMatchObject({ status: 400 });
  });

  it('returns server dice 1..6 with zero money and an explicit practice-only mode', async () => {
    for (let index = 0; index < 15; index += 1) {
      const result = await controller.resolveMiniShowdown(actor, {} as never);
      expect(result).toMatchObject({ success: true, mode: 'PRACTICE_ONLY', stake: '0', payout: '0' });
      expect(result.playerRoll).toHaveLength(1);
      expect(result.aiRoll).toHaveLength(1);
      expect(result.playerRoll[0]).toBeGreaterThanOrEqual(1);
      expect(result.playerRoll[0]).toBeLessThanOrEqual(6);
      expect(result.aiRoll[0]).toBeGreaterThanOrEqual(1);
      expect(result.aiRoll[0]).toBeLessThanOrEqual(6);
      const expected = result.playerRoll[0] > result.aiRoll[0] ? 'win' : result.playerRoll[0] < result.aiRoll[0] ? 'loss' : 'draw';
      expect(result.outcome).toBe(expected);
      expect(result).not.toHaveProperty('transactionId');
      expect(result).not.toHaveProperty('newBalance');
    }
  });
});
