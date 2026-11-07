import { describe, expect, it, vi } from 'vitest';
import { StockCommunityService } from './stock-community.service';

describe('public board recent-window chronological order', () => {
  it('uses the existing 50-row SECURITY DEFINER source and parameterized ordering', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const service = new StockCommunityService({ query } as never);
    await service.publicList('WDX', 'keyword', 'oldest');
    expect(query).toHaveBeenCalledOnce();
    const [sql, values] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('public.member_board_public_list_with_stock($1)');
    expect(sql).toMatch(/ORDER BY/);
    expect(values).toEqual([50, 'WDX', 'keyword', 'oldest']);
    expect(sql).not.toContain('FROM public.member_board_posts');
  });
});
