import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardStockSort } from './board-stock-sort';

describe('public board stock-symbol sort', () => {
  it('accepts only recent and stock as a single sort parameter', () => {
    expect(parseBoardStockSort(undefined)).toEqual({ sort: 'recent', invalid: false });
    expect(parseBoardStockSort('stock')).toEqual({ sort: 'stock', invalid: false });
    expect(parseBoardStockSort('recent')).toEqual({ sort: 'recent', invalid: false });
    for (const input of ['', ['stock', 'recent'], 'oldest', '<script>']) {
      expect(parseBoardStockSort(input).invalid).toBe(true);
    }
  });
  it('renders labelled GET sort control and excludes sorted results from indexing', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="sort"');
    expect(page).toContain('종목 기호순');
    expect(page).toContain('params.sort !== undefined');
  });
});
