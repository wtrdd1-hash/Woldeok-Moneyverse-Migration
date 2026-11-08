import { describe, expect, it, vi } from 'vitest';
import { CentralBankController } from './central-bank.controller';
import type { CentralBankService } from './central-bank.service';
import type { DurableCentralBankPolicyService } from './durable-policy.service';

describe('CentralBankController canonical normalization', () => {
  it('returns monetary aggregates without 503 error', async () => {
    const mockService = {
      getMonetaryAggregates: vi.fn().mockResolvedValue({
        centralBankAuthority: '대한민국 국가중앙은행 (Woldeok Central Bank)',
        m0BaseMoneyWld: '196134971',
        m1NarrowMoneyWld: '353042947',
        m2BroadMoneyWld: '847303072',
        moneyMultiplier: '4.32',
      }),
    } as unknown as CentralBankService;

    const mockDurable = {
      getBaseRate: vi.fn().mockResolvedValue({ ratePercent: '3.75' }),
      getReserveRequirement: vi.fn().mockResolvedValue({ ratioPercent: '7.00' }),
    } as unknown as DurableCentralBankPolicyService;

    const controller = new CentralBankController(mockService, mockDurable);
    const result = await controller.getMonetaryAggregates();
    expect(result).toHaveProperty('m0BaseMoneyWld', '196134971');
    expect(result).toHaveProperty('moneyMultiplier', '4.32');
  });

  it('returns commercial rates mapped to durable policy', async () => {
    const mockService = {
      getCommercialBankRates: vi.fn().mockReturnValue({
        commercialBorrowRatePercent: '5.25',
        commercialSupplyRatePercent: '2.75',
        netInterestMarginBps: 250,
      }),
    } as unknown as CentralBankService;

    const mockDurable = {
      getBaseRate: vi.fn().mockResolvedValue({ ratePercent: '3.75' }),
      getReserveRequirement: vi.fn().mockResolvedValue({ ratioPercent: '7.00' }),
    } as unknown as DurableCentralBankPolicyService;

    const controller = new CentralBankController(mockService, mockDurable);
    const result = await controller.getCommercialRates();
    expect(result).toHaveProperty('commercialBorrowRatePercent', '5.25');
  });
});
