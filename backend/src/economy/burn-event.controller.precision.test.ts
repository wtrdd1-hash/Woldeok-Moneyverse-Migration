import { describe, expect, it } from 'vitest';
import { BurnEventController } from './burn-event.controller';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';

const user = { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as unknown as RequestWithSession;

describe('burn-draw WLD overflow protection', () => {
  it('returns the exact posted WLD amount as a string even beyond 100 digits', async () => {
    const longAmount = '9'.repeat(100);
    const pool = { query: async (statement: string) => statement.includes('SUM(burn_amount)')
      ? { rows: [{ total_burned: longAmount, total_participants: '3' }] }
      : { rows: [{ display_name: 'user', reward_title: 'title', burn_amount: longAmount, created_at: '2026-10-14' }] } } as unknown as Queryable;
    const result = await new BurnEventController(pool).getEventStats();
    expect(result.totalBurnedWld).toBe(longAmount);
    expect(result.recentWinners[0]?.burnAmount).toBe(longAmount);
  });

  it('passes a huge canonical string to numeric SQL rather than Number', async () => {
    const amount = '9'.repeat(100);
    let params: unknown[] = [];
    const pool = { query: async (_sql: string, values: unknown[]) => {
      params = values;
      return { rows: [{ participate_anti_inflation_burn_draw: { success: true } }] };
    } } as unknown as Queryable;
    const controller = new BurnEventController(pool);
    await controller.participateBurnDraw(user, { burnAmount: amount });
    expect(params[1]).toBe(amount);
    await expect(controller.participateBurnDraw(user, { burnAmount: Number.MAX_SAFE_INTEGER + 2 })).rejects.toThrow();
  });
});
