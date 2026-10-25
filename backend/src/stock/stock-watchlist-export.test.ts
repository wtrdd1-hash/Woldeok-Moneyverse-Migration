import { describe, expect, it, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { StockController } from './stock.controller';
import type { StockService } from './stock.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: ACTOR } };

describe('stock watchlist export snapshot', () => {
  it('reads the authenticated actor, preserves large WLD strings and returns no extra member fields', async () => {
    const watchlist = vi.fn().mockResolvedValue([{
      stock_id: '22222222-2222-4222-8222-222222222222', symbol: 'WLD', name: 'Virtual Stock',
      current_price: '9007199254740993', day_open_price: '9007199254740992',
      created_at: new Date('2026-10-26T00:00:00Z'),
    }]);
    const controller = new StockController({ watchlist } as unknown as StockService);
    const result = await controller.watchlistExport(request as never);
    expect(watchlist).toHaveBeenCalledWith(ACTOR);
    expect(result.stocks).toHaveLength(1);
    expect(result.stocks[0]?.current_price).toBe('9007199254740993');
  });

  it('fails closed instead of silently truncating a watchlist larger than 100', async () => {
    const watchlist = vi.fn().mockResolvedValue(Array.from({ length: 101 }, (_, i) => ({ stock_id: String(i) })));
    const controller = new StockController({ watchlist } as unknown as StockService);
    await expect(controller.watchlistExport(request as never)).rejects.toThrow(ConflictException);
  });
});
