import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardAuthorOrder } from './board-author-order';

describe('board author-order selection', () => {
  it('defaults to the unchanged recent view and accepts only explicit author order', () => {
    expect(parseBoardAuthorOrder(undefined)).toEqual({ order: null, invalid: false });
    expect(parseBoardAuthorOrder('author')).toEqual({ order: 'author', invalid: false });
    for (const value of ['recent', '', ['author', 'author'], 'author<script>']) {
      expect(parseBoardAuthorOrder(value).invalid).toBe(true);
    }
  });
  it('exposes an accessible GET selector and noindexes author-specific results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="sort"');
    expect(page).toContain('작성자 이름순');
    expect(page).toContain('hasAuthorSort');
  });
});
