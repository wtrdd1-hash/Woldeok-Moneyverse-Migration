import { describe, expect, it, vi } from 'vitest';
import { MarketplaceController } from './marketplace.controller';
import type { MarketplaceService } from './marketplace.service';
import type { RequestWithSession } from '../auth/session.context';

describe('P2P swap ledger safety boundary', () => {
  it('rejects every direct-trade route before invoking unjournaled SQL mutations or unsafe reads', async () => {
    const service = {
      listTrades: vi.fn(),
      createTrade: vi.fn(),
      acceptTrade: vi.fn(),
      confirmTrade: vi.fn(),
      cancelTrade: vi.fn(),
    };
    const controller = new MarketplaceController(service as unknown as MarketplaceService);
    const req = { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as RequestWithSession;
    const id = '22222222-2222-4222-8222-222222222222';
    const calls = [
      () => controller.listTrades(req),
      () => controller.createTrade(req, { recipientName: 'peer', offeredWld: '1000' }),
      () => controller.acceptTrade(req, id),
      () => controller.confirmTrade(req, id),
      () => controller.cancelTrade(req, id),
    ];
    for (const call of calls) {
      await expect(Promise.resolve().then(call)).rejects.toMatchObject({ status: 503 });
    }
    expect(Object.values(service).every((fn) => fn.mock.calls.length === 0)).toBe(true);
  });
});

describe('P2P service is fail-closed even when invoked outside HTTP controller', () => {
  it('never queries or updates a member ledger or trade table', async () => {
    const query = vi.fn();
    const { MarketplaceService } = await import('./marketplace.service');
    const service = new MarketplaceService({ query } as never);
    const actor = '11111111-1111-4111-8111-111111111111';
    const tradeId = '22222222-2222-4222-8222-222222222222';
    await expect(service.listTrades(actor)).rejects.toMatchObject({ status: 503 });
    await expect(service.createTrade(actor, { recipientName: 'peer' })).rejects.toMatchObject({ status: 503 });
    await expect(service.acceptTrade(actor, tradeId)).rejects.toMatchObject({ status: 503 });
    await expect(service.confirmTrade(actor, tradeId)).rejects.toMatchObject({ status: 503 });
    await expect(service.cancelTrade(actor, tradeId)).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });
});
