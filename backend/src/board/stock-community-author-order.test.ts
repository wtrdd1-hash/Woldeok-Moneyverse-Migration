import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { StockCommunityService } from './stock-community.service';
import { PublicStockCommunityController } from './stock-community.controller';

function database() {
  return { query: vi.fn(async () => ({ rows: [], rowCount: 0 })) } as unknown as Queryable;
}

describe('public board author order', () => {
  it('orders only the bounded public snapshot by exact C collation, then stable post ID', async () => {
    const db = database();
    const service = new StockCommunityService(db);
    await expect(service.publicList('WDX', '제주', 'author')).resolves.toEqual([]);
    const [sql, values] = vi.mocked(db.query).mock.calls[0] ?? [];
    expect(String(sql)).toContain('public.member_board_public_list_with_stock($1)');
    expect(String(sql)).toContain('ORDER BY author_name COLLATE "C" ASC, post_id ASC');
    expect(values).toEqual([50, 'WDX', '제주']);
  });

  it('rejects unsupported order before touching the database', async () => {
    const db = database();
    await expect(new StockCommunityService(db).publicList(undefined, undefined, 'random' as 'author')).rejects.toThrow('invalid board order');
    expect(db.query).not.toHaveBeenCalled();
  });

  it('returns an explicit author-order proof for empty results and rejects repeated/unknown sort', async () => {
    const community = { publicList: vi.fn(async () => []) } as unknown as StockCommunityService;
    const controller = new PublicStockCommunityController(community);
    await expect(controller.list({ sort: 'author' })).resolves.toEqual({ posts: [], sortApplied: 'author' });
    expect(community.publicList).toHaveBeenCalledWith(undefined, undefined, 'author');
    await expect(controller.list({ sort: ['author', 'author'] })).rejects.toThrow('invalid board order');
    await expect(controller.list({ sort: 'recent' })).rejects.toThrow('invalid board order');
    await expect(controller.list({ sort: 'author', extra: '1' })).rejects.toThrow('invalid board search');
  });
});
