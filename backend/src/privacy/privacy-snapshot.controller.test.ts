import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { PrivacyController } from './privacy.controller';
import type { PrivacyRequestService } from './privacy.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('privacy request intake snapshot', () => {
  it('reads only the session actor with a fixed 30-row limit and honest intake scope', async () => {
    const myRequests = vi.fn().mockResolvedValue([{
      requestId: '22222222-2222-4222-8222-222222222222', requestType: 'access',
      status: 'received', detail: null, createdAt: '2026-10-26T00:00:00.000Z',
    }]);
    const controller = new PrivacyController({ myRequests } as unknown as PrivacyRequestService);
    const request = { session: { user_id: ACTOR }, query: { userId: 'foreign-id', limit: 999 } } as unknown as RequestWithSession;
    await expect(controller.snapshot(request)).resolves.toMatchObject({
      scope: 'recent_intake_receipts', limit: 30, requests: [{ requestType: 'access', status: 'received' }],
    });
    expect(myRequests).toHaveBeenCalledWith(ACTOR, { limit: 30 });
  });

  it('does not report a success when the owner lookup fails', async () => {
    const myRequests = vi.fn().mockRejectedValue(new Error('database unavailable'));
    const controller = new PrivacyController({ myRequests } as unknown as PrivacyRequestService);
    await expect(controller.snapshot({ session: { user_id: ACTOR } } as RequestWithSession)).rejects.toThrow('database unavailable');
  });
});
