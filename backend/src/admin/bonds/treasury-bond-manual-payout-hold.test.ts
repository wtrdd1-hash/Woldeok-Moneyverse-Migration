import { describe, expect, it, vi } from 'vitest';
import { AdminTreasuryBondController } from './treasury-bond.controller';

describe('uncertified manual treasury coupon payout', () => {
  it('refuses the administrator POST without invoking ledger mutation', async () => {
    const processHourlyCouponsAndMaturities = vi.fn();
    const controller = new AdminTreasuryBondController({ processHourlyCouponsAndMaturities } as never);
    await expect(controller.distributeCoupons()).rejects.toMatchObject({ status: 503 });
    expect(processHourlyCouponsAndMaturities).not.toHaveBeenCalled();
  });
});
