import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardAuthorQuery } from './board-author-search';

describe('public board author search', () => {
  it('normalizes a public author name within the latest 50 only', () => {
    expect(parseBoardAuthorQuery(undefined)).toEqual({ query: null, invalid: false });
    expect(parseBoardAuthorQuery('  민수  ')).toEqual({ query: '민수', invalid: false });
  });
  it.each(['', '  ', ['one', 'two'], 'x'.repeat(41), 'a\nb', '<b>'])(
    'rejects invalid author query %j', (value) => {
      expect(parseBoardAuthorQuery(value).invalid).toBe(true);
    },
  );
  it('renders a labeled author field and keeps filtered results out of indexing', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="author"');
    expect(page).toContain('게시글 작성자 검색');
    expect(page).toContain('author.query');
    expect(page).toContain('robots: { index: !hasSearch');
  });
});
