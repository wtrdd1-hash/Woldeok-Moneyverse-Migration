import { describe, expect, it, vi } from 'vitest';
import { MintController } from '../../mint/mint.controller';
import { MintService } from '../../mint/mint.service';
import { CentralBankController } from '../../central-bank/central-bank.controller';
import { CentralBankService } from '../../central-bank/central-bank.service';
import { DurableCentralBankPolicyService } from '../../central-bank/durable-policy.service';
import { MonetaryController } from './monetary.controller';
import { AdminTreasuryController } from '../../admin/treasury/treasury.controller';
import { TreasuryService } from '../../admin/treasury/treasury.service';
import { AutoSovereignWealthFundService } from '../../admin/treasury/auto-swf.service';

describe('v1415 unsafe finance operations fail closed', () => {
  const unavailable = { response: { code: expect.any(String) }, status: 503 };

  it('mint controller delegates to canonical mint service and returns certified batches', async () => {
    const mintService = new MintService();
    const c = new MintController(mintService);
    const batches = await c.getBatches();
    expect(Array.isArray(batches)).toBe(true);
    const ledger = await c.getSeigniorageLedger();
    expect(ledger).toHaveProperty('nationalMintAuthority');
    const certs = await c.getAuditCertificates();
    expect(Array.isArray(certs)).toBe(true);
  });

  it('central bank controller returns live aggregates and calculates commercial rates', async () => {
    const mintService = new MintService();
    const centralBankService = new CentralBankService(mintService);
    const durablePolicy = new DurableCentralBankPolicyService(null);
    const c = new CentralBankController(centralBankService, durablePolicy);

    const aggregates = await c.getMonetaryAggregates();
    expect(aggregates).toHaveProperty('m0BaseMoneyWld');
    expect(aggregates).toHaveProperty('m1NarrowMoneyWld');
    expect(aggregates).toHaveProperty('m2BroadMoneyWld');

    const rates = await c.getCommercialRates();
    expect(rates).toHaveProperty('commercialBorrowRatePercent');
    expect(rates).toHaveProperty('commercialSupplyRatePercent');
  });

  it('durable central bank GET and audited PUT fail closed when the canonical policy database is unavailable', async () => {
    const c = new CentralBankController({} as CentralBankService, new DurableCentralBankPolicyService(null));
    const req = { session: { user_id: '00000000-0000-4000-8000-000000000001' } } as never;
    const rate = { baseRatePercent: '4.00', targetInflationPercent: '2.00',
      rateDecisionRationale: 'Insufficient reconciled banking evidence' } as never;
    const reserve = { reserveRatioPercent: '8.00',
      regulationRationale: 'Insufficient reconciled banking evidence' } as never;
    for (const call of [() => c.getBaseRate(), () => c.getReserveRequirement(),
      () => c.updateBaseRate(rate, req), () => c.updateReserveRequirement(reserve, req)]) {
      await expect(call()).rejects.toMatchObject({ status: 503 });
    }
  });

  it('database mint executes authorized mint and unsupported auto-regulation cannot execute on admin API', async () => {
    const executeAuthorizedMint = vi.fn().mockResolvedValue({ id: 'cert-1', amount_wld: '10' });
    const evaluateAndExecute = vi.fn();
    const c = new MonetaryController({} as never, { executeAuthorizedMint } as never,
      { evaluateAndExecute } as never);
    const req = { session: { user_id: '00000000-0000-4000-8000-000000000001' } } as never;
    const res = await c.executeMint(req, { policy_order_id: 'x', amount_wld: '10', idempotency_key: 'x' });
    expect(res).toEqual({ id: 'cert-1', amount_wld: '10' });
    expect(executeAuthorizedMint).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', 'x', '10', null, 'x');
    await expect(c.runAutoRegulationManually({} as never)).rejects.toMatchObject(unavailable);
    expect(evaluateAndExecute).not.toHaveBeenCalled();
  });

  it('manual SWF rebalance/liquidation fail closed before touching DB state', async () => {
    const evaluateAndRebalance = vi.fn();
    const liquidateToTreasuryVault = vi.fn();
    const c = new AdminTreasuryController({} as TreasuryService,
      { evaluateAndRebalance, liquidateToTreasuryVault } as unknown as AutoSovereignWealthFundService);
    await expect(c.triggerSwfRebalance()).rejects.toMatchObject(unavailable);
    await expect(c.liquidateSwfToTreasury('20000000')).rejects.toMatchObject(unavailable);
    expect(evaluateAndRebalance).not.toHaveBeenCalled();
    expect(liquidateToTreasuryVault).not.toHaveBeenCalled();
  });
});

describe('v1415 treasury canonical settlement gate', () => {
  it('rejects finance-changing admin routes before direct balance updates', async () => {
    const service = {
      injectFunds: vi.fn(), absorbFunds: vi.fn(), disburseCitizenDividend: vi.fn(),
      disburseTargetedSubsidy: vi.fn(), userDonate: vi.fn(), disburseGrant: vi.fn(),
      distributeBudgetRule: vi.fn(), executeMarketBuybackBurn: vi.fn(), executeWealthTax: vi.fn(),
    };
    const controller = new AdminTreasuryController(service as unknown as TreasuryService);
    const request = {} as never, dto = {} as never;
    for (const call of [
      () => controller.injectFunds(request, dto), () => controller.absorbFunds(request, dto),
      () => controller.disburseDividend(request, dto), () => controller.disburseTargetedSubsidy(request, dto),
      () => controller.userDonate(request, dto), () => controller.disburseGrant(request, dto),
      () => controller.distributeBudget(request, dto), () => controller.buybackBurn(request, dto),
      () => controller.executeWealthTax(request, dto),
    ]) {
      await expect(call()).rejects.toMatchObject({ status: 503, response: { code: 'TREASURY_SETTLEMENT_UNVERIFIED' } });
    }
    expect(Object.values(service).every((spy) => spy.mock.calls.length === 0)).toBe(true);
  });

  it('forbids re-enabling an unverified automatic monetary engine', async () => {
    const updateConfig = vi.fn();
    const c = new MonetaryController({} as never, {} as never, { updateConfig } as never);
    await expect(c.updateAutoRegulation({ is_enabled: true })).rejects.toMatchObject({ status: 503 });
    expect(updateConfig).not.toHaveBeenCalled();
  });
});
