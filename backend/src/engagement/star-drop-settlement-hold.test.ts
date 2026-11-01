import { describe, expect, it } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { DopamineController } from './dopamine.controller';

const request = { session: { user_id: '11111111-2222-4333-8444-555555555555' } } as unknown as RequestWithSession;

describe('Star Drop settlement integrity', () => {
  it('never reports an unposted reward as a successful ledger settlement', async () => {
    await expect(new DopamineController(null).claimStarDrop(request, {
      tapTier: 'legendary', idempotencyKey: 'd580efc9-2570-4f2c-a760-154965f58fa2',
    })).rejects.toMatchObject({ status: 503, response: { code: 'STAR_DROP_SETTLEMENT_UNAVAILABLE' } });
  });
  it('does not advertise unverified daily Star Drop eligibility', async () => {
    const status = await new DopamineController(null).getDopamineStatus(request);
    expect(status.starDropRemaining).toBe(0);
  });
});
