import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StockDepthController } from './stock-depth.controller';
import type { StockService } from './stock.service';

const ID = '11111111-1111-4111-8111-111111111111';

describe('stock depth availability public contract', () => {
  it('reports no verified depth without inventing orders, even when stock exists', async () => {
    const list = vi.fn().mockResolvedValue([{ id: ID, current_price: '9007199254740993' }]);
    const controller = new StockDepthController({ list } as unknown as StockService);
    await expect(controller.depth(ID)).resolves.toEqual({
      stockId: ID,
      status: 'UNAVAILABLE',
      source: 'NO_VERIFIED_OPEN_ORDERS',
      bids: [],
      asks: [],
    });
    expect(list).toHaveBeenCalledOnce();
  });

  it('does not leak stock existence through a fabricated depth response', async () => {
    const controller = new StockDepthController({ list: vi.fn().mockResolvedValue([]) } as unknown as StockService);
    await expect(controller.depth(ID)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('exposes a read-only public depth path and fails closed without the service', async () => {
    expect(Reflect.getMetadata('path', StockDepthController.prototype.depth)).toBe(':id/depth');
    const controller = new StockDepthController(null);
    await expect(controller.depth(ID)).rejects.toMatchObject({ status: 503 });
  });

  it('fails closed if the database-backed catalogue cannot be read', async () => {
    const controller = new StockDepthController({ list: vi.fn().mockRejectedValue(new Error('db unavailable')) } as unknown as StockService);
    await expect(controller.depth(ID)).rejects.toThrow('db unavailable');
  });
});
