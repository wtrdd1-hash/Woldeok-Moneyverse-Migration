import { describe, expect, it } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { DopamineController } from './dopamine.controller';
import type { RequestWithSession } from '../auth/session.context';

const request = { session: { user_id: '11111111-2222-4333-8444-555555555555' } } as unknown as RequestWithSession;

describe('nonfinancial pet fortune preview', () => {
  it('returns an explicit preview without WLD, transaction or daily claim', async () => {
    const controller = new DopamineController(null);
    const result = await controller.previewPetFortune(request);
    expect(result).toMatchObject({ kind: 'preview', rewardPosted: false });
    expect(result.quote).toEqual(expect.any(String));
    expect(result.quote.length).toBeGreaterThan(8);
    expect(JSON.stringify(result)).not.toMatch(/rewardAmount|transactionId|claimedAt|affinityGained/);
  });

  it('fails closed for legacy reward POST instead of inventing 500-1000 WLD', async () => {
    const controller = new DopamineController(null);
    expect(() => controller.claimPetFortune(request, {
      petAction: 'fortune', idempotencyKey: '11111111-2222-4333-8444-555555555555',
    })).toThrow(ServiceUnavailableException);
  });

  it('does not claim daily fortune reward availability without a ledger receipt', async () => {
    const controller = new DopamineController(null);
    const status = await controller.getDopamineStatus(request);
    expect(status.fortuneCookieAvailable).toBe(false);
  });
});
