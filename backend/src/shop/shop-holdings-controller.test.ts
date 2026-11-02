import { describe, expect, it, vi } from 'vitest';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('shop holdings owner-scoped API', () => {
  it('filters only the current member rows returned by the SQL read function', async () => {
    const holdings = vi.fn().mockResolvedValue([
      { code: 'ok', arrears_due: '0', unpaid_weeks: 0, suspended: false },
      { code: 'late', arrears_due: '9007199254740993', unpaid_weeks: 1, suspended: true },
    ]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    const result = await controller.holdings(request, 'attention');
    expect(holdings).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result.holdings).toEqual([
      { code: 'late', arrears_due: '9007199254740993', unpaid_weeks: 1, suspended: true },
    ]);
  });

  it('rejects an unsupported filter before reading any private data', async () => {
    const holdings = vi.fn();
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.holdings(request, 'everyone')).rejects.toMatchObject({ status: 400 });
    expect(holdings).not.toHaveBeenCalled();
  });
});

describe('attention proof and bigint preservation', () => {
  it('includes positive arrears without suspended or unpaid weeks and proves the applied filter', async () => {
    const holdings = vi.fn().mockResolvedValue([
      { catalog_id: '11111111-1111-4111-8111-111111111111', arrears_due: '9007199254740993', unpaid_weeks: 0, suspended: false },
      { catalog_id: '22222222-2222-4222-8222-222222222222', arrears_due: '0', unpaid_weeks: 0, suspended: false },
    ]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.holdings(request, 'attention')).resolves.toEqual({
      filter: 'attention', holdings: [{ catalog_id: '11111111-1111-4111-8111-111111111111', arrears_due: '9007199254740993', unpaid_weeks: 0, suspended: false }],
    });
  });
  it('proves even a genuinely empty filtered result', async () => {
    const holdings = vi.fn().mockResolvedValue([]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.holdings(request, 'attention')).resolves.toEqual({ filter: 'attention', holdings: [] });
  });
});

describe('attention source refusal', () => {
  it('returns unavailable instead of falsely claiming zero attention for malformed source', async () => {
    const holdings = vi.fn().mockResolvedValue([{ catalog_id: actor, arrears_due: 'invalid', unpaid_weeks: 0, suspended: false }]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.holdings(request, 'attention')).rejects.toMatchObject({ status: 503 });
  });
});

// Backwards-compatible default retains the full owner list and marks it as unfiltered.
describe('default owner holdings proof', () => {
  it('preserves all rows for default and explicit all filters', async () => {
    const holdings = vi.fn().mockResolvedValue([{ code: 'ok' }]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.holdings(request)).resolves.toEqual({ filter: 'all', holdings: [{ code: 'ok' }] });
    await expect(controller.holdings(request, 'all')).resolves.toEqual({ filter: 'all', holdings: [{ code: 'ok' }] });
  });
});
