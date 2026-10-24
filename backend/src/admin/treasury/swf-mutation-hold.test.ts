import { describe, expect, it, vi } from 'vitest';
import { AdminTreasuryController } from './treasury.controller';
import type { TreasuryService } from './treasury.service';
import type { AutoSovereignWealthFundService } from './auto-swf.service';

describe('P0 SWF financial write containment', () => {
  const swf = {
    evaluateAndRebalance: vi.fn(),
    liquidateToTreasuryVault: vi.fn(),
    updateConfig: vi.fn(),
  };
  const controller = new AdminTreasuryController(
    {} as TreasuryService,
    swf as unknown as AutoSovereignWealthFundService,
  );

  it.each([
    ['rebalance', () => controller.triggerSwfRebalance()],
    ['liquidate', () => controller.liquidateSwfToTreasury('20000000')],
    ['configuration', () => controller.updateSwfConfig({ is_enabled: true })],
  ])('rejects %s before any SWF service mutation', async (_name, action) => {
    vi.clearAllMocks();
    await expect(action()).rejects.toMatchObject({ status: 503 });
    expect(swf.evaluateAndRebalance).not.toHaveBeenCalled();
    expect(swf.liquidateToTreasuryVault).not.toHaveBeenCalled();
    expect(swf.updateConfig).not.toHaveBeenCalled();
  });
});
