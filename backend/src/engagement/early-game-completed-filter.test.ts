import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { EngagementController } from './engagement.controller';
import type { EarlyGameRepository } from '../early-game/early-game.repository';
import type { EngagementRepository } from './engagement.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: actor } } as RequestWithSession;
const goal = (code: string, completed: unknown) => ({
  goal_code: code, goal_label: code, goal_detail: 'verified', goal_metric: 'work',
  goal_window: 'week', goal_target: '9007199254740993', goal_progress: '9007199254740993',
  goal_unit: 'WLD', goal_self_reported: false, goal_completed: completed,
  week_start: '2026-10-26',
});

function controller(goals: unknown[]) {
  const weeklyGoals = vi.fn(async () => goals);
  const collections = vi.fn(async () => [{ book_code: 'book' }]);
  const early = { weeklyGoals, collections } as unknown as EarlyGameRepository;
  return { api: new EngagementController({} as EngagementRepository, early), weeklyGoals, collections };
}

describe('owner weekly quest completed-only filter', () => {
  it('returns only DB-confirmed completed goals while keeping collections unchanged', async () => {
    const { api, weeklyGoals, collections } = controller([goal('done', true), goal('pending', false)]);
    const result = await api.earlyGame(request, '1');
    expect(result.goals).toEqual([goal('done', true)]);
    expect(result.collections).toEqual([{ book_code: 'book' }]);
    expect(weeklyGoals).toHaveBeenCalledWith(actor);
    expect(collections).toHaveBeenCalledWith(actor);
  });
  it('preserves the default unfiltered board', async () => {
    const { api } = controller([goal('done', true), goal('pending', false)]);
    expect((await api.earlyGame(request)).goals).toHaveLength(2);
  });
  it('rejects duplicate and invalid filters rather than silently dropping them', async () => {
    const { api } = controller([]);
    await expect(api.earlyGame(request, ['1', '1'])).rejects.toBeInstanceOf(BadRequestException);
    await expect(api.earlyGame(request, 'true')).rejects.toBeInstanceOf(BadRequestException);
  });
  it('fails closed if the database returns a non-boolean completion field', async () => {
    const { api } = controller([goal('forged', 'true')]);
    await expect(api.earlyGame(request, '1')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
