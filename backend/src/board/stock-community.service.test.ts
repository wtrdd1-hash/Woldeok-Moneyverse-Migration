import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { StockCommunityService } from './stock-community.service';

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
    expect(values).toEqual([50, 'wdx', null]);
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
    expect(values).toEqual([50, 'wdx', 'WLD %_']);
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

describe('public board identity source proof', () => {
  const valid = {
    post_id: '11111111-1111-4111-8111-111111111111', title: 'Visible discussion',
    author_name: 'Member', created_at: '2026-11-02T12:00:00.000Z', updated_at: null,
    comment_count: '0', mine: false, image_storage_key: null, image_alt_text: null,
    primary_stock_id: null, stock_symbol: null, stock_name: null,
    category: null, stance: null, position_disclosure: null,
  };
  it('rejects an invalid PostgreSQL post identifier rather than producing a broken link', async () => {
    const database = { query: vi.fn(async () => ({ rows: [{ ...valid, post_id: 'not-a-uuid' }], rowCount: 1 })) } as unknown as Queryable;
    await expect(new StockCommunityService(database).publicList()).rejects.toThrow('invalid public board post id');
  });
  it('rejects duplicate identifiers even when PostgreSQL varies their case', async () => {
    const database = { query: vi.fn(async () => ({ rows: [valid, { ...valid, post_id: valid.post_id.toUpperCase() }], rowCount: 2 })) } as unknown as Queryable;
    await expect(new StockCommunityService(database).publicList()).rejects.toThrow('duplicate public board post id');
  });
  it('rejects public rows that falsely claim private ownership', async () => {
    const database = { query: vi.fn(async () => ({ rows: [{ ...valid, mine: true }], rowCount: 1 })) } as unknown as Queryable;
    await expect(new StockCommunityService(database).publicList()).rejects.toThrow('invalid public board ownership');
  });
});
