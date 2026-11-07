import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { StockCommunityService } from './stock-community.service';
import { PublicStockCommunityController } from './stock-community.controller';

function database() {
  return { query: vi.fn(async () => ({ rows: [], rowCount: 0 })) } as unknown as Queryable;
}

describe('recent public board stock-symbol order', () => {
  it('orders only the verified latest 50 public rows with untagged posts last', async () => {
    const db = database();
    await new StockCommunityService(db).publicList(undefined, undefined, 'stock');
    const [sql, values] = vi.mocked(db.query).mock.calls[0] ?? [];
    expect(String(sql)).toContain('public.member_board_public_list_with_stock($1)');
    expect(String(sql)).toContain('ORDER BY (stock_symbol IS NULL) ASC');
    expect(String(sql)).toContain('upper(stock_symbol) COLLATE "C" ASC');
    expect(String(sql)).toContain('post_id ASC');
    expect(values).toEqual([50, null, null]);
  });
  it('rejects unknown order before touching PostgreSQL', async () => {
    const db = database();
    await expect(new StockCommunityService(db).publicList(undefined, undefined, 'random')).rejects.toThrow('invalid board sort');
    expect(db.query).not.toHaveBeenCalled();
  });
  it('accepts stock ordering and rejects ambiguous/unknown query values at HTTP boundary', async () => {
    const service = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;
    const controller = new PublicStockCommunityController(service);
    await expect(controller.list({ sort: 'stock' })).resolves.toEqual({ posts: [], sortApplied: 'stock' });
    expect(service.publicList).toHaveBeenCalledWith(undefined, undefined, 'stock');
    for (const sort of ['wrong', '', ['stock', 'recent']]) {
      await expect(controller.list({ sort })).rejects.toMatchObject({ status: 400 });
    }
  });
});
