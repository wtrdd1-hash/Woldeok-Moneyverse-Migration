import { describe, expect, it, vi } from 'vitest';
import { AdminEnterpriseController } from './enterprise.controller';
import type { EnterpriseService } from './enterprise.service';
import type { RequestWithSession } from '../../auth/session.context';

describe('AdminEnterpriseController harvest retry contract', () => {
  it('forwards a caller-supplied idempotency key with the authenticated actor', async () => {
    const harvestSoeDividends = vi.fn().mockResolvedValue({
      total_dividends_collected: '0',
      enterprises_processed: 0,
      treasury_balance_after: '1000',
    });
    const controller = new AdminEnterpriseController({ harvestSoeDividends } as unknown as EnterpriseService);
    const request = { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as RequestWithSession;
    await controller.harvestSoeDividends(request, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    expect(harvestSoeDividends).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
  });
});
