import { describe, expect, it } from 'vitest';
import { DopamineController } from './dopamine.controller';
import type { RequestWithSession } from '../auth/session.context';

const request = {
  session: { user_id: '11111111-2222-4333-8444-555555555555' },
} as unknown as RequestWithSession;

describe('Bull/Bear vote authoritative receipt boundary', () => {
  it.each(['bull', 'bear'] as const)(
    'rejects %s votes with HTTP 503 rather than inventing a persisted vote or WLD eligibility',
    async (vote) => {
      const controller = new DopamineController(null);
      await expect(
        controller.voteBullBear(request, { vote, stockSymbol: 'CHIPS' }),
      ).rejects.toMatchObject({ status: 503 });
    },
  );

  it('reports that Bull/Bear voting is unavailable until server-owned receipts exist', async () => {
    const controller = new DopamineController(null);
    const status = await controller.getDopamineStatus(request);
    expect(status).toMatchObject({ bullBearVotingAvailable: false });
  });
});
