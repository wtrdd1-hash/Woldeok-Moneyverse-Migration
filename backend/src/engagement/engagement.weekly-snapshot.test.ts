import { describe, expect, it, vi } from 'vitest';
import { EngagementController } from './engagement.controller';
import type { EarlyGameRepository } from '../early-game/early-game.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-2222-4333-8444-555555555555';
const request = { session: { user_id: actor }, query: { actor: 'attacker-uuid' } } as unknown as RequestWithSession;

describe('owner-only current-week quest snapshot', () => {
  it('queries only the session actor, not a supplied query parameter', async () => {
    const weeklyGoals = vi.fn().mockResolvedValue([{
      goal_code: 'weekly_work', goal_target: '100000000000000000000', goal_progress: '1',
    }]);
    const controller = new EngagementController(null, { weeklyGoals } as unknown as EarlyGameRepository);
    const result = await controller.weeklySnapshot(request);
    expect(weeklyGoals).toHaveBeenCalledOnce();
    expect(weeklyGoals).toHaveBeenCalledWith(actor);
    expect(result).toMatchObject({ scope: 'current_week_only', goals: [{ goal_code: 'weekly_work' }] });
  });
  it('refuses offline, oversized or missing sessions without fabricated progress', async () => {
    const offline = new EngagementController(null, null);
    await expect(offline.weeklySnapshot(request)).rejects.toMatchObject({ status: 503 });
    const tooMany = new EngagementController(null, {
      weeklyGoals: vi.fn().mockResolvedValue(Array(13).fill({ goal_code: 'fake' })),
    } as unknown as EarlyGameRepository);
    await expect(tooMany.weeklySnapshot(request)).rejects.toMatchObject({ status: 503 });
    await expect(tooMany.weeklySnapshot({} as RequestWithSession)).rejects.toThrow('guard order defect');
  });
});
