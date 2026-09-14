import { describe, expect, it } from 'vitest';
import { upcomingShopDeadlines, type ShopDeadlineItem } from './shop-deadlines';

const item = (id: string, ends: string | null): ShopDeadlineItem => ({
  catalog_id: id,
  name: `Item ${id}`,
  category: 'limited',
  price: '1000',
  sale_ends_at: ends,
});

describe('upcomingShopDeadlines', () => {
  it('keeps only dated sale deadlines and sorts the soonest first', () => {
    expect(
      upcomingShopDeadlines([
        item('later', '2026-10-03T00:00:00.000Z'),
        item('none', null),
        item('soon', '2026-09-20T00:00:00.000Z'),
        item('invalid', 'not-a-date'),
      ]).map((entry) => entry.catalog_id),
    ).toEqual(['soon', 'later']);
  });

  it('honors the display limit without mutating the source order', () => {
    const source = [
      item('three', '2026-10-03T00:00:00.000Z'),
      item('one', '2026-10-01T00:00:00.000Z'),
      item('two', '2026-10-02T00:00:00.000Z'),
    ];
    expect(upcomingShopDeadlines(source, 2).map((entry) => entry.catalog_id)).toEqual([
      'one',
      'two',
    ]);
    expect(source.map((entry) => entry.catalog_id)).toEqual(['three', 'one', 'two']);
  });
});
