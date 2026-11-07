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
    expect(values).toEqual([50, 'wdx', null, null, null]);
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
    expect(values).toEqual([50, 'wdx', 'WLD %_', null, null]);
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


describe('StockCommunityService public Seoul-day discovery', () => {
  it('bounds the verified latest-50 projection to one Asia/Seoul calendar day', async () => {
    const database = pool();
    await new StockCommunityService(database).publicList(undefined, undefined, '2026-11-01');
    const [sql, values] = vi.mocked(database.query).mock.calls[0] ?? [];
    expect(String(sql)).toContain('created_at >= $4::timestamptz');
    expect(String(sql)).toContain('created_at < $5::timestamptz');
    expect(values).toEqual([50, null, null, '2026-10-31T15:00:00.000Z', '2026-11-01T15:00:00.000Z']);
  });
  it.each(['2026-02-30', '2026-2-1', '2026-13-01', '2026-11-01T00:00:00Z', '1900-01-01'])('rejects invalid day %s', async day => {
    const database = pool();
    await expect(new StockCommunityService(database).publicList(undefined, undefined, day)).rejects.toThrow('invalid board day');
    expect(database.query).not.toHaveBeenCalled();
  });
});
