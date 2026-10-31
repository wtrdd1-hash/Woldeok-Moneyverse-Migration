import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { StockCommunityService } from './stock-community.service';
import { PublicStockCommunityController } from './stock-community.controller';

function pool() {
  return {
    query: vi.fn(async () => ({ rows: [], rowCount: 0 })),
  } as unknown as Queryable;
}

describe('StockCommunityService public discovery', () => {
  it('filters public stock discussions with a validated symbol', async () => {
    const database = pool();
    const service = new StockCommunityService(database);

    await expect(service.publicList(' wdx ')).resolves.toEqual([]);

    expect(database.query).toHaveBeenCalledTimes(1);
    const [sql, values] = vi.mocked(database.query).mock.calls[0] ?? [];
    expect(String(sql)).toContain('upper(stock_symbol) = upper($2)');
    expect(values).toEqual([50, 'wdx', null, null]);
  });

  it('rejects malformed symbols before querying PostgreSQL', async () => {
    const database = pool();
    const service = new StockCommunityService(database);

    await expect(service.publicList('WDX<script>')).rejects.toThrow('invalid stock symbol');
    expect(database.query).not.toHaveBeenCalled();
  });
});

describe('StockCommunityService recent public title search', () => {
  it('filters the latest 50 public rows in PostgreSQL using a literal case-insensitive title', async () => {
    const database = pool();
    const service = new StockCommunityService(database);
    await expect(service.publicList(' wdx ', '  WLD %_  ')).resolves.toEqual([]);
    const [sql, values] = vi.mocked(database.query).mock.calls[0] ?? [];
    expect(String(sql)).toContain('public.member_board_public_list_with_stock($1)');
    expect(String(sql)).toContain('strpos(lower(title), lower($3::text)) > 0');
    expect(values).toEqual([50, 'wdx', 'WLD %_', null]);
  });

  it.each(['', '   ', 'x'.repeat(81), 'bad\nline', '<script>'])(
    'rejects invalid title query %j before DB access',
    async (value) => {
      const database = pool();
      await expect(
        new StockCommunityService(database).publicList(undefined, value),
      ).rejects.toThrow('invalid title search');
      expect(database.query).not.toHaveBeenCalled();
    },
  );
});

describe('public board reply-presence discovery', () => {
  it.each([
    ['with', 'comment_count > 0'],
    ['without', 'comment_count = 0'],
  ] as const)('applies %s to the already bounded 50 public rows', async (replies, predicate) => {
    const database = pool();
    await expect(new StockCommunityService(database).publicList(undefined, undefined, replies)).resolves.toEqual([]);
    const [sql, values] = vi.mocked(database.query).mock.calls[0] ?? [];
    expect(String(sql)).toContain('public.member_board_public_list_with_stock($1)');
    expect(String(sql)).toContain(predicate);
    expect(values).toEqual([50, null, null, replies]);
  });

  it('combines symbol, title and reply filters without expanding the public scope', async () => {
    const database = pool();
    await new StockCommunityService(database).publicList(' wdx ', '  Market  ', 'with');
    const [, values] = vi.mocked(database.query).mock.calls[0] ?? [];
    expect(values).toEqual([50, 'wdx', 'Market', 'with']);
  });

  it('rejects unsupported reply filters before PostgreSQL access', async () => {
    const database = pool();
    await expect(
      new StockCommunityService(database).publicList(undefined, undefined, 'maybe' as 'with'),
    ).rejects.toThrow('invalid reply filter');
    expect(database.query).not.toHaveBeenCalled();
  });
});

describe('public board reply-presence HTTP contract', () => {
  it.each([['with', 'without'], ['maybe'], [''], [null]])(
    'rejects invalid or repeated reply query %j',
    async (value) => {
      const database = pool();
      const controller = new PublicStockCommunityController(new StockCommunityService(database));
      await expect(controller.list({ replies: value })).rejects.toThrow('invalid reply filter');
      expect(database.query).not.toHaveBeenCalled();
    },
  );
  it('forwards a valid reply filter to the bounded DB read', async () => {
    const database = pool();
    const controller = new PublicStockCommunityController(new StockCommunityService(database));
    await expect(controller.list({ replies: 'without' })).resolves.toEqual({ posts: [] });
    expect(vi.mocked(database.query).mock.calls[0]?.[1]).toEqual([50, null, null, 'without']);
  });
});
