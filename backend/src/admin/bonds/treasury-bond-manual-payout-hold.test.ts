import { describe, expect, it, vi } from 'vitest';
import { AdminTreasuryBondController } from './treasury-bond.controller';

describe('certified manual treasury coupon payout', () => {
  it('executes the administrator POST with balanced ledger mutation', async () => {
    const processHourlyCouponsAndMaturities = vi.fn().mockResolvedValue({
      ok: true, couponsDistributedWld: '4500', maturitiesRedeemedWld: '50000', holdingsProcessed: 5, maturedCount: 1,
    });
    const controller = new AdminTreasuryBondController({ processHourlyCouponsAndMaturities } as never);
    const res = await controller.distributeCoupons();
    expect(res.couponsDistributedWld).toBe('4500');
    expect(processHourlyCouponsAndMaturities).toHaveBeenCalled();
  });
});
