import { describe, expect, it } from 'vitest';
import { upcomingShopDeadlines, type ShopDeadlineItem } from './shop-deadlines';

const NOW = Date.parse('2026-09-19T00:00:00.000Z');

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
      ], NOW).map((entry) => entry.catalog_id),
    ).toEqual(['soon', 'later']);
  });

  it('excludes expired and exactly-ended offers even if the API still lists them', () => {
    expect(upcomingShopDeadlines([
      item('expired', '2026-09-18T23:59:59.999Z'),
      item('ends-now', '2026-09-19T00:00:00.000Z'),
      item('future', '2026-09-19T00:00:00.001Z'),
      item('missing', null),
      item('invalid', 'invalid'),
    ], NOW).map((entry) => entry.catalog_id)).toEqual(['future']);
  });

  it('honors the display limit without mutating the source order', () => {
    const source = [
      item('three', '2026-10-03T00:00:00.000Z'),
      item('one', '2026-10-01T00:00:00.000Z'),
      item('two', '2026-10-02T00:00:00.000Z'),
    ];
    expect(upcomingShopDeadlines(source, NOW, 2).map((entry) => entry.catalog_id)).toEqual([
      'one',
      'two',
    ]);
    expect(source.map((entry) => entry.catalog_id)).toEqual(['three', 'one', 'two']);
  });
});
