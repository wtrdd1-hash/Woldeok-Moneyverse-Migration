import { describe, expect, it, vi } from 'vitest';
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

  it('rejects even a large burn request without querying an unledgered function', () => {
    const query = vi.fn();
    const controller = new BurnEventController({ query } as unknown as Queryable);
    expect(() => controller.participateBurnDraw(user)).toThrowError(/Service Unavailable|verified ledger settlement/i);
    expect(query).not.toHaveBeenCalled();
  });
});
