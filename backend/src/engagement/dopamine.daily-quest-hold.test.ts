import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-2222-4333-8444-555555555555';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const input = { actorUserId: actor, idempotencyKey: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', questId: 'quest_stock_analysis' };

describe('daily quest payout boundary', () => {
  it('rejects mutation at the HTTP controller without calling a repository', async () => {
    const claimDailyQuest = vi.fn();
    const controller = new DopamineController({ claimDailyQuest } as unknown as DopamineRepository);
    await expect(controller.claimDailyQuest(request, { questId: input.questId, idempotencyKey: input.idempotencyKey }))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(claimDailyQuest).not.toHaveBeenCalled();
  });

  it('rejects direct repository mutation before any SQL query', async () => {
    const query = vi.fn();
    const repository = new DopamineRepository({ query } as unknown as Queryable);
    await expect(repository.claimDailyQuest(input)).rejects.toThrow(/unavailable|disabled|not certified/i);
    expect(query).not.toHaveBeenCalled();
  });

  it('does not fabricate an empty server status when the repository is unavailable', async () => {
    const controller = new DopamineController(null);
    await expect(controller.getDailyQuestStatus(request)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('reads only the authenticated actor ledger rows for verified claim status', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [
      { policy_version: 'quest.daily.quest_savings_deposit' },
      { policy_version: 'quest.daily.all_clear' },
    ] });
    const repository = new DopamineRepository({ query } as unknown as Queryable);
    const result = await repository.getDailyQuestStatus(actor);
    expect(result).toEqual({ claimedQuests: { quest_savings_deposit: true }, allClearClaimed: true, totalEarnedToday: 3000 });
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[1]).toEqual([actor]);
    expect(query.mock.calls[0]?.[0]).toMatch(/actor_user_id = \$1::uuid/);
  });

});
