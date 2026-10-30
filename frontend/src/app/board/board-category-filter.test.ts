import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardCategory } from './board-category-filter';

describe('public stock-linked board category filter', () => {
  it('allows no filter or a strict category only', () => {
    expect(parseBoardCategory(undefined)).toEqual({ category: null, invalid: false });
    expect(parseBoardCategory('')).toEqual({ category: null, invalid: false });
    expect(parseBoardCategory('analysis')).toEqual({ category: 'analysis', invalid: false });
  });
  it.each(['all', 'ANALYSIS', 'unknown', ['analysis', 'question'], '<script>'])(
    'rejects invalid category %j', (value) => {
      expect(parseBoardCategory(value).invalid).toBe(true);
    },
  );
  it('shows a labelled select and avoids indexing category-specific results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="category"');
    expect(page).toContain('id="board-category"');
    expect(page).toContain('params.category !== undefined');
    expect(page).toContain('최근 공개 게시글 50건');
  });
});
