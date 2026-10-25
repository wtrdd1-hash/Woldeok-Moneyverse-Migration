import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const HOLDING = {
  stock_id: '22222222-2222-4222-8222-222222222222', symbol: 'MVX', name: 'Virtual stock',
  quantity: '999999999999999999', average_cost: '999999999999999999999999999',
  market_value: '99999999999999999999999999999999999999', current_price: '42', halt_status: 'ACTIVE',
};
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
const controller = (rows: unknown) => new StockController({ portfolio: vi.fn().mockResolvedValue(rows) } as unknown as StockService);

describe('authenticated owner-only stock holdings export', () => {
  it('uses the authenticated actor and preserves canonical integer strings', async () => {
    const portfolio = vi.fn().mockResolvedValue([HOLDING]);
    const stocks = new StockController({ portfolio } as unknown as StockService);
    await expect(stocks.portfolioExport(request)).resolves.toEqual({ scope: 'current_holdings_only', holdings: [HOLDING] });
    expect(portfolio).toHaveBeenCalledWith(ACTOR);
  });
  it('fails closed on DB failure rather than inventing empty holdings', async () => {
    const stocks = new StockController({ portfolio: vi.fn().mockRejectedValue(new Error('DB down')) } as unknown as StockService);
    await expect(stocks.portfolioExport(request)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
  it('refuses malformed and oversized rows', async () => {
    for (const rows of [[{ ...HOLDING, market_value: 2 }], [{ ...HOLDING, quantity: '1e30' }], Array(101).fill(HOLDING), null]) {
      await expect(controller(rows).portfolioExport(request)).rejects.toBeInstanceOf(ServiceUnavailableException);
    }
  });
});
