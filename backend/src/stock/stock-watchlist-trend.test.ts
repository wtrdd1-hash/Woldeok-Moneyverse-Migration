import 'reflect-metadata';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { StockController } from './stock.controller';
import type { StockService } from './stock.service';
import { filterWatchlistTrend, parseWatchlistTrend } from './stock-watchlist-trend';

const OWNER = '00000000-0000-4000-8000-000000000011';
const row = (price: string, open: string) => ({
  stock_id: '00000000-0000-4000-8000-000000000012', symbol: 'WLD', name: 'WLD',
  current_price: price, day_open_price: open, created_at: new Date('2026-10-30T00:00:00Z'),
});
const request = { session: { user_id: OWNER } } as never;

describe('owner watchlist trend read contract', () => {
  it('rejects malformed and repeated trend values before DB access', async () => {
    const service = { watchlist: vi.fn(async () => []) };
    const subject = new StockController(service as unknown as StockService);
    for (const invalid of ['', 'UP', 'rise', '0', ['up', 'down'], ['up'], null, {}]) {
      await expect(subject.watchlist(request, invalid as never)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(service.watchlist).not.toHaveBeenCalled();
  });
  it('binds the owner from the session and preserves the default', async () => {
    const service = { watchlist: vi.fn(async () => [row('10', '9')]) };
    const subject = new StockController(service as unknown as StockService);
    await expect(subject.watchlist(request, 'up')).resolves.toEqual({ stocks: [row('10', '9')] });
    await subject.watchlist(request);
    expect(service.watchlist).toHaveBeenNthCalledWith(1, OWNER, 'up');
    expect(service.watchlist).toHaveBeenNthCalledWith(2, OWNER, 'all');
  });
  it('uses exact bigint comparison and excludes missing open prices', () => {
    const rows = [row('9007199254740993', '9007199254740992'), row('5', '6'), row('5', '5'), row('10', '0')];
    expect(filterWatchlistTrend(rows as never, 'up')).toEqual([rows[0]]);
    expect(filterWatchlistTrend(rows as never, 'down')).toEqual([rows[1]]);
    expect(filterWatchlistTrend(rows as never, 'flat')).toEqual([rows[2]]);
    expect(filterWatchlistTrend(rows as never, 'all')).toEqual(rows);
  });
  it('fails closed for malformed price evidence on selected filters', () => {
    for (const bad of ['1.5', '01', '-1', 'Infinity', '9e3', '']) {
      expect(() => filterWatchlistTrend([row(bad, '1')] as never, 'up')).toThrow(ServiceUnavailableException);
    }
    expect(parseWatchlistTrend('flat')).toBe('flat');
    expect(parseWatchlistTrend(undefined)).toBe('all');
  });
});
