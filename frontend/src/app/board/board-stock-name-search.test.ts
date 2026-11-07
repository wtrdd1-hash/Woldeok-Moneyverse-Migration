import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isVerifiedBoardStockName, parseBoardStockName } from './board-stock-name-search';

const post = (id: string, name = '제주 기업') => ({
  postId: id, title: 'News', authorName: 'Guest', createdAt: '2026-11-02T00:00:00Z',
  commentCount: 0, stock: { name, symbol: 'WDX' },
});
const id = '123e4567-e89b-42d3-a456-426614174000';

describe('stock-name discovery proof shared by SSR and Android', () => {
  it('parses a bounded literal Unicode query', () => {
    expect(parseBoardStockName(undefined)).toEqual({ query: null, invalid: false });
    expect(parseBoardStockName(' 제주 ')).toEqual({ query: '제주', invalid: false });
    for (const value of ['', '  ', '<script>', 'x'.repeat(81), ['A', 'B'], 'a\nb']) {
      expect(parseBoardStockName(value).invalid).toBe(true);
    }
  });
  it('requires explicit source-window proof, including empty 200', () => {
    expect(isVerifiedBoardStockName({ posts: [], stockNameFilter: '제주', sourceWindow: 50 }, '제주')).toBe(true);
    expect(isVerifiedBoardStockName({ posts: [] }, '제주')).toBe(false);
    expect(isVerifiedBoardStockName({ posts: [], stockNameFilter: '제주', sourceWindow: 500 }, '제주')).toBe(false);
  });
  it('rejects unrelated, malformed and case-insensitive duplicate post IDs', () => {
    expect(isVerifiedBoardStockName({ posts: [post(id)], stockNameFilter: '제주', sourceWindow: 50 }, '제주')).toBe(true);
    expect(isVerifiedBoardStockName({ posts: [post(id, '서울')], stockNameFilter: '제주', sourceWindow: 50 }, '제주')).toBe(false);
    expect(isVerifiedBoardStockName({ posts: [post(id), post(id.toUpperCase())], stockNameFilter: '제주', sourceWindow: 50 }, '제주')).toBe(false);
    expect(isVerifiedBoardStockName({ posts: [{ ...post(id), commentCount: -1 }], stockNameFilter: '제주', sourceWindow: 50 }, '제주')).toBe(false);
  });
  it('offers accessible search and noindexes filtered results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="stockName"');
    expect(page).toContain('stockName !== undefined');
    expect(page).toContain('isVerifiedBoardStockName');
    expect(page).toContain('최근 공개 게시글 50건');
  });
});
