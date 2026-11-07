import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PublicStockCommunityController } from './stock-community.controller';
import { StockCommunityService } from './stock-community.service';

describe('bounded public board stock-name discovery', () => {
  it('uses a literal case-insensitive parameterized stock name after the latest 50 source window', async () => {
    const database = { query: vi.fn(async () => ({ rows: [], rowCount: 0 })) } as unknown as Queryable;
    const service = new StockCommunityService(database);
    await expect(service.publicList('WDX', '  news ', '  제주 %_  ')).resolves.toEqual([]);
    const [sql, args] = vi.mocked(database.query).mock.calls[0]!;
    expect(String(sql)).toContain('public.member_board_public_list_with_stock($1)');
    expect(String(sql)).toContain('strpos(lower(stock_name), lower($4::text)) > 0');
    expect(args).toEqual([50, 'WDX', 'news', '제주 %_']);
  });

  it.each(['', '   ', 'x'.repeat(81), '<bad>', 'a\nb'])(
    'rejects invalid stock-name search before DB access: %j', async (value) => {
      const database = { query: vi.fn() } as unknown as Queryable;
      await expect(new StockCommunityService(database).publicList(undefined, undefined, value))
        .rejects.toThrow('invalid stock name');
      expect(database.query).not.toHaveBeenCalled();
    },
  );

  it('returns a source proof even for a verified empty stock-name result', async () => {
    const service = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;
    const controller = new PublicStockCommunityController(service);
    await expect(controller.list({ stockName: ' 제주 ' })).resolves.toEqual({
      posts: [], stockNameFilter: '제주', sourceWindow: 50,
    });
    expect(service.publicList).toHaveBeenCalledWith(undefined, undefined, ' 제주 ');
  });

  it.each([{ stockName: ['A', 'B'] }, { stockName: '' }, { stockName: '<script>' },
    { stockName: 'a', unexpected: '1' }])('rejects invalid/ambiguous stock-name query', async (query) => {
    const service = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;
    await expect(new PublicStockCommunityController(service).list(query))
      .rejects.toMatchObject({ status: 400 });
    expect(service.publicList).not.toHaveBeenCalled();
  });
});
