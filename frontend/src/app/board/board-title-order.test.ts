import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardTitleOrder } from './board-title-order';

describe('board title-order selection', () => {
  it('defaults to the unchanged recent view and accepts only explicit title order', () => {
    expect(parseBoardTitleOrder(undefined)).toEqual({ order: null, invalid: false });
    expect(parseBoardTitleOrder('title')).toEqual({ order: 'title', invalid: false });
    for (const value of ['recent', '', ['title', 'title'], 'title<script>']) {
      expect(parseBoardTitleOrder(value).invalid).toBe(true);
    }
  });
  it('exposes an accessible GET selector and noindexes title-specific results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="sort"');
    expect(page).toContain('제목 문자순');
    expect(page).toContain('hasTitleSort');
  });
});
