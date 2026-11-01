import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { PostgresStockRepository } from './stock.repository';

describe('public active market event direction filter', () => {
  it.each(['', 'all', 'UP', 'down ', ['up', 'down'], null, {}, 'sideways'])(
    'rejects invalid direction %j before service access', async (direction) => {
      const service = { marketEvents: vi.fn(async () => []) };
      const controller = new StockController(service as unknown as StockService);
      await expect(controller.marketEvents(direction as string)).rejects.toBeInstanceOf(BadRequestException);
      expect(service.marketEvents).not.toHaveBeenCalled();
    },
  );
  it('passes only canonical directions and keeps legacy no-filter behavior', async () => {
    const service = { marketEvents: vi.fn(async () => []) };
    const controller = new StockController(service as unknown as StockService);
    await controller.marketEvents('up');
    await controller.marketEvents('down');
    await controller.marketEvents(undefined);
    expect(service.marketEvents.mock.calls).toEqual([['up'], ['down'], [undefined]]);
  });
  it('applies the filter in SQL over the SECURITY DEFINER projection', async () => {
    const queries: { text: string; values?: readonly unknown[] }[] = [];
    const repository = new PostgresStockRepository({
      query: async (text: string, values?: readonly unknown[]) => {
        queries.push({ text, values });
        return { rows: [] };
      },
    } as never);
    await repository.marketEvents('down');
    expect(queries[0]?.text).toContain('public.stock_market_events_active()');
    expect(queries[0]?.text).toMatch(/WHERE\s+direction::text\s*=\s*\$1/);
    expect(queries[0]?.values).toEqual(['down']);
    await repository.marketEvents();
    expect(queries[1]?.text).not.toContain('WHERE');
  });
});
