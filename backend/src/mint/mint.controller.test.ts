import { describe, expect, it, vi } from 'vitest';
import { MintController } from './mint.controller';
import type { MintService } from './mint.service';
import type { RequestWithSession } from '../auth/session.context';

describe('MintController canonical normalization', () => {
  it('returns seigniorage ledger without 503 error', async () => {
    const mockService = {
      getSeigniorageLedger: vi.fn().mockResolvedValue({
        nationalMintAuthority: '대한민국 국가조폐국 (Woldeok National Mint Bureau)',
        totalMintedM0Wld: '500000000',
        totalBurnedDestroyedWld: '1250000',
        netCirculationExpansionWld: '498750000',
      }),
    } as unknown as MintService;

    const controller = new MintController(mockService);
    const result = await controller.getSeigniorageLedger();
    expect(result).toHaveProperty('totalMintedM0Wld', '500000000');
    expect(result).toHaveProperty('netCirculationExpansionWld', '498750000');
  });

  it('allows burnCurrency without 503 error', async () => {
    const mockService = {
      burnCurrency: vi.fn().mockResolvedValue({
        certificateNumber: 'BURN-202611-001',
        amountWld: '100000',
        burnedAt: new Date().toISOString(),
      }),
    } as unknown as MintService;

    const controller = new MintController(mockService);
    const mockReq = {
      session: { user_id: '99999999-9999-4999-8999-999999999999' },
    } as unknown as RequestWithSession;

    const result = await controller.burnCurrency(
      { amountWld: '100000', sinkCategory: 'TREASURY', burnReason: '테스트 소각' },
      mockReq,
    );
    expect(result).toHaveProperty('certificateNumber', 'BURN-202611-001');
    expect(result).toHaveProperty('amountWld', '100000');
  });
});
