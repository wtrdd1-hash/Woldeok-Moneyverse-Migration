import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardTitleQuery } from './board-title-search';

describe('public board title search', () => {
  it('normalizes a bounded title query without inventing a global search', () => {
    expect(parseBoardTitleQuery(undefined)).toEqual({ query: null, invalid: false });
    expect(parseBoardTitleQuery('  제주  ')).toEqual({ query: '제주', invalid: false });
  });
  it.each(['', '   ', ['one', 'two'], 'x'.repeat(81), 'a\nb', '<script>'])(
    'rejects invalid query %j',
    (value) => {
      expect(parseBoardTitleQuery(value).invalid).toBe(true);
    },
  );
  it('renders accessible GET search and states the latest-50 scope, without indexing filtered results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('role="search"');
    expect(page).toContain('name="q"');
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('robots: { index: !hasSearch');
  });
});

describe('public board author search', () => {
  it('parses a single displayed public author without treating it as an identity', async () => {
    const { parseBoardAuthorQuery } = await import('./board-author-search');
    expect(parseBoardAuthorQuery(undefined)).toEqual({ query: null, invalid: false });
    expect(parseBoardAuthorQuery('  김%_  ')).toEqual({ query: '김%_', invalid: false });
    for (const invalid of ['', ['a', 'b'], 'x'.repeat(81), '<script>', 'a\nb']) {
      expect(parseBoardAuthorQuery(invalid).invalid).toBe(true);
    }
  });
  it('offers an accessible author filter and noindexes its results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="author"');
    expect(page).toContain('작성자 이름 검색');
    expect(page).toContain('params.author !== undefined');
  });
});
