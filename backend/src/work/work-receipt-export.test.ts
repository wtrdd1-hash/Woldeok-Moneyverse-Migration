import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import { WorkController } from './work.controller';
import type { WorkRepository } from './work.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: actor } } as RequestWithSession;

describe('owner-private bounded work reward receipt export', () => {
  it('reads only the session actor and advertises exactly the recent-20 scope', async () => {
    const receipts = vi.fn().mockResolvedValue([{ receipt_id: 'receipt-1', transaction_id: null }]);
    const controller = new WorkController({ receipts } as unknown as WorkRepository);
    await expect(controller.receiptsExport(request)).resolves.toEqual({
      scope: 'recent_20', limit: 20, receipts: [{ receipt_id: 'receipt-1', transaction_id: null }],
    });
    expect(receipts).toHaveBeenCalledExactlyOnceWith(actor);
  });

  it('fails closed if the repository is unavailable or violates its bounded SQL contract', async () => {
    await expect(new WorkController(null).receiptsExport(request)).rejects.toThrow(ServiceUnavailableException);
    const receipts = vi.fn().mockResolvedValue(Array.from({ length: 21 }, () => ({})));
    await expect(new WorkController({ receipts } as unknown as WorkRepository).receiptsExport(request))
      .rejects.toThrow(ServiceUnavailableException);
  });
});
